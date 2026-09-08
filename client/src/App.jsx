import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Configurator from './components/Configurator';
import Diagnostics from './components/Diagnostics';
import Logs from './components/Logs';
import Footer from './components/Footer';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleUpdateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const formatLKR = (num) => 'Rs. ' + num.toLocaleString('en-US');

  return (
    <>
      <Navbar
        cartCount={totalCartCount}
        onCategorySelect={(cat) => setSelectedCategory(cat)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <Hero />

      <main>
        <Categories onCategorySelect={(cat) => setSelectedCategory(cat)} />

        <Products
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onAddToCart={handleAddToCart}
        />

        <Configurator />
        <Diagnostics />
        <Logs />
      </main>

      <Footer />

      {/* Slide-out Tactical Cart Drawer */}
      {cartDrawerOpen && (
        <div className="cart-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-header-title">
                <span>🛒 TACTICAL PAYLOAD CART</span>
                <span className="cart-item-count">({totalCartCount} Items)</span>
              </div>
              <button
                className="cart-close-btn"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close Cart"
              >
                ✕
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="empty-cart-icon">🛒</div>
                  <h4>YOUR ARMORY CART IS EMPTY</h4>
                  <p>Explore high-performance laptops, GPUs, processors and peripherals above.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      const target = document.getElementById('products-section');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    BROWSE INVENTORY
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <img src={item.img} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-cat">{item.categoryName}</div>
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price">{formatLKR(item.price)}</div>
                      <div className="cart-item-qty-row">
                        <div className="qty-picker mini">
                          <button onClick={() => handleUpdateQty(item.id, -1)}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, 1)}>+</button>
                        </div>
                        <button
                          className="cart-remove-btn"
                          onClick={() => handleRemoveFromCart(item.id)}
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <span className="cart-total-val">{formatLKR(totalCartPrice)}</span>
                </div>
                <div className="cart-koko-notice">
                  <span className="koko-pill">koko</span>
                  <span>Or 3 installments of <strong>{formatLKR(Math.round(totalCartPrice / 3))}</strong></span>
                </div>
                <button
                  className="btn btn-primary cart-checkout-btn"
                  onClick={() => alert(`Proceeding to checkout with total: ${formatLKR(totalCartPrice)}. Official Sri Lanka invoice & warranty will be generated!`)}
                >
                  PROCEED TO SECURE CHECKOUT →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
