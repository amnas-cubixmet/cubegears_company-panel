import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardList, Package, Pencil, Plus, ReceiptText, Trash2, Wrench } from 'lucide-react';
import { jobService } from '../../services/job.service';

const emptyLine = (type = 'Labour') => ({
  key: String(Date.now()) + '-' + String(Math.random()),
  description: '', type, quantity: '1', unitPrice: ''
});
const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(Number(value) || 0);
const parseItems = (estimate) => (estimate?.items || [])
  .filter((row) => row && !row._pricing && row.description)
  .map((row, index) => ({
    key: String(index),
    description: row.description,
    type: row.type || 'Service',
    quantity: String(row.quantity || 1),
    unitPrice: String(row.unitPrice ?? row.price ?? 0)
  }));
const inspectSuggestions = (findings) => findings.flatMap((item) => {
  const title = item.description || item.title || 'Inspection finding';
  const part = Number(item.estimatedPartCharge ?? item.estimatedCost ?? 0) || 0;
  const labour = Number(item.estimatedLabourCharge || 0);
  const result = [];
  if (labour > 0) result.push({
    ...emptyLine(), type: 'Labour', description: item.recommendedAction || title,
    quantity: '1', unitPrice: String(labour)
  });
  result.push({
    ...emptyLine(), type: part > 0 ? 'Part' : 'Service', description: title,
    quantity: '1', unitPrice: String(part)
  });
  return result;
});

export function QuickEstimatePanel({
  job, estimates = [], findings = [], canEdit, onSaved, onApprove,
  onReject, onEditInspection, onGoToWork
}) {
  const latest = estimates.at(-1) || null;
  const [lines, setLines] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [taxPercent, setTaxPercent] = useState('0');
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const [feedback, setFeedback] = useState('');
  const revisedAt = job?.inspection?.revisedAt;
  const stale = !!(latest?.created_at && revisedAt &&
    new Date(latest.created_at).getTime() < new Date(revisedAt).getTime());

  useEffect(() => {
    const pricing = (latest?.items || []).find((row) => row._pricing)?._pricing;
    const previous = parseItems(latest);
    setLines(previous);
    setDiscount(String(pricing?.discount ?? latest?.discount ?? 0));
    setTaxPercent(String(pricing?.taxPercent ?? latest?.taxPercent ?? 0));
    setChanged(false);
    setFeedback('');
  }, [job?.id, latest?.id, latest?.updated_at, latest?.status]);

  const amount = useMemo(() => {
    const work = lines.filter((line) => line.type !== 'Part').reduce(
      (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0
    );
    const parts = lines.filter((line) => line.type === 'Part').reduce(
      (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0
    );
    const subtotal = work + parts;
    const rebate = Number(discount) || 0;
    const tax = Math.max(0, subtotal - rebate) * (Number(taxPercent) || 0) / 100;
    return { work, parts, subtotal, tax, total: subtotal - rebate + tax };
  }, [lines, discount, taxPercent]);

  const validation = useMemo(() => {
    if (!lines.length || lines.some((row) => !row.description.trim() ||
      !Number.isFinite(Number(row.unitPrice)) || Number(row.unitPrice) < 0 ||
      !Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0)) {
      return 'Add a description, quantity and valid price for every item.';
    }
    if (!Number.isFinite(Number(taxPercent)) || Number(taxPercent) < 0 || Number(taxPercent) > 100) {
      return 'Enter tax between 0 and 100%.';
    }
    if (!Number.isFinite(Number(discount)) || Number(discount) < 0 || Number(discount) > amount.subtotal) {
      return 'Discount must be between zero and subtotal.';
    }
    return '';
  }, [lines, amount.subtotal, taxPercent, discount]);

  const edit = (key, field, value) => {
    setLines((current) => current.map((line) => line.key === key ? { ...line, [field]: value } : line));
    setChanged(true);
    setFeedback('');
  };
  const save = async () => {
    if (!canEdit || busy || validation) return;
    setBusy(true);
    setFeedback('');
    try {
      const draftId = latest?.status === 'Draft' && !stale ? latest.id : null;
      await jobService.saveQuickJobEstimate(job.id, {
        lines: lines.map(({ description, type, quantity, unitPrice }) => ({
          description: description.trim(), type, quantity, unitPrice
        })),
        taxPercent, discount
      }, draftId);
      await onSaved?.();
      setChanged(false);
      setFeedback(draftId ? 'Draft updated.' : 'Estimate draft saved.');
    } catch (err) {
      setFeedback(err?.message || 'Unable to save estimate.');
    } finally {
      setBusy(false);
    }
  };
  const approve = async () => {
    if (busy || !latest || changed || stale) return;
    setBusy(true);
    setFeedback('');
    try {
      await onApprove?.(latest);
    } catch (err) {
      setFeedback(err?.message || 'Unable to approve estimate.');
    } finally {
      setBusy(false);
    }
  };
  const addLine = (type) => {
    setLines((current) => [...current, emptyLine(type)]);
    setChanged(true);
    setFeedback('');
  };
  const removeLine = (key) => {
    setLines((current) => current.filter((line) => line.key !== key));
    setChanged(true);
    setFeedback('');
  };
  const renderItem = (line, index) => {
    const part = line.type === 'Part';
    return (
      <div className="job-quick-line" key={line.key}>
        <div className="job-quick-line-header">
          <strong>{part ? 'Spare Part' : 'Work / Service'} {index + 1}</strong>
          {canEdit && (
            <button
              type="button"
              disabled={busy}
              onClick={() => removeLine(line.key)}
              aria-label={'Remove ' + (part ? 'part ' : 'work item ') + (index + 1)}
              title="Remove item"
            >
              <Trash2 size={15} aria-hidden="true"/>
            </button>
          )}
        </div>
        <div className="job-quick-line-fields">
          <label className="job-quick-description">
            {part ? 'Part name' : 'Work description'}
            <input
              value={line.description}
              disabled={!canEdit || busy}
              placeholder={part ? 'e.g. Oil filter' : 'e.g. Engine oil change'}
              onChange={(event) => edit(line.key, 'description', event.target.value)}
            />
          </label>
          {part ? (
            <span className="job-quick-type-fixed">Type <strong>Spare Part</strong></span>
          ) : (
            <label>Type
              <select value={line.type} disabled={!canEdit || busy} onChange={(event) => edit(line.key, 'type', event.target.value)}>
                <option value="Labour">Labour</option>
                <option value="Service">Service</option>
                <option value="Other">Other Work</option>
              </select>
            </label>
          )}
          <label>Qty
            <input
              type="number" min="0.01" max="10000" step="0.01" inputMode="decimal"
              value={line.quantity} disabled={!canEdit || busy}
              onChange={(event) => edit(line.key, 'quantity', event.target.value)}
            />
          </label>
          <label>{part ? 'Unit Price (₹)' : 'Rate (₹)'}
            <input
              type="number" min="0" max="10000000" step="0.01" inputMode="decimal"
              value={line.unitPrice} disabled={!canEdit || busy} placeholder="0.00"
              onChange={(event) => edit(line.key, 'unitPrice', event.target.value)}
            />
          </label>
        </div>
        <div className="job-quick-line-total">
          Amount <strong>{money((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))}</strong>
        </div>
      </div>
    );
  };

  const addInspection = () => {
    const suggestions = inspectSuggestions(findings);
    if (!suggestions.length) return;
    setLines((current) => [
      ...current.filter((line) => line.description.trim()), ...suggestions
    ]);
    setChanged(true);
    setFeedback('');
  };

  return (
    <div className="job-quick-estimate">
      <header className="job-quick-header">
        <div>
          <span className="job-quick-eyebrow">Job Card / Estimate</span>
          <h2><ReceiptText size={19} aria-hidden="true"/> Quick Estimate</h2>
          <p>Add work or spare parts, review the total and ask for customer approval.</p>
        </div>
        <button type="button" className="job-quick-outline" onClick={onEditInspection} disabled={!canEdit}>
          <Pencil size={15} aria-hidden="true"/> Edit Inspection
        </button>
      </header>

      {stale && <p className="job-quick-warning" role="status">
        Inspection has changed. Save a revised estimate before approval.
      </p>}
      {feedback && <p className="job-quick-feedback" role="status">{feedback}</p>}

      <div className="job-quick-grid">
        <section className="job-quick-panel job-quick-work-parts">
          <div className="job-quick-section-head">
            <div>
              <h3>Work & Parts</h3>
              <p>Add work and spare parts separately. Enter quantity and rate to calculate the total.</p>
            </div>
            <span className="job-quick-count">{lines.length} {lines.length === 1 ? 'item' : 'items'}</span>
          </div>

          <section className="job-quick-item-group" aria-label="Work and labour items">
            <div className="job-quick-group-heading">
              <div>
                <h4><Wrench size={16} aria-hidden="true"/> Work & Labour</h4>
                <p>{money(amount.work)} · {lines.filter((item) => item.type !== 'Part').length} items</p>
              </div>
              {canEdit && <button type="button" className="job-quick-add-button" disabled={busy} onClick={() => addLine('Labour')}>
                <Plus size={15} aria-hidden="true"/> Add Work
              </button>}
            </div>
            <div className="job-quick-items">
              {lines.filter((line) => line.type !== 'Part').map(renderItem)}
              {!lines.some((line) => line.type !== 'Part') &&
                <p className="job-quick-empty">No work added. Choose Add Work to enter service or labour charges.</p>}
            </div>
          </section>

          <section className="job-quick-item-group" aria-label="Spare part items">
            <div className="job-quick-group-heading">
              <div>
                <h4><Package size={16} aria-hidden="true"/> Spare Parts</h4>
                <p>{money(amount.parts)} · {lines.filter((item) => item.type === 'Part').length} items</p>
              </div>
              {canEdit && <button type="button" className="job-quick-add-button" disabled={busy} onClick={() => addLine('Part')}>
                <Plus size={15} aria-hidden="true"/> Add Part
              </button>}
            </div>
            <div className="job-quick-items">
              {lines.filter((line) => line.type === 'Part').map(renderItem)}
              {!lines.some((line) => line.type === 'Part') &&
                <p className="job-quick-empty">No spare parts added. Choose Add Part to enter part prices.</p>}
            </div>
          </section>

          {canEdit && findings.length > 0 && (
            <button type="button" className="job-quick-import" disabled={busy} onClick={addInspection}>
              <ClipboardList size={15} aria-hidden="true"/> Add from Inspection Findings
            </button>
          )}
          <p className="job-quick-save-note">These items are for the customer estimate. Spare parts stock is not deducted until issued through Inventory.</p>
        </section>

        <section className="job-quick-panel job-quick-summary">
          <div className="job-quick-section-head">
            <div><h3>Estimate Total</h3><p>Final calculation</p></div>
          </div>
          <dl className="job-quick-amounts">
            <div><dt>Work & Labour</dt><dd>{money(amount.work)}</dd></div>
            <div><dt>Spare Parts</dt><dd>{money(amount.parts)}</dd></div>
            <div><dt>Subtotal</dt><dd>{money(amount.subtotal)}</dd></div>
            <div className="job-quick-adjustments">
              <label>Discount (₹)
                <input type="number" min="0" step="0.01" value={discount} disabled={!canEdit || busy}
                  onChange={(e) => { setDiscount(e.target.value); setChanged(true); }}/>
              </label>
              <label>Tax (%)
                <input type="number" min="0" max="100" step="0.01" value={taxPercent} disabled={!canEdit || busy}
                  onChange={(e) => { setTaxPercent(e.target.value); setChanged(true); }}/>
              </label>
            </div>
            <div><dt>Tax amount</dt><dd>{money(amount.tax)}</dd></div>
            <div className="job-quick-grand-total"><dt>Total</dt><dd>{money(amount.total)}</dd></div>
          </dl>
          {canEdit ? (
            <div className="job-quick-actions">
              {validation && <p className="job-quick-invalid">{validation}</p>}
              <button type="button" className="job-quick-primary"
                disabled={busy || !!validation} onClick={save}>
                {busy ? 'Please wait…' : latest?.status === 'Draft' && !stale ? 'Update Draft' : 'Save Draft'}
              </button>
              <button type="button" className="job-quick-approve"
                disabled={busy || !latest || changed || stale || latest.status === 'Rejected'}
                onClick={approve}>
                <CheckCircle2 size={16} aria-hidden="true"/> Approve & Continue
              </button>
              <small>Save changes first. Approval unlocks Work & Labour.</small>
            </div>
          ) : (
            <button type="button" className="job-quick-outline" onClick={onGoToWork}>Go to current stage</button>
          )}
        </section>
      </div>

      <details className="job-quick-history">
        <summary>Estimate History ({estimates.length}) <ChevronDown size={15} aria-hidden="true"/></summary>
        <div className="job-quick-history-list">
          {estimates.length ? [...estimates].reverse().map((item) => (
            <div key={item.id || item.version}>
              <span>{'Estimate V' + (typeof item.version === 'number' ? item.version : String(item.version || ''))}</span>
              <strong>{money(item.total ?? item.grandTotal)}</strong>
              <span>{item.approvalStatus || item.status || 'Draft'}</span>
              {canEdit && item.id === latest?.id && item.status === 'Draft' &&
                <button type="button" disabled={busy} onClick={() => onReject?.(item.id)}>Reject</button>}
            </div>
          )) : <p>No previous estimates.</p>}
        </div>
      </details>
    </div>
  );
}

export default QuickEstimatePanel;
