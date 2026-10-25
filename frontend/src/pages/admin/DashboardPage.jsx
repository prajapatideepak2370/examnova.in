import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { fetchDashboardStats } from '../../services/statsService.js';
import { formatFileType, formatNumber, timeAgo } from '../../utils/format.js';

const FILE_TYPE_TONES = {
  pdf: 'danger',
  doc: 'info',
  docx: 'info',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const data = await fetchDashboardStats();
      setStats(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === 'loading') {
    return <LoadingSpinner label="Loading dashboard statistics..." />;
  }

  if (status === 'error') {
    return (
      <StatusMessage
        variant="error"
        title="Dashboard statistics could not be loaded"
        message={error}
        action={
          <button type="button" className="btn btn--outline btn--sm" onClick={load}>
            <Icon name="clock" size={16} />
            Retry
          </button>
        }
      />
    );
  }

  const { totals, recentDocuments, topDocuments, byCategory, byFileType } = stats;
  const maxCategoryCount = Math.max(1, ...byCategory.map((row) => row.count));

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>A snapshot of the study material library, its categories and readership.</p>
        </div>
        <Link className="btn btn--primary btn--sm" to="/admin/upload">
          <Icon name="upload" size={16} />
          Upload material
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Documents" value={totals.documents} icon="documents" hint="All uploaded files" />
        <StatCard
          label="Published"
          value={totals.published}
          icon="check"
          tone="success"
          hint="Visible to students"
        />
        <StatCard label="Drafts" value={totals.drafts} icon="edit" tone="warning" hint="Not yet public" />
        <StatCard
          label="Total reads"
          value={totals.views}
          icon="eye"
          tone="info"
          hint="Document views recorded"
        />
        <StatCard label="Questions" value={totals.questions} icon="gk" hint="Practice MCQs stored" />
        <StatCard label="Categories" value={totals.categories} icon="category" hint="Library sections" />
      </div>

      <div className="dash-columns">
        <section className="admin-card">
          <header className="admin-card__header">
            <div>
              <h2>Recent uploads</h2>
              <p>The five most recently added documents.</p>
            </div>
            <Link className="link-button" to="/admin/documents">
              Manage all
            </Link>
          </header>

          {recentDocuments.length === 0 ? (
            <p className="panel__text">No documents have been uploaded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((document) => (
                    <tr key={document._id}>
                      <td>
                        <div className="doc-cell">
                          <span className="doc-cell__icon" aria-hidden="true">
                            <Icon name={document.category?.icon || 'book'} size={17} />
                          </span>
                          <span>
                            <Link
                              className="doc-cell__title"
                              to={`/study-materials/${document.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {document.title}
                            </Link>
                            <span className="doc-cell__meta">
                              {document.category?.name || 'Uncategorised'} ·{' '}
                              {formatFileType(document.fileType)}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`chip chip--${document.status === 'published' ? 'success' : 'muted'}`}
                        >
                          {document.status}
                        </span>
                      </td>
                      <td>{timeAgo(document.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-card">
          <header className="admin-card__header">
            <div>
              <h2>Most read</h2>
              <p>Documents with the highest view counts.</p>
            </div>
          </header>

          {topDocuments.length === 0 ? (
            <p className="panel__text">Reads will appear here once students open published documents.</p>
          ) : (
            <div className="bar-list">
              {topDocuments.map((document) => (
                <div className="bar-row" key={document._id}>
                  <div className="bar-row__top">
                    <span className="bar-row__label">{document.title}</span>
                    <span className="bar-row__value">{formatNumber(document.viewCount)} views</span>
                  </div>
                  <div className="bar-row__track">
                    <span
                      className="bar-row__fill"
                      style={{
                        width: `${Math.max(
                          6,
                          Math.round((document.viewCount / (topDocuments[0]?.viewCount || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dash-columns">
        <section className="admin-card">
          <header className="admin-card__header">
            <div>
              <h2>Documents per category</h2>
              <p>Where the library is strongest.</p>
            </div>
          </header>

          {byCategory.length === 0 ? (
            <p className="panel__text">Category breakdown appears once documents are uploaded.</p>
          ) : (
            <div className="bar-list">
              {byCategory.map((row) => (
                <div className="bar-row" key={row.categoryId || row.name}>
                  <div className="bar-row__top">
                    <span className="bar-row__label">{row.name}</span>
                    <span className="bar-row__value">
                      {formatNumber(row.count)} {row.count === 1 ? 'document' : 'documents'}
                    </span>
                  </div>
                  <div className="bar-row__track">
                    <span
                      className="bar-row__fill"
                      style={{ width: `${Math.max(6, Math.round((row.count / maxCategoryCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-card">
          <header className="admin-card__header">
            <div>
              <h2>Formats and quick actions</h2>
              <p>How many files of each format are stored.</p>
            </div>
          </header>

          {byFileType.length === 0 ? (
            <p className="panel__text">No files stored yet.</p>
          ) : (
            <div className="chip-list" style={{ marginBottom: 22 }}>
              {byFileType.map((row) => (
                <span className={`chip chip--${FILE_TYPE_TONES[row.fileType] || 'muted'}`} key={row.fileType}>
                  {formatFileType(row.fileType)} · {formatNumber(row.count)}
                </span>
              ))}
            </div>
          )}

          <div className="table-actions">
            <Link className="btn btn--outline btn--sm" to="/admin/upload">
              <Icon name="plus" size={16} />
              Upload material
            </Link>
            <Link className="btn btn--outline btn--sm" to="/admin/documents">
              <Icon name="documents" size={16} />
              Manage documents
            </Link>
            <Link className="btn btn--ghost btn--sm" to="/" target="_blank" rel="noreferrer">
              <Icon name="external" size={16} />
              Open public site
            </Link>
          </div>

          {totals.admins > 1 ? (
            <p className="panel__text" style={{ marginTop: 18 }}>
              {formatNumber(totals.admins)} administrator accounts are active on this portal.
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}
