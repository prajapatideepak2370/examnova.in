import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { formatNumber } from '../utils/format.js';

export default function CategoryCard({ category }) {
  const { name, slug, description, icon, documentCount } = category;

  return (
    <Link className="category-card" to={`/study-materials?category=${slug}`}>
      <span className="category-card__icon" aria-hidden="true">
        <Icon name={icon || 'book'} size={24} />
      </span>
      <h3 className="category-card__title">{name}</h3>
      {description ? <p className="category-card__description">{description}</p> : null}
      <span className="category-card__footer">
        {formatNumber(documentCount || 0)} {documentCount === 1 ? 'document' : 'documents'}
        <Icon name="arrow-right" size={16} />
      </span>
    </Link>
  );
}
