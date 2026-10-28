/** Shared legacy GST preset helpers.
 * Both this API and the four editors expose the same ten individual labels.
 * Values sent to Django for tax calculation remain COMBINED GST percentages.
 */
import {
  INVOICE_CGST_SGST_RATES, INVOICE_IGST_RATES,
  invoiceLineTaxChoices, invoiceChoiceFromTotalRate,
} from './invoiceTaxUi.js';

export const GST_CGST_SGST_COMPONENT_RATES = INVOICE_CGST_SGST_RATES;
export const GST_IGST_RATES = INVOICE_IGST_RATES;
export const GST_INTRA_TOTAL_RATES = Object.freeze(
  GST_CGST_SGST_COMPONENT_RATES.map(rate => String(Number(rate) * 2)),
);
export const GST_UNKNOWN_TOTAL_RATES = Object.freeze(
  [...new Set([...GST_INTRA_TOTAL_RATES, ...GST_IGST_RATES])],
);

// Legacy helper returns numeric combined rates; the actual dropdown uses
// gstRateChoices() and retains individual CGST, SGST, and IGST selections.
export const gstPresetRatesForMode = mode => {
  if (mode === 'igst') return [...GST_IGST_RATES];
  if (mode === 'cgst_sgst') return [...GST_INTRA_TOTAL_RATES];
  if (mode === 'none') return [];
  return [...GST_UNKNOWN_TOTAL_RATES];
};

export const gstPresetLabel = (mode, totalRate) => {
  const selected = invoiceChoiceFromTotalRate(totalRate, mode);
  return invoiceLineTaxChoices(mode)
    .find(option => option.value === selected)?.label ||
    `Saved / classified GST ${totalRate}%`;
};

export const gstRateChoices = (mode, currentRate = '', { includeZero = false } = {}) => {
  const options = [...invoiceLineTaxChoices(mode)];
  const saved = String(currentRate ?? '').trim();
  if (saved && /^\d+(?:\.\d{1,2})?$/.test(saved) && Number(saved) <= 100 &&
      !options.some(option => Number(option.totalRate) === Number(saved))) {
    options.push({
      value: `saved:${saved}`, label: `Saved / classified GST ${saved}%`,
      totalRate: saved, taxMode: mode,
    });
  }
  if (includeZero) options.unshift({ value: 'saved:0', label: 'GST None (0%)',
    totalRate: '0', taxMode: mode });
  return options;
};
