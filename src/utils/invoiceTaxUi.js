import { INDIA_STATES, indiaTaxMode } from './indiaGst.js';

const STATE_BY_CODE = new Map(INDIA_STATES);
const CODE_BY_STATE = new Map(INDIA_STATES.map(([code, name]) => [name.toLowerCase(), code]));

/** Company/recipient tax location; never assume every workshop is in Kerala. */
export const invoiceStateCode = (value) => {
  const text = String(value ?? '').trim();
  const prefix = /^(\d{2})(?:\b|\s*[-–]\s*|$)/.exec(text);
  if (prefix && STATE_BY_CODE.has(prefix[1])) return prefix[1];
  return CODE_BY_STATE.get(text.toLowerCase()) || '';
};

export const formatInvoicePlaceOfSupply = (value) => {
  const text = String(value ?? '').trim();
  const code = invoiceStateCode(text);
  return code ? `${code}-${STATE_BY_CODE.get(code)}` : text;
};

export const workshopPlaceOfSupply = (context) => {
  // gst-context is authoritative. If an older backend omits supplierState,
  // the verified seller GSTIN prefix still identifies its registered state.
  const gstinState = invoiceStateCode(String(context?.gstin || '').slice(0, 2));
  return formatInvoicePlaceOfSupply(
    invoiceStateCode(context?.supplierState) || gstinState ||
    invoiceStateCode(context?.companyState) || '',
  );
};

export const localInvoiceDate = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const invoiceTaxMode = (form) => {
  if (form.invoiceType !== 'gst') return 'none';
  const supplier = invoiceStateCode(
    form.seller?.gstin?.slice(0, 2) || form.seller?.stateCode || form.seller?.state,
  );
  const location = String(
    form.customer?.placeOfSupply || form.customer?.stateCode || form.customer?.state || '',
  ).trim();
  const actualPlace = invoiceStateCode(location);
  // New documents default to the workshop state until the customer supply
  // location is known. A *supplied but invalid* state must not be guessed.
  return indiaTaxMode(true, supplier, actualPlace || (!location ? supplier : ''));
};

// Exactly ten separate labels as requested. A CGST or SGST choice represents
// one half of a paired intra-state total; the Django line taxRate is TOTAL GST.
// Example: selecting CGST 9% yields 18% total, split 9% + 9% by Django.
export const INVOICE_CGST_SGST_RATES = Object.freeze(['2.5', '5', '9', '18']);
export const INVOICE_IGST_RATES = Object.freeze(['5', '18']);

export const invoiceComponentFromTotalRate = (totalRate) =>
  totalRate === '' || totalRate == null ? '' : String(Number(totalRate) / 2);

export const invoiceTotalFromGstComponent = (componentRate) =>
  componentRate === '' ? '' : String(Number(componentRate) * 2);

const LOCAL_GST_CHOICES = Object.freeze([
  ...INVOICE_CGST_SGST_RATES.map(rate => ({
    value: `cgst:${rate}`, label: `CGST ${rate}%`,
    totalRate: invoiceTotalFromGstComponent(rate), taxMode: 'cgst_sgst',
  })),
  ...INVOICE_CGST_SGST_RATES.map(rate => ({
    value: `sgst:${rate}`, label: `SGST ${rate}%`,
    totalRate: invoiceTotalFromGstComponent(rate), taxMode: 'cgst_sgst',
  })),
  ...INVOICE_IGST_RATES.map(rate => ({
    value: `igst:${rate}`, label: `IGST ${rate}%`,
    totalRate: rate, taxMode: 'igst',
  })),
]);

/** Return all ten options in identical order on invoice, E-Way and estimate. */
export const invoiceLineTaxChoices = (_mode, backendChoices = null) => {
  // Server-provided presets take precedence if their shape is valid.
  if (Array.isArray(backendChoices) && backendChoices.length === 10 &&
      backendChoices.every(option =>
        typeof option?.value === 'string' &&
        typeof option?.label === 'string' &&
        /^(cgst|sgst|igst):\d+(?:\.\d+)?$/.test(option.value) &&
        /^\d+(?:\.\d+)?$/.test(String(option.totalRate)) &&
        ['cgst_sgst', 'igst'].includes(option.taxMode))) {
    return backendChoices;
  }
  return LOCAL_GST_CHOICES;
};

export const invoiceTotalRateFromChoice = (value, backendChoices = null) => {
  const choice = invoiceLineTaxChoices('', backendChoices)
    .find(item => item.value === String(value));
  return choice ? String(choice.totalRate) : '';
};

/** Keeps SGST selection visible while editing; persisted invoices use paired
 * rate so one deterministic choice is reconstructed on reload.
 */
export const invoiceChoiceFromTotalRate = (totalRate, mode, recentChoice = '', backendChoices = null) => {
  const rate = String(totalRate ?? '').trim();
  if (!rate) return '';
  const choices = invoiceLineTaxChoices(mode, backendChoices);
  if (recentChoice) {
    const picked = choices.find(item => item.value === recentChoice &&
      String(item.totalRate) === rate && (mode === 'unknown' || item.taxMode === mode));
    if (picked) return picked.value;
  }
  const expected = choices.find(item => String(item.totalRate) === rate &&
    (mode === 'unknown' || item.taxMode === mode));
  return expected?.value || `saved:${rate}`;
};
