import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  ClipboardList,
  PackageSearch,
  Plus,
  Search,
  UserRound,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardData, toggleClockIn } from '../../services/dashboard.service';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

const statusVariant = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('confirm') || value.includes('complete') || value.includes('ready')) return 'success';
  if (value.includes('pending') || value.includes('check')) return 'warning';
  if (value.includes('delay') || value.includes('critical')) return 'danger';
  return 'info';
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
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleClockToggle = async () => {
    const nextStatus = data?.attendance?.status === 'CLOCKED_IN' ? 'CLOCKED_OUT' : 'CLOCKED_IN';
    await toggleClockIn(nextStatus);
    fetchDashboard();
  };

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

  if (loading) return <Loader />;

  const isClockedIn = data?.attendance?.status === 'CLOCKED_IN';

  const stats = [
    { label: "Today's Vehicles", value: data?.stats?.todaysVehicles || 0, icon: Car, hint: 'vehicles checked in' },
    { label: 'Ongoing Jobs', value: data?.stats?.ongoingJobs || 0, icon: ClipboardList, hint: 'active workshop jobs' },
    { label: 'Ready for Delivery', value: data?.stats?.readyForDelivery || 0, icon: CheckCircle2, hint: 'ready to hand over' },
    { label: "Today's Collection", value: data?.stats?.todaysCollection || '₹0', icon: CircleDollarSign, hint: 'payments collected' },
    { label: 'Low Stock Alerts', value: data?.stats?.lowStockAlerts || 0, icon: AlertTriangle, hint: 'items need attention' },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1580px] min-w-0 flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6 xl:px-7">
      <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-sm lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isClockedIn ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            <Clock size={17} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-content">{user?.name || 'User'}'s Duty Shift</div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px]">
              <span className={isClockedIn ? 'font-semibold text-success' : 'font-semibold text-danger'}>
                {isClockedIn ? 'WORKING' : 'CLOCKED OUT'}
              </span>
              <span className="text-muted">•</span>
              <span className="text-muted">{isClockedIn ? 'Clocked in' : 'Not active'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 lg:gap-8">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Today</div>
            <div className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-content">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Live Time</div>
            <div className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-content">{currentTime}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Worked</div>
            <div className="mt-0.5 whitespace-nowrap text-[11px] font-semibold text-content">{data?.attendance?.workedHours || '0h 00m'}</div>
          </div>
        </div>

        <Button
          variant={isClockedIn ? 'danger' : 'primary'}
          size="sm"
          onClick={handleClockToggle}
          className="h-9 w-full rounded-lg px-4 text-[11px] lg:w-auto"
        >
          {isClockedIn ? 'Clock Out Shift' : 'Clock In Duty'}
        </Button>
      </section>

      <section className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="m-0 text-lg font-semibold tracking-tight text-content">Dashboard</h1>
          <p className="mt-1 text-xs text-muted">Workshop overview, live repairs, collections and stock attention.</p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[190px_220px]">
          <Select
            value={filterPeriod}
            onChange={(event) => setFilterPeriod(event.target.value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ]}
          />
          <Select
            value={filterBranch}
            onChange={(event) => setFilterBranch(event.target.value)}
            options={[
              { value: 'main', label: 'Main Garage Branch' },
              { value: 'express', label: 'Express Service Bay' },
            ]}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <article key={label} className="min-w-0 rounded-xl border border-line bg-surface p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-medium text-muted">{label}</div>
                <div className="mt-2 truncate text-xl font-semibold tracking-tight text-content sm:text-[22px]">{value}</div>
              </div>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-primary">
                <Icon size={15} />
              </span>
            </div>
            <div className="mt-2 truncate text-[10px] text-muted">{hint}</div>
          </article>
        ))}
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3.5 xl:grid-cols-12">
        <article className="min-w-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm xl:col-span-9">
          <header className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-sm font-semibold text-content">Today's Service Operations</h2>
              <p className="mt-0.5 text-[10px] text-muted">Live bookings and current repair details</p>
            </div>
            <Button size="sm" onClick={() => navigate('/jobs/new')} className="h-9 rounded-lg px-3 text-[11px]">
              <Plus size={14} />
              New Job Card
            </Button>
          </header>

          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(300px,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-w-0 border-b border-line p-3 lg:border-b-0 lg:border-r">
              <div className="relative mb-2.5">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, vehicle or service"
                  className="h-9 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-[11px] text-content outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="flex max-h-[430px] flex-col gap-1.5 overflow-y-auto pr-1">
                {filteredBookings.map((booking) => {
                  const active = booking.id === selectedBooking?.id;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-primary/50 bg-primary-soft' : 'border-line bg-surface hover:bg-surface-2'}`}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-semibold text-content">{booking.customer}</div>
                          <div className="mt-1 truncate text-[10px] text-muted">{booking.vehicle}</div>
                        </div>
                        <Badge variant={statusVariant(booking.status)} className="shrink-0">{booking.status}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px]">
                        <span className="truncate text-secondary">{booking.service}</span>
                        <span className="shrink-0 font-semibold text-primary">{booking.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 p-4">
              {selectedBooking ? (
                <div className="flex h-full min-w-0 flex-col">
                  <div className="flex min-w-0 items-start justify-between gap-3 border-b border-line pb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-content">{selectedBooking.customer}</span>
                        <Badge variant={statusVariant(selectedBooking.status)}>{selectedBooking.status}</Badge>
                      </div>
                      <div className="mt-1 truncate text-[11px] text-muted">{selectedBooking.vehicle}</div>
                    </div>
                    <button type="button" onClick={() => navigate('/jobs')} className="shrink-0 text-[10px] font-semibold text-primary">
                      View job
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-5 gap-y-4 py-4 sm:grid-cols-3">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">Booking ID</div>
                      <div className="mt-1 text-[11px] font-medium text-content">{selectedBooking.id}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">Time</div>
                      <div className="mt-1 text-[11px] font-medium text-content">{selectedBooking.time}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">Advisor</div>
                      <div className="mt-1 text-[11px] font-medium text-content">Alex Rivera</div>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">Service Request</div>
                      <div className="mt-1 text-[11px] font-medium text-content">{selectedBooking.service}</div>
                    </div>
                  </div>

                  <div className="mt-auto rounded-xl border border-line bg-surface-2 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-semibold text-content">Repair Progress</div>
                      <div className="text-[10px] font-semibold text-primary">Live workshop flow</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {repairStages.map((stage, index) => {
                        const value = data?.jobProgress?.[stage.key] ?? 0;
                        return (
                          <div key={stage.key} className="min-w-0 text-center">
                            <div className={`mx-auto grid size-7 place-items-center rounded-full border ${index < 3 ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-muted'}`}>
                              {index < 3 ? <CheckCircle2 size={13} /> : <span className="text-[9px] font-bold">{index + 1}</span>}
                            </div>
                            <div className="mt-1.5 truncate text-[9px] font-medium text-muted">{stage.label}</div>
                            <div className="mt-0.5 text-[10px] font-semibold text-content">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[280px] place-items-center text-xs text-muted">No booking selected</div>
              )}
            </div>
          </div>
        </article>

        <aside className="flex min-w-0 flex-col gap-3.5 xl:col-span-3">
          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-sm font-semibold text-content">Active Repair</h2>
              <button type="button" onClick={() => navigate('/jobs')} className="text-[10px] font-semibold text-primary">View All</button>
            </div>

            <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Car size={24} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-content">{data?.recentJobs?.[0]?.vehicle || 'Vehicle'}</div>
                  <div className="mt-0.5 truncate text-[10px] text-muted">{data?.recentJobs?.[0]?.id}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-muted">Customer</div>
                  <div className="mt-1 truncate text-[10px] font-medium text-content">{data?.recentJobs?.[0]?.customer}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-muted">Mechanic</div>
                  <div className="mt-1 truncate text-[10px] font-medium text-content">{data?.recentJobs?.[0]?.mechanic}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-muted">Service</div>
                  <div className="mt-1 truncate text-[10px] font-medium text-content">{data?.recentJobs?.[0]?.service}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-muted">Amount</div>
                  <div className="mt-1 truncate text-[10px] font-semibold text-content">{data?.recentJobs?.[0]?.amount}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium text-muted">Overall Progress</span>
                  <span className="font-semibold text-primary">70%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div className="h-full w-[70%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-primary" />
              <h2 className="m-0 text-sm font-semibold text-content">Workshop Insights</h2>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {(data?.stockAlerts || []).slice(0, 2).map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => navigate('/stock')}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 text-left hover:border-primary/40"
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${alert.priority === 'critical' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                    <PackageSearch size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold text-content">{alert.partName}</span>
                    <span className="mt-0.5 block truncate text-[9px] text-muted">{alert.message} · Stock {alert.currentStock}</span>
                  </span>
                  <ChevronRight size={14} className="shrink-0 text-muted" />
                </button>
              ))}
            </div>

            <Button variant="primary" size="sm" onClick={() => navigate('/stock')} className="mt-3 h-9 w-full rounded-lg text-[11px]">
              Review Stock
            </Button>
          </article>
        </aside>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-3">
        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-semibold text-content">Finance & Collections</h2>
            <CircleDollarSign size={16} className="text-primary" />
          </div>
          <div className="mt-3 divide-y divide-line">
            {[
              ['Billed Revenue', data?.payments?.billedAmount],
              ['Collected Cash', data?.payments?.receivedPayments],
              ['Overdue Dues', data?.payments?.overdueAmount],
            ].map(([label, value], index) => (
              <div key={label} className="flex items-center justify-between gap-3 py-2 text-[11px]">
                <span className="text-muted">{label}</span>
                <span className={`font-semibold ${index === 2 ? 'text-danger' : 'text-content'}`}>{value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-semibold text-content">Workshop Staff</h2>
            <UserRound size={16} className="text-primary" />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.staffAvailability || []).slice(0, 3).map((staff) => (
              <div key={staff.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <UserRound size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-semibold text-content">{staff.name}</div>
                  <div className="mt-0.5 truncate text-[9px] text-muted">{staff.role} · {staff.activeJobs} active jobs</div>
                </div>
                <span className={`size-2 shrink-0 rounded-full ${staff.status === 'Active Duty' ? 'bg-success' : 'bg-warning'}`} />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-semibold text-content">Quick Actions</h2>
            <Wrench size={16} className="text-primary" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['New Customer', '/customers/new'],
              ['New Job Card', '/jobs/new'],
              ['Create Invoice', '/invoices/new'],
              ['Stock Issue', '/stock'],
            ].map(([label, path]) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="flex min-h-10 items-center justify-between gap-2 rounded-xl border border-line bg-surface-2 px-3 text-left text-[10px] font-semibold text-content transition hover:border-primary/40 hover:bg-primary-soft"
              >
                <span className="truncate">{label}</span>
                <ArrowRight size={13} className="shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};
