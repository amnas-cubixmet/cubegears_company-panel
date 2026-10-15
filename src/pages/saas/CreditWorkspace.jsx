import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Coins, CreditCard, Database, FileClock, RefreshCcw, ShieldCheck, Users, Wallet, Zap } from 'lucide-react';
import { creditWalletService, notifyCreditChange, purchaseCredits } from '../../services/creditWallet.service';
import { AccountHeader } from '../../components/account';
import '../../styles/credit-wallet.css';

const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const money = (value) => value == null ? '—' : `₹${nf.format(Number(value))}`;
const credits = (value) => value == null ? '—' : nf.format(Number(value));
const when = (value) => value ? new Date(value).toLocaleString('en-IN') : '—';

export function CreditWorkspace({ section = 'overview' }) {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [packages, setPackages] = useState([]);
  const [featureBundles, setFeatureBundles] = useState([]);
  const [features, setFeatures] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [gateway, setGateway] = useState(null);
  const [gatewayError, setGatewayError] = useState('');
  const [gatewayProbe, setGatewayProbe] = useState(null);
  const [gatewayBusy, setGatewayBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [balance, bundles, catalog, history, labels] = await Promise.allSettled([
      creditWalletService.overview(), creditWalletService.packages(),
      creditWalletService.features(), creditWalletService.logs(),
      creditWalletService.bundles(),
    ]);
    const problems = [];
    if (balance.status === 'fulfilled') setWallet(balance.value);
    else { setWallet(null); problems.push('wallet balance'); }
    if (bundles.status === 'fulfilled') setPackages(Array.isArray(bundles.value) ? bundles.value : []);
    else { setPackages([]); problems.push('credit packages'); }
    if (catalog.status === 'fulfilled') setFeatures(Array.isArray(catalog.value) ? catalog.value : []);
    else { setFeatures([]); problems.push('feature prices'); }
    if (history.status === 'fulfilled') setLogs(Array.isArray(history.value) ? history.value : []);
    else { setLogs([]); problems.push('transaction logs'); }
    if (labels.status === 'fulfilled') setFeatureBundles(Array.isArray(labels.value) ? labels.value : []);
    else { setFeatureBundles([]); problems.push('paid feature labels'); }
    setError(problems.length ? `Could not load ${problems.join(', ')}. No balance or payment has been assumed.` : '');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (section !== 'buy' || !wallet?.canManage) return;
    let active = true;
    creditWalletService.gatewayStatus()
      .then((status) => {
        if (active) { setGateway(status); setGatewayError(''); }
      })
      .catch(() => {
        if (active) { setGateway(null); setGatewayError('Could not load Razorpay test configuration.'); }
      });
    return () => { active = false; };
  }, [section, wallet?.canManage, wallet?.checkoutAvailable]);

  const testGatewayConnection = async () => {
    if (!gateway?.probeAvailable || gatewayBusy) return;
    setGatewayBusy(true);
    setGatewayProbe(null);
    try {
      const result = await creditWalletService.testGateway();
      setGatewayProbe({ ok: result.ok === true, message: result.message || 'Test completed.' });
    } catch (e) {
      setGatewayProbe({ ok: false, message: e?.message || 'Razorpay test API connection failed.' });
    } finally {
      setGatewayBusy(false);
    }
  };

  const buy = async (pack) => {
    setBusy(`package:${pack.id}`); setError(''); setNotice('');
    try {
      const receipt = await purchaseCredits(pack.id);
      setNotice(`Payment verified. ${credits(receipt.credits)} credits added to your wallet.`);
      await load();
      notifyCreditChange();
    } catch (e) { setError(e?.message || 'Payment not confirmed. Review your transaction logs.'); }
    finally { setBusy(''); }
  };

  const buyBundle = async (bundle) => {
    setBusy(`bundle:${bundle.id}`); setError(''); setNotice('');
    try {
      const result = await creditWalletService.purchaseBundle(bundle.id);
      setNotice(result?.chargedCredits === '0.00'
        ? 'This feature label is already permanently active.'
        : `${bundle.name} enabled. ${credits(result.chargedCredits)} credits charged by the server.`);
      await load();
      notifyCreditChange();
    } catch (e) { setError(e?.message || 'Label purchase could not be verified.'); }
    finally { setBusy(''); }
  };

  const stopBundle = async (bundle) => {
    setBusy(`bundle:${bundle.id}`); setError(''); setNotice('');
    try {
      await creditWalletService.disableBundle(bundle.id);
      setNotice(`${bundle.name} access disabled. Prepaid credits are not refunded.`);
      await load();
      notifyCreditChange();
    } catch (e) { setError(e?.message || 'Could not disable this feature label.'); }
    finally { setBusy(''); }
  };

  const toggle = async (feature) => {
    setBusy(`feature:${feature.key}`); setError(''); setNotice('');
    try {
      if (feature.enabled) await creditWalletService.disableFeature(feature.key);
      else await creditWalletService.enableFeature(feature.key);
      setNotice(feature.enabled ? `${feature.label} switched off.` : `${feature.label} activated. The quoted first 30-day charge was debited by the server.`);
      await load();
      notifyCreditChange();
    } catch (e) { setError(e?.message || 'Unable to change feature. Balance is unchanged unless the server confirms it.'); }
    finally { setBusy(''); }
  };

  const low = wallet?.lowBalance === true;
  const sections = {
    overview: ['Credit Overview', 'Track your live balance, active modules, staff charges and wallet usage.'],
    buy: ['Buy Credits', 'Add credits with secure Razorpay checkout. Only captured payments update your wallet.'],
    features: ['Feature Controls', 'Activate approved modules using your wallet balance. Pricing is set by the platform admin.'],
    logs: ['Credit Activity Logs', 'Review wallet top-ups, feature debits, adjustments and renewals.'],
  };
  const [title, subtitle] = sections[section] || sections.overview;

  return <div className="saas-page cg-credit-page">
    <AccountHeader title={title} subtitle={subtitle} active={section === 'buy' ? 'credits-buy' : section === 'features' ? 'credits-features' : section === 'logs' ? 'credits-logs' : 'overview'} onNavigate={navigate} actions={<button type="button" className="cg-credit-refresh" disabled={loading || Boolean(busy)} onClick={load}><RefreshCcw size={16} aria-hidden="true"/> Refresh</button>}/>
    {error && <div className="cg-credit-alert error" role="alert">{error} <button type="button" onClick={load}>Retry</button></div>}
    {notice && <div className="cg-credit-alert success" role="status">{notice}</div>}
    {loading && <p role="status" className="cg-credit-status">Loading your company wallet…</p>}

    <div className="cg-credit-metrics">
      <article className="cg-credit-metric primary">
        <div><span>Available Credits</span><Wallet size={22}/></div>
        <strong>{credits(wallet?.balance)}</strong>
        <small>{wallet ? (low ? 'Low balance — top up to avoid module interruption' : 'Verified company wallet balance') : 'Awaiting backend wallet'}</small>
      </article>
      <article className="cg-credit-metric"><div><span>Active Features</span><Zap size={20}/></div><strong>{wallet?.activeFeatures ?? '—'}</strong><small>Modules currently switched on</small></article>
      <article className="cg-credit-metric"><div><span>Active Staff</span><Users size={20}/></div><strong>{wallet?.staffCount ?? '—'}</strong><small>Used for per-staff feature pricing</small></article>
      <article className="cg-credit-metric"><div><span>Expected 30-day Charge</span><Coins size={20}/></div><strong>{credits(wallet?.monthlyCredits)}</strong><small>Credits, subject to staff-count changes</small></article>
    </div>

    {low && <div className="cg-credit-low" role="alert"><Coins size={20}/><div><strong>Your credit balance is running low.</strong><span>Buy more credits so paid modules can renew when due.</span></div><button onClick={() => navigate('/account/credits/buy')}>Buy Credits <ArrowRight size={16}/></button></div>}

    {section === 'overview' && <div className="cg-credit-columns">
      <section className="cg-credit-panel"><header><div><span>WALLET OVERVIEW</span><h2>Your credits at a glance</h2></div><Wallet size={22}/></header>
        <p>Buy credits as needed. You are not charged for a fixed subscription plan. Feature activation and renewals are recorded in the company ledger.</p>
        <div className="cg-credit-actions"><button className="primary" onClick={() => navigate('/account/credits/buy')}><CreditCard size={17}/> Buy Credits</button><button onClick={() => navigate('/account/credits/features')}>Manage Features <ArrowRight size={16}/></button></div>
        <div className="cg-credit-inline"><span>Low credit alert threshold</span><strong>{credits(wallet?.lowThreshold)} credits</strong></div>
        <div className="cg-credit-inline"><span>Staff billing basis</span><strong>{wallet?.staffCount ?? '—'} active staff accounts</strong></div>
      </section>
      <section className="cg-credit-panel"><header><div><span>RECENT ACTIVITY</span><h2>Latest wallet changes</h2></div><FileClock size={22}/></header>
        {logs.slice(0,5).map((row) => <div className="cg-credit-log" key={row.id}><div className={Number(row.delta) >= 0 ? 'in' : 'out'}>{Number(row.delta) >= 0 ? <ArrowDownLeft size={17}/> : <ArrowUpRight size={17}/>}</div><div><strong>{row.description}</strong><small>{when(row.createdAt)}</small></div><b>{Number(row.delta) > 0 ? '+' : ''}{credits(row.delta)}</b></div>)}
        {!logs.length && <p className="cg-credit-empty">No verified credit transactions available.</p>}
        <button className="cg-credit-link" onClick={() => navigate('/account/credits/logs')}>View all logs <ArrowRight size={16}/></button>
      </section>
      <section className="cg-credit-panel cg-credit-wide"><header><div><span>MANAGE YOUR TOOLS</span><h2>Features and storage</h2></div><Zap size={22}/></header>
        <div className="cg-credit-shortcuts"><button onClick={() => navigate('/account/credits/features')}><Zap size={19}/><strong>Feature Controls</strong><small>Enable modules and view 30-day prices</small><ArrowRight size={16}/></button><button onClick={() => navigate('/account/storage')}><Database size={19}/><strong>Storage Usage</strong><small>Files, GB and real storage event history</small><ArrowRight size={16}/></button><button onClick={() => navigate('/account/credits/logs')}><FileClock size={19}/><strong>Wallet Logs</strong><small>Charges, top-ups and adjustments</small><ArrowRight size={16}/></button></div>
      </section>
    </div>}

    {section === 'buy' && <section className="cg-credit-panel"><header><div><span>RAZORPAY TOP-UP</span><h2>Choose a credit package</h2></div><CreditCard size={22}/></header>
      <p>Package prices and credit amounts come from the server. No money or credits are created until Razorpay verifies a captured payment.</p>
      {wallet?.canManage && <div className="cg-credit-gateway" aria-label="Razorpay test connection">
        <div className="cg-credit-gateway-head">
          <div>
            <strong>Razorpay integration</strong>
            <p>{gateway
              ? `Mode: ${gateway.mode} · Credentials: ${gateway.configured ? 'present' : 'missing'} · Webhook secret: ${gateway.webhookSecretPresent ? 'present' : 'missing'}`
              : (gatewayError || 'Checking backend gateway settings…')}</p>
            <small>A successful test checks API credentials only. It does not create an order, debit money or add credits.</small>
          </div>
          <button type="button" className="primary"
            disabled={!gateway?.probeAvailable || gatewayBusy || busy !== ''}
            onClick={testGatewayConnection}>
            {gatewayBusy ? 'Testing connection…' : 'Test API Connection'}
          </button>
        </div>
        {gatewayProbe && <p role={gatewayProbe.ok ? 'status' : 'alert'} className={gatewayProbe.ok ? 'cg-gateway-result ok' : 'cg-gateway-result error'}>{gatewayProbe.message}</p>}
        {gateway?.mode === 'live' && <p className="cg-credit-note">The connection test is disabled for live keys. Use Razorpay test credentials during development.</p>}
      </div>}
      <div className="cg-credit-packages">{packages.filter(p => p.active).map((pack) => <article key={pack.id}>
        <span>ONE-TIME TOP-UP</span><h3>{pack.name}</h3><strong>{credits(pack.credits)} <small>credits</small></strong><p>{money(pack.priceInr)} payable</p><button className="primary" type="button" disabled={busy !== '' || !wallet?.checkoutAvailable || !wallet?.canManage} onClick={() => buy(pack)}>{busy === `package:${pack.id}` ? 'Opening checkout…' : 'Buy Credits'} <ArrowRight size={16}/></button>
      </article>)}</div>
      {!packages.some(p=>p.active) && !loading && <p className="cg-credit-empty">No credit packages have been published by the administrator.</p>}
      {wallet && !wallet.checkoutAvailable && <p className="cg-credit-note">Secure checkout is not configured on the backend yet. Buying credits is disabled.</p>}
      {wallet && !wallet.canManage && <p className="cg-credit-note">Only a company billing administrator can purchase credits.</p>}
      <p className="cg-credit-note"><ShieldCheck size={16}/> UPI, bank cards and net banking are provided by Razorpay when enabled for your merchant account.</p>
    </section>}

    {section === 'features' && <section className="cg-credit-panel cg-bundle-marketplace" aria-label="Paid feature labels">
      <header><div><span>FEATURE LABELS</span><h2>Ready-to-use module packages</h2></div><Coins size={22}/></header>
      <p>Buy a label to access the included existing modules together. Credits are deducted by the server, and your user role must still permit each module.</p>
      <div className="cg-bundle-grid">
        {featureBundles.map((bundle) => <article key={bundle.id} className="cg-bundle-card">
          <div className="cg-bundle-head"><h3>{bundle.name}</h3><span className={bundle.active ? 'cg-credit-pill active' : 'cg-credit-pill'}>{bundle.active ? 'Active' : 'Inactive'}</span></div>
          <p>{bundle.description || 'A grouped package of existing CubeGear features.'}</p>
          <div className="cg-bundle-price"><strong>{credits(bundle.priceCredits)}</strong> credits <small>/ {({ permanent:'lifetime', weekly:'7 days', daily:'24 hours', hourly:'hour', per_use:'use' })[bundle.billingType] || bundle.billingType}</small></div>
          <div className="cg-bundle-features">{bundle.features.map((item) => <span key={item.key}>{item.label}</span>)}</div>
          {bundle.active && <small>{bundle.validUntil ? `Available until ${when(bundle.validUntil)}` : 'Permanent entitlement'}</small>}
          {!bundle.meteredReady && <small>Per-use tracking must be connected to the selected backend actions before purchasing is available.</small>}
          <div className="cg-bundle-actions">
            <button className="primary" type="button" disabled={busy !== '' || !wallet?.canManage || !bundle.meteredReady || bundle.active && bundle.billingType === 'permanent'} onClick={() => buyBundle(bundle)}>
              {busy === `bundle:${bundle.id}` ? 'Saving…' : bundle.billingType === 'permanent' && bundle.active ? 'Owned permanently' : bundle.active ? 'Extend access' : 'Activate label'}
            </button>
            {bundle.active && <button className="secondary" type="button" disabled={busy !== '' || !wallet?.canManage} onClick={() => stopBundle(bundle)}>Disable</button>}
          </div>
        </article>)}
      </div>
      {!featureBundles.length && !loading && <p className="cg-credit-empty">No paid feature labels are published yet. The platform admin can create them in /features/.</p>}
      {wallet && !wallet.canManage && <p className="cg-credit-note">Only a company billing admin can purchase feature labels.</p>}
    </section>}

    {section === 'features' && <section className="cg-credit-panel"><header><div><span>OPTIONAL MODULES</span><h2>Enable or disable features</h2></div><Zap size={22}/></header>
      <p>Each feature costs a fixed amount plus an administrator-set amount per active staff member for every 30-day billing period. Enabling charges the first period upfront; turning off prevents future renewal, not refunds already charged.</p>
      <div className="cg-credit-features">{features.map((feature) => <article key={feature.key}>
        <div className="cg-credit-feature-main"><div><h3>{feature.label}</h3><p>{feature.description || 'Workshop management module'}</p></div><span className={feature.enabled ? 'cg-credit-pill active' : 'cg-credit-pill'}>{feature.enabled ? 'Active' : 'Off'}</span></div>
        <div className="cg-credit-feature-cost"><span>Base: <b>{credits(feature.baseCredits)} cr</b></span><span>Per staff: <b>{credits(feature.perStaffCredits)} cr</b></span><span>Total / 30 days: <b>{credits(feature.monthlyCredits)} cr</b></span></div>
        <div className="cg-credit-feature-footer"><small>{feature.enabled ? `Next charge: ${when(feature.nextChargeAt)}` : 'Not enabled'} · {feature.staffCount ?? '—'} staff</small><button type="button" disabled={busy !== '' || !feature.available || !wallet?.canManage} className={feature.enabled ? 'secondary' : 'primary'} onClick={() => toggle(feature)}>{busy === `feature:${feature.key}` ? 'Saving…' : feature.enabled ? 'Switch Off' : 'Enable Feature'}</button></div>
      </article>)}</div>
      {!features.length && !loading && <p className="cg-credit-empty">No feature pricing has been configured by the administrator.</p>}
      {wallet && !wallet.canManage && <p className="cg-credit-note">Only authorized company administrators can change paid features.</p>}
    </section>}

    {section === 'logs' && <section className="cg-credit-panel"><header><div><span>COMPANY AUDIT TRAIL</span><h2>Credit transaction log</h2></div><FileClock size={22}/></header>
      <div className="cg-credit-table-wrap"><table><thead><tr><th>Date & time</th><th>Activity</th><th>Credits</th><th>Balance after</th><th>Reference</th></tr></thead><tbody>
        {logs.map(row => <tr key={row.id}><td>{when(row.createdAt)}</td><td><strong>{row.description}</strong><small>{row.kind}</small></td><td className={Number(row.delta)>=0?'positive':'negative'}>{Number(row.delta)>0?'+':''}{credits(row.delta)}</td><td>{credits(row.balanceAfter)}</td><td>{row.reference || '—'}</td></tr>)}
        {!logs.length && <tr><td colSpan={5} className="cg-credit-empty">No credit transactions recorded.</td></tr>}
      </tbody></table></div>
      <p className="cg-credit-note">Logs are read-only and company-scoped. For storage upload/delete events, open <button onClick={() => navigate('/account/storage/history')}>Storage History <ArrowRight size={14}/></button>.</p>
    </section>}
  </div>;
}
