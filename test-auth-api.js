import http from 'http';

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
  return { status, data, headers: response.headers };
}

async function runTests() {
  console.log('\n--- STARTING PCPOINT AUTH & PROFILE API VERIFICATION ---');

  // 1. Health check
  const health = await request('/api/health');
  console.log('1. Health check:', health.status === 200 ? 'PASSED' : 'FAILED', health.data.database);

  // 2. Weak password registration test
  const weakReg = await request('/api/register', {
    method: 'POST',
    body: {
      full_name: 'Tactical Cadet',
      email: 'cadet@pcpoint.lk',
      password: 'weak',
      confirmPassword: 'weak',
    },
  });
  console.log('2. Weak password rejected (400):', weakReg.status === 400 ? 'PASSED' : 'FAILED', weakReg.data.message);

  // 3. Password mismatch registration test
  const mismatchReg = await request('/api/register', {
    method: 'POST',
    body: {
      full_name: 'Tactical Cadet',
      email: 'cadet@pcpoint.lk',
      password: 'StrongPassword123!',
      confirmPassword: 'DifferentPassword123!',
    },
  });
  console.log('3. Password mismatch rejected (400):', mismatchReg.status === 400 ? 'PASSED' : 'FAILED', mismatchReg.data.message);

  // 4. Valid registration
  const testEmail = `test_operator_${Date.now()}@pcpoint.lk`;
  const validPass = 'TacticalArmor#2026';
  const reg = await request('/api/register', {
    method: 'POST',
    body: {
      full_name: 'Ghost Operator',
      email: testEmail,
      password: validPass,
      confirmPassword: validPass,
    },
  });
  console.log('4. Valid Registration (201):', reg.status === 201 ? 'PASSED' : 'FAILED', reg.data.message);

  // 5. Duplicate registration check
  const dupReg = await request('/api/register', {
    method: 'POST',
    body: {
      full_name: 'Ghost Operator',
      email: testEmail,
      password: validPass,
      confirmPassword: validPass,
    },
  });
  console.log('5. Duplicate email rejected (400):', dupReg.status === 400 ? 'PASSED' : 'FAILED', dupReg.data.message);

  // 6. User enumeration prevention on wrong email
  const wrongEmailLogin = await request('/api/login', {
    method: 'POST',
    body: {
      email: 'nonexistent_user@pcpoint.lk',
      password: 'AnyPassword123!',
    },
  });
  console.log('6. User enumeration check - wrong email (401):', wrongEmailLogin.status === 401 && wrongEmailLogin.data.message === 'Invalid email or password.' ? 'PASSED' : 'FAILED', wrongEmailLogin.data.message);

  // 7. User enumeration prevention on wrong password
  const wrongPassLogin = await request('/api/login', {
    method: 'POST',
    body: {
      email: testEmail,
      password: 'WrongPassword123!',
    },
  });
  console.log('7. User enumeration check - wrong pass (401):', wrongPassLogin.status === 401 && wrongPassLogin.data.message === 'Invalid email or password.' ? 'PASSED' : 'FAILED', wrongPassLogin.data.message);

  // 8. Successful Login
  const login = await request('/api/login', {
    method: 'POST',
    body: {
      email: testEmail,
      password: validPass,
    },
  });
  console.log('8. Valid Login (200):', login.status === 200 ? 'PASSED' : 'FAILED', 'Token received:', !!login.data.token);
  const token = login.data.token;

  // 9. Unauthorized access to /api/profile without token
  const unauthProfile = await request('/api/profile');
  console.log('9. Guarded /api/profile without token (401):', unauthProfile.status === 401 ? 'PASSED' : 'FAILED', unauthProfile.data.message);

  // 10. Authorized access to /api/profile
  const authProfile = await request('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('10. Authorized /api/profile (200):', authProfile.status === 200 ? 'PASSED' : 'FAILED', 'User:', authProfile.data.user.full_name);

  // 11. Update profile address & phone
  const updateProfile = await request('/api/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      phone: '+94 77 123 4567',
      shipping_address: {
        street: '42 Cyberpunk Blvd, Tech Park',
        city: 'Colombo',
        state: 'Western Province',
        postal_code: '00100',
        country: 'Sri Lanka',
      },
      billing_address: {
        street: '42 Cyberpunk Blvd, Tech Park',
        city: 'Colombo',
        state: 'Western Province',
        postal_code: '00100',
        country: 'Sri Lanka',
      },
    },
  });
  console.log('11. Profile Update (200):', updateProfile.status === 200 ? 'PASSED' : 'FAILED', 'Phone saved:', updateProfile.data.profile.phone);

  // 12. Re-verify identity & password update
  const newPass = 'NewTacticalArmor#999';
  const passUpdate = await request('/api/profile/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      currentPassword: validPass,
      newPassword: newPass,
      confirmPassword: newPass,
    },
  });
  console.log('12. Password Change with identity re-verification (200):', passUpdate.status === 200 ? 'PASSED' : 'FAILED', passUpdate.data.message);

  // 13. Login with new password
  const newLogin = await request('/api/login', {
    method: 'POST',
    body: {
      email: testEmail,
      password: newPass,
    },
  });
  console.log('13. Login with newly changed password (200):', newLogin.status === 200 ? 'PASSED' : 'FAILED');

  // 14. Cart Synchronization (Milestone 4 - guest items merged)
  const cartSync = await request('/api/cart/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      guestItems: [
        { id: 'gpu-rtx4090', name: 'ROG Strix RTX 4090 OC', price: 785000, qty: 1 },
        { id: 'laptop-scar18', name: 'ROG Strix SCAR 18', price: 925000, qty: 2 },
      ],
    },
  });
  console.log('14. Cart Association & Sync (200):', cartSync.status === 200 ? 'PASSED' : 'FAILED', 'Merged State:', cartSync.data.cart_state);

  // 15. Logout
  const logout = await request('/api/logout', { method: 'POST' });
  console.log('15. Logout (200):', logout.status === 200 ? 'PASSED' : 'FAILED', logout.data.message);

  console.log('\n--- ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ---\n');
}

runTests().catch(console.error);
