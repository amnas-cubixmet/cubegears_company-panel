import { searchMockData } from '../mock/globalSearch.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

const pages = [
  ['Dashboard', '/dashboard', 'Main'],
  ['My Attendance', '/my-attendance/calendar', 'Attendance & HR'],
  ['Attendance Manager', '/attendance-manager/overview', 'Attendance & HR'],
  ['Staff Management', '/staff-management/overview', 'Attendance & HR'],
  ['Payroll', '/payroll', 'Attendance & HR'],
  ['Customers', '/customers/overview', 'Workshop'],
  ['Vehicles', '/vehicles', 'Workshop'],
  ['Services Catalog', '/services', 'Workshop'],
  ['Job Cards', '/jobs', 'Workshop'],
  ['Stock Management', '/stock/overview', 'Workshop'],
  ['Invoices & Billing', '/invoices', 'Finance'],
  ['E-Way Bills', '/invoices/e-way-bills', 'Finance'],
  ['Payments', '/payments', 'Finance'],
  ['Expenses', '/expenses', 'Finance'],
  ['Reports & BI', '/reports', 'Analytics'],
  ['Notifications', '/notifications', 'System'],
  ['Settings', '/settings', 'System'],
  ['Account Billing', '/account/billing', 'Account'],
  ['Media Storage', '/account/storage', 'Account'],
  ['PDF Templates', '/account/templates', 'Account'],
  ['Profile', '/profile', 'Account']
];

const liveStores = [
  { key: 'cubixgear:billing-documents', group: 'Invoices', type: 'Invoice', path: (row) => `/invoices/${row.id}` },
  { key: 'cubixgear:payments', group: 'Payments', type: 'Payment', path: (row) => `/payments/${row.id}` },
  { key: 'cubixgear:notifications', group: 'Notifications', type: 'Notification', path: () => '/notifications' },
  { key: 'cubixgear:vehicles', group: 'Vehicles', type: 'Vehicle', path: (row) => `/vehicles/${row.id}` },
  { key: 'cubixgear:services', group: 'Services', type: 'Service', path: (row) => `/services/${row.id}` },
  { key: 'cubixgear:reports', group: 'Reports', type: 'Report', path: (row) => `/reports/${row.id}` },
  { key: 'cubixgear:stock-items', group: 'Stock', type: 'Stock Item', path: (row) => `/stock/items/${row.id}` }
];

const textValues = (value, depth = 0) => {
  if (depth > 2 || value == null) return [];
  if (['string', 'number', 'boolean'].includes(typeof value)) return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => textValues(item, depth + 1));
  if (typeof value === 'object') return Object.values(value).flatMap((item) => textValues(item, depth + 1));
  return [];
};

const titleFor = (row, fallback) =>
  row.number ||
  row.invoiceNo ||
  row.receiptNo ||
  row.registration ||
  row.partName ||
  row.name ||
  row.title ||
  row.jobNumber ||
  row.id ||
  fallback;

const subtitleFor = (row) => {
  const candidates = [
    row.customer?.name,
    row.customerName,
    row.customer,
    row.vehicle?.registration,
    row.vehicle,
    row.category,
    row.reference,
    row.referenceNo,
    row.status
  ].filter(Boolean);
  return candidates.slice(0, 3).join(' • ');
};

const readLiveStore = (store) => {
  try {
    const raw = localStorage.getItem(store.key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
    return rows.map((row) => ({
      id: `${store.key}:${row.id || titleFor(row, 'record')}`,
      recordId: row.id,
      type: store.type,
      group: store.group,
      title: titleFor(row, store.type),
      subtitle: subtitleFor(row),
      status: row.status,
      route: store.path(row),
      _search: textValues(row).join(' ').toLowerCase()
    }));
  } catch {
    return [];
  }
};

const searchPages = (q) =>
  pages
    .filter(([label, path, section]) => `${label} ${path} ${section}`.toLowerCase().includes(q))
    .map(([label, path, section]) => ({
      id: `page:${path}`,
      type: 'Page',
      group: 'Pages',
      title: label,
      subtitle: section,
      status: 'Open',
      route: path
    }));

const dedupe = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.group}|${item.route}|${item.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const permitted = (item, userRole) => {
  if (userRole === 'Mechanic' || userRole === 'Technician') {
    return !['Invoices', 'Payments', 'Employees', 'Suppliers'].includes(item.group);
  }
  if (userRole === 'Storekeeper') {
    return !['Employees', 'Payments'].includes(item.group);
  }
  return true;
};

/**
 * Global workspace search.
 * Searches navigation pages plus current browser data and falls back to project mock data.
 * Production API can replace this implementation without changing the GlobalSearch component.
 */
export const searchWorkspace = async (query, userRole = 'Admin') => {
  const q = String(query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  if (!USE_MOCK) {
    // Future backend:
    // const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
    // return response.data;
    return searchPages(q).filter((item) => permitted(item, userRole));
  }

  await new Promise((resolve) => setTimeout(resolve, 80));

  const pageResults = searchPages(q);
  const liveResults = liveStores
    .flatMap(readLiveStore)
    .filter((item) => item._search.includes(q) || item.title.toLowerCase().includes(q))
    .map(({ _search, ...item }) => item);

  const mockResults = searchMockData(query).map((item) => {
    if (item.group === 'Employees') return { ...item, route: '/staff-management/staff' };
    if (item.group === 'Suppliers') return { ...item, route: '/stock/suppliers' };
    if (item.group === 'Payments') return { ...item, route: item.id ? `/payments/${item.id}` : '/payments' };
    return item;
  });

  return dedupe([...pageResults, ...liveResults, ...mockResults])
    .filter((item) => permitted(item, userRole))
    .slice(0, 80);
};
