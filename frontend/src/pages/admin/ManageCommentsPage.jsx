import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { deleteComment, fetchComments } from '../../services/commentService.js';
import { ADMIN_PAGE_SIZE } from '../../utils/constants.js';
import { formatDateTime, formatNumber, timeAgo, truncate } from '../../utils/format.js';

/** Moderation queue: every visitor comment, newest first, deletable on demand. */
export default function ManageCommentsPage() {
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setError('');

    try {
      const result = await fetchComments({ page, limit: ADMIN_PAGE_SIZE });
      setComments(result.comments);
      setMeta(result.meta);
      setState('ready');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    setFlash('');

    try {
      const message = await deleteComment(pendingDelete._id);
      setFlash(message);
      setPendingDelete(null);

      if (comments.length === 1 && page > 1) setPage((current) => current - 1);
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
          <h1>Manage comments</h1>
          <p>Review visitor comments and remove anything inappropriate or spam.</p>
        </div>
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

      {flash ? <StatusMessage variant="success" compact title="Done" message={flash} /> : null}

      {error ? (
        <div style={{ marginTop: flash ? 14 : 0 }}>
          <StatusMessage variant="error" compact title="Something went wrong" message={error} />
        </div>
      ) : null}

      <section className="admin-card" style={{ marginTop: flash || error ? 20 : 0 }}>
        <div className="admin-card__header">
          <h2>Comments</h2>
          {state === 'ready' ? (
            <p className="browser__count">
              {total === 0 ? 'No comments' : `Showing ${first}-${last} of ${formatNumber(total)}`}
            </p>
          ) : null}
        </div>

        {state === 'loading' ? (
          <p className="panel__text">Loading comments...</p>
        ) : comments.length === 0 ? (
          <StatusMessage
            variant="empty"
            title="No comments to moderate"
            message="Visitor comments will appear here as soon as they are posted."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Commenter</th>
                    <th>Comment</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment._id}>
                      <td>
                        <div className="comment-cell">
                          <span className="comment-cell__avatar" aria-hidden="true">
                            {(comment.name || '?').trim().charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <span className="doc-cell__title">{comment.name}</span>
                            <span className="doc-cell__meta">{timeAgo(comment.createdAt)}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="comment-text" title={comment.message}>
                          {truncate(comment.message, 160)}
                        </span>
                      </td>
                      <td>{formatDateTime(comment.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setPendingDelete(comment)}
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
        title="Delete this comment?"
        message={
          pendingDelete
            ? `The comment from "${pendingDelete.name}" will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete comment"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
