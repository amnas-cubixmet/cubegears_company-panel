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

// The component controls are a *paired* intra-state GST choice. Django's
// invoice item has one total taxRate, which it splits equally into CGST/SGST.
// Never persist the CGST or SGST component alone as the whole tax rate.
export const INVOICE_CGST_SGST_RATES = Object.freeze(['2.5', '5', '9', '18']);
// IGST is the entire GST percentage. Repeated IGST 5% is one option.
export const INVOICE_IGST_RATES = Object.freeze(['5']);

export const invoiceComponentFromTotalRate = (totalRate) =>
  totalRate === '' || totalRate == null ? '' : String(Number(totalRate) / 2);

export const invoiceTotalFromGstComponent = (componentRate) =>
  componentRate === '' ? '' : String(Number(componentRate) * 2);

/** Dropdown presets; Django still validates/calculate taxes using total taxRate.
 * Saved documents with older classified rates remain selectable in the editors.
 */
export const invoiceLineTaxChoices = (mode, backendChoices = null) => {
  const supplied = backendChoices?.[mode];
  if ((mode === 'cgst_sgst' || mode === 'igst') && Array.isArray(supplied)
      && supplied.length && supplied.every(item => /^\d+(?:\.\d+)?$/.test(String(item?.value))
        && typeof item?.label === 'string')) {
    return supplied.filter((item, index) =>
      supplied.findIndex(other => String(other.value) === String(item.value)) === index);
  }
  if (mode === 'cgst_sgst') return INVOICE_CGST_SGST_RATES.map(rate => ({
    value: invoiceTotalFromGstComponent(rate),
    label: `CGST ${rate}% + SGST ${rate}% = ${Number(rate) * 2}%`,
  }));
  if (mode === 'igst') return INVOICE_IGST_RATES.map(rate => ({
    value: rate, label: `IGST ${rate}%`,
  }));
  // Allow a combined rate to be chosen while POS is entered; never guess tax mode.
  // The server rejects saving without a valid legal place of supply.
  if (mode === 'unknown') return [...new Set([
    ...INVOICE_CGST_SGST_RATES.map(invoiceTotalFromGstComponent),
    ...INVOICE_IGST_RATES,
  ])].map(value => ({ value, label: `GST ${value}%` }));
  return [];
};
