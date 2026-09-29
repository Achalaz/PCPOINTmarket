import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileDashboard({ onNavigateHome, onOpenCart }) {
  const { user, profile, updateProfile, changePassword, logout, uploadAvatar } = useAuth();

  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Contact details form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping address state
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Sri Lanka');

  // Billing address state
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPostal, setBillingPostal] = useState('');
  const [billingCountry, setBillingCountry] = useState('Sri Lanka');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status banners
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active section tab: 'details' | 'security' | 'payload'
  const [activeTab, setActiveTab] = useState('details');

  // Initialize fields from user & profile
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
    }
    if (profile) {
      setPhone(profile.phone || '');
      if (profile.shipping_address) {
        setShippingStreet(profile.shipping_address.street || '');
        setShippingCity(profile.shipping_address.city || '');
        setShippingState(profile.shipping_address.state || '');
        setShippingPostal(profile.shipping_address.postal_code || '');
        setShippingCountry(profile.shipping_address.country || 'Sri Lanka');
      }
      if (profile.billing_address) {
        setBillingStreet(profile.billing_address.street || '');
        setBillingCity(profile.billing_address.city || '');
        setBillingState(profile.billing_address.state || '');
        setBillingPostal(profile.billing_address.postal_code || '');
        setBillingCountry(profile.billing_address.country || 'Sri Lanka');
      }
    }
  }, [user, profile]);

  const handleCopyShippingToBilling = () => {
    setBillingStreet(shippingStreet);
    setBillingCity(shippingCity);
    setBillingState(shippingState);
    setBillingPostal(shippingPostal);
    setBillingCountry(shippingCountry);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      await updateProfile({
        full_name: fullName,
        phone,
        shipping_address: {
          street: shippingStreet,
          city: shippingCity,
          state: shippingState,
          postal_code: shippingPostal,
          country: shippingCountry,
        },
        billing_address: {
          street: billingStreet,
          city: billingCity,
          state: billingState,
          postal_code: billingPostal,
          country: billingCountry,
        },
      });
      setProfileSuccess('Logistics & contact profile successfully saved.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarUploading(true);
    setProfileError('');
    try {
      const uploadRes = await uploadAvatar(file);
      if (uploadRes.success && uploadRes.url) {
        await updateProfile({ avatar: uploadRes.url });
        setProfileSuccess('Avatar updated successfully.');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to upload avatar.');
      setTimeout(() => setProfileError(''), 4000);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(res.message || 'Access credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update credentials.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active Enlistment';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const mergedCount = profile?.merged_guest_items_count || 0;
  const cartItems = profile?.cart_items || [];
  const formatLKR = (num) => 'Rs. ' + (num || 0).toLocaleString('en-US');

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        {/* Top Breadcrumb & Actions */}
        <div className="profile-top-bar">
          <button className="btn btn-secondary btn-sm" onClick={onNavigateHome}>
            ← RETURN TO ARMORY
          </button>
          <div className="profile-security-badge">
            <span className="dot green" />
            <span>AUTHENTICATED OPERATOR // SECURE SESSION</span>
          </div>
          <button className="btn btn-outline btn-sm logout-btn" onClick={logout}>
            LOGOUT TERMINAL ⏻
          </button>
        </div>

        {/* Hero Card / Callsign Banner */}
        <div className="profile-hero-card">
          <div 
            className="profile-avatar-wrap" 
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to update avatar"
          >
            <img src={user?.avatar || '/assets/u1.svg'} alt="Operator Avatar" className="profile-avatar-img" style={{ opacity: avatarUploading ? 0.5 : 1 }} />
            {avatarUploading && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textShadow: '0 0 5px black', fontWeight: 'bold'}}>Uploading...</div>}
            <span className="avatar-rank-badge">OP-1</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <div className="profile-identity">
            <div className="profile-callsign-row">
              <h1 className="profile-callsign">{user?.full_name || 'Ghost Operator'}</h1>
              <span className="profile-role-tag">{user?.role || 'authenticated'}</span>
            </div>
            <div className="profile-meta-row">
              <span className="profile-meta-item">
                <strong>ID:</strong> {user?.id || user?._id || 'OP-2026-X'}
              </span>
              <span className="profile-meta-item">
                <strong>EMAIL:</strong> {user?.email}
              </span>
              <span className="profile-meta-item">
                <strong>ENLISTED:</strong> {formatDate(user?.created_at)}
              </span>
            </div>
          </div>

          <div className="profile-status-block">
            <div className="status-indicator-pill">
              <span className="dot green" />
              <span>Status: {user?.account_status || 'Active Member'}</span>
            </div>
            <div className="cart-sync-pill">
              <span className="cart-sync-icon">🛒</span>
              <span>
                cart_state:{' '}
                <strong>
                  {mergedCount > 0 ? `${mergedCount} guest items merged` : 'Armory cart synchronized'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="profile-tabs-header">
          <button
            className={`profile-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 01 // CONTACT & LOGISTICS
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 02 // SECURITY CREDENTIALS
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'payload' ? 'active' : ''}`}
            onClick={() => setActiveTab('payload')}
          >
            🛒 03 // ACTIVE PAYLOAD ({cartItems.length} ITEMS)
          </button>
        </div>

        {/* TAB 1: DETAILS & ADDRESSES */}
        {activeTab === 'details' && (
          <form className="profile-form-grid" onSubmit={handleSaveProfile}>
            {profileSuccess && (
              <div className="auth-alert success span-full">
                <span>✓ {profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="auth-alert error span-full">
                <span>⚠️ {profileError}</span>
              </div>
            )}

            {/* Personal Info Box */}
            <div className="profile-card">
              <div className="card-sec-header">
                <h3>OPERATOR PROFILE</h3>
                <span className="sec-tag">IDENTITY</span>
              </div>

              <div className="auth-field">
                <label>CALLSIGN / FULL NAME</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dev Student"
                  required
                />
              </div>

              <div className="auth-field">
                <label>OPERATOR EMAIL (ENCRYPTED & VERIFIED)</label>
                <input type="email" value={user?.email || ''} readOnly className="input-readonly" />
                <small className="field-note">Email is bound to your account and cannot be modified.</small>
              </div>

              <div className="auth-field">
                <label>DIRECT CONTACT TELEPHONE / WHATSAPP</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            {/* Shipping Address Box */}
            <div className="profile-card">
              <div className="card-sec-header">
                <h3>SHIPPING ADDRESS (DISPATCH)</h3>
                <span className="sec-tag">LOGISTICS</span>
              </div>

              <div className="auth-field">
                <label>STREET ADDRESS</label>
                <input
                  type="text"
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  placeholder="No 42, Cyberpunk Tech Park"
                />
              </div>

              <div className="form-row-2">
                <div className="auth-field">
                  <label>CITY</label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Colombo"
                  />
                </div>
                <div className="auth-field">
                  <label>STATE / PROVINCE</label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="Western Province"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="auth-field">
                  <label>POSTAL CODE</label>
                  <input
                    type="text"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    placeholder="00100"
                  />
                </div>
                <div className="auth-field">
                  <label>COUNTRY</label>
                  <input
                    type="text"
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    placeholder="Sri Lanka"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Box */}
            <div className="profile-card span-full">
              <div className="card-sec-header flex-between">
                <div>
                  <h3>BILLING ADDRESS (INVOICE GENERATION)</h3>
                  <span className="sec-tag">FINANCE</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={handleCopyShippingToBilling}
                >
                  ⚡ SAME AS SHIPPING
                </button>
              </div>

              <div className="form-row-3">
                <div className="auth-field">
                  <label>STREET ADDRESS</label>
                  <input
                    type="text"
                    value={billingStreet}
                    onChange={(e) => setBillingStreet(e.target.value)}
                    placeholder="Billing street address"
                  />
                </div>
                <div className="auth-field">
                  <label>CITY</label>
                  <input
                    type="text"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="auth-field">
                  <label>POSTAL CODE</label>
                  <input
                    type="text"
                    value={billingPostal}
                    onChange={(e) => setBillingPostal(e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div className="profile-action-bar">
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? 'SAVING PROFILE...' : 'SAVE DETAILS →'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: SECURITY & PASSWORD WORKFLOW */}
        {activeTab === 'security' && (
          <div className="profile-security-section">
            <div className="profile-card security-card">
              <div className="card-sec-header">
                <h3>SECURE ACCESS CREDENTIALS</h3>
                <span className="sec-tag text-crimson">RE-VERIFICATION</span>
              </div>

              <p className="security-desc">
                To update your password, verify your existing identity with your current password.
                All updates use <strong>bcrypt salt hashing (12 rounds)</strong> and are protected
                against brute-force enumeration.
              </p>

              {passwordSuccess && (
                <div className="auth-alert success">
                  <span>✓ {passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="auth-alert error">
                  <span>⚠️ {passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="auth-field">
                  <label>CURRENT ACCESS PASSWORD (RE-VERIFICATION)</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify identity"
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="auth-field">
                    <label>NEW STRONG PASSWORD</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 Upper, 1 Number, 1 Symbol"
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>CONFIRM NEW PASSWORD</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                <div className="profile-action-bar">
                  <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                    {passwordLoading ? 'ENCRYPTING & UPDATING...' : 'UPDATE ACCESS KEY →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE PAYLOAD / CART PERSISTENCE */}
        {activeTab === 'payload' && (
          <div className="profile-card span-full">
            <div className="card-sec-header flex-between">
              <div>
                <h3>ACCOUNT SYNCHRONIZED CART</h3>
                <span className="sec-tag">PERSISTED PAYLOAD</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenCart}>
                OPEN TACTICAL CART 🛒
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="cart-empty-state">
                <p>No active items persisted to your operator account.</p>
                <button className="btn btn-primary btn-sm" onClick={onNavigateHome}>
                  BROWSE ARMORY INVENTORY
                </button>
              </div>
            ) : (
              <div className="profile-cart-table">
                <div className="table-header-row">
                  <span>ITEM</span>
                  <span>CATEGORY</span>
                  <span>QTY</span>
                  <span>PRICE</span>
                </div>
                {cartItems.map((item, idx) => (
                  <div key={item.id || idx} className="table-data-row">
                    <div className="table-item-cell">
                      <img src={item.img} alt={item.name} className="table-item-thumb" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-muted">{item.categoryName || 'Hardware'}</span>
                    <span>{item.qty}</span>
                    <span className="text-crimson font-mono">{formatLKR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
