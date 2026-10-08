import React from 'react';
import { CheckCircle2, Gauge, IndianRupee, Star } from 'lucide-react';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const StaffPerformanceSection = ({ rows = [] }) => {
  const totals = rows.reduce(
    (acc, row) => ({
      jobs: acc.jobs + row.metrics.jobsCompleted,
      revenue: acc.revenue + row.metrics.labourRevenue,
      hours: acc.hours + row.metrics.productiveHours,
      rating: acc.rating + row.metrics.customerRating,
    }),
    { jobs: 0, revenue: 0, hours: 0, rating: 0 },
  );

  const rated = rows.filter((row) => row.metrics.customerRating > 0).length;

  const stats = [
    ['Jobs Completed', totals.jobs, CheckCircle2, 'primary'],
    ['Labour Revenue', money(totals.revenue), IndianRupee, 'success'],
    ['Productive Hours', `${totals.hours.toFixed(1)}h`, Gauge, 'primary'],
    ['Avg. Feedback', rated ? (totals.rating / rated).toFixed(1) : '—', Star, 'warning'],
  ];

  return (
    <div className="staff-dashboard-subpage">
      <section className="staff-subpage-header">
        <div>
          <h2>Staff Performance</h2>
          <p>Jobs, labour revenue, productivity, comeback jobs and customer feedback.</p>
        </div>
      </section>

      <section className="staff-subpage-kpis">
        {stats.map(([label, value, Icon, tone]) => (
          <article key={label}>
            <Icon size={15} className={'is-' + tone}/>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <div className="staff-performance-grid">
        {rows.map(({ person, metrics }) => (
          <article key={person.id} className="staff-workshop-panel staff-performance-card">
            <div className="staff-performance-card__head">
              <div>
                <h3>{person.name}</h3>
                <p>{person.designation} · {person.department || 'Unassigned'}</p>
              </div>
              <strong>{metrics.utilization}%</strong>
            </div>

            <div className="staff-performance-metrics">
              <div><span>Jobs</span><b>{metrics.jobsCompleted}</b></div>
              <div><span>Revenue</span><b>{money(metrics.labourRevenue)}</b></div>
              <div><span>Productive</span><b>{metrics.productiveHours}h</b></div>
              <div><span>Comebacks</span><b>{metrics.comebackJobs}</b></div>
              <div><span>Feedback</span><b>{metrics.customerRating || '—'}</b></div>
            </div>

            <div className="staff-progress">
              <i style={{ width: `${metrics.utilization}%` }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
