const LOGS = [
  {
    author: '[ Ghost_Pro_88 ]',
    rating: '5/5 RATING',
    text: '"The latency drop on the Vindicator series is surreal. Competitive shooter response is literally instant. Absolutely worth the tactical grade investment."',
  },
  {
    author: '[ Sgt_Kovacs ]',
    rating: '5/5 RATING',
    text: '"Built my custom liquid loop rig with Crimson components. Telemetry is stable, instructions are crystal clear, and the aesthetic is terrifying."',
  },
];

export default function Logs() {
  return (
    <section className="section">
      <div className="section-badge">OPERATOR LOGS</div>
      <h2 className="section-title">VERIFIED FIELD LOGS</h2>
      <p className="section-subtitle">
        Battle reports and terminal reviews from active gamers
      </p>

      <div className="logs-grid">
        {LOGS.map((log) => (
          <div key={log.author} className="log-card">
            <div className="log-header">
              <span className="log-author">{log.author}</span>
              <span className="text-neon-green">{log.rating}</span>
            </div>
            <p className="log-text">{log.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
