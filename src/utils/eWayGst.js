/** For ordinary domestic goods movement, decide CGST/SGST versus IGST
 * from the actual dispatch and receiving Indian state codes.
 */
const validState = (value) => /^\d{2}$/.test(String(value || '').trim());
export const eWayTaxMode = (doc) => {
  const from = String(doc?.from?.stateCode || '').trim();
  const to = String(doc?.to?.stateCode || '').trim();
  if (!validState(from) || !validState(to)) return 'unknown';
  return from === to ? 'cgst_sgst' : 'igst';
};

export const eWayTotalGstRate = (item) =>
  Number(item?.igstRate || 0) || (Number(item?.cgstRate || 0) + Number(item?.sgstRate || 0));

export const eWaySetGstRate = (item, rate, mode) => {
  if (mode === 'unknown') return item;
  const selected = rate === '' ? '' : Number(rate);
  if (mode === 'igst') {
    return { ...item, cgstRate: '', sgstRate: '', igstRate: selected };
  }
  return { ...item, cgstRate: selected === '' ? '' : selected / 2,
    sgstRate: selected === '' ? '' : selected / 2, igstRate: '' };
};

/** Switching the destination from Kerala to another state moves tax from
 * CGST/SGST to IGST without changing the chosen total GST percentage.
 */
export const eWayReconcileGst = (items, mode) =>
  mode === 'unknown' ? items : (items || []).map((item) =>
    eWaySetGstRate(item, eWayTotalGstRate(item), mode));

export const EWAY_GST_RATES = Object.freeze(['0', '5', '12', '18', '28', '40']);
