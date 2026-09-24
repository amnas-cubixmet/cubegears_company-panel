import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit3, Eye, FileText, Plus, Printer, ReceiptText, Trash2, Truck, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { billingService, blankBillingDocument, calculateDocumentTotals } from '../../services/billing.service';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const itemTypes = ['Stock Part', 'Outside Purchase', 'Labour', 'Service', 'Consumable', 'Custom Item'];
const emptyItem = () => ({ id: `ROW-${Date.now()}-${Math.random()}`, type: 'Labour', description: '', code: '', qty: 1, purchasePrice: '', rate: '', discount: 0, inventoryId: '' });
const n = (value) => Number(value || 0);
const inputNumber = (value) => (value === 0 || value === '0' || value == null ? '' : String(value));
const parseDecimal = (value) => value === '' ? '' : value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

const resolveMode = (pathname, id) => {
  if (pathname.endsWith('/new')) return 'create';
  if (pathname.endsWith('/edit')) return 'edit';
  if (pathname.endsWith('/delete')) return 'delete';
  if (id) return 'view';
  return 'list';
};

export function InvoiceRoutePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = resolveMode(location.pathname, id);
  const kindFromUrl = new URLSearchParams(location.search).get('kind') === 'estimate' ? 'estimate' : 'invoice';

  const [documents, setDocuments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState(kindFromUrl);
  const [form, setForm] = useState(blankBillingDocument(kindFromUrl));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadList = async () => {
    setLoading(true);
    try {
      const [docs, stock] = await Promise.all([billingService.list(), billingService.inventory()]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setInventory(Array.isArray(stock) ? stock : []);
    } catch (e) {
      setError(e?.message || 'Unable to load billing data.');
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [doc, stock] = await Promise.all([billingService.get(id), billingService.inventory()]);
      if (!doc) setError('Invoice / estimate not found.');
      else setForm(JSON.parse(JSON.stringify(doc)));
      setInventory(Array.isArray(stock) ? stock : []);
    } catch (e) {
      setError(e?.message || 'Unable to load document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    if (mode === 'list') loadList();
    else if (mode === 'create') {
      setForm(blankBillingDocument(kindFromUrl));
      loadList();
    } else loadDocument();
  }, [location.pathname, location.search, id]);

  const totals = useMemo(() => calculateDocumentTotals(form), [form]);
  const filteredDocs = documents.filter((doc) => doc.kind === activeTab);

  const update = (path, value) => {
    setForm((old) => {
      if (!path.includes('.')) return { ...old, [path]: value };
      const [group, key] = path.split('.');
      return { ...old, [group]: { ...old[group], [key]: value } };
    });
  };

  const updateItem = (rowId, key, value) => setForm((old) => ({
    ...old,
    items: old.items.map((row) => row.id === rowId ? { ...row, [key]: value } : row)
  }));

  const chooseInventory = (rowId, inventoryId) => {
    const stock = inventory.find((item) => String(item.id) === String(inventoryId));
    setForm((old) => ({
      ...old,
      items: old.items.map((row) => row.id === rowId ? {
        ...row,
        inventoryId,
        type: 'Stock Part',
        description: stock?.name || '',
        code: stock?.sku || '',
        purchasePrice: stock?.cost ? String(stock.cost) : '',
        rate: stock?.price ? String(stock.price) : ''
      } : row)
    }));
  };

  const validate = () => {
    if (!form.customer?.name?.trim()) return 'Customer / company name is required.';
    if (!form.items?.length) return 'Add at least one item.';
    if (form.items.some((row) => !row.description?.trim() && row.type !== 'Stock Part')) return 'Enter an item / service description.';
    return '';
  };

  const save = async () => {
    const validation = validate();
    if (validation) return setError(validation);
    setSaving(true);
    try {
      const saved = await billingService.saveDraft(form);
      navigate(`/invoices/${saved.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to save document.');
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    const validation = validate();
    if (validation) return setError(validation);
    setSaving(true);
    try {
      let current = form;
      if (!current.id) current = await billingService.saveDraft(current);
      const done = await billingService.finalize(current.id);
      navigate(`/invoices/${done.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to finalize document.');
    } finally {
      setSaving(false);
    }
  };

  const cancelDocument = async () => {
    setSaving(true);
    try {
      const done = await billingService.cancel(id);
      setForm(done);
      navigate(`/invoices/${done.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to cancel document.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async () => {
    setSaving(true);
    try {
      await billingService.remove(id);
      navigate('/invoices', { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to delete document.');
      setSaving(false);
    }
  };

  if (mode === 'list') return (
    <div className="billing-page">
      <header className="billing-page-head">
        <div><span className="billing-kicker">BILLING</span><h1>Invoices & Estimates</h1><p>Workshop billing, estimates, payments and PDF documents.</p></div>
        <button className="bill-btn" onClick={() => navigate(`/invoices/new?kind=${activeTab}`)}><Plus size={17}/>{activeTab === 'estimate' ? 'New Estimate' : 'New Invoice'}</button>
      </header>
      <div className="billing-tabs">
        <button className={activeTab === 'invoice' ? 'active' : ''} onClick={() => setActiveTab('invoice')}><ReceiptText size={16}/>Invoices</button>
        <button className={activeTab === 'estimate' ? 'active' : ''} onClick={() => setActiveTab('estimate')}><FileText size={16}/>Estimates</button>
        <button onClick={() => navigate('/invoices/e-way-bills')}><Truck size={16}/>E-Way Bills</button>
      </div>
      {error && <div className="billing-error">{error}</div>}
      <section className="billing-card billing-list-card">
        {loading ? <div className="billing-empty">Loading…</div> : <div className="billing-doc-list">
          {filteredDocs.map((doc) => {
            const t = calculateDocumentTotals(doc);
            return <article className="billing-doc-row" key={doc.id}>
              <button type="button" className="billing-doc-main" onClick={() => navigate(`/invoices/${doc.id}`)}>
                <strong>{doc.number}</strong>
                <span>{doc.customer?.name || 'Walk-in'}{doc.vehicle?.registration ? ` · ${doc.vehicle.registration}` : ''}</span>
              </button>
              <div className="billing-doc-meta"><span>{doc.date || '—'}</span><strong>{money.format(t.total)}</strong></div>
              <span className="billing-status">{doc.status}</span>
              <div className="billing-list-actions">
                <button aria-label="View" onClick={() => navigate(`/invoices/${doc.id}`)}><Eye size={16}/></button>
                <button aria-label="Edit" onClick={() => navigate(`/invoices/${doc.id}/edit`)}><Edit3 size={16}/></button>
                <button aria-label="Delete" className="danger" onClick={() => navigate(`/invoices/${doc.id}/delete`)}><Trash2 size={16}/></button>
              </div>
            </article>;
          })}
          {!filteredDocs.length && <div className="billing-empty">No {activeTab}s yet.</div>}
        </div>}
      </section>
    </div>
  );

  if (mode === 'delete') return (
    <div className="billing-page">
      <header className="billing-page-head"><div><span className="billing-kicker">DELETE DOCUMENT</span><h1>{form.number || id}</h1><p>Document ID: {id}</p></div></header>
      {error && <div className="billing-error">{error}</div>}
      {loading ? <div className="billing-empty">Loading…</div> : <section className="billing-card"><h3>Delete this document?</h3><p>Only Draft or Cancelled documents can be permanently deleted. Finalized invoices must be cancelled first.</p><div className="billing-head-actions"><button className="bill-btn secondary" onClick={() => navigate(`/invoices/${id}`)}>Back</button><button className="bill-btn danger" disabled={saving} onClick={deleteDocument}><Trash2 size={16}/>{saving ? 'Deleting…' : 'Delete'}</button></div></section>}
    </div>
  );

  if (mode === 'view') return (
    <div className="billing-page invoice-view-page">
      <div className="billing-editor-head no-print">
        <div><button className="bill-btn secondary" onClick={() => navigate('/invoices')}><ArrowLeft size={16}/>Back</button><span className="billing-kicker">{form.kind === 'estimate' ? 'ESTIMATE' : 'INVOICE'}</span><h1>{form.number || id}</h1><p>ID: {id} · Status: {form.status}</p></div>
        <div className="billing-head-actions"><button className="bill-btn secondary" onClick={() => navigate(`/invoices/${id}/edit`)}><Edit3 size={16}/>Edit</button>{form.kind === 'invoice' && <button className="bill-btn secondary" onClick={() => navigate(`/invoices/e-way-bills/new?invoiceId=${encodeURIComponent(id)}`)}><Truck size={16}/>E-Way Bill</button>}<button className="bill-btn secondary" onClick={() => window.print()}><Printer size={16}/>Print / PDF</button>{form.status !== 'Cancelled' && <button className="bill-btn secondary" disabled={saving} onClick={cancelDocument}><XCircle size={16}/>Cancel</button>}<button className="bill-btn danger" onClick={() => navigate(`/invoices/${id}/delete`)}><Trash2 size={16}/>Delete</button></div>
      </div>
      {error && <div className="billing-error no-print">{error}</div>}
      {loading ? <div className="billing-empty">Loading…</div> : <InvoicePrint doc={form} totals={totals}/>} 
    </div>
  );

  return (
    <div className="billing-page">
      <div className="billing-editor-head no-print">
        <div><button className="bill-btn secondary" onClick={() => navigate(mode === 'edit' ? `/invoices/${id}` : '/invoices')}><ArrowLeft size={16}/>Back</button><span className="billing-kicker">{form.kind === 'estimate' ? 'ESTIMATE' : 'BILLING'}</span><h1>{mode === 'edit' ? `Edit ${form.number || id}` : form.kind === 'estimate' ? 'New Estimate' : 'New Invoice'}</h1><p>{mode === 'edit' ? `Editing ID: ${id}` : 'Create and price parts, labour and services.'}</p></div>
        <div className="billing-head-actions"><button className="bill-btn secondary" disabled={saving} onClick={save}>Save Draft</button><button className="bill-btn" disabled={saving} onClick={finalize}><CheckCircle2 size={16}/>{form.kind === 'estimate' ? 'Issue Estimate' : 'Finalize Invoice'}</button></div>
      </div>
      {error && <div className="billing-error no-print">{error}</div>}
      {loading && mode === 'edit' ? <div className="billing-empty">Loading…</div> : <>
        <div className="billing-form-grid no-print">
          <section className="billing-card"><h3>Document</h3><label>Type<select value={form.invoiceType} onChange={(e) => update('invoiceType', e.target.value)}><option value="regular">Regular Bill</option><option value="gst">GST Tax Invoice</option></select></label><label>Date<input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)}/></label><label>Job Card No<input value={form.jobCardNo || ''} onChange={(e) => update('jobCardNo', e.target.value)} placeholder="JOB-2048"/></label><label>Staff / Advisor<input value={form.staff || ''} onChange={(e) => update('staff', e.target.value)}/></label></section>
          <section className="billing-card"><h3>Customer / Bill To</h3><label>Name<input value={form.customer?.name || ''} onChange={(e) => update('customer.name', e.target.value)}/></label><label>Phone<input value={form.customer?.phone || ''} onChange={(e) => update('customer.phone', e.target.value)}/></label><label>Address<textarea value={form.customer?.address || ''} onChange={(e) => update('customer.address', e.target.value)}/></label>{form.invoiceType === 'gst' && <><label>GSTIN<input value={form.customer?.gstin || ''} onChange={(e) => update('customer.gstin', e.target.value)}/></label><label>Place of Supply<input value={form.customer?.placeOfSupply || ''} onChange={(e) => update('customer.placeOfSupply', e.target.value)}/></label></>}</section>
          <section className="billing-card"><h3>Vehicle</h3><label>Registration<input value={form.vehicle?.registration || ''} onChange={(e) => update('vehicle.registration', e.target.value)}/></label><label>Make / Model<input value={form.vehicle?.makeModel || ''} onChange={(e) => update('vehicle.makeModel', e.target.value)}/></label><label>Odometer<input value={form.vehicle?.odometer || ''} onChange={(e) => update('vehicle.odometer', e.target.value)}/></label><label>VIN / Chassis<input value={form.vehicle?.vin || ''} onChange={(e) => update('vehicle.vin', e.target.value)}/></label></section>
        </div>

        <section className="billing-card no-print billing-items-card">
          <div className="billing-section-head"><div><span className="billing-kicker">ITEMS</span><h3>Parts, labour and services</h3></div><button className="bill-btn" onClick={() => update('items', [...form.items, emptyItem()])}><Plus size={16}/>Add Item</button></div>
          <div className="billing-item-head"><span>Type</span><span>Description / Stock Item</span><span>Part No / Code</span><span>Qty</span><span>Purchase Price</span><span>Selling / Rate</span><span>Total</span><span></span></div>
          <div className="billing-items-editor">{form.items.map((row) => <div className="billing-item-row" key={row.id}>
            <select aria-label="Item type" value={row.type} onChange={(e) => updateItem(row.id, 'type', e.target.value)}>{itemTypes.map((type) => <option key={type}>{type}</option>)}</select>
            {row.type === 'Stock Part' ? <select aria-label="Stock item" value={row.inventoryId || ''} onChange={(e) => chooseInventory(row.id, e.target.value)}><option value="">Select stock item</option>{inventory.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku} · Stock {item.onHand}</option>)}</select> : <input aria-label="Description" value={row.description || ''} onChange={(e) => updateItem(row.id, 'description', e.target.value)} placeholder="Description"/>}
            <input aria-label="Part number" value={row.code || ''} onChange={(e) => updateItem(row.id, 'code', e.target.value)} placeholder="Part No / Code"/>
            <input className="plain-number-input" aria-label="Quantity" inputMode="decimal" value={inputNumber(row.qty) || '1'} onChange={(e) => updateItem(row.id, 'qty', parseDecimal(e.target.value))} placeholder="Qty"/>
            <input className="plain-number-input" aria-label="Purchase price" inputMode="decimal" value={inputNumber(row.purchasePrice)} onChange={(e) => updateItem(row.id, 'purchasePrice', parseDecimal(e.target.value))} placeholder="Purchase ₹"/>
            <input className="plain-number-input" aria-label="Selling price" inputMode="decimal" value={inputNumber(row.rate)} onChange={(e) => updateItem(row.id, 'rate', parseDecimal(e.target.value))} placeholder="Selling ₹"/>
            <strong className="billing-line-total">{money.format(Math.max(0, n(row.qty) * n(row.rate) - n(row.discount)))}</strong>
            <button aria-label="Remove item" className="bill-icon-btn" onClick={() => update('items', form.items.filter((item) => item.id !== row.id))}><Trash2 size={16}/></button>
          </div>)}</div>
        </section>

        <section className="billing-card no-print">
          <label>Invoice Notes / Job Summary<textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Complaints, inspection findings, work completed or remarks"/></label>
          <div className="billing-tax-grid">
            <label>Discount ₹<input className="plain-number-input" inputMode="decimal" value={inputNumber(form.discount)} onChange={(e) => update('discount', parseDecimal(e.target.value))} placeholder="0.00"/></label>
            {form.invoiceType === 'gst' && <label>Tax Mode<select value={form.taxMode} onChange={(e) => update('taxMode', e.target.value)}><option value="cgst_sgst">CGST + SGST</option><option value="igst">IGST</option><option value="none">No Tax</option></select></label>}
            {form.invoiceType === 'gst' && form.taxMode === 'cgst_sgst' && <><label>CGST %<input className="plain-number-input" inputMode="decimal" value={inputNumber(form.cgstRate)} onChange={(e) => update('cgstRate', parseDecimal(e.target.value))}/></label><label>SGST %<input className="plain-number-input" inputMode="decimal" value={inputNumber(form.sgstRate)} onChange={(e) => update('sgstRate', parseDecimal(e.target.value))}/></label></>}
            {form.invoiceType === 'gst' && form.taxMode === 'igst' && <label>IGST %<input className="plain-number-input" inputMode="decimal" value={inputNumber(form.igstRate)} onChange={(e) => update('igstRate', parseDecimal(e.target.value))}/></label>}
            <label>Paid ₹<input className="plain-number-input" inputMode="decimal" value={inputNumber(form.paid)} onChange={(e) => update('paid', parseDecimal(e.target.value))} placeholder="0.00"/></label>
            <label>Payment Mode<select value={form.paymentMode || 'Cash'} onChange={(e) => update('paymentMode', e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option></select></label>
          </div>
        </section>

        <div className="billing-summary no-print"><span>Subtotal <strong>{money.format(totals.itemSubtotal)}</strong></span><span>Tax <strong>{money.format(totals.cgst + totals.sgst + totals.igst)}</strong></span><span className="grand">Grand Total <strong>{money.format(totals.total)}</strong></span><span>Balance <strong>{money.format(totals.balance)}</strong></span></div>
        <InvoicePrint doc={form} totals={totals}/>
      </>}
    </div>
  );
}

function InvoicePrint({ doc, totals }) {
  const groups = ['Labour', 'Stock Part', 'Outside Purchase', 'Service', 'Consumable', 'Custom Item'];
  return <section className="invoice-print-sheet">
    <div className="invoice-print-head"><div><div className="invoice-logo">CUBIXGEAR</div><strong>Workshop Management</strong></div><div className="invoice-title"><h2>{doc.kind === 'estimate' ? 'ESTIMATE' : doc.invoiceType === 'gst' ? 'TAX INVOICE' : 'INVOICE'}</h2><span>No: {doc.number || 'DRAFT'}</span><span>Date: {doc.date || '—'}</span><span>Job #: {doc.jobCardNo || '—'}</span></div></div>
    <div className="invoice-info-band"><div><strong>Workshop</strong><span>Your Workshop Name</span><span>Address · Phone · Email</span><span>GSTIN: Configure in Settings</span></div><div><strong>Bill To</strong><span>{doc.customer?.name || '—'}</span><span>{doc.customer?.address || doc.customer?.phone || '—'}</span>{doc.invoiceType === 'gst' && <span>GSTIN: {doc.customer?.gstin || '—'}</span>}</div><div><strong>Vehicle</strong><span>{doc.vehicle?.registration || '—'}</span><span>{doc.vehicle?.makeModel || '—'}</span><span>Odometer: {doc.vehicle?.odometer || '—'}</span></div></div>
    {doc.notes && <div className="invoice-notes"><strong>Invoice Notes / Job Summary</strong><p>{doc.notes}</p></div>}
    <div className="invoice-table-head"><span>Item / Description</span><span>Qty</span><span>Unit Price</span><span>Total</span></div>
    {groups.map((group) => {
      const rows = (doc.items || []).filter((item) => item.type === group);
      if (!rows.length) return null;
      const groupTotal = rows.reduce((sum, item) => sum + Math.max(0, n(item.qty) * n(item.rate) - n(item.discount)), 0);
      return <div className="invoice-group" key={group}><div className="invoice-group-title">{group.toUpperCase()}</div>{rows.map((row) => <div className="invoice-line" key={row.id}><span>{row.description || 'Item'}{row.code ? ` · ${row.code}` : ''}</span><span>{row.qty || 0}</span><span>{money.format(n(row.rate))}</span><span>{money.format(Math.max(0, n(row.qty) * n(row.rate) - n(row.discount)))}</span></div>)}<div className="invoice-group-total">{group} Total <strong>{money.format(groupTotal)}</strong></div></div>;
    })}
    <div className="invoice-totals"><div><span>Subtotal</span><strong>{money.format(totals.itemSubtotal)}</strong></div>{totals.documentDiscount > 0 && <div><span>Discount</span><strong>- {money.format(totals.documentDiscount)}</strong></div>}{totals.cgst > 0 && <div><span>CGST</span><strong>{money.format(totals.cgst)}</strong></div>}{totals.sgst > 0 && <div><span>SGST</span><strong>{money.format(totals.sgst)}</strong></div>}{totals.igst > 0 && <div><span>IGST</span><strong>{money.format(totals.igst)}</strong></div>}<div><span>Rounding</span><strong>{money.format(totals.rounding)}</strong></div><div className="grand"><span>Total</span><strong>{money.format(totals.total)}</strong></div><div><span>Paid</span><strong>{money.format(totals.paid)}</strong></div><div><span>Balance Due</span><strong>{money.format(totals.balance)}</strong></div></div>
    <div className="invoice-footer"><div><strong>Payment Terms:</strong> {doc.paymentTerms || 'C.O.D'} · <strong>Mode:</strong> {doc.paymentMode || 'Cash'}</div><div>Thank you for choosing our workshop.</div><div className="invoice-sign">Authorised Signature</div></div>
  </section>;
}
