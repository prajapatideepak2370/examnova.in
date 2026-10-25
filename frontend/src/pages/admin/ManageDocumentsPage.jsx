import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import {
  deleteDocument,
  fetchAdminDocuments,
  updateDocumentStatus,
} from '../../services/documentService.js';
import useDebounce from '../../hooks/useDebounce.js';
import { ADMIN_PAGE_SIZE, DOCUMENT_STATUSES, SORT_OPTIONS } from '../../utils/constants.js';
import { formatFileType, formatNumber, timeAgo } from '../../utils/format.js';

export default function ManageDocumentsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [documents, setDocuments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(location.state?.flash || '');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [deleting, setDeleting] = useState(false);

  // The upload page navigates here with a one-time confirmation message.
  useEffect(() => {
    if (location.state?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const load = useCallback(async () => {
    setState('loading');
    setError('');

    const params = { page, limit: ADMIN_PAGE_SIZE, sort };
    if (debouncedKeyword.trim()) params.q = debouncedKeyword.trim();
    if (statusFilter) params.status = statusFilter;

    try {
      const result = await fetchAdminDocuments(params);
      setDocuments(result.documents);
      setMeta(result.meta);
      setState('ready');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, [page, debouncedKeyword, statusFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, statusFilter, sort]);

  const handleToggleStatus = async (document) => {
    const nextStatus = document.status === 'published' ? 'draft' : 'published';
    setBusyId(document._id);
    setFlash('');

    try {
      const result = await updateDocumentStatus(document._id, nextStatus);
      setDocuments((current) =>
        current.map((item) => (item._id === document._id ? { ...item, ...result.document } : item))
      );
      setFlash(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    setFlash('');

    try {
      const message = await deleteDocument(pendingDelete._id);
      setFlash(message);
      setPendingDelete(null);

      if (documents.length === 1 && page > 1) setPage((current) => current - 1);
      else load();
    } catch (err) {
      setError(err.message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const total = meta?.total ?? 0;
  const first = total === 0 ? 0 : (page - 1) * ADMIN_PAGE_SIZE + 1;
  const last = Math.min(page * ADMIN_PAGE_SIZE, total);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Manage documents</h1>
          <p>Publish, unpublish, edit or delete any uploaded study material.</p>
        </div>
        <Link className="btn btn--primary btn--sm" to="/admin/upload">
          <Icon name="plus" size={16} />
          Upload material
        </Link>
      </div>

      {flash ? (
        <StatusMessage variant="success" compact title="Done" message={flash} />
      ) : null}

      {error ? (
        <div style={{ marginTop: flash ? 14 : 0 }}>
          <StatusMessage variant="error" compact title="Something went wrong" message={error} />
        </div>
      ) : null}

      <section className="admin-card" style={{ marginTop: flash || error ? 20 : 0 }}>
        <div className="filter-bar">
          <div className="field filter-bar__search">
            <label htmlFor="manage-search">Search</label>
            <input
              id="manage-search"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Title, subject, examination or tag"
            />
          </div>

          <div className="field">
            <label htmlFor="manage-status">Publish state</label>
            <select
              id="manage-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All documents</option>
              {DOCUMENT_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="manage-sort">Sort by</label>
            <select id="manage-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <span className="filter-bar__spacer" />

          {state === 'ready' ? (
            <p className="browser__count">
              {total === 0 ? 'No documents' : `Showing ${first}-${last} of ${formatNumber(total)}`}
            </p>
          ) : null}

          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={load}
            disabled={state === 'loading'}
          >
            <Icon name="clock" size={16} />
            Refresh
          </button>
        </div>

        {state === 'loading' ? (
          <p className="panel__text">Loading documents...</p>
        ) : documents.length === 0 ? (
          <StatusMessage
            variant="empty"
            title="No documents found"
            message={
              keyword || statusFilter
                ? 'Try a different keyword or clear the publish state filter.'
                : 'Upload the first study material to see it listed here.'
            }
            action={
              <Link className="btn btn--primary btn--sm" to="/admin/upload">
                <Icon name="upload" size={16} />
                Upload material
              </Link>
            }
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th className="data-table__num">Views</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document._id}>
                      <td>
                        <div className="doc-cell">
                          <span className="doc-cell__icon" aria-hidden="true">
                            <Icon name={document.category?.icon || 'book'} size={17} />
                          </span>
                          <span>
                            <Link
                              className="doc-cell__title"
                              to={`/study-materials/${document.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {document.title}
                            </Link>
                            <span className="doc-cell__meta">
                              {document.subject || 'No subject'}
                              {document.pageCount ? ` · ${document.pageCount} pages` : ''}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>{document.category?.name || '—'}</td>
                      <td>{formatFileType(document.fileType)}</td>
                      <td>
                        <span
                          className={`chip chip--${document.status === 'published' ? 'success' : 'muted'}`}
                        >
                          {document.status}
                        </span>
                      </td>
                      <td className="data-table__num">{formatNumber(document.viewCount)}</td>
                      <td>{timeAgo(document.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <Link
                            className="btn btn--ghost btn--sm"
                            to={`/study-materials/${document.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open the public document page"
                          >
                            <Icon name="eye" size={15} />
                            View
                          </Link>

                          <Link
                            className="btn btn--ghost btn--sm"
                            to={`/admin/documents/${document._id}/edit`}
                          >
                            <Icon name="edit" size={15} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => handleToggleStatus(document)}
                            disabled={busyId === document._id}
                          >
                            <Icon name={document.status === 'published' ? 'close' : 'check'} size={15} />
                            {document.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setPendingDelete(document)}
                          >
                            <Icon name="trash" size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={meta?.totalPages || 1} onChange={setPage} />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this document?"
        message={
          pendingDelete
            ? `"${pendingDelete.title}" and its stored files will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete document"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
