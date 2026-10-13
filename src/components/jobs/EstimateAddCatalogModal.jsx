import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { validateEstimateCatalogDraft } from './estimateNewCatalog';

const emptyDraft = (kind, initialName = '') => ({
  kind, name: initialName, sku: '', costPrice: '', price: '', brand: '',
  workType: 'Labour', code: '',
});

export function EstimateAddCatalogModal({ request, saving, error, onClose, onCreate }) {
  const [draft, setDraft] = useState(() => emptyDraft('service'));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!request) return;
    setDraft(emptyDraft(request.kind, request.name || ''));
    setFieldErrors({});
  }, [request]);

  const isPart = request?.kind === 'part';
  const change = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = (event) => {
    event.preventDefault();
    if (saving) return;
    const errors = validateEstimateCatalogDraft(draft);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    onCreate(draft);
  };

  return (
    <ResponsiveModalSheet
      isOpen={Boolean(request)}
      onClose={() => { if (!saving) onClose(); }}
      title={isPart ? 'Add New Spare Part' : 'Add New Work / Service'}
      maxWidth="520px"
    >
      <form className="job-estimate-create-form" onSubmit={submit}>
        <p className="job-estimate-create-intro">
          {isPart
            ? 'Save this part to the stock catalogue and add it to the estimate. Starting stock is zero.'
            : 'Save this work to the service catalogue and add it to the estimate.'}
        </p>
        {error && <p className="job-estimate-create-error" role="alert">{error}</p>}
        <label>
          {isPart ? 'Part Name *' : 'Work / Service Name *'}
          <input autoFocus required maxLength={isPart ? 180 : 160}
            value={draft.name} onChange={(event) => change('name', event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)} placeholder={isPart ? 'e.g. Air Filter' : 'e.g. Brake Service'}/>
          {fieldErrors.name && <small role="alert">{fieldErrors.name}</small>}
        </label>
        {isPart ? (
          <>
            <div className="job-estimate-create-two">
              <label>SKU / Part Number *
                <input required maxLength={80} value={draft.sku} onChange={(event) => change('sku', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.sku)} placeholder="e.g. FIL-001"/>
                {fieldErrors.sku && <small role="alert">{fieldErrors.sku}</small>}
              </label>
              <label>Brand
                <input maxLength={100} value={draft.brand} onChange={(event) => change('brand', event.target.value)}
                  placeholder="Optional"/>
              </label>
            </div>
            <div className="job-estimate-create-two">
              <label>Purchase Cost / Unit (₹) *
                <input required type="number" min="0" max="10000000" step="0.01"
                  value={draft.costPrice} onChange={(event) => change('costPrice', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.costPrice)} placeholder="0.00"/>
                {fieldErrors.costPrice && <small role="alert">{fieldErrors.costPrice}</small>}
              </label>
              <label>Selling Price / Unit (₹) *
                <input required type="number" min="0" max="10000000" step="0.01"
                  value={draft.price} onChange={(event) => change('price', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.price)} placeholder="0.00"/>
                {fieldErrors.price && <small role="alert">{fieldErrors.price}</small>}
              </label>
            </div>
            <p className="job-estimate-create-note">This creates a product only. Stock will be added later through Receive Stock, not through this estimate.</p>
          </>
        ) : (
          <div className="job-estimate-create-two">
            <label>Work Type
              <select value={draft.workType} onChange={(event) => change('workType', event.target.value)}>
                <option value="Labour">Labour</option>
                <option value="Service">Service</option>
                <option value="Other">Other Work</option>
              </select>
            </label>
            <label>Work Rate (₹) *
              <input required type="number" min="0" max="10000000" step="0.01"
                value={draft.price} onChange={(event) => change('price', event.target.value)}
                aria-invalid={Boolean(fieldErrors.price)} placeholder="0.00"/>
              {fieldErrors.price && <small role="alert">{fieldErrors.price}</small>}
            </label>
          </div>
        )}
        <div className="job-estimate-create-actions">
          <button type="button" className="job-estimate-create-cancel" disabled={saving} onClick={onClose}>Cancel</button>
          <button type="submit" className="job-estimate-create-save" disabled={saving}>
            <Plus size={16} aria-hidden="true"/>{saving ? 'Saving…' : isPart ? 'Save Part & Add' : 'Save Work & Add'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
}
