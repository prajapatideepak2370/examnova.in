import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import SearchBar from './SearchBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SITE_MARK, SITE_NAME, SITE_TAGLINE } from '../utils/constants.js';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/study-materials', label: 'Study Materials', icon: 'documents' },
  { to: '/subjects', label: 'Subjects', icon: 'book' },
  { to: '/exam-categories', label: 'Exam Categories', icon: 'category' },
  { to: '/comments', label: 'Comments', icon: 'comment' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const currentUrl = `${location.pathname}${location.search}`;

  // Query-based links (category shortcuts) must match the full URL to stay highlighted.
  const isLinkActive = (to) => (to.includes('?') ? currentUrl === to : location.pathname === to);

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span className="site-brand__text">
            <strong>{SITE_NAME}</strong>
            <small>{SITE_TAGLINE}</small>
          </span>
        </Link>

        <div className="site-header__search">
          <SearchBar size="small" placeholder="Search study material..." />
        </div>

        <div className="site-header__actions">
          <Link to="/admin/login" className="btn btn--outline btn--sm">
            <Icon name="user" size={16} />
            Admin Login
          </Link>
          <button
            type="button"
            className="icon-button site-header__burger"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <nav className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
        <div className="container site-nav__inner">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`site-nav__link ${isLinkActive(link.to) ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              to="/admin/upload"
              className={`site-nav__link ${isLinkActive('/admin/upload') ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Upload Materials
            </Link>
          ) : null}
          <div className="site-nav__mobile-search">
            <SearchBar size="small" placeholder="Search study material..." />
          </div>
        </div>
      </nav>
    </header>
  );
}
