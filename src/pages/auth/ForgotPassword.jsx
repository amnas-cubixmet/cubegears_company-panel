import React, { useState } from 'react';
import { ArrowLeft, Link2, Mail, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const ForgotPassword = () => {
  const [mode, setMode] = useState('reset');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setPreviewUrl('');
    try {
      const result = mode === 'magic'
        ? await authRecoveryService.requestMagicLink(email)
        : await authRecoveryService.requestPasswordReset(email);
      setMessage(mode === 'magic'
        ? 'Magic sign-in link sent. Check your email.'
        : 'Password reset instructions sent. Check your email.');
      if (result?.previewUrl) setPreviewUrl(result.previewUrl);
    } catch (error) {
      setMessage(error?.message || 'Unable to send email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page auth-recovery-page">
      <div className="login-shell">
        <section className="login-card auth-recovery-card">
          <Link to="/login" className="auth-back"><ArrowLeft size={14}/>Back to sign in</Link>

          <div className="login-brand-row">
            <div className="login-brand-mark">CG</div>
            <div>
              <div className="login-brand-name">CubixGear</div>
              <div className="login-brand-subtitle">Secure Account Access</div>
            </div>
          </div>

          <h1 className="login-title">{mode === 'magic' ? 'Sign in with magic link' : 'Reset your password'}</h1>
          <p className="login-description">
            {mode === 'magic'
              ? 'We’ll email a one-time secure sign-in link. No password required.'
              : 'Enter your account email and we’ll send a secure password reset link.'}
          </p>

          <div className="auth-mode-tabs">
            <button type="button" className={mode === 'reset' ? 'active' : ''} onClick={() => { setMode('reset'); setMessage(''); }}>
              <RotateCcw size={14}/>Reset Password
            </button>
            <button type="button" className={mode === 'magic' ? 'active' : ''} onClick={() => { setMode('magic'); setMessage(''); }}>
              <Link2 size={14}/>Magic Link
            </button>
          </div>

          {message && <div className="auth-message">{message}</div>}

          <form className="login-form" onSubmit={submit}>
            <label>
              <span className="login-field-label">Email address</span>
              <div className="login-input-shell">
                <span className="login-input-icon"><Mail size={16}/></span>
                <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required/>
              </div>
            </label>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Sending…' : mode === 'magic' ? 'Send Magic Link' : 'Send Reset Link'}
            </button>
          </form>

          {previewUrl && (
            <div className="auth-dev-link">
              <span>Development preview</span>
              <Link to={previewUrl}>{mode === 'magic' ? 'Open magic link' : 'Open reset link'}</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
