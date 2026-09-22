import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ThemeProvider } from './context/ThemeContext';
import { PayrollPeriodProvider } from './context/PayrollPeriodContext';
import './api/registerSaasEndpoints';
import { AppRoutes } from './routes/AppRoutes';
import './routes/saasRouteRegistration';
import './index.css';
import './styles/tailwind-system.css';
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

export function App() {
  return (
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
  );
}

export default App;
