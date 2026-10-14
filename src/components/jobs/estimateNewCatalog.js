// New catalogue entries created from the estimate use the same limits as
// their Django Service and StockItem models. No stock movements are recorded here.
const validPrice = (value) => {
  const input = String(value ?? '').trim();
  const amount = Number(input);
  return /^\d+(?:\.\d{1,2})?$/.test(input) && Number.isFinite(amount) &&
    amount >= 0 && amount <= 10000000;
};

export const validateEstimateCatalogDraft = (draft = {}) => {
  const errors = {};
  const isPart = draft.kind === 'part';
  const name = String(draft.name || '').trim();
  if (!name) errors.name = isPart ? 'Enter a part name.' : 'Enter a work / service name.';
  else if (name.length > (isPart ? 180 : 160)) errors.name = 'Name is too long.';

  if (!validPrice(draft.price)) {
    errors.price = isPart ? 'Enter a valid selling price (max 2 decimals).'
      : 'Enter a valid work rate (max 2 decimals).';
  }
  if (isPart) {
    const sku = String(draft.sku || '').trim();
    if (!sku) errors.sku = 'Enter a unique SKU / part number.';
    else if (sku.length > 80) errors.sku = 'SKU must be 80 characters or fewer.';
    if (!validPrice(draft.costPrice)) {
      errors.costPrice = 'Enter a valid purchase cost (max 2 decimals).';
    }
  }
  return errors;
};

export const buildEstimateCatalogSelection = (draft, created) => ({
  description: created?.partName || created?.name || String(draft.name).trim(),
  type: draft.kind === 'part' ? 'Part' : draft.workType || 'Labour',
  unitPrice: String(created?.sellingPrice ?? created?.price ?? draft.price),
  catalogId: created?.id ?? '',
  catalogCode: draft.kind === 'part' ? (created?.sku || draft.sku) : (created?.code || draft.code || ''),
});
