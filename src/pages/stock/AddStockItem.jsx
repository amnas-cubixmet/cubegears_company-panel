import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus, Save, Boxes } from 'lucide-react';
import { stockManagementService } from '../../services/stockManagement.service';
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
    notes: ''
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
        notes: existingForm.notes
      });
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
      await stockManagementService.createItem(form);
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
                  onChange={(e)=>setExistingForm({...existingForm,itemId:e.target.value})}
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
