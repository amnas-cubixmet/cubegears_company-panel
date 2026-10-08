import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCredentialError, getAuthFieldErrors } from '../../utils/authErrors';
import '../../styles/login-system.css';

export const Login = () => {
  const { login, loading, isMockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const suggestedEmail = params.get('email') || '';
  const resetComplete = params.get('reset') === 'success';

  const [email, setEmail] = useState(isMockMode ? 'admin@cubixgear.com' : suggestedEmail);
  const [password, setPassword] = useState(isMockMode ? 'password123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const clearField = (field) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    const nextErrors = {};

    if (!cleanEmail) nextErrors.email = 'Email address is required.';
    if (!password) nextErrors.password = 'Password is required.';

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setFormError('');
      return;
    }

    setFieldErrors({});
    setFormError('');

    try {
      await login({ email: cleanEmail, password });
      const next = params.get('next');
      navigate(next && next.startsWith('/') ? next : '/dashboard', { replace: true });
    } catch (error) {
      const backendFields = getAuthFieldErrors(error);
      const credentialError = getCredentialError(error);

      setFieldErrors({
        ...(backendFields.email ? { email: backendFields.email } : {}),
        ...(backendFields.password ? { password: backendFields.password } : {}),
        ...(!backendFields.email && !backendFields.password
          ? {
              email: credentialError,
              password: credentialError,
            }
          : {}),
      });
      setFormError(credentialError);
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
              Sign in with the same email and password configured for your CubixGear account.
            </p>
          </div>

          {resetComplete && !formError && (
            <div className="login-success" role="status">
              Password updated successfully. Sign in with your new password.
            </div>
          )}

          {formError && (
            <div role="alert" className="login-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <label className="block">
              <span className="login-field-label">Email address</span>
              <div className={'login-input-shell ' + (fieldErrors.email ? 'is-error' : '')}>
                <span className="login-input-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={1.8} />
                </span>
                <input
                  className="login-input"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearField('email');
                  }}
                  placeholder="name@company.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                />
              </div>
              {fieldErrors.email && (
                <span id="login-email-error" className="auth-field-error" role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </label>

            <label className="block">
              <div className="login-password-label">
                <span className="login-field-label">Password</span>
                <Link to="/forgot-password" className="login-forgot">
                  Forgot password?
                </Link>
              </div>

              <div className={'login-input-shell ' + (fieldErrors.password ? 'is-error' : '')}>
                <span className="login-input-icon" aria-hidden="true">
                  <Lock size={17} strokeWidth={1.9} />
                </span>
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearField('password');
                  }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
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
              {fieldErrors.password && (
                <span id="login-password-error" className="auth-field-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </label>

            <button type="submit" disabled={loading} className="login-submit">
              {loading && <span className="login-spinner" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-secure">
              <span className="login-secure-dot" />
              Secure CubixGear workspace access
            </div>

            {isMockMode && <div className="login-mock">Development mock mode</div>}
          </div>
        </section>
      </div>
    </main>
  );
};
