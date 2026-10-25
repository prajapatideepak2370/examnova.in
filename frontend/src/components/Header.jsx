import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import SearchBar from './SearchBar.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/study-materials', label: 'Study Materials' },
  { to: '/study-materials?category=general-knowledge', label: 'GK Questions' },
  { to: '/study-materials?category=mathematics', label: 'Mathematics' },
  { to: '/study-materials?category=current-affairs', label: 'Current Affairs' },
  { to: '/study-materials?category=mock-tests', label: 'Mock Tests' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentUrl = `${location.pathname}${location.search}`;

  // Query-based links (category shortcuts) must match the full URL to stay highlighted.
  const isLinkActive = (to) => (to.includes('?') ? currentUrl === to : location.pathname === to);

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            EP
          </span>
          <span className="site-brand__text">
            <strong>Exam Portal</strong>
            <small>Government exam preparation</small>
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
          <div className="site-nav__mobile-search">
            <SearchBar size="small" placeholder="Search study material..." />
          </div>
        </div>
      </nav>
    </header>
  );
}
