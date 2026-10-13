// All report series are computed from source records. No placeholder chart data.
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const amount = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const dateOnly = (value) => {
  if (!value) return '';
  const text = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
};
const dateFrom = (row, type) => dateOnly(type === 'invoice'
  ? row.date || row.issueDate || row.issue_date
  : type === 'payment' ? row.date || row.paymentDate || row.created_at
    : row.expenseDate || row.date || row.created_at);
export const inReportRange = (date, from, to) =>
  Boolean(date) && (!from || date >= from) && (!to || date <= to);

export const monthBounds = (monthName, year) => {
  const idx = MONTHS.findIndex((m) => m.toLowerCase() === String(monthName).toLowerCase());
  const y = Number(year);
  if (idx < 0 || !Number.isInteger(y) || y < 2000 || y > 2100) return null;
  const last = new Date(Date.UTC(y, idx + 1, 0)).getUTCDate();
  return {
    from: y + '-' + String(idx + 1).padStart(2, '0') + '-01',
    to: y + '-' + String(idx + 1).padStart(2, '0') + '-' + String(last).padStart(2, '0'),
  };
};

export const invoiceValue = (row) => {
  // Django persists total and balance; do not recalculate them from draft items.
  const total = amount(row.total ?? row.totalAmount);
  const paid = amount(row.paid ?? row.paidAmount);
  const balance = amount(row.balance ?? row.balanceDue);
  return {
    total: total ?? (paid !== null && balance !== null ? paid + balance : null),
    balance: balance ?? (total !== null && paid !== null ? Math.max(0, total - paid) : null),
  };
};
const isBilled = (r) => String(r.kind || 'invoice').toLowerCase() === 'invoice'
  && !['draft', 'cancelled', 'canceled', 'void'].includes(String(r.status || '').toLowerCase());
const isCollected = (r) => ['completed', 'paid', 'success', 'successful'].includes(
  String(r.status || '').toLowerCase());

// Resolve backend ForeignKey IDs to user-facing branch/staff names. Never
// render raw UUID values in the dropdown when the directory lookup is missing.
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const plainValue = (ref) => String(typeof ref === 'object'
  ? (ref?.name || ref?.full_name || ref?.id || '') : (ref ?? '')).trim();
const resolveLabel = (value, entries = []) => {
  const raw = plainValue(value);
  const match = entries.find((entry) =>
    [entry.id, entry.name].some((field) => String(field || '').toLowerCase() === raw.toLowerCase()));
  return match?.name || (uuidPattern.test(raw) ? '' : raw);
};
export const branchLabel = (row, directory = {}) => resolveLabel(
  row.branchName ?? row.branch_name ?? row.branch, directory.branches || []);
export const staffLabel = (row, directory = {}) => resolveLabel(
  row.staffName ?? row.staff_name ?? row.staff ??
    row.recordedBy ?? row.recorded_by ?? row.created_by, directory.staff || []);

export const scopeMatches = (row, branch, staff, type, directory = {}) => {
  const requestedBranch = resolveLabel(branch, directory.branches || []) || branch;
  const requestedStaff = resolveLabel(staff, directory.staff || []) || staff;
  if (branch && branch !== 'All' && branchLabel(row, directory) !== requestedBranch) return false;
  // Physical stock valuation is a current snapshot and has no staff dimension.
  if (type !== 'stock' && staff && staff !== 'All' && staffLabel(row, directory) !== requestedStaff) return false;
  return true;
};

export const scopedReportRows = (raw, from, to, branch = 'All', staff = 'All', directory = {}) => ({
  invoices: (raw.invoices || []).filter((r) =>
    isBilled(r) && inReportRange(dateFrom(r, 'invoice'), from, to)
    && scopeMatches(r, branch, staff, 'invoice', directory)),
  payments: (raw.payments || []).filter((r) =>
    inReportRange(dateFrom(r, 'payment'), from, to)
    && scopeMatches(r, branch, staff, 'payment', directory)),
  expenses: (raw.expenses || []).filter((r) =>
    inReportRange(dateFrom(r, 'expense'), from, to)
    && scopeMatches(r, branch, staff, 'expense', directory)),
  stock: (raw.stock || []).filter((r) => scopeMatches(r, branch, staff, 'stock', directory)),
});

export const aggregateReports = (rows, loaded) => {
  const billedRows = rows.invoices || [];
  const paymentRows = rows.payments || [];
  const expenseRows = rows.expenses || [];
  const stockRows = rows.stock || [];
  const totals = billedRows.map(invoiceValue);
  const knownBills = totals.every((t) => t.total !== null && t.balance !== null);
  const moneyPaid = paymentRows.filter(isCollected);
  const knownPayments = moneyPaid.every((r) => amount(r.amount) !== null);
  const knownExpenses = expenseRows.every((r) => amount(r.amount) !== null);
  const knownStock = stockRows.every((r) => amount(r.onHand) !== null
    && amount(r.costPrice ?? r.cost_price) !== null);
  const sales = loaded.invoices && knownBills ? totals.reduce((s, t) => s + t.total, 0) : null;
  const outstanding = loaded.invoices && knownBills
    ? totals.reduce((s, t) => s + Math.max(0, t.balance), 0) : null;
  const collected = loaded.payments && knownPayments
    ? moneyPaid.reduce((s, r) => s + amount(r.amount), 0) : null;
  const expenseTotal = loaded.expenses && knownExpenses
    ? expenseRows.reduce((s, r) => s + amount(r.amount), 0) : null;
  const stockValue = loaded.stock && knownStock ? stockRows.reduce(
    (s, r) => s + amount(r.onHand) * amount(r.costPrice ?? r.cost_price), 0) : null;
  const lowStock = stockRows.filter((r) => {
    const available = amount(r.onHand) - (amount(r.reserved) || 0);
    const threshold = amount(r.minimumStock ?? r.minimum_stock);
    return Number.isFinite(available) && threshold !== null && available <= threshold;
  });
  const categories = new Map();
  for (const row of expenseRows) {
    if (amount(row.amount) === null) continue;
    const key = String(row.category || 'Uncategorized');
    categories.set(key, (categories.get(key) || 0) + amount(row.amount));
  }
  return {
    invoiceRows: billedRows, paymentRows, expenseRows, stockRows,
    sales, outstanding, collected, expenseTotal,
    netCash: collected !== null && expenseTotal !== null ? collected - expenseTotal : null,
    stockValue, lowStock,
    expenseCategories: Array.from(categories, ([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
  };
};

export const reportChartSeries = (rows, from, to) => {
  if (!from || !to || from > to) return [];
  const start = Date.parse(from + 'T00:00:00Z');
  const end = Date.parse(to + 'T00:00:00Z');
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const days = Math.round((end - start) / 86400000) + 1;
  if (days > 3660) return []; // Explicitly avoid huge unbounded chart ranges.
  const step = days <= 14 ? 1 : days <= 90 ? 7 : days <= 730 ? 30 : 90;
  const buckets = Array.from({ length: Math.ceil(days / step) }, (_, i) => {
    const first = new Date(start + i * step * 86400000).toISOString().slice(0, 10);
    const last = new Date(Math.min(end, start + (i * step + step - 1) * 86400000))
      .toISOString().slice(0, 10);
    return {
      from: first, to: last,
      label: step === 1 ? first.slice(8) : first.slice(5),
      sales: 0, collected: 0, expenses: 0,
    };
  });
  const add = (list, type, key, moneyOf, predicate = () => true) => {
    for (const row of list) {
      if (!predicate(row)) continue;
      const day = dateFrom(row, type);
      const value = moneyOf(row);
      if (value === null) continue;
      const at = buckets.find((b) => day >= b.from && day <= b.to);
      if (at) at[key] += value;
    }
  };
  add(rows.invoices || [], 'invoice', 'sales', (r) => invoiceValue(r).total);
  add(rows.payments || [], 'payment', 'collected', (r) => amount(r.amount), isCollected);
  add(rows.expenses || [], 'expense', 'expenses', (r) => amount(r.amount));
  return buckets.map((b) => ({
    ...b, sales: Math.round(b.sales * 100) / 100,
    collected: Math.round(b.collected * 100) / 100,
    expenses: Math.round(b.expenses * 100) / 100,
    net: Math.round((b.collected - b.expenses) * 100) / 100,
  }));
};

export const reportFilterOptions = (raw, directory = {}) => {
  const rows = [...(raw.invoices || []), ...(raw.payments || []),
    ...(raw.expenses || []), ...(raw.stock || [])];
  const sort = (names) => ['All', ...new Set(names.filter(Boolean)
    .filter((name) => name !== 'All'))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b));
  return {
    branches: sort([
      ...(directory.branches || []).map((row) => row.name),
      ...rows.map((r) => branchLabel(r, directory)),
    ]),
    staff: sort([
      ...(directory.staff || []).map((row) => row.name),
      ...rows.map((r) => staffLabel(r, directory)),
    ]),
  };
};

export const moneyText = (value) => value === null || value === undefined ? '—'
  : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(value);
