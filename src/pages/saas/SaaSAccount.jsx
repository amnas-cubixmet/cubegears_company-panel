import { appConfirm } from '../../components/common/appDialogs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, CreditCard, FilePenLine, IndianRupee, Infinity, ReceiptText, ShieldCheck, Trash2, Upload, Users } from 'lucide-react';
import { saasAccountService } from '../../services/saasAccount.service';
import { settingsService } from '../../services/settings.service';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { useAuth } from '../../hooks/useAuth';
import { USE_MOCK_API } from '../../api/apiConfig';
import { storageHistoryService } from '../../services/storageHistory.service';
import { AccountHeader, AccountOverview } from '../../components/account';
import '../../styles/account-billing.css';
import '../../styles/account-dashboard.css';
import '../../styles/account-overview-refined.css';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const iso = (value) => new Date(value).toISOString().slice(0, 10);

function BillingView({ billing, storage, onOpenTemplates }) {
  const navigate = useNavigate();
  const estimate = useMemo(() => billing ? saasAccountService.calculateMonthlyEstimate(billing) : null, [billing]);
  const plan = billing?.plan;
  const nextRenewal = plan?.nextBillingDate ? date.format(new Date(plan.nextBillingDate)) : '—';
  const actualUsers = billing?.usage?.seatsUsed;
  const seats = Number(plan?.includedSeats || 0);
  return (
    <div className="saas-grid">
      <section className="saas-card saas-wide saas-template-entry">
        <div className="saas-card-head">
          <div><span className="saas-kicker">DOCUMENTS</span><h2>Invoice & Estimate Templates</h2></div>
          <FilePenLine size={22}/>
        </div>
        <p className="saas-muted">Configure invoice and estimate styles and company document details.</p>
        <button type="button" className="saas-button" onClick={onOpenTemplates}>
          <FilePenLine size={17}/> Open Template Designer
        </button>
      </section>
      <section className="saas-card saas-wide">
        <div className="saas-card-head">
          <div><span className="saas-kicker">RAZORPAY SUBSCRIPTION</span><h2>Manage your plan and payment history</h2></div>
          <CreditCard size={22}/>
        </div>
        <p className="saas-muted">Select a plan, complete a secure one-time Razorpay payment, renew access, or review previous payments.</p>
        <button type="button" className="saas-button" onClick={() => navigate('/subscribe')}>
          Open subscription &amp; payments <ChevronRight size={17}/>
        </button>
      </section>
      <section className="saas-card saas-plan-card">
        <div className="saas-card-head">
          <div><span className="saas-kicker">SUBSCRIPTION</span>
            <h2>{plan?.name || 'Subscription unavailable'}</h2></div>
          <span className="saas-status">{plan?.status || 'Unavailable'}</span>
        </div>
        <div className="saas-price">
          {plan?.basePrice == null ? '—' : money.format(plan.basePrice)}
          <span>{plan?.billingCycle ? '/' + plan.billingCycle : 'No active recurring charge'}</span>
        </div>
        <div className="saas-details-grid">
          <div><span>Included users</span><strong>{plan?.includedSeats ?? '—'}</strong></div>
          <div><span>Billing renewal</span><strong>{nextRenewal}</strong></div>
          <div><span>Active accounts</span><strong>{actualUsers ?? '—'}</strong></div>
          <div><span>Current media</span><strong>{storage?.usedGb == null ? '—' : storage.usedGb + ' GB'}</strong></div>
        </div>
        <button type="button" className="saas-button" onClick={onOpenPlans}>Compare / Change Plan <ChevronRight size={15}/></button>
        {billing?.billingNote && <p className="saas-muted saas-billing-note">{billing.billingNote}</p>}
      </section>
      <section className="saas-card">
        <div className="saas-card-head"><div>
          <span className="saas-kicker">PLAN ESTIMATE</span><h2>Estimated monthly amount</h2>
        </div><ReceiptText size={22}/></div>
        {estimate ? (
          <div className="saas-breakdown">
            <div><span>Plan base</span><strong>{money.format(estimate.base)}</strong></div>
            <div><span>Seats above plan ({estimate.extraSeats})</span>
              <strong>{plan?.extraSeatRate == null ? 'Not configured' : money.format(estimate.seatCharge)}</strong></div>
            <div><span>Estimated GST (18%)</span><strong>{money.format(estimate.tax)}</strong></div>
            <div className="total"><span>Indicative subtotal</span><strong>{money.format(estimate.total)}</strong></div>
          </div>
        ) : <p className="saas-muted">
          No verified subscription rate is configured. Plan charges cannot be estimated.
        </p>}
        <p className="saas-muted">Estimates are informational only; this is not an issued subscription invoice.</p>
      </section>
      <section className="saas-card">
        <div className="saas-card-head"><div><span className="saas-kicker">USER ACCESS</span>
          <h2>Active login accounts</h2></div><Users size={22}/></div>
        <div className="saas-account-readonly-users">
          <strong>{actualUsers ?? '—'}</strong>
          <span>Actual active users from your company</span>
        </div>
        {seats > 0 && actualUsers != null && (
          <div className="saas-meter"><div style={{
            width: Math.min(100, Math.max(0, Number(actualUsers) / seats * 100)) + '%',
          }}/></div>
        )}
        <p className="saas-muted">
          User count updates automatically when staff accounts are activated/deactivated.
          It cannot be edited manually.
        </p>
      </section>
      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">BILL HISTORY</span>
          <h2>Subscription invoices</h2></div><CalendarDays size={22}/></div>
        {billing?.invoices?.length ? (
          <div className="saas-table-wrap"><table className="saas-table">
            <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th><th>Paid</th></tr></thead>
            <tbody>{billing.invoices.map((item) => <tr key={item.id}>
              <td>{item.id}</td><td>{item.period || '—'}</td><td>{money.format(item.amount)}</td>
              <td>{item.status || '—'}</td>
              <td>{item.paidAt ? date.format(new Date(item.paidAt)) : '—'}</td>
            </tr>)}</tbody>
          </table></div>
        ) : <p className="saas-muted">No verified subscription invoices available.</p>}
      </section>
    </div>
  );
}

function StorageView({ storage, setStorage }) {
  const access = useFeatureAccess();
  const canManage = access.can('storage.manage');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [storageError, setStorageError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [storageBusy, setStorageBusy] = useState(false);
  const [selected, setSelected] = useState([]);
  const [category, setCategory] = useState('Job Card');
  const [history, setHistory] = useState([]);
  const [serverEvents, setServerEvents] = useState([]);
  const [eventCount, setEventCount] = useState(0);
  const [eventError, setEventError] = useState('');
  const [eventsLoading, setEventsLoading] = useState(!USE_MOCK_API);
  const [audit, setAudit] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cubixgear-storage-audit') || '[]'); } catch { return []; }
  });
  const [rangePreset, setRangePreset] = useState('7');
  const [to, setTo] = useState(iso(new Date()));
  const [from, setFrom] = useState(iso(new Date(Date.now() - 6 * 86400000)));

  const summary = useMemo(() => storageHistoryService.summarizeStorageHistory(history), [history]);

  const refreshHistory = async (nextFrom = from, nextTo = to) => {
    try {
      const rows = await storageHistoryService.getStorageHistory({ from: nextFrom, to: nextTo });
      setHistory(Array.isArray(rows) ? rows : []);
      setHistoryError('');
    } catch (error) {
      setHistoryError(error?.message || 'Could not load storage history.');
      setHistory([]);
    }
  };

  const refreshEvents = async (start = from, end = to, append = false) => {
    if (USE_MOCK_API) return;
    setEventsLoading(true);
    try {
      const payload = await storageHistoryService.getStorageEvents({ from: start, to: end, offset: append ? serverEvents.length : 0 });
      setServerEvents(old => append ? [...old, ...(payload?.results || [])] : (payload?.results || []));
      setEventCount(payload?.count || 0);
      setEventError('');
    } catch (error) {
      setServerEvents([]);
      setEventError(error?.message || 'Could not retrieve storage activity.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    refreshHistory();
    refreshEvents();
  }, []);

  const log = (action, details) => {
    if (!USE_MOCK_API) return;
    const next = [{ id: Date.now(), at: new Date().toISOString(), action, details, user: user?.name || 'Local Account' }, ...audit].slice(0, 100);
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
    refreshEvents(nextFrom, nextTo);
  };

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    const valid = files.filter((file) =>
      storage.settings.allowedTypes.includes(file.type) &&
      file.size <= storage.settings.maxFileMb * 1024 * 1024);
    event.target.value = '';
    if (!valid.length) return setStorageError('Select JPG, PNG or WebP images within the allowed file size.');
    setStorageBusy(true); setStorageError('');
    try {
      const next = await saasAccountService.uploadMediaFiles(valid, category);
      setStorage(next);
      await storageHistoryService.recordTodayStorageSnapshot(next);
      await refreshHistory();
      await refreshEvents();
      log('UPLOAD', `${valid.length} photo(s) uploaded to ${category}`);
    } catch (error) {
      setStorageError(error?.message || 'Upload failed. Please retry.');
    } finally { setStorageBusy(false); }
  };

  const remove = async (ids) => {
    if (!ids.length || !await appConfirm(`Delete ${ids.length} photo(s)? This cannot be undone.`)) return;
    setStorageBusy(true); setStorageError('');
    try {
      const next = await saasAccountService.deleteMediaFiles(ids);
      setStorage(next);
      await storageHistoryService.recordTodayStorageSnapshot(next);
      await refreshHistory();
      await refreshEvents();
      log('DELETE', `${ids.length} photo(s) deleted`);
      setSelected((old) => old.filter((id) => !ids.includes(id)));
    } catch (error) {
      setStorageError(error?.message || 'Unable to delete selected media.');
    } finally { setStorageBusy(false); }
  };

  const setting = async (key, value) => {
    setStorageBusy(true); setStorageError('');
    try {
      const next = await saasAccountService.updateStorageSettings({ [key]: value });
      setStorage(next);
      log('SETTINGS', `${key} changed to ${String(value)}`);
    } catch (error) {
      setStorageError(error?.message || 'Unable to save storage settings.');
    } finally { setStorageBusy(false); }
  };

  return (
    <div className="saas-grid">
      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">MEDIA STORAGE</span><h2>Media storage usage</h2></div><Infinity size={24} /></div>
        <div className="saas-storage-summary">
          <div><span>Currently stored</span><strong>{storage.usedGb} GB</strong></div>
          <div><span>Uploaded files</span><strong>{storage.files.length}</strong></div>
          <div><span>History</span><strong>Upload and delete events</strong></div>
        </div>
        {canManage && <div className="saas-storage-actions">
          <select value={category} onChange={(e) => setCategory(e.target.value)}><option>Job Card</option><option>Inspection</option><option>Invoice</option><option>Delivery</option><option>General</option></select>
          <label className="saas-button"><Upload size={18} /> {storageBusy ? 'Working…' : 'Upload photos'}<input hidden multiple disabled={storageBusy} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label>
          <button className="saas-button danger" disabled={!selected.length || storageBusy} onClick={() => remove(selected)}><Trash2 size={18} /> Delete selected</button>
        </div>}
        <p className="saas-muted">
          Storage totals come from your uploaded files. Upload and deletion events are shown in Storage History.
        </p>
        {storageError && <p className="saas-error" role="alert">{storageError}</p>}
      </section>

      {storage.billing && <section className="saas-card saas-wide"><h2>Storage billing</h2>
        <p>{storage.billing.creditsPerGb} credits / GB / {storage.billing.period}. Free allowance: {storage.billing.includedGb} GB.</p>
        <p>Meter interval: {storage.billing.meterIntervalSeconds} seconds. {storage.billing.active ? 'Billing enabled' : 'Billing disabled'}.</p>
        <p>Deleting a file stops future storage use; previously recorded usage remains payable. Monthly charges and due dates appear in Account → Logs.</p>
      </section>}
      <section className="saas-card saas-wide storage-history-card">
        <div className="saas-card-head"><div><span className="saas-kicker">USAGE INTERVAL</span><h2>Storage usage history</h2></div><IndianRupee size={22} /></div>
        <div className="storage-range-toolbar">
          <div className="storage-range-presets">
            <button className={rangePreset === '7' ? 'active' : ''} onClick={() => choosePreset('7')}>Last 7 days</button>
            <button className={rangePreset === '30' ? 'active' : ''} onClick={() => choosePreset('30')}>Last 30 days</button>
            <button className={rangePreset === 'month' ? 'active' : ''} onClick={() => choosePreset('month')}>This month</button>
          </div>
          <div className="storage-custom-range">
            <label><span>From</span><input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setRangePreset('custom'); }} /></label>
            <label><span>To</span><input type="date" value={to} onChange={(e) => { setTo(e.target.value); setRangePreset('custom'); }} /></label>
            <button onClick={() => { refreshHistory(); refreshEvents(); }}>Apply</button>
          </div>
        </div>

        <div className="storage-interval-summary">
          <div><span>Days</span><strong>{summary.days}</strong></div>
          <div><span>Average storage</span><strong>{summary.averageGb.toFixed(2)} GB</strong></div>
          <div><span>Peak storage</span><strong>{summary.peakGb.toFixed(2)} GB</strong></div>
          <div><span>Snapshots</span><strong>{history.length}</strong></div>
        </div>

        {historyError && <p className="saas-error" role="alert">{historyError}</p>}
        {!history.length && !historyError && <p className="saas-muted">
          No recorded storage snapshots in this range yet.
        </p>}
        <div className="storage-history-list">
          {history.map((row) => (
            <button key={row.date} className="storage-history-row" onClick={() => navigate(`/account/storage/history/${row.date}`)}>
              <div><strong>{date.format(new Date(`${row.date}T00:00:00`))}</strong><span>{row.fileCount} files</span></div>
              <div><span>Stored</span><strong>{row.usedGb} GB</strong></div>
              <div><span>Files</span><strong>{row.fileCount}</strong></div>
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
        ].map(([key, label]) => <label className="saas-toggle" key={key}><span>{label}</span><input type="checkbox" checked={Boolean(storage.settings[key])} disabled={storageBusy || !canManage} onChange={(e) => setting(key, e.target.checked)} /></label>)}
        <label className="saas-field"><span>Auto-delete after days (0 = never)</span><input type="number" min="0" disabled={!canManage} value={storage.settings.retentionDays} onChange={(e) => setting('retentionDays', Number(e.target.value))} /></label>
      </section>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">FILES</span><h2>Current uploaded photos</h2></div><span>{storage.files.length} files</span></div>
        <div className="saas-media-list">{storage.files.map((file) => <article className="saas-media-row" key={file.id}><input type="checkbox" disabled={!canManage} checked={selected.includes(file.id)} onChange={(e) => setSelected((old) => e.target.checked ? [...old, file.id] : old.filter((id) => id !== file.id))} /><div className="saas-file-icon">IMG</div><div className="saas-file-main"><strong>{file.name}</strong><span>{file.category} · {file.sizeMb} MB · {file.uploadedBy}</span></div><span className="saas-file-date">{date.format(new Date(file.uploadedAt))}</span><button className="saas-icon-button" disabled={!canManage} aria-label={`Delete ${file.name}`} onClick={() => remove([file.id])}><Trash2 size={17} /></button></article>)}</div>
      </section>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">{USE_MOCK_API ? 'LOCAL ACTIVITY' : 'SERVER AUDIT LOG'}</span><h2>{USE_MOCK_API ? 'Storage actions on this browser' : 'Recorded storage activity'}</h2></div><button className="saas-button" onClick={() => navigate('/account/storage/history')}>View full history <ChevronRight size={16} /></button></div>
        <p className="saas-muted">{USE_MOCK_API ? 'Demo activity is stored in this browser.' : 'Upload and delete events are recorded in your company database. Browse recorded events for the selected date range. Deleted-file names remain in the log.'}</p>
        {USE_MOCK_API ? (
          audit.length ? <div className="saas-table-wrap"><table className="saas-table"><thead><tr><th>Date & time</th><th>Action</th><th>Details</th><th>User</th></tr></thead><tbody>{audit.map((item) => <tr key={item.id}><td>{dateTime.format(new Date(item.at))}</td><td>{item.action}</td><td>{item.details}</td><td>{item.user}</td></tr>)}</tbody></table></div> : <p className="saas-muted">No local storage activity recorded yet.</p>
        ) : eventsLoading ? (
          <p className="saas-loading">Loading server storage activity…</p>
        ) : eventError ? (
          <p className="saas-error" role="alert">{eventError}</p>
        ) : serverEvents.length ? (
          <div className="saas-table-wrap"><table className="saas-table"><thead><tr><th>Date & time</th><th>Action</th><th>File</th><th>Storage change</th><th>Performed by</th></tr></thead><tbody>{serverEvents.map((event) => (
            <tr key={event.id}>
              <td>{dateTime.format(new Date(event.occurredAt))}</td>
              <td>{event.eventType}</td>
              <td>{event.filename}</td>
              <td>{event.deltaBytes > 0 ? '+' : ''}{(event.deltaBytes / (1024 * 1024)).toFixed(2)} MB</td>
              <td>{event.actor || 'System'}</td>
            </tr>
          ))}</tbody></table></div>
        ) : <p className="saas-muted">No server-recorded events for this period.</p>}
        {serverEvents.length < eventCount && <button className="saas-button" disabled={eventsLoading} onClick={() => refreshEvents(from, to, true)}>Load more storage events ({serverEvents.length} / {eventCount})</button>}
      </section>
    </div>
  );
}

export function SaaSAccount({ section = 'billing' }) {
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [storage, setStorage] = useState(null);
  const [company, setCompany] = useState(null);
  const [companyError, setCompanyError] = useState('');
  const [sourceErrors, setSourceErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [bill, media, companyResult] = await Promise.allSettled([
      section === 'billing' ? saasAccountService.getSubscriptionBilling() : Promise.resolve(null),
      saasAccountService.getStorageAccount(),
      section === 'storage' ? Promise.resolve(null) : settingsService.getSettings('company'),
    ]);
    const errors = {};
    if (bill.status === 'fulfilled') setBilling(bill.value);
    else { errors.billing = bill.reason?.message || 'Unable to load billing.'; setBilling(null); }
    if (media.status === 'fulfilled') {
      setStorage(media.value);
      storageHistoryService.recordTodayStorageSnapshot(media.value).catch(() => {});
    } else { errors.storage = media.reason?.message || 'Unable to load media storage.'; setStorage(null); }
    if (companyResult.status === 'fulfilled') {
      setCompany(companyResult.value); setCompanyError('');
    } else {
      setCompany(null);
      setCompanyError(companyResult.reason?.message || 'Company details unavailable.');
    }
    setSourceErrors(errors);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveCompany = async (nextCompany) => {
    const updated = await settingsService.updateSettings('company', nextCompany);
    setCompany((current) => ({ ...current, ...nextCompany, ...updated }));
    return updated;
  };

  return (
    <div className="saas-page account-billing-page">
      <AccountHeader
        title={section === 'overview' ? 'Account Overview'
          : section === 'storage' ? 'Media Storage' : 'Billing & Plan'}
        subtitle={section === 'overview'
          ? 'Your company account, users, billing, settings and security in one place.'
          : section === 'storage'
            ? 'Manage uploaded media and review server-recorded file activity.'
            : 'Account information and usage.'}
        active={section}
        onNavigate={navigate}
      />
      {loading && <div className="saas-loading" role="status">Loading account information…</div>}
      {Object.keys(sourceErrors).length > 0 && (
        <div className="saas-error" role="alert">
          Some account data could not load: {Object.keys(sourceErrors).join(', ')}.
          <button type="button" className="saas-retry" onClick={load}>Retry</button>
        </div>
      )}
      {section === 'overview' ? (
        <AccountOverview billing={billing} storage={storage}
          company={company} companyError={companyError}
          onSaveCompany={saveCompany} onReload={load} loading={loading}
          onNavigate={navigate}/>
      ) : section === 'storage' ? (
        storage ? <StorageView storage={storage} setStorage={setStorage}/>
          : !loading && <div className="saas-error">Storage information unavailable. Retry loading your account.</div>
      ) : (
        <BillingView billing={billing} storage={storage}
          onOpenTemplates={() => navigate('/account/templates')}
          onOpenPlans={() => navigate('/account/plans')}/>
      )}
    </div>
  );
}
