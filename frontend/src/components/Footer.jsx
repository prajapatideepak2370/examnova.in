import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const CATEGORY_LINKS = [
  { label: 'General Knowledge', to: '/study-materials?category=general-knowledge' },
  { label: 'Mathematics', to: '/study-materials?category=mathematics' },
  { label: 'Current Affairs', to: '/study-materials?category=current-affairs' },
  { label: 'Previous Year Papers', to: '/study-materials?category=previous-year-question-papers' },
  { label: 'Mock Tests', to: '/study-materials?category=mock-tests' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
];

const SOCIAL_LINKS = [
  {
    name: 'youtube',
    label: 'YouTube',
    href: 'https://youtube.com/@poonamkumari-r8l2h?si=e6ndjlJZHeEEpZsc',
  },
  {
    name: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/03poonam1988',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <div className="site-brand site-brand--footer">
            <span className="brand-mark" aria-hidden="true">
              EP
            </span>
            <span className="site-brand__text">
              <strong>Exam Portal</strong>
              <small>Government exam preparation</small>
            </span>
          </div>
          <p>
            A focused study library for Indian government competitive examinations. Read notes, previous
            year papers, mock tests and practice questions online, in one organised place.
          </p>
        </div>

        <nav className="site-footer__column" aria-label="Study material categories">
          <h3>Study material</h3>
          <ul>
            {CATEGORY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__column" aria-label="Portal information">
          <h3>Information</h3>
          <ul>
            {COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/admin/login">Administrator login</Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__column">
          <h3>Follow us</h3>
          <ul className="social-links">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a
                  className={`social-link social-link--${social.name}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} – opens in a new tab`}
                >
                  <Icon name={social.name} size={20} />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container">
          <span>&copy; {year} Exam Portal. All rights reserved.</span>
          <span>
            Built for students preparing for SSC, UPSC, Banking, Railway and State PSC examinations.
          </span>
        </div>
      </div>
    </footer>
  );
}
