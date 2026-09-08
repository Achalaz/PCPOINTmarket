import { NAV_LINKS } from '../data';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon" />
        <span>PCPoint</span>
      </div>

      <ul className="nav-links">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} className={link.highlight ? 'nav-highlight' : ''}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button className="icon-btn" aria-label="Search">⚲</button>
        <button className="icon-btn" aria-label="Cart">🛒</button>
      </div>
    </nav>
  );
}
