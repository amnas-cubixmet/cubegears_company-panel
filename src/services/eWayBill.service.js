import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';

const STORAGE_KEY = 'cubixgear:e-way-bills';

const seed = [
  {
    id: 'EWB-DRAFT-1001',
    status: 'Draft',
    supplyType: 'Outward',
    subSupplyType: 'For Own Use',
    transactionType: 'Regular',
    documentType: 'Delivery Challan',
    documentNo: 'DC-2026-001',
    documentDate: '2026-09-23',
    from: {
      gstin: '',
      tradeName: 'Main Garage Branch',
      address: 'Workshop',
      place: 'Thrissur',
      pincode: '680001',
      stateCode: '32'
    },
    to: {
      gstin: 'URP',
      tradeName: 'Customer / Destination',
      address: '',
      place: '',
      pincode: '',
      stateCode: '32'
    },
    items: [
      { id: 'I-1', productName: 'Workshop Spare Part', description: '', hsnCode: '', qty: 1, unit: 'PCS', taxableValue: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, cessRate: 0 }
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
    createdAt: '2026-09-23T10:00:00.000Z',
    updatedAt: '2026-09-23T10:00:00.000Z'
  }
];

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
    stateCode: '32'
  },
  to: {
    gstin: '',
    tradeName: '',
    address: '',
    place: '',
    pincode: '',
    stateCode: '32'
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

export const validateEWayBill = (doc) => {
  if (!doc.supplyType) return 'Supply type is required.';
  if (!doc.subSupplyType) return 'Sub-supply type is required.';
  if (!doc.transactionType) return 'Transaction type is required.';
  if (!doc.documentType) return 'Document type is required.';
  if (!doc.documentNo?.trim()) return 'Invoice / challan number is required.';
  if (!doc.documentDate) return 'Document date is required.';
  if (!doc.from?.tradeName?.trim()) return 'Dispatch / bill-from name is required.';
  if (!doc.to?.tradeName?.trim()) return 'Bill-to / ship-to name is required.';
  if (!doc.items?.length) return 'Add at least one goods item.';
  if (doc.items.some((item) => !item.productName?.trim())) return 'Product name is required for every item.';
  if (doc.items.some((item) => !item.hsnCode?.trim())) return 'HSN code is required for every goods item.';
  if (doc.items.some((item) => Number(item.qty || 0) <= 0)) return 'Item quantity must be greater than zero.';
  if (doc.transport?.mode === 'Road' && !doc.transport?.vehicleNo?.trim() && !doc.transport?.transporterId?.trim()) {
    return 'Enter vehicle number or transporter ID for road movement.';
  }
  return '';
};

export const listEWayBills = async () => {
  if (USE_MOCK_API) return read();
  return apiClient.get('/e-way-bills');
};

export const getEWayBill = async (billId) => {
  if (USE_MOCK_API) return read().find((row) => row.id === billId) || null;
  return apiClient.get(`/e-way-bills/${billId}`);
};

export const saveEWayBill = async (data) => {
  if (!USE_MOCK_API) {
    if (data.id) return apiClient.put(`/e-way-bills/${data.id}`, data);
    return apiClient.post('/e-way-bills', data);
  }

  const rows = read();
  const now = new Date().toISOString();
  if (data.id) {
    const index = rows.findIndex((row) => row.id === data.id);
    if (index < 0) throw new Error('E-Way Bill draft not found.');
    rows[index] = { ...data, updatedAt: now };
    write(rows);
    return rows[index];
  }

  const created = { ...data, id: id(), status: 'Draft', createdAt: now, updatedAt: now };
  write([created, ...rows]);
  return created;
};

export const deleteEWayBill = async (billId) => {
  if (!USE_MOCK_API) return apiClient.delete(`/e-way-bills/${billId}`);
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

export const eWayBillService = {
  list: listEWayBills,
  get: getEWayBill,
  save: saveEWayBill,
  remove: deleteEWayBill,
  submit: submitEWayBill,
  validate: validateEWayBill,
  totals: calculateEWayTotals
};

export default eWayBillService;
