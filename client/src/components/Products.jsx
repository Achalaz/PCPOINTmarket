import { PRODUCTS } from '../data';

export default function Products() {
  return (
    <section className="section">
      <div className="section-badge">STORE DEPLOYMENT</div>
      <h2 className="section-title">FEATURED ORDNANCE</h2>
      <p className="section-subtitle">Battlefield-tested rigs and internal components</p>

      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="product-card">
            <div className="prod-badge">{product.badge}</div>
            <div className="prod-img">
              <img src={product.img} alt={product.name} />
            </div>
            <div className="prod-details">
              <div className="prod-cat">{product.cat}</div>
              <h3 className="prod-name">{product.name}</h3>
              <p className="prod-specs">{product.specs}</p>
              <div className="prod-footer">
                <div className="prod-price">{product.price}</div>
                <button className="add-btn" aria-label="Add to cart">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
