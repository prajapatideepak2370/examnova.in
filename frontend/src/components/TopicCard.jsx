import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Compact, link-styled card used for subject and examination-type listings so the
 * home page and the dedicated listing pages stay visually identical.
 */
export default function TopicCard({ to, icon = 'book', title, description }) {
  return (
    <Link className="category-card" to={to}>
      <span className="category-card__icon" aria-hidden="true">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="category-card__title">{title}</h3>
      {description ? <p className="category-card__description">{description}</p> : null}
      <span className="category-card__footer">
        Explore
        <Icon name="arrow-right" size={16} />
      </span>
    </Link>
  );
}
