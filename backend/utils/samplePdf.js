/**
 * Minimal PDF writer used to generate the sample study material shipped with the seed
 * script, so the portal has real, readable documents before anything is uploaded.
 *
 * Produces a valid PDF 1.4 file with Helvetica text – no external dependency required.
 */

function escapeText(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E\n]/g, '-');
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function contentStream(title, bodyLines, pageNumber, totalPages) {
  const commands = [
    'BT',
    '/F1 17 Tf',
    '60 780 Td',
    `(${escapeText(title)}) Tj`,
    '/F1 10 Tf',
    '0 -22 Td',
    `(${escapeText('Government Exam Study Portal  |  Page ' + pageNumber + ' of ' + totalPages)}) Tj`,
    '/F1 11.5 Tf',
    '0 -34 Td',
  ];

  bodyLines.forEach((line) => {
    commands.push(`(${escapeText(line)}) Tj`);
    commands.push('0 -16 Td');
  });

  commands.push('ET');
  return commands.join('\n');
}

export function buildSimplePdf({ title = 'Study Material', pages = [] }) {
  const pageList = pages.length > 0 ? pages : [['(no content)']];
  const total = pageList.length;

  const objects = new Map();
  const pageObjectIds = [];
  const contentObjectIds = [];

  // Object 1: catalog, 2: page tree, 3: font.
  for (let i = 0; i < total; i += 1) {
    pageObjectIds.push(4 + i * 2);
    contentObjectIds.push(5 + i * 2);
  }

  objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objects.set(
    2,
    `<< /Type /Pages /Count ${total} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`
  );
  objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  pageList.forEach((rawLines, index) => {
    const pageId = pageObjectIds[index];
    const contentId = contentObjectIds[index];
    const bodyLines = rawLines.flatMap((line) => (line.length > 92 ? wrapText(line, 92) : [line]));
    const stream = contentStream(title, bodyLines, index + 1, total);

    objects.set(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
        `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    objects.set(contentId, `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
  });

  // Serialise objects in id order while recording byte offsets for the xref table.
  const maxId = Math.max(...objects.keys());
  let pdf = '%PDF-1.4\n';
  const offsets = new Map();

  for (let id = 1; id <= maxId; id += 1) {
    if (!objects.has(id)) continue;
    offsets.set(id, Buffer.byteLength(pdf, 'latin1'));
    pdf += `${id} 0 obj\n${objects.get(id)}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  const size = maxId + 1;
  pdf += `xref\n0 ${size}\n0000000000 65535 f \n`;

  for (let id = 1; id <= maxId; id += 1) {
    const offset = offsets.get(id) ?? 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}
