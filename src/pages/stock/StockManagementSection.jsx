import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Archive, ArrowLeftRight, Boxes, Building2,
  ClipboardCheck, Edit3, Eye, FileBarChart, IndianRupee, Package,
  PackageCheck, PackageMinus, Plus, Search, ShoppingCart,
  Trash2, Truck
} from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { stockManagementService } from '../../services/stockManagement.service';
import {
  stockCategories,
  stockAdjustmentReasons,
  stockBranches
} from '../../mock/stockManagement.mock';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const today = () => new Date().toISOString().split('T')[0];

const Metric = ({ label, value, icon: Icon, tone = 'primary', note }) => (
  <article className="stock-metric-card">
    <div className="stock-metric-card__top">
      <span>{label}</span>
      <i className={`is-${tone}`}><Icon size={16}/></i>
    </div>
    <strong>{value}</strong>
    {note ? <small>{note}</small> : null}
  </article>
);

const SectionHeader = ({ title, description, action }) => (
  <div className="stock-section-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {action || null}
  </div>
);

const Empty = ({ children }) => <div className="stock-empty">{children}</div>;

const itemStatus = (item) => {
  if (Number(item.onHand || 0) <= 0) return 'Out of Stock';
  if (Number(item.available || 0) <= Number(item.minimumStock || 0)) return 'Low Stock';
  return 'In Stock';
};

const statusClass = (value = '') => `is-${String(value).toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')}`;

const emptyItemForm = {
  partName: '', sku: '', barcode: '', category: 'Engine Parts', brand: '',
  compatibleVehicle: '', unit: 'Piece', costPrice: '', sellingPrice: '', tax: '18',
  onHand: '0', reserved: '0', minimumStock: '5', reorderLevel: '8',
  location: '', supplier: '', discountLimit: '10', status: 'Active'
};

const emptyCategory = { name: '', code: '', minimumDefault: '5', status: 'Active' };
const emptySupplier = { name: '', phone: '', whatsapp: '', email: '', gstNo: '', address: '', brands: '', outstanding: '0', status: 'Active' };
const emptyMovement = { mode: 'Stock In', itemId: '', quantity: '1', supplier: '', invoiceNo: '', jobId: 'JOB-00251', technician: '', condition: 'Reusable', notes: '' };
const emptyTransfer = { itemId: '', fromBranch: 'Main Garage Branch', toBranch: 'Kochi South Branch', quantity: '1' };
const emptyAdjustment = { itemId: '', adjustmentType: 'Decrease', quantity: '1', reason: 'Damaged', notes: '' };
const emptyAudit = { date: today(), counter: 'Current User', variances: '0', status: 'Draft' };

export const StockManagementSection = ({ section, itemId }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [counts, setCounts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [itemEditor, setItemEditor] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [categoryEditor, setCategoryEditor] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [supplierEditor, setSupplierEditor] = useState(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementForm, setMovementForm] = useState(emptyMovement);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState(emptyTransfer);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState(emptyAdjustment);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditForm, setAuditForm] = useState(emptyAudit);
  const [poOpen, setPoOpen] = useState(false);
  const [poSupplier, setPoSupplier] = useState('');
  const [poDate, setPoDate] = useState(today());
  const [poStatus, setPoStatus] = useState('Draft');
  const [poLines, setPoLines] = useState([{ itemId: '', orderedQty: '1', unitCost: '' }]);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receiveQty, setReceiveQty] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [nextItems, nextCategories, nextLedger, nextSuppliers, nextPurchases, nextTransfers, nextAdjustments, nextCounts, nextDashboard] = await Promise.all([
        stockManagementService.getItems(),
        stockManagementService.getCategories(),
        stockManagementService.getLedger(),
        stockManagementService.getSuppliers(),
        stockManagementService.getPurchaseOrders(),
        stockManagementService.getTransfers(),
        stockManagementService.getAdjustments(),
        stockManagementService.getCounts(),
        stockManagementService.getStockDashboard()
      ]);
      setItems(nextItems);
      setCategories(nextCategories);
      setLedger(nextLedger);
      setSuppliers(nextSuppliers);
      setPurchases(nextPurchases);
      setTransfers(nextTransfers);
      setAdjustments(nextAdjustments);
      setCounts(nextCounts);
      setDashboard(nextDashboard);
    } catch (err) {
      setError(err?.message || 'Unable to load stock data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.partName, item.sku, item.barcode, item.category, item.brand, item.compatibleVehicle, item.location]
        .some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [items, query]);

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (itemEditor?.id) await stockManagementService.updateItem(itemEditor.id, itemForm);
      else await stockManagementService.createItem(itemForm);
      setItemEditor(null);
      setItemForm(emptyItemForm);
      await reload();
    } catch (err) {
      setError(err?.message || 'Unable to save stock item.');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setItemEditor(item);
    setItemForm({
      partName: item.partName || '', sku: item.sku || '', barcode: item.barcode || '',
      category: item.category || 'Engine Parts', brand: item.brand || '',
      compatibleVehicle: item.compatibleVehicle || '', unit: item.unit || 'Piece',
      costPrice: item.costPrice || '', sellingPrice: item.sellingPrice || '', tax: item.tax ?? 18,
      onHand: item.onHand ?? 0, reserved: item.reserved ?? 0,
      minimumStock: item.minimumStock ?? 0, reorderLevel: item.reorderLevel ?? 0,
      location: item.location || '', supplier: item.supplier || '',
      discountLimit: item.discountLimit ?? 0, status: item.status || 'Active'
    });
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete ${item.partName}?`)) return;
    await stockManagementService.deleteItem(item.id);
    await reload();
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (categoryEditor?.id) await stockManagementService.updateCategory(categoryEditor.id, categoryForm);
      else await stockManagementService.createCategory(categoryForm);
      setCategoryEditor(null);
      setCategoryForm(emptyCategory);
      await reload();
    } catch (err) {
      setError(err?.message || 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  };

  const saveSupplier = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (supplierEditor?.id) await stockManagementService.updateSupplier(supplierEditor.id, supplierForm);
      else await stockManagementService.createSupplier(supplierForm);
      setSupplierEditor(null);
      setSupplierForm(emptySupplier);
      await reload();
    } catch (err) {
      setError(err?.message || 'Unable to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const submitMovement = async (event) => {
    event.preventDefault();
    const item = items.find((entry) => entry.id === movementForm.itemId);
    if (!item) return;
    setSaving(true);
    try {
      if (movementForm.mode === 'Stock In') {
        await stockManagementService.stockIn({
          itemId: item.id, partName: item.partName, sku: item.sku,
          quantity: movementForm.quantity, supplier: movementForm.supplier,
          invoiceNo: movementForm.invoiceNo, notes: movementForm.notes
        });
      } else if (movementForm.mode === 'Stock Out') {
        await stockManagementService.stockOut({
          itemId: item.id, partName: item.partName, sku: item.sku,
          quantity: movementForm.quantity, jobId: movementForm.jobId,
          notes: `${movementForm.technician ? `Technician: ${movementForm.technician}. ` : ''}${movementForm.notes || ''}`
        });
      } else {
        await stockManagementService.stockReturn({
          itemId: item.id, partName: item.partName, sku: item.sku,
          quantity: movementForm.quantity, jobId: movementForm.jobId,
          condition: movementForm.condition, notes: movementForm.notes
        });
      }
      setMovementOpen(false);
      setMovementForm(emptyMovement);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    const item = items.find((entry) => entry.id === transferForm.itemId);
    if (!item) return;
    setSaving(true);
    try {
      await stockManagementService.createTransfer({
        ...transferForm,
        item: item.partName
      });
      setTransferOpen(false);
      setTransferForm(emptyTransfer);
      await reload();
    } finally { setSaving(false); }
  };

  const submitAdjustment = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await stockManagementService.createAdjustment({
        ...adjustmentForm,
        reason: `${adjustmentForm.reason}${adjustmentForm.notes ? ` · ${adjustmentForm.notes}` : ''}`
      });
      setAdjustmentOpen(false);
      setAdjustmentForm(emptyAdjustment);
      await reload();
    } finally { setSaving(false); }
  };

  const submitAudit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await stockManagementService.createCount(auditForm);
      setAuditOpen(false);
      setAuditForm(emptyAudit);
      await reload();
    } finally { setSaving(false); }
  };

  const addPoLine = () => setPoLines((current) => [...current, { itemId: '', orderedQty: '1', unitCost: '' }]);

  const updatePoLine = (index, key, value) => {
    setPoLines((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, [key]: value } : line));
  };

  const createPurchaseOrder = async (event) => {
    event.preventDefault();
    const lines = poLines
      .map((line) => {
        const item = items.find((entry) => entry.id === line.itemId);
        return item ? {
          itemId: item.id,
          partName: item.partName,
          sku: item.sku,
          orderedQty: line.orderedQty,
          unitCost: line.unitCost || item.costPrice
        } : null;
      })
      .filter(Boolean);

    if (!poSupplier || !lines.length) return;
    setSaving(true);
    try {
      await stockManagementService.createPurchaseOrder({
        supplier: poSupplier,
        date: poDate,
        status: poStatus,
        lines
      });
      setPoOpen(false);
      setPoSupplier('');
      setPoDate(today());
      setPoStatus('Draft');
      setPoLines([{ itemId: '', orderedQty: '1', unitCost: '' }]);
      await reload();
    } finally { setSaving(false); }
  };

  const receivePurchase = async (event) => {
    event.preventDefault();
    if (!receiveTarget) return;
    setSaving(true);
    try {
      await stockManagementService.receivePurchaseOrder(receiveTarget.id, receiveQty);
      setReceiveTarget(null);
      setReceiveQty({});
      await reload();
    } finally { setSaving(false); }
  };

  const renderModals = () => (
    <>
      <ResponsiveModalSheet
        isOpen={itemEditor !== null}
        onClose={() => { setItemEditor(null); setItemForm(emptyItemForm); }}
        title={itemEditor?.id ? 'Edit Part / Product' : 'Add Part / Product'}
        maxWidth="760px"
      >
        <form className="stock-form" onSubmit={saveItem}>
          {error ? <div className="stock-form-error">{error}</div> : null}
          <div className="stock-form-grid">
            <label>Part Name *<input required value={itemForm.partName} onChange={(e)=>setItemForm({...itemForm,partName:e.target.value})}/></label>
            <label>Part Number / SKU *<input required value={itemForm.sku} onChange={(e)=>setItemForm({...itemForm,sku:e.target.value})}/></label>
            <label>Barcode<input value={itemForm.barcode} onChange={(e)=>setItemForm({...itemForm,barcode:e.target.value})}/></label>
            <label>Category<select value={itemForm.category} onChange={(e)=>setItemForm({...itemForm,category:e.target.value})}>{stockCategories.map((category)=><option key={category.id}>{category.name}</option>)}</select></label>
            <label>Brand<input value={itemForm.brand} onChange={(e)=>setItemForm({...itemForm,brand:e.target.value})}/></label>
            <label>Compatible Vehicle<input value={itemForm.compatibleVehicle} onChange={(e)=>setItemForm({...itemForm,compatibleVehicle:e.target.value})}/></label>
            <label>Unit<select value={itemForm.unit} onChange={(e)=>setItemForm({...itemForm,unit:e.target.value})}>{['Piece','Set','Pair','Litre','Can','Box'].map((unit)=><option key={unit}>{unit}</option>)}</select></label>
            <label>Rack / Bin<input value={itemForm.location} onChange={(e)=>setItemForm({...itemForm,location:e.target.value})}/></label>
            <label>Purchase Cost<input type="number" min="0" value={itemForm.costPrice} onChange={(e)=>setItemForm({...itemForm,costPrice:e.target.value})}/></label>
            <label>Selling Price<input type="number" min="0" value={itemForm.sellingPrice} onChange={(e)=>setItemForm({...itemForm,sellingPrice:e.target.value})}/></label>
            <label>Tax %<input type="number" min="0" value={itemForm.tax} onChange={(e)=>setItemForm({...itemForm,tax:e.target.value})}/></label>
            <label>Discount Limit %<input type="number" min="0" value={itemForm.discountLimit} onChange={(e)=>setItemForm({...itemForm,discountLimit:e.target.value})}/></label>
            <label>On Hand<input type="number" min="0" value={itemForm.onHand} onChange={(e)=>setItemForm({...itemForm,onHand:e.target.value})}/></label>
            <label>Reserved<input type="number" min="0" value={itemForm.reserved} onChange={(e)=>setItemForm({...itemForm,reserved:e.target.value})}/></label>
            <label>Minimum Stock<input type="number" min="0" value={itemForm.minimumStock} onChange={(e)=>setItemForm({...itemForm,minimumStock:e.target.value})}/></label>
            <label>Reorder Level<input type="number" min="0" value={itemForm.reorderLevel} onChange={(e)=>setItemForm({...itemForm,reorderLevel:e.target.value})}/></label>
            <label>Supplier<select value={itemForm.supplier} onChange={(e)=>setItemForm({...itemForm,supplier:e.target.value})}><option value="">Select supplier</option>{suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}</select></label>
            <label>Status<select value={itemForm.status} onChange={(e)=>setItemForm({...itemForm,status:e.target.value})}><option>Active</option><option>Archived</option></select></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setItemEditor(null)}>Cancel</button><button className="is-primary" disabled={saving}>{saving?'Saving...':itemEditor?.id?'Update Product':'Add Product'}</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet
        isOpen={categoryEditor !== null}
        onClose={() => { setCategoryEditor(null); setCategoryForm(emptyCategory); }}
        title={categoryEditor?.id ? 'Edit Category' : 'Add Category'}
        maxWidth="520px"
      >
        <form className="stock-form" onSubmit={saveCategory}>
          {error ? <div className="stock-form-error">{error}</div> : null}
          <div className="stock-form-grid">
            <label>Category Name *<input required value={categoryForm.name} onChange={(e)=>setCategoryForm({...categoryForm,name:e.target.value})}/></label>
            <label>Code<input value={categoryForm.code} onChange={(e)=>setCategoryForm({...categoryForm,code:e.target.value})}/></label>
            <label>Default Minimum<input type="number" min="0" value={categoryForm.minimumDefault} onChange={(e)=>setCategoryForm({...categoryForm,minimumDefault:e.target.value})}/></label>
            <label>Status<select value={categoryForm.status} onChange={(e)=>setCategoryForm({...categoryForm,status:e.target.value})}><option>Active</option><option>Inactive</option></select></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setCategoryEditor(null)}>Cancel</button><button className="is-primary" disabled={saving}>{saving?'Saving...':'Save Category'}</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet
        isOpen={supplierEditor !== null}
        onClose={() => { setSupplierEditor(null); setSupplierForm(emptySupplier); }}
        title={supplierEditor?.id ? 'Edit Supplier' : 'Add Supplier'}
        maxWidth="650px"
      >
        <form className="stock-form" onSubmit={saveSupplier}>
          {error ? <div className="stock-form-error">{error}</div> : null}
          <div className="stock-form-grid">
            <label>Supplier Name *<input required value={supplierForm.name} onChange={(e)=>setSupplierForm({...supplierForm,name:e.target.value})}/></label>
            <label>Phone<input value={supplierForm.phone} onChange={(e)=>setSupplierForm({...supplierForm,phone:e.target.value})}/></label>
            <label>WhatsApp<input value={supplierForm.whatsapp} onChange={(e)=>setSupplierForm({...supplierForm,whatsapp:e.target.value})}/></label>
            <label>Email<input type="email" value={supplierForm.email} onChange={(e)=>setSupplierForm({...supplierForm,email:e.target.value})}/></label>
            <label>GST / VAT<input value={supplierForm.gstNo} onChange={(e)=>setSupplierForm({...supplierForm,gstNo:e.target.value})}/></label>
            <label>Brands Supplied<input value={supplierForm.brands} onChange={(e)=>setSupplierForm({...supplierForm,brands:e.target.value})}/></label>
            <label>Outstanding<input type="number" min="0" value={supplierForm.outstanding} onChange={(e)=>setSupplierForm({...supplierForm,outstanding:e.target.value})}/></label>
            <label>Status<select value={supplierForm.status} onChange={(e)=>setSupplierForm({...supplierForm,status:e.target.value})}><option>Active</option><option>Inactive</option></select></label>
            <label className="is-wide">Address<textarea rows="3" value={supplierForm.address} onChange={(e)=>setSupplierForm({...supplierForm,address:e.target.value})}/></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setSupplierEditor(null)}>Cancel</button><button className="is-primary" disabled={saving}>{saving?'Saving...':'Save Supplier'}</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={movementOpen} onClose={()=>setMovementOpen(false)} title="Stock Movement" maxWidth="600px">
        <form className="stock-form" onSubmit={submitMovement}>
          <div className="stock-form-grid">
            <label>Movement Type<select value={movementForm.mode} onChange={(e)=>setMovementForm({...movementForm,mode:e.target.value})}><option>Stock In</option><option>Stock Out</option><option>Return to Stock</option></select></label>
            <label>Part / Product<select required value={movementForm.itemId} onChange={(e)=>setMovementForm({...movementForm,itemId:e.target.value})}><option value="">Select part</option>{items.map((item)=><option key={item.id} value={item.id}>{item.partName} · {item.available} available</option>)}</select></label>
            <label>Quantity<input required type="number" min="1" value={movementForm.quantity} onChange={(e)=>setMovementForm({...movementForm,quantity:e.target.value})}/></label>
            {movementForm.mode==='Stock In' ? <><label>Supplier<select value={movementForm.supplier} onChange={(e)=>setMovementForm({...movementForm,supplier:e.target.value})}><option value="">Select supplier</option>{suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}</select></label><label>Purchase Invoice No<input value={movementForm.invoiceNo} onChange={(e)=>setMovementForm({...movementForm,invoiceNo:e.target.value})}/></label></> : null}
            {movementForm.mode!=='Stock In' ? <><label>Job Card No<input value={movementForm.jobId} onChange={(e)=>setMovementForm({...movementForm,jobId:e.target.value})}/></label><label>Technician<input value={movementForm.technician} onChange={(e)=>setMovementForm({...movementForm,technician:e.target.value})}/></label></> : null}
            {movementForm.mode==='Return to Stock' ? <label>Condition<select value={movementForm.condition} onChange={(e)=>setMovementForm({...movementForm,condition:e.target.value})}><option>Reusable</option><option>Damaged</option></select></label> : null}
            <label className="is-wide">Notes<textarea rows="3" value={movementForm.notes} onChange={(e)=>setMovementForm({...movementForm,notes:e.target.value})}/></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setMovementOpen(false)}>Cancel</button><button className="is-primary" disabled={saving}>Save Movement</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={transferOpen} onClose={()=>setTransferOpen(false)} title="New Stock Transfer" maxWidth="560px">
        <form className="stock-form" onSubmit={submitTransfer}>
          <div className="stock-form-grid">
            <label>Part<select required value={transferForm.itemId} onChange={(e)=>setTransferForm({...transferForm,itemId:e.target.value})}><option value="">Select part</option>{items.map((item)=><option key={item.id} value={item.id}>{item.partName}</option>)}</select></label>
            <label>Quantity<input type="number" min="1" value={transferForm.quantity} onChange={(e)=>setTransferForm({...transferForm,quantity:e.target.value})}/></label>
            <label>From Branch<select value={transferForm.fromBranch} onChange={(e)=>setTransferForm({...transferForm,fromBranch:e.target.value})}>{stockBranches.map((branch)=><option key={branch}>{branch}</option>)}</select></label>
            <label>To Branch<select value={transferForm.toBranch} onChange={(e)=>setTransferForm({...transferForm,toBranch:e.target.value})}>{stockBranches.map((branch)=><option key={branch}>{branch}</option>)}</select></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setTransferOpen(false)}>Cancel</button><button className="is-primary" disabled={saving}>Create Transfer</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={adjustmentOpen} onClose={()=>setAdjustmentOpen(false)} title="Stock Adjustment" maxWidth="560px">
        <form className="stock-form" onSubmit={submitAdjustment}>
          <div className="stock-form-grid">
            <label>Part<select required value={adjustmentForm.itemId} onChange={(e)=>setAdjustmentForm({...adjustmentForm,itemId:e.target.value})}><option value="">Select part</option>{items.map((item)=><option key={item.id} value={item.id}>{item.partName}</option>)}</select></label>
            <label>Adjustment<select value={adjustmentForm.adjustmentType} onChange={(e)=>setAdjustmentForm({...adjustmentForm,adjustmentType:e.target.value})}><option>Increase</option><option>Decrease</option></select></label>
            <label>Quantity<input type="number" min="1" value={adjustmentForm.quantity} onChange={(e)=>setAdjustmentForm({...adjustmentForm,quantity:e.target.value})}/></label>
            <label>Reason<select value={adjustmentForm.reason} onChange={(e)=>setAdjustmentForm({...adjustmentForm,reason:e.target.value})}>{stockAdjustmentReasons.map((reason)=><option key={reason}>{reason}</option>)}</select></label>
            <label className="is-wide">Notes<textarea rows="3" value={adjustmentForm.notes} onChange={(e)=>setAdjustmentForm({...adjustmentForm,notes:e.target.value})}/></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setAdjustmentOpen(false)}>Cancel</button><button className="is-primary" disabled={saving}>Save Adjustment</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={auditOpen} onClose={()=>setAuditOpen(false)} title="Start Stock Audit" maxWidth="520px">
        <form className="stock-form" onSubmit={submitAudit}>
          <div className="stock-form-grid">
            <label>Date<input type="date" value={auditForm.date} onChange={(e)=>setAuditForm({...auditForm,date:e.target.value})}/></label>
            <label>Counter<input value={auditForm.counter} onChange={(e)=>setAuditForm({...auditForm,counter:e.target.value})}/></label>
            <label>Variance Items<input type="number" min="0" value={auditForm.variances} onChange={(e)=>setAuditForm({...auditForm,variances:e.target.value})}/></label>
            <label>Status<select value={auditForm.status} onChange={(e)=>setAuditForm({...auditForm,status:e.target.value})}><option>Draft</option><option>In Progress</option><option>Approved</option></select></label>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setAuditOpen(false)}>Cancel</button><button className="is-primary" disabled={saving}>Create Audit</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={poOpen} onClose={()=>setPoOpen(false)} title="Create Purchase Order" maxWidth="760px">
        <form className="stock-form" onSubmit={createPurchaseOrder}>
          <div className="stock-form-grid">
            <label>Supplier *<select required value={poSupplier} onChange={(e)=>setPoSupplier(e.target.value)}><option value="">Select supplier</option>{suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}</select></label>
            <label>PO Date<input type="date" value={poDate} onChange={(e)=>setPoDate(e.target.value)}/></label>
            <label>Status<select value={poStatus} onChange={(e)=>setPoStatus(e.target.value)}><option>Draft</option><option>Ordered</option></select></label>
          </div>
          <div className="stock-po-form-lines">
            {poLines.map((line,index)=>(
              <div key={index}>
                <select value={line.itemId} onChange={(e)=>{const item=items.find((entry)=>entry.id===e.target.value);updatePoLine(index,'itemId',e.target.value);if(item) updatePoLine(index,'unitCost',item.costPrice);}}><option value="">Select part</option>{items.map((item)=><option key={item.id} value={item.id}>{item.partName}</option>)}</select>
                <input type="number" min="1" value={line.orderedQty} onChange={(e)=>updatePoLine(index,'orderedQty',e.target.value)} placeholder="Qty"/>
                <input type="number" min="0" value={line.unitCost} onChange={(e)=>updatePoLine(index,'unitCost',e.target.value)} placeholder="Unit cost"/>
                <button type="button" onClick={()=>setPoLines((current)=>current.filter((_,i)=>i!==index))}>×</button>
              </div>
            ))}
            <button type="button" className="stock-add-line" onClick={addPoLine}><Plus size={13}/> Add Line</button>
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setPoOpen(false)}>Cancel</button><button className="is-primary" disabled={saving}>Create Purchase Order</button></div>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet isOpen={!!receiveTarget} onClose={()=>{setReceiveTarget(null);setReceiveQty({});}} title={receiveTarget ? `Receive Goods · ${receiveTarget.purchaseNo}` : 'Receive Goods'} maxWidth="650px">
        <form className="stock-form" onSubmit={receivePurchase}>
          <div className="stock-receive-lines">
            {(receiveTarget?.lines || []).map((line)=>{
              const remaining=Math.max(0,Number(line.orderedQty||0)-Number(line.receivedQty||0));
              return <div key={line.id}><div><strong>{line.partName}</strong><span>Ordered {line.orderedQty} · Received {line.receivedQty} · Remaining {remaining}</span></div><input type="number" min="0" max={remaining} value={receiveQty[line.id]||''} onChange={(e)=>setReceiveQty({...receiveQty,[line.id]:e.target.value})} placeholder="Receive qty"/></div>;
            })}
          </div>
          <div className="stock-form-actions"><button type="button" onClick={()=>setReceiveTarget(null)}>Cancel</button><button className="is-primary" disabled={saving}>Receive & Update Stock</button></div>
        </form>
      </ResponsiveModalSheet>
    </>
  );

  const withModals = (node) => <>{node}{renderModals()}</>;

  if (loading) return <Empty>Loading stock management data...</Empty>;

  if (section === 'item-detail') {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return <Empty>Stock item not found.</Empty>;

    const movements = ledger.filter((entry) => entry.itemId === item.id || entry.sku === item.sku);
    const relatedPurchases = purchases.filter((purchase) => purchase.lines?.some((line) => line.itemId === item.id));
    const jobUsage = movements.filter((entry) => entry.type === 'Job Issue');

    return (
      <div className="stock-management-view">
        <button className="stock-back-button" onClick={() => navigate('/stock/items')}><ArrowLeftRight size={14}/> Back to Parts & Products</button>
        <section className="stock-item-detail-hero">
          <div>
            <span>{item.sku} · {item.category}</span>
            <h2>{item.partName}</h2>
            <p>{item.brand || 'No brand'} · {item.compatibleVehicle}</p>
          </div>
          <span className={`stock-status ${statusClass(itemStatus(item))}`}>{itemStatus(item)}</span>
        </section>

        <div className="stock-metric-grid is-four">
          <Metric label="Current Stock" value={`${item.onHand} ${item.unit}`} icon={Boxes}/>
          <Metric label="Available" value={item.available} icon={PackageCheck} tone="success"/>
          <Metric label="Reserved" value={item.reserved} icon={Archive}/>
          <Metric label="Stock Value" value={money.format(item.stockValue)} icon={IndianRupee}/>
        </div>

        <div className="stock-two-column">
          <section className="stock-panel">
            <SectionHeader title="Product & Pricing" description="SKU, barcode, supplier, location and margin."/>
            <div className="stock-detail-grid">
              <div><span>Part Number / SKU</span><strong>{item.sku}</strong></div>
              <div><span>Barcode</span><strong>{item.barcode || '—'}</strong></div>
              <div><span>Supplier</span><strong>{item.supplier || '—'}</strong></div>
              <div><span>Rack / Bin</span><strong>{item.location || '—'}</strong></div>
              <div><span>Purchase Cost</span><strong>{money.format(item.costPrice)}</strong></div>
              <div><span>Selling Price</span><strong>{money.format(item.sellingPrice)}</strong></div>
              <div><span>Margin</span><strong>{money.format(item.margin)} · {item.marginPercent.toFixed(1)}%</strong></div>
              <div><span>Tax / Discount Limit</span><strong>{item.tax}% / {item.discountLimit}%</strong></div>
            </div>
          </section>

          <section className="stock-panel">
            <SectionHeader title="Stock Control" description="Minimum level, reorder point and workshop availability."/>
            <div className="stock-detail-grid">
              <div><span>On Hand</span><strong>{item.onHand}</strong></div>
              <div><span>Reserved</span><strong>{item.reserved}</strong></div>
              <div><span>Available</span><strong>{item.available}</strong></div>
              <div><span>Minimum</span><strong>{item.minimumStock}</strong></div>
              <div><span>Reorder Level</span><strong>{item.reorderLevel}</strong></div>
              <div><span>Compatible Vehicle</span><strong>{item.compatibleVehicle}</strong></div>
            </div>
          </section>
        </div>

        <section className="stock-panel">
          <SectionHeader title="Purchase History" description="Purchase orders containing this part."/>
          <div className="stock-row-list">
            {relatedPurchases.map((purchase) => {
              const line = purchase.lines.find((entry) => entry.itemId === item.id);
              return <div key={purchase.id} className="stock-data-row"><div><strong>{purchase.purchaseNo}</strong><span>{purchase.date} · {purchase.supplier} · {purchase.status}</span></div><b>{line?.receivedQty || 0}/{line?.orderedQty || 0}</b></div>;
            })}
            {!relatedPurchases.length ? <Empty>No purchase history.</Empty> : null}
          </div>
        </section>

        <section className="stock-panel">
          <SectionHeader title="Job Cards Used In" description="Job-card issues and quantity consumed."/>
          <div className="stock-row-list">
            {jobUsage.map((movement) => <div key={movement.id} className="stock-data-row"><div><strong>{movement.jobRef}</strong><span>{movement.date} · {movement.user}</span></div><b>-{movement.qtyOut}</b></div>)}
            {!jobUsage.length ? <Empty>No job-card issue history.</Empty> : null}
          </div>
        </section>

        <section className="stock-panel">
          <SectionHeader title="Full Stock Movement History" description="Stock in, issue, return and adjustment ledger."/>
          <div className="stock-ledger-list">
            {movements.map((movement) => (
              <div key={movement.id} className="stock-ledger-row">
                <span className={statusClass(movement.type)}>{movement.type}</span>
                <div><strong>{movement.date}</strong><small>{movement.jobRef} · {movement.notes || movement.user}</small></div>
                <b>{movement.qtyIn ? `+${movement.qtyIn}` : `-${movement.qtyOut}`}</b>
                <em>Balance {movement.balanceAfter}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'overview') {
    const lowItems = items.filter((item) => item.onHand > 0 && item.available <= item.minimumStock);
    const outItems = items.filter((item) => item.onHand <= 0);
    return (
      <div className="stock-management-view">
        <div className="stock-metric-grid">
          <Metric label="Total Items" value={dashboard?.totalItems || items.length} icon={Package}/>
          <Metric label="Stock Value" value={money.format(dashboard?.totalValue || 0)} icon={IndianRupee}/>
          <Metric label="Low Stock" value={dashboard?.lowStock || 0} icon={AlertTriangle} tone="warning"/>
          <Metric label="Out of Stock" value={dashboard?.outOfStock || 0} icon={PackageMinus} tone="danger"/>
          <Metric label="Pending POs" value={purchases.filter((po)=>['Draft','Ordered','Partially Received'].includes(po.status)).length} icon={ShoppingCart}/>
          <Metric label="Today In / Out" value={`${dashboard?.receivedToday || 0} / ${dashboard?.issuedToday || 0}`} icon={ArrowLeftRight}/>
        </div>

        <div className="stock-two-column">
          <section className="stock-panel">
            <SectionHeader title="Low Stock Alert" description="Items at or below minimum stock." action={<button className="stock-link-button" onClick={()=>navigate('/stock/items')}>View Products</button>}/>
            <div className="stock-row-list">
              {lowItems.map((item)=><button key={item.id} className="stock-data-row is-clickable" onClick={()=>navigate(`/stock/items/${item.id}`)}><div><strong>{item.partName}</strong><span>{item.sku} · {item.location}</span></div><b className="is-warning">{item.available} / Min {item.minimumStock}</b></button>)}
              {!lowItems.length ? <Empty>No low-stock items.</Empty> : null}
            </div>
          </section>

          <section className="stock-panel">
            <SectionHeader title="Out of Stock" description="Zero-stock parts that need replenishment."/>
            <div className="stock-row-list">
              {outItems.map((item)=><button key={item.id} className="stock-data-row is-clickable" onClick={()=>navigate(`/stock/items/${item.id}`)}><div><strong>{item.partName}</strong><span>{item.sku} · {item.supplier}</span></div><b className="is-danger">0</b></button>)}
              {!outItems.length ? <Empty>No out-of-stock items.</Empty> : null}
            </div>
          </section>
        </div>

        <section className="stock-panel">
          <SectionHeader title="Recent Stock Movement" description="Purchase → stock in → job issue → return / adjustment." action={<button className="stock-link-button" onClick={()=>navigate('/stock/movements')}>Movement Ledger</button>}/>
          <div className="stock-ledger-list">
            {ledger.slice(0, 8).map((movement) => (
              <div key={movement.id} className="stock-ledger-row">
                <span className={statusClass(movement.type)}>{movement.type}</span>
                <div><strong>{movement.partName}</strong><small>{movement.date} · {movement.jobRef}</small></div>
                <b>{movement.qtyIn ? `+${movement.qtyIn}` : `-${movement.qtyOut}`}</b>
                <em>Bal {movement.balanceAfter}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'items') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Parts & Products" description="Spare parts, oils and consumables with pricing, stock level and rack location." action={<button className="stock-primary-button" onClick={()=>{setItemEditor({});setItemForm(emptyItemForm);}}><Plus size={14}/> Add Product</button>}/>
        <label className="stock-search"><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Part name / SKU / barcode / brand / vehicle"/></label>
        <div className="stock-product-grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="stock-product-card">
              <div className="stock-product-card__head">
                <div><strong>{item.partName}</strong><span>{item.sku} · {item.category}</span></div>
                <span className={`stock-status ${statusClass(itemStatus(item))}`}>{itemStatus(item)}</span>
              </div>
              <div className="stock-product-stock">
                <div><span>On Hand</span><b>{item.onHand}</b></div>
                <div><span>Reserved</span><b>{item.reserved}</b></div>
                <div><span>Available</span><b>{item.available}</b></div>
                <div><span>Minimum</span><b>{item.minimumStock}</b></div>
              </div>
              <div className="stock-product-meta"><span>{item.brand}</span><span>{item.location}</span><span>{money.format(item.sellingPrice)}</span></div>
              <div className="stock-card-actions is-three">
                <button onClick={()=>navigate(`/stock/items/${item.id}`)}><Eye size={13}/> Detail</button>
                <button onClick={()=>editItem(item)}><Edit3 size={13}/> Edit</button>
                <button className="is-danger" onClick={()=>deleteItem(item)}><Trash2 size={13}/> Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'categories') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Stock Categories" description="Workshop inventory categories and default minimum stock levels." action={<button className="stock-primary-button" onClick={()=>{setCategoryEditor({});setCategoryForm(emptyCategory);}}><Plus size={14}/> Add Category</button>}/>
        <div className="stock-category-grid">
          {categories.map((category)=>(
            <article key={category.id} className="stock-category-card">
              <div><span>{category.code}</span><strong>{category.name}</strong><small>{category.itemCount} item(s)</small></div>
              <div className="stock-category-values"><span>Default Min <b>{category.minimumDefault}</b></span><span>Stock Value <b>{money.format(category.stockValue)}</b></span></div>
              <div className="stock-card-actions"><button onClick={()=>{setCategoryEditor(category);setCategoryForm({...category});}}><Edit3 size={13}/> Edit</button><button className="is-danger" onClick={async()=>{if(window.confirm('Delete this category?')){try{await stockManagementService.deleteCategory(category.id);await reload();}catch(err){window.alert(err.message);}}}}><Trash2 size={13}/> Delete</button></div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'movements') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Stock In / Out / Returns" description="Receive supplier stock, issue to Job Cards and restore unused parts." action={<button className="stock-primary-button" onClick={()=>{setMovementForm(emptyMovement);setMovementOpen(true);}}><Plus size={14}/> New Movement</button>}/>
        <div className="stock-movement-flow"><span>Purchase</span><i>→</i><span>Stock In</span><i>→</i><span>Job Card Issue</span><i>→</i><span>Stock Out</span><i>→</i><span>Invoice</span></div>
        <section className="stock-panel">
          <SectionHeader title="Movement Ledger" description="Full inward, issue, return and adjustment history."/>
          <div className="stock-ledger-list">
            {ledger.map((movement)=>(
              <div key={movement.id} className="stock-ledger-row">
                <span className={statusClass(movement.type)}>{movement.type}</span>
                <div><strong>{movement.partName}</strong><small>{movement.date} · {movement.jobRef} · {movement.user}</small></div>
                <b>{movement.qtyIn ? `+${movement.qtyIn}` : `-${movement.qtyOut}`}</b>
                <em>Balance {movement.balanceAfter}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'purchase-orders') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Purchase Orders & Goods Receiving" description="Supplier orders, ordered vs received quantity and PO lifecycle." action={<button className="stock-primary-button" onClick={()=>setPoOpen(true)}><Plus size={14}/> Create PO</button>}/>
        <div className="stock-po-grid">
          {purchases.map((po)=>(
            <article key={po.id} className="stock-po-card">
              <div className="stock-po-card__head"><div><strong>{po.purchaseNo}</strong><span>{po.date} · {po.supplier}</span></div><span className={`stock-status ${statusClass(po.status)}`}>{po.status}</span></div>
              <div className="stock-po-values"><div><span>Items</span><b>{po.itemCount}</b></div><div><span>Total</span><b>{money.format(po.totalAmount)}</b></div><div><span>Balance</span><b>{money.format(po.balance)}</b></div></div>
              <div className="stock-po-lines">
                {(po.lines || []).map((line)=><div key={line.id}><span>{line.partName}</span><b>{line.receivedQty}/{line.orderedQty}</b></div>)}
              </div>
              <div className="stock-card-actions">
                <select value={po.status} onChange={async(e)=>{await stockManagementService.updatePurchaseStatus(po.id,e.target.value);await reload();}}>
                  {['Draft','Ordered','Partially Received','Received','Cancelled'].map((status)=><option key={status}>{status}</option>)}
                </select>
                <button disabled={po.status==='Received'||po.status==='Cancelled'} onClick={()=>{setReceiveTarget(po);setReceiveQty({});}}><PackageCheck size={13}/> Receive Goods</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'suppliers') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Suppliers" description="Supplier contacts, GST/VAT, brands, outstanding and purchase history." action={<button className="stock-primary-button" onClick={()=>{setSupplierEditor({});setSupplierForm(emptySupplier);}}><Plus size={14}/> Add Supplier</button>}/>
        <div className="stock-supplier-grid">
          {suppliers.map((supplier)=>(
            <article key={supplier.id} className="stock-supplier-card">
              <div className="stock-supplier-card__head"><div><strong>{supplier.name}</strong><span>{supplier.phone} · {supplier.email}</span></div><Truck size={17}/></div>
              <div className="stock-detail-grid"><div><span>GST / VAT</span><strong>{supplier.gstNo || '—'}</strong></div><div><span>Purchases</span><strong>{money.format(supplier.totalPurchases)}</strong></div><div><span>Outstanding</span><strong>{money.format(supplier.outstanding)}</strong></div><div><span>Status</span><strong>{supplier.status}</strong></div></div>
              <p>{supplier.address}</p>
              <div className="stock-card-actions"><button onClick={()=>{setSupplierEditor(supplier);setSupplierForm({...emptySupplier,...supplier});}}><Edit3 size={13}/> Edit</button><button className="is-danger" onClick={async()=>{if(window.confirm('Delete supplier?')){await stockManagementService.deleteSupplier(supplier.id);await reload();}}}><Trash2 size={13}/> Delete</button></div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'transfers') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Stock Transfers" description="Transfer stock between branches and store rooms." action={<button className="stock-primary-button" onClick={()=>setTransferOpen(true)}><Plus size={14}/> New Transfer</button>}/>
        <div className="stock-transfer-list">
          {transfers.map((transfer)=>(
            <article key={transfer.id} className="stock-transfer-card">
              <div className="stock-transfer-route"><Building2 size={15}/><strong>{transfer.fromBranch}</strong><ArrowLeftRight size={15}/><strong>{transfer.toBranch}</strong></div>
              <div><span>{transfer.item}</span><b>{transfer.qty} qty</b></div>
              <div><span>{transfer.date} · {transfer.requestedBy}</span><b>{transfer.status}</b></div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'adjustments') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Stock Adjustments" description="Damaged, missing, expired and physical-count corrections with reason history." action={<button className="stock-primary-button" onClick={()=>setAdjustmentOpen(true)}><Plus size={14}/> New Adjustment</button>}/>
        <section className="stock-panel">
          <div className="stock-ledger-list">
            {adjustments.map((movement)=>(
              <div key={movement.id} className="stock-ledger-row">
                <span className={statusClass(movement.type)}>{movement.type}</span>
                <div><strong>{movement.partName}</strong><small>{movement.date} · {movement.notes}</small></div>
                <b>{movement.qtyIn ? `+${movement.qtyIn}` : `-${movement.qtyOut}`}</b>
                <em>Bal {movement.balanceAfter}</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'audit') {
    return withModals(
      <div className="stock-management-view">
        <SectionHeader title="Inventory Audit" description="Physical stock count vs system stock and variance history." action={<button className="stock-primary-button" onClick={()=>setAuditOpen(true)}><Plus size={14}/> Start Count</button>}/>
        <div className="stock-audit-grid">
          {counts.map((count)=>(
            <article key={count.id} className="stock-audit-card">
              <div><ClipboardCheck size={17}/><strong>{count.id}</strong><span>{count.date}</span></div>
              <div className="stock-detail-grid"><div><span>Counter</span><strong>{count.counter}</strong></div><div><span>Total Items</span><strong>{count.totalItems}</strong></div><div><span>Variances</span><strong>{count.variances}</strong></div><div><span>Status</span><strong>{count.status}</strong></div></div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'reports') {
    const fastMoving = items.slice().sort((a,b)=>{
      const aQty=ledger.filter((m)=>m.itemId===a.id&&m.type==='Job Issue').reduce((s,m)=>s+Number(m.qtyOut||0),0);
      const bQty=ledger.filter((m)=>m.itemId===b.id&&m.type==='Job Issue').reduce((s,m)=>s+Number(m.qtyOut||0),0);
      return bQty-aQty;
    });
    const deadStock = items.filter((item)=>!ledger.some((m)=>m.itemId===item.id&&m.type==='Job Issue'));
    const marginValue = items.reduce((sum,item)=>sum+(item.margin*Math.max(0,item.onHand)),0);
    return (
      <div className="stock-management-view">
        <div className="stock-metric-grid is-four">
          <Metric label="Stock Valuation" value={money.format(items.reduce((sum,item)=>sum+item.stockValue,0))} icon={IndianRupee}/>
          <Metric label="Low Stock" value={items.filter((item)=>item.onHand>0&&item.available<=item.minimumStock).length} icon={AlertTriangle} tone="warning"/>
          <Metric label="Dead Stock" value={deadStock.length} icon={Archive} tone="danger"/>
          <Metric label="Potential Margin" value={money.format(marginValue)} icon={FileBarChart} tone="success"/>
        </div>
        <div className="stock-two-column">
          <section className="stock-panel"><SectionHeader title="Fast Moving" description="Highest Job Card consumption."/><div className="stock-row-list">{fastMoving.slice(0,5).map((item)=><div key={item.id} className="stock-data-row"><div><strong>{item.partName}</strong><span>{item.sku}</span></div><b>{ledger.filter((m)=>m.itemId===item.id&&m.type==='Job Issue').reduce((s,m)=>s+Number(m.qtyOut||0),0)} used</b></div>)}</div></section>
          <section className="stock-panel"><SectionHeader title="Dead / Slow Stock" description="Items without recent job-card issue."/><div className="stock-row-list">{deadStock.map((item)=><div key={item.id} className="stock-data-row"><div><strong>{item.partName}</strong><span>{item.sku} · {item.location}</span></div><b>{money.format(item.stockValue)}</b></div>)}</div></section>
        </div>
        <section className="stock-panel"><SectionHeader title="Margin Report" description="Purchase cost, selling price and workshop margin by item."/><div className="stock-report-table"><div className="stock-report-head"><span>Part</span><span>Cost</span><span>Selling</span><span>Margin</span><span>Margin %</span></div>{items.map((item)=><div key={item.id} className="stock-report-row"><strong>{item.partName}</strong><span>{money.format(item.costPrice)}</span><span>{money.format(item.sellingPrice)}</span><span>{money.format(item.margin)}</span><span>{item.marginPercent.toFixed(1)}%</span></div>)}</div></section>
      </div>
    );
  }

  return <Empty>Stock section not available.</Empty>;
};

// Shared modals are rendered outside section return through wrapper below.
export const StockManagementSectionWithModals = StockManagementSection;

export default StockManagementSection;
