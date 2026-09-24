import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Login = () => {
  const { login, loading, isMockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(isMockMode ? 'admin@cubixgear.com' : '');
  const [password, setPassword] = useState(isMockMode ? 'password123' : '');
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
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '28px', borderRadius: '16px', border: '1px solid #334155', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: '24px' }}>Welcome to CubixGear</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 22px' }}>
          Sign in to manage your workshop.
        </p>

        {error && (
          <div role="alert" style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(248,113,113,.35)', background: 'rgba(127,29,29,.24)', color: '#fecaca', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {isMockMode && (
          <p style={{ margin: '14px 0 0', color: '#64748b', fontSize: '11px', textAlign: 'center' }}>
            Development mock authentication is enabled.
          </p>
        )}
      </div>
    </div>
  );
};
