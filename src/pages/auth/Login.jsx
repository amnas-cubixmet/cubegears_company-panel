import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Login = () => {
  const { login, loading, isMockMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(isMockMode ? 'admin@cubixgear.com' : '');
  const [password, setPassword] = useState(isMockMode ? 'password123' : '');
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="relative min-h-[100dvh] overflow-y-auto bg-[#0b1220] px-4 py-8 text-white sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 18%, rgba(79,70,229,.16), transparent 32%), radial-gradient(circle at 10% 90%, rgba(37,99,235,.08), transparent 28%)'
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[440px] items-center justify-center">
        <section className="w-full rounded-[22px] border border-slate-700/80 bg-slate-900/88 p-5 shadow-[0_24px_80px_rgba(2,6,23,.42)] backdrop-blur-xl sm:p-7">
          <div className="mb-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[15px] font-black tracking-[-.03em] text-white shadow-[0_10px_30px_rgba(79,70,229,.32)]">
                CG
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold tracking-[-.01em] text-slate-50">CubixGear</div>
                <div className="mt-0.5 text-[11px] font-medium text-slate-400">Workshop Management</div>
              </div>
            </div>

            <h1 className="m-0 text-[24px] font-bold leading-tight tracking-[-.025em] text-slate-50 sm:text-[26px]">
              Welcome back
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-slate-400">
              Sign in to manage jobs, stock, billing and workshop operations.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-[12px] leading-5 text-red-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-slate-300">
                Email address
              </span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#0d1728] px-3.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15">
                <Mail size={17} className="shrink-0 text-slate-500" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-slate-100 outline-none placeholder:text-slate-600"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold text-slate-300">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-300 transition hover:text-indigo-200"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#0d1728] px-3.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15">
                <LockKeyhole size={17} className="shrink-0 text-slate-500" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-slate-100 outline-none placeholder:text-slate-600"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid size-8 min-h-0 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.24)] transition hover:brightness-105 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-center gap-2 text-center text-[10px] leading-5 text-slate-500">
              <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
              Secure CubixGear workspace access
            </div>

            {isMockMode && (
              <div className="mt-2 text-center text-[10px] font-medium text-slate-600">
                Development mock mode
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
