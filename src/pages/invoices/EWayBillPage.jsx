import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Plus,
  Printer,
  Trash2,
  Truck
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  blankEWayBill,
  calculateEWayTotals,
  eWayBillService,
  validateEWayBill
} from '../../services/eWayBill.service';
import { billingService } from '../../services/billing.service';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const n = (value) => Number(value || 0);
const dec = (value) => String(value ?? '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
const newItem = () => ({
  id: `EWI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  productName: '',
  description: '',
  hsnCode: '',
  qty: 1,
  unit: 'PCS',
  taxableValue: '',
  cgstRate: '',
  sgstRate: '',
  igstRate: '',
  cessRate: ''
});

const resolveMode = (pathname, id) => {
  if (pathname.endsWith('/new')) return 'create';
  if (pathname.endsWith('/edit')) return 'edit';
  if (pathname.endsWith('/delete')) return 'delete';
  if (id) return 'view';
  return 'list';
};

export function EWayBillPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ewbId } = useParams();
  const mode = resolveMode(location.pathname, ewbId);

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankEWayBill());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(() => calculateEWayTotals(form), [form]);

  const loadList = async () => {
    setLoading(true);
    try {
      setRows(await eWayBillService.list());
    } catch (e) {
      setError(e?.message || 'Unable to load E-Way Bills.');
    } finally {
      setLoading(false);
    }
  };

  const loadOne = async () => {
    setLoading(true);
    try {
      const doc = await eWayBillService.get(ewbId);
      if (!doc) setError('E-Way Bill not found.');
      else setForm(JSON.parse(JSON.stringify(doc)));
    } catch (e) {
      setError(e?.message || 'Unable to load E-Way Bill.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    if (mode === 'list') loadList();
    else if (mode === 'create') {
      const invoiceId = new URLSearchParams(location.search).get('invoiceId');
      if (!invoiceId) {
        setForm(blankEWayBill());
        setLoading(false);
      } else {
        setLoading(true);
        billingService.get(invoiceId)
          .then((invoice) => {
            if (!invoice) throw new Error('Source invoice not found.');
            const base = blankEWayBill();
            const goods = (invoice.items || [])
              .filter((item) => ['Stock Part', 'Outside Purchase', 'Consumable', 'Custom Item'].includes(item.type))
              .map((item, index) => ({
                id: `EWI-PREFILL-${index}-${Date.now()}`,
                productName: item.description || 'Goods',
                description: item.code || '',
                hsnCode: '',
                qty: Number(item.qty || 1),
                unit: 'PCS',
                taxableValue: Math.max(0, Number(item.qty || 0) * Number(item.rate || 0) - Number(item.discount || 0)),
                cgstRate: invoice.taxMode === 'cgst_sgst' ? Number(invoice.cgstRate || 0) : '',
                sgstRate: invoice.taxMode === 'cgst_sgst' ? Number(invoice.sgstRate || 0) : '',
                igstRate: invoice.taxMode === 'igst' ? Number(invoice.igstRate || 0) : '',
                cessRate: ''
              }));

            setForm({
              ...base,
              documentType: invoice.invoiceType === 'gst' ? 'Tax Invoice' : 'Bill of Supply',
              documentNo: invoice.number || invoice.id || '',
              documentDate: invoice.date || base.documentDate,
              invoiceId: invoice.id || '',
              jobCardNo: invoice.jobCardNo || '',
              to: {
                ...base.to,
                gstin: invoice.customer?.gstin || 'URP',
                tradeName: invoice.customer?.name || '',
                address: invoice.customer?.address || '',
                place: invoice.customer?.placeOfSupply || '',
                stateCode: invoice.customer?.stateCode || base.to.stateCode
              },
              items: goods.length ? goods : base.items,
              notes: invoice.number ? `Created from CubixGear invoice ${invoice.number}` : ''
            });
          })
          .catch((e) => setError(e?.message || 'Unable to prefill from invoice.'))
          .finally(() => setLoading(false));
      }
    } else loadOne();
  }, [location.pathname, location.search, ewbId]);

  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const updateGroup = (group, key, value) => setForm((old) => ({
    ...old,
    [group]: { ...old[group], [key]: value }
  }));
  const updateItem = (itemId, key, value) => setForm((old) => ({
    ...old,
    items: old.items.map((item) => item.id === itemId ? { ...item, [key]: value } : item)
  }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await eWayBillService.save(form);
      navigate(`/invoices/e-way-bills/${saved.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to save E-Way Bill.');
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    const validation = validateEWayBill(form);
    if (validation) return setError(validation);

    setSaving(true);
    setError('');
    try {
      let current = form;
      if (!current.id) current = await eWayBillService.save(current);
      const result = await eWayBillService.submit(current.id);
      setForm(result);
      navigate(`/invoices/e-way-bills/${result.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to prepare E-Way Bill.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await eWayBillService.remove(ewbId);
      navigate('/invoices/e-way-bills', { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to delete E-Way Bill.');
      setSaving(false);
    }
  };

  if (mode === 'list') {
    return (
      <div className="billing-page">
        <header className="billing-page-head">
          <div>
            <span className="billing-kicker">BILLING · GOODS MOVEMENT</span>
            <h1>E-Way Bills</h1>
            <p>Create inward/outward transport documents for workshop goods movement.</p>
          </div>
          <button className="bill-btn" onClick={() => navigate('/invoices/e-way-bills/new')}>
            <Plus size={17}/>Create E-Way Bill
          </button>
        </header>

        <div className="billing-tabs">
          <button onClick={() => navigate('/invoices')}><FileText size={16}/>Invoices</button>
          <button className="active"><Truck size={16}/>E-Way Bills</button>
        </div>

        {error && <div className="billing-error">{error}</div>}

        <section className="billing-card billing-list-card">
          {loading ? <div className="billing-empty">Loading…</div> : (
            <div className="billing-doc-list">
              {rows.map((row) => {
                const total = calculateEWayTotals(row).totalValue;
                return (
                  <article className="billing-doc-row" key={row.id}>
                    <button type="button" className="billing-doc-main" onClick={() => navigate(`/invoices/e-way-bills/${row.id}`)}>
                      <strong>{row.documentNo || row.id}</strong>
                      <span>{row.supplyType} · {row.from?.tradeName || 'From'} → {row.to?.tradeName || 'To'}</span>
                    </button>
                    <div className="billing-doc-meta">
                      <span>{row.documentDate || '—'}</span>
                      <strong>{money.format(total)}</strong>
                    </div>
                    <span className="billing-status">{row.status}</span>
                    <div className="billing-list-actions">
                      <button aria-label="View" onClick={() => navigate(`/invoices/e-way-bills/${row.id}`)}><Eye size={16}/></button>
                      <button aria-label="Edit" onClick={() => navigate(`/invoices/e-way-bills/${row.id}/edit`)}><Edit3 size={16}/></button>
                      <button aria-label="Delete" className="danger" onClick={() => navigate(`/invoices/e-way-bills/${row.id}/delete`)}><Trash2 size={16}/></button>
                    </div>
                  </article>
                );
              })}
              {!rows.length && <div className="billing-empty">No E-Way Bill drafts yet.</div>}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (mode === 'delete') {
    return (
      <div className="billing-page">
        <header className="billing-page-head">
          <div><span className="billing-kicker">DELETE E-WAY BILL</span><h1>{form.documentNo || ewbId}</h1></div>
        </header>
        {error && <div className="billing-error">{error}</div>}
        <section className="billing-card">
          <h3>Delete this local E-Way Bill draft?</h3>
          <p>This only deletes the CubixGear record. It does not cancel an E-Way Bill already generated on the GST portal.</p>
          <div className="billing-head-actions">
            <button className="bill-btn secondary" onClick={() => navigate(`/invoices/e-way-bills/${ewbId}`)}>Back</button>
            <button className="bill-btn danger" disabled={saving} onClick={remove}><Trash2 size={16}/>{saving ? 'Deleting…' : 'Delete Draft'}</button>
          </div>
        </section>
      </div>
    );
  }

  if (mode === 'view') {
    return (
      <div className="billing-page invoice-view-page">
        <div className="billing-editor-head eway-editor-head no-print">
          <div className="eway-title-block">
            <button className="bill-btn secondary eway-back-btn" onClick={() => navigate('/invoices/e-way-bills')}>
              <ArrowLeft size={16}/>Back
            </button>
            <div className="eway-title-copy">
              <span className="billing-kicker">E-WAY BILL</span>
              <h1>{form.documentNo || form.id}</h1>
              <p>{form.supplyType} · {form.status}</p>
            </div>
          </div>
          <div className="billing-head-actions">
            <button className="bill-btn secondary" onClick={() => navigate(`/invoices/e-way-bills/${ewbId}/edit`)}><Edit3 size={16}/>Edit</button>
            <button className="bill-btn secondary" onClick={() => window.print()}><Printer size={16}/>Print</button>
            {form.status === 'Draft' && <button className="bill-btn" disabled={saving} onClick={submit}><CheckCircle2 size={16}/>Prepare for API</button>}
          </div>
        </div>

        {error && <div className="billing-error no-print">{error}</div>}
        {loading ? <div className="billing-empty">Loading…</div> : <EWayBillPrint doc={form} totals={totals}/>}
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="billing-editor-head eway-editor-head no-print">
        <div className="eway-title-block">
          <button className="bill-btn secondary eway-back-btn" onClick={() => navigate(mode === 'edit' ? `/invoices/e-way-bills/${ewbId}` : '/invoices/e-way-bills')}>
            <ArrowLeft size={16}/>Back
          </button>
          <div className="eway-title-copy">
            <span className="billing-kicker">E-WAY BILL</span>
            <h1>{mode === 'edit' ? 'Edit E-Way Bill' : 'Create E-Way Bill'}</h1>
            <p>Goods movement document for inward/outward transport.</p>
          </div>
        </div>
        <div className="billing-head-actions">
          <button className="bill-btn secondary" disabled={saving} onClick={save}>Save Draft</button>
          <button className="bill-btn" disabled={saving} onClick={submit}><CheckCircle2 size={16}/>Prepare for API</button>
        </div>
      </div>

      {error && <div className="billing-error no-print">{error}</div>}

      <div className="eway-grid no-print">
        <section className="billing-card">
          <h3>Transaction</h3>

          <label>Supply Type
            <select value={form.supplyType} onChange={(e) => update('supplyType', e.target.value)}>
              <option>Outward</option>
              <option>Inward</option>
            </select>
          </label>

          <label>Sub-Supply Type
            <select value={form.subSupplyType} onChange={(e) => update('subSupplyType', e.target.value)}>
              {['Supply','Import','Export','Job Work','SKD/CKD','Recipient Not Known','Line Sales','Sales Return','Exhibition or Fairs','For Own Use','Others'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>

          <label>Transaction Type
            <select value={form.transactionType} onChange={(e) => update('transactionType', e.target.value)}>
              <option>Regular</option>
              <option>Bill To - Ship To</option>
              <option>Bill From - Dispatch From</option>
              <option>Combination</option>
            </select>
          </label>

          <label>Document Type
            <select value={form.documentType} onChange={(e) => update('documentType', e.target.value)}>
              <option>Tax Invoice</option>
              <option>Bill of Supply</option>
              <option>Delivery Challan</option>
              <option>Bill of Entry</option>
              <option>Others</option>
            </select>
          </label>

          <label>Invoice / Challan No.
            <input value={form.documentNo} onChange={(e) => update('documentNo', e.target.value)} placeholder="INV-2026-1001 / DC-001"/>
          </label>

          <label>Document Date
            <input type="date" value={form.documentDate} onChange={(e) => update('documentDate', e.target.value)}/>
          </label>

          <label>Invoice ID / Reference
            <input value={form.invoiceId || ''} onChange={(e) => update('invoiceId', e.target.value)} placeholder="Optional CubixGear invoice ID"/>
          </label>

          <label>Job Card No.
            <input value={form.jobCardNo || ''} onChange={(e) => update('jobCardNo', e.target.value)} placeholder="Optional"/>
          </label>
        </section>

        <PartyCard title="Bill From / Dispatch From" data={form.from} onChange={(key, value) => updateGroup('from', key, value)} />
        <PartyCard title="Bill To / Ship To" data={form.to} onChange={(key, value) => updateGroup('to', key, value)} />

        <section className="billing-card">
          <h3>Transporter & Vehicle</h3>
          <label>Transport Mode
            <select value={form.transport.mode} onChange={(e) => updateGroup('transport', 'mode', e.target.value)}>
              <option>Road</option>
              <option>Rail</option>
              <option>Air</option>
              <option>Ship</option>
            </select>
          </label>
          <label>Transporter ID / GSTIN
            <input value={form.transport.transporterId} onChange={(e) => updateGroup('transport', 'transporterId', e.target.value)} placeholder="15 digit Transporter ID / GSTIN"/>
          </label>
          <label>Transporter Name
            <input value={form.transport.transporterName} onChange={(e) => updateGroup('transport', 'transporterName', e.target.value)}/>
          </label>
          <label>Approx. Distance (km)
            <input inputMode="numeric" value={form.transport.distanceKm} onChange={(e) => updateGroup('transport', 'distanceKm', dec(e.target.value))}/>
          </label>
          <label>Vehicle Number
            <input value={form.transport.vehicleNo} onChange={(e) => updateGroup('transport', 'vehicleNo', e.target.value.toUpperCase())} placeholder="KL08AB1234"/>
          </label>
          <label>Vehicle Type
            <select value={form.transport.vehicleType} onChange={(e) => updateGroup('transport', 'vehicleType', e.target.value)}>
              <option>Regular</option>
              <option>ODC</option>
            </select>
          </label>
          <label>Transport Document No.
            <input value={form.transport.transportDocNo} onChange={(e) => updateGroup('transport', 'transportDocNo', e.target.value)} placeholder="LR / GR / RR / AWB / BL"/>
          </label>
          <label>Transport Document Date
            <input type="date" value={form.transport.transportDocDate} onChange={(e) => updateGroup('transport', 'transportDocDate', e.target.value)}/>
          </label>
        </section>
      </div>

      <section className="billing-card no-print eway-items-card">
        <div className="billing-section-head">
          <div><span className="billing-kicker">GOODS</span><h3>Item details</h3></div>
          <button className="bill-btn" onClick={() => update('items', [...form.items, newItem()])}><Plus size={16}/>Add Goods</button>
        </div>

        <div className="eway-item-list">
          {form.items.map((item, index) => (
            <div className="eway-item-card" key={item.id}>
              <div className="eway-item-title"><strong>Item {index + 1}</strong><button className="bill-icon-btn" onClick={() => update('items', form.items.filter((x) => x.id !== item.id))}><Trash2 size={15}/></button></div>
              <div className="eway-item-grid">
                <label>Product Name<input value={item.productName} onChange={(e) => updateItem(item.id, 'productName', e.target.value)}/></label>
                <label>HSN Code<input inputMode="numeric" value={item.hsnCode} onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value.replace(/\D/g, ''))}/></label>
                <label>Qty<input inputMode="decimal" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', dec(e.target.value))}/></label>
                <label>Unit<select value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}><option>PCS</option><option>SET</option><option>UNT</option><option>KGS</option><option>LTR</option><option>BOX</option><option>OTH</option></select></label>
                <label>Taxable Value ₹<input inputMode="decimal" value={item.taxableValue} onChange={(e) => updateItem(item.id, 'taxableValue', dec(e.target.value))}/></label>
                <label>CGST %<input inputMode="decimal" value={item.cgstRate} onChange={(e) => updateItem(item.id, 'cgstRate', dec(e.target.value))}/></label>
                <label>SGST %<input inputMode="decimal" value={item.sgstRate} onChange={(e) => updateItem(item.id, 'sgstRate', dec(e.target.value))}/></label>
                <label>IGST %<input inputMode="decimal" value={item.igstRate} onChange={(e) => updateItem(item.id, 'igstRate', dec(e.target.value))}/></label>
                <label className="wide">Description<input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Optional"/></label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="billing-card no-print">
        <label>Remarks / Notes<textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Transport or goods movement remarks"/></label>
      </section>

      <div className="billing-summary no-print">
        <span>Taxable <strong>{money.format(totals.taxableValue)}</strong></span>
        <span>GST <strong>{money.format(totals.cgst + totals.sgst + totals.igst)}</strong></span>
        <span>Cess <strong>{money.format(totals.cess)}</strong></span>
        <span className="grand">Total Value <strong>{money.format(totals.totalValue)}</strong></span>
      </div>

      <EWayBillPrint doc={form} totals={totals}/>
    </div>
  );
}

function PartyCard({ title, data, onChange }) {
  return (
    <section className="billing-card">
      <h3>{title}</h3>
      <label>GSTIN / URP<input value={data.gstin || ''} onChange={(e) => onChange('gstin', e.target.value.toUpperCase())}/></label>
      <label>Trade Name<input value={data.tradeName || ''} onChange={(e) => onChange('tradeName', e.target.value)}/></label>
      <label>Address<textarea value={data.address || ''} onChange={(e) => onChange('address', e.target.value)}/></label>
      <label>Place<input value={data.place || ''} onChange={(e) => onChange('place', e.target.value)}/></label>
      <label>PIN Code<input inputMode="numeric" maxLength={6} value={data.pincode || ''} onChange={(e) => onChange('pincode', e.target.value.replace(/\D/g, '').slice(0,6))}/></label>
      <label>State Code<input inputMode="numeric" value={data.stateCode || ''} onChange={(e) => onChange('stateCode', e.target.value.replace(/\D/g, '').slice(0,2))}/></label>
    </section>
  );
}

function EWayBillPrint({ doc, totals }) {
  return (
    <section className="eway-print-sheet">
      <div className="eway-print-head">
        <div><div className="invoice-logo">CUBIXGEAR</div><strong>E-Way Bill Transport Record</strong></div>
        <div className="eway-print-meta"><strong>{doc.status}</strong><span>{doc.documentType}</span><span>{doc.documentNo || 'DRAFT'}</span><span>{doc.documentDate || '—'}</span></div>
      </div>

      <div className="eway-print-band">
        <div><span>Supply Type</span><strong>{doc.supplyType}</strong></div>
        <div><span>Sub-Supply</span><strong>{doc.subSupplyType}</strong></div>
        <div><span>Transaction</span><strong>{doc.transactionType}</strong></div>
      </div>

      <div className="eway-party-grid">
        <div><h4>From</h4><strong>{doc.from?.tradeName || '—'}</strong><span>{doc.from?.gstin || '—'}</span><span>{doc.from?.address || '—'}</span><span>{doc.from?.place || ''} {doc.from?.pincode || ''}</span></div>
        <div><h4>To</h4><strong>{doc.to?.tradeName || '—'}</strong><span>{doc.to?.gstin || '—'}</span><span>{doc.to?.address || '—'}</span><span>{doc.to?.place || ''} {doc.to?.pincode || ''}</span></div>
      </div>

      <div className="eway-print-table">
        <div className="head"><span>Goods</span><span>HSN</span><span>Qty</span><span>Value</span></div>
        {(doc.items || []).map((item) => (
          <div className="row" key={item.id}><span>{item.productName || '—'}</span><span>{item.hsnCode || '—'}</span><span>{item.qty || 0} {item.unit}</span><span>{money.format(n(item.taxableValue))}</span></div>
        ))}
      </div>

      <div className="eway-transport-print">
        <h4>Transport</h4>
        <div><span>Mode</span><strong>{doc.transport?.mode || '—'}</strong></div>
        <div><span>Transporter</span><strong>{doc.transport?.transporterName || doc.transport?.transporterId || '—'}</strong></div>
        <div><span>Vehicle No.</span><strong>{doc.transport?.vehicleNo || '—'}</strong></div>
        <div><span>Distance</span><strong>{doc.transport?.distanceKm ? `${doc.transport.distanceKm} km` : '—'}</strong></div>
      </div>

      <div className="invoice-totals">
        <div><span>Taxable Value</span><strong>{money.format(totals.taxableValue)}</strong></div>
        <div><span>GST</span><strong>{money.format(totals.cgst + totals.sgst + totals.igst)}</strong></div>
        <div className="grand"><span>Total Value</span><strong>{money.format(totals.totalValue)}</strong></div>
      </div>

      <div className="eway-disclaimer">CubixGear local transport record. Official E-Way Bill number/status is populated only after GST/NIC API generation.</div>
    </section>
  );
}

export default EWayBillPage;
