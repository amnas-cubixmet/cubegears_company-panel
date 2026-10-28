import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardList, Download, Package, Pencil, Plus, ReceiptText, Trash2, Wrench } from 'lucide-react';
import { jobService } from '../../services/job.service';
import { serviceService } from '../../services/service.service';
import { stockCatalogService } from '../../services/stockCatalog.service';
import { EstimateCatalogPicker } from './EstimateCatalogPicker';
import { EstimateAddCatalogModal } from './EstimateAddCatalogModal';
import { buildEstimateCatalogSelection } from './estimateNewCatalog';
import { estimateLineErrors, estimateFormValidation } from './quickEstimateValidation';
import { latestApprovedEstimate } from '../../utils/approvedEstimatePdf';
import { INDIA_STATES, calculateEstimateIndiaGst } from '../../utils/indiaGst';
import { estimateGstChoices } from './estimateGstRates';

const emptyLine = (type = 'Labour') => ({
  key: String(Date.now()) + '-' + String(Math.random()),
  description: '', type, quantity: '1', unitPrice: '', catalogId: '', catalogCode: '',
  taxRate: type === 'Part' ? '' : '18', hsnSac: type === 'Part' ? '' : '998714'
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
    unitPrice: String(row.unitPrice ?? row.price ?? 0),
    catalogId: row.catalogId || '',
    catalogCode: row.catalogCode || '',
    taxRate: String(row.taxRate ?? (row.type === 'Part' ? '' : '18')),
    hsnSac: row.hsnSac || ''
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
  onReject, onEditInspection, onGoToWork, onDownloadApproved
}) {
  const latest = estimates.at(-1) || null;
  const approvedEstimate = latestApprovedEstimate(estimates);
  const [lines, setLines] = useState([]);
  const [discount, setDiscount] = useState('0');
  const registered = Boolean(job?.gstInfo?.registered);
  const supplierState = job?.gstInfo?.supplierState || '';
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [catalogRequest, setCatalogRequest] = useState(null);
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const formRef = useRef(null);
  const revisedAt = job?.inspection?.revisedAt;
  const stale = !!(latest?.created_at && revisedAt &&
    new Date(latest.created_at).getTime() < new Date(revisedAt).getTime());

  useEffect(() => {
    const pricing = (latest?.items || []).find((row) => row._pricing)?._pricing;
    const previous = parseItems(latest);
    setLines(previous);
    setDiscount(String(pricing?.discount ?? latest?.discount ?? 0));
    setPlaceOfSupply(String(pricing?.gst?.placeOfSupply || job?.gstInfo?.placeOfSupply || ''));
    setChanged(false);
    setFeedback('');
    setShowValidation(false);
    setCatalogRequest(null);
    setCatalogError('');
  }, [job?.id, job?.gstInfo?.placeOfSupply, latest?.id, latest?.updated_at, latest?.status]);

  const amount = useMemo(() => calculateEstimateIndiaGst({
    lines, discount, registered, supplierState, placeOfSupply
  }), [lines, discount, registered, supplierState, placeOfSupply]);

  const validation = useMemo(() => {
    const basic = estimateFormValidation(lines, discount, '0');
    if (basic) return basic;
    if (registered && !supplierState) return 'Configure the workshop GSTIN / supplying state in Company Settings.';
    if (registered && !placeOfSupply) return 'Select the legal place-of-supply state.';
    if (registered && lines.some((line) => !String(line.taxRate ?? '').trim() ||
      Number(line.taxRate) < 0 || Number(line.taxRate) > 100 ||
      !/^\d+(?:\.\d{1,2})?$/.test(String(line.taxRate)))) {
      return 'Set a valid item-wise GST rate for every work and spare part.';
    }
    return '';
  }, [lines, discount, registered, supplierState, placeOfSupply]);

  const edit = (key, field, value) => {
    setLines((current) => current.map((line) => line.key === key
      ? {
        ...line, [field]: value,
        ...(field === 'description' || field === 'type'
          ? { catalogId: '', catalogCode: '' }
          : {})
      } : line));
    setChanged(true);
    setFeedback('');
  };
  const selectCatalog = (key, item) => {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...item } : line));
    setChanged(true);
    setFeedback('');
  };
  const save = async () => {
    if (!canEdit || busy) return;
    if (validation) {
      setShowValidation(true);
      setFeedback('');
      requestAnimationFrame(() => {
        const field = formRef.current?.querySelector('[aria-invalid="true"]');
        field?.focus();
        field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setBusy(true);
    setFeedback('');
    try {
      const draftId = latest?.status === 'Draft' && !stale ? latest.id : null;
      await jobService.saveQuickJobEstimate(job.id, {
        lines: lines.map(({ description, type, quantity, unitPrice, catalogId, taxRate, hsnSac }) => ({
          description: description.trim(), type, quantity, unitPrice,
          taxRate: taxRate || '0', hsnSac: hsnSac || '',
          ...(catalogId ? { catalogId } : {})
        })),
        taxPercent: '0', discount,
        gst: { mode: registered ? 'gst' : 'non_gst', placeOfSupply }
      }, draftId);
      await onSaved?.();
      setChanged(false);
      setShowValidation(false);
      setFeedback('Estimate draft saved.');
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
  const addLine = (type, catalogItem = null) => {
    setLines((current) => current.length >= 75 ? current : [
      ...current,
      { ...emptyLine(type), ...(catalogItem || {}) }
    ]);
    setChanged(true);
    setFeedback('');
  };

  const openCatalogCreate = (kind, lineKey = null, name = '') => {
    if (!canEdit || busy || catalogSaving) return;
    if (!lineKey && lines.length >= 75) return;
    setCatalogError('');
    setCatalogRequest({ kind, lineKey, name });
  };

  const createCatalogItem = async (draft) => {
    if (!catalogRequest || catalogSaving || !canEdit) return;
    setCatalogSaving(true);
    setCatalogError('');
    try {
      const created = draft.kind === 'part'
        ? await stockCatalogService.createItem({
            partName: draft.name.trim(),
            sku: draft.sku.trim(),
            brand: draft.brand.trim(),
            costPrice: Number(draft.costPrice),
            sellingPrice: Number(draft.price),
            unit: 'Piece',
            minimumStock: 0,
            onHand: 0,
          })
        : await serviceService.createService({
            name: draft.name.trim(),
            code: 'SVC-' + Date.now().toString(36).toUpperCase() + '-' +
              Math.random().toString(36).slice(2, 7).toUpperCase(),
            price: Number(draft.price),
            is_active: true,
          });

      const selection = buildEstimateCatalogSelection(draft, created);
      if (!selection.catalogId) {
        throw new Error('Product was created but its reference was not returned. Refresh the catalogue before retrying.');
      }
      if (catalogRequest.lineKey) {
        selectCatalog(catalogRequest.lineKey, selection);
      } else {
        addLine(selection.type, selection);
      }
      setCatalogRequest(null);
      setCatalogError('');
      setFeedback(draft.kind === 'part'
        ? 'New spare part saved in Stock and added to the estimate.'
        : 'New work saved in Services and added to the estimate.');
    } catch (error) {
      setCatalogError(error?.message || 'Could not create the catalogue item.');
    } finally {
      setCatalogSaving(false);
    }
  };
  const removeLine = (key) => {
    setLines((current) => current.filter((line) => line.key !== key));
    setChanged(true);
    setFeedback('');
  };
  const renderItem = (line, index) => {
    const part = line.type === 'Part';
    const errors = showValidation ? estimateLineErrors(line) : {};
    const invalid = Object.values(errors).some(Boolean);
    return (
      <div className={'job-quick-line' + (invalid ? ' is-invalid' : '')} key={line.key}>
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
          <div className="job-quick-description job-quick-name-field">
            <span>{part ? 'Part name' : 'Work description'}</span>
            <EstimateCatalogPicker
              kind={part ? 'part' : 'service'}
              value={line.description}
              invalid={Boolean(errors.description)}
              disabled={!canEdit || busy}
              onChange={(value) => edit(line.key, 'description', value)}
              onSelect={(item) => selectCatalog(line.key, item)}
              onAddNew={(name) => openCatalogCreate(part ? 'part' : 'service', line.key, name)}
            />
            {errors.description && <small className="job-quick-field-error">{errors.description}</small>}
            {line.catalogId && (
              <small className="job-quick-catalog-selected">
                Selected from {part ? 'stock' : 'services'}{line.catalogCode ? ' · ' + line.catalogCode : ''}
              </small>
            )}
          </div>
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
              aria-invalid={Boolean(errors.quantity)}
              onChange={(event) => edit(line.key, 'quantity', event.target.value)}
            />
            {errors.quantity && <small className="job-quick-field-error">{errors.quantity}</small>}
          </label>
          <label>{part ? 'Unit Price (₹)' : 'Rate (₹)'}
            <input
              type="number" min="0" max="10000000" step="0.01" inputMode="decimal"
              value={line.unitPrice} disabled={!canEdit || busy} placeholder="0.00"
              aria-invalid={Boolean(errors.unitPrice)}
              onChange={(event) => edit(line.key, 'unitPrice', event.target.value)}
            />
            {errors.unitPrice && <small className="job-quick-field-error">{errors.unitPrice}</small>}
          </label>
          {registered && <>
            <label>HSN / SAC
              <input value={line.hsnSac || ''} maxLength={20}
                placeholder={part ? 'Part HSN' : 'Service SAC'}
                disabled={!canEdit || busy}
                onChange={(event) => edit(line.key, 'hsnSac', event.target.value)} />
            </label>
            <label>GST Rate (%)
              <select
                className="job-quick-gst-select"
                aria-label={`GST Rate (%) for ${part ? 'spare part' : 'work item'} ${index + 1}`}
                value={String(line.taxRate ?? '')}
                disabled={!canEdit || busy}
                onChange={(event) => edit(line.key, 'taxRate', event.target.value)}
              >
                <option value="">Select GST Rate</option>
                {estimateGstChoices(line.taxRate).map((rate) => (
                  <option value={rate} key={rate}>GST {rate}%</option>
                ))}
              </select>
            </label>
          </>}
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
    setLines((current) => {
      const filled = current.filter((line) => line.description.trim());
      return [...filled, ...suggestions.slice(0, Math.max(0, 75 - filled.length))];
    });
    setChanged(true);
    setFeedback('');
  };

  return (
    <div className="job-quick-estimate" ref={formRef}>
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
              {canEdit && <div className="job-quick-group-actions">
                <button type="button" className="job-quick-add-button" disabled={busy || lines.length >= 75} onClick={() => addLine('Labour')}>
                  <Plus size={15} aria-hidden="true"/> Add Work
                </button>
                <button type="button" className="job-quick-add-button is-catalog-add" disabled={busy || lines.length >= 75}
                  onClick={() => openCatalogCreate('service')}>
                  <Plus size={15} aria-hidden="true"/> Add New Work
                </button>
              </div>}
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
              {canEdit && <div className="job-quick-group-actions">
                <button type="button" className="job-quick-add-button" disabled={busy || lines.length >= 75} onClick={() => addLine('Part')}>
                  <Plus size={15} aria-hidden="true"/> Add Part
                </button>
                <button type="button" className="job-quick-add-button is-catalog-add" disabled={busy || lines.length >= 75}
                  onClick={() => openCatalogCreate('part')}>
                  <Plus size={15} aria-hidden="true"/> Add New Part
                </button>
              </div>}
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
          <p className="job-quick-save-note">Estimate only, not a tax invoice. Check applicable HSN/SAC and GST rate for each item. Car repair labour (SAC 998714) is generally 18%; do not assume every consumable has that rate. Stock is deducted only on actual issue.</p>
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
                  aria-invalid={showValidation && validation.startsWith('Discount')}
                  onChange={(e) => { setDiscount(e.target.value); setChanged(true); }}/>
              </label>
              {registered && <label>Place of Supply (India)
                <select value={placeOfSupply} disabled={!canEdit || busy}
                  onChange={(e) => { setPlaceOfSupply(e.target.value); setChanged(true); }}>
                  <option value="">Choose State / UT</option>
                  {INDIA_STATES.map(([code, name]) =>
                    <option key={code} value={code}>{code} — {name}</option>)}
                </select>
              </label>}
            </div>
            {registered ? <>
              <div><dt>Supplier state (GSTIN)</dt><dd>{supplierState || 'Not configured'}</dd></div>
              <div><dt>Taxable amount</dt><dd>{money(amount.taxable)}</dd></div>
              {amount.mode === 'cgst_sgst' && <>
                <div><dt>CGST</dt><dd>{money(amount.cgst)}</dd></div>
                <div><dt>SGST / UTGST</dt><dd>{money(amount.sgst)}</dd></div>
              </>}
              {amount.mode === 'igst' && <div><dt>IGST</dt><dd>{money(amount.igst)}</dd></div>}
            </> : <div><dt>GST</dt><dd>No GST — workshop not registered</dd></div>}
            <div className="job-quick-grand-total"><dt>Total</dt><dd>{money(amount.total)}</dd></div>
          </dl>
          {canEdit ? (
            <div className="job-quick-actions">
              {showValidation && validation && <p className="job-quick-invalid" role="alert">{validation}</p>}
              <button type="button" className="job-quick-primary"
                disabled={busy} onClick={save}>
                {busy ? 'Please wait…' : 'Save Draft'}
              </button>
              <button type="button" className="job-quick-approve"
                disabled={busy || !latest || changed || stale || latest.status === 'Rejected'}
                onClick={approve}>
                <CheckCircle2 size={16} aria-hidden="true"/> Approve & Continue
              </button>
              <small>Save changes first. Approval unlocks Work & Labour.</small>
            </div>
          ) : (
            <div className="job-quick-actions">
              {approvedEstimate && (
                <button type="button" className="job-quick-approved-download"
                  onClick={() => onDownloadApproved?.(approvedEstimate)}>
                  <Download size={16} aria-hidden="true"/> Download Approved PDF
                </button>
              )}
              <button type="button" className="job-quick-outline" onClick={onGoToWork}>Go to current stage</button>
            </div>
          )}
        </section>
      </div>

      <EstimateAddCatalogModal
        request={catalogRequest}
        saving={catalogSaving}
        error={catalogError}
        onClose={() => { if (!catalogSaving) setCatalogRequest(null); }}
        onCreate={createCatalogItem}
      />

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
