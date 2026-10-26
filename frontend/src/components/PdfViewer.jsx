import { useCallback, useEffect, useRef, useState } from 'react';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Icon from './Icon.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import StatusMessage from './StatusMessage.jsx';
import { downloadFile } from '../utils/download.js';

// pdf.js renders through a web worker; Vite resolves the worker file at build time.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.2;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function PdfViewer({ fileUrl, title = 'Document', downloadUrl, allowDownload = true }) {
  const viewerRef = useRef(null);
  const stageRef = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [stageWidth, setStageWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ---- Responsive page width ----
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return undefined;

    const measure = () => setStageWidth(element.clientWidth);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ---- Fullscreen tracking ----
  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const goToPage = useCallback(
    (next) => {
      setPageNumber((current) => {
        const target = clamp(Number(next) || 1, 1, numPages || 1);
        setPageInput(String(target));
        return target;
      });
    },
    [numPages]
  );

  // ---- Keyboard shortcuts while the viewer has focus ----
  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goToPage(pageNumber + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goToPage(pageNumber - 1);
    }
  };

  const handleLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total);
    setStatus('ready');
    setPageNumber((current) => clamp(current, 1, total || 1));
  }, []);

  const handleLoadError = useCallback((error) => {
    setStatus('error');
    setErrorMessage(
      error?.message?.includes('Invalid PDF')
        ? 'This file does not appear to be a valid PDF document.'
        : 'The document could not be loaded. Please check your connection and try again.'
    );
  }, []);

  const handleRenderError = useCallback(() => {
    setStatus('error');
    setErrorMessage('The document loaded, but this page could not be rendered. Try opening it in a new tab.');
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === viewerRef.current) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      setErrorMessage('Fullscreen mode is not supported by this browser.');
    }
  };

  const pageWidth = stageWidth ? Math.max(260, Math.round((stageWidth - 28) * zoom)) : undefined;

  return (
    <section className="pdf-viewer" ref={viewerRef} tabIndex={-1} onKeyDown={handleKeyDown}>
      <div className="pdf-viewer__toolbar">
        <div className="pdf-viewer__group">
          <button
            type="button"
            className="icon-button"
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1 || status !== 'ready'}
            aria-label="Previous page"
            title="Previous page"
          >
            <Icon name="chevron-left" />
          </button>

          <form
            className="pdf-viewer__page-form"
            onSubmit={(event) => {
              event.preventDefault();
              goToPage(pageInput);
            }}
          >
            <input
              className="pdf-viewer__page-input"
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => goToPage(pageInput || pageNumber)}
              aria-label="Page number"
              inputMode="numeric"
              disabled={status !== 'ready'}
            />
            <span className="pdf-viewer__page-total">/ {numPages || '—'}</span>
          </form>

          <button
            type="button"
            className="icon-button"
            onClick={() => goToPage(pageNumber + 1)}
            disabled={status !== 'ready' || pageNumber >= numPages}
            aria-label="Next page"
            title="Next page"
          >
            <Icon name="chevron-right" />
          </button>
        </div>

        <div className="pdf-viewer__group">
          <button
            type="button"
            className="icon-button"
            onClick={() => setZoom((current) => clamp(current - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Icon name="zoom-out" />
          </button>
          <span className="pdf-viewer__zoom">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setZoom((current) => clamp(current + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Icon name="zoom-in" />
          </button>
        </div>

        <div className="pdf-viewer__group">
          <button
            type="button"
            className="icon-button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Icon name="expand" />
          </button>

          <a
            className="icon-button"
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open document in a new tab"
            title="Open in a new tab"
          >
            <Icon name="external" />
          </a>

          {allowDownload && downloadUrl ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => downloadFile(downloadUrl, `${title}.pdf`)}
            >
              <Icon name="download" size={16} />
              Download
            </button>
          ) : null}
        </div>
      </div>

      <div className="pdf-viewer__stage" ref={stageRef}>
        {status === 'error' ? (
          <StatusMessage
            variant="error"
            title="We could not open this document"
            message={errorMessage}
            action={
              <a className="btn btn--outline btn--sm" href={fileUrl} target="_blank" rel="noreferrer">
                <Icon name="external" size={16} />
                Open in a new tab
              </a>
            }
          />
        ) : (
          <PdfDocument
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={<LoadingSpinner label="Preparing the document..." />}
            error={
              <StatusMessage
                variant="error"
                title="Unable to display this document"
                message="Please refresh the page or open the file in a new tab."
              />
            }
            externalLinkTarget="_blank"
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              className="pdf-viewer__page"
              onRenderError={handleRenderError}
              renderTextLayer
              renderAnnotationLayer
              loading={<LoadingSpinner label={`Rendering page ${pageNumber}...`} />}
            />
          </PdfDocument>
        )}
        <span className="sr-only">{title}</span>
      </div>
    </section>
  );
}
