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

// Tailwind is the global UI foundation. Keep only shared tokens/reset plus
// feature styles that still contain page-specific rules.
import './styles/component-system.css';
import './styles/crud-system.css';
import './styles/settings-system.css';
import './styles/saas-account.css';
import './styles/workflow-enhancements.css';
import './styles/billing-system.css';
import './styles/job-card-simple.css';
import './styles/simple-workflow.css';
import './styles/simple-jobs.css';
import './styles/my-attendance.css';
import './styles/attendance-manager.css';
import './styles/staff-management.css';
import './styles/payroll.css';
import './styles/job-management.css';
import './styles/customer-management.css';
import './styles/stock-management.css';
import './styles/jobs-dashboard-alignment.css';
import './styles/outside-labour.css';
import './styles/jobs-ops-polish.css';
import './styles/outside-labour-dashboard.css';

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
