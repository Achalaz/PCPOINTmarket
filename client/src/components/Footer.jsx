import { useState } from 'react';

const BRANDS = ['INTEL', 'NVIDIA', 'ASUS', 'AMD', 'CORSAIR'];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed: ${email}`);
    setEmail('');
  };

  return (
    <>
      {/* Brands */}
      <div className="brands-section">
        {BRANDS.map((b) => <div key={b} className="brand">{b}</div>)}
      </div>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <h2>SECURE CORE INTEL UPGRADES</h2>
          <p>
            Sign up to receive immediate drops of premium inventory restocks,
            exclusive experimental builds, and coupon keys.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter terminal email..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">SUBSCRIBE →</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon" />
              <span>PCPoint</span>
            </div>
            <p>
              Specialized gaming computers &amp; components built for elite
              performance under military margins. Tactical operator approved.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>// DEPLOYMENTS</h4>
              <ul>
                <li><a href="#">Overclocked Laptops</a></li>
                <li><a href="#">Custom PC Component</a></li>
                <li><a href="#">Custom Watercooling</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>// SUPPORT SEGMENT</h4>
              <ul>
                <li><a href="#">Diagnostic Drivers</a></li>
                <li><a href="#">Return Policy Specs</a></li>
                <li><a href="#">Command Center FAQ</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>// SOCIAL SECTORS</h4>
              <ul>
                <li><a href="#">Discord Terminal</a></li>
                <li><a href="#">HQ YouTube Broadcasts</a></li>
                <li><a href="#">Twitter Intel Logs</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PCPoint SYSTEM LABS. ALL RIGHTS RESERVED.</p>
          <p className="text-crimson">STATUS: MISSION READY // TERMINAL ACTIVE</p>
        </div>
      </footer>
    </>
  );
}
