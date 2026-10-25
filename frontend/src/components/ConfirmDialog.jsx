import { useEffect } from 'react';
import Icon from './Icon.jsx';

/** Accessible confirmation dialog used before destructive admin actions. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal">
      <button type="button" className="modal__scrim" aria-label="Close dialog" onClick={onCancel} />
      <div className="modal__panel" role="dialog" aria-modal="true" aria-label={title}>
        <span className="modal__icon" aria-hidden="true">
          <Icon name="alert" size={22} />
        </span>
        <h2 className="modal__title">{title}</h2>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
