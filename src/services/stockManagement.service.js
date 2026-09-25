import {
  stockMockItems,
  stockLedgerMock,
  stockSuppliersMock,
  stockPurchasesMock,
  stockTransfersMock,
  stockCountsMock
} from '../mock/stock.mock';
import {
  stockCategories,
  stockItemMetadata,
  purchaseOrderLines,
  enrichStockItem
} from '../mock/stockManagement.mock';
import {
  stockService,
  receiveStock,
  issueStock,
  returnStock,
  createTransfer,
  createAdjustment
} from './stock.service';

const delay = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

const nextId = (prefix) => `${prefix}-${Date.now()}`;

export const stockManagementService = {
  ...stockService,

  getItems: async () => {
    await delay();
    return stockMockItems.map(enrichStockItem);
  },

  getItem: async (id) => {
    await delay();
    const item = stockMockItems.find((entry) => entry.id === id);
    return item ? enrichStockItem(item) : null;
  },

  createItem: async (payload) => {
    await delay();
    const item = {
      id: nextId('STK'),
      partName: payload.partName?.trim() || 'New Part',
      sku: payload.sku?.trim() || nextId('SKU'),
      category: payload.category || 'Consumables',
      brand: payload.brand || '',
      unit: payload.unit || 'Piece',
      onHand: Number(payload.onHand || 0),
      reserved: Number(payload.reserved || 0),
      minimumStock: Number(payload.minimumStock || 0),
      reorderLevel: Number(payload.reorderLevel || payload.minimumStock || 0),
      costPrice: Number(payload.costPrice || 0),
      sellingPrice: Number(payload.sellingPrice || 0),
      supplier: payload.supplier || '',
      location: payload.location || '',
      status: payload.status || 'Active'
    };
    stockMockItems.unshift(item);
    stockItemMetadata[item.id] = {
      barcode: payload.barcode || '',
      tax: Number(payload.tax || 0),
      compatibleVehicle: payload.compatibleVehicle || 'Universal',
      discountLimit: Number(payload.discountLimit || 0)
    };
    return enrichStockItem(item);
  },

  updateItem: async (id, payload) => {
    await delay();
    const index = stockMockItems.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error('Stock item not found.');
    stockMockItems[index] = {
      ...stockMockItems[index],
      partName: payload.partName ?? stockMockItems[index].partName,
      sku: payload.sku ?? stockMockItems[index].sku,
      category: payload.category ?? stockMockItems[index].category,
      brand: payload.brand ?? stockMockItems[index].brand,
      unit: payload.unit ?? stockMockItems[index].unit,
      onHand: payload.onHand !== undefined ? Number(payload.onHand) : stockMockItems[index].onHand,
      reserved: payload.reserved !== undefined ? Number(payload.reserved) : stockMockItems[index].reserved,
      minimumStock: payload.minimumStock !== undefined ? Number(payload.minimumStock) : stockMockItems[index].minimumStock,
      reorderLevel: payload.reorderLevel !== undefined ? Number(payload.reorderLevel) : stockMockItems[index].reorderLevel,
      costPrice: payload.costPrice !== undefined ? Number(payload.costPrice) : stockMockItems[index].costPrice,
      sellingPrice: payload.sellingPrice !== undefined ? Number(payload.sellingPrice) : stockMockItems[index].sellingPrice,
      supplier: payload.supplier ?? stockMockItems[index].supplier,
      location: payload.location ?? stockMockItems[index].location,
      status: payload.status ?? stockMockItems[index].status
    };
    stockItemMetadata[id] = {
      ...(stockItemMetadata[id] || {}),
      barcode: payload.barcode ?? stockItemMetadata[id]?.barcode ?? '',
      tax: payload.tax !== undefined ? Number(payload.tax) : stockItemMetadata[id]?.tax ?? 0,
      compatibleVehicle: payload.compatibleVehicle ?? stockItemMetadata[id]?.compatibleVehicle ?? 'Universal',
      discountLimit: payload.discountLimit !== undefined ? Number(payload.discountLimit) : stockItemMetadata[id]?.discountLimit ?? 0
    };
    return enrichStockItem(stockMockItems[index]);
  },

  deleteItem: async (id) => {
    await delay();
    const index = stockMockItems.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error('Stock item not found.');
    const [removed] = stockMockItems.splice(index, 1);
    delete stockItemMetadata[id];
    return removed;
  },

  getCategories: async () => {
    await delay();
    return stockCategories.map((category) => ({
      ...clone(category),
      itemCount: stockMockItems.filter((item) => item.category === category.name).length,
      stockValue: stockMockItems
        .filter((item) => item.category === category.name)
        .reduce((sum, item) => sum + Number(item.onHand || 0) * Number(item.costPrice || 0), 0)
    }));
  },

  createCategory: async (payload) => {
    await delay();
    const name = payload.name?.trim();
    if (!name) throw new Error('Category name is required.');
    if (stockCategories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Category already exists.');
    }
    const category = {
      id: nextId('CAT'),
      name,
      code: payload.code?.trim() || name.slice(0, 3).toUpperCase(),
      minimumDefault: Number(payload.minimumDefault || 0),
      status: payload.status || 'Active'
    };
    stockCategories.push(category);
    return clone(category);
  },

  updateCategory: async (id, payload) => {
    await delay();
    const index = stockCategories.findIndex((category) => category.id === id);
    if (index === -1) throw new Error('Category not found.');
    const oldName = stockCategories[index].name;
    const nextName = payload.name?.trim() || oldName;
    stockCategories[index] = {
      ...stockCategories[index],
      name: nextName,
      code: payload.code ?? stockCategories[index].code,
      minimumDefault: payload.minimumDefault !== undefined ? Number(payload.minimumDefault) : stockCategories[index].minimumDefault,
      status: payload.status ?? stockCategories[index].status
    };
    if (oldName !== nextName) {
      stockMockItems.forEach((item) => {
        if (item.category === oldName) item.category = nextName;
      });
    }
    return clone(stockCategories[index]);
  },

  deleteCategory: async (id) => {
    await delay();
    const index = stockCategories.findIndex((category) => category.id === id);
    if (index === -1) throw new Error('Category not found.');
    const category = stockCategories[index];
    if (stockMockItems.some((item) => item.category === category.name)) {
      throw new Error('Move stock items to another category before deleting.');
    }
    return stockCategories.splice(index, 1)[0];
  },

  stockIn: receiveStock,
  stockOut: issueStock,
  stockReturn: returnStock,

  getLedger: async () => {
    await delay();
    return clone(stockLedgerMock);
  },

  getSuppliers: async () => {
    await delay();
    return clone(stockSuppliersMock);
  },

  createSupplier: async (payload) => {
    await delay();
    const supplier = {
      id: nextId('SUP'),
      name: payload.name?.trim() || 'New Supplier',
      phone: payload.phone || '',
      whatsapp: payload.whatsapp || payload.phone || '',
      email: payload.email || '',
      gstNo: payload.gstNo || '',
      address: payload.address || '',
      brands: payload.brands || '',
      totalPurchases: 0,
      outstanding: Number(payload.outstanding || 0),
      status: payload.status || 'Active'
    };
    stockSuppliersMock.unshift(supplier);
    return clone(supplier);
  },

  updateSupplier: async (id, payload) => {
    await delay();
    const index = stockSuppliersMock.findIndex((supplier) => supplier.id === id);
    if (index === -1) throw new Error('Supplier not found.');
    stockSuppliersMock[index] = { ...stockSuppliersMock[index], ...payload, outstanding: Number(payload.outstanding ?? stockSuppliersMock[index].outstanding || 0) };
    return clone(stockSuppliersMock[index]);
  },

  deleteSupplier: async (id) => {
    await delay();
    const index = stockSuppliersMock.findIndex((supplier) => supplier.id === id);
    if (index === -1) throw new Error('Supplier not found.');
    return stockSuppliersMock.splice(index, 1)[0];
  },

  getPurchaseOrders: async () => {
    await delay();
    return stockPurchasesMock.map((purchase) => ({
      ...clone(purchase),
      lines: clone(purchaseOrderLines[purchase.id] || [])
    }));
  },

  createPurchaseOrder: async (payload) => {
    await delay();
    const id = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const lines = (payload.lines || []).map((line, index) => ({
      id: `${id}-${index + 1}`,
      itemId: line.itemId,
      partName: line.partName,
      sku: line.sku,
      orderedQty: Number(line.orderedQty || 0),
      receivedQty: 0,
      unitCost: Number(line.unitCost || 0)
    }));
    const totalAmount = lines.reduce((sum, line) => sum + line.orderedQty * line.unitCost, 0);
    const purchase = {
      id,
      purchaseNo: id,
      supplier: payload.supplier || '',
      date: payload.date || new Date().toISOString().split('T')[0],
      invoiceNo: payload.invoiceNo || '',
      itemCount: lines.length,
      totalAmount,
      paidAmount: Number(payload.paidAmount || 0),
      balance: Math.max(0, totalAmount - Number(payload.paidAmount || 0)),
      status: payload.status || 'Draft'
    };
    stockPurchasesMock.unshift(purchase);
    purchaseOrderLines[id] = lines;
    return { ...clone(purchase), lines: clone(lines) };
  },

  updatePurchaseStatus: async (id, status) => {
    await delay();
    const purchase = stockPurchasesMock.find((entry) => entry.id === id);
    if (!purchase) throw new Error('Purchase order not found.');
    purchase.status = status;
    return clone(purchase);
  },

  receivePurchaseOrder: async (id, received = {}) => {
    await delay();
    const purchase = stockPurchasesMock.find((entry) => entry.id === id);
    if (!purchase) throw new Error('Purchase order not found.');
    const lines = purchaseOrderLines[id] || [];

    for (const line of lines) {
      const receiveQty = Math.max(0, Number(received[line.id] || 0));
      const remaining = Math.max(0, Number(line.orderedQty || 0) - Number(line.receivedQty || 0));
      const qty = Math.min(receiveQty, remaining);
      if (!qty) continue;
      line.receivedQty += qty;
      await receiveStock({
        itemId: line.itemId,
        partName: line.partName,
        sku: line.sku,
        quantity: qty,
        supplier: purchase.supplier,
        invoiceNo: purchase.invoiceNo || purchase.purchaseNo,
        notes: `Goods received against ${purchase.purchaseNo}`
      });
    }

    const fullyReceived = lines.every((line) => Number(line.receivedQty || 0) >= Number(line.orderedQty || 0));
    const anyReceived = lines.some((line) => Number(line.receivedQty || 0) > 0);
    purchase.status = fullyReceived ? 'Received' : anyReceived ? 'Partially Received' : purchase.status;
    return { ...clone(purchase), lines: clone(lines) };
  },

  getTransfers: async () => {
    await delay();
    return clone(stockTransfersMock);
  },

  createTransfer: async (payload) => createTransfer(payload),

  getAdjustments: async () => {
    await delay();
    return clone(stockLedgerMock.filter((entry) => String(entry.type).startsWith('Adjustment') || entry.type === 'Damage'));
  },

  createAdjustment: async (payload) => createAdjustment(payload),

  getCounts: async () => {
    await delay();
    return clone(stockCountsMock);
  },

  createCount: async (payload) => {
    await delay();
    const count = {
      id: nextId('CNT'),
      date: payload.date || new Date().toISOString().split('T')[0],
      counter: payload.counter || 'Current User',
      totalItems: stockMockItems.length,
      variances: Number(payload.variances || 0),
      status: payload.status || 'Draft'
    };
    stockCountsMock.unshift(count);
    return clone(count);
  }
};

export default stockManagementService;
