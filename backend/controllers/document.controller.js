import path from 'path';
import Document from '../models/Document.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slugify.js';
import { registerUploadedFile, removeFile } from '../services/storage.service.js';
import { buildPreview } from '../services/convert.service.js';
import {
  buildDocumentFilter,
  listDocuments,
  findBySlugOrId,
  findRelatedDocuments,
  incrementViewCount,
  deleteDocumentAndFiles,
} from '../services/document.service.js';
import { resolveCategoryId } from './category.controller.js';

const EXTENSION_TO_TYPE = { '.pdf': 'pdf', '.doc': 'doc', '.docx': 'docx' };

function detectFileType(originalName = '') {
  return EXTENSION_TO_TYPE[path.extname(originalName).toLowerCase()] || null;
}

function parseTags(input) {
  const raw = Array.isArray(input) ? input : String(input ?? '').split(',');
  const cleaned = raw
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 15);
  return [...new Set(cleaned)];
}

function toBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

async function resolveCategoryOrFail(value) {
  const categoryId = await resolveCategoryId(value);
  if (!categoryId) {
    throw ApiError.badRequest('Select a valid category for this document');
  }
  return categoryId;
}

/** GET /api/documents – public catalogue with search, filters and pagination. */
export const listPublishedDocuments = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const filter = buildDocumentFilter(req.query, { publishedOnly: true });

  if (req.query.category) {
    const categoryId = await resolveCategoryId(req.query.category);
    if (!categoryId) {
      return sendSuccess(res, {
        message: 'No study material matched your filters',
        data: { documents: [] },
        meta: buildPaginationMeta({ page, limit, total: 0 }),
      });
    }
    filter.category = categoryId;
  }

  const { items, total } = await listDocuments({ filter, page, limit, sort: req.query.sort });

  return sendSuccess(res, {
    message: total > 0 ? 'Documents fetched' : 'No study material matched your filters',
    data: { documents: items },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

/** GET /api/documents/admin – full catalogue including drafts (admin only). */
export const listAllDocuments = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query, { defaultLimit: 10 });
  const filter = buildDocumentFilter(req.query, { publishedOnly: false });

  if (req.query.category) {
    const categoryId = await resolveCategoryId(req.query.category);
    if (categoryId) filter.category = categoryId;
  }

  const { items, total } = await listDocuments({ filter, page, limit, sort: req.query.sort });

  return sendSuccess(res, {
    message: 'Documents fetched',
    data: { documents: items },
    meta: buildPaginationMeta({ page, limit, total }),
  });
});

/** GET /api/documents/:idOrSlug – single document; drafts only for signed-in admins. */
export const getDocument = asyncHandler(async (req, res) => {
  const document = await findBySlugOrId(req.params.idOrSlug);

  if (!document || (document.status !== 'published' && !req.admin)) {
    throw ApiError.notFound('This study material is not available');
  }

  const related = await findRelatedDocuments(document, 4);

  return sendSuccess(res, {
    message: 'Document fetched',
    data: { document, related },
  });
});

/** GET /api/documents/:idOrSlug/related */
export const getRelatedDocuments = asyncHandler(async (req, res) => {
  const document = await findBySlugOrId(req.params.idOrSlug);
  if (!document) throw ApiError.notFound('Document not found');

  const related = await findRelatedDocuments(document, 6);
  return sendSuccess(res, { message: 'Related documents fetched', data: { documents: related } });
});

/** POST /api/documents/:idOrSlug/view – records a read of the material. */
export const recordView = asyncHandler(async (req, res) => {
  const document = await findBySlugOrId(req.params.idOrSlug, { publishedOnly: true });
  if (!document) throw ApiError.notFound('Document not found');

  const updated = await incrementViewCount(document._id);
  return sendSuccess(res, { message: 'View recorded', data: { viewCount: updated.viewCount } });
});

/** POST /api/documents (multipart/form-data, field name: file) */
export const createDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Attach a PDF, DOC or DOCX file to upload');
  }

  const fileType = detectFileType(req.file.originalname);
  if (!fileType) {
    await removeFile(req.file.path);
    throw ApiError.badRequest('Only PDF, DOC and DOCX files are supported');
  }

  const category = await resolveCategoryOrFail(req.body.category);
  const preview = await buildPreview({ filePath: req.file.path, fileType });
  const slug = await uniqueSlug(Document, req.body.title);
  const status = req.body.status === 'published' ? 'published' : 'draft';

  let document;
  try {
    document = await Document.create({
      title: req.body.title.trim(),
      slug,
      description: (req.body.description || '').trim(),
      category,
      subject: (req.body.subject || '').trim(),
      examination: (req.body.examination || '').trim(),
      fileUrl: registerUploadedFile(req.file).url,
      filePath: req.file.path,
      originalName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      previewUrl: preview.previewUrl,
      previewError: preview.ok ? '' : preview.reason,
      pageCount: preview.pageCount,
      tags: parseTags(req.body.tags),
      status,
      allowDownload: toBoolean(req.body.allowDownload, true),
      uploadedBy: req.admin._id,
      publishedAt: status === 'published' ? new Date() : undefined,
    });
  } catch (err) {
    await removeFile(req.file.path);
    if (preview.previewPath && preview.previewPath !== req.file.path) {
      await removeFile(preview.previewPath);
    }
    throw err;
  }

  await document.populate('category', 'name slug icon');

  return sendSuccess(res, {
    statusCode: 201,
    message:
      status === 'published'
        ? 'Document uploaded and published'
        : 'Document uploaded and saved as a draft',
    data: { document },
  });
});

/** PUT /api/documents/:id – updates details and optionally replaces the file. */
export const updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    if (req.file) await removeFile(req.file.path);
    throw ApiError.notFound('Document not found');
  }

  const oldFilePath = document.filePath;
  const oldPreviewUrl = document.previewUrl;

  try {
    if (req.body.title && req.body.title.trim() !== document.title) {
      document.title = req.body.title.trim();
      document.slug = await uniqueSlug(Document, document.title, document._id);
    }

    if (req.body.category) {
      document.category = await resolveCategoryOrFail(req.body.category);
    }

    if (req.body.description !== undefined) document.description = String(req.body.description).trim();
    if (req.body.subject !== undefined) document.subject = String(req.body.subject).trim();
    if (req.body.examination !== undefined) document.examination = String(req.body.examination).trim();
    if (req.body.tags !== undefined) document.tags = parseTags(req.body.tags);
    if (req.body.allowDownload !== undefined) {
      document.allowDownload = toBoolean(req.body.allowDownload, document.allowDownload);
    }

    if (req.file) {
      const fileType = detectFileType(req.file.originalname);
      if (!fileType) throw ApiError.badRequest('Only PDF, DOC and DOCX files are supported');

      const preview = await buildPreview({ filePath: req.file.path, fileType });

      document.filePath = req.file.path;
      document.fileUrl = registerUploadedFile(req.file).url;
      document.originalName = req.file.originalname;
      document.fileType = fileType;
      document.mimeType = req.file.mimetype;
      document.fileSize = req.file.size;
      document.previewUrl = preview.previewUrl;
      document.previewError = preview.ok ? '' : preview.reason;
      document.pageCount = preview.pageCount;

      await removeFile(oldFilePath);
      await removeFile(oldPreviewUrl);
    }

    if (req.body.status !== undefined) {
      const nextStatus = req.body.status === 'published' ? 'published' : 'draft';
      if (nextStatus === 'published' && document.status !== 'published') {
        document.publishedAt = new Date();
      }
      document.status = nextStatus;
    }

    await document.save();
  } catch (err) {
    if (req.file) await removeFile(req.file.path);
    throw err;
  }

  await document.populate('category', 'name slug icon');
  return sendSuccess(res, { message: 'Document updated', data: { document } });
});

/** PATCH /api/documents/:id/status – publish or unpublish from the manage table. */
export const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) {
    throw ApiError.badRequest('Status must be either "draft" or "published"');
  }

  const document = await Document.findById(req.params.id);
  if (!document) throw ApiError.notFound('Document not found');

  document.status = status;
  if (status === 'published') document.publishedAt = new Date();
  await document.save();
  await document.populate('category', 'name slug icon');

  return sendSuccess(res, {
    message: status === 'published' ? 'Document published' : 'Document unpublished',
    data: { document },
  });
});

/** DELETE /api/documents/:id – removes the record and every stored file. */
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) throw ApiError.notFound('Document not found');

  const title = document.title;
  await deleteDocumentAndFiles(document);

  return sendSuccess(res, { message: `"${title}" was deleted`, data: { id: req.params.id } });
});
