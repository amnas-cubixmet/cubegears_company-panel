import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardData, toggleClockIn } from '../../services/dashboard.service';
import { StatCard } from '../../components/cards/StatCard';
import { SummaryCard } from '../../components/cards/SummaryCard';
import { FinancialChart } from '../../components/cards/FinancialChart';
import { Table } from '../../components/common/Table';
import { MobileCard } from '../../components/common/MobileCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Loader } from '../../components/common/Loader';
import {
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Phone,
  Calendar,
  DollarSign,
  ClipboardList,
  Users,
  Car,
  Package,
  Activity,
  UserCheck
} from 'lucide-react';

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
    const res = await getDashboardData({ period: filterPeriod, branch: filterBranch });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [filterPeriod, filterBranch]);

  // Live Time Clock Tracker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockToggle = async () => {
    const currentStatus = data?.attendance?.status;
    const nextStatus = currentStatus === 'CLOCKED_IN' ? 'CLOCKED_OUT' : 'CLOCKED_IN';
    await toggleClockIn(nextStatus);
    fetchDashboard();
  };

  if (loading) return <Loader />;

  const isClockedIn = data?.attendance?.status === 'CLOCKED_IN';

  // Section 3: Summary Cards
  const summaryStats = [
    { title: "Today's Vehicles", value: data?.stats?.todaysVehicles || 0, icon: 'Car', trend: 'up' },
    { title: 'Ongoing Jobs', value: data?.stats?.ongoingJobs || 0, icon: 'ClipboardList', trend: 'up' },
    { title: 'Ready for Delivery', value: data?.stats?.readyForDelivery || 0, icon: 'CheckCircle', trend: 'up' },
    { title: "Today's Collection", value: data?.stats?.todaysCollection || '$0', icon: 'DollarSign', trend: 'up' },
    { title: 'Outstanding Balance', value: data?.stats?.outstandingBalance || '$0', icon: 'AlertTriangle', trend: 'down' }
  ];

  // Recent jobs table columns
  const recentJobsColumns = [
    { key: 'id', label: 'Job #' },
    { key: 'customer', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'mechanic', label: 'Mechanic' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
    { key: 'actions', label: 'Action' }
  ];

  return (
    <div className="dashboard-page cg-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
      
      {/* SECTION 1: PERSONAL ATTENDANCE CLOCK */}
      <div className="dashboard-attendance-card" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '18px 16px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Top Row: Icon + Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', minWidth: 0 }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: isClockedIn ? 'var(--success-soft)' : 'var(--danger-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isClockedIn ? 'var(--success)' : 'var(--danger)',
            flexShrink: 0
          }}>
            <Clock size={24} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.3
            }}>
              {user?.name}'s Duty Shift
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              <Badge variant={isClockedIn ? 'success' : 'danger'}>
                {isClockedIn ? 'WORKING' : 'CLOCKED OUT'}
              </Badge>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {isClockedIn ? 'Clocked in' : 'Not active'}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Info: Structured 3-column / 2-column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '12px',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--surface-2)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block' }}>Today</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block' }}>Live Time</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentTime || '03:43:33 PM'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block' }}>Worked</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {data?.attendance?.workedHours || '6h 45m'}
            </span>
          </div>
        </div>



        {/* Action Button: Full Width on Mobile (46-48px height) */}
        <Button
          variant={isClockedIn ? 'danger' : 'primary'}
          size="lg"
          onClick={handleClockToggle}
          style={{
            width: '100%',
            height: '48px',
            marginTop: '16px',
            fontSize: '15px',
            fontWeight: '700',
            backgroundColor: isClockedIn ? 'var(--danger)' : 'var(--primary)',
            border: isClockedIn ? '1px solid var(--danger)' : '1px solid var(--primary)',
            color: '#ffffff',
            boxShadow: isClockedIn
              ? '0 8px 20px rgba(239, 68, 68, 0.20)'
              : '0 8px 20px rgba(99, 102, 241, 0.20)'
          }}
        >
          {isClockedIn ? 'Clock Out Shift' : 'Clock In Duty'}
        </Button>
      </div>

      {/* SECTION 2: FILTERS & QUICK ACTIONS */}
      <div className="filters-actions-card" style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        backgroundColor: 'var(--surface)',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Business Filters Grid */}
        <div className="filters-select-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
          width: '100%'
        }}>
          <Select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' }
            ]}
            style={{ marginBottom: 0, width: '100%', minWidth: 0, height: '46px' }}
          />
          <Select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            options={[
              { value: 'main', label: 'Main Garage Branch' },
              { value: 'express', label: 'Express Service Bay' }
            ]}
            style={{ marginBottom: 0, width: '100%', minWidth: 0, height: '46px' }}
          />
        </div>

        {/* Quick Actions 2-Column Responsive Grid */}
        <div className="quick-actions-grid">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/customers/add')}
            style={{
              width: '100%',
              minWidth: 0,
              height: '44px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '0 10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>New Customer</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/jobs/add')}
            style={{
              width: '100%',
              minWidth: 0,
              height: '44px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '0 10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>New Job Card</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/invoices/create')}
            style={{
              width: '100%',
              minWidth: 0,
              height: '44px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '0 10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Create Invoice</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/stock')}
            style={{
              width: '100%',
              minWidth: 0,
              height: '44px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '0 10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stock Issue</span>
          </Button>
        </div>
      </div>

      {/* SECTION 3: WORKSHOP SUMMARY CARDS */}
      <div className="summary-grid">
        {summaryStats.map((s, idx) => (
          <StatCard
            key={idx}
            {...s}
            isFullWidth={idx === 4}
          />
        ))}
      </div>

      {/* MAIN DUAL-COLUMN GRID FOR DESKTOP / 1-COLUMN FOR MOBILE */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN / MOBILE PRIORITY STACK */}
        <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* SECTION 4: TODAY'S BOOKINGS */}
          <div className="bookings-section">
            <SummaryCard
              title="Today's Service Bookings"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/jobs')}
                  style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', color: 'var(--primary)' }}
                >
                  View All
                </Button>
              }
            >
              <div className="bookings-list">
                {data?.bookings?.map((b) => (
                  <div key={b.id} className="booking-card">
                    {/* Header Row: Time & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0, gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>
                        {b.time}
                      </span>
                      <Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'}>
                        {b.status}
                      </Badge>
                    </div>

                    {/* Customer Name */}
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                      {b.customer}
                    </h4>

                    {/* Vehicle & License Info */}
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {b.vehicle}
                    </div>

                    {/* Service Description */}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {b.service}
                    </div>
                  </div>
                ))}
              </div>
            </SummaryCard>
          </div>

          {/* SECTION 5: JOB PROGRESS OVERVIEW */}
          <SummaryCard title="Live Job Card Progress Breakdown">
            <div className="job-progress-grid">
              <div onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inspection</span>
                <h3 style={{ fontSize: '20px', color: 'var(--info)', margin: '4px 0' }}>{data?.jobProgress?.inspection}</h3>
              </div>
              <div onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Awaiting Approval</span>
                <h3 style={{ fontSize: '20px', color: 'var(--warning)', margin: '4px 0' }}>{data?.jobProgress?.awaitingApproval}</h3>
              </div>
              <div onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In Progress</span>
                <h3 style={{ fontSize: '20px', color: 'var(--primary)', margin: '4px 0' }}>{data?.jobProgress?.inProgress}</h3>
              </div>
              <div onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Waiting for Parts</span>
                <h3 style={{ fontSize: '20px', color: 'var(--danger)', margin: '4px 0' }}>{data?.jobProgress?.waitingForParts}</h3>
              </div>
              <div onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', textAlign: 'center', gridColumn: '1 / -1', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quality Check</span>
                <h3 style={{ fontSize: '20px', color: 'var(--success)', margin: '4px 0' }}>{data?.jobProgress?.qualityCheck}</h3>
              </div>
            </div>
          </SummaryCard>

          {/* SECTION 6: DELIVERY LIST */}
          <SummaryCard title="Vehicle Delivery Queue">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {data?.deliveries?.map((d) => (
                <div key={d.id} style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                  minWidth: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{d.vehicle}</h4>
                    <Badge variant={d.status === 'Ready' ? 'success' : d.status === 'Due Today' ? 'warning' : 'danger'}>{d.status}</Badge>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customer: {d.customer} • Delivery: <strong>{d.expectedTime}</strong></span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <a href={`tel:${d.phone}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <Button size="sm" variant="outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Phone size={14} /> Call Customer
                      </Button>
                    </a>
                    <Button size="sm" variant="primary" onClick={() => navigate('/jobs')} style={{ flex: 1 }}>
                      Open Record →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 7: RECENT JOB CARDS */}
          <SummaryCard
            title="Recent Job Cards"
            action={
              <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                All Jobs <ArrowRight size={14} />
              </button>
            }
          >
            <div className="desktop-table-view">
              <Table
                columns={recentJobsColumns}
                data={data?.recentJobs || []}
                renderRow={(item) => (
                  <>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--primary)' }}>{item.id}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{item.customer}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{item.vehicle}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{item.mechanic}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'warning' : 'info'}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${item.id}`)}>Open</Button>
                    </td>
                  </>
                )}
              />
            </div>

            <div className="mobile-card-view">
              {data?.recentJobs?.map((item) => (
                <MobileCard
                  key={item.id}
                  title={`${item.id} - ${item.customer}`}
                  subtitle={item.vehicle}
                  badge={
                    <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'warning' : 'info'}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  }
                  fields={[
                    { label: 'Assigned Mechanic', value: item.mechanic },
                    { label: 'Amount', value: item.amount }
                  ]}
                  actions={
                    <Button size="sm" variant="primary" onClick={() => navigate(`/jobs/${item.id}`)}>Open Job →</Button>
                  }
                />
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 11: BUSINESS FINANCIAL CHART */}
          <SummaryCard title="Weekly Billed Revenue vs Collected Cash">
            <FinancialChart data={data?.chartData || []} />
          </SummaryCard>

        </div>

        {/* RIGHT COLUMN / SECONDARY OPERATIONAL WIDGETS */}
        <div className="dashboard-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* SECTION 8: PAYMENTS & COLLECTIONS OVERVIEW */}
          <SummaryCard title="Finance & Collections">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', minWidth: 0, gap: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', minWidth: 0 }}>Billed Revenue</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700', flexShrink: 0 }}>{data?.payments?.billedAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', minWidth: 0, gap: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', minWidth: 0 }}>Collected Cash</span>
                <span style={{ color: 'var(--success)', fontWeight: '700', flexShrink: 0 }}>{data?.payments?.receivedPayments}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', minWidth: 0, gap: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', minWidth: 0 }}>Overdue Dues</span>
                <span style={{ color: 'var(--danger)', fontWeight: '700', flexShrink: 0 }}>{data?.payments?.overdueAmount}</span>
              </div>
            </div>
          </SummaryCard>

          {/* SECTION 10: STOCK ALERTS & APPROVALS */}
          <SummaryCard title="Critical Stock Alerts & Approvals">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {data?.stockAlerts?.map((a) => (
                <div key={a.id} style={{
                  backgroundColor: 'var(--surface-2)',
                  borderLeft: `4px solid ${a.priority === 'critical' ? 'var(--danger)' : 'var(--warning)'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }} onClick={() => navigate('/stock')}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{a.partName}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{a.message} (Stock: {a.currentStock} Units)</p>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 9: STAFF AVAILABILITY */}
          <SummaryCard title="Workshop Staff Workload">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {data?.staffAvailability?.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px', minWidth: 0, gap: '8px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>{s.name}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{s.role} • {s.activeJobs} Active Jobs</p>
                  </div>
                  <Badge variant={s.available ? 'success' : 'warning'} style={{ flexShrink: 0 }}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 12: MY ATTENDANCE SUMMARY */}
          <SummaryCard title="My Personal Attendance Stats">
            <div className="attendance-stats-grid">
              <div style={{ padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Today's Punches</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{data?.myAttendanceSummary?.todayPunches || '2 Sessions'}</h4>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monthly Hours</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', margin: '2px 0 0 0' }}>{data?.myAttendanceSummary?.monthlyHours || '142h'}</h4>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Present Days</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success)', margin: '2px 0 0 0' }}>18 Days</h4>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overtime</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--warning)', margin: '2px 0 0 0' }}>+{data?.myAttendanceSummary?.approvedOvertime || '12h'}</h4>
              </div>
            </div>
          </SummaryCard>

          {/* SECTION 13: ATTENDANCE CALENDAR LINKS */}
          <SummaryCard title="Attendance Quick Links">
            <div className="quick-links-grid">
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} style={{ width: '100%', minWidth: 0 }}>History Logs</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} style={{ width: '100%', minWidth: 0 }}>Apply Leave</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} style={{ width: '100%', minWidth: 0 }}>Holidays</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} style={{ width: '100%', minWidth: 0 }}>Summary</Button>
            </div>
          </SummaryCard>

          {/* SECTION 14: RECENT ACTIVITY */}
          <SummaryCard title="Workshop Activity Log">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {data?.recentActivity?.map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', minWidth: 0 }}>
                  <Activity size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{act.text}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 15: SERVICE FOLLOW-UPS */}
          <SummaryCard title="Upcoming Service Follow-Ups">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', minWidth: 0 }}>
              {data?.serviceFollowUps?.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--surface-2)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{f.customer}</h4>
                    <a href={`tel:${f.phone}`} style={{ color: 'var(--primary)', flexShrink: 0 }} title="Call Customer"><Phone size={16} /></a>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{f.vehicle} • {f.serviceDue}</p>
                  <span style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '4px', display: 'block' }}>Due Date: {f.dueDate}</span>
                </div>
              ))}
            </div>
          </SummaryCard>

        </div>

      </div>
    </div>
  );
};
