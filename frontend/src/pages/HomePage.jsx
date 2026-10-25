import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import CommentSection from '../components/CommentSection.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { fetchCategories } from '../services/categoryService.js';
import { fetchDocuments } from '../services/documentService.js';

const HIGHLIGHTS = [
  {
    icon: 'book',
    title: 'Read online',
    text: 'A page-by-page viewer with zoom, fullscreen reading and page navigation.',
  },
  {
    icon: 'search',
    title: 'Search everything',
    text: 'Find material by title, subject, tag, examination name or keyword.',
  },
  {
    icon: 'shield',
    title: 'Exam focused',
    text: 'Curated notes for SSC, UPSC, Banking, Railway and State PSC examinations.',
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    Promise.all([
      fetchCategories(),
      fetchDocuments({ page: 1, limit: 6, sort: 'newest' }),
      fetchDocuments({ page: 1, limit: 3, sort: 'popular' }),
    ])
      .then(([categoryList, latestResult, popularResult]) => {
        if (!active) return;
        setCategories(categoryList);
        setLatest(latestResult.documents);
        setPopular(popularResult.documents);
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
  }, []);

  const totalDocuments = useMemo(
    () => categories.reduce((sum, category) => sum + (category.documentCount || 0), 0),
    [categories]
  );

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <span className="hero__badge">
            <Icon name="sparkle" size={16} />
            Trusted study material for government exams
          </span>
          <h1 className="hero__title">Your destination for government exam preparation</h1>
          <p className="hero__subtitle">
            Access quality study materials, general knowledge, mathematics, current affairs and practice
            questions in one place.
          </p>

          <div className="hero__search">
            <SearchBar />
          </div>

          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/study-materials">
              <Icon name="book" size={18} />
              Explore study materials
            </Link>
            <a className="btn btn--ghost btn--lg" href="#popular-categories">
              Browse categories
            </a>
          </div>

          <dl className="hero__stats">
            <div>
              <dt>Documents</dt>
              <dd>{totalDocuments}</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd>{categories.length}</dd>
            </div>
            <div>
              <dt>Formats</dt>
              <dd>PDF, DOC, DOCX</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section" id="popular-categories">
        <div className="container">
          <header className="section__header">
            <div>
              <h2>Popular categories</h2>
              <p>Jump straight into the subject you are preparing for.</p>
            </div>
          </header>

          {status === 'loading' ? <LoadingSpinner label="Loading categories..." /> : null}

          {status === 'error' ? (
            <StatusMessage variant="error" title="Categories could not be loaded" message={error} />
          ) : null}

          {status === 'ready' ? (
            <div className="category-grid">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section section--tinted" id="latest-uploads">
        <div className="container">
          <header className="section__header">
            <div>
              <h2>Latest uploads</h2>
              <p>Freshly added notes, question papers and practice sets from the administrator.</p>
            </div>
            <Link className="btn btn--outline btn--sm" to="/study-materials">
              View all
              <Icon name="arrow-right" size={16} />
            </Link>
          </header>

          {status === 'loading' ? <LoadingSpinner label="Loading the latest study material..." /> : null}

          {status === 'ready' && latest.length === 0 ? (
            <StatusMessage
              variant="empty"
              title="No documents published yet"
              message="Sign in as an administrator and upload the first study material to see it here."
            />
          ) : null}

          {latest.length > 0 ? (
            <div className="doc-grid">
              {latest.map((document) => (
                <DocumentCard key={document._id} document={document} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <header className="section__header">
            <div>
              <h2>Popular study materials</h2>
              <p>The resources students are reading the most right now.</p>
            </div>
          </header>

          {status === 'loading' ? <LoadingSpinner label="Loading popular material..." /> : null}

          {status === 'ready' && popular.length === 0 ? (
            <StatusMessage
              variant="empty"
              title="Nothing to show yet"
              message="Popular materials appear here once students start reading documents."
            />
          ) : null}

          {popular.length > 0 ? (
            <div className="doc-grid doc-grid--three">
              {popular.map((document) => (
                <DocumentCard key={document._id} document={document} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container">
          <div className="highlight-grid">
            {HIGHLIGHTS.map((item) => (
              <article className="highlight-card" key={item.title}>
                <span className="highlight-card__icon" aria-hidden="true">
                  <Icon name={item.icon} size={22} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CommentSection />
    </>
  );
}
