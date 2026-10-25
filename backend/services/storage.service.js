import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import env from '../config/env.js';

/**
 * Storage driver for uploaded study material.
 *
 * The three functions below are the only place that touches physical storage, so the
 * portal can be moved to S3 / Cloudinary by re-implementing them:
 *   saveBuffer  -> upload the stream, return { url, path }
 *   removeFile  -> delete the remote object
 *   absolutePath-> resolve a stored reference for server-side processing (doc -> pdf)
 *
 * The default driver keeps files on local disk under backend/uploads, which is served
 * read-only (and never executed) by express.static in server.js.
 */

export const PUBLIC_PREFIX = '/uploads';

export function ensureUploadsDir() {
  if (!fs.existsSync(env.uploadsDir)) {
    fs.mkdirSync(env.uploadsDir, { recursive: true });
  }
}

export function publicUrl(filePath) {
  if (!filePath) return '';
  const name = path.basename(filePath);
  return `${PUBLIC_PREFIX}/${name}`;
}

export function absolutePath(filePath) {
  if (!filePath) return '';
  return path.isAbsolute(filePath) ? filePath : path.join(env.uploadsDir, path.basename(filePath));
}

/** Registers a file already written to disk by multer. */
export function registerUploadedFile(file) {
  return {
    url: publicUrl(file.path),
    path: file.path,
    size: file.size,
    originalName: file.originalname,
  };
}

/** Persists an in-memory buffer (used for generated previews) and returns its public URL. */
export async function saveBuffer(buffer, filename) {
  ensureUploadsDir();
  const target = path.join(env.uploadsDir, filename);
  await fsp.writeFile(target, buffer);
  return { url: publicUrl(target), path: target, size: buffer.length };
}

/** Copies an existing file into managed storage (used after document conversion). */
export async function saveFileCopy(sourcePath, filename) {
  ensureUploadsDir();
  const target = path.join(env.uploadsDir, filename);
  await fsp.copyFile(sourcePath, target);
  const stat = await fsp.stat(target);
  return { url: publicUrl(target), path: target, size: stat.size };
}

/** Removes a stored file; missing files are ignored so deletes stay idempotent. */
export async function removeFile(filePath) {
  if (!filePath) return;
  try {
    await fsp.unlink(absolutePath(filePath));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('[storage] could not delete file:', err.message);
    }
  }
}

export async function fileExists(filePath) {
  if (!filePath) return false;
  try {
    await fsp.access(absolutePath(filePath));
    return true;
  } catch {
    return false;
  }
}

/** Temporary workspace used for document conversion, kept outside the public uploads dir. */
export function tempDir() {
  const dir = path.join(env.uploadsDir, '..', '.tmp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
