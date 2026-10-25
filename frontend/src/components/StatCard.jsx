import Icon from './Icon.jsx';
import { formatNumber } from '../utils/format.js';

export default function StatCard({ label, value, icon = 'documents', tone = 'primary', hint }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{formatNumber(value)}</p>
        {hint ? <p className="stat-card__hint">{hint}</p> : null}
      </div>
    </article>
  );
}
