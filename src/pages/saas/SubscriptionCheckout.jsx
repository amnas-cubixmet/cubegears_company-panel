import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const card = { border: '1px solid #e2e8f0', borderRadius: 16, padding: 22, background: '#fff' };
const btn = { background: '#2563eb', color: 'white', border: 0, borderRadius: 10, padding: '13px 22px', fontWeight: 700, cursor: 'pointer' };
const currency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n || 0));

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'));
    document.body.appendChild(script);
  });
}

export function SubscriptionCheckout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [access, setAccess] = useState(null);
  const [history, setHistory] = useState([]);
  const [cycle, setCycle] = useState('monthly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const [a, p, h] = await Promise.all([
        apiClient.get('/saas/payments/access'),
        apiClient.get('/saas/plans'),
        apiClient.get('/saas/payments/history')
      ]);
      setAccess(a);
      setPlans(Array.isArray(p) ? p : []);
      setHistory(Array.isArray(h) ? h : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Unable to load billing information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login?next=%2Fplans', { replace: true }); return; }
    reload();
  }, [isAuthenticated, authLoading]);

  const pay = async (plan) => {
    setBusy(true); setError('');
    try {
      await loadRazorpay();
      const order = await apiClient.post('/saas/payments/orders', { planId: plan.id, cycle });
      if (!order.orderId || !order.key) throw new Error('Payment order was not initialized.');
      const payment = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'CubeGear',
        description: plan.name + ' subscription',
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#2563eb' },
        handler: async (result) => {
          try {
            await apiClient.post('/saas/payments/verify', result);
            await reload();
            navigate('/dashboard', { replace: true });
          } catch (e) {
            setError(e.message || 'Payment confirmation pending. Check your payment history.');
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) }
      });
      payment.on('payment.failed', (result) => {
        setError(result?.error?.description || 'Payment failed. No access has been activated.');
        setBusy(false);
      });
      payment.open();
    } catch (e) {
      setError(e.message || 'Could not initiate payment.');
      setBusy(false);
    }
  };

  if (authLoading || loading) return <main style={{ padding: 40 }}>Loading subscription plans…</main>;

  return (
    <main style={{ minHeight: '100vh', padding: '36px 5vw', background: '#f8fafc', color: '#0f172a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ color: '#2563eb', fontWeight: 800 }}>CUBEGEAR BILLING</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Select your plan</h1>
        <p>Choose a plan and complete the secure Razorpay payment to activate your workshop dashboard. UPI, cards and netbanking are available as enabled on your Razorpay account.</p>
        {access?.paid && <div style={{ ...card, margin: '20px 0' }}>
          <strong>Active: {access.plan}</strong>
          <p>Access until: {access.expiresAt ? new Date(access.expiresAt).toLocaleDateString('en-IN') : '—'}</p>
          <button style={btn} onClick={() => navigate('/dashboard')}>Open dashboard</button>
        </div>}
        {error && <p role="alert" style={{ padding: 12, color: '#b91c1c', background: '#fef2f2', borderRadius: 10 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
          <button type="button" onClick={() => setCycle('monthly')} style={{ ...btn, background: cycle === 'monthly' ? '#2563eb' : '#64748b' }}>Monthly</button>
          <button type="button" onClick={() => setCycle('yearly')} style={{ ...btn, background: cycle === 'yearly' ? '#2563eb' : '#64748b' }}>Yearly</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(265px, 1fr))', gap: 18 }}>
          {plans.map((plan) => (
            <article key={plan.id} style={card}>
              <h2 style={{ fontWeight: 800, fontSize: 22 }}>{plan.name}</h2>
              <p>{plan.description}</p>
              <div style={{ fontSize: 27, fontWeight: 800 }}>{currency(cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice)}</div>
              <p>Up to {plan.maxUsers} users · {plan.maxBranches} branches · {plan.includedStorageGb} GB</p>
              <button style={btn} disabled={busy} onClick={() => pay(plan)}>
                {busy ? 'Processing…' : 'Pay securely with Razorpay'}
              </button>
            </article>
          ))}
          {!plans.length && <p>No payment plans are currently available.</p>}
        </div>
        <section style={{ ...card, marginTop: 28 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>Payment history</h2>
          {history.length ? <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', textAlign: 'left', borderSpacing: '0 12px' }}>
            <thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Paid on</th><th>Access until</th></tr></thead>
            <tbody>{history.map((row) => <tr key={row.orderId}>
              <td>{row.plan}</td><td>{currency(row.amount)}</td><td>{row.status}</td>
              <td>{row.paidAt ? new Date(row.paidAt).toLocaleDateString('en-IN') : '—'}</td>
              <td>{row.accessUntil ? new Date(row.accessUntil).toLocaleDateString('en-IN') : '—'}</td>
            </tr>)}</tbody>
          </table></div> : <p>No payment history yet.</p>}
        </section>
      </div>
    </main>
  );
}
