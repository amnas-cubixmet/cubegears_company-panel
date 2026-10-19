import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { authRecoveryService } from '../../services/authRecovery.service';
import { getStaffLandingPath } from '../../utils/staffLanding';
import '../../styles/login-system.css';
import '../../styles/auth-recovery.css';

export const MagicLinkVerify = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const next = params.get('next') || '';
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('Verifying your secure sign-in link…');
  const verificationRef = useRef(null);

  useEffect(() => {
    let alive = true;

    if (!token) {
      setState('error');
      setMessage('Magic link is invalid or incomplete.');
      return () => {
        alive = false;
      };
    }

    // StrictMode may replay the effect; keep one in-flight request for this
    // single-use token, while allowing the active effect to handle the result.
    if (!verificationRef.current || verificationRef.current.token !== token) {
      verificationRef.current = {
        token,
        promise: authRecoveryService.verifyMagicLink({ token, email }),
      };
    }

    verificationRef.current.promise
      .then((result) => {
        if (!alive) return;

        const accessToken = result?.access;
        const refreshToken = result?.refresh;
        const user = result?.user;
        if (typeof accessToken !== 'string' || !accessToken ||
            typeof refreshToken !== 'string' || !refreshToken ||
            !user?.id || !user?.email) {
          throw new Error('Magic link verification did not return a complete login session.');
        }

        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('auth_refresh_token', refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(user));

        setState('success');
        setMessage('Magic link verified. Redirecting to your workspace…');
        // Reload the auth and feature-access providers for this verified user.
        window.location.replace(getStaffLandingPath(user, next));
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
