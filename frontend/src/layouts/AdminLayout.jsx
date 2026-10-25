import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/documents', label: 'Manage documents', icon: 'documents' },
  { to: '/admin/comments', label: 'Manage comments', icon: 'comment' },
  { to: '/admin/upload', label: 'Upload material', icon: 'upload' },
];

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand">
          <span className="brand-mark" aria-hidden="true">
            SM
          </span>
          <div>
            <strong>Study Materials Hub</strong>
            <span>Admin console</span>
          </div>
        </div>

        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={link.icon} size={18} />
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/" className="admin-nav__link" onClick={() => setMenuOpen(false)}>
            <Icon name="external" size={18} />
            View public site
          </NavLink>
        </nav>

        <button type="button" className="admin-sidebar__signout" onClick={handleSignOut}>
          <Icon name="logout" size={18} />
          Sign out
        </button>
      </aside>

      <div className="admin-body">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-button admin-topbar__toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>

          <div className="admin-topbar__title">
            <h1>Administration</h1>
            <p>Manage study material, questions and publishing</p>
          </div>

          <div className="admin-topbar__user">
            <Icon name="user" size={18} />
            <div>
              <strong>{admin?.name || 'Administrator'}</strong>
              <span>{admin?.email}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="admin-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}
