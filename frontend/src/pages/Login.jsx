import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          background: #e8eaf0;
          background-image:
            radial-gradient(ellipse 70% 60% at 30% 30%, rgba(99,120,220,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 70% 70%, rgba(99,120,220,0.05) 0%, transparent 60%);
          padding: 24px;
        }

        /* Card */
        .card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 36px 32px;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.06),
            0 4px 6px rgba(0,0,0,0.04),
            0 20px 60px rgba(0,0,0,0.10);
          animation: fadeUp 0.55s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo row */
        .logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #f0f4ff 0%, #dde4ff 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(99,120,220,0.15);
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #4a6cf7;
          letter-spacing: -0.3px;
        }

        /* Trust badges */
        .badges {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }

        .badge {
          background: #f4f6fb;
          border: 1px solid #e8ecf5;
          border-radius: 10px;
          padding: 10px 8px;
          text-align: center;
        }

        .badge-value {
          font-size: 13px;
          font-weight: 700;
          color: #1a1f36;
          line-height: 1;
          margin-bottom: 3px;
        }

        .badge-label {
          font-size: 10.5px;
          color: #8a93b0;
          font-weight: 400;
        }

        /* Heading */
        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1f36;
          text-align: center;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
        }

        .card-sub {
          font-size: 13px;
          color: #8a93b0;
          text-align: center;
          margin-bottom: 28px;
          font-weight: 400;
        }

        /* Error */
        .error-banner {
          background: #fff2f2;
          border: 1px solid #fdd;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12.5px;
          color: #c0392b;
          margin-bottom: 18px;
        }

        /* Fields */
        .field-wrap { margin-bottom: 16px; }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3d4460;
          margin-bottom: 7px;
        }

        .field-input-wrap { position: relative; }

        .field-input {
          width: 100%;
          background: #f7f8fc;
          border: 1.5px solid #e4e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          color: #1a1f36;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .field-input::placeholder { color: #b0b8d0; }

        .field-input:focus {
          border-color: #4a6cf7;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(74,108,247,0.1);
        }

        /* Password field with show button */
        .field-input.has-btn { padding-right: 76px; }

        .show-btn {
          position: absolute;
          right: 6px; top: 50%;
          transform: translateY(-50%);
          background: #1a1f36;
          border: none;
          border-radius: 7px;
          padding: 6px 12px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.1px;
        }

        .show-btn:hover { background: #2d3460; }
        .show-btn:active { transform: translateY(-50%) scale(0.96); }

        /* Forgot */
        .forgot-row {
          text-align: right;
          margin-top: -6px;
          margin-bottom: 22px;
        }

        .forgot-row a {
          font-size: 12px;
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .forgot-row a:hover { color: #2a4cd7; text-decoration: underline; }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #1a1f36;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(26,31,54,0.2);
          margin-bottom: 24px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2d3460;
          box-shadow: 0 6px 24px rgba(26,31,54,0.28);
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          height: 1px;
          background: #edf0f7;
          margin-bottom: 20px;
        }

        /* Register link */
        .register-cta {
          text-align: center;
          font-size: 13px;
          color: #8a93b0;
          margin-bottom: 20px;
        }

        .register-cta a {
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .register-cta a:hover { color: #2a4cd7; }

        /* Down arrow */
        .scroll-hint {
          display: flex;
          justify-content: center;
        }

        .scroll-hint-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #e4e8f0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        .scroll-hint-btn:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          transform: translateY(2px);
        }


      `}</style>

      <div className="page-root">
        <div className="card">

          {/* Logo */}
          <div className="logo-row">
            <div className="logo-icon">🏦</div>
            <span className="logo-text">SecureBank</span>
          </div>

          {/* Trust badges */}
          <div className="badges">
            <div className="badge">
              <div className="badge-value">256-bit</div>
              <div className="badge-label">Encryption</div>
            </div>
            <div className="badge">
              <div className="badge-value">24/7</div>
              <div className="badge-label">Support</div>
            </div>
            <div className="badge">
              <div className="badge-value">100%</div>
              <div className="badge-label">Secure</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="card-title">Welcome back</h2>
          <p className="card-sub">Sign in to your account</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-wrap">
              <label className="field-label">Email address</label>
              <input
                type="email"
                className="field-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-btn"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          <p className="register-cta">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>

          <div className="scroll-hint">
            <div className="scroll-hint-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#8a93b0" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>



        </div>
      </div>
    </>
  );
};

export default Login;
