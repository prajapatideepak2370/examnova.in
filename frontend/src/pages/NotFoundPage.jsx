import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFoundPage() {
  return (
    <div className="container page-section">
      <div className="not-found">
        <span className="not-found__code">404</span>
        <h1>Page not found</h1>
        <p>
          The page you are looking for has moved or never existed. You can continue from the study
          materials library instead.
        </p>
        <div className="not-found__actions">
          <Link className="btn btn--primary" to="/study-materials">
            <Icon name="book" size={18} />
            Browse study materials
          </Link>
          <Link className="btn btn--outline" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
