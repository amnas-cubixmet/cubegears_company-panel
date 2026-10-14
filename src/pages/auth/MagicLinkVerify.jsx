import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link2, LoaderCircle, XCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import { getSafePostLoginDestination } from '../../utils/authorizedLanding';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

const verificationRequests = new Map();

const verifyMagicLinkOnce = ({ token, email }) => {
  if (!verificationRequests.has(token)) {
    verificationRequests.set(
      token,
      authRecoveryService.verifyMagicLink({ token, email }),    );
  }

  return verificationRequests.get(token);
};

export const MagicLinkVerify = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const next = params.get('next') || '/dashboard';
  // Post-login destination is checked against real user permissions after verification.
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

    // Strip sensitive tokens from browser history before making the POST.
    window.history.replaceState(window.history.state, '', '/magic-link/verify');
    verifyMagicLinkOnce({ token, email })
      .then((result) => {
        if (!alive) return;

        const accessToken = result?.access || result?.token;
        if (!accessToken) {
          throw new Error('Magic link verification did not return an access token.');
        }

        const profile = result?.user;
        if (!profile?.company?.id || !profile?.role || !Array.isArray(profile.role.permissions)) {
          throw new Error('The link is valid, but no authorized company workspace was found.');
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
        const destination = getSafePostLoginDestination(next, profile);
        // Reload the app to hydrate AuthContext from its verified session.
        window.location.replace(destination);
      })
      .catch((error) => {
        if (!alive) return;
        setState('error');
        setMessage(error?.message || 'Magic link is invalid or expired.');
      });

    return () => {
      alive = false;
    };
  }, [token, email, next]);

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
