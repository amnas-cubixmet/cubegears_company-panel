import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus, Save, Boxes } from 'lucide-react';
import { stockManagementService } from '../../services/stockManagement.service';
import { expenseService } from '../../services/expense.service';
import { stockCategories } from '../../mock/stockManagement.mock';
import '../../styles/stock-management.css';
import '../../styles/stock-add-item.css';

const initialForm = {
  partName: '',
  sku: '',
  barcode: '',
  category: 'Engine Parts',
  brand: '',
  compatibleVehicle: '',
  unit: 'Piece',
  costPrice: '',
  sellingPrice: '',
  tax: '18',
  onHand: '0',
  reserved: '0',
  minimumStock: '5',
  reorderLevel: '8',
  location: '',
  supplier: '',
  discountLimit: '10',
  status: 'Active'
};

export const AddStockItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('existing');
  const [existingForm, setExistingForm] = useState({
    itemId: '',
    quantity: '1',
    supplier: '',
    invoiceNo: '',
    notes: '',
    purchaseCost: '',
    tax: '18',
    paymentMethod: 'Bank Transfer',
    addToExpenses: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      stockManagementService.getSuppliers(),
      stockManagementService.getItems()
    ])
      .then(([supplierData, itemData]) => {
        setSuppliers(Array.isArray(supplierData) ? supplierData : []);
        setItems(Array.isArray(itemData) ? itemData : []);
      })
      .catch(() => {
        setSuppliers([]);
        setItems([]);
      });
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const selectedExistingItem = items.find((entry) => entry.id === existingForm.itemId);
  const existingBaseAmount = Number(existingForm.quantity || 0) * Number(existingForm.purchaseCost || 0);
  const existingTaxAmount = existingBaseAmount * Number(existingForm.tax || 0) / 100;
  const existingExpenseTotal = existingBaseAmount + existingTaxAmount;

  const createStockExpense = async ({ title, amount, taxAmount, vendor, referenceNo, paymentMethod, notes }) => {
    if (Number(amount || 0) <= 0) return null;
    return expenseService.createExpense({
      title,
      category: 'Stock Purchase',
      amount: Number(amount || 0),
      taxAmount: Number(taxAmount || 0),
      expenseDate: new Date().toISOString().split('T')[0],
      vendor: vendor || 'Stock Supplier',
      paymentMethod: paymentMethod || 'Bank Transfer',
      referenceNo: referenceNo || '',
      status: 'approved',
      notes: notes || 'Created automatically from Stock Management.',
      receiptName: ''
    });
  };

  const submitExisting = async (event) => {
    event.preventDefault();
    const item = items.find((entry) => entry.id === existingForm.itemId);
    if (!item) {
      setError('Select an existing product.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await stockManagementService.stockIn({
        itemId: item.id,
        partName: item.partName,
        sku: item.sku,
        quantity: existingForm.quantity,
        supplier: existingForm.supplier,
        invoiceNo: existingForm.invoiceNo,
        notes: existingForm.notes,
        unitCost: Number(existingForm.purchaseCost || 0)
      });

      if (existingForm.addToExpenses && existingExpenseTotal > 0) {
        await createStockExpense({
          title: `Stock Purchase · ${item.partName}`,
          amount: existingExpenseTotal,
          taxAmount: existingTaxAmount,
          vendor: existingForm.supplier,
          referenceNo: existingForm.invoiceNo,
          paymentMethod: existingForm.paymentMethod,
          notes: `${existingForm.quantity} ${item.unit || 'unit'} × ₹${Number(existingForm.purchaseCost || 0).toFixed(2)}. ${existingForm.notes || ''}`.trim()
        });
      }

      navigate('/stock/items');
    } catch (err) {
      setError(err?.message || 'Unable to add stock quantity.');
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const created = await stockManagementService.createItem(form);

      const openingBase = Number(form.onHand || 0) * Number(form.costPrice || 0);
      const openingTax = openingBase * Number(form.tax || 0) / 100;
      const openingTotal = openingBase + openingTax;

      if (openingTotal > 0) {
        await createStockExpense({
          title: `Opening Stock Purchase · ${created?.partName || form.partName}`,
          amount: openingTotal,
          taxAmount: openingTax,
          vendor: form.supplier,
          referenceNo: created?.sku || form.sku,
          paymentMethod: 'Bank Transfer',
          notes: `Opening stock: ${form.onHand} ${form.unit} × ₹${Number(form.costPrice || 0).toFixed(2)}.`
        });
      }

      navigate('/stock/items');
    } catch (err) {
      setError(err?.message || 'Unable to add stock item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stock-add-page cg-stock">
      <header className="stock-add-header">
        <button type="button" className="stock-add-back" onClick={() => navigate('/stock/items')}>
          <ArrowLeft size={15} />
        </button>
        <div>
          <span>Inventory</span>
          <h1>Add Stock Item</h1>
          <p>Create a new spare part, oil, consumable or workshop inventory item.</p>
        </div>
      </header>

      <div className="stock-add-mode-switch">
        <button
          type="button"
          className={mode === 'existing' ? 'is-active' : ''}
          onClick={() => { setMode('existing'); setError(''); }}
        >
          <Boxes size={14} />
          Existing Product
        </button>
        <button
          type="button"
          className={mode === 'new' ? 'is-active' : ''}
          onClick={() => { setMode('new'); setError(''); }}
        >
          <PackagePlus size={14} />
          New Product
        </button>
      </div>

      {mode === 'existing' ? (
        <form className="stock-add-form" onSubmit={submitExisting}>
          {error ? <div className="stock-form-error">{error}</div> : null}

          <section className="stock-add-section">
            <div className="stock-add-section-title">
              <Boxes size={16} />
              <div>
                <h2>Add Stock to Existing Product</h2>
                <p>Select an existing inventory item and increase its current stock quantity.</p>
              </div>
            </div>

            <div className="stock-add-grid">
              <label className="stock-add-wide">
                Existing Product *
                <select
                  required
                  value={existingForm.itemId}
                  onChange={(e)=>{
                    const nextId=e.target.value;
                    const nextItem=items.find((entry)=>entry.id===nextId);
                    setExistingForm({
                      ...existingForm,
                      itemId:nextId,
                      purchaseCost:nextItem?.costPrice != null ? String(nextItem.costPrice) : existingForm.purchaseCost
                    });
                  }}
                >
                  <option value="">Select product</option>
                  {items.map((item)=>(
                    <option key={item.id} value={item.id}>
                      {item.partName} · {item.sku} · Current {item.onHand}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity to Add *
                <input
                  required
                  type="number"
                  min="1"
                  value={existingForm.quantity}
                  onChange={(e)=>setExistingForm({...existingForm,quantity:e.target.value})}
                />
              </label>

              <label>
                Supplier
                <select
                  value={existingForm.supplier}
                  onChange={(e)=>setExistingForm({...existingForm,supplier:e.target.value})}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}
                </select>
              </label>

              <label>
                Purchase Invoice No
                <input
                  value={existingForm.invoiceNo}
                  onChange={(e)=>setExistingForm({...existingForm,invoiceNo:e.target.value})}
                  placeholder="INV-2026-001"
                />
              </label>

              <label>
                Purchase Cost / Unit *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={existingForm.purchaseCost}
                  onChange={(e)=>setExistingForm({...existingForm,purchaseCost:e.target.value})}
                  placeholder="0.00"
                />
              </label>

              <label>
                Tax / GST %
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={existingForm.tax}
                  onChange={(e)=>setExistingForm({...existingForm,tax:e.target.value})}
                />
              </label>

              <label>
                Payment Method
                <select
                  value={existingForm.paymentMethod}
                  onChange={(e)=>setExistingForm({...existingForm,paymentMethod:e.target.value})}
                >
                  {['Cash','UPI','Bank Transfer','Company Card','Cheque'].map((method)=><option key={method}>{method}</option>)}
                </select>
              </label>

              <label className="stock-add-expense-toggle">
                <input
                  type="checkbox"
                  checked={existingForm.addToExpenses}
                  onChange={(e)=>setExistingForm({...existingForm,addToExpenses:e.target.checked})}
                />
                Add purchase value to Company Expenses
              </label>

              <div className="stock-add-wide stock-purchase-summary">
                <span>Purchase Value</span><strong>₹{existingBaseAmount.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
                <span>GST</span><strong>₹{existingTaxAmount.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
                <span>Total Expense</span><strong>₹{existingExpenseTotal.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
              </div>

              <label className="stock-add-wide">
                Notes
                <textarea
                  rows="4"
                  value={existingForm.notes}
                  onChange={(e)=>setExistingForm({...existingForm,notes:e.target.value})}
                  placeholder="Optional stock-in note"
                />
              </label>
            </div>
          </section>

          <div className="stock-add-actions">
            <button type="button" className="stock-link-button" onClick={() => navigate('/stock/items')}>Cancel</button>
            <button type="submit" className="stock-primary-button" disabled={saving}>
              <Save size={14} />
              {saving ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      ) : (
      <form className="stock-add-form" onSubmit={submit}>
        {error ? <div className="stock-form-error">{error}</div> : null}

        <section className="stock-add-section">
          <div className="stock-add-section-title">
            <PackagePlus size={16} />
            <div>
              <h2>Product Information</h2>
              <p>Basic item identity, category, brand and compatibility.</p>
            </div>
          </div>

          <div className="stock-add-grid">
            <label>Part Name *<input required value={form.partName} onChange={(e)=>update('partName',e.target.value)} placeholder="Brake Pad Front"/></label>
            <label>Part Number / SKU *<input required value={form.sku} onChange={(e)=>update('sku',e.target.value)} placeholder="BP-001"/></label>
            <label>Barcode<input value={form.barcode} onChange={(e)=>update('barcode',e.target.value)} placeholder="Scan or enter barcode"/></label>
            <label>Category<select value={form.category} onChange={(e)=>update('category',e.target.value)}>{stockCategories.map((category)=><option key={category.id}>{category.name}</option>)}</select></label>
            <label>Brand<input value={form.brand} onChange={(e)=>update('brand',e.target.value)} placeholder="Bosch"/></label>
            <label>Compatible Vehicle<input value={form.compatibleVehicle} onChange={(e)=>update('compatibleVehicle',e.target.value)} placeholder="Toyota / Hyundai / Universal"/></label>
            <label>Unit<select value={form.unit} onChange={(e)=>update('unit',e.target.value)}>{['Piece','Set','Pair','Litre','Can','Box'].map((unit)=><option key={unit}>{unit}</option>)}</select></label>
            <label>Status<select value={form.status} onChange={(e)=>update('status',e.target.value)}><option>Active</option><option>Archived</option></select></label>
          </div>
        </section>

        <section className="stock-add-section">
          <div className="stock-add-section-title">
            <div>
              <h2>Stock & Location</h2>
              <p>Opening quantity, reorder limits and rack or bin location.</p>
            </div>
          </div>

          <div className="stock-add-grid">
            <label>On Hand<input type="number" min="0" value={form.onHand} onChange={(e)=>update('onHand',e.target.value)}/></label>
            <label>Reserved<input type="number" min="0" value={form.reserved} onChange={(e)=>update('reserved',e.target.value)}/></label>
            <label>Minimum Stock<input type="number" min="0" value={form.minimumStock} onChange={(e)=>update('minimumStock',e.target.value)}/></label>
            <label>Reorder Level<input type="number" min="0" value={form.reorderLevel} onChange={(e)=>update('reorderLevel',e.target.value)}/></label>
            <label>Rack / Bin<input value={form.location} onChange={(e)=>update('location',e.target.value)} placeholder="Rack A / Bin 04"/></label>
            <label>Supplier<select value={form.supplier} onChange={(e)=>update('supplier',e.target.value)}><option value="">Select supplier</option>{suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}</select></label>
          </div>
        </section>

        <section className="stock-add-section">
          <div className="stock-add-section-title">
            <div>
              <h2>Pricing</h2>
              <p>Purchase cost, selling price, tax and discount controls.</p>
            </div>
          </div>

          <div className="stock-add-grid">
            <label>Purchase Cost<input type="number" min="0" value={form.costPrice} onChange={(e)=>update('costPrice',e.target.value)} placeholder="0"/></label>
            <label>Selling Price<input type="number" min="0" value={form.sellingPrice} onChange={(e)=>update('sellingPrice',e.target.value)} placeholder="0"/></label>
            <label>Tax %<input type="number" min="0" value={form.tax} onChange={(e)=>update('tax',e.target.value)}/></label>
            <label>Discount Limit %<input type="number" min="0" value={form.discountLimit} onChange={(e)=>update('discountLimit',e.target.value)}/></label>
          </div>
        </section>

        <div className="stock-add-actions">
          <button type="button" className="stock-link-button" onClick={() => navigate('/stock/items')}>Cancel</button>
          <button type="submit" className="stock-primary-button" disabled={saving}>
            <Save size={14} />
            {saving ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default AddStockItem;
