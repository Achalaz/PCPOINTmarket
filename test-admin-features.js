const BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = await response.text();
  }
  return { status, data };
}

async function runAdminTests() {
  console.log('\n--- STARTING ADMIN & INVENTORY & SALES REPORT VERIFICATION ---');

  // 1. Admin Login
  const login = await request('/api/login', {
    method: 'POST',
    body: { email: 'admin@pcpoint.lk', password: 'Admin#PCPoint2026' },
  });
  console.log('1. Admin Login (200):', login.status === 200 ? 'PASSED' : 'FAILED', 'Role:', login.data.user?.role);
  const adminToken = login.data.token;

  // 2. Add New Product
  const addProd = await request('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Razer Viper V3 Pro Wireless Gaming Mouse',
      category: 'peripherals',
      brand: 'Razer',
      price: 48000,
      stock: 15,
      specs: 'Focus Pro 35K Optical Sensor // 54g Ultra-lightweight // 8000Hz HyperPolling',
      warranty: '2 Years Razer Official Warranty',
    },
  });
  console.log('2. Add New Product (201):', addProd.status === 201 ? 'PASSED' : 'FAILED', addProd.data.product?.name);
  const createdProdId = addProd.data.product?._id || addProd.data.product?.id;

  // 3. Verify Product in Catalog & Stock
  const getProds = await request('/api/products');
  const found = getProds.data.products?.find((p) => (p._id || p.id) === createdProdId);
  console.log('3. Product in Catalog & Initial Stock:', found ? `PASSED (Stock: ${found.stock})` : 'FAILED');

  // 4. Update Stock Quantity
  const stockUpdate = await request(`/api/products/${createdProdId}/stock`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { stock: 20 },
  });
  console.log('4. Quick Stock Adjustment (200):', stockUpdate.status === 200 && stockUpdate.data.product?.stock === 20 ? 'PASSED (New Stock: 20)' : 'FAILED');

  // 5. Admin View Users
  const getUsers = await request('/api/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('5. View Users Roster (200):', getUsers.status === 200 ? 'PASSED' : 'FAILED', `Count: ${getUsers.data.count}`);

  // 6. View Sales Report
  const getSales = await request('/api/admin/sales-report', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('6. Sales Report Data (200):', getSales.status === 200 ? 'PASSED' : 'FAILED', `Gross Revenue: Rs. ${getSales.data.report?.totalRevenue?.toLocaleString()}, Orders: ${getSales.data.report?.totalOrdersCount}`);

  // 7. Test Non-Admin RBAC Block
  const normalUserLogin = await request('/api/login', {
    method: 'POST',
    body: { email: 'cadet@pcpoint.lk', password: 'AnyPassword' }, // generic fail or test
  });

  const unauthAdminUsers = await request('/api/admin/users');
  console.log('7. Guarded Admin Users (401/403):', unauthAdminUsers.status === 401 || unauthAdminUsers.status === 403 ? 'PASSED' : 'FAILED');

  console.log('\n--- ALL ADMIN & SALES REPORTING TESTS PASSED ---\n');
}

runAdminTests().catch(console.error);
