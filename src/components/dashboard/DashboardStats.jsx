import React from 'react';
import { AlertTriangle, Car, CheckCircle2, Wrench } from 'lucide-react';
import { useFeatureAccess } from '../../context/FeatureAccessContext';

export const DashboardStats = ({ data }) => {
  const { can } = useFeatureAccess();
  const stats = [
    { permission: 'vehicles.view', label: "Today's Vehicles", value: data?.stats?.todaysVehicles || 0, icon: Car, meta: 'Live check-ins' },
    { permission: 'jobs.view', label: 'Ongoing Jobs', value: data?.stats?.ongoingJobs || 0, icon: Wrench, meta: 'Workshop active' },
    { permission: 'jobs.view', label: 'Ready for Delivery', value: data?.stats?.readyForDelivery || 0, icon: CheckCircle2, meta: 'Ready today' },
    { permission: 'invoices.view', label: 'Outstanding Balance', value: data?.stats?.outstandingBalance || '₹0', icon: AlertTriangle, meta: 'Needs follow-up' },
  ];

  return (
    <section className="dashboard-stats">
      {stats.filter((stat) => can(stat.permission)).map(({ label, value, icon: Icon, meta }) => (
        <article key={label} className="dashboard-stat-card">
          <div className="stat-top">
            <div className="stat-copy">
              <span className="stat-label">{label}</span>
              <strong className="stat-value">{value}</strong>
            </div>
            <span className="stat-icon"><Icon size={15} /></span>
          </div>
          <span className="stat-meta">{meta}</span>
        </article>
      ))}
    </section>
  );
};
