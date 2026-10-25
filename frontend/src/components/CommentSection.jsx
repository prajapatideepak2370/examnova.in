import { useCallback, useEffect, useState } from 'react';
import CommentCard from './CommentCard.jsx';
import Icon from './Icon.jsx';
import StatusMessage from './StatusMessage.jsx';
import { createComment, fetchComments } from '../services/commentService.js';

const PAGE_SIZE = 10;
const NAME_MAX = 60;
const MESSAGE_MAX = 1000;

const EMPTY_FORM = { name: '', message: '', website: '' };

/**
 * Public "Comments" section: visitors post a comment and read the newest ones
 * below the form. All text is stored and rendered as plain text.
 */
export default function CommentSection() {
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState('loading');
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [flash, setFlash] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (targetPage, { append = false } = {}) => {
    if (append) setListState('loadingMore');
    else setListState('loading');
    setListError('');

    try {
      const result = await fetchComments({ page: targetPage, limit: PAGE_SIZE });
      setComments((current) => (append ? [...current, ...result.comments] : result.comments));
      setMeta(result.meta);
      setPage(targetPage);
      setListState('ready');
    } catch (err) {
      setListError(err.message);
      setListState('error');
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFlash('');
    setFormError('');

    const name = form.name.trim();
    const message = form.message.trim();

    const errors = {};
    if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
    else if (name.length > NAME_MAX) errors.name = `Please keep your name under ${NAME_MAX} characters.`;

    if (message.length < 3) errors.message = 'Please write a comment (at least 3 characters).';
    else if (message.length > MESSAGE_MAX) {
      errors.message = `Please keep your comment under ${MESSAGE_MAX} characters.`;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const result = await createComment({ name, message, website: form.website });
      setForm(EMPTY_FORM);
      setFlash('Thank you! Your comment has been posted.');

      // A null comment means the honeypot caught a bot – report success, store nothing.
      if (result.comment) {
        setComments((current) => [result.comment, ...current]);
        setMeta((current) => (current ? { ...current, total: current.total + 1 } : current));
      }
    } catch (err) {
      const serverErrors = {};
      (err.errors || []).forEach((item) => {
        if (item.field) serverErrors[item.field] = item.message;
      });
      setFieldErrors(serverErrors);
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const total = meta?.total ?? 0;

  return (
    <section className="section" id="comments">
      <div className="container">
        <header className="section__header">
          <div>
            <h2>Comments</h2>
            <p>Share your feedback or ask a question about the study material.</p>
          </div>
          {listState === 'ready' && total > 0 ? (
            <span className="chip chip--muted">
              {total} {total === 1 ? 'comment' : 'comments'}
            </span>
          ) : null}
        </header>

        <form className="comment-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field form-grid--full">
              <label htmlFor="comment-name">Your name</label>
              <input
                id="comment-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={NAME_MAX}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                aria-invalid={fieldErrors.name ? 'true' : undefined}
                aria-describedby={fieldErrors.name ? 'comment-name-error' : undefined}
              />
              {fieldErrors.name ? (
                <span className="field__error" id="comment-name-error">
                  {fieldErrors.name}
                </span>
              ) : null}
            </div>

            <div className="field form-grid--full">
              <label htmlFor="comment-message">Your comment</label>
              <textarea
                id="comment-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={MESSAGE_MAX}
                placeholder="Write your comment here..."
                aria-invalid={fieldErrors.message ? 'true' : undefined}
                aria-describedby={fieldErrors.message ? 'comment-message-error' : undefined}
              />
              <span className="field__hint">
                {form.message.length}/{MESSAGE_MAX} characters. Plain text only.
              </span>
              {fieldErrors.message ? (
                <span className="field__error" id="comment-message-error">
                  {fieldErrors.message}
                </span>
              ) : null}
            </div>
          </div>

          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div className="comment-form__honeypot" aria-hidden="true">
            <label htmlFor="comment-website">Website</label>
            <input
              id="comment-website"
              name="website"
              type="text"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="comment-form__actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              <Icon name="comment" size={16} />
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
            <span className="comment-form__note">
              Your comment is public. Please keep it respectful.
            </span>
          </div>

          {flash ? (
            <div className="comment-form__feedback">
              <StatusMessage variant="success" compact title="Posted" message={flash} />
            </div>
          ) : null}

          {formError ? (
            <div className="comment-form__feedback">
              <StatusMessage variant="error" compact title="Comment not posted" message={formError} />
            </div>
          ) : null}
        </form>

        <div className="comment-list">
          {listState === 'loading' ? (
            <StatusMessage variant="loading" title="Loading comments..." />
          ) : null}

          {listState === 'error' ? (
            <StatusMessage
              variant="error"
              title="Comments could not be loaded"
              message={listError}
              action={
                <button type="button" className="btn btn--outline btn--sm" onClick={() => load(1)}>
                  <Icon name="clock" size={16} />
                  Try again
                </button>
              }
            />
          ) : null}

          {listState !== 'loading' && listState !== 'error' && comments.length === 0 ? (
            <StatusMessage
              variant="empty"
              title="No comments yet"
              message="Be the first to share your thoughts using the form above."
            />
          ) : null}

          {comments.map((comment) => (
            <CommentCard key={comment._id} comment={comment} />
          ))}

          {meta?.hasNextPage ? (
            <div className="comment-list__more">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => load(page + 1, { append: true })}
                disabled={listState === 'loadingMore'}
              >
                {listState === 'loadingMore' ? 'Loading...' : 'Load more comments'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
