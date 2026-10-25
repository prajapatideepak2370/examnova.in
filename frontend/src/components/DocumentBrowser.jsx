import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import DocumentCard from './DocumentCard.jsx';
import DocumentFilters, { EMPTY_FILTERS } from './DocumentFilters.jsx';
import Pagination from './Pagination.jsx';
import SearchBar from './SearchBar.jsx';
import StatusMessage from './StatusMessage.jsx';
import { fetchCategories } from '../services/categoryService.js';
import { fetchDocuments } from '../services/documentService.js';
import useDebounce from '../hooks/useDebounce.js';
import { DEFAULT_PAGE_SIZE } from '../utils/constants.js';
import { formatNumber } from '../utils/format.js';

const FILTER_KEYS = ['category', 'subject', 'examination', 'fileType', 'sort', 'from', 'to'];

function filtersFromParams(searchParams) {
  const filters = { ...EMPTY_FILTERS };
  FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) filters[key] = value;
  });
  return filters;
}

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="doc-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-card__preview" />
          <div className="skeleton-card__line skeleton-card__line--title" />
          <div className="skeleton-card__line" />
          <div className="skeleton-card__line skeleton-card__line--short" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shared catalogue browser used by the Study Materials page and the Search Results page.
 * Filters live in the URL so category shortcuts and reloads keep their state.
 */
export default function DocumentBrowser({
  heading = 'Study material',
  subheading,
  initialKeyword = '',
  showFilters = true,
  showSearch = true,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const [keyword, setKeyword] = useState(initialKeyword || searchParams.get('q') || '');
  const debouncedKeyword = useDebounce(keyword, 450);

  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((list) => {
        if (active) setCategories(list);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError('');

    const params = { page, limit: pageSize, sort: filters.sort };
    if (debouncedKeyword.trim()) params.q = debouncedKeyword.trim();

    FILTER_KEYS.forEach((key) => {
      if (key !== 'sort' && filters[key]) params[key] = filters[key];
    });

    fetchDocuments(params)
      .then((result) => {
        if (!active) return;
        setDocuments(result.documents);
        setMeta(result.meta);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [debouncedKeyword, filtersKey, page, pageSize, reloadKey]);

  const updateFilters = useCallback(
    (next) => {
      setPage(1);
      const params = new URLSearchParams(searchParams);

      FILTER_KEYS.forEach((key) => {
        if (key === 'sort') return;
        const value = next[key];
        if (value) params.set(key, value);
        else params.delete(key);
      });

      if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
      else params.delete('sort');

      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setPage(1);
    const params = new URLSearchParams();
    const term = searchParams.get('q');
    if (term) params.set('q', term);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const activeFilterCount = FILTER_KEYS.filter((key) => key !== 'sort' && filters[key]).length;
  const total = meta?.total ?? 0;
  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <div className={`browser ${showFilters ? '' : 'browser--wide'}`}>
      {showFilters ? (
        <DocumentFilters
          categories={categories}
          value={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          disabled={status === 'loading'}
        />
      ) : null}

      <div className="browser__results">
        <header className="browser__header">
          <div>
            <h1>{heading}</h1>
            {subheading ? <p>{subheading}</p> : null}
          </div>

          {status === 'ready' ? (
            <p className="browser__count">
              {total === 0
                ? 'No documents found'
                : `Showing ${firstResult}-${lastResult} of ${formatNumber(total)} documents`}
            </p>
          ) : null}
        </header>

        {showSearch ? (
          <div className="browser__search">
            <SearchBar
              size="small"
              defaultValue={keyword}
              placeholder="Search by document title or subject..."
              onSubmit={(term) => {
                setKeyword(term);
                setPage(1);
              }}
            />
          </div>
        ) : null}

        {status === 'loading' ? <SkeletonGrid count={pageSize > 6 ? 6 : pageSize} /> : null}

        {status === 'error' ? (
          <StatusMessage
            variant="error"
            title="We could not load the study material"
            message={error}
            action={
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                <Icon name="clock" size={16} />
                Retry
              </button>
            }
          />
        ) : null}

        {status === 'ready' && documents.length === 0 ? (
          <StatusMessage
            variant="empty"
            title="No study material matched your search"
            message={
              activeFilterCount > 0
                ? 'Try a different keyword or remove some filters to widen your search.'
                : 'Try a different keyword. New material is added regularly.'
            }
            action={
              activeFilterCount > 0 || keyword ? (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    setKeyword('');
                    resetFilters();
                  }}
                >
                  Clear search and filters
                </button>
              ) : null
            }
          />
        ) : null}

        {documents.length > 0 ? (
          <>
            <div className="doc-grid">
              {documents.map((document) => (
                <DocumentCard key={document._id} document={document} />
              ))}
            </div>
            <Pagination page={page} totalPages={meta?.totalPages || 1} onChange={setPage} />
          </>
        ) : null}
      </div>
    </div>
  );
}
