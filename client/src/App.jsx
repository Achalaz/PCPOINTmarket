import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Configurator from './components/Configurator';
import Diagnostics from './components/Diagnostics';
import Logs from './components/Logs';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProfileDashboard from './components/ProfileDashboard';
import CheckoutView from './components/CheckoutView';

function MainApp() {
  const { user, isAuthenticated, syncGuestCart } = useAuth();

  // Navigation view state: 'home' | 'profile' | 'checkout'
  const [currentView, setCurrentView] = useState('home');

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pcpoint_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [pendingReturnUrl, setPendingReturnUrl] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const prevAuthRef = useRef(isAuthenticated);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('pcpoint_cart', JSON.stringify(cart));
  }, [cart]);

  // Show tactical toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Milestone 4: Logic to merge or persist guest shopping items upon user authentication
  useEffect(() => {
    // If just became authenticated and has guest items
    if (!prevAuthRef.current && isAuthenticated) {
      if (cart.length > 0) {
        syncGuestCart(cart).then((res) => {
          if (res?.cart) {
            setCart(res.cart);
            triggerToast(`🛒 CART STATE: ${res.mergedCount || cart.length} guest items successfully merged to profile.`);
          }
        });
      }
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, cart, syncGuestCart]);

  // Handle URL Hash Navigation & Active Route Protection Guards
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();

      if (hash === '#profile') {
        if (!isAuthenticated) {
          // Route Protection Guard
          setPendingReturnUrl('#profile');
          setAuthModalOpen(true);
          setAuthModalTab('login');
          triggerToast('🔒 ACCESS GUARD: Please authenticate to access Operator Profile.');
          window.location.hash = '#home';
          setCurrentView('home');
        } else {
          setCurrentView('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === '#checkout') {
        if (!isAuthenticated) {
          // Route Protection Guard
          setPendingReturnUrl('#checkout');
          setAuthModalOpen(true);
          setAuthModalTab('login');
          triggerToast('🔒 ACCESS GUARD: Please authenticate to proceed with armory checkout.');
          window.location.hash = '#home';
          setCurrentView('home');
        } else {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial run

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Cart operations
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
    triggerToast(`Added ${product.name} to Tactical Cart.`);
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

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('pcpoint_cart');
  };

  // Safe navigation handlers
  const navigateToHome = () => {
    window.location.hash = '#home';
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProfile = () => {
    if (!isAuthenticated) {
      setPendingReturnUrl('#profile');
      setAuthModalOpen(true);
      setAuthModalTab('login');
      triggerToast('🔒 ACCESS GUARD: Please authenticate to access Operator Profile.');
    } else {
      window.location.hash = '#profile';
      setCurrentView('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToCheckout = () => {
    setCartDrawerOpen(false);
    if (!isAuthenticated) {
      setPendingReturnUrl('#checkout');
      setAuthModalOpen(true);
      setAuthModalTab('login');
      triggerToast('🔒 ACCESS GUARD: Please authenticate to proceed with armory checkout.');
    } else {
      window.location.hash = '#checkout';
      setCurrentView('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = (returnUrl) => {
    triggerToast(`✓ Authenticated as ${user?.full_name || 'Operator'}`);
    if (returnUrl) {
      window.location.hash = returnUrl;
      setPendingReturnUrl(null);
    }
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
        onOpenAuth={() => {
          setAuthModalTab('login');
          setAuthModalOpen(true);
        }}
        onNavigateProfile={navigateToProfile}
        onNavigateHome={navigateToHome}
      />

      {/* Floating Tactical Toast Banner */}
      {toastMessage && (
        <div className="tactical-toast">
          <span className="dot green" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW ROUTING */}
      {currentView === 'home' && (
        <>
          <Hero />
          <main>
            <Categories
              onCategorySelect={(cat) => {
                setSelectedCategory(cat);
                const target = document.getElementById('products-section');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <Products
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onAddToCart={handleAddToCart}
            />
            <Configurator />
            <Diagnostics />
            <Logs />
          </main>
        </>
      )}

      {currentView === 'profile' && (
        <ProfileDashboard
          onNavigateHome={navigateToHome}
          onOpenCart={() => setCartDrawerOpen(true)}
        />
      )}

      {currentView === 'checkout' && (
        <CheckoutView
          cart={cart}
          onNavigateHome={navigateToHome}
          onClearCart={handleClearCart}
        />
      )}

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
                      navigateToHome();
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
                  <span>
                    Or 3 installments of <strong>{formatLKR(Math.round(totalCartPrice / 3))}</strong>
                  </span>
                </div>
                <button
                  className="btn btn-primary cart-checkout-btn"
                  onClick={navigateToCheckout}
                >
                  PROCEED TO SECURE CHECKOUT →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingReturnUrl(null);
        }}
        initialTab={authModalTab}
        returnUrl={pendingReturnUrl}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
