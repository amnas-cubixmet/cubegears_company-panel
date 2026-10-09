/** Safe Stock Margin percentage handling for API and older inventory records.
 * Prefer an explicitly supplied value; otherwise derive from sales and cost.
 * When selling price is absent/zero, percentage is not defined.
 */
const finiteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const stockMarginPercentage = (item = {}) => {
  const recorded = finiteNumber(item?.marginPercent ?? item?.margin_percent);
  if (recorded !== null) return recorded;

  const selling = finiteNumber(item?.sellingPrice ?? item?.selling_price ?? item?.price);
  const cost = finiteNumber(item?.costPrice ?? item?.cost_price ?? item?.cost);
  if (selling === null || selling <= 0 || cost === null) return null;

  return ((selling - cost) / selling) * 100;
};

export const formatStockMarginPercent = (item) => {
  const percentage = stockMarginPercentage(item);
  return percentage !== null && Number.isFinite(percentage)
    ? `${percentage.toFixed(1)}%`
    : '—';
};
