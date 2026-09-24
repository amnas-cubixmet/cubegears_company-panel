import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit3, Eye, FileText, Plus, Printer, ReceiptText, Trash2, Truck, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { billingService, blankBillingDocument, calculateDocumentTotals } from '../../services/billing.service';
import { customerService } from '../../services/customer.service';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const itemTypes = ['Stock Part', 'Outside Purchase', 'Labour', 'Service', 'Consumable', 'Custom Item'];
const emptyItem = () => ({ id: `ROW-${Date.now()}-${Math.random()}`, type: 'Labour', description: '', code: '', hsnCode: '', qty: 1, unit: 'PCS', purchasePrice: '', rate: '', taxRate: 18, discount: 0, inventoryId: '' });
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
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(kindFromUrl);
  const [form, setForm] = useState(blankBillingDocument(kindFromUrl));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadList = async () => {
    setLoading(true);
    try {
      const [docs, stock, customerRows] = await Promise.all([
        billingService.list(),
        billingService.inventory(),
        customerService.getCustomers({ status: 'Active' })
      ]);
      setDocuments(Array.isArray(docs) ? docs : []);
      setInventory(Array.isArray(stock) ? stock : []);
      setCustomers(Array.isArray(customerRows) ? customerRows : []);
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
      const [doc, stock, customerRows] = await Promise.all([
        billingService.get(id),
        billingService.inventory(),
        customerService.getCustomers({ status: 'Active' })
      ]);
      if (!doc) setError('Invoice / estimate not found.');
      else setForm(JSON.parse(JSON.stringify(doc)));
      setInventory(Array.isArray(stock) ? stock : []);
      setCustomers(Array.isArray(customerRows) ? customerRows : []);
    } catch (e) {
      setError(e?.message || 'Unable to load document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    setActiveTab(kindFromUrl);
    if (mode === 'list') loadList();
    else if (mode === 'create') {
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setCustomerVehicles([]);
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

  const formatCustomerAddress = (customer) => {
    return [
      customer?.address,
      customer?.city,
      customer?.pincode
    ].filter(Boolean).join(', ');
  };

  const applyVehicle = (vehicle, vehicles = customerVehicles) => {
    const resolved = vehicle || vehicles.find((row) => String(row.id) === String(vehicle));
    if (!resolved) {
      setSelectedVehicleId('');
      return;
    }

    setSelectedVehicleId(String(resolved.id || ''));
    setForm((old) => ({
      ...old,
      transportation: {
        ...(old.transportation || {}),
        vehicleNo: resolved.regNo || old.transportation?.vehicleNo || ''
      },
      vehicle: {
        ...(old.vehicle || {}),
        id: resolved.id || '',
        registration: resolved.regNo || '',
        makeModel: resolved.makeModel || '',
        odometer: resolved.kilometres || '',
        vin: resolved.vin || ''
      }
    }));
  };

  const selectCustomer = async (customerId) => {
    setSelectedCustomerId(customerId);
    setSelectedVehicleId('');
    setCustomerVehicles([]);

    if (!customerId) {
      // Manual customer mode: keep the form editable and clear customer-linked values.
      setForm((old) => ({
        ...old,
        customer: {
          name: '',
          phone: '',
          email: '',
          address: '',
          gstin: '',
          state: '',
          stateCode: '',
          placeOfSupply: ''
        },
        transportation: {
          ...(old.transportation || {}),
          vehicleNo: ''
        },
        vehicle: {
          registration: '',
          makeModel: '',
          odometer: '',
          vin: ''
        }
      }));
      return;
    }

    const customer = customers.find((row) => String(row.id) === String(customerId));
    if (!customer) return;

    const displayName = customer.companyName || customer.name || '';
    const fullAddress = formatCustomerAddress(customer);

    setForm((old) => ({
      ...old,
      customer: {
        ...(old.customer || {}),
        id: customer.id,
        name: displayName,
        phone: customer.phone || '',
        email: customer.email || '',
        address: fullAddress,
        gstin: customer.gstNo || customer.gstin || '',
        state: customer.state || '',
        stateCode: customer.stateCode || '',
        placeOfSupply: customer.stateCode
          ? `${customer.stateCode}-${customer.state || ''}`
          : (customer.state || '')
      }
    }));

    setReferenceLoading(true);
    try {
      const vehicles = await customerService.getCustomerVehicles(customer.id);
      const rows = Array.isArray(vehicles) ? vehicles : [];
      setCustomerVehicles(rows);

      if (rows.length) {
        applyVehicle(rows[0], rows);
      } else {
        setForm((old) => ({
          ...old,
          transportation: { ...(old.transportation || {}), vehicleNo: '' },
          vehicle: { registration: '', makeModel: '', odometer: '', vin: '' }
        }));
      }
    } catch (e) {
      setError(e?.message || 'Unable to load customer vehicles.');
    } finally {
      setReferenceLoading(false);
    }
  };

  const selectVehicle = (vehicleId) => {
    if (!vehicleId) {
      setSelectedVehicleId('');
      setForm((old) => ({
        ...old,
        transportation: { ...(old.transportation || {}), vehicleNo: '' },
        vehicle: { registration: '', makeModel: '', odometer: '', vin: '' }
      }));
      return;
    }

    const vehicle = customerVehicles.find((row) => String(row.id) === String(vehicleId));
    applyVehicle(vehicle);
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
        hsnCode: stock?.hsnCode || stock?.hsn || '',
        unit: stock?.unit || 'PCS',
        purchasePrice: stock?.cost ? String(stock.cost) : '',
        rate: stock?.price ? String(stock.price) : '',
        taxRate: stock?.taxRate ?? 18
      } : row)
    }));
  };

  const validate = () => {
    if (!form.customer?.name?.trim()) return 'Customer / company name is required.';
    if (!form.items?.length) return 'Add at least one item.';
    if (form.items.some((row) => !row.description?.trim() && row.type !== 'Stock Part')) return 'Enter an item / service description.';
    if (form.invoiceType === 'gst' && form.items.some((row) => !String(row.hsnCode || '').trim())) return 'HSN / SAC is required for every GST invoice item.';
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

  const convertEstimate = async () => {
    if (form.kind !== 'estimate' || !id) return;

    setSaving(true);
    setError('');

    try {
      const invoice = await billingService.convertEstimateToInvoice(id);
      navigate(`/invoices/${invoice.id}/edit`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Unable to convert estimate to invoice.');
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
        <button className={activeTab === 'invoice' ? 'active' : ''} onClick={() => navigate('/invoices?kind=invoice')}><ReceiptText size={16}/>Invoices</button>
        <button className={activeTab === 'estimate' ? 'active' : ''} onClick={() => navigate('/invoices?kind=estimate')}><FileText size={16}/>Estimates</button>
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
        <div>
          <button className="bill-btn secondary" onClick={() => navigate(form.kind === 'estimate' ? '/invoices?kind=estimate' : '/invoices?kind=invoice')}>
            <ArrowLeft size={16}/>Back
          </button>
          <span className="billing-kicker">{form.kind === 'estimate' ? 'ESTIMATE / QUOTATION' : 'INVOICE'}</span>
          <h1>{form.number || id}</h1>
          <p>ID: {id} · Status: {form.status}</p>
        </div>

        <div className="billing-head-actions">
          {form.status !== 'Converted' && (
            <button className="bill-btn secondary" onClick={() => navigate(`/invoices/${id}/edit`)}>
              <Edit3 size={16}/>Edit
            </button>
          )}

          {form.kind === 'estimate' && form.status !== 'Converted' && form.status !== 'Cancelled' && (
            <button className="bill-btn" disabled={saving} onClick={convertEstimate}>
              <ReceiptText size={16}/>{saving ? 'Converting…' : 'Convert to Invoice'}
            </button>
          )}

          {form.kind === 'estimate' && form.status === 'Converted' && form.convertedToInvoiceId && (
            <button className="bill-btn" onClick={() => navigate(`/invoices/${form.convertedToInvoiceId}`)}>
              <ReceiptText size={16}/>Open {form.convertedToInvoiceNo || 'Invoice'}
            </button>
          )}

          {form.kind === 'invoice' && (
            <button className="bill-btn secondary" onClick={() => navigate(`/invoices/e-way-bills/new?invoiceId=${encodeURIComponent(id)}`)}>
              <Truck size={16}/>E-Way Bill
            </button>
          )}

          <button className="bill-btn secondary" onClick={() => window.print()}>
            <Printer size={16}/>Print / PDF
          </button>

          {form.status !== 'Cancelled' && form.status !== 'Converted' && (
            <button className="bill-btn secondary" disabled={saving} onClick={cancelDocument}>
              <XCircle size={16}/>Cancel
            </button>
          )}

          <button className="bill-btn danger" onClick={() => navigate(`/invoices/${id}/delete`)}>
            <Trash2 size={16}/>Delete
          </button>
        </div>
      </div>

      {form.kind === 'estimate' && form.status === 'Converted' && form.convertedToInvoiceId && (
        <div className="estimate-converted-banner no-print">
          <div>
            <strong>Converted to Invoice</strong>
            <span>This quotation is now linked to {form.convertedToInvoiceNo || form.convertedToInvoiceId}. No re-entry is required.</span>
          </div>
          <button className="bill-btn" onClick={() => navigate(`/invoices/${form.convertedToInvoiceId}`)}>
            Open Invoice
          </button>
        </div>
      )}

      {error && <div className="billing-error no-print">{error}</div>}
      {loading ? <div className="billing-empty">Loading…</div> : <InvoicePrint doc={form} totals={totals}/>}
    </div>
  );

  return (
    <div className="billing-page">
      <div className="billing-editor-head no-print">
        <div>
          <button className="bill-btn secondary" onClick={() => navigate(mode === 'edit' ? `/invoices/${id}` : '/invoices')}>
            <ArrowLeft size={16}/>Back
          </button>
          <span className="billing-kicker">{form.kind === 'estimate' ? 'ESTIMATE' : 'TAX / SALES INVOICE'}</span>
          <h1>{mode === 'edit' ? `Edit ${form.number || id}` : form.kind === 'estimate' ? 'New Estimate' : 'New Invoice'}</h1>
          <p>{mode === 'edit' ? `Editing ID: ${id}` : 'Create a clean GST-ready invoice with transport and item tax details.'}</p>
        </div>
        <div className="billing-head-actions">
          <button className="bill-btn secondary" disabled={saving} onClick={save}>Save Draft</button>
          <button className="bill-btn" disabled={saving} onClick={finalize}>
            <CheckCircle2 size={16}/>{form.kind === 'estimate' ? 'Issue Estimate' : 'Finalize Invoice'}
          </button>
        </div>
      </div>

      {error && <div className="billing-error no-print">{error}</div>}

      {loading && mode === 'edit' ? <div className="billing-empty">Loading…</div> : <>
        <div className="invoice-source-grid no-print">
          <section className="billing-card invoice-customer-card">
            <span className="billing-kicker">BILL TO</span>
            <h3>Customer Details</h3>

            <label>Phone / Existing Customer
              <select
                value={selectedCustomerId}
                onChange={(e) => selectCustomer(e.target.value)}
                disabled={referenceLoading}
              >
                <option value="">New / Manual Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.phone || 'No phone'} · {customer.companyName || customer.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedCustomerId && (
              <div className="invoice-autofill-note">
                Existing customer selected — customer and vehicle details are filled automatically.
              </div>
            )}

            <label>Name
              <input value={form.customer?.name || ''} onChange={(e) => update('customer.name', e.target.value)} placeholder="Customer / Company name"/>
            </label>

            <label>Phone
              <input inputMode="tel" value={form.customer?.phone || ''} onChange={(e) => update('customer.phone', e.target.value)} placeholder="+91"/>
            </label>

            <label>Email
              <input type="email" value={form.customer?.email || ''} onChange={(e) => update('customer.email', e.target.value)} placeholder="customer@example.com"/>
            </label>

            <label>Address
              <textarea value={form.customer?.address || ''} onChange={(e) => update('customer.address', e.target.value)} placeholder="Billing address"/>
            </label>

            <label>GSTIN
              <input value={form.customer?.gstin || ''} onChange={(e) => update('customer.gstin', e.target.value.toUpperCase())} placeholder="GSTIN / URP"/>
            </label>

            <div className="invoice-two-col">
              <label>State
                <input value={form.customer?.state || ''} onChange={(e) => update('customer.state', e.target.value)} placeholder="Kerala"/>
              </label>
              <label>Place of Supply
                <input value={form.customer?.placeOfSupply || ''} onChange={(e) => update('customer.placeOfSupply', e.target.value)} placeholder="32-Kerala"/>
              </label>
            </div>
          </section>

          <section className="billing-card invoice-transport-card">
            <span className="billing-kicker">TRANSPORTATION DETAILS</span>
            <h3>Vehicle / Transport</h3>

            <label>Existing Customer Vehicle
              <select
                value={selectedVehicleId}
                onChange={(e) => selectVehicle(e.target.value)}
                disabled={!selectedCustomerId || referenceLoading}
              >
                <option value="">
                  {referenceLoading
                    ? 'Loading vehicles…'
                    : selectedCustomerId
                      ? customerVehicles.length
                        ? 'Select vehicle'
                        : 'No existing vehicle — enter manually'
                      : 'Select customer first'}
                </option>
                {customerVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.regNo || 'No registration'} · {vehicle.makeModel || 'Vehicle'}
                  </option>
                ))}
              </select>
            </label>

            <label>Transport Vehicle Number
              <input
                value={form.transportation?.vehicleNo || ''}
                onChange={(e) => update('transportation.vehicleNo', e.target.value.toUpperCase())}
                placeholder="KL08AB1234"
              />
            </label>

            <label>Transporter Name
              <input value={form.transportation?.transporterName || ''} onChange={(e) => update('transportation.transporterName', e.target.value)} placeholder="Optional"/>
            </label>

            <label>Customer Vehicle Registration
              <input value={form.vehicle?.registration || ''} onChange={(e) => update('vehicle.registration', e.target.value.toUpperCase())} placeholder="KL-08-BQ-4581"/>
            </label>

            <label>Vehicle Make / Model
              <input value={form.vehicle?.makeModel || ''} onChange={(e) => update('vehicle.makeModel', e.target.value)} placeholder="Toyota Innova"/>
            </label>

            <div className="invoice-two-col">
              <label>VIN / Chassis
                <input value={form.vehicle?.vin || ''} onChange={(e) => update('vehicle.vin', e.target.value.toUpperCase())} placeholder="VIN"/>
              </label>
              <label>Odometer
                <input value={form.vehicle?.odometer || ''} onChange={(e) => update('vehicle.odometer', e.target.value)} placeholder="52,400 km"/>
              </label>
            </div>
          </section>

          <section className="billing-card">
            <span className="billing-kicker">INVOICE DETAILS</span>
            <h3>Document Details</h3>
            <label>Invoice Type
              <select value={form.invoiceType} onChange={(e) => update('invoiceType', e.target.value)}>
                <option value="regular">Regular Bill</option>
                <option value="gst">GST Tax Invoice</option>
              </select>
            </label>
            <label>Date
              <input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)}/>
            </label>
            <label>Place of Supply
              <input value={form.customer?.placeOfSupply || ''} onChange={(e) => update('customer.placeOfSupply', e.target.value)} placeholder="32-Kerala"/>
            </label>
            <div className="invoice-two-col">
              <label>Job Card No.
                <input value={form.jobCardNo || ''} onChange={(e) => update('jobCardNo', e.target.value)} placeholder="JOB-2048"/>
              </label>
              <label>Staff / Advisor
                <input value={form.staff || ''} onChange={(e) => update('staff', e.target.value)}/>
              </label>
            </div>
          </section>
        </div>

        <section className="billing-card no-print billing-items-card invoice-sale-items">
          <div className="billing-section-head">
            <div><span className="billing-kicker">ITEMS</span><h3>Goods / Services</h3></div>
            <button className="bill-btn" onClick={() => update('items', [...form.items, emptyItem()])}><Plus size={16}/>Add Item</button>
          </div>

          <div className="invoice-sale-head">
            <span>Item Name / Source</span>
            <span>HSN / SAC</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Price / Unit</span>
            <span>GST %</span>
            <span>Amount</span>
            <span></span>
          </div>

          <div className="invoice-sale-editor">
            {form.items.map((row) => {
              const base = Math.max(0, n(row.qty) * n(row.rate) - n(row.discount));
              const rate = form.invoiceType === 'gst' && form.taxMode !== 'none' ? n(row.taxRate) : 0;
              const lineAmount = base + (base * rate / 100);

              return <div className="invoice-sale-row" key={row.id}>
                <div className="invoice-item-main-cell">
                  <select aria-label="Item source" value={row.type} onChange={(e) => updateItem(row.id, 'type', e.target.value)}>
                    {itemTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  {row.type === 'Stock Part'
                    ? <select aria-label="Stock item" value={row.inventoryId || ''} onChange={(e) => chooseInventory(row.id, e.target.value)}>
                        <option value="">Select stock item</option>
                        {inventory.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku} · Stock {item.onHand}</option>)}
                      </select>
                    : <input aria-label="Item name" value={row.description || ''} onChange={(e) => updateItem(row.id, 'description', e.target.value)} placeholder="Item / service name"/>
                  }
                </div>
                <input aria-label="HSN or SAC" value={row.hsnCode || ''} onChange={(e) => updateItem(row.id, 'hsnCode', e.target.value.replace(/[^0-9A-Za-z]/g, ''))} placeholder="HSN / SAC"/>
                <input className="plain-number-input" aria-label="Quantity" inputMode="decimal" value={inputNumber(row.qty) || '1'} onChange={(e) => updateItem(row.id, 'qty', parseDecimal(e.target.value))}/>
                <select aria-label="Unit" value={row.unit || 'PCS'} onChange={(e) => updateItem(row.id, 'unit', e.target.value)}>
                  {['PCS','NOS','SET','KG','LTR','MTR','BOX','PAIR','HRS','JOB'].map((unit) => <option key={unit}>{unit}</option>)}
                </select>
                <input className="plain-number-input" aria-label="Price per unit" inputMode="decimal" value={inputNumber(row.rate)} onChange={(e) => updateItem(row.id, 'rate', parseDecimal(e.target.value))} placeholder="₹ 0.00"/>
                <input className="plain-number-input" aria-label="GST rate" inputMode="decimal" value={inputNumber(row.taxRate)} onChange={(e) => updateItem(row.id, 'taxRate', parseDecimal(e.target.value))} placeholder="18"/>
                <strong className="billing-line-total">{money.format(lineAmount)}</strong>
                <button aria-label="Remove item" className="bill-icon-btn" onClick={() => update('items', form.items.filter((item) => item.id !== row.id))}><Trash2 size={16}/></button>
              </div>;
            })}
          </div>
        </section>

        <div className="invoice-bottom-grid no-print">
          <section className="billing-card">
            <span className="billing-kicker">PAYMENT & TERMS</span>
            <h3>Invoice Terms</h3>
            <div className="invoice-two-col">
              {form.invoiceType === 'gst' && <label>Tax Type
                <select value={form.taxMode} onChange={(e) => update('taxMode', e.target.value)}>
                  <option value="igst">IGST</option>
                  <option value="cgst_sgst">CGST + SGST</option>
                  <option value="none">No Tax</option>
                </select>
              </label>}
              <label>Payment Type
                <select value={form.paymentType || 'Credit'} onChange={(e) => update('paymentType', e.target.value)}>
                  <option>Credit</option>
                  <option>Cash</option>
                  <option>Advance</option>
                </select>
              </label>
              <label>Payment Mode
                <select value={form.paymentMode || 'Cash'} onChange={(e) => update('paymentMode', e.target.value)}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </label>
              <label>Received ₹
                <input className="plain-number-input" inputMode="decimal" value={inputNumber(form.paid)} onChange={(e) => update('paid', parseDecimal(e.target.value))} placeholder="0.00"/>
              </label>
              <label>Adjustment ₹
                <input className="plain-number-input" inputMode="decimal" value={form.adjustment ?? ''} onChange={(e) => update('adjustment', e.target.value === '' ? '' : parseDecimal(e.target.value))} placeholder="Auto"/>
              </label>
              <label>Discount ₹
                <input className="plain-number-input" inputMode="decimal" value={inputNumber(form.discount)} onChange={(e) => update('discount', parseDecimal(e.target.value))} placeholder="0.00"/>
              </label>
            </div>
            <label>Terms and Conditions
              <textarea value={form.termsAndConditions || ''} onChange={(e) => update('termsAndConditions', e.target.value)} placeholder="Invoice terms and conditions"/>
            </label>
            <label>Notes
              <textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Optional notes"/>
            </label>
          </section>

          <section className="billing-card invoice-live-summary">
            <span className="billing-kicker">AMOUNTS</span>
            <h3>Invoice Summary</h3>
            <div><span>Sub Total</span><strong>{money.format(totals.itemSubtotal)}</strong></div>
            {totals.documentDiscount > 0 && <div><span>Discount</span><strong>- {money.format(totals.documentDiscount)}</strong></div>}
            <div><span>Taxable Amount</span><strong>{money.format(totals.taxable)}</strong></div>
            <div><span>GST</span><strong>{money.format(totals.cgst + totals.sgst + totals.igst)}</strong></div>
            <div><span>Adjustment</span><strong>{money.format(totals.adjustment)}</strong></div>
            <div className="grand"><span>Total</span><strong>{money.format(totals.total)}</strong></div>
            <div><span>Received</span><strong>{money.format(totals.paid)}</strong></div>
            <div><span>Balance</span><strong>{money.format(totals.balance)}</strong></div>
          </section>
        </div>

        <InvoicePrint doc={form} totals={totals}/>
      </>}
    </div>
  );
}

function amountToIndianWords(value) {
  const number = Math.round(Number(value || 0));
  if (!number) return 'Zero Rupees only';

  const ones = ['', 'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two = (n) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
  const three = (n) => `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' : ''}` : ''}${two(n % 100)}`;

  let n = number;
  const parts = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;

  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  if (thousand) parts.push(`${three(thousand)} Thousand`);
  if (n) parts.push(three(n));

  return `${parts.join(' ')} Rupees only`;
}

function InvoicePrint({ doc, totals }) {
  const rows = doc.items || [];
  const taxGroups = totals.taxGroups || [];

  return <section className="invoice-print-sheet invoice-sale-print">
    <div className="invoice-sale-company">
      <div className="invoice-sale-logo">CUBIXGEAR</div>
      <div className="invoice-sale-company-copy">
        <strong>CubixGear Workshop</strong>
        <span>Workshop Management & Automotive Services</span>
        <span>Company address · Phone · Email</span>
        <span>GSTIN: Configure in Settings</span>
      </div>
    </div>

    <div className="invoice-sale-title">{doc.kind === 'estimate' ? 'Estimate' : doc.invoiceType === 'gst' ? 'Tax Invoice' : 'Invoice'}</div>

    <div className="invoice-sale-info">
      <div>
        <strong>Bill To</strong>
        <b>{doc.customer?.name || '—'}</b>
        <span>{doc.customer?.address || '—'}</span>
        {doc.customer?.gstin && <span>GSTIN Number: {doc.customer.gstin}</span>}
        {doc.customer?.state && <span>State: {doc.customer.state}</span>}
      </div>
      <div>
        <strong>Transportation Details</strong>
        <span>Vehicle Number: {doc.transportation?.vehicleNo || doc.vehicle?.registration || '—'}</span>
        {doc.transportation?.transporterName && <span>Transporter: {doc.transportation.transporterName}</span>}
      </div>
      <div className="invoice-sale-info-right">
        <strong>Invoice Details</strong>
        <span>Invoice No.: {doc.number || 'DRAFT'}</span>
        <span>Date: {doc.date || '—'}</span>
        <span>Place of Supply: {doc.customer?.placeOfSupply || doc.customer?.state || '—'}</span>
      </div>
    </div>

    <div className="invoice-sale-table">
      <div className="invoice-sale-table-head">
        <span>#</span><span>Item Name</span><span>HSN / SAC</span><span>Quantity</span><span>Unit</span><span>Price / Unit</span><span>GST</span><span>Amount</span>
      </div>
      {rows.map((row, index) => {
        const taxable = Math.max(0, n(row.qty) * n(row.rate) - n(row.discount));
        const rate = doc.invoiceType === 'gst' && doc.taxMode !== 'none'
          ? (row.taxRate === '' || row.taxRate == null
              ? (doc.taxMode === 'igst' ? n(doc.igstRate) : n(doc.cgstRate) + n(doc.sgstRate))
              : n(row.taxRate))
          : 0;
        const tax = taxable * rate / 100;
        return <div className="invoice-sale-table-row" key={row.id || index}>
          <span>{index + 1}</span>
          <strong>{row.description || row.code || 'Item'}</strong>
          <span>{row.hsnCode || '—'}</span>
          <span>{row.qty || 0}</span>
          <span>{row.unit || 'PCS'}</span>
          <span>{money.format(n(row.rate))}</span>
          <span>{rate ? <>{money.format(tax)}<small>({rate}%)</small></> : '—'}</span>
          <strong>{money.format(taxable + tax)}</strong>
        </div>;
      })}
      <div className="invoice-sale-table-total">
        <span></span><strong>Total</strong><span></span>
        <strong>{rows.reduce((sum,row)=>sum+n(row.qty),0)}</strong>
        <span></span><span></span>
        <strong>{money.format(totals.cgst + totals.sgst + totals.igst)}</strong>
        <strong>{money.format(totals.total - totals.adjustment)}</strong>
      </div>
    </div>

    <div className="invoice-sale-lower">
      <div className="invoice-sale-left">
        {taxGroups.length > 0 && <div className="invoice-sale-tax-table">
          <div className="head"><span>Tax type</span><span>Taxable amount</span><span>Rate</span><span>Tax amount</span></div>
          {taxGroups.map((group, index) => <div className="row" key={index}>
            <span>{group.type}</span>
            <span>{money.format(group.taxable)}</span>
            <span>{group.rate}%</span>
            <span>{money.format(group.tax)}</span>
          </div>)}
        </div>}

        <div className="invoice-sale-blue-box">
          <strong>Invoice Amount In Words</strong>
          <span>{amountToIndianWords(totals.total)}</span>
        </div>

        <div className="invoice-sale-blue-box compact">
          <strong>Payment Type</strong>
          <span>{doc.paymentType || 'Credit'}</span>
        </div>

        <div className="invoice-sale-blue-box">
          <strong>Terms and conditions</strong>
          <span>{doc.termsAndConditions || 'Thank you for choosing CubixGear.'}</span>
        </div>
      </div>

      <div className="invoice-sale-amounts">
        <div className="title">Amounts</div>
        <div><span>Sub Total</span><strong>{money.format(totals.itemSubtotal + totals.cgst + totals.sgst + totals.igst)}</strong></div>
        <div><span>Adjustment</span><strong>{money.format(totals.adjustment)}</strong></div>
        <div className="grand"><span>Total</span><strong>{money.format(totals.total)}</strong></div>
        <div><span>Received</span><strong>{money.format(totals.paid)}</strong></div>
        <div><span>Balance</span><strong>{money.format(totals.balance)}</strong></div>
      </div>
    </div>

    <div className="invoice-sale-sign">
      <span>For: CubixGear Workshop</span>
      <strong>Authorized Signatory</strong>
    </div>
  </section>;
}

