import { invoiceMoney, formatCustomerMoney } from './customerDirectoryMoney.js';

// The backend is the financial source of truth: invoices track paid and balance.
// Exclude draft / cancelled invoices and estimates from receivables.
export const activeCustomerInvoices = (invoices = []) => (Array.isArray(invoices) ? invoices : [])
  .filter((item) => String(item?.kind || 'invoice').toLowerCase() === 'invoice'
    && !['draft', 'cancelled', 'canceled', 'void'].includes(String(item.status || '').toLowerCase()));

export const customerProfileFinancials = (invoices, available = true) => {
  if (!available) return { billed: null, paid: null, outstanding: null };
  const relevant = activeCustomerInvoices(invoices);
  let billed = 0;
  let paid = 0;
  let outstanding = 0;
  for (const invoice of relevant) {
    const total = Number(invoice.total ?? invoice.totalAmount);
    const amounts = invoiceMoney(invoice);
    if (!Number.isFinite(total) || amounts.paid === null || amounts.balance === null) {
      return { billed: null, paid: null, outstanding: null };
    }
    billed += total;
    paid += amounts.paid;
    outstanding += Math.max(0, amounts.balance);
  }
  return {
    billed: Math.round(billed * 100) / 100,
    paid: Math.round(paid * 100) / 100,
    outstanding: Math.round(outstanding * 100) / 100,
  };
};

export const profileMoney = formatCustomerMoney;

export const customerInvoiceLabel = (invoice) =>
  String(invoice?.number || invoice?.invoiceNo || 'Invoice');

export const customerInvoiceTotal = (invoice) =>
  profileMoney(invoice?.total ?? invoice?.totalAmount ?? null);

export const customerInvoiceBalance = (invoice) =>
  profileMoney(invoiceMoney(invoice).balance);

export const customerVisitLabel = (customer, jobs = []) => {
  const value = customer?.last_service_date || customer?.lastVisit ||
    jobs[0]?.createdDate || jobs[0]?.created_at;
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('en-IN');
};

export const profileCustomerType = (value) => {
  const type = String(value || 'individual').toLowerCase();
  if (type === 'individual') return 'Individual';
  if (type === 'business') return 'Business';
  return String(value || 'Individual');
};
