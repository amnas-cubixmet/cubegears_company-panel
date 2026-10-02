import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  Barcode,
  Boxes,
  Edit3,
  Eye,
  IndianRupee,
  Layers3,
  PackageCheck,
  Plus,
  Search,
  Tag,
  Trash2
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import '../../styles/inventory-management.css';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  category: 'Consumables',
  brand: '',
  compatibleVehicle: '',
  unit: 'Piece',
  cost: '',
  price: '',
  tax: '18',
  onHand: '0',
  reserved: '0',
  minimum: '5',
  reorderLevel: '8',
  rack: '',
  supplier: '',
  discountLimit: '10',
  status: 'Active'
};

const statusFor = (item) => {
  if (Number(item.onHand || 0) <= 0) return { label: 'Out of Stock', tone: 'danger' };
  if (Number(item.available || 0) <= Number(item.minimum || 0)) return { label: 'Low Stock', tone: 'warning' };
  if (String(item.status).toLowerCase() === 'archived') return { label: 'Archived', tone: 'muted' };
  return { label: 'In Stock', tone: 'success' };
};

const Metric = ({ label, value, icon: Icon, tone = 'primary' }) => (
  <article className="inventory-metric-card">
    <div className="inventory-metric-card__top">
      <span>{label}</span>
      <i className={`is-${tone}`}><Icon size={16}/></i>
    </div>
    <strong>{value}</strong>
  </article>
);

const Field = ({ label, children, wide = false }) => (
  <label className={wide ? 'inventory-field is-wide' : 'inventory-field'}>
    <span>{label}</span>
    {children}
  </label>
);

const InventoryForm = ({
  title,
  values,
  setValues,
  categories,
  suppliers,
  onSubmit,
  onCancel,
  submitting
}) => (
  <div className="inventory-form-page cg-inventory">
    <header className="inventory-form-header">
      <div>
        <h1>{title}</h1>
        <p>Configure item master, pricing, stock thresholds, supplier, barcode and rack/bin.</p>
      </div>
    </header>

    <form className="inventory-form" onSubmit={onSubmit}>
      <section className="inventory-form-section">
        <div className="inventory-section-header">
          <div>
            <h2>Item Information</h2>
            <p>Part identity, classification, brand and vehicle compatibility.</p>
          </div>
        </div>

        <div className="inventory-form-grid">
          <Field label="Item / Part Name" wide>
            <input required value={values.name} onChange={(e)=>setValues({...values,name:e.target.value})} placeholder="e.g. Front Brake Pad Set"/>
          </Field>

          <Field label="SKU / Part Number">
            <input required value={values.sku} onChange={(e)=>setValues({...values,sku:e.target.value.toUpperCase()})} placeholder="BRK-PAD-001"/>
          </Field>

          <Field label="Barcode">
            <input value={values.barcode} onChange={(e)=>setValues({...values,barcode:e.target.value})}/>
          </Field>

          <Field label="Category">
            <select value={values.category} onChange={(e)=>setValues({...values,category:e.target.value})}>
              {categories.map((category)=><option key={category.id}>{category.name}</option>)}
            </select>
          </Field>

          <Field label="Brand">
            <input value={values.brand} onChange={(e)=>setValues({...values,brand:e.target.value})}/>
          </Field>

          <Field label="Compatible Vehicle" wide>
            <input value={values.compatibleVehicle} onChange={(e)=>setValues({...values,compatibleVehicle:e.target.value})} placeholder="Universal / Toyota / Hyundai..."/>
          </Field>

          <Field label="Unit">
            <select value={values.unit} onChange={(e)=>setValues({...values,unit:e.target.value})}>
              {['Piece','Set','Pair','Litre','Can','Box'].map((unit)=><option key={unit}>{unit}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select value={values.status} onChange={(e)=>setValues({...values,status:e.target.value})}>
              <option>Active</option>
              <option>Archived</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="inventory-form-section">
        <div className="inventory-section-header">
          <div>
            <h2>Pricing</h2>
            <p>Purchase cost, selling price, tax and workshop discount control.</p>
          </div>
        </div>

        <div className="inventory-form-grid">
          <Field label="Purchase Cost">
            <input type="number" min="0" value={values.cost} onChange={(e)=>setValues({...values,cost:e.target.value})}/>
          </Field>

          <Field label="Selling Price">
            <input type="number" min="0" value={values.price} onChange={(e)=>setValues({...values,price:e.target.value})}/>
          </Field>

          <Field label="Tax %">
            <input type="number" min="0" value={values.tax} onChange={(e)=>setValues({...values,tax:e.target.value})}/>
          </Field>

          <Field label="Discount Limit %">
            <input type="number" min="0" value={values.discountLimit} onChange={(e)=>setValues({...values,discountLimit:e.target.value})}/>
          </Field>
        </div>
      </section>

      <section className="inventory-form-section">
        <div className="inventory-section-header">
          <div>
            <h2>Stock & Storage</h2>
            <p>Opening stock, reserved quantity, minimum/reorder level, supplier and rack/bin.</p>
          </div>
        </div>

        <div className="inventory-form-grid">
          <Field label="On Hand">
            <input type="number" min="0" value={values.onHand} onChange={(e)=>setValues({...values,onHand:e.target.value})}/>
          </Field>

          <Field label="Reserved">
            <input type="number" min="0" value={values.reserved} onChange={(e)=>setValues({...values,reserved:e.target.value})}/>
          </Field>

          <Field label="Minimum Stock">
            <input type="number" min="0" value={values.minimum} onChange={(e)=>setValues({...values,minimum:e.target.value})}/>
          </Field>

          <Field label="Reorder Level">
            <input type="number" min="0" value={values.reorderLevel} onChange={(e)=>setValues({...values,reorderLevel:e.target.value})}/>
          </Field>

          <Field label="Rack / Bin">
            <input value={values.rack} onChange={(e)=>setValues({...values,rack:e.target.value})} placeholder="A-01 / Shelf B-04"/>
          </Field>

          <Field label="Preferred Supplier">
            <select value={values.supplier} onChange={(e)=>setValues({...values,supplier:e.target.value})}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier)=><option key={supplier.id}>{supplier.name}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <div className="inventory-form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="is-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Item'}</button>
      </div>
    </form>
  </div>
);

export const InventoryList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const isNew = location.pathname === '/inventory/new';
  const isEdit = Boolean(id && location.pathname.endsWith('/edit'));
  const isDetail = Boolean(id && !isEdit && location.pathname !== '/inventory');

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [itemRows, categoryRows, supplierRows] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getInventoryCategories(),
        inventoryService.getInventorySuppliers()
      ]);
      setItems(itemRows);
      setCategories(categoryRows);
      setSuppliers(supplierRows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (isNew && categories.length && !categories.some((category)=>category.name===form.category)) {
      setForm((current)=>({...current,category:categories[0].name}));
    }
  }, [isNew, categories, form.category]);

  useEffect(() => {
    if (!isEdit || !id || !items.length) return;
    const item = items.find((row)=>row.id===id);
    if (!item) return;
    setForm({
      name: item.name || '',
      sku: item.sku || '',
      barcode: item.barcode || '',
      category: item.category || '',
      brand: item.brand || '',
      compatibleVehicle: item.compatibleVehicle || '',
      unit: item.unit || 'Piece',
      cost: item.cost ?? '',
      price: item.price ?? '',
      tax: item.tax ?? 18,
      onHand: item.onHand ?? 0,
      reserved: item.reserved ?? 0,
      minimum: item.minimum ?? 0,
      reorderLevel: item.reorderLevel ?? 0,
      rack: item.rack || '',
      supplier: item.supplier || '',
      discountLimit: item.discountLimit ?? 0,
      status: item.status || 'Active'
    });
  }, [isEdit, id, items]);

  const selectedItem = useMemo(
    () => items.find((item)=>item.id===id) || null,
    [items, id]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const qMatch = !q || [
        item.name,
        item.sku,
        item.barcode,
        item.category,
        item.brand,
        item.compatibleVehicle,
        item.rack,
        item.supplier
      ].some((value)=>String(value || '').toLowerCase().includes(q));
      const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
      const statusMatch = statusFilter === 'All' || String(item.status).toLowerCase() === statusFilter.toLowerCase();
      return qMatch && categoryMatch && statusMatch;
    });
  }, [items, query, categoryFilter, statusFilter]);

  const lowStockItems = useMemo(
    () => items.filter((item)=>Number(item.onHand || 0)>0 && Number(item.available || 0)<=Number(item.minimum || 0)),
    [items]
  );

  const outOfStockItems = useMemo(
    () => items.filter((item)=>Number(item.onHand || 0)<=0),
    [items]
  );

  const stockValue = useMemo(
    () => items.reduce((sum,item)=>sum+(Number(item.onHand || 0)*Number(item.cost || 0)),0),
    [items]
  );

  const marginValue = useMemo(
    () => items.reduce((sum,item)=>sum+((Number(item.price || 0)-Number(item.cost || 0))*Math.max(0,Number(item.onHand || 0))),0),
    [items]
  );

  const saveItem = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        cost: Number(form.cost || 0),
        price: Number(form.price || 0),
        tax: Number(form.tax || 0),
        onHand: Number(form.onHand || 0),
        reserved: Number(form.reserved || 0),
        minimum: Number(form.minimum || 0),
        reorderLevel: Number(form.reorderLevel || 0),
        discountLimit: Number(form.discountLimit || 0)
      };

      if (isEdit && id) {
        await inventoryService.updateInventoryItem(id,payload);
        navigate(`/inventory/${id}`);
      } else {
        const created = await inventoryService.createInventoryItem(payload);
        navigate(created?.id ? `/inventory/${created.id}` : '/inventory');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete inventory item ${item.name}?`)) return;
    await inventoryService.deleteInventoryItem(item.id);
    if (isDetail) navigate('/inventory');
    else await load();
  };

  if (loading) return <div className="inventory-empty">Loading inventory...</div>;

  if (isNew) {
    return (
      <InventoryForm
        title="Add Inventory Item"
        values={form}
        setValues={setForm}
        categories={categories}
        suppliers={suppliers}
        onSubmit={saveItem}
        onCancel={()=>navigate('/inventory')}
        submitting={submitting}
      />
    );
  }

  if (isEdit) {
    if (!selectedItem) return <div className="inventory-empty">Inventory item not found.</div>;
    return (
      <InventoryForm
        title="Edit Inventory Item"
        values={form}
        setValues={setForm}
        categories={categories}
        suppliers={suppliers}
        onSubmit={saveItem}
        onCancel={()=>navigate(`/inventory/${id}`)}
        submitting={submitting}
      />
    );
  }

  if (isDetail) {
    if (!selectedItem) return <div className="inventory-empty">Inventory item not found.</div>;
    const margin = Number(selectedItem.price || 0)-Number(selectedItem.cost || 0);
    const marginPercent = Number(selectedItem.price || 0)
      ? (margin/Number(selectedItem.price))*100
      : 0;
    const status = statusFor(selectedItem);

    return (
      <div className="inventory-management-page inventory-detail-page cg-inventory">
        <header className="inventory-detail-header">
          <div>
            <span>{selectedItem.sku}</span>
            <h1>{selectedItem.name}</h1>
            <p>{selectedItem.category} · {selectedItem.brand || 'No brand'}</p>
          </div>

          <div className="inventory-detail-actions">
            <button onClick={()=>navigate(`/inventory/${selectedItem.id}/edit`)}><Edit3 size={14}/> Edit</button>
            <button className="is-danger" onClick={()=>removeItem(selectedItem)}><Trash2 size={14}/> Delete</button>
          </div>
        </header>

        <div className="inventory-detail-kpis">
          <div><Boxes size={16}/><span>On Hand</span><strong>{selectedItem.onHand} {selectedItem.unit}</strong></div>
          <div><PackageCheck size={16}/><span>Available</span><strong>{selectedItem.available}</strong></div>
          <div><IndianRupee size={16}/><span>Stock Value</span><strong>{money.format(Number(selectedItem.onHand || 0)*Number(selectedItem.cost || 0))}</strong></div>
          <div><Tag size={16}/><span>Margin</span><strong>{money.format(margin)} · {marginPercent.toFixed(1)}%</strong></div>
        </div>

        <div className="inventory-two-column">
          <section className="inventory-panel">
            <div className="inventory-section-header">
              <div><h2>Item Master</h2><p>SKU, barcode, category, brand and compatible vehicle.</p></div>
              <Barcode size={18}/>
            </div>

            <div className="inventory-info-grid">
              <div><span>SKU / Part Number</span><strong>{selectedItem.sku}</strong></div>
              <div><span>Barcode</span><strong>{selectedItem.barcode || '—'}</strong></div>
              <div><span>Category</span><strong>{selectedItem.category}</strong></div>
              <div><span>Brand</span><strong>{selectedItem.brand || '—'}</strong></div>
              <div><span>Compatible Vehicle</span><strong>{selectedItem.compatibleVehicle || 'Universal'}</strong></div>
              <div><span>Unit</span><strong>{selectedItem.unit}</strong></div>
            </div>
          </section>

          <section className="inventory-panel">
            <div className="inventory-section-header">
              <div><h2>Stock & Storage</h2><p>Availability, reorder control, supplier and rack/bin.</p></div>
              <Boxes size={18}/>
            </div>

            <div className="inventory-info-grid">
              <div><span>On Hand</span><strong>{selectedItem.onHand}</strong></div>
              <div><span>Reserved</span><strong>{selectedItem.reserved}</strong></div>
              <div><span>Available</span><strong>{selectedItem.available}</strong></div>
              <div><span>Minimum</span><strong>{selectedItem.minimum}</strong></div>
              <div><span>Reorder Level</span><strong>{selectedItem.reorderLevel}</strong></div>
              <div><span>Rack / Bin</span><strong>{selectedItem.rack || '—'}</strong></div>
              <div><span>Supplier</span><strong>{selectedItem.supplier || '—'}</strong></div>
              <div><span>Status</span><strong className={`inventory-inline-status is-${status.tone}`}>{status.label}</strong></div>
            </div>
          </section>

          <section className="inventory-panel inventory-wide-panel">
            <div className="inventory-section-header">
              <div><h2>Pricing</h2><p>Purchase cost, selling price, tax and discount control.</p></div>
              <IndianRupee size={18}/>
            </div>

            <div className="inventory-pricing-grid">
              <div><span>Purchase Cost</span><strong>{money.format(selectedItem.cost)}</strong></div>
              <div><span>Selling Price</span><strong>{money.format(selectedItem.price)}</strong></div>
              <div><span>Margin</span><strong>{money.format(margin)}</strong></div>
              <div><span>Margin %</span><strong>{marginPercent.toFixed(1)}%</strong></div>
              <div><span>Tax</span><strong>{selectedItem.tax}%</strong></div>
              <div><span>Discount Limit</span><strong>{selectedItem.discountLimit}%</strong></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-management-page cg-inventory inventory-dashboard">
      <header className="inventory-page-header inventory-dashboard-hero">
        <div>
          <span className="inventory-dashboard-eyebrow">Inventory Control</span>
          <h1>Inventory Catalog</h1>
          <p>Master data for spare parts, consumables, pricing, reorder levels, suppliers and storage locations.</p>
        </div>

        <button className="inventory-primary-button" onClick={()=>navigate('/inventory/new')}>
          <Plus size={15}/> Add Item
        </button>
      </header>

      <div className="inventory-metric-grid inventory-dashboard-kpis">
        <Metric label="Total Items" value={items.length} icon={Boxes}/>
        <Metric label="Stock Value" value={money.format(stockValue)} icon={IndianRupee}/>
        <Metric label="Low Stock" value={lowStockItems.length} icon={AlertTriangle} tone="warning"/>
        <Metric label="Out of Stock" value={outOfStockItems.length} icon={Archive} tone="danger"/>
        <Metric label="Potential Margin" value={money.format(marginValue)} icon={Tag} tone="success"/>
      </div>

      <nav className="inventory-view-tabs inventory-dashboard-tabs scroll-hidden">
        {[
          ['overview','Overview'],
          ['items','All Items'],
          ['low-stock','Low Stock'],
          ['categories','Categories']
        ].map(([key,label])=>(
          <button key={key} className={activeView===key?'is-active':''} onClick={()=>setActiveView(key)}>{label}</button>
        ))}
      </nav>

      {activeView === 'overview' ? (
        <div className="inventory-two-column">
          <section className="inventory-panel">
            <div className="inventory-section-header">
              <div><h2>Low Stock Attention</h2><p>Items at or below minimum quantity.</p></div>
            </div>
            <div className="inventory-row-list">
              {lowStockItems.slice(0,6).map((item)=>(
                <button key={item.id} className="inventory-data-row" onClick={()=>navigate(`/inventory/${item.id}`)}>
                  <div><strong>{item.name}</strong><span>{item.sku} · {item.rack || 'No rack'}</span></div>
                  <b className="is-warning">{item.available} / Min {item.minimum}</b>
                </button>
              ))}
              {!lowStockItems.length ? <div className="inventory-empty">No low-stock items.</div> : null}
            </div>
          </section>

          <section className="inventory-panel">
            <div className="inventory-section-header">
              <div><h2>Out of Stock</h2><p>Zero-stock products requiring replenishment.</p></div>
            </div>
            <div className="inventory-row-list">
              {outOfStockItems.slice(0,6).map((item)=>(
                <button key={item.id} className="inventory-data-row" onClick={()=>navigate(`/inventory/${item.id}`)}>
                  <div><strong>{item.name}</strong><span>{item.sku} · {item.supplier || 'No supplier'}</span></div>
                  <b className="is-danger">0</b>
                </button>
              ))}
              {!outOfStockItems.length ? <div className="inventory-empty">No out-of-stock items.</div> : null}
            </div>
          </section>

          <section className="inventory-panel inventory-wide-panel">
            <div className="inventory-section-header">
              <div><h2>Highest Stock Value</h2><p>Inventory items with the largest capital value.</p></div>
            </div>
            <div className="inventory-row-list">
              {items
                .slice()
                .sort((a,b)=>(Number(b.onHand||0)*Number(b.cost||0))-(Number(a.onHand||0)*Number(a.cost||0)))
                .slice(0,6)
                .map((item)=>(
                  <button key={item.id} className="inventory-data-row" onClick={()=>navigate(`/inventory/${item.id}`)}>
                    <div><strong>{item.name}</strong><span>{item.category} · {item.onHand} {item.unit}</span></div>
                    <b>{money.format(Number(item.onHand || 0)*Number(item.cost || 0))}</b>
                  </button>
                ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeView === 'items' ? (
        <>
          <div className="inventory-filter-bar inventory-dashboard-toolbar">
            <label className="inventory-search">
              <Search size={16}/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search item, SKU, barcode, brand, vehicle, supplier or rack"/>
            </label>

            <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}>
              <option>All</option>
              {categories.map((category)=><option key={category.id}>{category.name}</option>)}
            </select>

            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
          </div>

          <div className="inventory-card-grid">
            {filtered.map((item)=>{
              const status=statusFor(item);
              const margin=Number(item.price || 0)-Number(item.cost || 0);
              return (
                <article
                  key={item.id}
                  className="inventory-card is-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={()=>navigate(`/inventory/${item.id}`)}
                  onKeyDown={(event)=>{
                    if(event.key==='Enter'||event.key===' '){
                      event.preventDefault();
                      navigate(`/inventory/${item.id}`);
                    }
                  }}
                >
                  <div className="inventory-card__head">
                    <div><span>{item.sku}</span><strong>{item.name}</strong></div>
                    <b className={`inventory-status is-${status.tone}`}>{status.label}</b>
                  </div>

                  <div className="inventory-category-chip"><Layers3 size={12}/>{item.category}</div>

                  <div className="inventory-stock-grid">
                    <div><span>On Hand</span><strong>{item.onHand}</strong></div>
                    <div><span>Reserved</span><strong>{item.reserved}</strong></div>
                    <div><span>Available</span><strong>{item.available}</strong></div>
                    <div><span>Minimum</span><strong>{item.minimum}</strong></div>
                  </div>

                  <div className="inventory-price-row">
                    <span>Cost <b>{money.format(item.cost)}</b></span>
                    <span>Selling <b>{money.format(item.price)}</b></span>
                    <span>Margin <b>{money.format(margin)}</b></span>
                  </div>

                  <div className="inventory-meta-row">
                    <span>{item.brand || 'No brand'}</span>
                    <span>{item.rack || 'No rack'}</span>
                    <span>{item.supplier || 'No supplier'}</span>
                  </div>

                  <div className="inventory-card-actions">
                    <button onClick={(event)=>{event.stopPropagation();navigate(`/inventory/${item.id}`);}}><Eye size={13}/> View</button>
                    <button onClick={(event)=>{event.stopPropagation();navigate(`/inventory/${item.id}/edit`);}}><Edit3 size={13}/> Edit</button>
                    <button className="is-danger" onClick={(event)=>{event.stopPropagation();removeItem(item);}}><Trash2 size={13}/> Delete</button>
                  </div>
                </article>
              );
            })}
          </div>

          {!filtered.length ? <div className="inventory-empty">No inventory items matched your filters.</div> : null}
        </>
      ) : null}

      {activeView === 'low-stock' ? (
        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div><h2>Low & Out of Stock</h2><p>Items that need purchase planning or replenishment.</p></div>
          </div>

          <div className="inventory-alert-grid">
            {[...outOfStockItems,...lowStockItems].map((item)=>{
              const status=statusFor(item);
              return (
                <article key={item.id} className="inventory-alert-card">
                  <div>
                    <AlertTriangle size={16}/>
                    <strong>{item.name}</strong>
                    <span>{item.sku} · {item.rack || 'No rack'}</span>
                  </div>
                  <div>
                    <span>Available <b>{item.available}</b></span>
                    <span>Minimum <b>{item.minimum}</b></span>
                    <span>Reorder <b>{item.reorderLevel}</b></span>
                  </div>
                  <button onClick={()=>navigate(`/inventory/${item.id}`)}>{status.label}</button>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeView === 'categories' ? (
        <section className="inventory-panel">
          <div className="inventory-section-header">
            <div><h2>Inventory Categories</h2><p>Item count, stock value and default minimum by category.</p></div>
          </div>

          <div className="inventory-category-grid">
            {categories.map((category)=>{
              const rows=items.filter((item)=>item.category===category.name);
              const value=rows.reduce((sum,item)=>sum+(Number(item.onHand||0)*Number(item.cost||0)),0);
              return (
                <article key={category.id} className="inventory-category-card">
                  <div><Layers3 size={16}/><strong>{category.name}</strong><span>{category.code}</span></div>
                  <div>
                    <span>Items <b>{rows.length}</b></span>
                    <span>Default Min <b>{category.minimumDefault}</b></span>
                    <span>Stock Value <b>{money.format(value)}</b></span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export const InventoryDetails = InventoryList;
export default InventoryList;
