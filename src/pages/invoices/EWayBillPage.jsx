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
import { DocumentFormHeader } from '../../components/common/DocumentFormShell';

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
          <button onClick={() => navigate('/invoices?kind=invoice')}><FileText size={16}/>Invoices</button>
          <button onClick={() => navigate('/invoices?kind=estimate')}><FileText size={16}/>Estimates</button>
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
      <DocumentFormHeader
        eyebrow="E-WAY BILL"
        title={mode === 'edit' ? 'Edit E-Way Bill' : 'Create E-Way Bill'}
        description="Goods movement document for inward/outward transport."
        actions={
          <>
            <button className="bill-btn secondary" type="button" onClick={() => window.print()}>
              <Printer size={16}/>Preview / PDF
            </button>
            <button className="bill-btn secondary" disabled={saving} onClick={save}>
              Save Draft
            </button>
            <button className="bill-btn" disabled={saving} onClick={submit}>
              <CheckCircle2 size={16}/>{saving ? 'Working…' : 'Prepare for API'}
            </button>
          </>
        }
      />

      {error && <div className="billing-error no-print">{error}</div>}

      <div className="no-print grid gap-4">
        <section className="billing-card">
          <div className="mb-4">
            <span className="billing-kicker">MOVEMENT DETAILS</span>
            <h3>Document & Supply</h3>
            <p className="m-0 text-xs text-muted">Basic E-Way Bill document and movement information.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label>Supply Type
              <select value={form.supplyType} onChange={(e) => update('supplyType', e.target.value)}>
                <option>Outward</option>
                <option>Inward</option>
              </select>
            </label>

            <label>Sub Supply Type
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

            <label>Transport Mode
              <select value={form.transport.mode} onChange={(e) => updateGroup('transport', 'mode', e.target.value)}>
                <option>Road</option>
                <option>Rail</option>
                <option>Air</option>
                <option>Ship</option>
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

            <label>Document Number
              <input value={form.documentNo} onChange={(e) => update('documentNo', e.target.value)} placeholder="Invoice / Challan No."/>
            </label>

            <label>Document Date
              <input type="date" value={form.documentDate} onChange={(e) => update('documentDate', e.target.value)}/>
            </label>

            <label>Approx Distance (km)
              <input inputMode="numeric" value={form.transport.distanceKm} onChange={(e) => updateGroup('transport', 'distanceKm', dec(e.target.value))} placeholder="0"/>
            </label>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="billing-card">
            <span className="billing-kicker">FROM</span>
            <h3>Dispatch / Bill From</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>GSTIN / URP
                <input value={form.from?.gstin || ''} onChange={(e) => updateGroup('from', 'gstin', e.target.value.toUpperCase())} placeholder="GSTIN / URP"/>
              </label>
              <label>Trade Name
                <input value={form.from?.tradeName || ''} onChange={(e) => updateGroup('from', 'tradeName', e.target.value)} placeholder="Workshop / company"/>
              </label>
              <label className="sm:col-span-2">Address
                <textarea value={form.from?.address || ''} onChange={(e) => updateGroup('from', 'address', e.target.value)} placeholder="Dispatch address"/>
              </label>
              <label>Place
                <input value={form.from?.place || ''} onChange={(e) => updateGroup('from', 'place', e.target.value)} placeholder="Place"/>
              </label>
              <label>PIN Code
                <input inputMode="numeric" maxLength={6} value={form.from?.pincode || ''} onChange={(e) => updateGroup('from', 'pincode', e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="680001"/>
              </label>
              <label>State Code
                <input inputMode="numeric" maxLength={2} value={form.from?.stateCode || ''} onChange={(e) => updateGroup('from', 'stateCode', e.target.value.replace(/\D/g, '').slice(0,2))} placeholder="32"/>
              </label>
            </div>
          </section>

          <section className="billing-card">
            <span className="billing-kicker">TO</span>
            <h3>Bill To / Ship To</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>GSTIN / URP
                <input value={form.to?.gstin || ''} onChange={(e) => updateGroup('to', 'gstin', e.target.value.toUpperCase())} placeholder="GSTIN / URP"/>
              </label>
              <label>Trade Name
                <input value={form.to?.tradeName || ''} onChange={(e) => updateGroup('to', 'tradeName', e.target.value)} placeholder="Customer / destination"/>
              </label>
              <label className="sm:col-span-2">Address
                <textarea value={form.to?.address || ''} onChange={(e) => updateGroup('to', 'address', e.target.value)} placeholder="Ship-to address"/>
              </label>
              <label>Place
                <input value={form.to?.place || ''} onChange={(e) => updateGroup('to', 'place', e.target.value)} placeholder="Place"/>
              </label>
              <label>PIN Code
                <input inputMode="numeric" maxLength={6} value={form.to?.pincode || ''} onChange={(e) => updateGroup('to', 'pincode', e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="PIN"/>
              </label>
              <label>State Code
                <input inputMode="numeric" maxLength={2} value={form.to?.stateCode || ''} onChange={(e) => updateGroup('to', 'stateCode', e.target.value.replace(/\D/g, '').slice(0,2))} placeholder="32"/>
              </label>
            </div>
          </section>
        </div>

        <section className="billing-card">
          <div className="billing-section-head">
            <div>
              <span className="billing-kicker">GOODS</span>
              <h3>Goods Details</h3>
            </div>
            <button type="button" className="bill-btn secondary" onClick={() => update('items', [...form.items, newItem()])}>
              <Plus size={15}/>Add Goods
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[920px] space-y-2">
              <div className="grid grid-cols-[110px_minmax(220px,1.7fr)_120px_130px_minmax(250px,1.5fr)_42px] gap-2 px-2 text-[10px] font-extrabold uppercase tracking-wide text-muted">
                <span>HSN</span>
                <span>Product / Description</span>
                <span>Qty / Unit</span>
                <span>Taxable Value</span>
                <span>Tax Rates %</span>
                <span></span>
              </div>

              {form.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[110px_minmax(220px,1.7fr)_120px_130px_minmax(250px,1.5fr)_42px] gap-2 rounded-xl border border-line bg-surface-2 p-2">
                  <input inputMode="numeric" value={item.hsnCode} onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value.replace(/\D/g, ''))} placeholder="HSN"/>
                  <div className="grid gap-2">
                    <input value={item.productName} onChange={(e) => updateItem(item.id, 'productName', e.target.value)} placeholder={`Item ${index + 1} name`}/>
                    <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Description"/>
                  </div>
                  <div className="grid gap-2">
                    <input inputMode="decimal" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', dec(e.target.value))} placeholder="Qty"/>
                    <select value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)}>
                      <option>PCS</option><option>SET</option><option>UNT</option><option>KGS</option><option>LTR</option><option>BOX</option><option>OTH</option>
                    </select>
                  </div>
                  <input inputMode="decimal" value={item.taxableValue} onChange={(e) => updateItem(item.id, 'taxableValue', dec(e.target.value))} placeholder="0.00"/>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input aria-label="CGST rate" inputMode="decimal" value={item.cgstRate} onChange={(e) => updateItem(item.id, 'cgstRate', dec(e.target.value))} placeholder="CGST"/>
                    <input aria-label="SGST rate" inputMode="decimal" value={item.sgstRate} onChange={(e) => updateItem(item.id, 'sgstRate', dec(e.target.value))} placeholder="SGST"/>
                    <input aria-label="IGST rate" inputMode="decimal" value={item.igstRate} onChange={(e) => updateItem(item.id, 'igstRate', dec(e.target.value))} placeholder="IGST"/>
                    <input aria-label="CESS rate" inputMode="decimal" value={item.cessRate} onChange={(e) => updateItem(item.id, 'cessRate', dec(e.target.value))} placeholder="CESS"/>
                  </div>
                  <button type="button" className="bill-icon-btn danger" aria-label="Remove goods item" onClick={() => update('items', form.items.filter((x) => x.id !== item.id))}>
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              ['Taxable', totals.taxableValue],
              ['CGST', totals.cgst],
              ['SGST', totals.sgst],
              ['IGST', totals.igst],
              ['CESS', totals.cess]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-surface-2 p-3">
                <div className="text-[10px] font-bold uppercase text-muted">{label}</div>
                <div className="mt-1 text-xs font-extrabold text-content">{money.format(value)}</div>
              </div>
            ))}

            <label className="!mb-0 rounded-xl border border-line bg-surface-2 p-2">CESS Non-Advol
              <input inputMode="decimal" value={form.cessNonAdvolAmount || ''} onChange={(e) => update('cessNonAdvolAmount', dec(e.target.value))} placeholder="0.00"/>
            </label>

            <label className="!mb-0 rounded-xl border border-line bg-surface-2 p-2">Other Amount
              <input inputMode="decimal" value={form.otherAmount || ''} onChange={(e) => update('otherAmount', dec(e.target.value))} placeholder="0.00"/>
            </label>

            <div className="rounded-xl border border-primary bg-primary-soft p-3">
              <div className="text-[10px] font-bold uppercase text-primary">Total</div>
              <div className="mt-1 text-sm font-extrabold text-primary">{money.format(totals.totalValue)}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="billing-card">
            <span className="billing-kicker">TRANSPORT</span>
            <h3>Transportation Details</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>Transporter ID / GSTIN
                <input value={form.transport.transporterId} onChange={(e) => updateGroup('transport', 'transporterId', e.target.value.toUpperCase())} placeholder="Transporter ID"/>
              </label>
              <label>Transporter Name
                <input value={form.transport.transporterName} onChange={(e) => updateGroup('transport', 'transporterName', e.target.value)} placeholder="Transporter name"/>
              </label>
              <label>Transport Document No.
                <input value={form.transport.transportDocNo} onChange={(e) => updateGroup('transport', 'transportDocNo', e.target.value)} placeholder="LR / GR / RR / AWB / BL"/>
              </label>
              <label>Transport Document Date
                <input type="date" value={form.transport.transportDocDate} onChange={(e) => updateGroup('transport', 'transportDocDate', e.target.value)}/>
              </label>
            </div>
          </section>

          <section className="billing-card">
            <span className="billing-kicker">VEHICLE</span>
            <h3>Vehicle Details</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>Vehicle Number
                <input value={form.transport.vehicleNo} onChange={(e) => updateGroup('transport', 'vehicleNo', e.target.value.toUpperCase())} placeholder="KL08AB1234"/>
              </label>
              <label>Vehicle Type
                <select value={form.transport.vehicleType || 'Regular'} onChange={(e) => updateGroup('transport', 'vehicleType', e.target.value)}>
                  <option>Regular</option>
                  <option>Over Dimensional Cargo</option>
                </select>
              </label>
              <label>Entered From
                <input value={form.enteredFrom || ''} onChange={(e) => update('enteredFrom', e.target.value.toUpperCase())} placeholder="Place"/>
              </label>
              <label>Entered By
                <input value={form.enteredBy || ''} onChange={(e) => update('enteredBy', e.target.value.toUpperCase())} placeholder="GSTIN / User"/>
              </label>
              <label>CEWB No. (optional)
                <input value={form.cewbNo || ''} onChange={(e) => update('cewbNo', e.target.value)} placeholder="—"/>
              </label>
              <label>Portal
                <input value={form.portal || '1'} onChange={(e) => update('portal', e.target.value)} placeholder="1"/>
              </label>
            </div>
          </section>
        </div>

        <section className="billing-card">
          <span className="billing-kicker">NOTES</span>
          <h3>Remarks</h3>
          <label className="!mb-0">Remarks / Notes
            <textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Optional transport / goods movement remarks"/>
          </label>
        </section>
      </div>

      <div className="eway-print-only">
        <EWayBillPrint doc={form} totals={totals}/>
      </div>
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
  const plain = (value) => Number(value || 0).toFixed(2);
  const dateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const ratePart = (value) => Number(value || 0) > 0 ? Number(value).toFixed(3) : 'NE';
  const ewbReady = Boolean(doc.ewayBillNo);

  return (
    <section className="eway-print-sheet eway-official-model">
      <div className="eway-official-top">
        <div>
          <h2>e-Way Bill</h2>
          <span className="eway-local-badge">{ewbReady ? 'API GENERATED RECORD' : 'LOCAL PREVIEW · READY FOR NIC API'}</span>
        </div>
        <div className="eway-qr-placeholder" aria-label="Official QR placeholder">
          <strong>{ewbReady ? 'OFFICIAL QR' : 'QR'}</strong>
          <span>{ewbReady ? 'Render from NIC response' : 'Available after NIC generation'}</span>
        </div>
      </div>

      <div className="eway-pdf-section">
        <div className="eway-pdf-section-title">1. E-WAY BILL Details</div>
        <div className="eway-detail-grid primary">
          <div><span>eWay Bill No:</span><strong>{doc.ewayBillNo || 'Pending NIC generation'}</strong></div>
          <div><span>Generated Date:</span><strong>{dateTime(doc.generatedAt)}</strong></div>
          <div><span>Generated By:</span><strong>{doc.generatedBy || '—'}</strong></div>
          <div><span>Valid Upto:</span><strong>{doc.validUntil || '—'}</strong></div>
        </div>
        <div className="eway-detail-grid secondary">
          <div><span>Mode:</span><strong>{doc.transport?.mode || '—'}</strong></div>
          <div><span>Approx Distance:</span><strong>{doc.transport?.distanceKm ? `${doc.transport.distanceKm}km` : '—'}</strong></div>
          <div><span>Type:</span><strong>{doc.supplyType || '—'} - {doc.subSupplyType || '—'}</strong></div>
          <div><span>Document Details:</span><strong>{doc.documentType || '—'} - {doc.documentNo || 'DRAFT'} - {doc.documentDate || '—'}</strong></div>
          <div><span>Transaction type:</span><strong>{doc.transactionType || '—'}</strong></div>
          <div><span>Portal:</span><strong>{doc.portal || '1'}</strong></div>
        </div>
      </div>

      <div className="eway-pdf-section">
        <div className="eway-pdf-section-title">2. Address Details</div>
        <div className="eway-address-grid">
          <div className="eway-address-box">
            <h4>From</h4>
            <span>GSTIN : {doc.from?.gstin || '—'}</span>
            <strong>{doc.from?.tradeName || '—'}</strong>
            <span>{doc.from?.stateCode ? `State Code: ${doc.from.stateCode}` : ''}</span>
            <b>:: Dispatch From ::</b>
            <span>{doc.from?.address || '—'}</span>
            <span>{[doc.from?.place, doc.from?.pincode].filter(Boolean).join(', ') || '—'}</span>
          </div>
          <div className="eway-address-box">
            <h4>To</h4>
            <span>GSTIN : {doc.to?.gstin || '—'}</span>
            <strong>{doc.to?.tradeName || '—'}</strong>
            <span>{doc.to?.stateCode ? `State Code: ${doc.to.stateCode}` : ''}</span>
            <b>:: Ship To ::</b>
            <span>{doc.to?.address || '—'}</span>
            <span>{[doc.to?.place, doc.to?.pincode].filter(Boolean).join(', ') || '—'}</span>
          </div>
        </div>
      </div>

      <div className="eway-pdf-section">
        <div className="eway-pdf-section-title">3. Goods Details</div>
        <div className="eway-goods-table">
          <div className="head">
            <span>HSN Code</span>
            <span>Product Name & Desc.</span>
            <span>Quantity</span>
            <span>Taxable Amount Rs.</span>
            <span>Tax Rate (C+S+I+Cess+Cess Non.Advol)</span>
          </div>
          {(doc.items || []).map((item, index) => (
            <div className="row" key={item.id || index}>
              <span>{item.hsnCode || '—'}</span>
              <span><strong>{item.productName || '—'}</strong>{item.description ? ` · ${item.description}` : ''}</span>
              <span>{plain(item.qty)}<small>{item.unit || 'PCS'}</small></span>
              <span>{plain(item.taxableValue)}</span>
              <span>{ratePart(item.cgstRate)}+{ratePart(item.sgstRate)}+{ratePart(item.igstRate)}+{ratePart(item.cessRate)}+0.00</span>
            </div>
          ))}
        </div>

        <div className="eway-tax-strip">
          <div><span>Tot. Tax'ble Amt</span><strong>{plain(totals.taxableValue)}</strong></div>
          <div><span>CGST Amt</span><strong>{plain(totals.cgst)}</strong></div>
          <div><span>SGST Amt</span><strong>{plain(totals.sgst)}</strong></div>
          <div><span>IGST Amt</span><strong>{plain(totals.igst)}</strong></div>
          <div><span>CESS Amt</span><strong>{plain(totals.cess)}</strong></div>
          <div><span>CESS Non.Advol Amt</span><strong>{plain(totals.cessNonAdvol)}</strong></div>
          <div><span>Other Amt</span><strong>{plain(totals.otherAmount)}</strong></div>
          <div><span>Total Inv.Amt</span><strong>{plain(totals.totalValue)}</strong></div>
        </div>
      </div>

      <div className="eway-pdf-section">
        <div className="eway-pdf-section-title">4. Transportation Details</div>
        <div className="eway-transport-row">
          <div><span>Transporter ID & Name :</span><strong>{[doc.transport?.transporterId, doc.transport?.transporterName].filter(Boolean).join(' · ') || '—'}</strong></div>
          <div><span>Transporter Doc. No & Date :</span><strong>{[doc.transport?.transportDocNo, doc.transport?.transportDocDate].filter(Boolean).join(' · ') || '—'}</strong></div>
        </div>
      </div>

      <div className="eway-pdf-section">
        <div className="eway-pdf-section-title">5. Vehicle Details</div>
        <div className="eway-vehicle-table">
          <div className="head">
            <span>Mode</span>
            <span>Vehicle / Trans Doc No & Dt.</span>
            <span>From</span>
            <span>Entered Date</span>
            <span>Entered By</span>
            <span>CEWB No. (If any)</span>
            <span>Multi Veh.Info (If any)</span>
            <span>Portal</span>
          </div>
          <div className="row">
            <span>{doc.transport?.mode || '—'}</span>
            <span>{doc.transport?.vehicleNo || doc.transport?.transportDocNo || '—'}</span>
            <span>{doc.enteredFrom || doc.from?.place || '—'}</span>
            <span>{dateTime(doc.generatedAt || doc.updatedAt || doc.createdAt)}</span>
            <span>{doc.enteredBy || doc.generatedBy || doc.from?.gstin || '—'}</span>
            <span>{doc.cewbNo || '-'}</span>
            <span>{doc.multiVehicleInfo || '-'}</span>
            <span>{doc.portal || '1'}</span>
          </div>
        </div>
      </div>

      <div className="eway-barcode-placeholder">
        <div className="eway-barcode-bars" aria-hidden="true"></div>
        <span>{doc.ewayBillNo || doc.documentNo || 'NIC E-Way Bill barcode after generation'}</span>
      </div>

      <div className="eway-disclaimer">
        CubixGear local preview. Official E-Way Bill number, QR/barcode, generated date and validity must come from the GST/NIC API response.
      </div>
    </section>
  );
}

export default EWayBillPage;
