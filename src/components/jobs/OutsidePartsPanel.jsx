import React, { useEffect, useState } from 'react';
import { PackagePlus, ShoppingCart } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const currency = (number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(number || 0));
const empty = () => ({ partName: '', sku: '', vendor: '', invoiceNo: '', quantity: '1', unitCost: '', sellingPrice: '' });

export function OutsidePartsPanel({ jobId }) {
  const { user } = useAuth();
  const canView = hasPermission(user, 'jobs.view');
  const canEdit = hasPermission(user, 'jobs.edit');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const load = async () => {
    if (!canView) return;
    const data = await apiClient.get(`/job-cards/${jobId}/outside-parts`);
    setItems(data?.items || []);
  };
  useEffect(() => { load().catch((err) => setError(err?.message || 'Could not load outside parts.')); }, [jobId, canView]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    if (busy || !canEdit) return;
    const qty = Number(form.quantity);
    const cost = Number(form.unitCost);
    const price = Number(form.sellingPrice);
    if (!form.partName.trim() || !form.vendor.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost < 0 || !Number.isFinite(price) || price < 0) {
      setError('Enter part, supplier, valid quantity and non-negative costs.'); return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      await apiClient.post(`/job-cards/${jobId}/outside-parts`, { ...form, requestId });
      await load();
      setForm(empty()); setRequestId(crypto.randomUUID()); setOpen(false);
      setMessage('Outside part purchased and used on this job. Inventory stock was not changed.');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not save outside part.');
    } finally { setBusy(false); }
  };
  if (!canView) return null;
  return <section className="rounded-xl border border-cg-border bg-cg-surface p-3 md:p-4" aria-label="Outside purchased parts">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h3 className="text-sm font-semibold text-cg-text">Outside Parts — Buy & Use</h3><p className="text-xs text-cg-muted">Direct purchases for this job, separate from inventory stock.</p></div>
      {canEdit && <button type="button" className="secondary-button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><ShoppingCart size={16}/>{open ? 'Cancel' : 'Buy Outside Part'}</button>}
    </div>
    {message && <p role="status" className="mt-2 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    {open && canEdit && <form onSubmit={save} className="mt-3 grid grid-cols-1 gap-3 rounded-xl bg-cg-surface-2 p-3 sm:grid-cols-2">
      {[
        ['partName','Part Name *','text'], ['sku','SKU / Part Number','text'], ['vendor','Purchased From *','text'],
        ['invoiceNo','Invoice / Bill Number','text'], ['quantity','Quantity *','number'],
        ['unitCost','Purchase Unit Cost ₹ *','number'], ['sellingPrice','Selling Unit Price ₹ *','number']
      ].map(([name,label,type]) => <label key={name} className="flex min-w-0 flex-col gap-1 text-xs font-medium text-cg-text">{label}<input className="cubegears-input w-full" type={type} min={type === 'number' ? name === 'quantity' ? '0.01' : '0' : undefined} step={type === 'number' ? '0.01' : undefined} required={['partName','vendor','quantity','unitCost','sellingPrice'].includes(name)} value={form[name]} onChange={(event) => set(name,event.target.value)}/></label>)}
      <div className="rounded-lg p-2 text-sm text-cg-text">Purchase cost: {currency(Number(form.quantity) * Number(form.unitCost))}<div>Customer selling value: {currency(Number(form.quantity) * Number(form.sellingPrice))}</div></div>
      <div className="flex items-end gap-2"><button type="button" onClick={() => setOpen(false)} className="secondary-button">Cancel</button><button className="primary-button" type="submit" disabled={busy}><PackagePlus size={15}/>{busy ? 'Saving…' : 'Save Purchased & Used'}</button></div>
    </form>}
    <div className="mt-3 grid gap-2">{items.length ? items.map((item) => <article key={item.id} className="min-w-0 rounded-lg border border-cg-border p-3">
      <div className="flex flex-wrap justify-between gap-2"><strong className="break-words text-sm text-cg-text">{item.partName}</strong><span className="text-xs text-emerald-700">Purchased & Used</span></div>
      <p className="mt-1 text-xs text-cg-muted">{item.sku || 'No SKU'} · {item.vendor} {item.invoiceNo ? `· Bill ${item.invoiceNo}` : ''}</p>
      <p className="mt-1 text-xs text-cg-text">Qty {item.quantity} · Purchase {currency(item.totalCost)} · Selling {currency(item.totalSelling)}{item.usedAt ? ` · ${new Date(item.usedAt).toLocaleDateString('en-IN')}` : ''}</p>
    </article>) : <p className="text-xs text-cg-muted">No outside parts recorded for this job.</p>}</div>
  </section>;
}
