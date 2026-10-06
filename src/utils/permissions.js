export const hasPermission = (user, permission) => {
  if (!permission) return true;
  if (user?.is_superuser) return true;

  const role = user?.role;
  if (typeof role === 'string' && role === 'SUPER_ADMIN') return true;

  const permissions =
    role && typeof role === 'object' && Array.isArray(role.permissions)
      ? role.permissions
      : [];

  return permissions.includes('*') || permissions.includes(permission);
};

export const getUserPermissions = (user) => {
  if (user?.is_superuser) return ['*'];

  const role = user?.role;
  if (typeof role === 'string' && role === 'SUPER_ADMIN') return ['*'];

  return role && typeof role === 'object' && Array.isArray(role.permissions)
    ? role.permissions
    : [];
};

const CRUD_PREFIXES = {
  '/customers': 'customers',
  '/vehicles': 'vehicles',
  '/services': 'services',
  '/jobs': 'jobs',
  '/stock': 'stock',
  '/invoices': 'invoices',
  '/quotations': 'invoices',
  '/payments': 'payments',
  '/expenses': 'expenses',
};

const SPECIAL_PATH_PERMISSIONS = [
  ['/staff-management/roles', 'company.manage'],
  ['/staff-management/add', 'staff.create'],
  ['/staff-management/teams', 'staff.edit'],
  ['/staff-management/shifts', 'staff.edit'],
  ['/staff-management/skills', 'staff.edit'],
  ['/dashboard', 'dashboard.view'],
  ['/my-attendance', 'attendance.self'],
  ['/attendance-manager', 'attendance.manage'],
  ['/staff-management', 'staff.view'],
  ['/payroll', 'payroll.view'],
  ['/reports', 'reports.view'],
  ['/notifications', 'notifications.view'],
  ['/settings', 'settings.view'],
  ['/account/billing', 'billing.view'],
  ['/account/storage', 'storage.view'],
  ['/account/templates', 'settings.view'],
  ['/account/security', 'settings.view'],
];

const actionForCrudPath = (pathname, prefix) => {
  const suffix = pathname.slice(prefix.length);

  if (/\/(new|add)$/.test(suffix)) return 'create';
  if (/\/[^/]+\/edit$/.test(suffix)) return 'edit';
  if (/\/[^/]+\/delete$/.test(suffix)) return 'delete';

  return 'view';
};

export const getPermissionForPath = (pathname = '') => {
  if (!pathname || pathname === '/profile' || pathname === '/access-denied') {
    return null;
  }

  const special = SPECIAL_PATH_PERMISSIONS
    .filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (special) return special[1];

  const crudEntry = Object.entries(CRUD_PREFIXES)
    .filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (crudEntry) {
    const [prefix, module] = crudEntry;
    return `${module}.${actionForCrudPath(pathname, prefix)}`;
  }

  return null;
};
