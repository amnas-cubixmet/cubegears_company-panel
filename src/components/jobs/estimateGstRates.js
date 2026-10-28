import { EWAY_GST_RATES } from '../../utils/eWayGst.js';

/** GST choices are total tax percentages; preserve legacy saved rates. */
export const estimateGstChoices = (rate = '') => {
  const entered = String(rate ?? '').trim();
  const choices = [...EWAY_GST_RATES];
  if (entered && /^\d+(?:\.\d{1,2})?$/.test(entered)
      && Number(entered) <= 100 && !choices.some(x => Number(x) === Number(entered))) {
    choices.push(entered);
  }
  return choices;
};
