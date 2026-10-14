import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

const verificationRequests = new Map();

const verifyMagicLinkOnce = ({ token, email }) => {
  if (!verificationRequests.has(token)) {
    verificationRequests.set(
      token,
      verifyMagicLinkOnce({ token, email }),
    );
  }

  return verificationRequests.get(token);
};

export const MagicLinkVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const next = params.get('next') || '/dashboard';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('Verifying your secure sign-in link…');

  useEffect(() => {
    let alive = true;

    if (!token) {
      setState('error');
      setMessage('Magic link is invalid or incomplete.');
      return () => {
        alive = false;
      };
    }

    authRecoveryService.verifyMagicLink({ token, email })
      .then((result) => {
        if (!alive) return;

        const accessToken = result?.access || result?.token;
        if (!accessToken) {
          throw new Error('Magic link verification did not return an access token.');
        }

        localStorage.setItem('auth_token', accessToken);

        if (result?.refresh) {
          localStorage.setItem('auth_refresh_token', result.refresh);
        }

        if (result?.user) {
          localStorage.setItem('auth_user', JSON.stringify(result.user));
        }

        setState('success');
        setMessage('Magic link verified. Redirecting to your workspace…');
        window.setTimeout(() => navigate(safeNext, { replace: true }), 700);
      })
      .catch((error) => {
        if (!alive) return;
        setState('error');
        setMessage(error?.message || 'Magic link is invalid or expired.');
      });

    return () => {
      alive = false;
    };
  }, [token, email, safeNext, navigate]);

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
