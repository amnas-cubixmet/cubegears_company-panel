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
import { getDashboardData } from '../../services/dashboard.service';
import '../../styles/dashboard.css';

export const Dashboard = () => {
  const useNavigateValue = useNavigate();
  const { user } = useAuth();
  const { can } = useFeatureAccess();

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
      <DashboardStats data={data} />

      {can('jobs.view') && <ServiceOperations
        data={data}
        user={user}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterBranch={filterBranch}
        setFilterBranch={setFilterBranch}
        onNavigate={useNavigateValue}
      />}

      <DashboardBottomGrid
        data={data}
        user={user}
        onNavigate={useNavigateValue}
      />
    </div>
  );
};
