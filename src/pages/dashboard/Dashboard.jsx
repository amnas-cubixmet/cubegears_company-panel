import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardBottomGrid,
  DashboardHeading,
  DashboardStats,
  ServiceOperations,
} from '../../components/dashboard';
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
  const [attendanceError, setAttendanceError] = useState('');

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

  const handleClockToggle = async (action) => {
    if (!action) return;
    setAttendanceError('');
    try {
      await toggleClockIn(action, {
        locationRequired: Boolean(data?.attendance?.locationRequired),
        locationTrackingEnabled: Boolean(data?.attendance?.locationTrackingEnabled),
      });
      await fetchDashboard();
    } catch (error) {
      setAttendanceError(error?.message || 'Attendance action failed.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <DashboardHeading
        user={user}
        attendance={data?.attendance}
        currentTime={currentTime}
        error={attendanceError}
        onAttendanceAction={handleClockToggle}
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
