import { gstRateChoices, gstPresetLabel, gstPresetRatesForMode } from '../../utils/gstRatePresets.js';

/** Dropdown returns total GST percentages; backend does all tax splitting. */
export const estimateGstChoices = (currentRate = '', mode = 'unknown') =>
  gstRateChoices(mode, currentRate).map(({ value }) => value);

export const estimateGstLabel = (rate, mode = 'unknown') =>
  gstPresetRatesForMode(mode).includes(String(rate))
    ? gstPresetLabel(mode, rate)
    : `Saved / classified GST ${rate}%`;
