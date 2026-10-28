/** Company request: paired CGST/SGST and a single deduplicated IGST 5%.
 * Values sent to Django are ALWAYS the total GST %, never a half rate.
 * Historical/stock-classified rates not in this preset stay readable and saved.
 */
export const GST_CGST_SGST_COMPONENT_RATES = Object.freeze(['2.5', '5', '9', '18']);
export const GST_IGST_RATES = Object.freeze(['5']); // supplied twice, one unique rate

export const GST_INTRA_TOTAL_RATES = Object.freeze(
  GST_CGST_SGST_COMPONENT_RATES.map((rate) => String(Number(rate) * 2)),
);

export const GST_UNKNOWN_TOTAL_RATES = Object.freeze(
  [...new Set([...GST_INTRA_TOTAL_RATES, ...GST_IGST_RATES])],
);

export const gstPresetRatesForMode = (mode) => {
  if (mode === 'cgst_sgst') return [...GST_INTRA_TOTAL_RATES];
  if (mode === 'igst') return [...GST_IGST_RATES];
  if (mode === 'none') return [];
  return [...GST_UNKNOWN_TOTAL_RATES];
};

export const gstPresetLabel = (mode, totalRate) => {
  const text = String(totalRate ?? '');
  if (mode === 'cgst_sgst') {
    const half = Number(text) / 2;
    return `CGST ${half}% + SGST ${half}% = ${Number(text)}%`;
  }
  if (mode === 'igst') return `IGST ${text}%`;
  return `GST ${text}%`;
};

export const gstRateChoices = (mode, currentRate = '', { includeZero = false } = {}) => {
  const rates = gstPresetRatesForMode(mode);
  const saved = String(currentRate ?? '').trim();
  if (saved && /^\d+(?:\.\d{1,2})?$/.test(saved) && Number(saved) <= 100
      && !rates.some((rate) => Number(rate) === Number(saved))) {
    rates.push(saved); // preserve old documents and legally classified stock GST
  }
  if (includeZero && !rates.some((rate) => Number(rate) === 0)) rates.unshift('0');
  return rates.map((value) => ({
    value,
    label: value === '0' ? 'GST None (0%)' :
      gstPresetRatesForMode(mode).includes(value)
        ? gstPresetLabel(mode, value)
        : `Saved / classified GST ${value}%`,
  }));
};
