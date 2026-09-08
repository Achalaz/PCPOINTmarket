import { useState } from 'react';
import { TRUST_PILLARS } from '../data';

const BRANDS = ['ASUS', 'MSI', 'CORSAIR', 'ARCTIC', 'THERMALTAKE', 'INTEL', 'AMD', 'KEYCHRON', 'SAMSUNG', 'CRUCIAL'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <>
      {/* Trust Pillars */}
      <section className="section trust-pillars-section">
        <div className="trust-grid">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.title} className="trust-card">
              <div className="trust-card-icon">{pillar.icon}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands Ticker */}
      <div className="brands-section">
        {BRANDS.map((b) => <div key={b} className="brand">{b}</div>)}
      </div>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="section-badge">INTEL DISPATCH</div>
          <h2>SECURE SRI LANKA RESTOCK ALERTS</h2>
          <p>
            Sign up to receive immediate drops of RTX 40-series cards, new AMD/Intel processors, 
            exclusive flash sales, and Koko 0% installment promotions.
          </p>
          {subscribed ? (
            <div className="subscribe-success">
              ✅ Subscribed! You will receive tactical hardware updates.
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter email address (e.g. gamer@pcpoint.lk)..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">SUBSCRIBE →</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon" />
              <span>PCPoint <span className="logo-sub">ARMORY</span></span>
            </div>
            <p>
              Your No.1 Sri Lankan IT Partner. High-performance custom PC builds, 
              authentic PC components, official manufacturer warranties, and islandwide delivery.
            </p>
            <div className="store-location-info">
              <span>📍 Colombo & Kandy, Sri Lanka</span>
              <span>📞 +94 11 234 5678 / +94 77 123 4567</span>
            </div>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>// HARDWARE SECTORS</h4>
              <ul>
                <li><a href="#products-section">Gaming Laptops</a></li>
                <li><a href="#products-section">Processors (CPUs)</a></li>
                <li><a href="#products-section">Graphics Cards (RTX 40s)</a></li>
                <li><a href="#products-section">Liquid Coolers & Air</a></li>
                <li><a href="#products-section">NVMe Gen4 SSD Storage</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>// PCPOINT SERVICES</h4>
              <ul>
                <li><a href="#configurator">Build My Custom PC</a></li>
                <li><a href="#">Warranty Ticket Portal</a></li>
                <li><a href="#">Koko 3x Payment FAQ</a></li>
                <li><a href="#">Islandwide Delivery Terms</a></li>
                <li><a href="#">Motherboard & GPU Diagnostics</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>// COMMUNITY & SOCIAL</h4>
              <ul>
                <li><a href="#">Discord Server</a></li>
                <li><a href="#">YouTube Hardware Benchmarks</a></li>
                <li><a href="#">Instagram @PCPointLK</a></li>
                <li><a href="#">Facebook Official Hub</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PCPoint MARKET (SRI LANKA). POWERED BY ADVANCED AGY COMPUTING.</p>
          <p className="text-crimson">STATUS: OFFICIAL SRI LANKA STOCK ONLINE // TICKETING ACTIVE</p>
        </div>
      </footer>
    </>
  );
}
