import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  ClipboardCheck,
  History,
  PackageCheck,
  PackagePlus,
  RotateCcw,
  Search,
  ShoppingCart,
  X
} from 'lucide-react';
import { stockService } from '../../services/stock.service';
import { jobPartsService } from '../../services/jobParts.service';
import { jobService } from '../../services/job.service';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const today = () => new Date().toISOString().slice(0, 10);

export function JobPartsWorkflow({ jobId, assignedTo = '', onJobUpdated }) {
  const [data, setData] = useState({ lines: [], transactions: [], purchaseOrders: [], canComplete: true, blockingReasons: [] });
  const [stock, setStock] = useState([]);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null);
  const [qty, setQty] = useState({});
  const [returnQty, setReturnQty] = useState({});

  const load = async () => {
    try {
      setError('');
      const [workflow, items] = await Promise.all([
        jobPartsService.get(jobId),
        stockService.getStockItems()
      ]);
      setData(workflow);
      setStock(items);
    } catch (e) {
      setError(e?.message || 'Unable to load parts workflow.');
    }
  };

  useEffect(() => { load(); }, [jobId]);

  const lines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.lines.filter((line) => {
      const matches = !q || [line.partName, line.partNo, line.brand, line.barcode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));

      if (!matches) return false;
      if (tab === 'pending') return line.lineStatus !== 'Cancelled' && line.pendingQty > 0;
      if (tab === 'issued') return line.netIssued > 0;
      if (tab === 'returned') return line.returnedQty > 0;
      return true;
    });
  }, [data.lines, search, tab]);

  const act = async (key, fn) => {
    setBusy(key);
    setError('');
    try {
      const next = await fn();
      if (next?.lines) setData(next);
      else await load();
      setPanel(null);
    } catch (e) {
      setError(e?.message || 'Action failed.');
    } finally {
      setBusy('');
    }
  };

  const issue = (line) => {
    const value = Number(qty[line.id] || Math.min(line.pendingQty, line.availableQty) || 0);
    return act(`issue-${line.id}`, async () => {
      const result = await jobPartsService.issue(jobId, line.id, value, line.issuedTo || assignedTo);
      setQty((prev) => ({ ...prev, [line.id]: '' }));
      return result;
    });
  };

  const returnPart = (line) => {
    const value = Number(returnQty[line.id] || 0);
    return act(`return-${line.id}`, async () => {
      const result = await jobPartsService.returnPart(jobId, line.id, value, 'Reusable');
      setReturnQty((prev) => ({ ...prev, [line.id]: '' }));
      return result;
    });
  };

  const markDone = () => act('complete', async () => {
    if (!data.canComplete) throw new Error('Resolve all pending part quantities before completing the job.');
    await jobService.updateJobStatus(jobId, 'Ready for Delivery');
    await onJobUpdated?.();
    return data;
  });

  return (
    <section className="space-y-4">
      <div className="rounded-[18px] border border-cg-border bg-cg-surface p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[.14em] text-cg-primary">Parts Issue & Inventory</span>
            <h2 className="mt-1 text-lg font-bold text-cg-text">Job Parts Workflow</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-cg-muted">
              Check stock, issue available parts, order shortages, receive inward stock and return unused issued parts.
            </p>
          </div>

          <CompletionGuard
            canComplete={data.canComplete}
            reasons={data.blockingReasons}
            busy={busy === 'complete'}
            onComplete={markDone}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="Pending" value={data.lines.reduce((s, x) => s + Number(x.pendingQty || 0), 0)} tone="amber" />
          <Metric label="Issued" value={data.lines.reduce((s, x) => s + Number(x.netIssued || 0), 0)} tone="blue" />
          <Metric label="Returned" value={data.lines.reduce((s, x) => s + Number(x.returnedQty || 0), 0)} tone="green" />
        </div>
      </div>

      <div className="rounded-[18px] border border-cg-border bg-cg-surface shadow-sm">
        <div className="border-b border-cg-border p-3 md:p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              ['pending', 'Pending Issue'],
              ['issued', 'Issued'],
              ['returned', 'Returned'],
              ['history', 'History']
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`min-h-10 shrink-0 rounded-xl px-3 text-xs font-semibold transition ${tab === key ? 'bg-cg-primary text-white' : 'border border-cg-border bg-cg-surface text-cg-muted hover:bg-cg-surface-2'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cg-muted" size={16} />
              <input
                className="cubegears-input !pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Part name / part number / barcode"
              />
            </label>
            <button
              type="button"
              className="primary-button"
              onClick={() => setPanel({ type: 'add' })}
            >
              <PackagePlus size={16} /> Other Part
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mx-4">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tab === 'history' ? (
          <TransactionHistory transactions={data.transactions} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table>
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Part</th>
                    <th>On Hand</th>
                    <th>Requested</th>
                    <th>{tab === 'issued' ? 'Issued' : tab === 'returned' ? 'Returned' : 'Issue Qty'}</th>
                    <th>Pending</th>
                    <th>Selling</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <PartTableRow
                      key={line.id}
                      line={line}
                      tab={tab}
                      issueQty={qty[line.id] ?? ''}
                      returnQty={returnQty[line.id] ?? ''}
                      onIssueQty={(value) => setQty((p) => ({ ...p, [line.id]: value }))}
                      onReturnQty={(value) => setReturnQty((p) => ({ ...p, [line.id]: value }))}
                      onIssue={() => issue(line)}
                      onReturn={() => returnPart(line)}
                      onOrder={() => setPanel({ type: 'order', line })}
                      onInward={() => {
                        const po = data.purchaseOrders.find((row) => row.lineId === line.id && row.status !== 'Received');
                        setPanel({ type: 'inward', line, po });
                      }}
                      busy={busy}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 md:hidden">
              {lines.map((line) => (
                <PartMobileCard
                  key={line.id}
                  line={line}
                  tab={tab}
                  issueQty={qty[line.id] ?? ''}
                  returnQty={returnQty[line.id] ?? ''}
                  onIssueQty={(value) => setQty((p) => ({ ...p, [line.id]: value }))}
                  onReturnQty={(value) => setReturnQty((p) => ({ ...p, [line.id]: value }))}
                  onIssue={() => issue(line)}
                  onReturn={() => returnPart(line)}
                  onOrder={() => setPanel({ type: 'order', line })}
                  onInward={() => {
                    const po = data.purchaseOrders.find((row) => row.lineId === line.id && row.status !== 'Received');
                    setPanel({ type: 'inward', line, po });
                  }}
                  busy={busy}
                />
              ))}
            </div>

            {!lines.length && (
              <div className="p-8 text-center">
                <PackageCheck className="mx-auto text-cg-muted" size={28} />
                <h3 className="mt-3 text-sm font-semibold text-cg-text">
                  {tab === 'pending' ? 'No pending parts' : tab === 'issued' ? 'No active issued parts' : 'No returned parts'}
                </h3>
                <p className="mt-1 text-xs text-cg-muted">Use Other Part to add a required stock item to this job.</p>
              </div>
            )}
          </>
        )}
      </div>

      {panel?.type === 'add' && (
        <AddPartPanel stock={stock} assignedTo={assignedTo} onClose={() => setPanel(null)}
          onSave={(payload) => act('add', () => jobPartsService.addRequiredPart(jobId, payload))} busy={busy === 'add'} />
      )}

      {panel?.type === 'order' && (
        <OrderPanel line={panel.line} onClose={() => setPanel(null)}
          onSave={(payload) => act('order', () => jobPartsService.createOrder(jobId, panel.line.id, payload))} busy={busy === 'order'} />
      )}

      {panel?.type === 'inward' && (
        <InwardPanel line={panel.line} po={panel.po} onClose={() => setPanel(null)}
          onSave={(payload) => act('inward', () => {
            if (!panel.po) throw new Error('Create a purchase order before inward.');
            return jobPartsService.inward(jobId, panel.po.id, payload);
          })} busy={busy === 'inward'} />
      )}
    </section>
  );
}

function StockBadge({ line }) {
  const cls = line.stockState === 'Available'
    ? 'bg-emerald-50 text-emerald-700'
    : line.stockState === 'Partial'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-700';
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${cls}`}>{line.stockState}</span>;
}

function PartTableRow({ line, tab, issueQty, returnQty, onIssueQty, onReturnQty, onIssue, onReturn, onOrder, onInward, busy }) {
  return (
    <tr>
      <td><StockBadge line={line} /></td>
      <td>
        <strong className="block text-sm">{line.partName}</strong>
        <span className="text-xs text-cg-muted">{line.partNo || 'No code'}{line.brand ? ` · ${line.brand}` : ''}</span>
      </td>
      <td>{line.qtyOnHand}</td>
      <td>{line.requestedQty}</td>
      <td>
        {tab === 'pending' ? (
          <input className="cubegears-input !h-9 !w-20 !min-h-9" inputMode="decimal" value={issueQty}
            placeholder={String(Math.min(line.pendingQty, line.availableQty))}
            onChange={(e) => onIssueQty(e.target.value.replace(/[^0-9.]/g, ''))} />
        ) : tab === 'issued' ? (
          <div className="flex items-center gap-2">
            <span>{line.netIssued}</span>
            <input className="cubegears-input !h-9 !w-20 !min-h-9" inputMode="decimal" value={returnQty}
              placeholder="Return"
              onChange={(e) => onReturnQty(e.target.value.replace(/[^0-9.]/g, ''))} />
          </div>
        ) : line.returnedQty}
      </td>
      <td>{line.pendingQty}</td>
      <td>{money.format(line.sellingPrice || 0)}</td>
      <td>
        <div className="flex justify-end gap-1.5">
          {tab === 'pending' && line.availableQty > 0 && (
            <button className="primary-button !min-h-9 !px-3 !text-xs" disabled={busy === `issue-${line.id}`} onClick={onIssue}>
              <PackageCheck size={14}/> Issue
            </button>
          )}
          {tab === 'pending' && line.pendingQty > line.availableQty && (
            <button className="secondary-button !min-h-9 !px-3 !text-xs" onClick={onOrder}><ShoppingCart size={14}/> Order</button>
          )}
          {tab === 'pending' && (
            <button className="secondary-button !min-h-9 !px-3 !text-xs" onClick={onInward}><ArrowDownToLine size={14}/> Inward</button>
          )}
          {tab === 'issued' && (
            <button className="secondary-button !min-h-9 !px-3 !text-xs" disabled={busy === `return-${line.id}`} onClick={onReturn}>
              <RotateCcw size={14}/> Return
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function PartMobileCard(props) {
  const { line, tab, issueQty, returnQty, onIssueQty, onReturnQty, onIssue, onReturn, onOrder, onInward, busy } = props;
  return (
    <article className="rounded-[14px] border border-cg-border bg-cg-surface p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <strong className="block truncate text-sm text-cg-text">{line.partName}</strong>
          <span className="text-xs text-cg-muted">{line.partNo || 'No code'}{line.brand ? ` · ${line.brand}` : ''}</span>
        </div>
        <StockBadge line={line} />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-cg-surface-2 p-2">
        <Mini label="On Hand" value={line.qtyOnHand} />
        <Mini label="Requested" value={line.requestedQty} />
        <Mini label="Issued" value={line.netIssued} />
        <Mini label="Pending" value={line.pendingQty} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        {tab === 'pending' && (
          <label className="min-w-0 flex-1 text-[11px] font-semibold text-cg-muted">
            Issue Qty
            <input className="cubegears-input mt-1" inputMode="decimal" value={issueQty}
              placeholder={String(Math.min(line.pendingQty, line.availableQty))}
              onChange={(e) => onIssueQty(e.target.value.replace(/[^0-9.]/g, ''))} />
          </label>
        )}
        {tab === 'issued' && (
          <label className="min-w-0 flex-1 text-[11px] font-semibold text-cg-muted">
            Return Qty
            <input className="cubegears-input mt-1" inputMode="decimal" value={returnQty}
              placeholder={String(line.netIssued)}
              onChange={(e) => onReturnQty(e.target.value.replace(/[^0-9.]/g, ''))} />
          </label>
        )}
        {tab === 'returned' && <div className="flex-1 text-xs text-cg-muted">Returned <strong className="text-cg-text">{line.returnedQty}</strong></div>}
        <div className="text-right"><span className="block text-[10px] text-cg-muted">Selling</span><strong className="text-sm">{money.format(line.sellingPrice || 0)}</strong></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {tab === 'pending' && line.availableQty > 0 && (
          <button className="primary-button !px-2" disabled={busy === `issue-${line.id}`} onClick={onIssue}><PackageCheck size={15}/>Issue</button>
        )}
        {tab === 'pending' && line.pendingQty > line.availableQty && (
          <button className="secondary-button !px-2" onClick={onOrder}><ShoppingCart size={15}/>Order</button>
        )}
        {tab === 'pending' && (
          <button className="secondary-button !px-2" onClick={onInward}><ArrowDownToLine size={15}/>Inward</button>
        )}
        {tab === 'issued' && (
          <button className="secondary-button col-span-2" disabled={busy === `return-${line.id}`} onClick={onReturn}><RotateCcw size={15}/>Return Selected Qty</button>
        )}
      </div>
    </article>
  );
}

function CompletionGuard({ canComplete, reasons, busy, onComplete }) {
  return (
    <div className={`min-w-[250px] rounded-[14px] border p-3 ${canComplete ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-start gap-2">
        {canComplete ? <CheckCircle2 className="mt-0.5 text-emerald-600" size={18}/> : <AlertTriangle className="mt-0.5 text-amber-600" size={18}/>}
        <div className="min-w-0 flex-1">
          <strong className={`block text-sm ${canComplete ? 'text-emerald-800' : 'text-amber-800'}`}>
            {canComplete ? 'Parts cleared' : 'Job Done blocked'}
          </strong>
          <p className={`mt-0.5 text-xs ${canComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
            {canComplete ? 'No required part quantity is pending.' : reasons.slice(0, 2).map((r) => r.reason).join(' · ')}
          </p>
        </div>
      </div>
      <button type="button" disabled={!canComplete || busy} onClick={onComplete}
        className="primary-button mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50">
        <ClipboardCheck size={16}/>{busy ? 'Updating…' : 'Ready for Delivery'}
      </button>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const cls = tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-blue-600';
  return <div className="rounded-xl bg-cg-surface-2 p-3"><span className="block text-[10px] font-semibold uppercase tracking-wide text-cg-muted">{label}</span><strong className={`mt-1 block text-xl ${cls}`}>{value}</strong></div>;
}

function Mini({ label, value }) {
  return <div><span className="block text-[9px] uppercase tracking-wide text-cg-muted">{label}</span><strong className="text-sm text-cg-text">{value}</strong></div>;
}

function AddPartPanel({ stock, assignedTo, onClose, onSave, busy }) {
  const [form, setForm] = useState({ partId: stock[0]?.id || '', requestedQty: '1', sellingPrice: stock[0]?.sellingPrice || '', issuedTo: assignedTo });
  const chosen = stock.find((item) => item.id === form.partId);

  useEffect(() => {
    if (!form.partId && stock[0]) setForm((p) => ({ ...p, partId: stock[0].id, sellingPrice: stock[0].sellingPrice || '' }));
  }, [stock]);

  return <Sheet title="Add Required Part" subtitle="Add a stock item required for this Job Card." onClose={onClose}>
    <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label className="form-label md:col-span-2">Part
        <select className="cubegears-select mt-1" value={form.partId} onChange={(e) => {
          const item = stock.find((x) => x.id === e.target.value);
          setForm({ ...form, partId: e.target.value, sellingPrice: item?.sellingPrice || '' });
        }}>
          {stock.map((item) => <option key={item.id} value={item.id}>{item.partName} · {item.sku} · Stock {item.onHand}</option>)}
        </select>
      </label>
      <label className="form-label">Requested Qty<input className="cubegears-input mt-1" inputMode="decimal" value={form.requestedQty} onChange={(e) => setForm({ ...form, requestedQty: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label">Selling Price ₹<input className="cubegears-input mt-1" inputMode="decimal" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label md:col-span-2">Issued To<input className="cubegears-input mt-1" value={form.issuedTo} onChange={(e) => setForm({ ...form, issuedTo: e.target.value })} placeholder="Mechanic / store destination"/></label>
      {chosen && <div className="md:col-span-2 rounded-xl bg-cg-surface-2 p-3 text-xs text-cg-muted">Available: <strong className="text-cg-text">{Math.max(0, Number(chosen.onHand || 0) - Number(chosen.reserved || 0))}</strong> · Rack: {chosen.location || '—'} · Cost: {money.format(chosen.costPrice || 0)}</div>}
      <button className="primary-button md:col-span-2" disabled={busy || !form.partId}>{busy ? 'Adding…' : 'Add to Job Card'}</button>
    </form>
  </Sheet>;
}

function OrderPanel({ line, onClose, onSave, busy }) {
  const [form, setForm] = useState({ vendor: line.stockItem?.supplier || '', type: 'Cash', orderDate: today(), orderedQty: String(line.pendingQty), unitCost: String(line.stockItem?.costPrice || ''), discount: '0', tax: '18' });
  return <Sheet title="Create Purchase Order" subtitle={`${line.partName} · ${line.pendingQty} pending`} onClose={onClose}>
    <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label className="form-label md:col-span-2">Vendor *<input className="cubegears-input mt-1" required value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}/></label>
      <label className="form-label">Type<select className="cubegears-select mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Cash</option><option>Credit</option></select></label>
      <label className="form-label">Order Date<input type="date" className="cubegears-input mt-1" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })}/></label>
      <label className="form-label">Order Qty<input className="cubegears-input mt-1" inputMode="decimal" value={form.orderedQty} onChange={(e) => setForm({ ...form, orderedQty: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label">Unit Cost ₹<input className="cubegears-input mt-1" inputMode="decimal" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label">Discount %<input className="cubegears-input mt-1" inputMode="decimal" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label">Tax %<input className="cubegears-input mt-1" inputMode="decimal" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <button className="primary-button md:col-span-2" disabled={busy}>{busy ? 'Creating…' : 'Create Order'}</button>
    </form>
  </Sheet>;
}

function InwardPanel({ line, po, onClose, onSave, busy }) {
  const openQty = po ? Math.max(0, Number(po.orderedQty || 0) - Number(po.receivedQty || 0)) : 0;
  const [form, setForm] = useState({ inwardQty: String(openQty || line.pendingQty || 1), billNo: '', billDate: today(), taxType: 'GST', rack: line.stockItem?.location || '', barcode: '' });
  return <Sheet title="Inward / Goods Receipt" subtitle={po ? `${po.poNo} · ${po.vendor}` : 'Create an order first for this shortage.'} onClose={onClose}>
    {!po ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">No open purchase order found for this part.</div> :
    <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label className="form-label">Vendor<input className="cubegears-input mt-1" value={po.vendor} disabled/></label>
      <label className="form-label">Inward Qty *<input className="cubegears-input mt-1" inputMode="decimal" value={form.inwardQty} onChange={(e) => setForm({ ...form, inwardQty: e.target.value.replace(/[^0-9.]/g, '') })}/></label>
      <label className="form-label">Bill No.<input className="cubegears-input mt-1" value={form.billNo} onChange={(e) => setForm({ ...form, billNo: e.target.value })}/></label>
      <label className="form-label">Bill Date *<input type="date" required className="cubegears-input mt-1" value={form.billDate} onChange={(e) => setForm({ ...form, billDate: e.target.value })}/></label>
      <label className="form-label">Tax Type<select className="cubegears-select mt-1" value={form.taxType} onChange={(e) => setForm({ ...form, taxType: e.target.value })}><option>GST</option><option>Non-GST</option></select></label>
      <label className="form-label">Rack / Bin<input className="cubegears-input mt-1" value={form.rack} onChange={(e) => setForm({ ...form, rack: e.target.value })}/></label>
      <label className="form-label md:col-span-2">Barcode / Serial<input className="cubegears-input mt-1" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Leave blank to auto-generate"/></label>
      <div className="md:col-span-2 rounded-xl bg-cg-surface-2 p-3 text-xs text-cg-muted">Open PO Qty: <strong className="text-cg-text">{openQty}</strong> · Unit Cost: {money.format(po.unitCost || 0)}</div>
      <button className="primary-button md:col-span-2" disabled={busy}>{busy ? 'Posting…' : 'Post Inward'}</button>
    </form>}
  </Sheet>;
}

function Sheet({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-slate-950/50 backdrop-blur-[2px] md:items-center md:justify-center md:p-4">
      <div className="max-h-[88dvh] w-full overflow-auto rounded-t-[22px] border border-cg-border bg-cg-surface shadow-2xl md:max-w-2xl md:rounded-[20px]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-cg-border bg-cg-surface p-4">
          <div><h3 className="text-base font-bold text-cg-text">{title}</h3><p className="mt-1 text-xs text-cg-muted">{subtitle}</p></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={17}/></button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function TransactionHistory({ transactions }) {
  if (!transactions.length) return <div className="p-8 text-center text-sm text-cg-muted">No part transactions yet.</div>;
  return (
    <div className="divide-y divide-cg-border">
      {transactions.map((row) => (
        <div key={row.id} className="flex gap-3 p-4">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-cg-surface-2 text-cg-primary"><History size={16}/></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-sm text-cg-text">{row.type} · {row.partName}</strong>
              <span className="text-xs font-semibold text-cg-text">Qty {row.qty}</span>
            </div>
            <p className="mt-1 text-xs text-cg-muted">{row.reference || row.id} · {row.createdBy || 'User'} · {new Date(row.createdAt || Date.now()).toLocaleString('en-IN')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobPartsWorkflow;
