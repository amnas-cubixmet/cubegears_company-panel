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

// Rates represent the *entire line*. For CGST + SGST the percentage is split
// equally by Django. Do not send a component GST rate as the full line rate.
export const invoiceLineTaxChoices = (mode) => {
  if (mode === 'cgst_sgst') return [
    { value: '0', label: 'No GST (0%)' },
    ...[2.5, 5, 6, 9, 14, 18].map((rate) => ({
      value: String(rate * 2),
      label: `CGST ${rate}% + SGST ${rate}% = ${rate * 2}%`,
    })),
  ];
  if (mode === 'igst') return [
    { value: '0', label: 'No GST (0%)' },
    ...[2.5, 5, 9, 12, 18, 28, 36].map((rate) => ({
      value: String(rate), label: `IGST ${rate}%`,
    })),
  ];
  // Keep the GST-rate selector usable while a customer state is being
  // entered. The *legal* CGST/SGST vs IGST split is determined by the
  // place-of-supply field and still validated before saving.
  if (mode === 'unknown') return [0, 2.5, 5, 9, 10, 12, 18, 28, 36]
    .map((rate) => ({ value: String(rate), label: `GST ${rate}%` }));
  return [];
};
