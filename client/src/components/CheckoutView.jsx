import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CheckoutView({ cart = [], onNavigateHome, onClearCart }) {
  const { user, profile } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('koko');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const formatLKR = (num) => 'Rs. ' + (num || 0).toLocaleString('en-US');

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const id = 'ORD-2026-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(id);
    setOrderPlaced(true);
    if (onClearCart) onClearCart();
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page-wrapper">
        <div className="checkout-container text-center">
          <div className="order-success-card">
            <div className="order-success-icon">✓</div>
            <h1 className="section-title text-neon-green">ORDER DISPATCH AUTHORIZED</h1>
            <p className="order-ref">ORDER REFERENCE: <strong>{orderId}</strong></p>
            <p className="order-subtext">
              Official Sri Lanka tax invoice and manufacturer warranty document sent to{' '}
              <strong className="text-crimson">{user?.email}</strong>.
            </p>
            <div className="order-summary-box">
              <p>Operator: <strong>{user?.full_name}</strong></p>
              <p>Dispatch Address: <strong>{profile?.shipping_address?.street || 'Default Address'}, {profile?.shipping_address?.city || 'Colombo'}</strong></p>
              <p>Payment Mode: <strong>{paymentMethod.toUpperCase()}</strong></p>
            </div>
            <button className="btn btn-primary" onClick={onNavigateHome}>
              RETURN TO ARMORY HEADQUARTERS →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <div className="profile-top-bar">
          <button className="btn btn-secondary btn-sm" onClick={onNavigateHome}>
            ← CONTINUE SHOPPING
          </button>
          <div className="profile-security-badge">
            <span className="dot green" />
            <span>SECURE ENCRYPTED CHECKOUT (TLS 1.3)</span>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left Column: Shipping & Payment */}
          <div className="checkout-left">
            <div className="profile-card">
              <div className="card-sec-header">
                <h3>01 // DISPATCH DESTINATION</h3>
                <span className="sec-tag">SHIPPING</span>
              </div>
              <div className="dispatch-summary">
                <p><strong>Recipient:</strong> {user?.full_name}</p>
                <p><strong>Contact Phone:</strong> {profile?.phone || '+94 (Not set - edit in profile)'}</p>
                <p>
                  <strong>Address:</strong>{' '}
                  {profile?.shipping_address?.street
                    ? `${profile.shipping_address.street}, ${profile.shipping_address.city}, ${profile.shipping_address.country}`
                    : 'No address saved. (Will dispatch to registered profile default)'}
                </p>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-sec-header">
                <h3>02 // PAYMENT PROTOCOL</h3>
                <span className="sec-tag text-crimson">CHECKOUT METHOD</span>
              </div>

              <div className="payment-options-grid">
                <label className={`payment-card ${paymentMethod === 'koko' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="koko"
                    checked={paymentMethod === 'koko'}
                    onChange={() => setPaymentMethod('koko')}
                  />
                  <div className="pay-card-content">
                    <span className="koko-pill">koko</span>
                    <div>
                      <strong>3 Installments of {formatLKR(Math.round(totalCartPrice / 3))}</strong>
                      <p>0% Interest Debit/Credit Card</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className="pay-card-content">
                    <span className="pay-icon">💳</span>
                    <div>
                      <strong>Credit / Debit Card</strong>
                      <p>Visa, MasterCard, Amex (IPG Secured)</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="pay-card-content">
                    <span className="pay-icon">💵</span>
                    <div>
                      <strong>Cash on Delivery (Islandwide)</strong>
                      <p>Pay cash upon courier arrival</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-right">
            <div className="profile-card summary-sticky">
              <div className="card-sec-header">
                <h3>ORDER SUMMARY</h3>
                <span className="sec-tag">({totalCartCount} ITEMS)</span>
              </div>

              <div className="checkout-items-list">
                {cart.length === 0 ? (
                  <p className="text-muted">Cart is currently empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="checkout-item-row">
                      <img src={item.img} alt={item.name} className="checkout-item-img" />
                      <div className="checkout-item-text">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.qty} × {formatLKR(item.price)}</span>
                      </div>
                      <span className="item-total">{formatLKR(item.price * item.qty)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="checkout-price-breakdown">
                <div className="calc-row">
                  <span>Armory Subtotal</span>
                  <span>{formatLKR(totalCartPrice)}</span>
                </div>
                <div className="calc-row">
                  <span>Priority Secure Dispatch</span>
                  <span className="text-neon-green">FREE</span>
                </div>
                <div className="calc-row grand-total">
                  <span>Total Amount</span>
                  <span className="text-crimson font-mono">{formatLKR(totalCartPrice)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block checkout-submit-btn"
                disabled={cart.length === 0}
                onClick={handlePlaceOrder}
              >
                AUTHORIZE TRANSACTION & DISPATCH →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
