export const normalizePaymentRow = (row = {}) => ({
  ...row,
  receiptNo: row.receiptNo || row.receipt_no || row.reference || row.id || '—',
  date: row.date || row.paymentDate || row.payment_date || '',
  customer:
    row.customerName ||
    row.customer_name ||
    (typeof row.customer === 'object' ? row.customer?.name : '') ||
    row.customer ||
    'Customer',
  invoice:
    row.invoiceNo ||
    row.invoice_no ||
    (typeof row.invoice === 'object' ? row.invoice?.number : '') ||
    row.invoice ||
    '',
  method: row.method || row.paymentMethod || row.payment_method || 'Cash',
  amount: Number(row.amount || 0),
  reference: row.reference || row.transactionRef || row.transaction_ref || '',
  status: row.status || 'Completed',
});

export const paymentStatusClass = (status = '') =>
  'is-' + String(status || 'Completed').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const formatPaymentDate = (value) => {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? value + 'T00:00:00' : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
