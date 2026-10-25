export default function LoadingSpinner({ label = 'Loading...', size = 26 }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <span className="loading-spinner__ring" style={{ width: size, height: size }} />
      {label ? <span className="loading-spinner__label">{label}</span> : null}
    </div>
  );
}
