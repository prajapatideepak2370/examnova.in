const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('en-IN');

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : '0';
}

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFileType(fileType) {
  if (fileType === 'pdf') return 'PDF';
  if (fileType === 'doc' || fileType === 'docx') return 'Word';
  return (fileType || '').toUpperCase();
}

export function truncate(text, maxLength = 140) {
  const value = String(text || '');
  return value.length <= maxLength ? value : `${value.slice(0, maxLength).trimEnd()}...`;
}

/** "3 days ago" style label used on the admin table. */
export function timeAgo(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const units = [
    ['minute', 60],
    ['hour', 60 * 60],
    ['day', 60 * 60 * 24],
    ['month', 60 * 60 * 24 * 30],
    ['year', 60 * 60 * 24 * 365],
  ];

  let label = 'just now';
  units.forEach(([unit, unitSeconds]) => {
    const amount = Math.floor(seconds / unitSeconds);
    if (amount >= 1) label = `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
  });
  return label;
}
