import Icon from './Icon.jsx';

/**
 * Single component for the three non-happy states so loading, empty and error
 * messaging stays visually consistent across the site.
 */
export default function StatusMessage({
  variant = 'info',
  title,
  message,
  icon,
  action,
  compact = false,
}) {
  const defaultIcon = {
    loading: 'clock',
    empty: 'search',
    error: 'alert',
    success: 'check',
    info: 'info',
  }[variant];

  return (
    <div className={`status-message status-message--${variant} ${compact ? 'is-compact' : ''}`} role="status">
      <span className="status-message__icon">
        <Icon name={icon || defaultIcon} size={compact ? 18 : 24} />
      </span>
      <div className="status-message__body">
        {title ? <strong>{title}</strong> : null}
        {message ? <p>{message}</p> : null}
      </div>
      {action ? <div className="status-message__action">{action}</div> : null}
    </div>
  );
}
