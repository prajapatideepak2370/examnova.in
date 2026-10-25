import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import StatusMessage from '../../components/StatusMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const POINTS = [
  'Upload PDF, DOC and DOCX study material in a few seconds.',
  'Publish instantly or keep a document as a private draft.',
  'Track reads and manage the whole library from one console.',
];

export default function AdminLoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/admin/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isLoading, isAuthenticated, navigate, redirectTo]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signIn({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <aside className="admin-login__aside">
        <div className="admin-login__brand">
          <span className="brand-mark" aria-hidden="true">
            EP
          </span>
          <div>
            <strong>Exam Portal</strong>
            <small>Administration console</small>
          </div>
        </div>

        <div>
          <h2>Publish study material your students can read today.</h2>
          <p>
            Sign in to upload documents, organise them by category and keep the library up to date for every
            examination you support.
          </p>
        </div>

        <ul className="admin-login__points">
          {POINTS.map((point) => (
            <li key={point}>
              <Icon name="check" size={17} />
              {point}
            </li>
          ))}
        </ul>
      </aside>

      <div className="admin-login__panel">
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <h1>Admin sign in</h1>
          <p>Enter your administrator credentials to open the dashboard.</p>

          {error ? <StatusMessage variant="error" compact title="Sign in failed" message={error} /> : null}

          <div className="field" style={{ marginTop: error ? 18 : 0 }}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="admin@examportal.in"
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            <Icon name="user" size={18} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="admin-login__hint">
            Sign in with the administrator account created by <code>npm run seed</code> in the backend. It
            uses the <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> values from{' '}
            <code>backend/.env</code>.
          </p>

          <p className="admin-login__footer">
            <Link to="/">Back to the public site</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
