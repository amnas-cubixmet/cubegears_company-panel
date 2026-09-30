import { stockManagementService } from './stockManagement.service';

const normalizeInventory = (item = {}) => ({
  ...item,
  id: item.id,
  sku: item.sku || '',
  name: item.name || item.partName || '',
  partName: item.partName || item.name || '',
  barcode: item.barcode || '',
  category: item.category || 'Consumables',
  brand: item.brand || '',
  compatibleVehicle: item.compatibleVehicle || 'Universal',
  unit: item.unit || 'Piece',
  cost: Number(item.cost ?? item.costPrice ?? 0),
  costPrice: Number(item.costPrice ?? item.cost ?? 0),
  price: Number(item.price ?? item.sellingPrice ?? 0),
  sellingPrice: Number(item.sellingPrice ?? item.price ?? 0),
  onHand: Number(item.onHand || 0),
  reserved: Number(item.reserved || 0),
  available: Number(item.available ?? (Number(item.onHand || 0) - Number(item.reserved || 0))),
  minimum: Number(item.minimum ?? item.minimumStock ?? 0),
  minimumStock: Number(item.minimumStock ?? item.minimum ?? 0),
  reorderLevel: Number(item.reorderLevel ?? item.minimumStock ?? item.minimum ?? 0),
  rack: item.rack || item.location || '',
  location: item.location || item.rack || '',
  supplier: item.supplier || '',
  tax: Number(item.tax || 0),
  discountLimit: Number(item.discountLimit || 0),
  status: item.status || 'Active'
});

const toStockShape = (data = {}) => ({
  ...data,
  partName: data.partName || data.name || '',
  name: data.name || data.partName || '',
  costPrice: Number(data.costPrice ?? data.cost ?? 0),
  sellingPrice: Number(data.sellingPrice ?? data.price ?? 0),
  minimumStock: Number(data.minimumStock ?? data.minimum ?? 0),
  location: data.location || data.rack || '',
  onHand: Number(data.onHand || 0),
  reserved: Number(data.reserved || 0),
  reorderLevel: Number(data.reorderLevel ?? data.minimumStock ?? data.minimum ?? 0)
});

export const getInventory = async (params = {}) => {
  let rows = await stockManagementService.getItems();
  rows = rows.map(normalizeInventory);

  const q = String(params.search || '').trim().toLowerCase();
  if (q) {
    rows = rows.filter((item) =>
      [
        item.name,
        item.sku,
        item.barcode,
        item.category,
        item.brand,
        item.compatibleVehicle,
        item.rack,
        item.supplier
      ].some((value) => String(value || '').toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== 'All') {
    rows = rows.filter((item) => item.category === params.category);
  }

  if (params.status && params.status !== 'All') {
    rows = rows.filter((item) => String(item.status).toLowerCase() === String(params.status).toLowerCase());
  }

  return rows;
};

export const getInventoryById = async (id) => {
  const item = await stockManagementService.getItem(id);
  return item ? normalizeInventory(item) : null;
};

export const createInventoryItem = async (data) => {
  const item = await stockManagementService.createItem(toStockShape(data));
  return normalizeInventory(item);
};

export const updateInventoryItem = async (id, data) => {
  const item = await stockManagementService.updateItem(id, toStockShape(data));
  return normalizeInventory(item);
};

export const deleteInventoryItem = async (id) =>
  stockManagementService.deleteItem(id);

export const getInventoryCategories = async () =>
  stockManagementService.getCategories();

export const getInventorySuppliers = async () =>
  stockManagementService.getSuppliers();

export const inventoryService = {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryCategories,
  getInventorySuppliers,
  getAll: getInventory,
  getById: getInventoryById,
  create: createInventoryItem,
  update: updateInventoryItem,
  delete: deleteInventoryItem
};
