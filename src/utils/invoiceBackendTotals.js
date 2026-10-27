/** Convert Django Decimal JSON strings into INR numbers for display. */
export const normalizeBackendInvoiceTotals = (response, localTotals) => {
  if (!response || typeof response !== 'object' || !Array.isArray(response.lineTotals)) {
    return null;
  }
  const moneyFields = ['itemSubtotal', 'documentDiscount', 'taxable', 'cgst', 'sgst',
    'igst', 'tax', 'adjustment', 'total', 'paid', 'balance'];
  const next = { ...localTotals, ...response };
  for (const key of moneyFields) {
    const value = Number(response[key]);
    if (!Number.isFinite(value)) return null;
    next[key] = value;
  }
  if (response.lineTotals.length !== (localTotals.lineTotals || []).length) return null;
  next.lineTotals = response.lineTotals.map((row) => {
    const taxable = Number(row.taxable);
    const gst = Number(row.gst);
    const total = Number(row.total);
    if (![taxable, gst, total].every(Number.isFinite)) return null;
    return { taxable, gst, total, cgst: Number(row.cgst), sgst: Number(row.sgst), igst: Number(row.igst) };
  });
  if (next.lineTotals.some((row) => row == null)) return null;
  return next;
};

