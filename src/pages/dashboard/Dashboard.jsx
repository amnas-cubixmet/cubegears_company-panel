import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  PackageSearch,
  Plus,
  ReceiptText,
  Search,
  UserPlus,
  UserRound,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { getDashboardData, toggleClockIn } from '../../services/dashboard.service';
import { Loader } from '../../components/common/Loader';
import '../../styles/dashboard.css';

const statusClass = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('confirm') || value.includes('complete') || value.includes('ready')) return 'is-success';
  if (value.includes('pending') || value.includes('check')) return 'is-warning';
  if (value.includes('delay') || value.includes('critical')) return 'is-danger';
  return 'is-info';
};

const repairStages = [
  { key: 'inspection', label: 'Inspection' },
  { key: 'awaitingApproval', label: 'Approval' },
  { key: 'inProgress', label: 'Repairing' },
  { key: 'qualityCheck', label: 'QC' },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [filterBranch, setFilterBranch] = useState('main');
  const [currentTime, setCurrentTime] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    const response = await getDashboardData({ period: filterPeriod, branch: filterBranch });
    setData(response);
    setSelectedBookingId((current) => current || response?.bookings?.[0]?.id || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterPeriod, filterBranch]);

  useEffect(() => {
    const update = () => setCurrentTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedBooking = useMemo(
    () => data?.bookings?.find((booking) => booking.id === selectedBookingId) || data?.bookings?.[0],
    [data, selectedBookingId],
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.bookings || [];
    return (data?.bookings || []).filter((booking) =>
      [booking.customer, booking.vehicle, booking.service, booking.id]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    );
  }, [data, search]);

  const handleClockToggle = async () => {
    const nextStatus = data?.attendance?.status === 'CLOCKED_IN' ? 'CLOCKED_OUT' : 'CLOCKED_IN';
    await toggleClockIn(nextStatus);
    fetchDashboard();
  };

  if (loading) return <Loader />;

  const isClockedIn = data?.attendance?.status === 'CLOCKED_IN';
  const stats = [
    { label: "Today's Vehicles", value: data?.stats?.todaysVehicles || 0, icon: Car, meta: 'Live check-ins' },
    { label: 'Ongoing Jobs', value: data?.stats?.ongoingJobs || 0, icon: Wrench, meta: 'Workshop active' },
    { label: 'Ready for Delivery', value: data?.stats?.readyForDelivery || 0, icon: CheckCircle2, meta: 'Ready today' },
    { label: 'Outstanding Balance', value: data?.stats?.outstandingBalance || '₹0', icon: AlertTriangle, meta: 'Needs follow-up' },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-heading">
        <div className="dashboard-heading-copy">
          <h1>Dashboard</h1>
          <p>Workshop operations, live repairs and business status.</p>
        </div>

        <div className="duty-controls">
          <div className="duty-status">
            <span className={`duty-dot ${isClockedIn ? 'is-online' : 'is-offline'}`} />
            <strong>{user?.name || 'User'}</strong>
            <span>{isClockedIn ? 'Working' : 'Off duty'}</span>
            <span className="duty-separator">·</span>
            <span>{currentTime}</span>
          </div>
          <button
            type="button"
            className={`dashboard-button duty-button ${isClockedIn ? 'is-danger' : 'is-primary'}`}
            onClick={handleClockToggle}
          >
            <Clock size={14} />
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </section>

      <section className="dashboard-stats">
        {stats.map(({ label, value, icon: Icon, meta }) => (
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

      <section className="operations-card">
        <header className="operations-header">
          <div>
            <h2>Service Operations</h2>
            <p>Track today's bookings and repair progress.</p>
          </div>

          <div className="operations-tools">
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
              <option value="main">Main Garage</option>
              <option value="express">Express Bay</option>
            </select>

            {hasPermission(user, 'jobs.create') && (
              <button type="button" className="dashboard-button is-primary" onClick={() => navigate('/jobs/new')}>
                <Plus size={14} />
                New Job Card
              </button>
            )}
          </div>
        </header>

        <div className="operations-grid">
          <div className="booking-pane">
            <div className="dashboard-search">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, vehicle or job"
              />
            </div>

            <div className="booking-list">
              {filteredBookings.map((booking) => {
                const active = booking.id === selectedBooking?.id;
                return (
                  <button
                    key={booking.id}
                    type="button"
                    className={`booking-row ${active ? 'is-active' : ''}`}
                    onClick={() => setSelectedBookingId(booking.id)}
                  >
                    <div className="booking-row-top">
                      <strong>{booking.id} · {booking.customer}</strong>
                      <span className={`status-pill ${statusClass(booking.status)}`}>{booking.status}</span>
                    </div>
                    <span className="booking-vehicle">{booking.vehicle}</span>
                    <div className="booking-row-bottom">
                      <span>{booking.service}</span>
                      <time>{booking.time}</time>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="job-detail-pane">
            {selectedBooking ? (
              <div className="job-detail">
                <div className="job-detail-head">
                  <div>
                    <div className="job-id-row">
                      <strong>{selectedBooking.id}</strong>
                      <span className={`status-pill ${statusClass(selectedBooking.status)}`}>{selectedBooking.status}</span>
                    </div>
                    <span>{selectedBooking.vehicle}</span>
                  </div>
                  <button type="button" className="text-link" onClick={() => navigate('/jobs')}>View Job</button>
                </div>

                <div className="job-meta-grid">
                  <div><small>Customer</small><strong>{selectedBooking.customer}</strong></div>
                  <div><small>Booking Time</small><strong>{selectedBooking.time}</strong></div>
                  <div><small>Advisor</small><strong>{user?.name || 'Alex Rivera'}</strong></div>
                  <div className="job-meta-wide"><small>Service Request</small><strong>{selectedBooking.service}</strong></div>
                </div>

                <div className="repair-details">
                  <h3>Repair Details</h3>
                  <div className="repair-detail-grid">
                    <div><span>Job Status</span><strong>{selectedBooking.status}</strong></div>
                    <div><span>Assigned Team</span><strong>Workshop A</strong></div>
                  </div>
                </div>

                <div className="progress-card">
                  <div className="progress-title-row">
                    <strong>Progress</strong>
                    <span>Live workshop stages</span>
                  </div>
                  <div className="progress-grid">
                    {repairStages.map((stage, index) => (
                      <div key={stage.key} className="progress-stage">
                        <span className={`progress-circle ${index < 3 ? 'is-done' : ''}`}>
                          {index < 3 ? <CheckCircle2 size={12} /> : index + 1}
                        </span>
                        <small>{stage.label}</small>
                        <strong>{data?.jobProgress?.[stage.key] ?? 0}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-job">No booking selected</div>
            )}
          </div>

          <aside className="repair-pane">
            <button
              type="button"
              className="active-repair-card active-repair-clickable"
              onClick={() => {
                const jobId = data?.recentJobs?.[0]?.id;
                navigate(jobId ? `/jobs/${jobId}` : '/jobs');
              }}
              aria-label="Open active repair job"
            >
              <div className="vehicle-visual"><Car size={52} strokeWidth={1.1} /></div>
              <div className="active-repair-main">
                <div>
                  <strong>{data?.recentJobs?.[0]?.vehicle || 'Vehicle'}</strong>
                  <small>{data?.recentJobs?.[0]?.id}</small>
                </div>
                <span className="status-pill is-success">In Progress</span>
              </div>

              <div className="repair-meta">
                <div><small>Customer</small><strong>{data?.recentJobs?.[0]?.customer}</strong></div>
                <div><small>Mechanic</small><strong>{data?.recentJobs?.[0]?.mechanic}</strong></div>
              </div>

              <div className="overall-progress">
                <div><span>Overall Progress</span><strong>70%</strong></div>
                <div className="progress-track"><span /></div>
              </div>
              <div className="active-repair-open-hint">
                <span>Open Job Card</span>
                <ArrowRight size={11} />
              </div>
            </button>

            <div className="insights-card">
              <div className="insights-title"><Activity size={13} /><strong>Smart Insights</strong></div>
              <div className="insight-list">
                {(data?.stockAlerts || []).slice(0, 2).map((alert) => (
                  <button key={alert.id} type="button" className="insight-item" onClick={() => navigate('/stock')}>
                    <PackageSearch size={13} className={alert.priority === 'critical' ? 'danger-icon' : 'warning-icon'} />
                    <span>
                      <strong>{alert.partName}</strong>
                      <small>{alert.message}. Stock {alert.currentStock}.</small>
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" className="dashboard-button is-primary full-width" onClick={() => navigate('/stock')}>Review Stock</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="panel-title"><h2>Finance & Collections</h2><CircleDollarSign size={15} /></div>
          <div className="finance-list">
            {[
              ['Billed Revenue', data?.payments?.billedAmount],
              ['Collected Cash', data?.payments?.receivedPayments],
              ['Overdue Dues', data?.payments?.overdueAmount],
            ].map(([label, value], index) => (
              <div key={label}><span>{label}</span><strong className={index === 2 ? 'danger-text' : ''}>{value}</strong></div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-title"><h2>Workshop Staff</h2><UserRound size={15} /></div>
          <div className="staff-list">
            {(data?.staffAvailability || []).slice(0, 3).map((staff) => (
              <div key={staff.name} className="staff-row">
                <span className="staff-avatar"><UserRound size={13} /></span>
                <span className="staff-copy">
                  <strong>{staff.name}</strong>
                  <small>{staff.role} · {staff.activeJobs} jobs</small>
                </span>
                <span className={`staff-dot ${staff.status === 'Active Duty' ? 'is-online' : 'is-away'}`} />
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-title"><h2>Quick Actions</h2><Wrench size={15} /></div>
          <div className="quick-actions quick-actions-expanded">
            {[
              ['New Customer', '/customers/new', UserPlus, 'customers.create'],
              ['New Job Card', '/jobs/new', Wrench, 'jobs.create'],
              ['Create Invoice', '/invoices/new', FileText, 'invoices.create'],
              ['Record Payment', '/payments/new', CreditCard, 'payments.create'],
              ['Add Expense', '/expenses/new', ReceiptText, 'expenses.create'],
              ['Stock Issue', '/stock/movements', PackageSearch, 'stock.create'],
              ['Add Vehicle', '/vehicles/new', Car, 'vehicles.create'],
              ['Service Catalog', '/services', Plus, 'services.view'],
            ]
              .filter(([, , , permission]) => hasPermission(user, permission))
              .map(([label, path, Icon]) => (
                <button key={label} type="button" onClick={() => navigate(path)}>
                  <span className="quick-action-leading">
                    <Icon size={12} />
                    <span>{label}</span>
                  </span>
                  <ArrowRight size={12} />
                </button>
              ))}
          </div>
        </article>
      </section>
    </div>
  );
};
