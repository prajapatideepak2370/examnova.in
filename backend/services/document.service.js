import mongoose from 'mongoose';
import Document from '../models/Document.js';
import { removeFile } from './storage.service.js';

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exact = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

export const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  popular: { viewCount: -1, createdAt: -1 },
  title: { title: 1 },
};

export function buildDocumentFilter(query = {}, { publishedOnly = false } = {}) {
  const filter = {};

  if (publishedOnly) {
    filter.status = 'published';
  } else if (['draft', 'published'].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.category && mongoose.isValidObjectId(query.category)) {
    filter.category = query.category;
  }
  if (query.subject) filter.subject = exact(query.subject);
  if (query.examination) filter.examination = exact(query.examination);
  if (query.fileType) filter.fileType = query.fileType;
  if (query.type) filter.fileType = query.type;

  if (query.tag) filter.tags = { $in: [exact(query.tag)] };

  const keyword = (query.q || query.search || '').trim();
  if (keyword) {
    const rx = new RegExp(escapeRegex(keyword), 'i');
    filter.$or = [
      { title: rx },
      { description: rx },
      { subject: rx },
      { examination: rx },
      { tags: rx },
      { originalName: rx },
    ];
  }

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  return filter;
}

export async function listDocuments({ filter, page, limit, sort = 'newest' }) {
  const sortSpec = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [items, total] = await Promise.all([
    Document.find(filter)
      .populate('category', 'name slug icon')
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit),
    Document.countDocuments(filter),
  ]);

  return { items, total };
}

export async function findBySlugOrId(identifier, { publishedOnly = false } = {}) {
  const conditions = mongoose.isValidObjectId(identifier)
    ? [{ _id: identifier }, { slug: identifier }]
    : [{ slug: identifier }];

  const filter = { $or: conditions };
  if (publishedOnly) filter.status = 'published';

  return Document.findOne(filter).populate('category', 'name slug icon');
}

export async function findRelatedDocuments(doc, limit = 4) {
  const categoryId = doc.category?._id || doc.category;
  const conditions = [{ category: categoryId }];
  if (doc.subject) conditions.push({ subject: doc.subject });

  return Document.find({
    _id: { $ne: doc._id },
    status: 'published',
    $or: conditions,
  })
    .populate('category', 'name slug icon')
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit);
}

export async function incrementViewCount(id) {
  return Document.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
}

/** Deletes a document and every stored artefact that belongs to it. */
export async function deleteDocumentAndFiles(doc) {
  // previewUrl may point at a generated conversion copy, which must be removed too.
  const storedFiles = [doc.filePath, doc.previewUrl].filter(Boolean);
  await doc.deleteOne();
  await Promise.all(storedFiles.map((storedFile) => removeFile(storedFile)));
}
