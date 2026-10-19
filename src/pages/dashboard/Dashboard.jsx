import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  DashboardBottomGrid,
  DashboardStats,
  ServiceOperations,
} from '../../components/dashboard';
import { Loader } from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { routeConfig } from '../../routes/routeConfig';
import { getDashboardData } from '../../services/dashboard.service';
import '../../styles/dashboard.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const featureAccess = useFeatureAccess();
  const can = featureAccess.can;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [filterBranch, setFilterBranch] = useState('main');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData({
        period: filterPeriod,
        branch: filterBranch,
      });
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Dashboard is a free module. Django strips data from paid modules the
    // user's role has not purchased, and widgets have their own can() checks.
    fetchDashboard();
  }, [filterPeriod, filterBranch]);

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      {/* Free Dashboard stays available; paid-module shortcuts are permission-filtered. */}
      {featureAccess.enforced && <section className="operations-card" aria-label="Available company modules" style={{ padding: 20 }}>
        <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Your available modules</h1>
        <p>Dashboard and Staff Management are free. Other modules require an active Feature Label and your role permission.</p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginTop: 14 }}>
          {routeConfig.filter(route => route.permission &&
            !['dashboard', 'billing', 'settings', 'notifications'].includes(route.permission.split('.')[0]) &&
            featureAccess.can(route.permission)
          ).map(route => {
            const Icon = route.icon;
            return <button key={route.id} type="button" className="dashboard-stat-card" onClick={() => navigate(route.path)}
              style={{ textAlign: 'left', cursor: 'pointer', padding: 16 }}>
              <Icon size={22} aria-hidden="true" />
              <strong style={{ display: 'block', marginTop: 10, fontSize: 15 }}>{route.label}</strong>
              <span style={{ fontSize: 12 }}>Open module →</span>
            </button>;
          })}
        </div>
      </section>}
      <DashboardStats data={data} />

      {can('jobs.view') && <ServiceOperations
        data={data}
        user={user}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterBranch={filterBranch}
        setFilterBranch={setFilterBranch}
        onNavigate={navigate}
      />}

      <DashboardBottomGrid
        data={data}
        user={user}
        onNavigate={navigate}
      />
    </div>
  );
};
