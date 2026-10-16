// Keep wallet balances exact in the backend and all accessible labels.
// Only the narrow mobile header uses a shortened visual representation.
const fullFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const thousandFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export const formatWalletBalance = (value, { compact = false } = {}) => {
  if (value == null || value === '') return '—';

  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  // Shorten only values with more than four digits, using K as requested.
  if (compact && Math.abs(amount) >= 10000) {
    return `${thousandFormatter.format(amount / 1000)}K`;
  }

  return fullFormatter.format(amount);
};
