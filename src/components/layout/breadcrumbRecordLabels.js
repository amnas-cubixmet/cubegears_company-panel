// Only a human-readable name/registration should be shown for record routes.
// UUIDs remain in internal navigation and API URLs, never as visible labels.
const staticRoutes = {
  customers: new Set(['new', 'add', 'all', 'overview', 'edit', 'vehicles', 'service-history', 'outstanding', 'reminders', 'reports']),
  vehicles: new Set(['new', 'add']),
};

export const isRecordPath = (kind, id) =>
  Boolean(staticRoutes[kind] && id && !staticRoutes[kind].has(id));

export const recordBreadcrumbFallback = (kind) =>
  kind === 'customers' ? 'Customer Profile' : 'Vehicle Profile';

export const recordBreadcrumbLabel = (kind, record) => {
  const label = kind === 'customers'
    ? String(record?.name || '').trim()
    : String(record?.registration || record?.regNo || record?.licensePlate || '').trim();
  return label || recordBreadcrumbFallback(kind);
};
