import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', returnUrl = null, onSuccess }) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Validation rules for Registration
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(regEmail.trim());

  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /\d/.test(regPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);
  const isPasswordComplex = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please provide both operator email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(loginEmail, loginPassword);
      setSuccessMsg('Access Authorized. Welcome, Operator.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(returnUrl);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Full name / Callsign is required.');
      return;
    }
    if (!isEmailValid) {
      setErrorMsg('Please enter a valid tactical email address.');
      return;
    }
    if (!isPasswordComplex) {
      setErrorMsg('Password does not meet the minimum security complexity requirements.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      setSuccessMsg(res.message || 'Enlistment successful! Switching to login terminal...');
      // UX flow: Provide success feedback on registration and redirect to login tab
      setTimeout(() => {
        setLoginEmail(regEmail);
        setLoginPassword('');
        setActiveTab('login');
        setSuccessMsg('Enlistment confirmed. Please enter your password to authenticate.');
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="auth-modal-header">
          <div className="auth-header-title">
            <span className="dot" />
            <span className="auth-title-text">OPERATOR SECURITY TERMINAL</span>
            <span className="auth-build-badge">v6.0-SEC</span>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close Security Modal">
            ✕
          </button>
        </div>

        {/* Return URL Notice Banner */}
        {returnUrl && (
          <div className="auth-return-banner">
            <span className="text-crimson">🔒 GUARDED ROUTE:</span> Authentication required to access <strong>{returnUrl}</strong>.
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="auth-tab-row">
          <button
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            01 // OPERATOR LOGIN
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            02 // RECRUIT ENLISTMENT
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="auth-alert error">
            <span className="auth-alert-icon">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <span className="auth-alert-icon">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">OPERATOR EMAIL</label>
              <div className="input-icon-wrap">
                <input
                  id="login-email"
                  type="email"
                  placeholder="operator@pcpoint.lk"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <span className="field-glyph">✉</span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">ACCESS KEY / PASSWORD</label>
              <div className="input-icon-wrap">
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <span className="field-glyph">🔑</span>
              </div>
            </div>

            <div className="auth-form-subtext">
              <span>Security: Bcrypt Hashed • User Enumeration Defense Active</span>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE & ENTER →'}
            </button>

            <div className="auth-footer-prompt">
              <span>Need enlistment?</span>{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchTab('register')}>
                Create Operator Account
              </button>
            </div>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-field">
              <label htmlFor="reg-name">FULL NAME / CALLSIGN</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Ghost Operator / Alex Mercer"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">TACTICAL EMAIL</label>
              <div className="input-icon-wrap">
                <input
                  id="reg-email"
                  type="email"
                  placeholder="alex.m@pcpoint.lk"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                {regEmail.length > 0 && (
                  <span className={`validation-tag ${isEmailValid ? 'valid' : 'invalid'}`}>
                    {isEmailValid ? 'VALID' : 'INVALID'}
                  </span>
                )}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-pass">CREATE STRONG PASSWORD</label>
              <input
                id="reg-pass"
                type="password"
                placeholder="Min 8 chars, Uppercase, Number, Symbol"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />

              {/* Password Complexity Checklist */}
              <div className="password-checklist">
                <div className={`check-item ${hasMinLength ? 'ok' : ''}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span> 8+ Characters
                </div>
                <div className={`check-item ${hasUppercase ? 'ok' : ''}`}>
                  <span>{hasUppercase ? '✓' : '○'}</span> Uppercase
                </div>
                <div className={`check-item ${hasLowercase ? 'ok' : ''}`}>
                  <span>{hasLowercase ? '✓' : '○'}</span> Lowercase
                </div>
                <div className={`check-item ${hasNumber ? 'ok' : ''}`}>
                  <span>{hasNumber ? '✓' : '○'}</span> Number
                </div>
                <div className={`check-item ${hasSpecial ? 'ok' : ''}`}>
                  <span>{hasSpecial ? '✓' : '○'}</span> Special Symbol
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-confirm">CONFIRM PASSWORD</label>
              <div className="input-icon-wrap">
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="Re-type password exactly"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
                {regConfirmPassword.length > 0 && (
                  <span className={`validation-tag ${passwordsMatch ? 'valid' : 'invalid'}`}>
                    {passwordsMatch ? 'MATCH' : 'MISMATCH'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading || !isPasswordComplex || !passwordsMatch || !isEmailValid}
            >
              {loading ? 'ENLISTING OPERATOR...' : 'ENLIST NEW OPERATOR →'}
            </button>

            <div className="auth-footer-prompt">
              <span>Already registered?</span>{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchTab('login')}>
                Sign in to Terminal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
