import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ThemeProvider } from './context/ThemeContext';
import { PayrollPeriodProvider } from './context/PayrollPeriodContext';
import { AppErrorBoundary } from './components/feedback/AppErrorBoundary';
import './api/registerSaasEndpoints';
import { AppRoutes } from './routes/AppRoutes';
import './routes/saasRouteRegistration';
import './index.css';
import './styles/globals.css';
import './styles/component-system.css';
import './styles/responsive.css';
import './styles/crud-system.css';
import './styles/settings-system.css';
import './styles/saas-account.css';
import './styles/ui-refinements.css';
import './styles/workflow-enhancements.css';
import './styles/billing-system.css';
import './styles/job-card-simple.css';
import './styles/simple-workflow.css';
import './styles/simple-jobs.css';
import './styles/dashboard-polish.css';
import './styles/header-system.css';
// Tailwind semantic bridge loads last so it becomes the final app-wide UI layer.
import './styles/tailwind-system.css';
// Final cross-project normalization layer.
import './styles/ui-reset.css';
// Final scoped UI contract for all My Attendance routes.
import './styles/my-attendance.css';
// Final scoped UI contract for all Attendance Manager routes.
import './styles/attendance-manager.css';
// Final scoped UI contract for all Staff Management routes.
import './styles/staff-management.css';
// Final scoped UI contract for all Payroll routes.
import './styles/payroll.css';
// Final scoped UI contract for all Job Card Management routes.
import './styles/job-management.css';
// Final scoped UI contract for all Customers Management routes.
import './styles/customer-management.css';
// Final scoped UI contract for all Stock Management routes.
import './styles/stock-management.css';

export function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CompanyProvider>
            <PayrollPeriodProvider>
              <AppRoutes />
            </PayrollPeriodProvider>
          </CompanyProvider>
        </AuthProvider>
      </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
