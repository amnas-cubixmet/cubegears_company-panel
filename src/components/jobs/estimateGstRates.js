import { invoiceLineTaxChoices } from '../../utils/invoiceTaxUi.js';

/** Values sent to Django are TOTAL GST percentages, never the CGST half. */
export const estimateGstOptions = (rate = '', mode = 'unknown', config = null) => {
  const choices = invoiceLineTaxChoices(mode, config);
  const entered = String(rate ?? '').trim();
  if (entered && /^\d+(?:\.\d{1,2})?$/.test(entered) &&
      Number(entered) <= 100 && !choices.some(x => Number(x.totalRate) === Number(entered))) {
    return [...choices, { value: `saved:${entered}`, label: `Previously saved GST ${entered}%`, totalRate: entered }];
  }
  return choices;
};

// Compatible utility for other callers that only need numeric rate strings.
export const estimateGstChoices = (rate = '', mode = 'unknown', config = null) =>
  estimateGstOptions(rate, mode, config).map(choice => choice.value);
