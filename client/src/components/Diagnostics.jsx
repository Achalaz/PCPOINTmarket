import { useState, useEffect } from 'react';

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Diagnostics() {
  const [thermal, setThermal] = useState('54°C');
  const [rpm, setRpm] = useState('2,400');
  const [volt, setVolt] = useState('1.32V');

  useEffect(() => {
    const interval = setInterval(() => {
      setThermal(`${Math.round(randomBetween(52, 58))}°C`);
      setRpm(Math.floor(randomBetween(2350, 2450)).toLocaleString());
      setVolt(`${randomBetween(1.30, 1.35).toFixed(2)}V`);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section">
      <div className="section-badge">DIAGNOSTICS PANEL</div>
      <h2 className="section-title">OPERATOR TERMINAL</h2>
      <p className="section-subtitle">
        Live tactical telemetry of custom CrimsX hardware configurations
      </p>

      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="tel-label">// MAIN THERMALS</div>
          <div className="tel-value">{thermal}</div>
          <div className="tel-status">
            <span className="dot green" /> UNDER MAX LOAD LIMIT
          </div>
        </div>
        <div className="telemetry-card">
          <div className="tel-label">// FAN STAGE RPM</div>
          <div className="tel-value">{rpm}</div>
          <div className="tel-status">QUIET PROFILE ACTIVE</div>
        </div>
        <div className="telemetry-card">
          <div className="tel-label">// STABLE OC VOLTS</div>
          <div className="tel-value text-neon-green">{volt}</div>
          <div className="tel-status text-crimson">MAX TURBO CAPACITY</div>
        </div>
      </div>
    </section>
  );
}
