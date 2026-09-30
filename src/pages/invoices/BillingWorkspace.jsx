import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Printer, ReceiptText, Trash2, CheckCircle2, XCircle, CopyPlus } from 'lucide-react';
import { billingService, blankBillingDocument, calculateDocumentTotals } from '../../services/billing.service';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const itemTypes = ['Stock Part', 'Outside Purchase', 'Labour', 'Service', 'Consumable', 'Custom Item'];

const emptyItem = () => ({ id: `ROW-${Date.now()}-${Math.random()}`, type: 'Labour', description: '', code: '', qty: 1, purchasePrice: 0, rate: 0, discount: 0, inventoryId: '' });

export function BillingWorkspace() {
  const [documents, setDocuments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [mode, setMode] = useState('list');
  const [activeTab, setActiveTab] = useState('invoice');
  const [form, setForm] = useState(blankBillingDocument('invoice'));
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const [docs, stock] = await Promise.all([billingService.list(), billingService.inventory()]);
    setDocuments(docs);
    setInventory(stock);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => calculateDocumentTotals(form), [form]);
  const filteredDocs = documents.filter((doc) => doc.kind === activeTab);

  const startNew = (kind = activeTab) => {
    setForm(blankBillingDocument(kind));
    setSelected(null);
    setError('');
    setMode('edit');
  };

  const edit = (doc) => {
    setForm(JSON.parse(JSON.stringify(doc)));
    setSelected(doc);
    setError('');
    setMode('edit');
  };

  const update = (path, value) => {
    setForm((old) => {
      const next = { ...old };
      if (path.includes('.')) {
        const [group, key] = path.split('.');
        next[group] = { ...old[group], [key]: value };
      } else next[path] = value;
      return next;
    });
  };

  const updateItem = (id, key, value) => setForm((old) => ({
    ...old,
    items: old.items.map((row) => row.id === id ? { ...row, [key]: value } : row)
  }));

  const chooseInventory = (rowId, inventoryId) => {
    const stock = inventory.find((item) => item.id === inventoryId);
    setForm((old) => ({
      ...old,
      items: old.items.map((row) => row.id === rowId ? {
        ...row,
        inventoryId,
        type: 'Stock Part',
        description: stock?.name || '',
        code: stock?.sku || '',
        purchasePrice: Number(stock?.cost || 0),
        rate: Number(stock?.price || 0)
      } : row)
    }));
  };

  const save = async () => {
    setError('');
    if (!form.customer?.name?.trim()) return setError('Customer / company name is required.');
    if (!form.items.length) return setError('Add at least one bill item.');
    const saved = await billingService.saveDraft(form);
    setForm(saved);
    setSelected(saved);
    await load();
  };

  const finalize = async () => {
    try {
      let doc = form;
      if (!doc.id) doc = await billingService.saveDraft(doc);
      const done = await billingService.finalize(doc.id);
      setForm(done);
      setSelected(done);
      await load();
    } catch (e) {
      setError(e.message || 'Could not finalize document.');
    }
  };

  const cancel = async () => {
    if (!form.id || !window.confirm('Cancel this document?')) return;
    try {
      const done = await billingService.cancel(form.id);
      setForm(done);
      await load();
    } catch (e) { setError(e.message || 'Could not cancel document.'); }
  };

  const convertToInvoice = async () => {
    if (!form.id) return;
    const invoice = await billingService.convertEstimateToInvoice(form.id);
    setActiveTab('invoice');
    setForm(invoice);
    setSelected(invoice);
    await load();
  };

  if (mode === 'edit') {
    return (
      <div className="billing-page">
        <div className="billing-editor-head no-print">
          <div>
            <span className="billing-kicker">{form.kind === 'estimate' ? 'ESTIMATE' : 'BILLING'}</span>
            <h1>{form.number || (form.kind === 'estimate' ? 'New Estimate' : 'New Invoice')}</h1>
            <p>Manual pricing supported for labour, service, outside purchase and custom items.</p>
          </div>
          <div className="billing-head-actions">
            <button className="bill-btn secondary" onClick={save}>Save Draft</button>
            {form.kind === 'estimate' && form.id && <button className="bill-btn secondary" onClick={convertToInvoice}><CopyPlus size={16}/> Convert to Invoice</button>}
            <button className="bill-btn" onClick={finalize}><CheckCircle2 size={16}/> {form.kind === 'estimate' ? 'Issue Estimate' : 'Finalize Invoice'}</button>
            <button className="bill-btn secondary" onClick={() => window.print()}><Printer size={16}/> Print / PDF</button>
            {form.id && form.status !== 'Cancelled' && <button className="bill-btn danger" onClick={cancel}><XCircle size={16}/> Cancel</button>}
          </div>
        </div>

        {error && <div className="billing-error no-print">{error}</div>}

        <div className="billing-form-grid no-print">
          <section className="billing-card">
            <h3>Document</h3>
            <label>Type<select value={form.invoiceType} onChange={(e) => update('invoiceType', e.target.value)}><option value="regular">Regular Bill</option><option value="gst">GST Tax Invoice</option></select></label>
            <label>Date<input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} /></label>
            <label>Job Card No<input value={form.jobCardNo || ''} onChange={(e) => update('jobCardNo', e.target.value)} placeholder="JOB-2048" /></label>
            <label>Staff / Advisor<input value={form.staff || ''} onChange={(e) => update('staff', e.target.value)} /></label>
          </section>

          <section className="billing-card">
            <h3>Customer / Bill To</h3>
            <label>Name<input value={form.customer?.name || ''} onChange={(e) => update('customer.name', e.target.value)} /></label>
            <label>Phone<input value={form.customer?.phone || ''} onChange={(e) => update('customer.phone', e.target.value)} /></label>
            <label>Address<textarea value={form.customer?.address || ''} onChange={(e) => update('customer.address', e.target.value)} /></label>
            {form.invoiceType === 'gst' && <><label>GSTIN<input value={form.customer?.gstin || ''} onChange={(e) => update('customer.gstin', e.target.value)} /></label><label>Place of Supply<input value={form.customer?.placeOfSupply || ''} onChange={(e) => update('customer.placeOfSupply', e.target.value)} /></label></>}
          </section>

          <section className="billing-card">
            <h3>Vehicle</h3>
            <label>Registration<input value={form.vehicle?.registration || ''} onChange={(e) => update('vehicle.registration', e.target.value)} /></label>
            <label>Make / Model<input value={form.vehicle?.makeModel || ''} onChange={(e) => update('vehicle.makeModel', e.target.value)} /></label>
            <label>Odometer<input value={form.vehicle?.odometer || ''} onChange={(e) => update('vehicle.odometer', e.target.value)} /></label>
            <label>VIN / Chassis<input value={form.vehicle?.vin || ''} onChange={(e) => update('vehicle.vin', e.target.value)} /></label>
          </section>
        </div>

        <section className="billing-card no-print">
          <div className="billing-section-head"><div><span className="billing-kicker">ITEMS</span><h3>Parts, labour and services</h3></div><button className="bill-btn" onClick={() => update('items', [...form.items, emptyItem()])}><Plus size={16}/> Add Item</button></div>
          <div className="billing-items-editor">
            {form.items.map((row) => (
              <div className="billing-item-row" key={row.id}>
                <select value={row.type} onChange={(e) => updateItem(row.id, 'type', e.target.value)}>{itemTypes.map((type) => <option key={type}>{type}</option>)}</select>
                {row.type === 'Stock Part' ? (
                  <select value={row.inventoryId || ''} onChange={(e) => chooseInventory(row.id, e.target.value)}><option value="">Select stock item</option>{inventory.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku} · Stock {item.onHand}</option>)}</select>
                ) : <input value={row.description} onChange={(e) => updateItem(row.id, 'description', e.target.value)} placeholder="Item / service / labour description" />}
                <input value={row.code || ''} onChange={(e) => updateItem(row.id, 'code', e.target.value)} placeholder="Part No / Code" />
                <input type="number" min="0" step="0.01" value={row.qty} onChange={(e) => updateItem(row.id, 'qty', Number(e.target.value))} placeholder="Qty" />
                <input type="number" min="0" step="0.01" value={row.purchasePrice || 0} onChange={(e) => updateItem(row.id, 'purchasePrice', Number(e.target.value))} placeholder="Purchase ₹" />
                <input type="number" min="0" step="0.01" value={row.rate || 0} onChange={(e) => updateItem(row.id, 'rate', Number(e.target.value))} placeholder="Selling / Rate ₹" />
                <strong>{money.format(Math.max(0, Number(row.qty || 0) * Number(row.rate || 0) - Number(row.discount || 0)))}</strong>
                <button className="bill-icon-btn" onClick={() => update('items', form.items.filter((item) => item.id !== row.id))}><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </section>

        <section className="billing-card no-print">
          <label>Invoice Notes / Job Summary<textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Complaints, inspection findings, work completed or remarks" /></label>
          <div className="billing-tax-grid">
            <label>Discount ₹<input type="number" min="0" value={form.discount || 0} onChange={(e) => update('discount', Number(e.target.value))} /></label>
            {form.invoiceType === 'gst' && <label>Tax Mode<select value={form.taxMode} onChange={(e) => update('taxMode', e.target.value)}><option value="cgst_sgst">CGST + SGST</option><option value="igst">IGST</option><option value="none">No Tax</option></select></label>}
            {form.invoiceType === 'gst' && form.taxMode === 'cgst_sgst' && <><label>CGST %<input type="number" value={form.cgstRate} onChange={(e) => update('cgstRate', Number(e.target.value))}/></label><label>SGST %<input type="number" value={form.sgstRate} onChange={(e) => update('sgstRate', Number(e.target.value))}/></label></>}
            {form.invoiceType === 'gst' && form.taxMode === 'igst' && <label>IGST %<input type="number" value={form.igstRate} onChange={(e) => update('igstRate', Number(e.target.value))}/></label>}
            <label>Paid ₹<input type="number" min="0" value={form.paid || 0} onChange={(e) => update('paid', Number(e.target.value))}/></label>
            <label>Payment Mode<select value={form.paymentMode} onChange={(e) => update('paymentMode', e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option></select></label>
          </div>
        </section>

        <InvoicePrint doc={form} totals={totals} />
      </div>
    );
  }

  return (
    <div className="billing-page">
      <header className="billing-page-head">
        <div><span className="billing-kicker">BILLING</span><h1>Invoices & Estimates</h1><p>Create standalone bills or convert workshop estimates into final invoices.</p></div>
        <button className="bill-btn" onClick={() => startNew(activeTab)}><Plus size={17}/> {activeTab === 'estimate' ? 'New Estimate' : 'New Invoice'}</button>
      </header>
      <div className="billing-tabs">
        <button className={activeTab === 'invoice' ? 'active' : ''} onClick={() => setActiveTab('invoice')}><ReceiptText size={16}/> Invoices</button>
        <button className={activeTab === 'estimate' ? 'active' : ''} onClick={() => setActiveTab('estimate')}><FileText size={16}/> Estimates</button>
      </div>
      <section className="billing-card">
        <div className="billing-doc-list">
          {filteredDocs.map((doc) => {
            const t = calculateDocumentTotals(doc);
            return <button className="billing-doc-row" key={doc.id} onClick={() => edit(doc)}><div><strong>{doc.number}</strong><span>{doc.customer?.name || 'Walk-in'} · {doc.vehicle?.registration || 'No vehicle'}</span></div><div><span>{doc.date}</span><strong>{money.format(t.total)}</strong></div><span className="billing-status">{doc.status}</span></button>;
          })}
          {!filteredDocs.length && <div className="billing-empty">No {activeTab}s yet.</div>}
        </div>
      </section>
    </div>
  );
}

function InvoicePrint({ doc, totals }) {
  const groups = ['Labour', 'Stock Part', 'Outside Purchase', 'Service', 'Consumable', 'Custom Item'];
  return (
    <section className="invoice-print-sheet">
      <div className="invoice-print-head">
        <div><div className="invoice-logo">CUBIXGEAR</div><strong>Workshop Management</strong></div>
        <div className="invoice-title"><h2>{doc.kind === 'estimate' ? 'ESTIMATE' : doc.invoiceType === 'gst' ? 'TAX INVOICE' : 'INVOICE'}</h2><span>No: {doc.number || 'DRAFT'}</span><span>Date: {doc.date}</span><span>Job #: {doc.jobCardNo || '—'}</span></div>
      </div>
      <div className="invoice-info-band"><div><strong>Workshop</strong><span>Your Workshop Name</span><span>Address • Phone • Email</span><span>GSTIN: Configure in Settings</span></div><div><strong>Bill To</strong><span>{doc.customer?.name || '—'}</span><span>{doc.customer?.address || doc.customer?.phone || '—'}</span>{doc.invoiceType === 'gst' && <span>GSTIN: {doc.customer?.gstin || '—'}</span>}</div><div><strong>Vehicle</strong><span>{doc.vehicle?.registration || '—'}</span><span>{doc.vehicle?.makeModel || '—'}</span><span>Odometer: {doc.vehicle?.odometer || '—'}</span></div></div>
      {doc.notes && <div className="invoice-notes"><strong>Invoice Notes / Job Summary</strong><p>{doc.notes}</p></div>}
      <div className="invoice-table-head"><span>Item / Description</span><span>Qty</span><span>Unit Price</span><span>Total</span></div>
      {groups.map((group) => {
        const rows = (doc.items || []).filter((item) => item.type === group);
        if (!rows.length) return null;
        return <div className="invoice-group" key={group}><div className="invoice-group-title">{group.toUpperCase()}</div>{rows.map((item) => <div className="invoice-line" key={item.id}><span>{item.description || '—'}{item.code ? ` (${item.code})` : ''}</span><span>{item.qty}</span><span>{money.format(item.rate)}</span><span>{money.format(Number(item.qty || 0) * Number(item.rate || 0) - Number(item.discount || 0))}</span></div>)}</div>;
      })}
      <div className="invoice-totals"><div><span>Subtotal</span><strong>{money.format(totals.itemSubtotal)}</strong></div>{totals.documentDiscount > 0 && <div><span>Discount</span><strong>- {money.format(totals.documentDiscount)}</strong></div>}<div><span>Taxable Value</span><strong>{money.format(totals.taxable)}</strong></div>{totals.cgst > 0 && <div><span>CGST {doc.cgstRate}%</span><strong>{money.format(totals.cgst)}</strong></div>}{totals.sgst > 0 && <div><span>SGST {doc.sgstRate}%</span><strong>{money.format(totals.sgst)}</strong></div>}{totals.igst > 0 && <div><span>IGST {doc.igstRate}%</span><strong>{money.format(totals.igst)}</strong></div>}<div><span>Rounding</span><strong>{money.format(totals.rounding)}</strong></div><div className="grand"><span>Total</span><strong>{money.format(totals.total)}</strong></div><div><span>Paid</span><strong>{money.format(totals.paid)}</strong></div><div><span>Balance Due</span><strong>{money.format(totals.balance)}</strong></div></div>
      <div className="invoice-footer"><div><strong>Payment Terms:</strong> {doc.paymentTerms || 'C.O.D'} · {doc.paymentMode || 'Cash'}</div><div>Thank you for choosing our workshop.</div><div className="invoice-sign">Authorised Signature</div></div>
    </section>
  );
}

export default BillingWorkspace;
