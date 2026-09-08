import { CATEGORIES } from '../data';

export default function Categories() {
  return (
    <section className="section">
      <div className="section-badge">TACTICAL INDEX</div>
      <h2 className="section-title">CATEGORY CURATION</h2>
      <p className="section-subtitle">Filter and select your payload tier</p>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.name}
            href="#"
            className="category-card"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(10,10,12,0.92), rgba(10,10,12,0.35)), url('${cat.img}')`,
            }}
          >
            <div className="cat-info">
              <h3>{cat.name}</h3>
              <span className="cat-count">{cat.count}</span>
            </div>
            <div className="deploy-link">
              DEPLOY SECTOR <span>&gt;</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
