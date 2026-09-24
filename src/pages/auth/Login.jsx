import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/login-system.css';

export const Login = () => {
  const { login, loading, isMockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(isMockMode ? 'admin@cubixgear.com' : '');
  const [password, setPassword] = useState(isMockMode ? 'password123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    try {
      await login({ email: email.trim(), password });
      const next = new URLSearchParams(location.search).get('next');
      navigate(next && next.startsWith('/') ? next : '/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Check your credentials and try again.');
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-card">
          <div>
            <div className="login-brand-row">
              <div className="login-brand-mark">CG</div>
              <div>
                <div className="login-brand-name">CubixGear</div>
                <div className="login-brand-subtitle">Workshop Management</div>
              </div>
            </div>

            <h1 className="login-title">Welcome back</h1>
            <p className="login-description">
              Sign in to manage jobs, stock, billing and workshop operations.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="login-error"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <label className="block">
              <span className="login-field-label">
                Email address
              </span>
              <div className="login-input-shell">
                <span className="login-input-icon" aria-hidden="true"><Mail size={16} strokeWidth={1.8} /></span>
                <input
                  className="login-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <div className="login-password-label">
                <span className="login-field-label">Password</span>
                <Link
                  to="/forgot-password"
                  className="login-forgot"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="login-input-shell">
                <span className="login-input-icon" aria-hidden="true"><Lock size={17} strokeWidth={1.9} /></span>
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading && (
                <span className="login-spinner" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-secure">
              <span className="login-secure-dot" />
              Secure CubixGear workspace access
            </div>

            {isMockMode && (
              <div className="login-mock">
                Development mock mode
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
