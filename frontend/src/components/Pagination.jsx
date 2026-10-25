import Icon from './Icon.jsx';

/** Windowed page numbers with previous/next controls. */
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(page + 2, 5));

  for (let current = start; current <= end; current += 1) pages.push(current);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <Icon name="chevron-left" size={16} />
        Previous
      </button>

      <div className="pagination__pages">
        {start > 1 ? (
          <>
            <button type="button" className="pagination__page" onClick={() => onChange(1)}>
              1
            </button>
            {start > 2 ? <span className="pagination__ellipsis">...</span> : null}
          </>
        ) : null}

        {pages.map((current) => (
          <button
            key={current}
            type="button"
            className={`pagination__page ${current === page ? 'is-active' : ''}`}
            aria-current={current === page ? 'page' : undefined}
            onClick={() => onChange(current)}
          >
            {current}
          </button>
        ))}

        {end < totalPages ? (
          <>
            {end < totalPages - 1 ? <span className="pagination__ellipsis">...</span> : null}
            <button type="button" className="pagination__page" onClick={() => onChange(totalPages)}>
              {totalPages}
            </button>
          </>
        ) : null}
      </div>

      <button
        type="button"
        className="pagination__button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
