/**
 * Forces a real file download even when the file is served from another origin,
 * where the anchor `download` attribute is ignored by browsers.
 * Falls back to opening the file in a new tab if the fetch fails.
 */
export async function downloadFile(url, filename) {
  if (!url) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

export default downloadFile;
