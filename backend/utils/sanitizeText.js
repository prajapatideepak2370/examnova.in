/**
 * Comments are stored as plain text and React always renders them as text, so
 * a comment can never execute. Stripping markup here is defence in depth: it
 * keeps angle brackets, tag payloads and invisible control characters out of
 * the database in case the value is ever shown somewhere that does not escape.
 */

const HTML_TAG = /<\/?[a-z][^>]*>/gi;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ZERO_WIDTH = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;

export function sanitizePlainText(value) {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(HTML_TAG, ' ')
    .replace(/[<>]/g, '')
    .replace(CONTROL_CHARS, '')
    .replace(ZERO_WIDTH, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default sanitizePlainText;
