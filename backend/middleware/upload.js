import path from 'path';
import fsp from 'fs/promises';
import multer from 'multer';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { ensureUploadsDir } from '../services/storage.service.js';

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // some browsers report this for .doc / .docx
];

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extensionAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const mimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!extensionAllowed || !mimeAllowed) {
    return cb(
      ApiError.badRequest(
        `Unsupported file type "${ext || file.mimetype}". Only PDF, DOC and DOCX files are accepted.`
      )
    );
  }
  return cb(null, true);
}

// Files are buffered in memory first so that a validation failure never leaves an
// orphan file behind: nothing touches the disk until persistUploadedFile() runs.
const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 },
}).single('file');

/** Parses the multipart request and maps multer errors onto ApiError. */
export function parseUpload(req, res, next) {
  multerUpload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          ApiError.payloadTooLarge(`File is too large. The maximum allowed size is ${env.maxUploadMb} MB.`)
        );
      }
      return next(ApiError.badRequest(`Upload failed: ${err.message}`));
    }
    return next(err);
  });
}

function buildStoredFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = slugify(path.basename(originalName, ext)).slice(0, 60) || 'document';
  return `${base}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
}

/** Writes the validated in-memory upload to managed storage. */
export const persistUploadedFile = asyncHandler(async (req, _res, next) => {
  if (!req.file || !req.file.buffer) return next();

  ensureUploadsDir();
  const filename = buildStoredFilename(req.file.originalname);
  const target = path.join(env.uploadsDir, filename);

  await fsp.writeFile(target, req.file.buffer);

  req.file.filename = filename;
  req.file.path = target;
  req.file.size = req.file.size || req.file.buffer.length;
  delete req.file.buffer;

  return next();
});
