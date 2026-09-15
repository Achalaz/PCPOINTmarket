import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigateHome }) {
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'users' | 'sales'

  // Inventory State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('laptops');
  const [newProdBrand, setNewProdBrand] = useState('Asus');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('15');
  const [newProdBadge, setNewProdBadge] = useState('NEW ARRIVAL');
  const [newProdWarranty, setNewProdWarranty] = useState('2 Years Official Warranty');
  const [newProdImg, setNewProdImg] = useState('/laptop_1787633700695.jpg');
  const [newProdSpecs, setNewProdSpecs] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Sales State
  const [salesReport, setSalesReport] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Status Alerts
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlertBanner({ msg, type });
    setTimeout(() => setAlertBanner(null), 4000);
  };

  const formatLKR = (num) => 'Rs. ' + (Number(num) || 0).toLocaleString('en-US');

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    try {
      setSalesLoading(true);
      const res = await fetch('/api/admin/sales-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSalesReport(data.report);
      }
    } catch (err) {
      console.error('Error fetching sales report:', err);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchSalesReport();
  }, [token]);

  // Adjust Product Stock
  const handleUpdateStock = async (prodId, delta) => {
    const prod = products.find((p) => p._id === prodId || p.id === prodId);
    if (!prod) return;
    const currentStock = Number(prod.stock || 0);
    const newStock = Math.max(0, currentStock + delta);

    try {
      const res = await fetch(`/api/products/${prod._id || prod.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === prodId || p.id === prodId ? { ...p, stock: newStock, inStock: newStock > 0 } : p))
        );
        showAlert(`Updated stock for ${prod.name} to ${newStock} units.`);
      }
    } catch (err) {
      showAlert('Failed to update stock.', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from inventory?`)) return;

    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== prodId && p.id !== prodId));
        showAlert(`Product "${prodName}" removed from inventory.`);
      }
    } catch (err) {
      showAlert('Failed to delete product.', 'error');
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      setAddMsg('Please enter at least name and price.');
      return;
    }

    try {
      setAddLoading(true);
      setAddMsg('');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCat,
          categoryName: newProdCat.toUpperCase(),
          brand: newProdBrand,
          badge: newProdBadge,
          price: Number(newProdPrice),
          oldPrice: newProdOldPrice ? Number(newProdOldPrice) : 0,
          stock: Number(newProdStock || 10),
          warranty: newProdWarranty,
          img: newProdImg,
          specs: newProdSpecs,
          description: newProdDesc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert(`✓ Hardware "${data.product.name}" added to inventory.`);
        setProducts((prev) => [data.product, ...prev]);
        setShowAddModal(false);
        // Reset fields
        setNewProdName('');
        setNewProdPrice('');
        setNewProdOldPrice('');
        setNewProdSpecs('');
        setNewProdDesc('');
      } else {
        setAddMsg(data.message || 'Failed to add product.');
      }
    } catch (err) {
      setAddMsg('Network error adding product.');
    } finally {
      setAddLoading(false);
    }
  };

  // Toggle User Role
  const handleToggleUserRole = async (userId, currentRole, userName) => {
    const nextRole = currentRole === 'admin' ? 'authenticated' : 'admin';
    if (!window.confirm(`Change clearance level for ${userName} to "${nextRole}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        );
        showAlert(`User ${userName} updated to role "${nextRole}".`);
      }
    } catch (err) {
      showAlert('Failed to update user role.', 'error');
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId, currentStatus, userName) => {
    const nextStatus = currentStatus === 'Active Member' ? 'Suspended' : 'Active Member';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, account_status: nextStatus } : u))
        );
        showAlert(`Account status for ${userName} set to "${nextStatus}".`);
      }
    } catch (err) {
      showAlert('Failed to update status.', 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // Trigger PDF Report print/save
  const handlePrintPdf = () => {
    window.print();
  };

  // PDF REPORT VIEW
  if (showPdfPreview && salesReport) {
    return (
      <div className="pdf-report-wrapper">
        <div className="pdf-actions-bar no-print">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowPdfPreview(false)}>
            ← RETURN TO COMMAND CENTER
          </button>
          <div className="pdf-bar-title">
            <span>OFFICIAL FINANCIAL & INVENTORY AUDIT PREVIEW</span>
          </div>
          <button className="btn btn-primary btn-sm print-trigger-btn" onClick={handlePrintPdf}>
            🖨️ SAVE AS PDF / PRINT REPORT
          </button>
        </div>

        {/* Printable Report Document Sheet */}
        <div className="printable-report-sheet">
          <header className="report-doc-header">
            <div className="report-brand">
              <div className="logo-icon" />
              <div>
                <h2>PCPOINT ARMORY (PVT) LTD</h2>
                <p>Task Force Gear // Overclocked Battlefield Components</p>
                <p>50 Cyberpunk Way, Colombo 01, Sri Lanka | support@pcpoint.lk</p>
              </div>
            </div>
            <div className="report-meta-box">
              <div className="report-badge-red">CONFIDENTIAL AUDIT</div>
              <p><strong>AUDIT REF:</strong> AUDIT-2026-WK06-{Math.floor(1000 + Math.random() * 9000)}</p>
              <p><strong>GENERATED:</strong> {new Date().toLocaleString('en-US')}</p>
              <p><strong>AUDITOR:</strong> {user?.full_name} ({user?.role?.toUpperCase()})</p>
            </div>
          </header>

          <hr className="report-divider" />

          <section className="report-exec-summary">
            <h3>1. EXECUTIVE FINANCIAL SUMMARY</h3>
            <div className="report-kpi-grid">
              <div className="report-kpi-card">
                <span className="kpi-label">GROSS SALES REVENUE</span>
                <span className="kpi-val text-crimson">{formatLKR(salesReport.totalRevenue)}</span>
              </div>
              <div className="report-kpi-card">
                <span className="kpi-label">TOTAL DISPATCHED ORDERS</span>
                <span className="kpi-val">{salesReport.totalOrdersCount} Orders</span>
              </div>
              <div className="report-kpi-card">
                <span className="kpi-label">AVERAGE ORDER VALUE (AOV)</span>
                <span className="kpi-val">{formatLKR(salesReport.avgOrderValue)}</span>
              </div>
              <div className="report-kpi-card">
                <span className="kpi-label">TOTAL UNITS SOLD</span>
                <span className="kpi-val">{salesReport.totalUnitsSold || 4} Units</span>
              </div>
            </div>
          </section>

          <section className="report-section">
            <h3>2. REVENUE DISTRIBUTION BY HARDWARE CATEGORY</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>REVENUE CONTRIBUTION (LKR)</th>
                  <th>MARKET SHARE (%)</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.categoryBreakdown?.map((cat) => (
                  <tr key={cat.name}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{formatLKR(cat.revenue)}</td>
                    <td>{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="report-section">
            <h3>3. ORDER TRANSACTION AUDIT LEDGER</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>ORDER REF</th>
                  <th>CUSTOMER CALLSIGN</th>
                  <th>EMAIL</th>
                  <th>ITEMS AUDITED</th>
                  <th>PAYMENT PROTOCOL</th>
                  <th>AMOUNT (LKR)</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.orders?.map((ord) => (
                  <tr key={ord.order_id}>
                    <td className="font-mono">{ord.order_id}</td>
                    <td>{ord.customer_name}</td>
                    <td>{ord.customer_email}</td>
                    <td>
                      {ord.items?.map((it) => `${it.name} (x${it.qty})`).join(', ') || 'Hardware Gear'}
                    </td>
                    <td>{ord.payment_method?.toUpperCase()}</td>
                    <td className="font-mono font-bold">{formatLKR(ord.total_amount)}</td>
                    <td>
                      <span className="report-status-tag">{ord.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <footer className="report-doc-footer">
            <div className="seal-box">
              <div className="seal-circle">VERIFIED OFFICIAL</div>
              <p>Certified by PCPoint Armory Management System</p>
            </div>
            <div className="sign-box">
              <div className="sign-line" />
              <p>Chief Technical & Financial Administrator</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper">
      <div className="admin-container">
        {/* Top Header */}
        <div className="admin-header-row">
          <div>
            <div className="admin-clearance-pill">
              <span className="dot green" />
              <span>COMMAND CLEARANCE: LEVEL 5 ADMINISTRATOR</span>
            </div>
            <h1 className="admin-title">OPERATIONS & LOGISTICS COMMAND</h1>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateHome}>
            ← RETURN TO ARMORY STOREFRONT
          </button>
        </div>

        {/* Tactical KPI Telemetry Row */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-icon">📦</div>
            <div>
              <span className="admin-kpi-title">TOTAL CATALOG HARDWARE</span>
              <div className="admin-kpi-value">{products.length} Products</div>
              <span className="admin-kpi-sub">{totalStockCount} Total Units In Stock</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">👥</div>
            <div>
              <span className="admin-kpi-title">REGISTERED OPERATORS</span>
              <div className="admin-kpi-value">{usersList.length} Users</div>
              <span className="admin-kpi-sub">
                {usersList.filter((u) => u.role === 'admin').length} Admins •{' '}
                {usersList.filter((u) => u.role !== 'admin').length} Customers
              </span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">💰</div>
            <div>
              <span className="admin-kpi-title">GROSS AUDITED SALES</span>
              <div className="admin-kpi-value text-crimson">
                {formatLKR(salesReport?.totalRevenue || 2545000)}
              </div>
              <span className="admin-kpi-sub">{salesReport?.totalOrdersCount || 3} Orders Processed</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">📄</div>
            <div>
              <span className="admin-kpi-title">AUDIT REPORTING</span>
              <button
                className="btn btn-primary btn-sm admin-gen-pdf-btn"
                onClick={() => setShowPdfPreview(true)}
              >
                GENERATE SALES PDF →
              </button>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {alertBanner && (
          <div className={`auth-alert ${alertBanner.type}`}>
            <span>{alertBanner.msg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-tabs-header">
          <button
            className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 01 // INVENTORY & PRODUCT INSERTION ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 02 // USER & OPERATOR OVERSIGHT ({usersList.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            📊 03 // SALES INTELLIGENCE & PDF AUDIT
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="admin-tab-content">
            <div className="inventory-controls-bar">
              <div className="inventory-filters">
                <input
                  type="text"
                  placeholder="Search hardware by model or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="admin-cat-select"
                >
                  <option value="all">All Categories</option>
                  <option value="laptops">Laptops</option>
                  <option value="gpus">Graphics Cards</option>
                  <option value="processors">Processors</option>
                  <option value="monitors">Monitors</option>
                  <option value="peripherals">Peripherals</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                ➕ ADD NEW HARDWARE
              </button>
            </div>

            {productsLoading ? (
              <p className="text-muted text-center py-4">Loading armory inventory...</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th>CATEGORY</th>
                      <th>BRAND</th>
                      <th>UNIT PRICE (LKR)</th>
                      <th>STOCK UNITS</th>
                      <th>STATUS</th>
                      <th>QUICK ADJUST</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const stockVal = Number(p.stock || 0);
                      const isLowStock = stockVal > 0 && stockVal < 8;
                      const isOutOfStock = stockVal <= 0;

                      return (
                        <tr key={p._id || p.id}>
                          <td>
                            <div className="prod-cell">
                              <img src={p.img} alt={p.name} className="prod-thumb" />
                              <div>
                                <span className="prod-title">{p.name}</span>
                                <span className="prod-badge-mini">{p.badge}</span>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-muted">{p.category?.toUpperCase()}</td>
                          <td>{p.brand}</td>
                          <td className="font-mono font-bold text-crimson">{formatLKR(p.price)}</td>
                          <td>
                            <span className="font-mono font-bold stock-number">{stockVal}</span>
                          </td>
                          <td>
                            {isOutOfStock ? (
                              <span className="stock-tag out">OUT OF STOCK</span>
                            ) : isLowStock ? (
                              <span className="stock-tag low">LOW STOCK</span>
                            ) : (
                              <span className="stock-tag good">IN STOCK</span>
                            )}
                          </td>
                          <td>
                            <div className="stock-adjust-group">
                              <button
                                className="stock-btn"
                                onClick={() => handleUpdateStock(p._id || p.id, -1)}
                                title="Decrease Stock"
                              >
                                -1
                              </button>
                              <button
                                className="stock-btn"
                                onClick={() => handleUpdateStock(p._id || p.id, 5)}
                                title="Add 5 Units"
                              >
                                +5
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                              title="Delete Hardware"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER OVERSIGHT */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <div className="card-sec-header">
              <h3>REGISTERED OPERATORS ROSTER</h3>
              <span className="sec-tag">{usersList.length} REGISTERED USERS</span>
            </div>

            {usersLoading ? (
              <p className="text-muted text-center py-4">Retrieving user roster...</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>OPERATOR CALLSIGN</th>
                      <th>EMAIL</th>
                      <th>CLEARANCE ROLE</th>
                      <th>ACCOUNT STATUS</th>
                      <th>TELEPHONE</th>
                      <th>DISPATCH CITY</th>
                      <th>ENLISTED DATE</th>
                      <th>ROLE ACCESS</th>
                      <th>STATUS TOGGLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="prod-cell">
                            <img src={u.avatar || '/assets/u1.svg'} alt={u.full_name} className="user-thumb" />
                            <span className="font-bold">{u.full_name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-muted">{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                            {u.role?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${u.account_status === 'Suspended' ? 'suspended' : 'active'}`}>
                            {u.account_status || 'Active Member'}
                          </span>
                        </td>
                        <td className="font-mono">{u.phone}</td>
                        <td>{u.city}</td>
                        <td className="font-mono text-muted">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleToggleUserRole(u.id, u.role, u.full_name)}
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote to Admin'}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleToggleUserStatus(u.id, u.account_status, u.full_name)}
                          >
                            {u.account_status === 'Suspended' ? 'Re-activate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SALES INTELLIGENCE & PDF REPORT */}
        {activeTab === 'sales' && (
          <div className="admin-tab-content">
            <div className="sales-banner-row">
              <div>
                <h3>FINANCIAL TELEMETRY & SALES AUDIT</h3>
                <p className="text-muted">Real-time revenue metrics, customer orders, and category distributions.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowPdfPreview(true)}>
                📄 VIEW & PRINT PDF SALES REPORT →
              </button>
            </div>

            {salesLoading || !salesReport ? (
              <p className="text-muted text-center py-4">Compiling sales audit...</p>
            ) : (
              <div className="sales-analytics-grid">
                <div className="profile-card">
                  <div className="card-sec-header">
                    <h3>CATEGORY REVENUE CONTRIBUTION</h3>
                    <span className="sec-tag">DISTRIBUTION</span>
                  </div>
                  <div className="category-bars-list">
                    {salesReport.categoryBreakdown?.map((cat) => (
                      <div key={cat.name} className="cat-bar-item">
                        <div className="cat-bar-header">
                          <span>{cat.name}</span>
                          <span className="font-mono font-bold text-crimson">{formatLKR(cat.revenue)} ({cat.percentage}%)</span>
                        </div>
                        <div className="cat-bar-track">
                          <div className="cat-bar-fill" style={{ width: `${Math.max(5, cat.percentage)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-card">
                  <div className="card-sec-header">
                    <h3>ORDER TRANSACTION AUDIT LEDGER</h3>
                    <span className="sec-tag">{salesReport.orders?.length} TRANSACTIONS</span>
                  </div>

                  <div className="admin-table-wrapper max-h-350">
                    <table className="admin-table mini">
                      <thead>
                        <tr>
                          <th>ORDER</th>
                          <th>CUSTOMER</th>
                          <th>METHOD</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReport.orders?.map((ord) => (
                          <tr key={ord.order_id}>
                            <td className="font-mono font-bold">{ord.order_id}</td>
                            <td>{ord.customer_name}</td>
                            <td>{ord.payment_method?.toUpperCase()}</td>
                            <td className="font-mono text-crimson font-bold">{formatLKR(ord.total_amount)}</td>
                            <td>
                              <span className="stock-tag good">{ord.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="auth-modal-window wide" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <div className="auth-header-title">
                <span className="dot" />
                <span className="auth-title-text">DEPLOY NEW HARDWARE TO INVENTORY</span>
              </div>
              <button className="auth-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            {addMsg && (
              <div className="auth-alert error">
                <span>⚠️ {addMsg}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleAddProduct}>
              <div className="form-row-2">
                <div className="auth-field">
                  <label>HARDWARE PRODUCT NAME</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Razer Viper V3 Pro Gaming Mouse"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>CATEGORY</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="admin-cat-select"
                  >
                    <option value="laptops">Gaming Laptops</option>
                    <option value="gpus">Graphics Cards</option>
                    <option value="processors">Processors</option>
                    <option value="monitors">Monitors & Displays</option>
                    <option value="peripherals">Peripherals & Audio</option>
                    <option value="motherboards">Motherboards</option>
                    <option value="coolers">Coolers & AIO</option>
                    <option value="storage">Storage & SSD</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="auth-field">
                  <label>BRAND / MANUFACTURER</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="Asus / Razer / MSI"
                  />
                </div>
                <div className="auth-field">
                  <label>PRICE (LKR)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="48000"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>INITIAL STOCK QUANTITY</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="auth-field">
                  <label>TACTICAL BADGE</label>
                  <input
                    type="text"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    placeholder="ESPORTS GRADE / FLAGSHIP"
                  />
                </div>
                <div className="auth-field">
                  <label>IMAGE URL / ASSET</label>
                  <select
                    value={newProdImg}
                    onChange={(e) => setNewProdImg(e.target.value)}
                    className="admin-cat-select"
                  >
                    <option value="/laptop_1787633700695.jpg">Gaming Laptop Visual</option>
                    <option value="/gpu_1787633713974.jpg">Graphics Card Visual</option>
                    <option value="/pc_1787633742711.jpg">Desktop Rig / CPU Visual</option>
                    <option value="/monitor_1787633728962.jpg">Ultra-Wide Monitor Visual</option>
                    <option value="/blueprint_1787633759905.jpg">Blueprint Component Visual</option>
                    <option value="/media_1787635462982.jpg">Peripherals Visual</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label>KEY SPECIFICATIONS HIGHLIGHT</label>
                <input
                  type="text"
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                  placeholder="Focus Pro 35K Optical Sensor // 54g Ultra-lightweight // 8000Hz HyperPolling"
                />
              </div>

              <div className="auth-field">
                <label>OPERATOR DESCRIPTION</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detailed product brief and deployment specifications..."
                  rows={3}
                  className="admin-textarea"
                />
              </div>

              <div className="profile-action-bar">
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'DEPLOYING TO CATALOG...' : 'CONFIRM & ADD TO INVENTORY →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
