import React, { useEffect, useState } from 'react';
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
import { hasPermission } from '../../utils/permissions';
import { getDashboardData } from '../../services/dashboard.service';
import '../../styles/dashboard.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const featureAccess = useFeatureAccess();
  const can = (permission) => hasPermission(user, permission);

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
    if (featureAccess.enforced) {
      setLoading(false);
      return;
    }
    fetchDashboard();
  }, [filterPeriod, filterBranch, featureAccess.enforced]);

  if (featureAccess.enforced) {
    const activeRoutes = routeConfig.filter(route =>
      route.permission &&
      !['dashboard', 'billing', 'settings', 'notifications'].includes(route.permission.split('.')[0]) &&
      featureAccess.modules.includes(route.permission.split('.')[0]) &&
      hasPermission(user, route.permission)
    );
    return (
      <div className="dashboard-page">
        <section className="operations-card" aria-label="Activated company modules" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Your active features</h1>
          <p style={{ margin: '0 0 24px' }}>Only the features enabled for your company and allowed by your role are shown here.</p>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
            {activeRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <button key={route.id} type="button" onClick={() => navigate(route.path)}
                  className="dashboard-stat-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 20 }}>
                  <Icon size={24} aria-hidden="true" />
                  <strong style={{ display: 'block', marginTop: 12, fontSize: 17 }}>{route.label}</strong>
                  <span style={{ fontSize: 13 }}>Open feature →</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
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
