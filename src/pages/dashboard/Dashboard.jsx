import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardBottomGrid } from '../../components/dashboard/DashboardBottomGrid';
import { DashboardHeading } from '../../components/dashboard/DashboardHeading';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { ServiceOperations } from '../../components/dashboard/ServiceOperations';
import { Loader } from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardData, toggleClockIn } from '../../services/dashboard.service';
import '../../styles/dashboard.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [filterBranch, setFilterBranch] = useState('main');
  const [currentTime, setCurrentTime] = useState('');

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
    fetchDashboard();
  }, [filterPeriod, filterBranch]);

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleClockToggle = async () => {
    const nextStatus =
      data?.attendance?.status === 'CLOCKED_IN'
        ? 'CLOCKED_OUT'
        : 'CLOCKED_IN';

    await toggleClockIn(nextStatus);
    await fetchDashboard();
  };

  if (loading) return <Loader />;

  const isClockedIn = data?.attendance?.status === 'CLOCKED_IN';

  return (
    <div className="dashboard-page">
      <DashboardHeading
        user={user}
        isClockedIn={isClockedIn}
        currentTime={currentTime}
        onClockToggle={handleClockToggle}
      />

      <DashboardStats data={data} />

      <ServiceOperations
        data={data}
        user={user}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        filterBranch={filterBranch}
        setFilterBranch={setFilterBranch}
        onNavigate={navigate}
      />

      <DashboardBottomGrid
        data={data}
        user={user}
        onNavigate={navigate}
      />
    </div>
  );
};
