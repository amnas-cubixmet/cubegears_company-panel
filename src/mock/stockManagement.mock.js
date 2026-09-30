export const stockCategories = [
  { id: 'CAT-001', name: 'Engine Parts', code: 'ENG', minimumDefault: 5, status: 'Active' },
  { id: 'CAT-002', name: 'Brake Parts', code: 'BRK', minimumDefault: 8, status: 'Active' },
  { id: 'CAT-003', name: 'Suspension', code: 'SUS', minimumDefault: 4, status: 'Active' },
  { id: 'CAT-004', name: 'Electrical', code: 'ELE', minimumDefault: 10, status: 'Active' },
  { id: 'CAT-005', name: 'AC Parts', code: 'AC', minimumDefault: 5, status: 'Active' },
  { id: 'CAT-006', name: 'Filters', code: 'FLT', minimumDefault: 12, status: 'Active' },
  { id: 'CAT-007', name: 'Oils & Lubricants', code: 'OIL', minimumDefault: 15, status: 'Active' },
  { id: 'CAT-008', name: 'Tyres', code: 'TYR', minimumDefault: 4, status: 'Active' },
  { id: 'CAT-009', name: 'Batteries', code: 'BAT', minimumDefault: 3, status: 'Active' },
  { id: 'CAT-010', name: 'Body Parts', code: 'BDY', minimumDefault: 3, status: 'Active' },
  { id: 'CAT-011', name: 'Consumables', code: 'CON', minimumDefault: 20, status: 'Active' }
];

export const stockItemMetadata = {
  'STK-0001': { barcode: '8901234500011', tax: 18, compatibleVehicle: 'Universal / Petrol & Diesel', engineNo: '', discountLimit: 8 },
  'STK-0002': { barcode: '8901234500028', tax: 18, compatibleVehicle: 'Toyota / Hyundai / Maruti', engineNo: '', discountLimit: 10 },
  'STK-0003': { barcode: '8901234500035', tax: 18, compatibleVehicle: 'Sedan / Hatchback Front Axle', engineNo: '', discountLimit: 6 },
  'STK-0004': { barcode: '8901234500042', tax: 18, compatibleVehicle: 'Toyota Innova', engineNo: '', discountLimit: 5 },
  'STK-0005': { barcode: '8901234500059', tax: 18, compatibleVehicle: 'Universal Cooling Systems', engineNo: '', discountLimit: 10 },
  'STK-0006': { barcode: '8901234500066', tax: 18, compatibleVehicle: 'Petrol Engines', engineNo: '', discountLimit: 7 },
  'STK-0007': { barcode: '8901234500073', tax: 18, compatibleVehicle: 'Honda City 2015+', engineNo: '', discountLimit: 4 }
};

export const purchaseOrderLines = {
  'PO-2026-089': [
    { id: 'POL-089-1', itemId: 'STK-0001', partName: 'Fully Synthetic 5W-30 Motor Oil 1L', sku: 'OIL-SYN-5W30', orderedQty: 24, receivedQty: 24, unitCost: 550 },
    { id: 'POL-089-2', itemId: 'STK-0002', partName: 'Heavy Duty Oil Filter Element', sku: 'FLT-OIL-HD', orderedQty: 12, receivedQty: 12, unitCost: 280 },
    { id: 'POL-089-3', itemId: 'STK-0005', partName: 'Radiator Coolant Concentrate 1L', sku: 'CLT-CONC-1L', orderedQty: 10, receivedQty: 10, unitCost: 380 }
  ],
  'PO-2026-090': [
    { id: 'POL-090-1', itemId: 'STK-0002', partName: 'Heavy Duty Oil Filter Element', sku: 'FLT-OIL-HD', orderedQty: 20, receivedQty: 0, unitCost: 275 },
    { id: 'POL-090-2', itemId: 'STK-0006', partName: 'NGK Iridium Spark Plug', sku: 'SPK-NGK-IRD', orderedQty: 24, receivedQty: 0, unitCost: 410 }
  ]
};

export const stockAdjustmentReasons = [
  'Damaged',
  'Missing',
  'Expired',
  'Physical Count Difference',
  'Opening Balance Correction',
  'Other'
];

export const stockBranches = ['Main Garage Branch', 'Kochi South Branch'];

export const enrichStockItem = (item) => ({
  barcode: '',
  tax: 18,
  compatibleVehicle: 'Universal',
  discountLimit: 10,
  ...item,
  ...(stockItemMetadata[item?.id] || {}),
  available: Math.max(0, Number(item?.onHand || 0) - Number(item?.reserved || 0)),
  stockValue: Number(item?.onHand || 0) * Number(item?.costPrice || 0),
  margin: Number(item?.sellingPrice || 0) - Number(item?.costPrice || 0),
  marginPercent: Number(item?.sellingPrice || 0)
    ? ((Number(item?.sellingPrice || 0) - Number(item?.costPrice || 0)) / Number(item?.sellingPrice || 1)) * 100
    : 0
});
