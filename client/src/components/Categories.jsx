import { CATEGORIES } from '../data';

export default function Categories({ onCategorySelect }) {
  const handleCategoryClick = (categoryId, e) => {
    e.preventDefault();
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Exclude 'all' from top grid showcase
  const showcaseCategories = CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <section className="section">
      <div className="section-badge">TACTICAL INDEX</div>
      <h2 className="section-title">CATEGORY CURATION</h2>
      <p className="section-subtitle">Filter and select your payload tier directly from verified Sri Lankan inventory</p>

      <div className="category-grid">
        {showcaseCategories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            onClick={(e) => handleCategoryClick(cat.id, e)}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(10,10,12,0.92), rgba(10,10,12,0.35)), url('${cat.img}')`,
            }}
          >
            <div className="cat-info">
              <h3>{cat.name}</h3>
              <span className="cat-count">{cat.count}</span>
            </div>
            <div className="deploy-link">
              EXPLORE INVENTORY <span>&gt;</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
