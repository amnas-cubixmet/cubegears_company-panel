import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';

const STORAGE_KEY = 'cubixgear:e-way-bills';

// Preserve existing saved local drafts, but never insert fake business records.
const seed = [];

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return [...seed];
};

const write = (rows) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  return rows;
};

const id = () => `EWB-${Date.now()}`;

export const blankEWayBill = () => ({
  id: '',
  status: 'Draft',
  supplyType: 'Outward',
  subSupplyType: 'Supply',
  transactionType: 'Regular',
  documentType: 'Tax Invoice',
  documentNo: '',
  documentDate: new Date().toISOString().slice(0, 10),
  invoiceId: '',
  jobCardNo: '',
  from: {
    gstin: '',
    tradeName: '',
    address: '',
    place: '',
    pincode: '',
    stateCode: ''
  },
  to: {
    gstin: '',
    tradeName: '',
    address: '',
    place: '',
    pincode: '',
    stateCode: ''
  },
  items: [
    {
      id: `EWI-${Date.now()}`,
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
    }
  ],
  transport: {
    transporterId: '',
    transporterName: '',
    mode: 'Road',
    distanceKm: '',
    vehicleNo: '',
    vehicleType: 'Regular',
    transportDocNo: '',
    transportDocDate: ''
  },
  notes: '',
  otherAmount: '',
  cessNonAdvolAmount: '',
  portal: '1',
  enteredFrom: '',
  enteredBy: '',
  cewbNo: '',
  multiVehicleInfo: '',
  ewayBillNo: '',
  generatedAt: '',
  generatedBy: '',
  validUntil: '',
  qrCodeDataUrl: '',
  qrCodeText: '',
  createdAt: '',
  updatedAt: ''
});

export const calculateEWayTotals = (doc) => {
  const taxableValue = (doc.items || []).reduce((sum, item) => sum + Number(item.taxableValue || 0), 0);
  const cgst = (doc.items || []).reduce((sum, item) => sum + Number(item.taxableValue || 0) * Number(item.cgstRate || 0) / 100, 0);
  const sgst = (doc.items || []).reduce((sum, item) => sum + Number(item.taxableValue || 0) * Number(item.sgstRate || 0) / 100, 0);
  const igst = (doc.items || []).reduce((sum, item) => sum + Number(item.taxableValue || 0) * Number(item.igstRate || 0) / 100, 0);
  const cess = (doc.items || []).reduce((sum, item) => sum + Number(item.taxableValue || 0) * Number(item.cessRate || 0) / 100, 0);
  const cessNonAdvol = Number(doc.cessNonAdvolAmount || 0);
  const otherAmount = Number(doc.otherAmount || 0);
  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    cess,
    cessNonAdvol,
    otherAmount,
    totalValue: taxableValue + cgst + sgst + igst + cess + cessNonAdvol + otherAmount
  };
};

const isGstin = (value) => /^[0-9]{2}[A-Z0-9]{13}$/.test(String(value || '').trim().toUpperCase());
const isNonNegativeMoney = (value) => {
  const numeric = Number(value);
  return String(value ?? '').trim() !== '' && Number.isFinite(numeric) &&
    numeric >= 0 && /^\\d+(?:\\.\\d{1,2})?$/.test(String(value));
};
export const isLocalEWayDraft = (doc) => !doc?.ewayBillNo &&
  (doc?.status === 'Draft' || doc?.status === 'Ready for API');

export const validateEWayBill = (doc) => {
  if (!doc?.supplyType || !doc?.subSupplyType || !doc?.transactionType) return 'Choose supply and transaction types.';
  if (!doc?.documentType || !/^[A-Za-z0-9/-]{1,50}$/.test(String(doc.documentNo || ''))) {
    return 'Enter a valid invoice / challan number and type.';
  }
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(doc.documentDate || '') ||
      Number.isNaN(Date.parse(doc.documentDate)) ||
      doc.documentDate > new Date().toISOString().slice(0, 10)) {
    return 'Enter a valid document date (not in the future).';
  }
  for (const [key, label] of [['from', 'Dispatch/from'], ['to', 'Recipient/to']]) {
    const party = doc[key] || {};
    const gstin = String(party.gstin || '').toUpperCase();
    if (!party.tradeName?.trim()) return `${label} trade name is required.`;
    if (gstin !== 'URP' && !isGstin(gstin)) return `${label}: enter GSTIN or URP.`;
    if (!party.address?.trim() || !party.place?.trim()) return `${label}: address and place are required.`;
    if (!/^[1-9]\\d{5}$/.test(String(party.pincode || ''))) return `${label}: enter six-digit PIN code.`;
    if (!/^\\d{2}$/.test(String(party.stateCode || ''))) return `${label}: enter a two-digit state code.`;
    if (gstin !== 'URP' && gstin.slice(0, 2) !== party.stateCode) {
      return `${label}: GSTIN state and state code must match.`;
    }
  }
  if (!Array.isArray(doc.items) || !doc.items.length || doc.items.length > 75) {
    return 'Add 1–75 goods lines (exclude labour/service-only lines).';
  }
  for (const [index, item] of doc.items.entries()) {
    if (!item?.productName?.trim() || !/^\\d{2,8}$/.test(String(item.hsnCode || ''))) {
      return `Goods item ${index + 1} needs a product name and valid numeric HSN.`;
    }
    if (!isNonNegativeMoney(item.qty) || Number(item.qty) <= 0 ||
        !item.unit || !isNonNegativeMoney(item.taxableValue)) {
      return `Goods item ${index + 1}: enter positive quantity, unit and taxable amount.`;
    }
    const taxRates = ['cgstRate', 'sgstRate', 'igstRate', 'cessRate']
      .map(k => Number(item[k] || 0));
    if (taxRates.some(rate => !Number.isFinite(rate) || rate < 0 || rate > 100)) {
      return `Goods item ${index + 1}: GST / cess rates must be 0–100%.`;
    }
    if (taxRates[2] && (taxRates[0] || taxRates[1])) {
      return `Goods item ${index + 1}: IGST cannot be combined with CGST / SGST.`;
    }
    if (taxRates[0] !== taxRates[1]) {
      return `Goods item ${index + 1}: CGST and SGST percentages should match.`;
    }
  }
  const transport = doc.transport || {};
  const distance = Number(transport.distanceKm);
  if (!Number.isInteger(distance) || distance <= 0 || distance > 99999) {
    return 'Enter approximate transport distance in whole kilometres.';
  }
  if (transport.mode === 'Road') {
    if (!transport.vehicleNo?.trim() && !transport.transporterId?.trim()) {
      return 'For road movement, enter goods transport vehicle number or transporter ID.';
    }
  } else if (['Air', 'Rail', 'Ship'].includes(transport.mode)) {
    if (!transport.transportDocNo?.trim()) return 'Transport document number is required for this mode.';
  } else return 'Choose a valid transport mode.';
  if (!isNonNegativeMoney(doc.otherAmount || '0') ||
      !isNonNegativeMoney(doc.cessNonAdvolAmount || '0')) {
    return 'Other amounts must be valid nonnegative rupee values.';
  }
  return '';
};

export const listEWayBills = async () => {
  if (USE_MOCK_API) return read();
  const result = await apiClient.get('/e-way-bills');
  return Array.isArray(result) ? result : result?.results || [];
};

export const getEWayBill = async (billId) => {
  if (USE_MOCK_API) return read().find((row) => row.id === billId) || null;
  return apiClient.get(`/e-way-bills/${billId}`);
};

export const saveEWayBill = async (data) => {
  if (!USE_MOCK_API) {
    if (data.id && data.status !== 'Draft') throw new Error('Reset the local draft before editing.');
    if (data.id) return apiClient.put(`/e-way-bills/${data.id}`, data);
    return apiClient.post('/e-way-bills', data);
  }

  const rows = read();
  const now = new Date().toISOString();
  if (data.id) {
    const index = rows.findIndex((row) => row.id === data.id);
    if (index < 0) throw new Error('E-Way Bill draft not found.');
    if (rows[index].status !== 'Draft' || rows[index].ewayBillNo) throw new Error('Only drafts can be edited.');
    rows[index] = { ...data, status: 'Draft', updatedAt: now };
    write(rows);
    return rows[index];
  }

  const created = { ...data, id: id(), status: 'Draft', createdAt: now, updatedAt: now };
  write([created, ...rows]);
  return created;
};

export const deleteEWayBill = async (billId) => {
  if (!USE_MOCK_API) return apiClient.delete(`/e-way-bills/${billId}`);
  const match = read().find(row => row.id === billId);
  if (!match || match.status !== 'Draft' || match.ewayBillNo) throw new Error('Only local drafts may be deleted.');
  write(read().filter((row) => row.id !== billId));
  return true;
};

export const submitEWayBill = async (billId) => {
  if (!USE_MOCK_API) return apiClient.post(`/e-way-bills/${billId}/generate`);

  const rows = read();
  const index = rows.findIndex((row) => row.id === billId);
  if (index < 0) throw new Error('E-Way Bill draft not found.');

  const validation = validateEWayBill(rows[index]);
  if (validation) throw new Error(validation);

  // Local/mock mode must not fabricate an official NIC/GST E-Way Bill number.
  rows[index] = {
    ...rows[index],
    status: 'Ready for API',
    updatedAt: new Date().toISOString()
  };
  write(rows);
  return rows[index];
};

export const resetEWayBillDraft = async (billId) => {
  if (!USE_MOCK_API) return apiClient.post(`/e-way-bills/${billId}/reset-draft`);
  const rows = read();
  const index = rows.findIndex(row => row.id === billId);
  if (index < 0 || !isLocalEWayDraft(rows[index])) {
    throw new Error('Only local drafts can be reset. Official bills cannot be reset.');
  }
  rows[index] = { ...rows[index], status: 'Draft', updatedAt: new Date().toISOString() };
  write(rows);
  return rows[index];
};

export const eWayBillService = {
  list: listEWayBills,
  get: getEWayBill,
  save: saveEWayBill,
  remove: deleteEWayBill,
  submit: submitEWayBill,
  resetDraft: resetEWayBillDraft,
  validate: validateEWayBill,
  totals: calculateEWayTotals
};

export default eWayBillService;
