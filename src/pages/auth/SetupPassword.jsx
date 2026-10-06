import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const SetupPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const uid = params.get('uid') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!uid || !token) {
      setMessage('This setup link is invalid or incomplete. Please use the latest link from your email.');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await authRecoveryService.setupPassword({ uid, token, password });

      const accessToken =
        result?.access ||
        result?.token ||
        result?.accessToken ||
        result?.access_token;
      const refreshToken =
        result?.refresh ||
        result?.refreshToken ||
        result?.refresh_token;
      const user = result?.user || result?.profile;

      if (!accessToken) {
        throw new Error('Account created, but automatic sign-in could not be completed.');
      }

      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      setDone(true);
      window.setTimeout(() => {
        window.location.replace('/dashboard');
      }, 700);
    } catch (error) {
      setMessage(error?.message || 'Unable to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page auth-recovery-page">
      <div className="login-shell">
        <section className="login-card auth-recovery-card">
          <div className="login-brand-row">
            <div className="login-brand-mark">CG</div>
            <div>
              <div className="login-brand-name">CubixGear</div>
              <div className="login-brand-subtitle">Workshop Account Setup</div>
            </div>
          </div>

          {done ? (
            <div className="auth-success-state">
              <span className="auth-success-icon"><CheckCircle2 size={24} /></span>
              <h1 className="login-title">Your account is ready</h1>
              <p className="login-description">
                Password created successfully. Signing you in to your CubixGear workshop…
              </p>
              <button
                type="button"
                className="login-submit"
                onClick={() => window.location.replace('/dashboard')}
              >
                Open Dashboard
              </button>
            </div>
          ) : (
            <>
              <h1 className="login-title">Create your password</h1>
              <p className="login-description">
                Secure your new CubixGear workshop account before signing in.
              </p>

              {message && <div className="auth-message">{message}</div>}
              {(!uid || !token) && (
                <div className="auth-message is-warning">
                  This setup URL does not include a valid account token.
                </div>
              )}

              <form className="login-form" onSubmit={submit}>
                <label>
                  <span className="login-field-label">New password</span>
                  <div className="login-input-shell">
                    <span className="login-input-icon"><Lock size={16} /></span>
                    <input
                      className="login-input"
                      type={show ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShow((value) => !value)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <label>
                  <span className="login-field-label">Confirm password</span>
                  <div className="login-input-shell">
                    <span className="login-input-icon"><Lock size={16} /></span>
                    <input
                      className="login-input"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowConfirm((value) => !value)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <div className="password-rules">
                  <span className={password.length >= 8 ? 'ok' : ''}>8+ characters</span>
                  <span className={/[A-Z]/.test(password) ? 'ok' : ''}>Uppercase</span>
                  <span className={/[0-9]/.test(password) ? 'ok' : ''}>Number</span>
                </div>

                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading || !uid || !token}
                >
                  {loading ? 'Creating password…' : 'Create Password'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
};
