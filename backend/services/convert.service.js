import fsp from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import env from '../config/env.js';
import { absolutePath, publicUrl, tempDir } from './storage.service.js';

const execFileAsync = promisify(execFile);

const CONVERSION_TIMEOUT_MS = 60 * 1000;

/**
 * Estimates the number of pages in a PDF by counting page objects.
 * Used only for display metadata – the viewer reports the real page count.
 */
export async function countPdfPages(filePath) {
  try {
    const buffer = await fsp.readFile(absolutePath(filePath));
    const matches = buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 1;
  } catch {
    return 0;
  }
}

function libreOfficeAvailable() {
  return Boolean(env.libreOfficePath) && fs.existsSync(env.libreOfficePath);
}

/**
 * Converts a .doc/.docx file to PDF using a local LibreOffice/soffice binary.
 * Returns the absolute path of the generated PDF, or throws when unavailable.
 */
export async function convertToPdf(sourceFilePath) {
  if (!libreOfficeAvailable()) {
    throw new Error(
      'Word document preview is not available on this server. Install LibreOffice and set LIBREOFFICE_PATH to enable online preview.'
    );
  }

  const outDir = tempDir();
  const profileDir = path.join(outDir, `lo-profile-${Date.now()}`);
  await fsp.mkdir(profileDir, { recursive: true });

  const source = absolutePath(sourceFilePath);

  await execFileAsync(
    env.libreOfficePath,
    [
      '--headless',
      '--norestore',
      `-env:UserInstallation=file:///${profileDir.replace(/\\/g, '/')}`,
      '--convert-to',
      'pdf',
      '--outdir',
      outDir,
      source,
    ],
    { timeout: CONVERSION_TIMEOUT_MS, windowsHide: true }
  );

  const producedPath = path.join(outDir, `${path.basename(source, path.extname(source))}.pdf`);
  if (!fs.existsSync(producedPath)) {
    throw new Error('Document conversion finished without producing a PDF file.');
  }
  return producedPath;
}

/**
 * Builds the online preview for an uploaded file.
 * PDFs are previewable as-is; Word files require LibreOffice conversion.
 * `ok: false` carries a student-facing message instead of throwing.
 */
export async function buildPreview({ filePath, fileType }) {
  if (fileType === 'pdf') {
    const pageCount = await countPdfPages(filePath);
    return { ok: true, previewUrl: publicUrl(filePath), previewPath: filePath, pageCount };
  }

  try {
    const converted = await convertToPdf(filePath);
    const pageCount = await countPdfPages(converted);

    const { saveFileCopy } = await import('./storage.service.js');
    const saved = await saveFileCopy(
      converted,
      `${path.basename(converted, '.pdf')}-preview-${Date.now()}.pdf`
    );
    await fsp.unlink(converted).catch(() => {});

    return { ok: true, previewUrl: saved.url, previewPath: saved.path, pageCount };
  } catch (err) {
    console.warn('[convert] preview unavailable:', err.message);
    return {
      ok: false,
      previewUrl: '',
      previewPath: '',
      pageCount: 0,
      reason:
        'This Word document cannot be previewed online right now. The file was uploaded successfully – download it to read the full material.',
    };
  }
}
