import {
  LayoutDashboard, Clock, UserCheck, Users, DollarSign, UserPlus, Car, Wrench,
  ClipboardList, Package, Boxes, FileText, CreditCard, Receipt, BarChart3, Bell, Settings
} from 'lucide-react';

export const ROUTE_SECTIONS = {
  MAIN: 'Main',
  ATTENDANCE_HR: 'Attendance & HR',
  OPERATIONS: 'Workshop Operations',
  FINANCE: 'Finance & Billing',
  ANALYTICS_SYSTEM: 'Analytics & Settings'
};

export const routeConfig = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, section: ROUTE_SECTIONS.MAIN, mobilePrimary: true, permission: 'dashboard.view' },
  { id: 'jobs', label: 'Job Cards', path: '/jobs', icon: ClipboardList, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: true, permission: 'jobs.view' },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: true, permission: 'customers.view' },
  {
    id: 'stock', label: 'Stock Mgmt', path: '/stock', icon: Boxes, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: true, permission: 'stock.view',
    children: [
      { id: 'stock-dashboard', label: 'All Stock', path: '/stock' },
      { id: 'stock-items', label: 'Stock Items', path: '/stock/items' },
      { id: 'stock-in', label: 'Stock In', path: '/stock/in' },
      { id: 'stock-issue', label: 'Stock Issue', path: '/stock/issue' },
      { id: 'stock-return', label: 'Stock Return', path: '/stock/return' },
      { id: 'stock-transfer', label: 'Stock Transfer', path: '/stock/transfer' },
      { id: 'stock-adjustments', label: 'Stock Adjustment', path: '/stock/adjustments' },
      { id: 'stock-reservations', label: 'Reservations', path: '/stock/reservations' },
      { id: 'stock-low-stock', label: 'Low Stock', path: '/stock/low-stock' },
      { id: 'stock-ledger', label: 'Movement Ledger', path: '/stock/ledger' },
      { id: 'stock-suppliers', label: 'Suppliers', path: '/stock/suppliers' },
      { id: 'stock-purchases', label: 'Purchase Records', path: '/stock/purchases' },
      { id: 'stock-count', label: 'Stock Count', path: '/stock/count' },
      { id: 'stock-reports', label: 'Reports', path: '/stock/reports' }
    ]
  },
  {
    id: 'my-attendance', label: 'My Attendance', path: '/my-attendance', icon: Clock, section: ROUTE_SECTIONS.ATTENDANCE_HR, mobilePrimary: false, permission: 'attendance.self',
    children: [
      { id: 'att-calendar', label: 'Holiday Calendar', path: '/my-attendance/calendar' },
      { id: 'att-history', label: 'History & Logs', path: '/my-attendance/history' },
      { id: 'att-leave', label: 'Leave Requests', path: '/my-attendance/leave' },
      { id: 'att-summary', label: 'Summary', path: '/my-attendance/summary' }
    ]
  },
  {
    id: 'attendance-manager', label: 'Attendance Manager', path: '/attendance-manager', icon: UserCheck, section: ROUTE_SECTIONS.ATTENDANCE_HR, mobilePrimary: false, permission: 'attendance.manage',
    children: [
      { id: 'att-mgr-approvals', label: 'Approvals', path: '/attendance-manager/approvals' },
      { id: 'att-mgr-team', label: 'Team Review', path: '/attendance-manager/team-review' },
      { id: 'att-mgr-master', label: 'Master Records', path: '/attendance-manager/master-records' },
      { id: 'att-mgr-leave-types', label: 'Leave Types', path: '/attendance-manager/leave-types' },
      { id: 'att-mgr-holidays', label: 'Holidays', path: '/attendance-manager/holidays' },
      { id: 'att-mgr-rules', label: 'Rules & Settings', path: '/attendance-manager/rules' }
    ]
  },
  {
    id: 'staff-management', label: 'Staff Management', path: '/staff-management', icon: UserPlus, section: ROUTE_SECTIONS.ATTENDANCE_HR, mobilePrimary: false, permission: 'staff.view',
    children: [
      { id: 'staff-list', label: 'Staff', path: '/staff-management/staff' },
      { id: 'staff-roles', label: 'User Roles', path: '/staff-management/roles' }
    ]
  },
  {
    id: 'payroll', label: 'Payroll', path: '/payroll', icon: DollarSign, section: ROUTE_SECTIONS.ATTENDANCE_HR, mobilePrimary: false, permission: 'payroll.view',
    children: [
      { id: 'payroll-dashboard', label: 'Dashboard', path: '/payroll', permission: 'payroll.view' },
      { id: 'payroll-salary-structure', label: 'Salary Structure', path: '/payroll/salary-structure', permission: 'salary_structure.view' },
      { id: 'payroll-monthly', label: 'Monthly Payroll', path: '/payroll/monthly', permission: 'payroll.view' },
      { id: 'payroll-approvals', label: 'Approvals', path: '/payroll/approvals', permission: 'payroll.review' },
      { id: 'payroll-disbursal', label: 'Disbursal', path: '/payroll/disbursal', permission: 'payroll.record_payment' },
      { id: 'payroll-advances', label: 'Advances', path: '/payroll/advances', permission: 'payroll.view' },
      { id: 'payroll-payslips', label: 'Payslips', path: '/payroll/payslips', permission: 'payslip.view_staff' },
      { id: 'payroll-reports', label: 'Reports', path: '/payroll/reports', permission: 'payroll.export' }
    ]
  },
  { id: 'vehicles', label: 'Vehicles', path: '/vehicles', icon: Car, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: false, permission: 'vehicles.view' },
  { id: 'services', label: 'Services Catalog', path: '/services', icon: Wrench, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: false, permission: 'services.view' },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: Package, section: ROUTE_SECTIONS.OPERATIONS, mobilePrimary: false, permission: 'inventory.view' },
  {
    id: 'invoices',
    label: 'Invoices & Billing',
    path: '/invoices',
    icon: FileText,
    section: ROUTE_SECTIONS.FINANCE,
    mobilePrimary: false,
    permission: 'invoices.view',
    children: [
      { id: 'billing-invoices', label: 'Invoices & Estimates', path: '/invoices' },
      { id: 'billing-eway-bills', label: 'E-Way Bills', path: '/invoices/e-way-bills' }
    ]
  },
  { id: 'payments', label: 'Payments', path: '/payments', icon: CreditCard, section: ROUTE_SECTIONS.FINANCE, mobilePrimary: false, permission: 'payments.view' },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: Receipt, section: ROUTE_SECTIONS.FINANCE, mobilePrimary: false, permission: 'expenses.view' },
  { id: 'reports', label: 'Reports & BI', path: '/reports', icon: BarChart3, section: ROUTE_SECTIONS.ANALYTICS_SYSTEM, mobilePrimary: false, permission: 'reports.view' },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell, section: ROUTE_SECTIONS.ANALYTICS_SYSTEM, mobilePrimary: false, permission: 'notifications.view' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, section: ROUTE_SECTIONS.ANALYTICS_SYSTEM, mobilePrimary: false, permission: 'settings.manage' }
];

export const mobilePrimaryRoutes = routeConfig.filter((route) => route.mobilePrimary);
export const mobileMoreRoutes = routeConfig.filter((route) => !route.mobilePrimary);
