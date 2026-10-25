import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PdfViewer from '../components/PdfViewer.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { assetUrl } from '../services/api.js';
import { fetchDocument, recordDocumentView } from '../services/documentService.js';
import { downloadFile } from '../utils/download.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatFileSize, formatFileType, formatNumber } from '../utils/format.js';

export default function DocumentDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [document, setDocument] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError('');

    fetchDocument(slug)
      .then((result) => {
        if (!active) return;
        setDocument(result.document);
        setRelated(result.related || []);
        setStatus('ready');
        recordDocumentView(result.document.slug || result.document._id);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!document) return undefined;
    const previousTitle = window.document.title;
    window.document.title = `${document.title} | Exam Portal`;
    return () => {
      window.document.title = previousTitle;
    };
  }, [document]);

  if (status === 'loading') {
    return (
      <div className="container page-section">
        <LoadingSpinner label="Loading the document..." />
      </div>
    );
  }

  if (status === 'error' || !document) {
    return (
      <div className="container page-section">
        <StatusMessage
          variant="error"
          title="This study material is not available"
          message={error || 'The document may have been unpublished or removed by the administrator.'}
          action={
            <Link className="btn btn--outline btn--sm" to="/study-materials">
              Back to study materials
            </Link>
          }
        />
      </div>
    );
  }

  const previewUrl = assetUrl(document.previewUrl);
  const downloadUrl = assetUrl(document.fileUrl);
  const fileLabel = formatFileType(document.fileType);

  return (
    <div className="container page-section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/study-materials">Study materials</Link>
        {document.category ? (
          <>
            <span>/</span>
            <Link to={`/study-materials?category=${document.category.slug}`}>{document.category.name}</Link>
          </>
        ) : null}
        <span>/</span>
        <span className="breadcrumb__current">{document.title}</span>
      </nav>

      {document.status !== 'published' ? (
        <StatusMessage
          variant="info"
          compact
          title="Draft document"
          message="This material is saved as a draft and is only visible to signed-in administrators."
        />
      ) : null}

      <header className="doc-detail__header">
        <div className="doc-detail__tags">
          {document.category ? (
            <Link className="chip chip--primary" to={`/study-materials?category=${document.category.slug}`}>
              {document.category.name}
            </Link>
          ) : null}
          {document.subject ? <span className="chip">{document.subject}</span> : null}
          {document.examination ? <span className="chip">{document.examination}</span> : null}
          <span className="chip chip--accent">{fileLabel}</span>
        </div>

        <h1>{document.title}</h1>
        {document.description ? <p className="doc-detail__description">{document.description}</p> : null}

        <ul className="doc-detail__meta">
          <li>
            <Icon name="calendar" size={16} />
            Uploaded {formatDate(document.createdAt)}
          </li>
          <li>
            <Icon name="documents" size={16} />
            {fileLabel}
            {document.pageCount ? `, ${document.pageCount} pages` : ''}
          </li>
          <li>
            <Icon name="layers" size={16} />
            {formatFileSize(document.fileSize)}
          </li>
          <li>
            <Icon name="eye" size={16} />
            {formatNumber(document.viewCount)} views
          </li>
        </ul>
      </header>

      <div className="doc-detail__layout">
        <div className="doc-detail__main">
          {document.canPreview ? (
            <PdfViewer
              fileUrl={previewUrl}
              downloadUrl={downloadUrl}
              allowDownload={document.allowDownload}
              title={document.title}
            />
          ) : (
            <StatusMessage
              variant="error"
              title="Online preview is not available for this document"
              message={
                document.previewError ||
                'This file could not be converted for online reading. Download the document to read the full material.'
              }
              action={
                document.allowDownload ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => downloadFile(downloadUrl, document.originalName)}
                  >
                    <Icon name="download" size={16} />
                    Download {fileLabel}
                  </button>
                ) : (
                  <a className="btn btn--outline btn--sm" href={downloadUrl} target="_blank" rel="noreferrer">
                    <Icon name="external" size={16} />
                    Open file
                  </a>
                )
              }
            />
          )}
        </div>

        <aside className="doc-detail__aside">
          <section className="panel">
            <h2 className="panel__title">Document details</h2>
            <dl className="detail-list">
              <div>
                <dt>Category</dt>
                <dd>{document.category?.name || '—'}</dd>
              </div>
              <div>
                <dt>Subject</dt>
                <dd>{document.subject || '—'}</dd>
              </div>
              <div>
                <dt>Examination</dt>
                <dd>{document.examination || '—'}</dd>
              </div>
              <div>
                <dt>File type</dt>
                <dd>{fileLabel}</dd>
              </div>
              <div>
                <dt>File size</dt>
                <dd>{formatFileSize(document.fileSize)}</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>{document.pageCount || '—'}</dd>
              </div>
              <div>
                <dt>Uploaded</dt>
                <dd>{formatDate(document.createdAt)}</dd>
              </div>
              <div>
                <dt>Views</dt>
                <dd>{formatNumber(document.viewCount)}</dd>
              </div>
            </dl>

            {document.tags?.length ? (
              <div className="tag-list">
                {document.tags.map((tag) => (
                  <Link key={tag} className="chip chip--muted" to={`/search?q=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>

          {document.allowDownload ? (
            <section className="panel panel--accent">
              <h2 className="panel__title">Download</h2>
              <p className="panel__text">
                Keep a copy for offline revision. The original uploaded file is provided as-is.
              </p>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => downloadFile(downloadUrl, document.originalName)}
              >
                <Icon name="download" size={18} />
                Download {fileLabel}
              </button>
            </section>
          ) : (
            <section className="panel">
              <h2 className="panel__title">Downloads disabled</h2>
              <p className="panel__text">This material is available for online reading only.</p>
            </section>
          )}

          {related.length > 0 ? (
            <section className="panel">
              <h2 className="panel__title">Related study materials</h2>
              <ul className="related-list">
                {related.map((item) => (
                  <li key={item._id}>
                    <Link to={`/study-materials/${item.slug}`}>
                      <span className="related-list__icon" aria-hidden="true">
                        <Icon name={item.category?.icon || 'book'} size={18} />
                      </span>
                      <span className="related-list__body">
                        <strong>{item.title}</strong>
                        <small>
                          {formatFileType(item.fileType)} · {formatNumber(item.viewCount)} views
                        </small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {isAuthenticated ? (
            <Link className="btn btn--outline btn--block" to={`/admin/documents/${document._id}/edit`}>
              <Icon name="edit" size={16} />
              Edit this document
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
