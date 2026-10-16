import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CreditCard, RefreshCcw, AlertTriangle, HardDrive, Files } from 'lucide-react';
import { creditCycleService } from '../../services/creditCycle.service';
import '../../styles/credit-cycle-account.css';

const amount = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value || 0));
const readable = (value) => value ? new Date(value).toLocaleString('en-IN') : '—';

export function CreditCycleCard() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCycle(await creditCycleService.status());
      setError('');
    } catch (exc) {
      setError(exc?.message || 'Unable to retrieve credit cycle invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const retry = async () => {
    setBusy(true);
    setMessage('');
    try {
      const value = await creditCycleService.retry();
      setCycle(value);
      setError('');
      setMessage(value.overdue ? 'Some invoices still need credits. Please top up and retry.' : 'Due invoices checked with the backend wallet.');
      window.dispatchEvent(new Event('cubegear:credits-updated'));
    } catch (exc) {
      setError(exc?.message || 'Unable to retry settlement.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="saas-card saas-wide cg-cycle-card" aria-label="Billing cycle, due date and usage invoices">
    <div className="saas-card-head">
      <div><span className="saas-kicker">WALLET / MONTHLY USAGE</span><h2>Credit billing cycle</h2></div>
      <CalendarClock size={22} aria-hidden="true"/>
    </div>
    {loading && <p role="status">Checking server billing cycle…</p>}
    {error && <p role="alert" className="cg-cycle-error">{error}</p>}
    {!loading && cycle && !cycle.enabled && <p className="saas-muted">Monthly postpaid cycle is not enabled by the CubeGears administrator. Existing credit and label policies remain in effect.</p>}
    {!loading && cycle?.enabled && <>
      <div className="cg-cycle-stats">
        <div><span>Billing window starts</span><strong>{readable(cycle.cycleStart)}</strong></div>
        <div><span>Next deduction date</span><strong>{readable(cycle.nextDueAt)}</strong></div>
        <div><span>Unpaid credits</span><strong>{amount(cycle.amountDue)} credits</strong></div>
        <div><span>Access</span><strong>{cycle.overdue ? 'Payment overdue — workshop paused' : 'Within billing terms'}</strong></div>
      </div>
      {cycle.overdue && <div className="cg-cycle-warning" role="alert"><AlertTriangle size={19}/>
        <span>Workshop screens are temporarily restricted because a due invoice is unpaid. Your SaaS Account, top-ups, storage history and invoices remain available. Nothing is deleted.</span></div>}
      <p className="saas-muted">Usage is measured from the 1st to the last day of each calendar month. Django freezes verified meter readings after month-end, then deducts wallet credits on day {cycle.dueDay || 5} of the next month. No bank-account auto-debit happens; zero-credit usage is permitted only when the administrator enables the grace policy.</p>
      <div className="cg-cycle-actions">
        <button type="button" className="saas-button" onClick={() => navigate('/account/credits/buy')}><CreditCard size={16}/> Buy credits</button>
        <button type="button" className="saas-button" disabled={busy} onClick={retry}><RefreshCcw size={16}/> {busy ? 'Checking…' : 'Pay due invoices from wallet'}</button>
        <button type="button" className="saas-button" disabled={loading} onClick={load}><RefreshCcw size={16}/> Refresh</button>
      </div>
      {message && <p role="status">{message}</p>}
      <div className="cg-cycle-scroll"><table><thead><tr><th>Cycle start</th><th>Due</th><th>Usage</th><th>Credits</th><th>Status</th></tr></thead><tbody>
        {(cycle.invoices || []).map((bill) => <tr key={bill.id}>
          <td>{bill.startsOn}</td><td>{readable(bill.dueAt)}</td><td>Storage GB-time + paid features</td>
          <td>{amount(bill.creditsDue)}</td><td>{bill.status}</td>
        </tr>)}
        {!cycle.invoices?.length && <tr><td colSpan={5}>No closed-cycle bills yet.</td></tr>}
      </tbody></table></div>
      <details className="cg-cycle-breakdown">
        <summary><Files size={16}/> File and feature invoice details (recorded snapshots)</summary>
        {(cycle.invoices || []).map((bill) => <div key={bill.id}>
          <strong>{bill.startsOn} · {amount(bill.creditsDue)} credits</strong>
          {(bill.details?.items || []).map((item, index) => <p key={index}>
            <HardDrive size={13} aria-hidden="true"/> {item.kind === 'storage' ? 'Storage GB-time' : item.feature}:
            {item.coveredSeconds} measured seconds, {amount(item.credits)} credits
          </p>)}
          {(bill.details?.fileEvents || []).map((file, index) => <p key={index}>
            <HardDrive size={13} aria-hidden="true"/> {file.filename} — {file.eventType} — {(file.bytes / 1048576).toFixed(2)} MB — {readable(file.at)}
          </p>)}
          {(bill.details?.labels || []).map((label, index) => <p key={index}>{label.label}: {label.seconds} recorded seconds, {amount(label.credits)} credits</p>)}
        </div>)}
      </details>
      <button className="saas-button" type="button" onClick={() => navigate('/account/storage/history')}>
        <HardDrive size={16}/> View recorded upload/delete file logs
      </button>
    </>}
  </section>;
}
