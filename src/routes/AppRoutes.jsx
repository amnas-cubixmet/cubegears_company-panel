import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { MyAttendance } from '../pages/attendance/MyAttendance';
import { AttendanceManager } from '../pages/attendance/AttendanceManager';
import { StaffAttendanceDetails } from '../pages/attendance-manager/StaffAttendanceDetails';
import { StaffManagement } from '../pages/employees/StaffManagement';
import { Payroll } from '../pages/staff-management/Payroll';
import { CustomerList } from '../pages/customers/CustomerList';
import { AddCustomer } from '../pages/customers/AddCustomer';
import { EditCustomer } from '../pages/customers/EditCustomer';
import { CustomerDetails } from '../pages/customers/CustomerDetails';
import { VehicleList } from '../pages/vehicles/VehicleList';
import { ServiceList } from '../pages/services/ServiceList';
import { JobList } from '../pages/jobs/JobList';
import { JobCreatePage } from '../pages/jobs/JobCreatePage';
import { JobDetails } from '../pages/jobs/JobDetails';
import { JobStatus } from '../pages/jobs/JobStatus';
import { InventoryList } from '../pages/inventory/InventoryList';
import { StockManagement } from '../pages/stock/StockManagement';
import { InvoiceList } from '../pages/invoices/InvoiceList';
import { EWayBillPage } from '../pages/invoices/EWayBillPage';
import { PaymentList } from '../pages/payments/PaymentList';
import { ExpenseList } from '../pages/expenses/ExpenseList';
import { Reports } from '../pages/reports/Reports';
import { Notifications } from '../pages/notifications/Notifications';
import { Settings } from '../pages/settings/Settings';
import { Profile } from '../pages/profile/Profile';
import { SaaSAccount } from '../pages/saas/SaaSAccount';
import { StorageHistory } from '../pages/saas/StorageHistory';
import { StorageDayDetails } from '../pages/saas/StorageDayDetails';

function RootRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={`/dashboard${location.search}`}
      replace
    />
  );
}

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/my-attendance" element={<Navigate to="/my-attendance/calendar" replace />} />
      <Route path="/my-attendance/calendar" element={<MyAttendance />} />
      <Route path="/my-attendance/history" element={<MyAttendance />} />
      <Route path="/my-attendance/leave" element={<MyAttendance />} />
      <Route path="/my-attendance/summary" element={<MyAttendance />} />

      <Route path="/attendance-manager" element={<Navigate to="/attendance-manager/overview" replace />} />
      <Route path="/attendance-manager/overview" element={<AttendanceManager />} />
      <Route path="/attendance-manager/daily" element={<AttendanceManager />} />
      <Route path="/attendance-manager/calendar" element={<AttendanceManager />} />
      <Route path="/attendance-manager/leave-requests" element={<AttendanceManager />} />
      <Route path="/attendance-manager/overtime" element={<AttendanceManager />} />
      <Route path="/attendance-manager/shifts" element={<AttendanceManager />} />
      <Route path="/attendance-manager/reports" element={<AttendanceManager />} />
      <Route path="/attendance-manager/rules" element={<AttendanceManager />} />

      <Route path="/attendance-manager/approvals" element={<Navigate to="/attendance-manager/leave-requests" replace />} />
      <Route path="/attendance-manager/team-review" element={<Navigate to="/attendance-manager/daily" replace />} />
      <Route path="/attendance-manager/team-review/:staffId/:date" element={<StaffAttendanceDetails />} />
      <Route path="/attendance-manager/master-records" element={<Navigate to="/attendance-manager/reports" replace />} />
      <Route path="/attendance-manager/leave-types" element={<Navigate to="/attendance-manager/rules" replace />} />
      <Route path="/attendance-manager/holidays" element={<Navigate to="/attendance-manager/calendar" replace />} />

      <Route path="/staff-management" element={<Navigate to="/staff-management/staff" replace />} />
      <Route path="/staff-management/staff" element={<StaffManagement />} />
      <Route path="/staff-management/roles" element={<StaffManagement />} />
      <Route path="/staff-management/payroll" element={<Navigate to="/payroll" replace />} />
      <Route path="/payroll" element={<Payroll section="overview" />} />
      <Route path="/payroll/employees" element={<Payroll section="employees" />} />
      <Route path="/payroll/attendance" element={<Payroll section="attendance" />} />
      <Route path="/payroll/salary-setup" element={<Payroll section="salary" />} />
      <Route path="/payroll/incentives" element={<Payroll section="incentives" />} />
      <Route path="/payroll/overtime" element={<Payroll section="overtime" />} />
      <Route path="/payroll/advances" element={<Payroll section="advances" />} />
      <Route path="/payroll/run" element={<Payroll section="run" />} />
      <Route path="/payroll/payslips" element={<Payroll section="payslips" />} />
      <Route path="/payroll/reports" element={<Payroll section="reports" />} />

      <Route path="/payroll/salary-structure" element={<Navigate to="/payroll/salary-setup" replace />} />
      <Route path="/payroll/monthly" element={<Navigate to="/payroll/run" replace />} />
      <Route path="/payroll/approvals" element={<Navigate to="/payroll/run" replace />} />
      <Route path="/payroll/disbursal" element={<Navigate to="/payroll/run" replace />} />

      <Route path="/customers" element={<CustomerList />} />
      <Route path="/customers/new" element={<AddCustomer />} />
      <Route path="/customers/add" element={<Navigate to="/customers/new" replace />} />
      <Route path="/customers/:id" element={<CustomerDetails />} />
      <Route path="/customers/:id/edit" element={<EditCustomer />} />
      <Route path="/customers/edit/:id" element={<EditCustomer />} />

      <Route path="/vehicles" element={<VehicleList />} />
      <Route path="/vehicles/new" element={<VehicleList />} />
      <Route path="/vehicles/add" element={<Navigate to="/vehicles/new" replace />} />
      <Route path="/vehicles/:id" element={<VehicleList />} />
      <Route path="/vehicles/:id/edit" element={<VehicleList />} />
      <Route path="/vehicles/:id/delete" element={<VehicleList />} />

      <Route path="/services" element={<ServiceList />} />
      <Route path="/services/new" element={<ServiceList />} />
      <Route path="/services/:id" element={<ServiceList />} />
      <Route path="/services/:id/edit" element={<ServiceList />} />
      <Route path="/services/:id/delete" element={<ServiceList />} />

      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/new" element={<JobCreatePage />} />
      <Route path="/jobs/add" element={<Navigate to="/jobs/new" replace />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/jobs/:id/overview" element={<JobDetails />} />
      <Route path="/jobs/:id/complaints" element={<JobDetails />} />
      <Route path="/jobs/:id/inspection" element={<JobDetails />} />
      <Route path="/jobs/:id/work" element={<JobDetails />} />
      <Route path="/jobs/:id/parts" element={<JobDetails />} />
      <Route path="/jobs/:id/estimate" element={<JobDetails />} />
      <Route path="/jobs/:id/updates" element={<JobDetails />} />
      <Route path="/jobs/:id/qc" element={<JobDetails />} />
      <Route path="/jobs/:id/invoice" element={<JobDetails />} />
      <Route path="/jobs/:id/activity" element={<JobDetails />} />
      <Route path="/jobs/:id/edit" element={<JobDetails />} />
      <Route path="/jobs/:id/status" element={<JobStatus />} />

      <Route path="/jobs/:id/costs" element={<JobDetails />} />
      <Route path="/jobs/:id/photos" element={<JobDetails />} />
      <Route path="/jobs/:id/history" element={<JobDetails />} />
      <Route path="/jobs/:id/*" element={<JobDetails />} />

      <Route path="/inventory" element={<InventoryList />} />
      <Route path="/inventory/new" element={<InventoryList />} />
      <Route path="/inventory/:id" element={<InventoryList />} />
      <Route path="/inventory/:id/edit" element={<InventoryList />} />
      <Route path="/inventory/:id/delete" element={<InventoryList />} />

      <Route path="/stock" element={<StockManagement />} />
      <Route path="/stock/new" element={<StockManagement />} />
      <Route path="/stock/:id/edit" element={<StockManagement />} />
      <Route path="/stock/:id/delete" element={<StockManagement />} />
      <Route path="/stock/items" element={<StockManagement />} />
      <Route path="/stock/items/:itemId" element={<StockManagement />} />
      <Route path="/stock/in" element={<StockManagement />} />
      <Route path="/stock/issue" element={<StockManagement />} />
      <Route path="/stock/return" element={<StockManagement />} />
      <Route path="/stock/transfer" element={<StockManagement />} />
      <Route path="/stock/adjustments" element={<StockManagement />} />
      <Route path="/stock/reservations" element={<StockManagement />} />
      <Route path="/stock/low-stock" element={<StockManagement />} />
      <Route path="/stock/ledger" element={<StockManagement />} />
      <Route path="/stock/suppliers" element={<StockManagement />} />
      <Route path="/stock/purchases" element={<StockManagement />} />
      <Route path="/stock/count" element={<StockManagement />} />
      <Route path="/stock/reports" element={<StockManagement />} />
      <Route path="/stock/:id" element={<StockManagement />} />

      <Route path="/invoices" element={<InvoiceList />} />
      <Route path="/invoices/e-way-bills" element={<EWayBillPage />} />
      <Route path="/invoices/e-way-bills/new" element={<EWayBillPage />} />
      <Route path="/invoices/e-way-bills/:ewbId" element={<EWayBillPage />} />
      <Route path="/invoices/e-way-bills/:ewbId/edit" element={<EWayBillPage />} />
      <Route path="/invoices/e-way-bills/:ewbId/delete" element={<EWayBillPage />} />
      <Route path="/invoices/new" element={<InvoiceList />} />
      <Route path="/invoices/create" element={<Navigate to="/invoices/new" replace />} />
      <Route path="/invoices/:id" element={<InvoiceList />} />
      <Route path="/invoices/:id/edit" element={<InvoiceList />} />
      <Route path="/invoices/:id/delete" element={<InvoiceList />} />
      <Route path="/quotations" element={<Navigate to="/invoices?kind=estimate" replace />} />
      <Route path="/quotations/new" element={<Navigate to="/invoices/new?kind=estimate" replace />} />

      <Route path="/payments" element={<PaymentList />} />
      <Route path="/payments/new" element={<PaymentList />} />
      <Route path="/payments/:id" element={<PaymentList />} />
      <Route path="/payments/:id/edit" element={<PaymentList />} />
      <Route path="/payments/:id/delete" element={<PaymentList />} />

      <Route path="/expenses" element={<ExpenseList />} />
      <Route path="/expenses/new" element={<ExpenseList />} />
      <Route path="/expenses/:id" element={<ExpenseList />} />
      <Route path="/expenses/:id/edit" element={<ExpenseList />} />
      <Route path="/expenses/:id/delete" element={<ExpenseList />} />

      <Route path="/reports" element={<Reports />} />
      <Route path="/reports/new" element={<Reports />} />
      <Route path="/reports/:id" element={<Reports />} />
      <Route path="/reports/:id/edit" element={<Reports />} />
      <Route path="/reports/:id/delete" element={<Reports />} />

      <Route path="/notifications" element={<Notifications />} />
      <Route path="/notifications/new" element={<Notifications />} />
      <Route path="/notifications/:id" element={<Notifications />} />
      <Route path="/notifications/:id/edit" element={<Notifications />} />
      <Route path="/notifications/:id/delete" element={<Notifications />} />

      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/account" element={<Navigate to="/account/billing" replace />} />
      <Route path="/account/billing" element={<SaaSAccount section="billing" />} />
      <Route path="/account/storage" element={<SaaSAccount section="storage" />} />
      <Route path="/account/storage/history" element={<StorageHistory />} />
      <Route path="/account/storage/history/:date" element={<StorageDayDetails />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
