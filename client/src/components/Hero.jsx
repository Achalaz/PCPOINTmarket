import { useState, useRef } from 'react';
import { IMAGES } from '../data';

const HERO_IMAGES = [
  '/media_1787635462982.jpg', // Red ghost
  '/media_1787635448546.jpg', // Green ghost
  '/media_1787635454440.jpg', // GTA VI
  IMAGES.hero,                // Original red ghost 
  IMAGES.laptop               // Gaming Laptop
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isThrottled = useRef(false);

  // Called on the hero-image panel only — does NOT preventDefault
  // so the page can still scroll normally
  const handleImageWheel = (e) => {
    if (!isThrottled.current && e.deltaY !== 0) {
      isThrottled.current = true;

      if (e.deltaY > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      } else {
        setCurrentImageIndex((prev) =>
          prev === 0 ? HERO_IMAGES.length - 1 : prev - 1
        );
      }

      setTimeout(() => {
        isThrottled.current = false;
      }, 300);
    }
  };

  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <div className="status-indicator">
            <span className="dot" /> SYSTEM OVERCLOCKED // STABLE
          </div>
          <h1 className="hero-title">
            TASK FORCE GEAR.<br />
            <span className="text-crimson">OVERCLOCKED.</span>
          </h1>
          <p className="hero-desc">
            Equip your terminal with battlefield-grade components. Precision
            engineered for zero latency, maximum thermal dissipation, and
            destructive frame rates. Scroll to cycle target visuals.
          </p>
          <div className="hero-actions">
            <a href="#" className="btn btn-primary">DEPLOY BUILD →</a>
            <a href="#" className="btn btn-secondary">EXPLORE HARDWARE</a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-label">FPS ESTIMATE</div>
              <div className="stat-val text-neon-green">320+</div>
            </div>
            <div className="stat">
              <div className="stat-label">THERMAL EFFICIENCY</div>
              <div className="stat-val">98.4%</div>
            </div>
          </div>
        </div>

        {/* onWheel here — cycles images, page still scrolls */}
        <div className="hero-image" onWheel={handleImageWheel}>
          <span className="hero-tag tl">LOC: SEC_B_04</span>
          <span className="hero-tag tr">TARGET: ACQUIRED // {currentImageIndex + 1}/5</span>
          <img
            key={currentImageIndex}
            src={HERO_IMAGES[currentImageIndex]}
            alt="Tactical Gear"
            className="hero-slide-img"
          />
          <span className="hero-tag bl">REC: 00:23:11</span>
        </div>
      </header>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(2)].flatMap((_, i) =>
            ['CRIMSON SPEC DEALS ///', 'RTX 4090 RESTOCK INCOMING ///', "USE CODE 'GHOST' FOR 10% OFF ///",'TACTICAL GEAR UPGRADES LIVE ///'].map((text) => (
              <div key={`${i}-${text}`} className="ticker-item">{text}</div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
