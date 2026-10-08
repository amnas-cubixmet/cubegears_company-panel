import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const email = params.get('email') || '';
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
    if ((!uid && !email) || !token) {
      return setMessage('This reset link is invalid or incomplete. Request a new reset link.');
    }
    if (password.length < 8) return setMessage('Password must be at least 8 characters.');
    if (password !== confirm) return setMessage('Passwords do not match.');

    setLoading(true);
    try {
      await authRecoveryService.resetPassword({ uid, token, email, password });
      setDone(true);
    } catch (error) {
      setMessage(error?.message || 'Unable to reset password.');
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
              <div className="login-brand-subtitle">Password Recovery</div>
            </div>
          </div>

          {done ? (
            <div className="auth-success-state">
              <span className="auth-success-icon"><CheckCircle2 size={24}/></span>
              <h1 className="login-title">Password updated</h1>
              <p className="login-description">Your new password is ready. You can now sign in securely.</p>
              <button type="button" className="login-submit" onClick={() => navigate('/login', { replace: true })}>Go to Sign In</button>
            </div>
          ) : (
            <>
              <h1 className="login-title">Create a new password</h1>
              <p className="login-description">{email ? `Resetting access for ${email}.` : 'Choose a strong password for your account.'}</p>

              {message && <div className="auth-message">{message}</div>}
              {(!token || (!uid && !email)) && (
                <div className="auth-message is-warning">
                  This reset URL is incomplete. Request a new reset link.
                </div>
              )}

              <form className="login-form" onSubmit={submit}>
                <label>
                  <span className="login-field-label">New password</span>
                  <div className="login-input-shell">
                    <span className="login-input-icon"><Lock size={16}/></span>
                    <input className="login-input" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" required/>
                    <button type="button" className="login-password-toggle" onClick={() => setShow((value) => !value)} aria-label="Toggle password visibility">
                      {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </label>

                <label>
                  <span className="login-field-label">Confirm password</span>
                  <div className="login-input-shell">
                    <span className="login-input-icon"><Lock size={16}/></span>
                    <input className="login-input" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" required/>
                    <button type="button" className="login-password-toggle" onClick={() => setShowConfirm((value) => !value)} aria-label="Toggle confirm password visibility">
                      {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
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
                  disabled={loading || !token || (!uid && !email)}
                >
                  {loading ? 'Updating…' : 'Reset Password'}
                </button>
              </form>

              <div className="auth-bottom-link"><Link to="/forgot-password">Request another reset link</Link></div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};
