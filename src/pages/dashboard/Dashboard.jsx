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
  Phone,
  Activity,
  Car,
  ClipboardList,
  CheckCircle,
  DollarSign,
  AlertTriangle
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
    <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-4 lg:px-6 xl:px-8">
      
      {/* SECTION 1: PERSONAL ATTENDANCE CLOCK */}
      <section className="grid min-w-0 gap-3.5 rounded-2xl border border-line bg-surface p-3.5 shadow-sm sm:p-4 lg:grid-cols-[minmax(200px,1fr)_minmax(320px,1.5fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${isClockedIn ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            <Clock size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 truncate text-sm font-bold tracking-tight text-content">{user?.name || 'User'}'s Duty Shift</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant={isClockedIn ? 'success' : 'danger'}>{isClockedIn ? 'WORKING' : 'CLOCKED OUT'}</Badge>
              <span className="text-xs font-medium text-muted">{isClockedIn ? 'Clocked in' : 'Not active'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl border border-line bg-surface-2 p-2.5">
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-muted">Today</span>
            <strong className="mt-0.5 block truncate text-xs font-bold text-content">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </strong>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-muted">Live Time</span>
            <strong className="mt-0.5 block truncate text-xs font-bold text-content">{currentTime || '--:--:--'}</strong>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-muted">Worked</span>
            <strong className="mt-0.5 block truncate text-xs font-bold text-content">{data?.attendance?.workedHours || '0h 00m'}</strong>
          </div>
        </div>

        <Button
          variant={isClockedIn ? 'danger' : 'primary'}
          size="md"
          onClick={handleClockToggle}
          className="h-11 w-full text-xs font-bold sm:h-10 lg:w-auto lg:min-w-[140px]"
        >
          {isClockedIn ? 'Clock Out Shift' : 'Clock In Duty'}
        </Button>
      </section>

      {/* SECTION 2: FILTERS & QUICK ACTIONS */}
      <section className="w-full min-w-0 rounded-2xl border border-line bg-surface p-3.5 shadow-sm sm:p-4">
        {/* Business Filters Grid */}
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' }
            ]}
            className="h-11 w-full min-w-0 rounded-xl text-xs font-semibold sm:h-10"
          />
          <Select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            options={[
              { value: 'main', label: 'Main Garage Branch' },
              { value: 'express', label: 'Express Service Bay' }
            ]}
            className="h-11 w-full min-w-0 rounded-xl text-xs font-semibold sm:h-10"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/customers/new')}
            className="h-11 w-full min-w-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:h-10 sm:px-3 sm:text-[13px]"
          >
            <Plus size={16} className="shrink-0" />
            <span className="truncate">New Customer</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/jobs/new')}
            className="h-11 w-full min-w-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:h-10 sm:px-3 sm:text-[13px]"
          >
            <Plus size={16} className="shrink-0" />
            <span className="truncate">New Job Card</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/invoices/new')}
            className="h-11 w-full min-w-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:h-10 sm:px-3 sm:text-[13px]"
          >
            <Plus size={16} className="shrink-0" />
            <span className="truncate">Create Invoice</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/stock')}
            className="h-11 w-full min-w-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold sm:h-10 sm:px-3 sm:text-[13px]"
          >
            <Plus size={16} className="shrink-0" />
            <span className="truncate">Stock Issue</span>
          </Button>
        </div>
      </section>

      {/* SECTION 3: WORKSHOP SUMMARY CARDS (KPI GRID) */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {summaryStats.map((s, idx) => (
          <StatCard
            key={idx}
            {...s}
            isFullWidth={false}
          />
        ))}
      </section>

      {/* MAIN DUAL-COLUMN GRID FOR DESKTOP / 1-COLUMN FOR MOBILE */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
        
        {/* LEFT COLUMN (~65% width on desktop) */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 sm:gap-5">
          
          {/* SECTION 4: TODAY'S BOOKINGS */}
          <SummaryCard
            title="Today's Service Bookings"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/jobs')}
                className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary-soft"
              >
                View All
              </Button>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data?.bookings?.map((b) => (
                <div
                  key={b.id}
                  className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-line bg-surface-2 p-3.5 transition hover:border-line-strong"
                >
                  <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary">{b.time}</span>
                    <Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'}>
                      {b.status}
                    </Badge>
                  </div>
                  <h4 className="m-0 truncate text-sm font-bold text-content">{b.customer}</h4>
                  <div className="truncate text-xs font-medium text-secondary">{b.vehicle}</div>
                  <div className="truncate text-xs text-muted">{b.service}</div>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 5: JOB PROGRESS OVERVIEW */}
          <SummaryCard title="Live Job Card Progress Breakdown">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-3 text-center transition hover:border-primary/50"
              >
                <span className="truncate text-[11px] font-semibold text-muted">Inspection</span>
                <h3 className="my-1 text-xl font-extrabold text-info">{data?.jobProgress?.inspection}</h3>
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-3 text-center transition hover:border-primary/50"
              >
                <span className="truncate text-[11px] font-semibold text-muted">Awaiting Approval</span>
                <h3 className="my-1 text-xl font-extrabold text-warning">{data?.jobProgress?.awaitingApproval}</h3>
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-3 text-center transition hover:border-primary/50"
              >
                <span className="truncate text-[11px] font-semibold text-muted">In Progress</span>
                <h3 className="my-1 text-xl font-extrabold text-primary">{data?.jobProgress?.inProgress}</h3>
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-3 text-center transition hover:border-primary/50"
              >
                <span className="truncate text-[11px] font-semibold text-muted">Waiting Parts</span>
                <h3 className="my-1 text-xl font-extrabold text-danger">{data?.jobProgress?.waitingForParts}</h3>
              </button>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="col-span-2 flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-3 text-center transition hover:border-primary/50 sm:col-span-1"
              >
                <span className="truncate text-[11px] font-semibold text-muted">Quality Check</span>
                <h3 className="my-1 text-xl font-extrabold text-success">{data?.jobProgress?.qualityCheck}</h3>
              </button>
            </div>
          </SummaryCard>

          {/* SECTION 6: DELIVERY LIST */}
          <SummaryCard title="Vehicle Delivery Queue">
            <div className="flex w-full min-w-0 flex-col gap-3">
              {data?.deliveries?.map((d) => (
                <div
                  key={d.id}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-surface-2 p-3.5 transition hover:border-line-strong"
                >
                  <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <h4 className="m-0 truncate text-sm font-bold text-content">{d.vehicle}</h4>
                    <Badge variant={d.status === 'Ready' ? 'success' : d.status === 'Due Today' ? 'warning' : 'danger'}>
                      {d.status}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-secondary">
                    Customer: <span className="font-semibold text-content">{d.customer}</span> • Delivery: <strong className="text-content">{d.expectedTime}</strong>
                  </div>
                  <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row">
                    <a href={`tel:${d.phone}`} className="min-w-0 flex-1 no-underline">
                      <Button size="sm" variant="outline" className="h-9 w-full min-w-0 gap-1.5 text-xs font-semibold">
                        <Phone size={14} className="shrink-0" /> Call Customer
                      </Button>
                    </a>
                    <Button size="sm" variant="primary" onClick={() => navigate('/jobs')} className="h-9 min-w-0 flex-1 text-xs font-semibold">
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
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1 border-0 bg-transparent text-xs font-bold text-primary transition hover:underline"
              >
                All Jobs <ArrowRight size={14} />
              </button>
            }
          >
            {/* Desktop Table View */}
            <div className="hidden min-w-0 overflow-x-auto sm:block">
              <Table
                columns={recentJobsColumns}
                data={data?.recentJobs || []}
                renderRow={(item) => (
                  <>
                    <td className="px-3.5 py-3 text-xs font-bold text-primary">{item.id}</td>
                    <td className="px-3.5 py-3 text-xs font-semibold text-content">{item.customer}</td>
                    <td className="px-3.5 py-3 text-xs text-secondary">{item.vehicle}</td>
                    <td className="px-3.5 py-3 text-xs text-secondary">{item.mechanic}</td>
                    <td className="px-3.5 py-3">
                      <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'warning' : 'info'}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3.5 py-3 text-xs font-bold text-content">{item.amount}</td>
                    <td className="px-3.5 py-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${item.id}`)} className="h-8 px-2.5 text-xs">
                        Open
                      </Button>
                    </td>
                  </>
                )}
              />
            </div>

            {/* Mobile Card View */}
            <div className="flex min-w-0 flex-col gap-3 sm:hidden">
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
                    <Button size="sm" variant="primary" onClick={() => navigate(`/jobs/${item.id}`)} className="h-9 w-full text-xs font-semibold">
                      Open Job →
                    </Button>
                  }
                />
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 8: REVENUE CHART */}
          <SummaryCard title="Weekly Billed Revenue vs Collected Cash">
            <FinancialChart data={data?.chartData || []} />
          </SummaryCard>

        </div>

        {/* RIGHT COLUMN (~35% width on desktop) */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4 sm:gap-5">
          
          {/* SECTION 9: PAYMENTS & COLLECTIONS OVERVIEW */}
          <SummaryCard title="Finance & Collections">
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line pb-2.5 text-xs">
                <span className="min-w-0 truncate text-secondary">Billed Revenue</span>
                <span className="shrink-0 font-bold text-content">{data?.payments?.billedAmount}</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line pb-2.5 text-xs">
                <span className="min-w-0 truncate text-secondary">Collected Cash</span>
                <span className="shrink-0 font-bold text-success">{data?.payments?.receivedPayments}</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line pb-2.5 text-xs">
                <span className="min-w-0 truncate text-secondary">Overdue Dues</span>
                <span className="shrink-0 font-bold text-danger">{data?.payments?.overdueAmount}</span>
              </div>
            </div>
          </SummaryCard>

          {/* SECTION 10: STOCK ALERTS */}
          <SummaryCard title="Critical Stock Alerts & Approvals">
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              {data?.stockAlerts?.map((a) => (
                <div
                  key={a.id}
                  onClick={() => navigate('/stock')}
                  className={`flex min-w-0 cursor-pointer items-center justify-between gap-2.5 rounded-xl border-l-4 border-line bg-surface-2 p-3 transition hover:bg-surface-2/80 ${
                    a.priority === 'critical' ? 'border-l-danger' : 'border-l-warning'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="m-0 truncate text-sm font-bold text-content">{a.partName}</h4>
                    <p className="mt-1 truncate text-xs text-secondary">
                      {a.message} (Stock: {a.currentStock} Units)
                    </p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-primary" />
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 11: STAFF WORKLOAD */}
          <SummaryCard title="Workshop Staff Workload">
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              {data?.staffAvailability?.map((s, idx) => (
                <div key={idx} className="flex min-w-0 items-center justify-between gap-2 border-b border-line pb-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-content">{s.name}</span>
                    <span className="block truncate text-[11px] text-muted">{s.role} • {s.activeJobs} Active Jobs</span>
                  </div>
                  <Badge variant={s.available ? 'success' : 'warning'}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 12: ATTENDANCE STATS */}
          <SummaryCard title="My Personal Attendance Stats">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-2.5 text-center">
                <span className="truncate text-[10px] font-semibold text-muted">Today's Punches</span>
                <strong className="mt-1 truncate text-sm font-bold text-content">{data?.myAttendanceSummary?.todayPunches || '2 Sessions'}</strong>
              </div>
              <div className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-2.5 text-center">
                <span className="truncate text-[10px] font-semibold text-muted">Monthly Hours</span>
                <strong className="mt-1 truncate text-sm font-bold text-primary">{data?.myAttendanceSummary?.monthlyHours || '142h'}</strong>
              </div>
              <div className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-2.5 text-center">
                <span className="truncate text-[10px] font-semibold text-muted">Present Days</span>
                <strong className="mt-1 truncate text-sm font-bold text-success">18 Days</strong>
              </div>
              <div className="flex min-w-0 flex-col items-center rounded-xl border border-line bg-surface-2 p-2.5 text-center">
                <span className="truncate text-[10px] font-semibold text-muted">Overtime</span>
                <strong className="mt-1 truncate text-sm font-bold text-warning">+{data?.myAttendanceSummary?.approvedOvertime || '12h'}</strong>
              </div>
            </div>
          </SummaryCard>

          {/* SECTION 13: ATTENDANCE QUICK LINKS */}
          <SummaryCard title="Attendance Quick Links">
            <div className="grid grid-cols-2 gap-2.5">
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} className="h-9 w-full text-xs font-semibold">
                History Logs
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} className="h-9 w-full text-xs font-semibold">
                Apply Leave
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} className="h-9 w-full text-xs font-semibold">
                Holidays
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/my-attendance')} className="h-9 w-full text-xs font-semibold">
                Summary
              </Button>
            </div>
          </SummaryCard>

          {/* SECTION 14: RECENT ACTIVITY */}
          <SummaryCard title="Workshop Activity Log">
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              {data?.recentActivity?.map((act) => (
                <div key={act.id} className="flex min-w-0 items-start gap-2.5 text-xs">
                  <Activity size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-xs text-content leading-snug">{act.text}</p>
                    <span className="text-[11px] text-muted">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </SummaryCard>

          {/* SECTION 15: SERVICE FOLLOW-UPS */}
          <SummaryCard title="Upcoming Service Follow-Ups">
            <div className="flex w-full min-w-0 flex-col gap-2.5">
              {data?.serviceFollowUps?.map((f, idx) => (
                <div key={idx} className="flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <h4 className="m-0 truncate text-xs font-bold text-content">{f.customer}</h4>
                    <a href={`tel:${f.phone}`} className="shrink-0 text-primary hover:opacity-80" title="Call Customer">
                      <Phone size={15} />
                    </a>
                  </div>
                  <p className="m-0 truncate text-xs text-secondary">{f.vehicle} • {f.serviceDue}</p>
                  <span className="mt-0.5 block truncate text-[11px] font-semibold text-warning">Due Date: {f.dueDate}</span>
                </div>
              ))}
            </div>
          </SummaryCard>

        </div>

      </div>
    </div>
  );
};
