import { useState, useMemo, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, BRANDS } from '../data';

export default function Products({ selectedCategory, onSelectCategory, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with prop when category is changed externally (e.g. from Navbar or Categories component)
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    triggerToast(`Added "${product.name.slice(0, 24)}..." to tactical cart!`);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 1500000 });
    setInStockOnly(false);
    setDealsOnly(false);
    setSortBy('featured');
    if (onSelectCategory) onSelectCategory('all');
  };

  const quickSearchTags = ['RTX 4090', 'Intel i9', 'Ryzen 7', 'DDR5', 'OLED', 'Arctic', 'Keychron', '1TB SSD'];

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Search filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.categoryName.toLowerCase().includes(query);
        const matchesSpecs = product.specs.toLowerCase().includes(query);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesCat && !matchesSpecs && !matchesTags) {
          return false;
        }
      }

      // 2. Category filter
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }

      // 3. Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // 4. Price filter
      if (product.price < priceRange.min || product.price > priceRange.max) {
        return false;
      }

      // 5. Stock filter
      if (inStockOnly && !product.inStock) {
        return false;
      }

      // 6. Deals only (has oldPrice)
      if (dealsOnly && !product.oldPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name-az') return a.name.localeCompare(b.name);
      return 0; // featured default
    });
  }, [searchTerm, activeCategory, selectedBrands, priceRange, inStockOnly, dealsOnly, sortBy]);

  const activeFilterCount =
    (activeCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (priceRange.min > 0 || priceRange.max < 1500000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (dealsOnly ? 1 : 0) +
    (searchTerm.trim() !== '' ? 1 : 0);

  const formatLKR = (num) => {
    return 'Rs. ' + num.toLocaleString('en-US');
  };

  return (
    <section id="products-section" className="section product-store-section">
      {/* Section Header */}
      <div className="section-head-wrap">
        <div>
          <div className="section-badge">PCPOINT HARDWARE ARMORY</div>
          <h2 className="section-title">EQUIPMENT & COMPONENT CATALOG</h2>
          <p className="section-subtitle">
            PCPoint Sri Lanka • Official warranty support • 3x Koko installment ready
          </p>
        </div>
        <div className="store-stats-badge">
          <span className="dot green" />
          <span>{PRODUCTS.length} TOTAL UNITS VERIFIED</span>
        </div>
      </div>

      {/* Global Search & Quick Tags Bar */}
      <div className="search-control-panel">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="product-search-input"
            type="text"
            className="search-input"
            placeholder="Search by component name, CPU, GPU, brand (e.g. RTX 4080, Arctic, i9-14900K)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Search Tag Chips */}
        <div className="quick-tags-container">
          <span className="quick-tag-label">QUICK FILTERS:</span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              className={`quick-tag-btn ${searchTerm === tag ? 'active' : ''}`}
              onClick={() => setSearchTerm(searchTerm === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => {
          const count =
            cat.id === 'all'
              ? PRODUCTS.length
              : PRODUCTS.filter((p) => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id);
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
            >
              <span>{cat.name}</span>
              <span className="pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Catalog Layout: Sidebar Filters + Products Grid */}
      <div className="catalog-layout">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="sidebar-header">
            <h3>FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}</h3>
            {activeFilterCount > 0 && (
              <button className="reset-btn" onClick={clearAllFilters}>
                RESET ALL
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-group-title">PRICE BUDGET (LKR)</h4>
            <div className="price-slider-wrap">
              <div className="price-display">
                <span>{formatLKR(priceRange.min)}</span>
                <span>{formatLKR(priceRange.max)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1500000"
                step="10000"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                }
                className="custom-range"
              />
            </div>
            {/* Quick Price Buttons */}
            <div className="quick-price-chips">
              <button
                className="chip-btn"
                onClick={() => setPriceRange({ min: 0, max: 75000 })}
              >
                &lt; 75K
              </button>
              <button
                className="chip-btn"
                onClick={() => setPriceRange({ min: 75000, max: 250000 })}
              >
                75K - 250K
              </button>
              <button
                className="chip-btn"
                onClick={() => setPriceRange({ min: 250000, max: 600000 })}
              >
                250K - 600K
              </button>
              <button
                className="chip-btn"
                onClick={() => setPriceRange({ min: 600000, max: 1500000 })}
              >
                &gt; 600K
              </button>
            </div>
          </div>

          {/* Brand Selection */}
          <div className="filter-group">
            <h4 className="filter-group-title">MANUFACTURERS & BRANDS</h4>
            <div className="brand-list">
              {BRANDS.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                const count = PRODUCTS.filter((p) => p.brand === brand).length;
                return (
                  <label key={brand} className="brand-item">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <span className="brand-custom-box" />
                    <span className="brand-name">{brand}</span>
                    <span className="brand-count">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability & Deals */}
          <div className="filter-group">
            <h4 className="filter-group-title">AVAILABILITY & OFFERS</h4>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span className="toggle-switch" />
              <span>In Stock Only</span>
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={dealsOnly}
                onChange={(e) => setDealsOnly(e.target.checked)}
              />
              <span className="toggle-switch" />
              <span>Discounted Deals</span>
            </label>
          </div>

          {/* PCPoint Trust Banner */}
          <div className="pcpoint-trust-box">
            <div className="trust-icon">🇱🇰</div>
            <h4>PCPoint Official Warranty</h4>
            <p>100% genuine products with manufacturer warranty and ticket-based fast claim tracking.</p>
          </div>
        </aside>

        {/* Product Catalog Display Area */}
        <div className="catalog-main">
          {/* Top Bar: Active Chips, Results Count, Sorting & View Toggle */}
          <div className="catalog-controls-bar">
            <div className="results-count">
              <span>Showing <strong>{filteredProducts.length}</strong> of {PRODUCTS.length} products</span>
            </div>

            <div className="controls-right">
              {/* Sort Dropdown */}
              <div className="sort-wrapper">
                <label htmlFor="sort-select">SORT BY:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-dropdown"
                >
                  <option value="featured">Featured / Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="name-az">Name: A to Z</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="view-toggle-wrap">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  ☵
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                  aria-label="List View"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="active-chips-wrap">
              <span className="chips-label">ACTIVE FILTERS:</span>
              {searchTerm && (
                <span className="active-chip">
                  Query: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>×</button>
                </span>
              )}
              {activeCategory !== 'all' && (
                <span className="active-chip">
                  Category: {CATEGORIES.find((c) => c.id === activeCategory)?.name}
                  <button onClick={() => setActiveCategory('all')}>×</button>
                </span>
              )}
              {selectedBrands.map((b) => (
                <span key={b} className="active-chip">
                  Brand: {b}
                  <button onClick={() => handleBrandToggle(b)}>×</button>
                </span>
              ))}
              {(priceRange.min > 0 || priceRange.max < 1500000) && (
                <span className="active-chip">
                  Max: {formatLKR(priceRange.max)}
                  <button onClick={() => setPriceRange({ min: 0, max: 1500000 })}>×</button>
                </span>
              )}
              {inStockOnly && (
                <span className="active-chip">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}>×</button>
                </span>
              )}
              {dealsOnly && (
                <span className="active-chip">
                  Discount Deals
                  <button onClick={() => setDealsOnly(false)}>×</button>
                </span>
              )}
              <button className="clear-all-chip" onClick={clearAllFilters}>
                CLEAR ALL
              </button>
            </div>
          )}

          {/* Empty Results State */}
          {filteredProducts.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-icon">⚠️</div>
              <h3>NO HARDWARE FOUND</h3>
              <p>We couldn't find any components matching your active search and filter combinations.</p>
              <button className="btn btn-primary" onClick={clearAllFilters}>
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            /* Products List / Grid */
            <div className={viewMode === 'grid' ? 'product-grid' : 'product-list-view'}>
              {filteredProducts.map((product) => {
                const kokoMonthly = Math.round(product.price / 3);
                return (
                  <div
                    key={product.id}
                    className={`product-card ${viewMode === 'list' ? 'list-card' : ''}`}
                    onClick={() => {
                      setQuickViewProduct(product);
                      setModalQty(1);
                    }}
                  >
                    {/* Badge */}
                    <div className="prod-badge">{product.badge}</div>

                    {/* Image Container */}
                    <div className="prod-img">
                      <img src={product.img} alt={product.name} loading="lazy" />
                      <button
                        className="quick-view-overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                          setModalQty(1);
                        }}
                      >
                        👁 QUICK SPEC
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="prod-details">
                      <div className="prod-meta-top">
                        <span className="prod-cat">{product.categoryName}</span>
                        <span className="prod-brand-tag">{product.brand}</span>
                      </div>

                      <h3 className="prod-name">{product.name}</h3>
                      <p className="prod-specs">{product.specs}</p>

                      {/* Warranty & Rating */}
                      <div className="prod-badges-row">
                        <span className="warranty-tag">🛡️ {product.warranty}</span>
                        <span className="rating-tag">★ {product.rating} ({product.reviewsCount})</span>
                      </div>

                      {/* Installment Badge */}
                      <div className="koko-installment-badge">
                        <span className="koko-tag">koko</span>
                        <span>Or 3x <strong>{formatLKR(kokoMonthly)}</strong></span>
                      </div>

                      {/* Footer Actions */}
                      <div className="prod-footer">
                        <div className="price-block">
                          {product.oldPrice && (
                            <span className="old-price">{formatLKR(product.oldPrice)}</span>
                          )}
                          <div className="prod-price">{formatLKR(product.price)}</div>
                        </div>
                        <div className="prod-actions-wrap">
                          <button
                            className="btn-spec-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewProduct(product);
                              setModalQty(1);
                            }}
                          >
                            DETAILS
                          </button>
                          <button
                            className="add-btn"
                            aria-label={`Add ${product.name} to cart`}
                            onClick={(e) => handleAddToCart(product, e)}
                            title="Add to Cart"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick View / Spec Modal */}
      {quickViewProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setQuickViewProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close Modal"
            >
              ✕
            </button>

            <div className="modal-body-grid">
              <div className="modal-image-col">
                <div className="modal-img-wrapper">
                  <img src={quickViewProduct.img} alt={quickViewProduct.name} />
                  <span className="modal-badge">{quickViewProduct.badge}</span>
                </div>
                <div className="modal-warranty-box">
                  <div className="warranty-title">🛡️ OFFICIAL HARDWARE WARRANTY</div>
                  <p>{quickViewProduct.warranty}</p>
                  <span className="warranty-sub">Sri Lanka No.1 Ticket Claim Tracking</span>
                </div>
              </div>

              <div className="modal-info-col">
                <div className="modal-category">{quickViewProduct.categoryName} • {quickViewProduct.brand}</div>
                <h2 className="modal-title">{quickViewProduct.name}</h2>

                <div className="modal-rating-row">
                  <span className="stars">★★★★★</span>
                  <span className="rating-num">{quickViewProduct.rating} / 5.0</span>
                  <span className="reviews">({quickViewProduct.reviewsCount} customer reviews)</span>
                  <span className="stock-status in-stock">● In Stock & Ready to Ship</span>
                </div>

                <div className="modal-price-wrap">
                  {quickViewProduct.oldPrice && (
                    <span className="modal-old-price">{formatLKR(quickViewProduct.oldPrice)}</span>
                  )}
                  <span className="modal-main-price">{formatLKR(quickViewProduct.price)}</span>
                </div>

                <div className="modal-koko-banner">
                  <span className="koko-pill">koko</span>
                  <span>
                    Pay <strong>{formatLKR(Math.round(quickViewProduct.price / 3))}</strong> per month for 3 months with 0% interest!
                  </span>
                </div>

                <div className="modal-specs-box">
                  <h4>SPECIFICATION OVERVIEW</h4>
                  <p className="specs-highlight">{quickViewProduct.specs}</p>
                  <p className="description-text">{quickViewProduct.description}</p>
                </div>

                {quickViewProduct.tags && (
                  <div className="modal-tags">
                    {quickViewProduct.tags.map((t) => (
                      <span key={t} className="feature-tag">#{t}</span>
                    ))}
                  </div>
                )}

                <div className="modal-actions-row">
                  <div className="qty-picker">
                    <button
                      onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                      disabled={modalQty <= 1}
                    >
                      -
                    </button>
                    <span>{modalQty}</span>
                    <button onClick={() => setModalQty((q) => q + 1)}>+</button>
                  </div>

                  <button
                    className="btn btn-primary modal-cart-btn"
                    onClick={() => {
                      for (let i = 0; i < modalQty; i++) {
                        if (onAddToCart) onAddToCart(quickViewProduct);
                      }
                      triggerToast(`Added ${modalQty}x "${quickViewProduct.name.slice(0, 20)}..." to cart!`);
                      setQuickViewProduct(null);
                    }}
                  >
                    ADD TO CART • {formatLKR(quickViewProduct.price * modalQty)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="tactical-toast">
          <span className="toast-icon">⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}
