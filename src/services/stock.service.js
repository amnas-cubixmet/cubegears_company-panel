import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import {
  stockMockItems,
  stockLedgerMock,
  stockSuppliersMock,
  stockPurchasesMock,
  stockTransfersMock,
  stockReservationsMock,
  stockCountsMock,
  getMockStockItems,
  getMockStockItemById,
  addMockStockMovement
} from '../mock/stock.mock';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const getStockDashboard = async () => {
  if (USE_MOCK_API) {
    await delay();
    const items = getMockStockItems();
    const totalItems = items.length;
    const totalValue = items.reduce((acc, item) => acc + (item.onHand * item.costPrice), 0);
    const lowStock = items.filter(i => (i.onHand - i.reserved) <= i.minimumStock && i.onHand > 0).length;
    const outOfStock = items.filter(i => i.onHand === 0).length;
    const reservedStock = items.reduce((acc, i) => acc + i.reserved, 0);

    return Promise.resolve({
      totalItems,
      totalValue,
      lowStock,
      outOfStock,
      reservedStock,
      issuedToday: 8,
      receivedToday: 24,
      pendingPurchases: stockPurchasesMock.filter(p => p.status === 'Ordered').length
    });
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/dashboard`);
};

export const getStockItems = async (params = {}) => {
  if (USE_MOCK_API) {
    await delay();
    let result = getMockStockItems();

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(s =>
        s.partName.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'All') {
      result = result.filter(s => s.category === params.category);
    }

    return Promise.resolve(result);
  }
  return apiClient.get(API_ENDPOINTS.STOCK, { params });
};

export const getStockItemById = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockStockItemById(id));
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/${id}`);
};

export const receiveStock = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    addMockStockMovement({
      type: 'Stock In',
      itemId: payload.itemId,
      partName: payload.partName,
      sku: payload.sku,
      qty: Number(payload.quantity || 1),
      supplier: payload.supplier,
      jobRef: payload.invoiceNo || 'REC-BATCH',
      notes: payload.notes
    });
    return Promise.resolve({ success: true });
  }
  return apiClient.post(`${API_ENDPOINTS.STOCK}/in`, payload);
};

export const issueStock = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    addMockStockMovement({
      type: 'Job Issue',
      itemId: payload.itemId,
      partName: payload.partName,
      sku: payload.sku,
      qty: Number(payload.quantity || 1),
      jobRef: payload.jobId || 'JOB-00251',
      notes: payload.notes
    });
    return Promise.resolve({ success: true });
  }
  return apiClient.post(`${API_ENDPOINTS.STOCK}/issue`, payload);
};

export const returnStock = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    if (payload.condition === 'Reusable') {
      addMockStockMovement({
        type: 'Job Return',
        itemId: payload.itemId,
        qty: Number(payload.quantity || 1),
        jobRef: payload.jobId || 'JOB-00251',
        notes: `Returned: ${payload.condition}`
      });
    } else {
      addMockStockMovement({
        type: 'Damage',
        itemId: payload.itemId,
        qty: Number(payload.quantity || 1),
        jobRef: payload.jobId || 'JOB-00251',
        notes: `Damaged return: ${payload.condition}`
      });
    }
    return Promise.resolve({ success: true });
  }
  return apiClient.post(`${API_ENDPOINTS.STOCK}/return`, payload);
};

export const createTransfer = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    const newTrf = {
      id: `TRF-${Date.now()}`,
      fromBranch: payload.fromBranch || 'Main Garage Branch',
      toBranch: payload.toBranch || 'Kochi South Branch',
      item: payload.item || 'Engine Oil',
      qty: Number(payload.quantity || 1),
      date: new Date().toISOString().split('T')[0],
      requestedBy: 'Current User',
      status: 'Requested'
    };
    stockTransfersMock.unshift(newTrf);
    return Promise.resolve(newTrf);
  }
  return apiClient.post(`${API_ENDPOINTS.STOCK}/transfer`, payload);
};

export const createAdjustment = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    const type = payload.adjustmentType === 'Increase' ? 'Adjustment +' : 'Adjustment -';
    addMockStockMovement({
      type,
      itemId: payload.itemId,
      qty: Number(payload.quantity || 1),
      notes: payload.reason || 'Physical count variance'
    });
    return Promise.resolve({ success: true });
  }
  return apiClient.post(`${API_ENDPOINTS.STOCK}/adjustment`, payload);
};

export const getMovementLedger = async (filters = {}) => {
  if (USE_MOCK_API) {
    await delay();
    let result = [...stockLedgerMock];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(m => m.partName.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || m.type.toLowerCase().includes(q));
    }
    return Promise.resolve(result);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/ledger`, { params: filters });
};

export const getSuppliers = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...stockSuppliersMock]);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/suppliers`);
};

export const getPurchases = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...stockPurchasesMock]);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/purchases`);
};

export const getReservations = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...stockReservationsMock]);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/reservations`);
};

export const getTransfers = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...stockTransfersMock]);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/transfers`);
};

export const getStockCounts = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...stockCountsMock]);
  }
  return apiClient.get(`${API_ENDPOINTS.STOCK}/counts`);
};

export const stockService = {
  getStockDashboard,
  getStockItems,
  getStockItemById,
  receiveStock,
  issueStock,
  returnStock,
  createTransfer,
  createAdjustment,
  getMovementLedger,
  getSuppliers,
  getPurchases,
  getReservations,
  getTransfers,
  getStockCounts,
  // Backward compatibility
  getStock: getStockItems,
  getStockById: getStockItemById,
  createStockItem: receiveStock,
  updateStockItem: createAdjustment,
  deleteStockItem: async () => true,
  getOverview: getStockDashboard,
  createPurchase: receiveStock,
  getHistory: getMovementLedger
};

export const getStock = getStockItems;
export const getStockById = getStockItemById;
export const createStockItem = receiveStock;
export const updateStockItem = createAdjustment;
export const deleteStockItem = async () => true;
