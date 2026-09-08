import { IMAGES } from '../data';

export default function Configurator() {
  return (
    <section className="configurator-section">
      <div className="config-container">
        <div className="config-visual">
          <img
            src={IMAGES.blueprint}
            alt="Motherboard Blueprint"
            className="blueprint-img"
          />
          <div className="vis-label">CRIMSON_BLUEPRINT_V4.SYS</div>
          <div className="vis-specs">
            <span>CPU SOCKET: LGA1700</span>
            <span className="text-neon-green">COMPATIBLE</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <div className="vis-status">RTX 40-SERIES READY</div>
        </div>

        <div className="config-info">
          <div className="sys-guarantee">// ZERO INCOMPATIBILITY GUARANTEE</div>
          <h2>BUILD YOUR WEAPON OF CHOICE</h2>
          <p>
            Utilize our custom interactive configurator terminal. Filter by power
            supply margins, chassis dimensional limits, and exact bottleneck
            readouts automatically.
          </p>
          <div className="config-actions">
            <a href="#" className="btn btn-primary">LAUNCH CONFIGURATOR →</a>
            <a href="#" className="btn btn-outline">WATCH VIDEO GUIDE</a>
          </div>
        </div>
      </div>
    </section>
  );
}
