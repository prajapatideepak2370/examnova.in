import Icon from './Icon.jsx';
import { formatDate } from '../utils/format.js';

/**
 * A single visitor comment. The message is rendered as plain text, never as
 * markup, so nothing inside it can execute in the browser.
 */
export default function CommentCard({ comment, action }) {
  const initial = (comment.name || '?').trim().charAt(0).toUpperCase();

  return (
    <article className="comment-card">
      <div className="comment-card__avatar" aria-hidden="true">
        {initial}
      </div>

      <div className="comment-card__body">
        <header className="comment-card__head">
          <strong className="comment-card__name">{comment.name}</strong>
          <span className="comment-card__date">
            <Icon name="calendar" size={14} />
            <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
          </span>
        </header>

        <p className="comment-card__text">{comment.message}</p>
      </div>

      {action ? <div className="comment-card__action">{action}</div> : null}
    </article>
  );
}
