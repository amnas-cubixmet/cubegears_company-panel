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

export const workshopPlaceOfSupply = (context) =>
  formatInvoicePlaceOfSupply(context?.supplierState || context?.companyState || '');

export const localInvoiceDate = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const invoiceTaxMode = (form) => {
  if (form.invoiceType !== 'gst') return 'none';
  return indiaTaxMode(true,
    invoiceStateCode(form.seller?.gstin?.slice(0, 2) || form.seller?.stateCode || form.seller?.state),
    invoiceStateCode(form.customer?.placeOfSupply || form.customer?.stateCode || form.customer?.state),
  );
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
  return [];
};
