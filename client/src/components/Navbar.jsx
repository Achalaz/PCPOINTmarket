import { useState } from 'react';
import { NAV_LINKS } from '../data';

export default function Navbar({ cartCount = 0, onCategorySelect, onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (link, e) => {
    if (link.category && onCategorySelect) {
      e.preventDefault();
      onCategorySelect(link.category);
      const target = document.getElementById('products-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInput.focus(), 300);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
        <div className="logo-icon" />
        <span>PCPoint <span className="logo-sub">ARMORY</span></span>
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
