import React, { useState } from 'react';
import { ArrowLeft, Link2, Mail, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import { getAuthErrorMessage, getAuthFieldErrors } from '../../utils/authErrors';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const ForgotPassword = () => {
  const [mode, setMode] = useState('reset');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    setMessage('');
    setFieldError('');
    setIsError(false);
    setPreviewUrl('');

    if (!cleanEmail) {
      setFieldError('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const result = mode === 'magic'
        ? await authRecoveryService.requestMagicLink(cleanEmail)
        : await authRecoveryService.requestPasswordReset(cleanEmail);

      setMessage(
        mode === 'magic'
          ? 'If this account exists, a magic sign-in link has been sent.'
          : 'If this account exists, password reset instructions have been sent.',
      );
      setIsError(false);

      if (result?.previewUrl) setPreviewUrl(result.previewUrl);
    } catch (error) {
      const backend = getAuthFieldErrors(error);
      setFieldError(backend.email || '');
      setMessage(getAuthErrorMessage(error, 'Unable to send the email.'));
      setIsError(true);
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
            <button type="button" className={mode === 'reset' ? 'active' : ''} onClick={() => { setMode('reset'); setMessage(''); setFieldError(''); setIsError(false); }}>
              <RotateCcw size={14}/>Reset Password
            </button>
            <button type="button" className={mode === 'magic' ? 'active' : ''} onClick={() => { setMode('magic'); setMessage(''); setFieldError(''); setIsError(false); }}>
              <Link2 size={14}/>Magic Link
            </button>
          </div>

          {message && <div className={'auth-message ' + (isError ? 'is-error' : 'is-success')}>{message}</div>}

          <form className="login-form" onSubmit={submit} noValidate>
            <label>
              <span className="login-field-label">Email address</span>
              <div className={'login-input-shell ' + (fieldError ? 'is-error' : '')}>
                <span className="login-input-icon"><Mail size={16}/></span>
                <input
                  className="login-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldError('');
                    setMessage('');
                    setIsError(false);
                  }}
                  placeholder="name@company.com"
                  aria-invalid={Boolean(fieldError)}
                />
              </div>
              {fieldError && <span className="auth-field-error" role="alert">{fieldError}</span>}
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
