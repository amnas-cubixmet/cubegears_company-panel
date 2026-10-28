import { INDIA_STATES } from './indiaGst.js';

/** Tax-mode classification is meaningful only for real Indian state codes. */
const validCodes = new Set(INDIA_STATES.map(([code]) => code));
const validState = (value) => validCodes.has(String(value || '').trim());

export const eWayGstinStateCode = (gstin) => {
  const value = String(gstin || '').trim().toUpperCase();
  // GSTIN starts with its state code; URP has no registered code.
  // This lets the State Code autofill while the rest of the GSTIN is typed.
  const prefix = /^\d{2}/.exec(value)?.[0] || '';
  return validState(prefix) ? prefix : '';
};

export const eWayRecipientWithGstin = (recipient, enteredGstin) => {
  const gstin = String(enteredGstin || '').trim().toUpperCase();
  const inferredState = eWayGstinStateCode(gstin);
  const previousGstin = String(recipient?.gstin || '').trim().toUpperCase();
  // Preserve an explicitly entered state when the user starts entering URP;
  // clear a formerly registered GSTIN's auto-state on switching to URP.
  const stateCode = inferredState || (
    gstin === 'URP' && (!eWayGstinStateCode(previousGstin))
      ? String(recipient?.stateCode || '').trim()
      : ''
  );
  return { ...recipient, gstin, stateCode };
};

/** For ordinary domestic dispatch: same state = CGST/SGST; different = IGST.
 * Unknown jurisdiction must never be guessed from GST Rate alone.
 */
export const eWayTaxMode = (doc) => {
  const from = String(doc?.from?.stateCode || '').trim();
  const to = String(doc?.to?.stateCode || '').trim();
  if (!validState(from) || !validState(to)) return 'unknown';
  return from === to ? 'cgst_sgst' : 'igst';
};

// Retain the chosen rate independently until the dispatch/destination state
// is known. Legacy saved rows can still derive it from tax components.
export const eWayTotalGstRate = (item) =>
  item?.gstRate !== '' && item?.gstRate != null
    ? Number(item.gstRate)
    : Number(item?.igstRate || 0) || (
      Number(item?.cgstRate || 0) + Number(item?.sgstRate || 0)
    );

export const eWaySetGstRate = (item, rate, mode) => {
  const selected = rate === '' || rate == null ? '' : Number(rate);
  const base = { ...item, gstRate: selected, cgstRate: '', sgstRate: '', igstRate: '' };
  // Never fabricate GST components when a legal state is missing.
  if (mode === 'unknown' || selected === '') return base;
  if (mode === 'igst') return { ...base, igstRate: selected };
  if (mode === 'cgst_sgst') {
    return { ...base, cgstRate: selected / 2, sgstRate: selected / 2 };
  }
  return base;
};

/** Reconcile GST rate on FROM/TO state changes; stale components are cleared. */
export const eWayReconcileGst = (items, mode) =>
  (items || []).map((item) => eWaySetGstRate(item, eWayTotalGstRate(item), mode));

// The selected options are a single TOTAL GST rate, never standalone CGST.
export const EWAY_GST_RATES = Object.freeze(['0', '5', '12', '18', '28', '40']);
