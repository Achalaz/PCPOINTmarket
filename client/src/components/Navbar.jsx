import { useState } from 'react';
import { NAV_LINKS } from '../data';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  cartCount = 0,
  onCategorySelect,
  onOpenCart,
  onOpenAuth,
  onNavigateProfile,
  onNavigateAdmin,
  onNavigateHome,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = (link, e) => {
    if (link.category && onCategorySelect) {
      e.preventDefault();
      onNavigateHome();
      onCategorySelect(link.category);
      setTimeout(() => {
        const target = document.getElementById('products-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    onNavigateHome();
    setTimeout(() => {
      const searchInput = document.getElementById('product-search-input');
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => searchInput.focus(), 300);
      }
    }, 100);
  };

  const handleLogoClick = () => {
    onNavigateHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="logo-icon" />
        <span>
          PCPoint <span className="logo-sub">ARMORY</span>
        </span>
      </div>

      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className={link.highlight ? 'nav-highlight' : ''}
              onClick={(e) => handleNavClick(link, e)}
            >
              {link.label}
            </a>
          </li>
        ))}

        {/* Mobile Auth options */}
        {mobileMenuOpen && (
          <li className="mobile-auth-row">
            {isAuthenticated ? (
              <div className="mobile-user-box">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onNavigateProfile();
                    setMobileMenuOpen(false);
                  }}
                >
                  👤 {user?.full_name || 'Profile'}
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
              >
                LOGIN / ENLIST
              </button>
            )}
          </li>
        )}
      </ul>

      <div className="nav-actions">
        <button
          className="icon-btn search-trigger-btn"
          aria-label="Search catalog"
          onClick={handleSearchClick}
          title="Search Armory"
        >
          🔍
        </button>

        <button
          className="icon-btn cart-trigger-btn"
          aria-label={`Cart with ${cartCount} items`}
          onClick={onOpenCart}
          title="Tactical Cart"
        >
          🛒
          {cartCount > 0 && <span className="cart-badge-counter">{cartCount}</span>}
        </button>

        {/* Authentication Navigation State */}
        {isAuthenticated && user?.role === 'admin' && (
          <button
            className="btn btn-secondary btn-sm nav-admin-btn"
            onClick={onNavigateAdmin}
            title="Open Operations & Logistics Command Center"
          >
            ⚙ COMMAND
          </button>
        )}

        {isAuthenticated ? (
          <div className="navbar-user-profile-menu">
            <button
              className="navbar-user-trigger"
              onClick={() => setUserDropdownOpen((o) => !o)}
              title="Operator Account Menu"
            >
              <img
                src={user?.avatar || '/assets/u1.svg'}
                alt={user?.full_name || 'Operator'}
                className="navbar-avatar-img"
              />
              <span className="navbar-username">{user?.full_name?.split(' ')[0] || 'Operator'}</span>
              <span className={`auth-role-pill ${user?.role === 'admin' ? 'admin' : ''}`}>
                {user?.role === 'admin' ? 'ADMIN' : 'AUTH'}
              </span>
              <span className="dropdown-caret">▾</span>
            </button>

            {userDropdownOpen && (
              <div className="navbar-dropdown-panel" onClick={() => setUserDropdownOpen(false)}>
                <div className="dropdown-user-header">
                  <div className="dropdown-name">{user?.full_name}</div>
                  <div className="dropdown-email">{user?.email}</div>
                  <div className="dropdown-status">
                    <span className="dot green" />
                    <span>{user?.account_status || 'Active Member'}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {user?.role === 'admin' && (
                  <button
                    className="dropdown-item text-crimson font-bold"
                    onClick={() => {
                      onNavigateAdmin();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span>⚙ Operations Command</span>
                    <span className="item-arrow">→</span>
                  </button>
                )}

                <button
                  className="dropdown-item"
                  onClick={() => {
                    onNavigateProfile();
                    setUserDropdownOpen(false);
                  }}
                >
                  <span>👤 Tactical Profile</span>
                  <span className="item-arrow">→</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    onOpenCart();
                    setUserDropdownOpen(false);
                  }}
                >
                  <span>🛒 Persisted Cart ({cartCount})</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item logout-action text-crimson"
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                >
                  <span>⏻ Terminate Session</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn btn-primary nav-auth-btn"
            onClick={onOpenAuth}
            title="Authenticate or Enlist"
          >
            <span>LOGIN / ENLIST</span>
          </button>
        )}

        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
