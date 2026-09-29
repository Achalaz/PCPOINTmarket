import { useState, useMemo } from 'react';
import { PRODUCTS } from '../data';

/* ─── PC Part Categories ─── */
const BUILDER_CATEGORIES = [
  { id: 'processors',   label: 'CPU',         icon: '🔲', hint: 'Central Processing Unit',  required: true  },
  { id: 'gpus',         label: 'GPU',         icon: '🎮', hint: 'Graphics Card',             required: true  },
  { id: 'motherboards', label: 'Motherboard', icon: '📋', hint: 'ATX / mATX / ITX',         required: true  },
  { id: 'ram',          label: 'RAM',         icon: '💾', hint: 'System Memory',             required: true  },
  { id: 'storage',      label: 'Storage',     icon: '💿', hint: 'SSD / NVMe / HDD',         required: true  },
  { id: 'psu',          label: 'PSU',         icon: '⚡', hint: 'Power Supply Unit',        required: true  },
  { id: 'cases',        label: 'Case',        icon: '🖥', hint: 'PC Chassis / Tower',       required: false },
  { id: 'coolers',      label: 'Cooling',     icon: '❄', hint: 'CPU Cooler / AIO Liquid',  required: false },
];

/* ─── Fallback parts for categories with no products in DB ─── */
const FALLBACK_PARTS = {
  processors: [
    { id: 'cpu-f1', name: 'Intel Core i9-14900K', brand: 'Intel', price: 215000, specs: '24 Cores / 6.0GHz Turbo / LGA1700', badge: 'MAX PERFORMANCE', img: '/pc_1787633742711.jpg', category: 'processors', categoryName: 'PROCESSOR', inStock: true },
    { id: 'cpu-f2', name: 'Intel Core i7-14700K', brand: 'Intel', price: 149000, specs: '20 Cores / 5.6GHz Turbo / LGA1700', badge: 'BEST VALUE', img: '/pc_1787633742711.jpg', category: 'processors', categoryName: 'PROCESSOR', inStock: true },
    { id: 'cpu-f3', name: 'AMD Ryzen 9 7950X', brand: 'AMD', price: 195000, specs: '16 Cores / 5.7GHz Boost / AM5', badge: 'WORKSTATION KING', img: '/pc_1787633742711.jpg', category: 'processors', categoryName: 'PROCESSOR', inStock: true },
    { id: 'cpu-f4', name: 'AMD Ryzen 5 7600X', brand: 'AMD', price: 82000, specs: '6 Cores / 5.3GHz Boost / AM5', badge: 'BUDGET BEAST', img: '/pc_1787633742711.jpg', category: 'processors', categoryName: 'PROCESSOR', inStock: true },
  ],
  gpus: [
    { id: 'gpu-f1', name: 'ASUS ROG RTX 4090 24GB', brand: 'Asus', price: 895000, specs: '24GB GDDR6X / 384-bit / DLSS 3.5', badge: 'GOD TIER', img: '/gpu_1787633713974.jpg', category: 'gpus', categoryName: 'GRAPHICS CARD', inStock: true },
    { id: 'gpu-f2', name: 'MSI RTX 4070 Ti SUPER 16GB', brand: 'MSI', price: 365000, specs: '16GB GDDR6X / 256-bit / DLSS 3.5', badge: 'POPULAR', img: '/gpu_1787633713974.jpg', category: 'gpus', categoryName: 'GRAPHICS CARD', inStock: true },
    { id: 'gpu-f3', name: 'Asus RTX 4060 Ti 8GB', brand: 'Asus', price: 195000, specs: '8GB GDDR6 / 128-bit / DLSS 3', badge: 'MID-RANGE', img: '/gpu_1787633713974.jpg', category: 'gpus', categoryName: 'GRAPHICS CARD', inStock: true },
    { id: 'gpu-f4', name: 'AMD Radeon RX 7900 XTX 24GB', brand: 'AMD', price: 445000, specs: '24GB GDDR6 / 384-bit / FSR 3', badge: 'AMD CHAMPION', img: '/gpu_1787633713974.jpg', category: 'gpus', categoryName: 'GRAPHICS CARD', inStock: true },
  ],
  motherboards: [
    { id: 'mb-f1', name: 'ASUS ROG Maximus Z790 Hero', brand: 'Asus', price: 185000, specs: 'LGA1700 / DDR5 / PCIe 5.0 / WiFi 6E / ATX', badge: 'FLAGSHIP', img: '/blueprint_1787633759905.jpg', category: 'motherboards', categoryName: 'MOTHERBOARD', inStock: true },
    { id: 'mb-f2', name: 'MSI MEG Z790 ACE', brand: 'MSI', price: 145000, specs: 'LGA1700 / DDR5 / PCIe 5.0 / WiFi 6E / ATX', badge: 'PREMIUM', img: '/blueprint_1787633759905.jpg', category: 'motherboards', categoryName: 'MOTHERBOARD', inStock: true },
    { id: 'mb-f3', name: 'Gigabyte B650 AORUS Elite', brand: 'Gigabyte', price: 75000, specs: 'AM5 / DDR5 / PCIe 4.0 / WiFi 6 / ATX', badge: 'VALUE KING', img: '/blueprint_1787633759905.jpg', category: 'motherboards', categoryName: 'MOTHERBOARD', inStock: true },
    { id: 'mb-f4', name: 'ASRock Z790 Steel Legend WiFi', brand: 'ASRock', price: 65000, specs: 'LGA1700 / DDR5 / PCIe 5.0 / WiFi 6E / ATX', badge: 'BUDGET PICK', img: '/blueprint_1787633759905.jpg', category: 'motherboards', categoryName: 'MOTHERBOARD', inStock: true },
  ],
  ram: [
    { id: 'ram-f1', name: 'Corsair Dominator Titanium 64GB DDR5', brand: 'Corsair', price: 98000, specs: '64GB (2x32GB) / DDR5-6000 / CL30 / RGB', badge: 'MAX CAPACITY', img: '/media_1787635448546.jpg', category: 'ram', categoryName: 'RAM', inStock: true },
    { id: 'ram-f2', name: 'G.Skill Trident Z5 32GB DDR5', brand: 'G.Skill', price: 55000, specs: '32GB (2x16GB) / DDR5-6400 / CL32 / RGB', badge: 'PERFORMANCE', img: '/media_1787635448546.jpg', category: 'ram', categoryName: 'RAM', inStock: true },
    { id: 'ram-f3', name: 'Kingston Fury Beast 16GB DDR5', brand: 'Kingston', price: 28000, specs: '16GB (2x8GB) / DDR5-5200 / CL40', badge: 'BUDGET VALUE', img: '/media_1787635448546.jpg', category: 'ram', categoryName: 'RAM', inStock: true },
    { id: 'ram-f4', name: 'Crucial Pro 32GB DDR5', brand: 'Crucial', price: 45000, specs: '32GB (2x16GB) / DDR5-5600 / CL46', badge: 'RELIABLE', img: '/media_1787635448546.jpg', category: 'ram', categoryName: 'RAM', inStock: true },
  ],
  storage: [
    { id: 'sto-f1', name: 'Samsung 990 Pro 2TB NVMe SSD', brand: 'Samsung', price: 65000, specs: '2TB / PCIe 4.0 / 7450MB/s Read / M.2 2280', badge: 'SPEED DEMON', img: '/media_1787635454440.jpg', category: 'storage', categoryName: 'STORAGE', inStock: true },
    { id: 'sto-f2', name: 'WD Black SN850X 1TB NVMe', brand: 'Western Digital', price: 38000, specs: '1TB / PCIe 4.0 / 7300MB/s Read / M.2 2280', badge: 'GAME DRIVE', img: '/media_1787635454440.jpg', category: 'storage', categoryName: 'STORAGE', inStock: true },
    { id: 'sto-f3', name: 'Seagate BarraCuda 4TB HDD', brand: 'Seagate', price: 22000, specs: '4TB / SATA III / 5400RPM / 256MB Cache', badge: 'MASS STORAGE', img: '/media_1787635454440.jpg', category: 'storage', categoryName: 'STORAGE', inStock: true },
    { id: 'sto-f4', name: 'Addlink S90 1TB NVMe SSD', brand: 'Addlink', price: 24000, specs: '1TB / PCIe 4.0 / 7100MB/s Read / M.2 2280', badge: 'LOCAL FAVORITE', img: '/media_1787635454440.jpg', category: 'storage', categoryName: 'STORAGE', inStock: true },
  ],
  psu: [
    { id: 'psu-f1', name: 'Corsair RM1000x Shift 1000W', brand: 'Corsair', price: 72000, specs: '1000W / 80+ Gold / Fully Modular / ATX 3.0', badge: 'FLAGSHIP', img: '/media_1787635462982.jpg', category: 'psu', categoryName: 'PSU', inStock: true },
    { id: 'psu-f2', name: 'Seasonic Focus GX-850 850W', brand: 'Seasonic', price: 52000, specs: '850W / 80+ Gold / Full Modular / ATX', badge: 'RELIABLE', img: '/media_1787635462982.jpg', category: 'psu', categoryName: 'PSU', inStock: true },
    { id: 'psu-f3', name: 'Thermaltake Toughpower GF3 750W', brand: 'Thermaltake', price: 38000, specs: '750W / 80+ Gold / Modular / PCIe 5.0', badge: 'VALUE', img: '/media_1787635462982.jpg', category: 'psu', categoryName: 'PSU', inStock: true },
    { id: 'psu-f4', name: 'EVGA SuperNOVA 650 G6 650W', brand: 'EVGA', price: 28000, specs: '650W / 80+ Gold / Fully Modular / Compact', badge: 'BUDGET GOLD', img: '/media_1787635462982.jpg', category: 'psu', categoryName: 'PSU', inStock: true },
  ],
  cases: [
    { id: 'case-f1', name: 'Lian Li O11 Dynamic EVO XL', brand: 'Lian Li', price: 58000, specs: 'Full Tower / Tempered Glass / E-ATX / RGB', badge: 'SHOWPIECE', img: '/media_1787635462982.jpg', category: 'cases', categoryName: 'CASE', inStock: true },
    { id: 'case-f2', name: 'Fractal Design Torrent Compact', brand: 'Fractal Design', price: 38000, specs: 'Mid Tower / Mesh Front / ATX / High Airflow', badge: 'AIRFLOW KING', img: '/media_1787635462982.jpg', category: 'cases', categoryName: 'CASE', inStock: true },
    { id: 'case-f3', name: 'NZXT H7 Flow RGB', brand: 'NZXT', price: 32000, specs: 'Mid Tower / Tempered Glass / ATX / Cable Mgmt', badge: 'CLEAN BUILD', img: '/media_1787635462982.jpg', category: 'cases', categoryName: 'CASE', inStock: true },
    { id: 'case-f4', name: 'Thermaltake View 51 Panoramic', brand: 'Thermaltake', price: 45000, specs: 'Full Tower / 4-Side Tempered Glass / E-ATX', badge: 'PANORAMIC', img: '/media_1787635462982.jpg', category: 'cases', categoryName: 'CASE', inStock: true },
  ],
  coolers: [
    { id: 'cool-f1', name: 'ASUS ROG Ryujin III 360 AIO', brand: 'Asus', price: 65000, specs: '360mm AIO / LCD Head / 3x 120mm Fan / ARGB', badge: 'PREMIUM AIO', img: '/media_1787635454440.jpg', category: 'coolers', categoryName: 'COOLING', inStock: true },
    { id: 'cool-f2', name: 'Arctic Liquid Freezer III 240', brand: 'Arctic', price: 28000, specs: '240mm AIO / High Perf Pump / 2x 120mm Fan', badge: 'BEST VALUE AIO', img: '/media_1787635454440.jpg', category: 'coolers', categoryName: 'COOLING', inStock: true },
    { id: 'cool-f3', name: 'Noctua NH-D15 chromax.black', brand: 'Noctua', price: 22000, specs: 'Air Cooler / Dual Tower / 2x 140mm Fan', badge: 'AIR KING', img: '/media_1787635454440.jpg', category: 'coolers', categoryName: 'COOLING', inStock: true },
    { id: 'cool-f4', name: 'Corsair iCUE H150i Elite 360', brand: 'Corsair', price: 55000, specs: '360mm AIO / iCUE RGB / 3x 120mm LL120 Fan', badge: 'RGB CHAMPION', img: '/media_1787635454440.jpg', category: 'coolers', categoryName: 'COOLING', inStock: true },
  ],
};

const formatLKR = (n) => 'Rs. ' + n.toLocaleString('en-US');

export default function PCBuilder({ onNavigateHome, onAddToCart }) {
  const [activeCat, setActiveCat] = useState('processors');
  const [selectedParts, setSelectedParts] = useState({});
  const [showQuotation, setShowQuotation] = useState(false);
  const [search, setSearch] = useState('');
  const [addedAll, setAddedAll] = useState(false);

  const getPartsForCategory = (catId) => {
    const fromDB = PRODUCTS.filter((p) => p.category === catId);
    if (fromDB.length > 0) return fromDB;
    return FALLBACK_PARTS[catId] || [];
  };

  const filteredParts = useMemo(() => {
    const parts = getPartsForCategory(activeCat);
    if (!search.trim()) return parts;
    const q = search.toLowerCase();
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.specs && p.specs.toLowerCase().includes(q))
    );
  }, [activeCat, search]);

  const selectPart = (part) => {
    setSelectedParts((prev) => ({ ...prev, [part.category]: part }));
    const currentIdx = BUILDER_CATEGORIES.findIndex((c) => c.id === activeCat);
    if (currentIdx < BUILDER_CATEGORIES.length - 1) {
      setTimeout(() => {
        setActiveCat(BUILDER_CATEGORIES[currentIdx + 1].id);
        setSearch('');
      }, 350);
    }
  };

  const removePart = (catId) => {
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
    setAddedAll(false);
  };

  const totalCost = Object.values(selectedParts).reduce((s, p) => s + p.price, 0);
  const selectedCount = Object.keys(selectedParts).length;
  const requiredCats = BUILDER_CATEGORIES.filter((c) => c.required);
  const requiredFilled = requiredCats.every((c) => selectedParts[c.id]);

  const handleGenerateQuote = () => {
    setShowQuotation(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddAllToCart = () => {
    Object.values(selectedParts).forEach((part) => {
      if (onAddToCart) onAddToCart(part);
    });
    setAddedAll(true);
  };

  const handleReset = () => {
    setSelectedParts({});
    setShowQuotation(false);
    setAddedAll(false);
    setActiveCat('processors');
    setSearch('');
  };

  /* ─── QUOTATION VIEW ─── */
  if (showQuotation) {
    const kokoInstallment = Math.round(totalCost / 3);
    const quoteRef = 'PCB-' + Date.now().toString().slice(-8);
    const quoteDate = new Date().toLocaleDateString('en-LK', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
      <div className="pcb-page" id="pcbuilder-quotation">
        <div className="pcb-quote-wrap">
          {/* Header */}
          <div className="pcb-quote-header">
            <div className="pcb-quote-brand">
              <div className="pcb-quote-logo-row">
                <div className="logo-icon" />
                <span className="pcb-quote-logo">PCPoint <span className="pcb-quote-sub">ARMORY</span></span>
              </div>
              <div className="pcb-quote-tagline">Sri Lanka's Premier Gaming Hardware Hub</div>
            </div>
            <div className="pcb-quote-meta">
              <div className="pcb-quote-title">CUSTOM BUILD QUOTATION</div>
              <div className="pcb-quote-id">REF: {quoteRef}</div>
              <div className="pcb-quote-date">{quoteDate}</div>
            </div>
          </div>

          <div className="pcb-quote-divider" />

          {/* Parts Table */}
          <div className="pcb-quote-section-label">SELECTED COMPONENTS</div>
          <table className="pcb-quote-table">
            <thead>
              <tr>
                <th>#</th>
                <th>TYPE</th>
                <th>PART / MODEL</th>
                <th>SPECIFICATIONS</th>
                <th>PRICE (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {BUILDER_CATEGORIES.map((cat, i) => {
                const part = selectedParts[cat.id];
                if (!part) return null;
                return (
                  <tr key={cat.id}>
                    <td className="pcb-qt-num">{i + 1}</td>
                    <td className="pcb-qt-cat">
                      <span className="pcb-qt-icon">{cat.icon}</span> {cat.label}
                    </td>
                    <td className="pcb-qt-name">
                      <div className="pcb-qt-pname">{part.name}</div>
                      <div className="pcb-qt-brand">{part.brand}</div>
                    </td>
                    <td className="pcb-qt-specs">{part.specs}</td>
                    <td className="pcb-qt-price">{formatLKR(part.price)}</td>
                  </tr>
                );
              })}
              {BUILDER_CATEGORIES.filter((c) => !selectedParts[c.id]).map((cat) => (
                <tr key={cat.id} className="pcb-qt-skipped">
                  <td className="pcb-qt-num">—</td>
                  <td className="pcb-qt-cat">
                    <span className="pcb-qt-icon">{cat.icon}</span> {cat.label}
                  </td>
                  <td colSpan={2} className="pcb-qt-notsel">Not Selected</td>
                  <td className="pcb-qt-price pcb-qt-dash">—</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pcb-quote-divider" />

          {/* Totals */}
          <div className="pcb-quote-totals">
            <div className="pcb-qt-total-row">
              <span>Subtotal ({selectedCount} component{selectedCount !== 1 ? 's' : ''})</span>
              <span>{formatLKR(totalCost)}</span>
            </div>
            <div className="pcb-qt-total-row muted">
              <span>Professional Assembly & Stress Testing</span>
              <span className="pcb-qt-free">FREE</span>
            </div>
            <div className="pcb-qt-total-row muted">
              <span>Island-wide Express Delivery</span>
              <span className="pcb-qt-free">FREE</span>
            </div>
            <div className="pcb-qt-grand-total">
              <span>TOTAL ESTIMATED COST</span>
              <span className="pcb-qt-grand-val">{formatLKR(totalCost)}</span>
            </div>
            <div className="pcb-qt-koko">
              <span className="koko-pill">koko</span>
              <span>
                Or 3 interest-free installments of{' '}
                <strong>{formatLKR(kokoInstallment)}</strong> per month
              </span>
            </div>
          </div>

          <div className="pcb-quote-divider" />

          {/* Terms */}
          <div className="pcb-quote-section-label">TERMS & CONDITIONS</div>
          <ul className="pcb-quote-terms">
            <li>Prices are valid for 7 days from the date of this quotation.</li>
            <li>All parts carry official manufacturer warranty as listed.</li>
            <li>Assembly & stress-testing is included at no extra charge.</li>
            <li>Final invoice may vary based on stock availability at time of order.</li>
            <li>Koko installments subject to Koko's terms and credit approval.</li>
          </ul>

          {/* Actions */}
          <div className="pcb-quote-actions no-print">
            <button className="btn btn-primary" onClick={handleAddAllToCart} disabled={addedAll}>
              {addedAll ? '✓ ALL PARTS ADDED TO CART' : '🛒 ADD ALL PARTS TO CART'}
            </button>
            <button className="btn btn-outline" onClick={() => window.print()}>
              PRINT / SAVE PDF
            </button>
            <button className="btn btn-secondary" onClick={() => setShowQuotation(false)}>
              BACK TO BUILDER
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              NEW BUILD
            </button>
          </div>

          <div className="pcb-quote-footer no-print">
            <span>PCPoint Armory &copy; {new Date().getFullYear()}</span>
            <span>contact@pcpoint.lk</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── BUILDER VIEW ─── */
  return (
    <div className="pcb-page" id="pcbuilder-section">
      {/* Page Header */}
      <div className="pcb-header">
        <button className="pcb-back-btn" onClick={onNavigateHome}>
          &larr; BACK TO ARMORY
        </button>
        <div className="pcb-header-content">
          <div className="section-badge">// PC BUILD CONFIGURATOR</div>
          <h1 className="pcb-title">BUILD YOUR WEAPON</h1>
          <p className="pcb-subtitle">
            Select components across 8 categories. We'll generate a full itemized quotation with
            total cost, warranty coverage, and Koko installment breakdown.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="pcb-summary-bar">
          <div className="pcb-summary-parts">
            {BUILDER_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`pcb-summary-slot ${selectedParts[cat.id] ? 'filled' : ''} ${activeCat === cat.id ? 'active' : ''}`}
                onClick={() => { setActiveCat(cat.id); setSearch(''); }}
                title={cat.label}
              >
                <span className="pcb-slot-icon">{cat.icon}</span>
                <span className="pcb-slot-label">{cat.label}</span>
                <span className="pcb-slot-status">
                  {selectedParts[cat.id] ? (
                    <span className="pcb-slot-check">&#10003;</span>
                  ) : (
                    <span className="pcb-slot-empty">{cat.required ? '!' : '?'}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="pcb-summary-cost">
            <div className="pcb-cost-label">ESTIMATED TOTAL</div>
            <div className="pcb-cost-val">{totalCost > 0 ? formatLKR(totalCost) : 'Rs. 0'}</div>
            {totalCost > 0 && (
              <div className="pcb-cost-koko">
                <span className="koko-pill">koko</span>
                <span>{formatLKR(Math.round(totalCost / 3))} &times; 3</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pcb-layout">
        {/* LEFT: Sidebar */}
        <aside className="pcb-sidebar">
          <div className="pcb-sidebar-title">COMPONENTS</div>
          {BUILDER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`pcb-cat-tab ${activeCat === cat.id ? 'active' : ''} ${selectedParts[cat.id] ? 'done' : ''}`}
              onClick={() => { setActiveCat(cat.id); setSearch(''); }}
            >
              <span className="pcb-tab-icon">{cat.icon}</span>
              <div className="pcb-tab-text">
                <span className="pcb-tab-label">{cat.label}</span>
                <span className="pcb-tab-hint">
                  {selectedParts[cat.id]
                    ? <span className="pcb-tab-selected-name">{selectedParts[cat.id].name.slice(0, 22)}&hellip;</span>
                    : cat.hint}
                </span>
              </div>
              <span className="pcb-tab-status">
                {selectedParts[cat.id] ? (
                  <span className="pcb-status-check">&#10003;</span>
                ) : cat.required ? (
                  <span className="pcb-status-req">REQ</span>
                ) : (
                  <span className="pcb-status-opt">OPT</span>
                )}
              </span>
            </button>
          ))}

          {selectedCount > 0 && (
            <div className="pcb-sidebar-build">
              <div className="pcb-sidebar-build-title">YOUR BUILD ({selectedCount})</div>
              {Object.values(selectedParts).map((part) => (
                <div key={part.id} className="pcb-sidebar-build-item">
                  <span className="pcb-sbi-name">{part.name.slice(0, 22)}&hellip;</span>
                  <div className="pcb-sbi-row">
                    <span className="pcb-sbi-price">{formatLKR(part.price)}</span>
                    <button className="pcb-sbi-remove" onClick={() => removePart(part.category)} title="Remove">
                      &times;
                    </button>
                  </div>
                </div>
              ))}
              <div className="pcb-sidebar-total">
                <span>TOTAL</span>
                <span className="pcb-sidebar-total-val">{formatLKR(totalCost)}</span>
              </div>
              {requiredFilled ? (
                <button className="btn btn-primary pcb-gen-btn" onClick={handleGenerateQuote}>
                  GENERATE QUOTATION &rarr;
                </button>
              ) : (
                <div className="pcb-required-hint">
                  Fill all REQ components to generate a quotation
                </div>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT: Product Grid */}
        <main className="pcb-main">
          <div className="pcb-main-header">
            {(() => {
              const cat = BUILDER_CATEGORIES.find((c) => c.id === activeCat);
              return (
                <>
                  <div className="pcb-main-cat-title">
                    <span className="pcb-main-cat-icon">{cat.icon}</span>
                    <div>
                      <div className="pcb-main-cat-label">SELECT {cat.label.toUpperCase()}</div>
                      <div className="pcb-main-cat-hint">{cat.hint}</div>
                    </div>
                    {selectedParts[activeCat] && (
                      <div className="pcb-main-current">
                        <span className="pcb-main-current-label">CURRENT:</span>
                        <span className="pcb-main-current-name">{selectedParts[activeCat].name}</span>
                        <button className="pcb-remove-btn" onClick={() => removePart(activeCat)}>
                          REMOVE
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pcb-search-wrap">
                    <input
                      className="pcb-search"
                      type="text"
                      placeholder={`Search ${cat.label}s...`}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      id="pcb-part-search"
                    />
                    {search && (
                      <button className="pcb-search-clear" onClick={() => setSearch('')}>&times;</button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="pcb-parts-grid">
            {filteredParts.length === 0 ? (
              <div className="pcb-no-parts">
                <div className="pcb-no-parts-icon">&#128269;</div>
                <div>No parts found matching &ldquo;{search}&rdquo;</div>
              </div>
            ) : (
              filteredParts.map((part) => {
                const isSelected = selectedParts[part.category]?.id === part.id;
                return (
                  <div
                    key={part.id}
                    className={`pcb-part-card ${isSelected ? 'selected' : ''} ${!part.inStock ? 'out-of-stock' : ''}`}
                  >
                    {isSelected && <div className="pcb-selected-ribbon">SELECTED</div>}
                    {part.badge && <div className="pcb-part-badge">{part.badge}</div>}
                    <img src={part.img} alt={part.name} className="pcb-part-img" />
                    <div className="pcb-part-info">
                      <div className="pcb-part-brand">{part.brand}</div>
                      <h3 className="pcb-part-name">{part.name}</h3>
                      <p className="pcb-part-specs">{part.specs}</p>
                      <div className="pcb-part-footer">
                        <div className="pcb-part-price">{formatLKR(part.price)}</div>
                        {part.inStock ? (
                          <button
                            className={`pcb-select-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isSelected && selectPart(part)}
                          >
                            {isSelected ? '&#10003; SELECTED' : 'SELECT PART'}
                          </button>
                        ) : (
                          <span className="pcb-out-of-stock-tag">OUT OF STOCK</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {requiredFilled && (
            <div className="pcb-cta-bar">
              <div className="pcb-cta-summary">
                <span>{selectedCount} parts selected</span>
                <span className="pcb-cta-total">{formatLKR(totalCost)}</span>
              </div>
              <button className="btn btn-primary pcb-cta-btn" onClick={handleGenerateQuote}>
                GENERATE QUOTATION &rarr;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
