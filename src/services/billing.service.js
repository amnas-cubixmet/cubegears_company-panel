import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';

const DOCS_KEY = 'cubixgear:billing-documents';
const INVENTORY_KEY = 'cubixgear:inventory';
const STOCK_LEDGER_KEY = 'cubixgear:stock-ledger';
const JOB_PREFILL_KEY = 'cubixgear:invoice-job-prefill';

const seedDocuments = [
  {
    id: 'INV-2026-1001', number: 'INV-2026-1001', kind: 'invoice', invoiceType: 'regular', status: 'Finalized', date: '2026-09-12',
    customer: { name: 'Rahul P', phone: '+91 98765 43210', address: '', gstin: '' },
    vehicle: { registration: 'KL-08-BQ-4581', makeModel: 'Toyota Innova Crysta', odometer: '52,400 km', vin: '' },
    jobCardNo: 'JOB-2048', staff: 'Rahul', notes: 'Periodic maintenance completed.',
    items: [
      { id: 'L1', type: 'Labour', description: 'Periodic service labour', code: '', hsnCode: '998729', qty: 1, unit: 'NOS', purchasePrice: 0, rate: 1200, taxRate: 18, discount: 0, inventoryId: '' },
      { id: 'P1', type: 'Stock Part', description: 'Oil Filter', code: 'FLT-OIL-02', hsnCode: '84212300', qty: 1, unit: 'PCS', purchasePrice: 280, rate: 450, taxRate: 18, discount: 0, inventoryId: 'ITM-1002' }
    ],
    discount: 0, taxMode: 'none', cgstRate: 0, sgstRate: 0, igstRate: 0, paid: 1650, paymentMode: 'UPI', paymentTerms: 'C.O.D', finalizedAt: '2026-09-12T10:00:00.000Z'
  }
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const read = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return clone(fallback);
};
const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  return clone(value);
};
const id = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
const today = () => new Date().toISOString().slice(0, 10);

const getJobInvoicePrefill = () => {
  try {
    return JSON.parse(localStorage.getItem(JOB_PREFILL_KEY) || 'null');
  } catch {
    return null;
  }
};

export const blankBillingDocument = (kind = 'invoice') => {
  const prefill = kind === 'invoice' ? getJobInvoicePrefill() : null;
  return {
    kind,
    invoiceType: 'regular',
    status: 'Draft',
    date: today(),
    customer: { name: '', phone: '', address: '', gstin: '', state: '', stateCode: '', placeOfSupply: '', ...(prefill?.customer || {}) },
    vehicle: { registration: '', makeModel: '', odometer: '', vin: '', ...(prefill?.vehicle || {}) },
    jobCardNo: prefill?.jobNumber || prefill?.jobId || '',
    sourceJobId: prefill?.jobId || '',
    staff: '',
    transportation: { vehicleNo: '', transporterName: '', ...(prefill?.transportation || {}) },
    notes: prefill?.jobId ? `Created from Job Card ${prefill.jobNumber || prefill.jobId}` : '',
    items: Array.isArray(prefill?.items)
      ? clone(prefill.items).map((item) => ({ unit: 'PCS', hsnCode: '', taxRate: 18, ...item }))
      : [],
    discount: 0,
    adjustment: '',
    taxMode: 'none', cgstRate: 9, sgstRate: 9, igstRate: 18,
    paid: '', paymentMode: 'Cash', paymentType: 'Credit', paymentTerms: 'C.O.D',
    termsAndConditions: 'Thank you for choosing CubixGear.'
  };
};

export const calculateDocumentTotals = (doc) => {
  const rows = (doc.items || []).map((item) => {
    const gross = Number(item.qty || 0) * Number(item.rate || 0);
    return {
      item,
      taxable: Math.max(0, gross - Number(item.discount || 0))
    };
  });

  const itemSubtotal = rows.reduce((sum, row) => sum + row.taxable, 0);
  const documentDiscount = Number(doc.discount || 0);
  const taxable = Math.max(0, itemSubtotal - documentDiscount);
  const ratio = itemSubtotal > 0 ? taxable / itemSubtotal : 0;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const taxGroups = new Map();

  if (doc.invoiceType === 'gst' && doc.taxMode !== 'none') {
    rows.forEach(({ item, taxable: lineTaxable }) => {
      const adjustedTaxable = lineTaxable * ratio;
      const fallbackRate = doc.taxMode === 'igst'
        ? Number(doc.igstRate || 0)
        : Number(doc.cgstRate || 0) + Number(doc.sgstRate || 0);
      const rate = item.taxRate === '' || item.taxRate == null
        ? fallbackRate
        : Number(item.taxRate || 0);
      const tax = adjustedTaxable * rate / 100;

      if (doc.taxMode === 'igst') {
        igst += tax;
      } else {
        cgst += tax / 2;
        sgst += tax / 2;
      }

      const key = `${doc.taxMode}:${rate}`;
      const current = taxGroups.get(key) || {
        type: doc.taxMode === 'igst' ? 'IGST' : 'CGST + SGST',
        rate,
        taxable: 0,
        tax: 0
      };
      current.taxable += adjustedTaxable;
      current.tax += tax;
      taxGroups.set(key, current);
    });
  }

  const beforeAdjustment = taxable + cgst + sgst + igst;
  const hasManualAdjustment = doc.adjustment !== '' && doc.adjustment != null;
  const adjustment = hasManualAdjustment
    ? Number(doc.adjustment || 0)
    : Number((Math.round(beforeAdjustment) - beforeAdjustment).toFixed(2));
  const total = Number((beforeAdjustment + adjustment).toFixed(2));
  const paid = Number(doc.paid || 0);

  return {
    itemSubtotal,
    documentDiscount,
    taxable,
    cgst,
    sgst,
    igst,
    taxGroups: Array.from(taxGroups.values()),
    adjustment,
    rounding: adjustment,
    total,
    paid,
    balance: Math.max(0, Number((total - paid).toFixed(2)))
  };
};

const nextNumber = (kind, docs) => {
  const prefix = kind === 'estimate' ? 'EST' : 'INV';
  const year = new Date().getFullYear();
  const count = docs.filter((d) => d.kind === kind).length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
};

const applyStockMovement = (doc, direction) => {
  const inventory = read(INVENTORY_KEY, []);
  const ledger = read(STOCK_LEDGER_KEY, []);
  const movements = [];
  for (const item of doc.items || []) {
    if (item.type !== 'Stock Part' || !item.inventoryId) continue;
    const qty = Number(item.qty || 0);
    const index = inventory.findIndex((row) => String(row.id) === String(item.inventoryId));
    if (index < 0) continue;
    const current = Number(inventory[index].onHand || 0);
    const next = direction === 'issue' ? current - qty : current + qty;
    if (direction === 'issue' && next < 0) throw new Error(`${inventory[index].name} has only ${current} in stock.`);
    inventory[index] = { ...inventory[index], onHand: next };
    movements.push({ id: id('LED'), date: new Date().toISOString(), documentId: doc.id, documentNo: doc.number, inventoryId: item.inventoryId, itemName: inventory[index].name, qty: direction === 'issue' ? -qty : qty, action: direction === 'issue' ? 'Invoice Finalized' : 'Invoice Cancelled' });
  }
  write(INVENTORY_KEY, inventory);
  write(STOCK_LEDGER_KEY, [...movements, ...ledger]);
};

export const billingService = {
  async list() {
    if (!USE_MOCK_API) return apiClient.get('/billing/documents');
    return read(DOCS_KEY, seedDocuments);
  },
  async get(documentId) {
    if (!USE_MOCK_API) return apiClient.get(`/billing/documents/${documentId}`);
    return read(DOCS_KEY, seedDocuments).find((row) => row.id === documentId) || null;
  },
  async saveDraft(payload) {
    if (!USE_MOCK_API) return payload.id ? apiClient.put(`/billing/documents/${payload.id}`, payload) : apiClient.post('/billing/documents', payload);
    const docs = read(DOCS_KEY, seedDocuments);
    if (payload.id) {
      const next = docs.map((row) => row.id === payload.id ? { ...row, ...payload, updatedAt: new Date().toISOString() } : row);
      write(DOCS_KEY, next);
      return clone(next.find((row) => row.id === payload.id));
    }
    const document = { ...blankBillingDocument(payload.kind), ...payload, id: id(payload.kind === 'estimate' ? 'EST' : 'INV'), number: nextNumber(payload.kind || 'invoice', docs), status: 'Draft', createdAt: new Date().toISOString() };
    write(DOCS_KEY, [document, ...docs]);
    try { localStorage.removeItem(JOB_PREFILL_KEY); } catch { /* noop */ }
    return clone(document);
  },
  async finalize(documentId) {
    if (!USE_MOCK_API) return apiClient.post(`/billing/documents/${documentId}/finalize`);
    const docs = read(DOCS_KEY, seedDocuments);
    const doc = docs.find((row) => row.id === documentId);
    if (!doc) throw new Error('Document not found.');
    if (doc.kind === 'invoice' && doc.status !== 'Finalized' && doc.status !== 'Paid') applyStockMovement(doc, 'issue');
    const status = doc.kind === 'estimate' ? 'Issued' : 'Finalized';
    const nextDoc = { ...doc, status, finalizedAt: new Date().toISOString() };
    write(DOCS_KEY, docs.map((row) => row.id === documentId ? nextDoc : row));
    return clone(nextDoc);
  },
  async cancel(documentId) {
    if (!USE_MOCK_API) return apiClient.post(`/billing/documents/${documentId}/cancel`);
    const docs = read(DOCS_KEY, seedDocuments);
    const doc = docs.find((row) => row.id === documentId);
    if (!doc) throw new Error('Document not found.');
    if (doc.kind === 'invoice' && (doc.status === 'Finalized' || doc.status === 'Paid')) applyStockMovement(doc, 'restore');
    const nextDoc = { ...doc, status: 'Cancelled', cancelledAt: new Date().toISOString() };
    write(DOCS_KEY, docs.map((row) => row.id === documentId ? nextDoc : row));
    return clone(nextDoc);
  },
  async remove(documentId) {
    if (!USE_MOCK_API) return apiClient.delete(`/billing/documents/${documentId}`);
    const docs = read(DOCS_KEY, seedDocuments);
    const doc = docs.find((row) => row.id === documentId);
    if (!doc) throw new Error('Document not found.');
    if (!['Draft', 'Cancelled'].includes(doc.status)) throw new Error('Finalized/issued documents cannot be deleted. Cancel the document first.');
    write(DOCS_KEY, docs.filter((row) => row.id !== documentId));
    return true;
  },
  async convertEstimateToInvoice(estimateId) {
    if (!USE_MOCK_API) {
      return apiClient.post(`/billing/documents/${estimateId}/convert-to-invoice`);
    }

    const docs = read(DOCS_KEY, seedDocuments);
    const estimate = docs.find((row) => row.id === estimateId);

    if (!estimate) throw new Error('Estimate / quotation not found.');
    if (estimate.kind !== 'estimate') throw new Error('Only estimates can be converted to invoices.');

    // Prevent duplicate sales from the same quotation.
    if (estimate.convertedToInvoiceId) {
      const existingInvoice = docs.find((row) => row.id === estimate.convertedToInvoiceId);
      if (existingInvoice) return clone(existingInvoice);
    }

    const {
      id: _id,
      number: _number,
      status: _status,
      finalizedAt: _finalizedAt,
      cancelledAt: _cancelledAt,
      convertedAt: _convertedAt,
      convertedToInvoiceId: _convertedToInvoiceId,
      convertedToInvoiceNo: _convertedToInvoiceNo,
      ...copy
    } = estimate;

    const invoiceId = id('INV');
    const invoiceNumber = nextNumber('invoice', docs);
    const now = new Date().toISOString();

    const invoice = {
      ...blankBillingDocument('invoice'),
      ...clone(copy),
      id: invoiceId,
      number: invoiceNumber,
      kind: 'invoice',
      invoiceType: estimate.invoiceType || 'regular',
      status: 'Draft',
      date: today(),
      sourceEstimateId: estimate.id,
      sourceEstimateNo: estimate.number,
      paid: '',
      createdAt: now,
      updatedAt: now
    };

    const convertedEstimate = {
      ...estimate,
      status: 'Converted',
      convertedAt: now,
      convertedToInvoiceId: invoice.id,
      convertedToInvoiceNo: invoice.number,
      updatedAt: now
    };

    const nextDocs = docs.map((row) => row.id === estimateId ? convertedEstimate : row);
    write(DOCS_KEY, [invoice, ...nextDocs]);

    return clone(invoice);
  },
  async inventory() {
    if (!USE_MOCK_API) return apiClient.get('/inventory');
    return read(INVENTORY_KEY, []);
  }
};
