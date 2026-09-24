import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Clock3, FileText, PackageSearch, PackagePlus, Plus, ReceiptText, Trash2, Wrench } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { JobPartsWorkflow } from './JobPartsWorkflow';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const entryTypes = ['Part', 'Consumable', 'Outside Work', 'Labour', 'Other'];

const blankEntry = () => ({
  type: 'Part',
  description: '',
  code: '',
  qty: '1',
  costPrice: '',
  supplier: '',
  notes: ''
});

const normalizeEntries = (job) => {
  if (Array.isArray(job?.costEntries)) return job.costEntries;

  const parts = (job?.partsUsed || []).map((item) => ({
    id: item.id || `PART-${Math.random()}`,
    type: 'Part',
    description: item.name || item.description || 'Part',
    code: item.sku || item.partId || '',
    qty: Number(item.qty || 1),
    costPrice: Number(item.costPrice ?? item.purchasePrice ?? item.unitPrice ?? 0),
    supplier: item.supplier || '',
    notes: item.notes || '',
    createdAt: item.createdAt || new Date().toISOString()
  }));

  const outside = (job?.outsidePurchases || []).map((item) => ({
    id: item.id || `OUT-${Math.random()}`,
    type: 'Outside Work',
    description: item.partName || item.name || 'Outside purchase',
    code: item.billNo || '',
    qty: Number(item.qty || 1),
    costPrice: Number(item.costPrice || item.cost || 0),
    supplier: item.supplier || '',
    notes: item.notes || '',
    createdAt: item.createdAt || new Date().toISOString()
  }));

  return [...parts, ...outside];
};

export function JobCardWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entry, setEntry] = useState(blankEntry());
  const [workNote, setWorkNote] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobById(id);
      setJob(data || null);
    } catch (e) {
      setError(e?.message || 'Unable to load job card.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const section = location.pathname.split('/').filter(Boolean).at(-1);
    const routeTabs = ['parts', 'costs', 'work', 'photos', 'history'];
    setActiveTab(routeTabs.includes(section) ? section : 'overview');
  }, [location.pathname]);

  const entries = useMemo(() => normalizeEntries(job), [job]);
  const totalCost = useMemo(() => entries.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.costPrice || 0)), 0), [entries]);
  const workUpdates = job?.workUpdates || [];

  const persistEntries = async (nextEntries) => {
    setSaving(true);
    try {
      const updated = await jobService.updateJob(job.id, { costEntries: nextEntries });
      setJob(updated || { ...job, costEntries: nextEntries });
    } catch (e) {
      setError(e?.message || 'Could not save job cost.');
    } finally {
      setSaving(false);
    }
  };

  const addEntry = async (event) => {
    event.preventDefault();
    if (!entry.description.trim()) return setError('Item / work description is required.');
    const costPrice = Number(entry.costPrice || 0);
    const qty = Number(entry.qty || 1);
    const record = {
      id: `COST-${Date.now()}`,
      ...entry,
      qty,
      costPrice,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    await persistEntries([record, ...entries]);
    setEntry(blankEntry());
    setShowEntryForm(false);
    setError('');
  };

  const removeEntry = async (entryId) => {
    if (!window.confirm('Remove this cost entry?')) return;
    await persistEntries(entries.filter((item) => item.id !== entryId));
  };

  const addWorkUpdate = async () => {
    if (!workNote.trim()) return;
    setSaving(true);
    try {
      const next = [{ id: `WORK-${Date.now()}`, note: workNote.trim(), createdAt: new Date().toISOString(), createdBy: 'Current User' }, ...workUpdates];
      const updated = await jobService.updateJob(job.id, { workUpdates: next });
      setJob(updated || { ...job, workUpdates: next });
      setWorkNote('');
    } finally {
      setSaving(false);
    }
  };

  const createInvoice = () => {
    try {
      localStorage.setItem('cubixgear:invoice-job-prefill', JSON.stringify({
        jobId: job.id,
        jobNumber: job.jobNumber || job.id,
        customer: {
          name: job.customerName || job.customer?.name || '',
          phone: job.customerPhone || job.customer?.phone || '',
          address: job.customer?.address || ''
        },
        vehicle: {
          registration: job.vehicleReg || job.vehicle?.registration || '',
          makeModel: job.vehicleInfo || job.vehicle?.makeModel || '',
          odometer: job.kilometre || job.odometer || '',
          vin: job.vehicle?.vin || ''
        },
        items: entries.map((item) => ({
          id: `ROW-${item.id}`,
          type: item.type === 'Part' ? 'Outside Purchase' : item.type === 'Consumable' ? 'Consumable' : item.type === 'Labour' ? 'Labour' : item.type === 'Outside Work' ? 'Service' : 'Custom Item',
          description: item.description,
          code: item.code || '',
          qty: Number(item.qty || 1),
          purchasePrice: Number(item.costPrice || 0),
          rate: '',
          discount: 0,
          inventoryId: ''
        }))
      }));
    } catch {
      // The URL still carries the job id for real API implementations.
    }
    navigate(`/invoices/new?kind=invoice&jobId=${encodeURIComponent(job.id)}`);
  };

  if (loading) return <div className="job-simple-state">Loading job card…</div>;
  if (!job) return <div className="job-simple-state">Job card not found.</div>;

  const tabs = [
    ['overview', 'Overview'],
    ['parts', 'Parts Issue'],
    ['costs', 'Costs'],
    ['work', 'Work Updates'],
    ['photos', 'Photos'],
    ['history', 'History']
  ];

  const openTab = (key) => {
    setActiveTab(key);
    navigate(key === 'overview' ? `/jobs/${job.id}` : `/jobs/${job.id}/${key}`);
  };

  return (
    <div className="job-simple-page">
      <header className="job-simple-header">
        <div className="job-simple-title-row">
          <button className="job-icon-button" onClick={() => navigate('/jobs')} aria-label="Back"><ArrowLeft size={18}/></button>
          <div>
            <span className="job-kicker">JOB CARD</span>
            <h1>{job.jobNumber || job.id}</h1>
            <p>{job.vehicleReg || job.vehicle?.registration || 'No registration'} · {job.vehicleInfo || job.vehicle?.makeModel || 'Vehicle'}</p>
          </div>
        </div>
        <div className="job-simple-status-wrap">
          <span className="job-simple-status">{job.status || 'Open'}</span>
          <button className="job-primary-button" onClick={createInvoice}><ReceiptText size={16}/>Create Invoice</button>
        </div>
      </header>

      <section className="job-simple-summary">
        <div><span>Customer</span><strong>{job.customerName || job.customer?.name || 'Walk-in'}</strong></div>
        <div><span>Current Job Cost</span><strong>{money.format(totalCost)}</strong></div>
        <div><span>Cost Entries</span><strong>{entries.length}</strong></div>
        <div><span>Assigned</span><strong>{job.assignedEmployeeName || job.assignedStaff || 'Unassigned'}</strong></div>
      </section>

      <nav className="job-simple-tabs" aria-label="Job card sections">
        {tabs.map(([key, label]) => <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => openTab(key)}>{label}</button>)}
      </nav>

      {error && <div className="job-simple-error">{error}</div>}

      {activeTab === 'overview' && <section className="job-simple-grid">
        <article className="job-simple-card">
          <h2>Customer Complaint</h2>
          <p>{job.complaint || job.customerComplaint || job.notes || 'No complaint added.'}</p>
        </article>
        <article className="job-simple-card">
          <div className="job-section-head"><div><span className="job-kicker">RECENT COSTS</span><h2>Parts & Expenses</h2></div><button className="job-secondary-button" onClick={() => { setActiveTab('costs'); setShowEntryForm(true); }}><Plus size={15}/>Add</button></div>
          <div className="job-cost-list compact">{entries.slice(0, 4).map((item) => <CostRow key={item.id} item={item} />)}{!entries.length && <Empty text="No parts or expenses yet."/>}</div>
        </article>
        <article className="job-simple-card">
          <div className="job-section-head"><div><span className="job-kicker">WORK</span><h2>Latest Updates</h2></div><button className="job-secondary-button" onClick={() => setActiveTab('work')}><Wrench size={15}/>Update</button></div>
          {workUpdates.slice(0, 3).map((item) => <div className="job-work-row" key={item.id}><strong>{item.note || item.description}</strong><span>{new Date(item.createdAt || Date.now()).toLocaleString('en-IN')}</span></div>)}
          {!workUpdates.length && <Empty text="No work updates yet."/>}
        </article>
      </section>}

      {activeTab === 'parts' && (
        <JobPartsWorkflow
          jobId={job.id}
          assignedTo={job.assignedEmployeeName || job.assignedStaff || ''}
          onJobUpdated={load}
        />
      )}

      {activeTab === 'costs' && <section className="job-simple-card">
        <div className="job-section-head"><div><span className="job-kicker">INTERNAL COST LEDGER</span><h2>Parts & Expenses</h2><p>Keep adding costs until the vehicle is ready. This is internal workshop cost, not the customer invoice.</p></div><button className="job-primary-button" onClick={() => setShowEntryForm((value) => !value)}><PackagePlus size={16}/>{showEntryForm ? 'Close' : 'Add Part / Expense'}</button></div>
        {showEntryForm && <form className="job-cost-form" onSubmit={addEntry}>
          <label>Type<select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}>{entryTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="wide">Item / Work Description<input autoFocus value={entry.description} onChange={(e) => setEntry({ ...entry, description: e.target.value })} placeholder="e.g. Engine mount"/></label>
          <label>Part No / Code<input value={entry.code} onChange={(e) => setEntry({ ...entry, code: e.target.value })} placeholder="Optional"/></label>
          <label>Qty<input inputMode="decimal" value={entry.qty} onChange={(e) => setEntry({ ...entry, qty: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
          <label>Cost Price ₹<input inputMode="decimal" value={entry.costPrice} onChange={(e) => setEntry({ ...entry, costPrice: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Enter cost"/></label>
          <label>Supplier<input value={entry.supplier} onChange={(e) => setEntry({ ...entry, supplier: e.target.value })} placeholder="Optional"/></label>
          <label className="wide">Notes<input value={entry.notes} onChange={(e) => setEntry({ ...entry, notes: e.target.value })} placeholder="Optional note"/></label>
          <button className="job-primary-button wide" disabled={saving}>{saving ? 'Saving…' : 'Save Entry'}</button>
        </form>}
        <div className="job-cost-total"><span>Total internal job cost</span><strong>{money.format(totalCost)}</strong></div>
        <div className="job-cost-list">{entries.map((item) => <CostRow key={item.id} item={item} onDelete={() => removeEntry(item.id)} />)}{!entries.length && <Empty text="No cost entries. Add the first part or expense."/>}</div>
      </section>}

      {activeTab === 'work' && <section className="job-simple-card">
        <div className="job-section-head"><div><span className="job-kicker">WORK LOG</span><h2>Work Updates</h2></div></div>
        <div className="job-work-compose"><textarea value={workNote} onChange={(e) => setWorkNote(e.target.value)} placeholder="What was done on the vehicle?"/><button className="job-primary-button" disabled={!workNote.trim() || saving} onClick={addWorkUpdate}><Plus size={16}/>Add Update</button></div>
        <div>{workUpdates.map((item) => <div className="job-work-row" key={item.id}><strong>{item.note || item.description}</strong><span>{item.createdBy || 'Staff'} · {new Date(item.createdAt || Date.now()).toLocaleString('en-IN')}</span></div>)}{!workUpdates.length && <Empty text="No work updates yet."/>}</div>
      </section>}

      {activeTab === 'photos' && <section className="job-simple-card"><div className="job-section-head"><div><span className="job-kicker">PHOTOS</span><h2>Job Photos</h2><p>Inspection, during repair, after repair and delivery photos.</p></div><button className="job-primary-button" onClick={() => navigate(`/jobs/${job.id}/photos`)}><Camera size={16}/>Open Photos</button></div><Empty text="Use the job photo flow to capture or upload vehicle photos."/></section>}

      {activeTab === 'history' && <section className="job-simple-card"><div className="job-section-head"><div><span className="job-kicker">HISTORY</span><h2>Job Timeline</h2></div></div><div className="job-work-row"><strong>Job card opened</strong><span>{job.createdDate || job.createdAt || '—'}</span></div>{entries.map((item) => <div className="job-work-row" key={`h-${item.id}`}><strong>{item.type}: {item.description}</strong><span>{new Date(item.createdAt || Date.now()).toLocaleString('en-IN')}</span></div>)}</section>}

      <div className="job-mobile-actions">
        <button onClick={() => openTab('parts')}><PackageSearch size={18}/><span>Parts</span></button>
        <button onClick={() => openTab('work')}><Wrench size={18}/><span>Work</span></button>
        <button onClick={() => openTab('photos')}><Camera size={18}/><span>Photo</span></button>
        <button onClick={createInvoice}><FileText size={18}/><span>Invoice</span></button>
      </div>
    </div>
  );
}

function CostRow({ item, onDelete }) {
  const total = Number(item.qty || 0) * Number(item.costPrice || 0);
  return <div className="job-cost-row"><div><span className="job-cost-type">{item.type}</span><strong>{item.description}</strong><small>{item.code ? `${item.code} · ` : ''}{item.supplier || 'No supplier'} · {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}</small></div><div className="job-cost-value"><span>{item.qty || 1} × {money.format(item.costPrice || 0)}</span><strong>{money.format(total)}</strong></div>{onDelete && <button className="job-icon-button danger" onClick={onDelete} aria-label="Delete"><Trash2 size={15}/></button>}</div>;
}

function Empty({ text }) {
  return <div className="job-empty"><Clock3 size={17}/><span>{text}</span></div>;
}

export default JobCardWorkspace;
