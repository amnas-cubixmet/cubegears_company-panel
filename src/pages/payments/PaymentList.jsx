import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, Plus, Search } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { resourceConfigs } from '../operations/resourceConfigs';
import { billingService, calculateDocumentTotals } from '../../services/billing.service';
import '../../styles/payments.css';

const paymentService = resourceConfigs.payments.service;
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

const today = () => new Date().toISOString().slice(0, 10);
const makeReceiptNo = (rows) => {
  const max = rows.reduce((acc, row) => {
    const match = String(row.receiptNo || '').match(/(\d+)$/);
    return Math.max(acc, match ? Number(match[1]) : 0);
  }, 1000);
  return `RCT-${String(max + 1).padStart(4, '0')}`;
};

export function PaymentList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = location.pathname.endsWith('/new');
  const isView = Boolean(id) && !location.pathname.endsWith('/edit') && !location.pathname.endsWith('/delete');

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({
    receiptNo: '',
    date: today(),
    customer: '',
    invoice: '',
    method: 'Cash',
    amount: '',
    reference: '',
    status: 'Completed'
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [paymentRows, invoiceRows] = await Promise.all([
        paymentService.list(),
        billingService.list()
      ]);
      const p = Array.isArray(paymentRows) ? paymentRows : [];
      const inv = (Array.isArray(invoiceRows) ? invoiceRows : []).filter((row) => row.kind === 'invoice');
      setPayments(p);
      setInvoices(inv);

      if (isNew) {
        setForm((old) => ({ ...old, receiptNo: old.receiptNo || makeReceiptNo(p) }));
      } else if (id) {
        const found = p.find((row) => String(row.id) === String(id)) || null;
        setRecord(found);
      }
    } catch (e) {
      setError(e?.message || 'Unable to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [location.pathname, id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((row) =>
      [row.receiptNo, row.customer, row.invoice, row.method, row.reference, row.status]
        .some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [payments, query]);

  const selectInvoice = (invoiceId) => {
    const invoice = invoices.find((row) => String(row.id) === String(invoiceId));
    if (!invoice) {
      setForm((old) => ({ ...old, invoice: '', customer: '', amount: '' }));
      return;
    }

    const totals = calculateDocumentTotals(invoice);
    setForm((old) => ({
      ...old,
      invoice: invoice.number || invoice.id,
      customer: invoice.customer?.name || '',
      amount: totals.balance > 0 ? totals.balance : totals.total
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.receiptNo.trim()) return setError('Receipt number is required.');
    if (!form.invoice.trim()) return setError('Select an existing invoice.');
    if (!form.customer.trim()) return setError('Customer is required.');
    if (Number(form.amount || 0) <= 0) return setError('Amount must be greater than zero.');

    setSaving(true);
    setError('');
    try {
      const saved = await paymentService.create({
        ...form,
        amount: Number(form.amount || 0)
      });
      navigate(`/payments/${saved.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to record payment.');
    } finally {
      setSaving(false);
    }
  };

  if (isNew) {
    return (
      <div className="payments-page">
        <header className="payments-head">
          <div>
            <span className="payments-kicker">PAYMENTS</span>
            <h1>Record Payment</h1>
            <p>Select an existing invoice. Customer and outstanding amount will fill automatically.</p>
          </div>
          <button className="payments-secondary-btn" onClick={() => navigate('/payments')}>
            <ArrowLeft size={16}/>Back
          </button>
        </header>

        {error && <div className="payments-error">{error}</div>}

        <form className="payment-form-card" onSubmit={save}>
          <div className="payment-form-grid">
            <label>
              <span>Receipt Number</span>
              <input value={form.receiptNo} readOnly />
              <small>Generated automatically from existing receipts.</small>
            </label>

            <label>
              <span>Payment Date</span>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>

            <label className="payment-wide">
              <span>Existing Invoice *</span>
              <select value={invoices.find((row) => (row.number || row.id) === form.invoice)?.id || ''} onChange={(e) => selectInvoice(e.target.value)}>
                <option value="">Select invoice</option>
                {invoices.map((invoice) => {
                  const totals = calculateDocumentTotals(invoice);
                  return (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.number || invoice.id} · {invoice.customer?.name || 'Walk-in'} · Balance {money.format(totals.balance)}
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              <span>Customer</span>
              <input value={form.customer} readOnly placeholder="Auto-filled from invoice" />
            </label>

            <label>
              <span>Amount</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>

            <label>
              <span>Payment Method</span>
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label>
              <span>Reference</span>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UPI / cheque / bank ref" />
            </label>

            <label>
              <span>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Completed', 'Pending', 'Refunded'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="payment-form-actions">
            <button type="button" className="payments-secondary-btn" onClick={() => navigate('/payments')}>Cancel</button>
            <button type="submit" className="payments-primary-btn" disabled={saving}>
              <CheckCircle2 size={16}/>{saving ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isView) {
    return (
      <div className="payments-page">
        <header className="payments-head">
          <div>
            <span className="payments-kicker">PAYMENT RECEIPT</span>
            <h1>{record?.receiptNo || id}</h1>
            <p>Payment record details</p>
          </div>
          <button className="payments-secondary-btn" onClick={() => navigate('/payments')}>
            <ArrowLeft size={16}/>Back
          </button>
        </header>

        {loading ? <div className="payments-empty">Loading…</div> : record ? (
          <section className="payment-detail-card">
            {[
              ['Receipt Number', record.receiptNo],
              ['Date', record.date],
              ['Customer', record.customer],
              ['Invoice', record.invoice],
              ['Payment Method', record.method],
              ['Amount', money.format(record.amount || 0)],
              ['Reference', record.reference || '—'],
              ['Status', record.status]
            ].map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value || '—'}</strong></div>
            ))}
          </section>
        ) : <div className="payments-empty">Payment not found.</div>}
      </div>
    );
  }

  return (
    <div className="payments-page">
      <header className="payments-head">
        <div>
          <span className="payments-kicker">FINANCE</span>
          <h1>Payments</h1>
          <p>Receipts linked to existing invoices and customer collections.</p>
        </div>
        <button className="payments-primary-btn" onClick={() => navigate('/payments/new')}>
          <Plus size={16}/>Record Payment
        </button>
      </header>

      <div className="payments-stats">
        <div><span>Total Payments</span><strong>{payments.length}</strong></div>
        <div><span>Collected</span><strong>{money.format(payments.filter((row) => row.status === 'Completed').reduce((sum, row) => sum + Number(row.amount || 0), 0))}</strong></div>
      </div>

      <div className="payments-toolbar">
        <label><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search receipt, customer or invoice…" /></label>
        <span>{filtered.length} records</span>
      </div>

      {error && <div className="payments-error">{error}</div>}

      <section className="payments-list-card">
        {loading ? <div className="payments-empty">Loading…</div> : filtered.length ? filtered.map((row) => (
          <article className="payment-row" key={row.id}>
            <div className="payment-main">
              <strong>{row.receiptNo || row.id}</strong>
              <span>{row.customer || 'Customer'} · {row.invoice || 'No invoice'}</span>
            </div>
            <div className="payment-meta"><span>{row.date || '—'}</span><strong>{money.format(row.amount || 0)}</strong></div>
            <span className="payment-status">{row.status || 'Completed'}</span>
            <button className="payment-view-btn" onClick={() => navigate(`/payments/${row.id}`)} aria-label="View payment"><Eye size={16}/></button>
          </article>
        )) : <div className="payments-empty">No payment records found.</div>}
      </section>
    </div>
  );
}

export default PaymentList;
