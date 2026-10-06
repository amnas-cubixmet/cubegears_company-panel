export const hasPermission = (user, permission) => {
  if (!permission) return true;
  if (user?.is_superuser) return true;

  const role = user?.role;
  const permissions =
    role && typeof role === 'object' && Array.isArray(role.permissions)
      ? role.permissions
      : [];

  return permissions.includes('*') || permissions.includes(permission);
};

export const getUserPermissions = (user) => {
  if (user?.is_superuser) return ['*'];
  const role = user?.role;
  return role && typeof role === 'object' && Array.isArray(role.permissions)
    ? role.permissions
    : [];
};

const PATH_PERMISSIONS = [
  ['/dashboard', 'dashboard.view'],
  ['/my-attendance', 'attendance.self'],
  ['/attendance-manager', 'attendance.manage'],
  ['/staff-management', 'staff.view'],
  ['/payroll', 'payroll.view'],
  ['/customers', 'customers.view'],
  ['/vehicles', 'vehicles.view'],
  ['/services', 'services.view'],
  ['/jobs', 'jobs.view'],
  ['/stock', 'stock.view'],
  ['/invoices', 'invoices.view'],
  ['/quotations', 'invoices.view'],
  ['/payments', 'payments.view'],
  ['/expenses', 'expenses.view'],
  ['/reports', 'reports.view'],
  ['/notifications', 'notifications.view'],
  ['/settings', 'settings.view'],
  ['/account/billing', 'billing.view'],
  ['/account/storage', 'storage.view'],
  ['/account/templates', 'settings.view'],
  ['/account/security', 'settings.view'],
];

export const getPermissionForPath = (pathname = '') => {
  if (!pathname || pathname === '/profile' || pathname === '/access-denied') {
    return null;
  }

  const match = PATH_PERMISSIONS
    .filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return match?.[1] || null;
};
