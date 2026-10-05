import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const MagicLinkVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('Verifying your secure sign-in link…');

  useEffect(() => {
    let alive = true;
    authRecoveryService.verifyMagicLink({ token, email })
      .then((result) => {
        if (!alive) return;
        localStorage.setItem('auth_token', result.token);
        if (result.user) localStorage.setItem('auth_user', JSON.stringify(result.user));
        setState('success');
        setMessage('Magic link verified. Redirecting to your workspace…');
        window.setTimeout(() => navigate('/dashboard', { replace: true }), 700);
      })
      .catch((error) => {
        if (!alive) return;
        setState('error');
        setMessage(error?.message || 'Magic link is invalid or expired.');
      });
    return () => { alive = false; };
  }, [token, email, navigate]);

  return (
    <main className="login-page auth-recovery-page">
      <div className="login-shell">
        <section className="login-card auth-recovery-card auth-verify-card">
          <div className="auth-verify-icon">
            {state === 'loading' && <LoaderCircle size={28} className="auth-spin"/>}
            {state === 'success' && <CheckCircle2 size={28}/>}
            {state === 'error' && <XCircle size={28}/>}
          </div>
          <h1 className="login-title">{state === 'success' ? 'Signed in securely' : state === 'error' ? 'Link unavailable' : 'Checking magic link'}</h1>
          <p className="login-description">{message}</p>
          {state === 'error' && <Link className="login-submit auth-link-button" to="/forgot-password">Request New Link</Link>}
        </section>
      </div>
    </main>
  );
};
