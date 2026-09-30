import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, HardDrive, History, IndianRupee, Infinity, ReceiptText, ShieldCheck, Trash2, Upload, Users } from 'lucide-react';
import { saasAccountService } from '../../services/saasAccount.service';
import { storageHistoryService } from '../../services/storageHistory.service';
import { STORAGE_PRICE_PER_GB_DAY, storageDayCharge } from '../../services/storagePricing';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const iso = (value) => new Date(value).toISOString().slice(0, 10);

function BillingView({ billing, storage, onSeatsChange }) {
  const estimate = useMemo(() => saasAccountService.calculateMonthlyEstimate(billing), [billing]);
  const todayStorage = storageDayCharge(storage.usedGb);
  return (
    <div className="saas-grid">
      <section className="saas-card saas-plan-card">
        <div className="saas-card-head"><div><span className="saas-kicker">CURRENT PLAN</span><h2>{billing.plan.name}</h2></div><span className="saas-status">{billing.plan.status}</span></div>
        <div className="saas-price">{money.format(billing.plan.basePrice)}<span>/month</span></div>
        <div className="saas-details-grid">
          <div><span>Media storage</span><strong>Unlimited</strong></div>
          <div><span>Storage billing</span><strong>₹{STORAGE_PRICE_PER_GB_DAY} / GB / day</strong></div>
          <div><span>Included users</span><strong>{billing.plan.includedSeats}</strong></div>
          <div><span>Next bill</span><strong>{date.format(new Date(billing.plan.nextBillingDate))}</strong></div>
        </div>
      </section>

      <section className="saas-card">
        <div className="saas-card-head"><div><span className="saas-kicker">CURRENT ESTIMATE</span><h2>{money.format(estimate.total + todayStorage)}</h2></div><ReceiptText size={22} /></div>
        <div className="saas-breakdown">
          <div><span>Plan</span><strong>{money.format(estimate.base)}</strong></div>
          <div><span>Storage today ({storage.usedGb} GB × ₹{STORAGE_PRICE_PER_GB_DAY})</span><strong>{money.format(todayStorage)}</strong></div>
          <div><span>Extra users ({estimate.extraSeats})</span><strong>{money.format(estimate.seatCharge)}</strong></div>
          <div><span>GST estimate</span><strong>{money.format(estimate.tax)}</strong></div>
          <div className="total"><span>Current estimate</span><strong>{money.format(estimate.total + todayStorage)}</strong></div>
        </div>
      </section>

      <section className="saas-card">
        <div className="saas-card-head"><div><span className="saas-kicker">USAGE</span><h2>Account users</h2></div><Users size={22} /></div>
        <label className="saas-field"><span>Active users</span><input type="number" min="1" value={billing.usage.seatsUsed} onChange={(e) => onSeatsChange(Number(e.target.value))} /></label>
        <div className="saas-meter"><div style={{ width: `${Math.min(100, (billing.usage.seatsUsed / billing.plan.includedSeats) * 100)}%` }} /></div>
        <p className="saas-muted">Storage has no fixed limit. Usage is billed daily at ₹{STORAGE_PRICE_PER_GB_DAY} per GB.</p>
      </section>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">BILL HISTORY</span><h2>Subscription invoices</h2></div><CalendarDays size={22} /></div>
        <div className="saas-table-wrap"><table className="saas-table"><thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th><th>Paid</th></tr></thead><tbody>{billing.invoices.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.period}</td><td>{money.format(item.amount)}</td><td><span className="saas-status">{item.status}</span></td><td>{date.format(new Date(item.paidAt))}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function StorageView({ storage, setStorage }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState('Job Card');
  const [history, setHistory] = useState([]);
  const [audit, setAudit] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cubixgear-storage-audit') || '[]'); } catch { return []; }
  });
  const [rangePreset, setRangePreset] = useState('7');
  const [to, setTo] = useState(iso(new Date()));
  const [from, setFrom] = useState(iso(new Date(Date.now() - 6 * 86400000)));
  const todayCharge = storageDayCharge(storage.usedGb);

  const summary = useMemo(() => storageHistoryService.summarizeStorageHistory(history), [history]);

  const refreshHistory = async (nextFrom = from, nextTo = to) => setHistory(await storageHistoryService.getStorageHistory({ from: nextFrom, to: nextTo }));

  useEffect(() => { refreshHistory(); }, []);

  const log = (action, details) => {
    const next = [{ id: Date.now(), at: new Date().toISOString(), action, details, user: 'Current User' }, ...audit].slice(0, 100);
    setAudit(next);
    localStorage.setItem('cubixgear-storage-audit', JSON.stringify(next));
  };

  const choosePreset = (value) => {
    setRangePreset(value);
    const end = new Date();
    let start;
    if (value === 'month') start = new Date(end.getFullYear(), end.getMonth(), 1);
    else start = new Date(end.getTime() - (Number(value) - 1) * 86400000);
    const nextFrom = iso(start);
    const nextTo = iso(end);
    setFrom(nextFrom);
    setTo(nextTo);
    refreshHistory(nextFrom, nextTo);
  };

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    const valid = files.filter((file) => storage.settings.allowedTypes.includes(file.type) && file.size <= storage.settings.maxFileMb * 1024 * 1024);
    if (!valid.length) return;
    const next = await saasAccountService.uploadMediaFiles(valid, category);
    setStorage(next);
    await storageHistoryService.recordTodayStorageSnapshot(next);
    await refreshHistory();
    log('UPLOAD', `${valid.length} photo(s) uploaded to ${category}`);
    event.target.value = '';
  };

  const remove = async (ids) => {
    if (!ids.length || !window.confirm(`Delete ${ids.length} photo(s)? This cannot be undone.`)) return;
    const next = await saasAccountService.deleteMediaFiles(ids);
    setStorage(next);
    await storageHistoryService.recordTodayStorageSnapshot(next);
    await refreshHistory();
    log('DELETE', `${ids.length} photo(s) deleted`);
    setSelected((old) => old.filter((id) => !ids.includes(id)));
  };

  const setting = async (key, value) => {
    const next = await saasAccountService.updateStorageSettings({ [key]: value });
    setStorage(next);
    log('SETTINGS', `${key} changed to ${String(value)}`);
  };

  return (
    <div className="saas-grid">
      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">MEDIA STORAGE</span><h2>Unlimited storage</h2></div><Infinity size={24} /></div>
        <div className="saas-storage-summary">
          <div><span>Currently stored</span><strong>{storage.usedGb} GB</strong></div>
          <div><span>Rate</span><strong>₹{STORAGE_PRICE_PER_GB_DAY} / GB / day</strong></div>
          <div><span>Today’s charge</span><strong>{money.format(todayCharge)}</strong></div>
        </div>
        <div className="saas-storage-actions">
          <select value={category} onChange={(e) => setCategory(e.target.value)}><option>Job Card</option><option>Inspection</option><option>Invoice</option><option>Delivery</option><option>General</option></select>
          <label className="saas-button"><Upload size={18} /> Upload photos<input hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label>
          <button className="saas-button danger" disabled={!selected.length} onClick={() => remove(selected)}><Trash2 size={18} /> Delete selected</button>
        </div>
        <p className="saas-muted">No storage cap. Billing is calculated from each day’s recorded storage snapshot.</p>
      </section>

      <section className="saas-card saas-wide storage-history-card">
        <div className="saas-card-head"><div><span className="saas-kicker">USAGE INTERVAL</span><h2>Storage billing history</h2></div><IndianRupee size={22} /></div>
        <div className="storage-range-toolbar">
          <div className="storage-range-presets">
            <button className={rangePreset === '7' ? 'active' : ''} onClick={() => choosePreset('7')}>Last 7 days</button>
            <button className={rangePreset === '30' ? 'active' : ''} onClick={() => choosePreset('30')}>Last 30 days</button>
            <button className={rangePreset === 'month' ? 'active' : ''} onClick={() => choosePreset('month')}>This month</button>
          </div>
          <div className="storage-custom-range">
            <label><span>From</span><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setRangePreset('custom'); }} /></label>
            <label><span>To</span><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setRangePreset('custom'); }} /></label>
            <button onClick={() => refreshHistory()}>Apply</button>
          </div>
        </div>

        <div className="storage-interval-summary">
          <div><span>Days</span><strong>{summary.days}</strong></div>
          <div><span>Average storage</span><strong>{summary.averageGb.toFixed(2)} GB</strong></div>
          <div><span>Peak storage</span><strong>{summary.peakGb.toFixed(2)} GB</strong></div>
          <div><span>Interval charge</span><strong>{money.format(summary.totalCharge)}</strong></div>
        </div>

        <div className="storage-history-list">
          {history.map((row) => (
            <button key={row.date} className="storage-history-row" onClick={() => navigate(`/account/storage/history/${row.date}`)}>
              <div><strong>{date.format(new Date(`${row.date}T00:00:00`))}</strong><span>{row.fileCount} files</span></div>
              <div><span>Stored</span><strong>{row.usedGb} GB</strong></div>
              <div><span>Charge</span><strong>{money.format(row.charge)}</strong></div>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="saas-card">
        <div className="saas-card-head"><div><span className="saas-kicker">STORAGE SETTINGS</span><h2>Upload policy</h2></div><ShieldCheck size={22} /></div>
        {[
          ['autoCompress', 'Compress uploads'],
          ['keepOriginals', 'Keep original files'],
          ['allowStaffUpload', 'Staff can upload'],
          ['allowStaffDelete', 'Staff can delete']
        ].map(([key, label]) => <label className="saas-toggle" key={key}><span>{label}</span><input type="checkbox" checked={Boolean(storage.settings[key])} onChange={(e) => setting(key, e.target.checked)} /></label>)}
        <label className="saas-field"><span>Auto-delete after days (0 = never)</span><input type="number" min="0" value={storage.settings.retentionDays} onChange={(e) => setting('retentionDays', Number(e.target.value))} /></label>
      </section>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">FILES</span><h2>Current uploaded photos</h2></div><span>{storage.files.length} files</span></div>
        <div className="saas-media-list">{storage.files.map((file) => <article className="saas-media-row" key={file.id}><input type="checkbox" checked={selected.includes(file.id)} onChange={(e) => setSelected((old) => e.target.checked ? [...old, file.id] : old.filter((id) => id !== file.id))} /><div className="saas-file-icon">IMG</div><div className="saas-file-main"><strong>{file.name}</strong><span>{file.category} · {file.sizeMb} MB · {file.uploadedBy}</span></div><span className="saas-file-date">{date.format(new Date(file.uploadedAt))}</span><button className="saas-icon-button" aria-label={`Delete ${file.name}`} onClick={() => remove([file.id])}><Trash2 size={17} /></button></article>)}</div>
      </section>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">AUDIT LOG</span><h2>Storage activity</h2></div><History size={22} /></div>
        {audit.length ? <div className="saas-table-wrap"><table className="saas-table"><thead><tr><th>Date & time</th><th>Action</th><th>Details</th><th>User</th></tr></thead><tbody>{audit.map((item) => <tr key={item.id}><td>{dateTime.format(new Date(item.at))}</td><td>{item.action}</td><td>{item.details}</td><td>{item.user}</td></tr>)}</tbody></table></div> : <p className="saas-muted">No storage activity recorded yet.</p>}
      </section>
    </div>
  );
}

export function SaaSAccount({ section = 'billing' }) {
  const [billing, setBilling] = useState(null);
  const [storage, setStorage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([saasAccountService.getSubscriptionBilling(), saasAccountService.getStorageAccount()])
      .then(([billingData, storageData]) => { setBilling(billingData); setStorage(storageData); storageHistoryService.recordTodayStorageSnapshot(storageData); })
      .catch(() => setError('Could not load SaaS account data.'));
  }, []);

  const seats = async (value) => setBilling(await saasAccountService.updateSeatCount(value));
  if (error) return <div className="saas-page"><div className="saas-error">{error}</div></div>;
  if (!billing || !storage) return <div className="saas-page"><div className="saas-loading">Loading account…</div></div>;

  billing.usage.storageUsedGb = storage.usedGb;

  return <div className="saas-page"><header className="saas-page-head"><div><span className="saas-kicker">CUBIXGEAR SaaS</span><h1>{section === 'storage' ? 'Media Storage' : 'Billing & Plan'}</h1><p>{section === 'storage' ? 'Unlimited photo storage billed at ₹2 per GB per day with interval history and daily file snapshots.' : 'Track software billing, users, storage usage and subscription history.'}</p></div></header>{section === 'storage' ? <StorageView storage={storage} setStorage={setStorage} /> : <BillingView billing={billing} storage={storage} onSeatsChange={seats} />}</div>;
}
