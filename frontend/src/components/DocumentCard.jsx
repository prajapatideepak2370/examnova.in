import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { formatDate, formatFileType, formatNumber, truncate } from '../utils/format.js';

export default function DocumentCard({ document, showStatus = false }) {
  const {
    title,
    slug,
    description,
    category,
    subject,
    examination,
    fileType,
    createdAt,
    viewCount,
    pageCount,
    status,
  } = document;

  return (
    <article className="doc-card">
      <div className="doc-card__preview" aria-hidden="true">
        <span className={`doc-card__type doc-card__type--${fileType}`}>{formatFileType(fileType)}</span>
        <Icon name={category?.icon || 'book'} size={38} />
        <span className="doc-card__pages">{pageCount ? `${pageCount} pages` : 'Read online'}</span>
      </div>

      <div className="doc-card__body">
        <div className="doc-card__meta">
          {category ? (
            <Link className="chip chip--primary" to={`/study-materials?category=${category.slug}`}>
              {category.name}
            </Link>
          ) : null}
          {subject ? <span className="chip">{subject}</span> : null}
          {showStatus ? (
            <span className={`chip chip--${status === 'published' ? 'success' : 'muted'}`}>{status}</span>
          ) : null}
        </div>

        <h3 className="doc-card__title">
          <Link to={`/study-materials/${slug}`}>{title}</Link>
        </h3>

        {description ? <p className="doc-card__description">{truncate(description, 120)}</p> : null}

        <dl className="doc-card__stats">
          <div>
            <dt>
              <Icon name="calendar" size={15} />
              Uploaded
            </dt>
            <dd>{formatDate(createdAt)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="eye" size={15} />
              Views
            </dt>
            <dd>{formatNumber(viewCount)}</dd>
          </div>
          {examination ? (
            <div>
              <dt>
                <Icon name="preparation" size={15} />
                Exam
              </dt>
              <dd>{examination}</dd>
            </div>
          ) : null}
        </dl>

        <Link className="btn btn--primary btn--sm doc-card__cta" to={`/study-materials/${slug}`}>
          <Icon name="book" size={16} />
          View document
        </Link>
      </div>
    </article>
  );
}
