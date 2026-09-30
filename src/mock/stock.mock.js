// Single Unified Stock Ledger & Store for CubeGears Workshop Panel

export let stockMockItems = [
  {
    id: "STK-0001",
    partName: "Fully Synthetic 5W-30 Motor Oil 1L",
    sku: "OIL-SYN-5W30",
    category: "Engine Oil",
    brand: "Castrol EDGE",
    unit: "Litre",
    onHand: 42,
    reserved: 4,
    minimumStock: 15,
    reorderLevel: 20,
    costPrice: 550,
    sellingPrice: 850,
    supplier: "Global Oil Distributors",
    location: "Rack A-01",
    status: "Active"
  },
  {
    id: "STK-0002",
    partName: "Heavy Duty Oil Filter Element",
    sku: "FLT-OIL-HD",
    category: "Filters",
    brand: "Bosch",
    unit: "Piece",
    onHand: 18,
    reserved: 2,
    minimumStock: 10,
    reorderLevel: 15,
    costPrice: 280,
    sellingPrice: 450,
    supplier: "Bosch Auto Direct",
    location: "Rack A-03",
    status: "Active"
  },
  {
    id: "STK-0003",
    partName: "Ceramic Brake Pads (Front Pair)",
    sku: "BP-CRMC-01",
    category: "Brake Parts",
    brand: "Brembo",
    unit: "Pair",
    onHand: 6,
    reserved: 2,
    minimumStock: 10,
    reorderLevel: 12,
    costPrice: 1850,
    sellingPrice: 2800,
    supplier: "AutoParts Wholesale Co.",
    location: "Shelf B-04",
    status: "Low Stock"
  },
  {
    id: "STK-0004",
    partName: "Engine Mounting Bush (Innova)",
    sku: "ENG-MNT-INV",
    category: "Engine Parts",
    brand: "Toyota Genuine Parts",
    unit: "Set",
    onHand: 3,
    reserved: 1,
    minimumStock: 5,
    reorderLevel: 8,
    costPrice: 3200,
    sellingPrice: 4800,
    supplier: "Apex Motors OEM",
    location: "Bin C-12",
    status: "Low Stock"
  },
  {
    id: "STK-0005",
    partName: "Radiator Coolant Concentrate 1L",
    sku: "CLT-CONC-1L",
    category: "Fluids",
    brand: "Glysantin G48",
    unit: "Litre",
    onHand: 25,
    reserved: 0,
    minimumStock: 8,
    reorderLevel: 12,
    costPrice: 380,
    sellingPrice: 620,
    supplier: "Global Oil Distributors",
    location: "Shelf A-05",
    status: "Active"
  },
  {
    id: "STK-0006",
    partName: "NGK Iridium Spark Plug",
    sku: "SPK-NGK-IRD",
    category: "Electrical",
    brand: "NGK",
    unit: "Piece",
    onHand: 0,
    reserved: 0,
    minimumStock: 12,
    reorderLevel: 15,
    costPrice: 420,
    sellingPrice: 680,
    supplier: "AutoParts Wholesale Co.",
    location: "Rack D-02",
    status: "Out of Stock"
  },
  {
    id: "STK-0007",
    partName: "Honda City Clutch Kit Assembly",
    sku: "CLT-HON-CITY-15",
    category: "Clutch Parts",
    brand: "Honda Genuine Parts",
    unit: "Set",
    onHand: 0,
    reserved: 0,
    minimumStock: 2,
    reorderLevel: 3,
    costPrice: 7200,
    sellingPrice: 9500,
    supplier: "Honda Authorized Distributor",
    location: "Rack C-08",
    status: "Out of Stock"
  }
];

export let stockLedgerMock = [
  {
    id: "MOV-1001",
    date: "2026-09-14 09:30 AM",
    itemId: "STK-0001",
    partName: "Fully Synthetic 5W-30 Motor Oil 1L",
    sku: "OIL-SYN-5W30",
    type: "Stock In",
    qtyIn: 24,
    qtyOut: 0,
    balanceAfter: 42,
    branch: "Main Garage Branch",
    jobRef: "PO-2026-089",
    user: "Rajesh V (Storekeeper)",
    notes: "Received batch from Global Oil Distributors"
  },
  {
    id: "MOV-1002",
    date: "2026-09-14 10:15 AM",
    itemId: "STK-0001",
    partName: "Fully Synthetic 5W-30 Motor Oil 1L",
    sku: "OIL-SYN-5W30",
    type: "Job Issue",
    qtyIn: 0,
    qtyOut: 4,
    balanceAfter: 42,
    branch: "Main Garage Branch",
    jobRef: "JOB-00251",
    user: "Ajmal K (Mechanic)",
    notes: "Issued for Toyota Innova service"
  },
  {
    id: "MOV-1003",
    date: "2026-09-13 04:00 PM",
    itemId: "STK-0002",
    partName: "Heavy Duty Oil Filter Element",
    sku: "FLT-OIL-HD",
    type: "Job Return",
    qtyIn: 1,
    qtyOut: 0,
    balanceAfter: 18,
    branch: "Main Garage Branch",
    jobRef: "JOB-00250",
    user: "Suresh P (Storekeeper)",
    notes: "Unused oil filter returned from job"
  }
];

export let stockSuppliersMock = [
  {
    id: "SUP-001",
    name: "Global Oil Distributors",
    phone: "+91 98470 11223",
    whatsapp: "+91 98470 11223",
    email: "orders@globaloil.com",
    gstNo: "32AAAAA1234A1Z5",
    address: "Industrial Estate, Kalamassery, Kochi",
    totalPurchases: 185000,
    outstanding: 12000,
    status: "Active"
  },
  {
    id: "SUP-002",
    name: "Bosch Auto Direct",
    phone: "+91 94471 99887",
    whatsapp: "+91 94471 99887",
    email: "sales@boschdirect.in",
    gstNo: "32BBBBB5678B1Z2",
    address: "MG Road, Ernakulam",
    totalPurchases: 142000,
    outstanding: 0,
    status: "Active"
  },
  {
    id: "SUP-003",
    name: "AutoParts Wholesale Co.",
    phone: "+91 98950 33445",
    whatsapp: "+91 98950 33445",
    email: "info@autopartswholesale.com",
    gstNo: "32CCCCC9012C1Z9",
    address: "NH Bypass, Vyttila, Kochi",
    totalPurchases: 210000,
    outstanding: 28000,
    status: "Active"
  }
];

export let stockPurchasesMock = [
  {
    id: "PO-2026-089",
    purchaseNo: "PO-2026-089",
    supplier: "Global Oil Distributors",
    date: "2026-09-12",
    invoiceNo: "INV-GOD-9081",
    itemCount: 3,
    totalAmount: 24500,
    paidAmount: 12500,
    balance: 12000,
    status: "Received"
  },
  {
    id: "PO-2026-090",
    purchaseNo: "PO-2026-090",
    supplier: "Bosch Auto Direct",
    date: "2026-09-14",
    invoiceNo: "INV-BAD-4412",
    itemCount: 2,
    totalAmount: 18200,
    paidAmount: 18200,
    balance: 0,
    status: "Ordered"
  }
];

export let stockTransfersMock = [
  {
    id: "TRF-001",
    fromBranch: "Main Garage Branch",
    toBranch: "Kochi South Branch",
    item: "Fully Synthetic 5W-30 Motor Oil 1L",
    qty: 12,
    date: "2026-09-13",
    requestedBy: "Ramesh K",
    approvedBy: "Rajesh V",
    status: "Dispatched"
  }
];

export let stockReservationsMock = [
  {
    id: "RES-901",
    jobId: "JOB-00251",
    vehicle: "Toyota Innova (KL 10 AB 1234)",
    itemId: "STK-0001",
    item: "Fully Synthetic 5W-30 Motor Oil 1L",
    qty: 4,
    reservedBy: "Rajesh V",
    date: "2026-09-14",
    status: "Reserved"
  },
  {
    id: "RES-902",
    jobId: "JOB-00251",
    vehicle: "Toyota Innova (KL 10 AB 1234)",
    itemId: "STK-0002",
    item: "Heavy Duty Oil Filter Element",
    qty: 2,
    reservedBy: "Rajesh V",
    date: "2026-09-14",
    status: "Reserved"
  }
];

export let stockCountsMock = [
  {
    id: "CNT-2026-01",
    date: "2026-09-01",
    counter: "Rajesh V",
    totalItems: 42,
    variances: 2,
    status: "Approved"
  }
];

// Mock accessors
export const getMockStockItems = () => [...stockMockItems];

export const getMockStockItemById = (id) => {
  return stockMockItems.find(s => s.id === id);
};

export const addMockStockMovement = (payload) => {
  const item = stockMockItems.find(s => s.id === payload.itemId || s.sku === payload.sku || s.partName === payload.partName);
  
  if (item) {
    if (payload.type === 'Stock In' || payload.type === 'Job Return' || payload.type === 'Adjustment +') {
      item.onHand += payload.qty;
    } else if (payload.type === 'Job Issue' || payload.type === 'Adjustment -' || payload.type === 'Damage') {
      item.onHand = Math.max(0, item.onHand - payload.qty);
      if (payload.type === 'Job Issue' && item.reserved > 0) {
        item.reserved = Math.max(0, item.reserved - payload.qty);
      }
    }
  }

  const newMov = {
    id: `MOV-${Date.now()}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    itemId: item?.id || payload.itemId || 'STK-0001',
    partName: item?.partName || payload.partName || 'Stock Item',
    sku: item?.sku || payload.sku || 'SKU-00',
    type: payload.type,
    qtyIn: (payload.type === 'Stock In' || payload.type === 'Job Return' || payload.type === 'Adjustment +') ? payload.qty : 0,
    qtyOut: (payload.type === 'Job Issue' || payload.type === 'Damage' || payload.type === 'Adjustment -') ? payload.qty : 0,
    balanceAfter: item?.onHand || 0,
    branch: payload.branch || 'Main Garage Branch',
    jobRef: payload.jobRef || 'REF-GENERAL',
    user: payload.user || 'Current User',
    notes: payload.notes || ''
  };

  stockLedgerMock.unshift(newMov);
  return newMov;
};

// Backward compatibility exports
export const stockMock = stockMockItems;
export const getMockStock = () => stockMockItems;
export const getMockStockById = (id) => stockMockItems.find(s => s.id === id);

