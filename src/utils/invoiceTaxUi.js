import { INDIA_STATES, indiaTaxMode } from './indiaGst.js';
import { GST_CGST_SGST_COMPONENT_RATES, GST_IGST_RATES, gstRateChoices } from './gstRatePresets.js';

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

// Django stores TOTAL GST per item and splits it into CGST and SGST.
export const INVOICE_CGST_SGST_RATES = GST_CGST_SGST_COMPONENT_RATES;
export const INVOICE_IGST_RATES = GST_IGST_RATES;

export const invoiceComponentFromTotalRate = (totalRate) =>
  totalRate === '' || totalRate == null ? '' : String(Number(totalRate) / 2);

export const invoiceTotalFromGstComponent = (componentRate) =>
  componentRate === '' ? '' : String(Number(componentRate) * 2);

// Exempt / nil-rated and existing historical rates are still supported
// through the saved rate option, not added as new taxable rate presets.
export const invoiceLineTaxChoices = (mode, currentRate = '') =>
  gstRateChoices(mode, currentRate);
