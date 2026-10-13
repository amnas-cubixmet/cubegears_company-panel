/**
 * Customer directory money totals are derived from persisted invoice balances.
 * Django InvoiceSerializer uses total / paid / balance, while older mocks use
 * totalAmount / paidAmount / balanceDue.
 *
 * Estimates, cancelled invoices and drafts must not inflate customer debt.
 * No payments are added twice: an invoice's persisted 'paid' already reflects
 * amounts applied to that invoice.
 */
const finiteMoney = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const invoiceMoney = (invoice = {}) => {
  const paid = finiteMoney(invoice.paid ?? invoice.paidAmount);
  const total = finiteMoney(invoice.total ?? invoice.totalAmount);
  const balance = finiteMoney(invoice.balance ?? invoice.balanceDue);
  const effectivePaid = paid ?? (total !== null && balance !== null ? total - balance : null);
  const effectiveBalance = balance ?? (
    total !== null && effectivePaid !== null ? total - effectivePaid : null
  );
  return {
    paid: effectivePaid,
    balance: effectiveBalance,
  };
};

export const customerInvoiceMoney = (invoices = []) => {
  if (!Array.isArray(invoices)) throw new Error('Invoice records were not returned as a list.');
  const relevant = invoices.filter((invoice) => {
    const kind = String(invoice?.kind || 'invoice').toLowerCase();
    const status = String(invoice?.status || '').toLowerCase();
    return kind === 'invoice' && !['draft', 'cancelled', 'canceled', 'void'].includes(status);
  });

  let totalSpent = 0;
  let outstanding = 0;
  let hasUnknownAmount = false;
  for (const invoice of relevant) {
    const amounts = invoiceMoney(invoice);
    if (amounts.paid === null || amounts.balance === null) {
      hasUnknownAmount = true;
      continue;
    }
    totalSpent += amounts.paid;
    outstanding += Math.max(0, amounts.balance);
  }
  return {
    totalSpent: hasUnknownAmount ? null : Math.round(totalSpent * 100) / 100,
    outstanding: hasUnknownAmount ? null : Math.round(outstanding * 100) / 100,
    moneyAvailable: !hasUnknownAmount,
  };
};

export const formatCustomerMoney = (value) => value === null || value === undefined
  ? '—'
  : new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(value));

export const customerStatusLabel = (status) => {
  const normalized = String(status || 'active').trim().toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Active';
};
