export const ROLE_PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'company', label: 'Company & Roles', actions: ['manage'] },
  { key: 'customers', label: 'Customers', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'vehicles', label: 'Vehicles', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'services', label: 'Services', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'jobs', label: 'Job Cards', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'stock', label: 'Stock Management', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'invoices', label: 'Invoices', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'payments', label: 'Payments', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'expenses', label: 'Expenses', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'attendance', label: 'Attendance', actions: ['self', 'manage'] },
  { key: 'staff', label: 'Staff', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'payroll', label: 'Payroll', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'reports', label: 'Reports', actions: ['view'] },
  { key: 'notifications', label: 'Notifications', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'settings', label: 'Settings', actions: ['view', 'manage'] },
  { key: 'billing', label: 'Plan & Billing', actions: ['view', 'edit'] },
  { key: 'storage', label: 'Storage', actions: ['view', 'manage'] },
];

export const createPermissionMatrix = (enabled = false) =>
  Object.fromEntries(
    ROLE_PERMISSION_MODULES.map((module) => [
      module.key,
      Object.fromEntries(module.actions.map((action) => [action, enabled])),
    ])
  );

export const permissionCodesToMatrix = (codes = []) => {
  const list = Array.isArray(codes) ? codes : [];
  if (list.includes('*')) return createPermissionMatrix(true);

  const matrix = createPermissionMatrix(false);
  for (const code of list) {
    const [module, action] = String(code).split('.');
    if (matrix[module] && Object.prototype.hasOwnProperty.call(matrix[module], action)) {
      matrix[module][action] = true;
    }
  }
  return matrix;
};

export const permissionMatrixToCodes = (matrix = {}) =>
  ROLE_PERMISSION_MODULES.flatMap((module) =>
    module.actions
      .filter((action) => Boolean(matrix?.[module.key]?.[action]))
      .map((action) => `${module.key}.${action}`)
  );

export const permissionActionLabel = (action) => {
  if (action === 'self') return 'Self Access';
  if (action === 'manage') return 'Manage';
  return action.charAt(0).toUpperCase() + action.slice(1);
};
