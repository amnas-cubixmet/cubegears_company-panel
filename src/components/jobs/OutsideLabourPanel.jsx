import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, HardHat, Plus, RefreshCcw, TrendingUp, Trash2, Wallet } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { outsideLabourService } from '../../services/outsideLabour.service';

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value || 0));

const blank = (jobId = '') => ({
  job: jobId, workerName: '', workerPhone: '', workDescription: '',
  customerCharge: '', workerCharge: '', markPaid: false,
  paymentMethod: 'Cash', paymentReference: '',
});

const errorText = (error) => {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return error?.message || 'Unable to save outside labour.';
};

export const OutsideLabourPanel = ({ jobId, jobs = [], onChanged }) => {
  const { user } = useAuth();
  const canView = hasPermission(user, 'expenses.view');
  const canCreate = hasPermission(user, 'expenses.create');
  const canDelete = hasPermission(user, 'expenses.delete');
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(() => blank(jobId));
  const [payTarget, setPayTarget] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payReference, setPayReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('All');
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const refresh = async () => {
    if (!canView) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      setRows(await outsideLabourService.list(jobId ? { job: jobId } : {}));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setForm(blank(jobId));
    refresh();
  }, [jobId, canView]);

  const totals = useMemo(() => rows.reduce((value, row) => {
    value.customer += Number(row.customerCharge || 0);
    value.worker += Number(row.workerCharge || 0);
    if (row.status === 'Paid') value.paid += Number(row.workerCharge || 0);
    else value.pending += Number(row.workerCharge || 0);
    return value;
  }, { customer: 0, worker: 0, pending: 0, paid: 0 }), [rows]);

  const visibleRows = useMemo(() => rows.filter((row) => filter === 'All' || row.status === filter), [rows, filter]);

  const save = async (event) => {
    event.preventDefault();
    if (saving || !canCreate) return;
    if (!form.job || !form.workerName.trim() || !form.workDescription.trim()) {
      setError('Choose Job Card, worker name, and work description.');
      return;
    }
    const amount = Number(form.workerCharge);
    const customerAmount = Number(form.customerCharge || 0);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(customerAmount) || customerAmount < 0) {
      setError('Enter a positive worker charge and a valid customer labour charge.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const created = await outsideLabourService.create({
        job: form.job, workerName: form.workerName.trim(), workerPhone: form.workerPhone.trim(),
        workDescription: form.workDescription.trim(), customerCharge: customerAmount,
        workerCharge: amount,
      });
      if (form.markPaid) {
        try {
          await outsideLabourService.markPaid(created.id, {
            paymentMethod: form.paymentMethod,
            paymentReference: form.paymentReference.trim(),
          });
          setNotice('Outside labour saved and payment recorded in Expenses.');
        } catch (paymentError) {
          setNotice('Outside labour saved as Pending. Payment was not recorded.');
          setError(errorText(paymentError));
        }
      } else {
        setNotice('Outside labour saved as Pending. Pay when money is actually given.');
      }
      setForm(blank(jobId));
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const pay = async (row) => {
    if (saving || !canCreate) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await outsideLabourService.markPaid(row.id, {
        paymentMethod: payMethod, paymentReference: payReference.trim(),
      });
      setPayTarget(null);
      setPayReference('');
      setNotice('Payment recorded once in Expenses.');
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(errorText(err));
    } finally { setSaving(false); }
  };

  const remove = async (row) => {
    if (!canDelete || !window.confirm('Remove this unpaid outside labour record?')) return;
    setSaving(true);
    setError('');
    try {
      await outsideLabourService.remove(row.id);
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(errorText(err));
    } finally { setSaving(false); }
  };

  if (!canView) {
    return (
      <section className="outside-labour-panel">
        <h2>Outside Labour</h2>
        <p>You need Expenses View permission to see outside workers and their manual charges.</p>
      </section>
    );
  }

  return (
    <section className="outside-labour-panel">
      <header className="outside-labour-header">
        <div className="outside-labour-header-copy">
          <span className="outside-labour-title-icon" aria-hidden="true"><HardHat size={19}/></span>
          <div>
            <h2>Outside Labour</h2>
            <p>Freelance and part-work payments — no staff account or payroll setup required.</p>
          </div>
        </div>
        <button className="outside-labour-refresh" type="button" onClick={refresh} disabled={saving || loading}>
          <RefreshCcw size={15}/> Refresh
        </button>
      </header>

      <div className="outside-labour-stats">
        <div><span>Customer Labour*</span><strong>{formatMoney(totals.customer)}</strong></div>
        <div><span>Worker Cost</span><strong>{formatMoney(totals.worker)}</strong></div>
        <div><span>Pending Payment</span><strong>{formatMoney(totals.pending)}</strong></div>
        <div><span>Paid Expenses</span><strong>{formatMoney(totals.paid)}</strong></div>
      </div>
      <small className="outside-labour-note">*Customer charge is reference-only; it does not add another invoice item. The difference is a labour margin before overheads.</small>

      {notice && <p className="outside-labour-notice" role="status">{notice}</p>}
      {error && <p className="outside-labour-error" role="alert">{error}</p>}

      {canCreate && (
        <form className="outside-labour-form" onSubmit={save}>
          <h3>Add Outside Labour</h3>
          <div className="outside-labour-form-grid">
            {!jobId && (
              <label>Job Card *
                <select required value={form.job} onChange={(event) => set('job', event.target.value)}>
                  <option value="">Select Job Card</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.jobNumber || 'Job Card'} · {job.vehicleReg || job.customerName || 'Vehicle'}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>Worker Name *
              <input required maxLength={160} value={form.workerName} onChange={(event) => set('workerName', event.target.value)} placeholder="Outside painter / mechanic"/>
            </label>
            <label>Phone (optional)
              <input type="tel" maxLength={30} value={form.workerPhone} onChange={(event) => set('workerPhone', event.target.value)} placeholder="Worker mobile"/>
            </label>
            <label>Work Description *
              <input required maxLength={300} value={form.workDescription} onChange={(event) => set('workDescription', event.target.value)} placeholder="Bumper painting / denting"/>
            </label>
            <label>Customer Labour Charge (₹)
              <input type="number" min="0" step="0.01" value={form.customerCharge} onChange={(event) => set('customerCharge', event.target.value)} placeholder="3500"/>
            </label>
            <label>Pay Worker (₹) *
              <input required type="number" min="0.01" step="0.01" value={form.workerCharge} onChange={(event) => set('workerCharge', event.target.value)} placeholder="2000"/>
            </label>
          </div>
          <label className="outside-labour-paid-check">
            <input type="checkbox" checked={form.markPaid} onChange={(event) => set('markPaid', event.target.checked)}/>
            <span>Already paid this worker — record expense now</span>
          </label>
          {form.markPaid && (
            <div className="outside-labour-form-grid">
              <label>Payment Method *
                <select value={form.paymentMethod} onChange={(event) => set('paymentMethod', event.target.value)}>
                  {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <label>Payment Reference (optional)
                <input value={form.paymentReference} maxLength={120} onChange={(event) => set('paymentReference', event.target.value)} placeholder="Transaction / receipt number"/>
              </label>
            </div>
          )}
          <button type="submit" className="outside-labour-primary" disabled={saving || (!jobId && !jobs.length)}>
            <Plus size={16}/>{saving ? 'Saving…' : form.markPaid ? 'Save & Record Payment' : 'Save Pending Labour'}
          </button>
        </form>
      )}

      <div className="outside-labour-list-head"><h3>Outside Labour Records</h3><span>{rows.length} records</span></div>
      {loading ? <p className="outside-labour-empty">Loading outside labour…</p>
        : !rows.length ? <p className="outside-labour-empty">No outside labour records. Add a worker and manual charge above.</p>
        : <div className="outside-labour-list">
          {rows.map((row) => (
            <article key={row.id} className="outside-labour-entry">
              <div className="outside-labour-entry-main">
                <strong>{row.workerName}</strong>
                <span>{row.jobNumber} · {row.workDescription}</span>
                {row.workerPhone && <small>{row.workerPhone}</small>}
              </div>
              <div className="outside-labour-entry-money">
                <span>Customer {formatMoney(row.customerCharge)}</span>
                <strong>Worker {formatMoney(row.workerCharge)}</strong>
                <small>Margin {formatMoney(Number(row.customerCharge || 0) - Number(row.workerCharge || 0))}</small>
              </div>
              <div className="outside-labour-entry-actions">
                <span className={`outside-labour-status ${row.status === 'Paid' ? 'is-paid' : 'is-pending'}`}>{row.status}</span>
                {row.status === 'Pending' && canCreate && (
                  payTarget === row.id ? (
                    <div className="outside-labour-pay-controls">
                      <label>Method
                        <select value={payMethod} onChange={(event) => setPayMethod(event.target.value)}>
                          {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map((value) => <option key={value}>{value}</option>)}
                        </select>
                      </label>
                      <label>Reference
                        <input maxLength={120} value={payReference} onChange={(event) => setPayReference(event.target.value)} placeholder="Optional"/>
                      </label>
                      <button type="button" className="outside-labour-primary" onClick={() => pay(row)} disabled={saving}><CheckCircle2 size={14}/> Confirm Paid</button>
                      <button type="button" onClick={() => setPayTarget(null)}>Cancel</button>
                    </div>
                  ) : <button type="button" onClick={() => setPayTarget(row.id)}>Mark Paid</button>
                )}
                {row.status === 'Pending' && canDelete && (
                  <button className="outside-labour-remove" type="button" onClick={() => remove(row)} disabled={saving}>
                    <Trash2 size={14}/> Remove
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>}
    </section>
  );
};
