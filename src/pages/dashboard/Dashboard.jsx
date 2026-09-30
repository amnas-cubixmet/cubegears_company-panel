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
    const update = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
    <div className="flex w-full min-w-0 flex-col gap-3.5">
      <section className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-[17px] font-semibold tracking-tight text-content">Dashboard</h1>
          <p className="mt-0.5 text-[10px] text-muted">Workshop operations, live repairs and business status.</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[10px]">
            <span className={`size-2 rounded-full ${isClockedIn ? 'bg-success' : 'bg-danger'}`} />
            <span className="font-semibold text-content">{user?.name || 'User'}</span>
            <span className="text-muted">{isClockedIn ? 'Working' : 'Off duty'}</span>
            <span className="text-muted">·</span>
            <span className="font-medium text-secondary">{currentTime}</span>
          </div>
          <Button variant={isClockedIn ? 'danger' : 'primary'} size="sm" onClick={handleClockToggle} className="h-9 rounded-lg px-3 text-[10px]">
            <Clock size={13} />
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, meta }) => (
          <article key={label} className="min-w-0 rounded-xl border border-line bg-surface p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[10px] font-medium text-muted">{label}</div>
                <div className="mt-2 truncate text-[21px] font-semibold leading-none tracking-tight text-content">{value}</div>
              </div>
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-primary"><Icon size={14} /></span>
            </div>
            <div className="mt-2.5 text-[9px] font-medium text-muted">{meta}</div>
          </article>
        ))}
      </section>

      <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <header className="flex flex-col gap-2.5 border-b border-line px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 text-[12px] font-semibold text-content">Service Operations</h2>
            <p className="mt-0.5 text-[9px] text-muted">Track today's bookings and repair progress.</p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:items-center">
            <div className="w-full sm:w-[150px]">
              <Select value={filterPeriod} onChange={(event) => setFilterPeriod(event.target.value)} options={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
              ]} />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={filterBranch} onChange={(event) => setFilterBranch(event.target.value)} options={[
                { value: 'main', label: 'Main Garage' },
                { value: 'express', label: 'Express Bay' },
              ]} />
            </div>
            <Button size="sm" onClick={() => navigate('/jobs/new')} className="col-span-2 h-9 rounded-lg px-3 text-[10px] sm:col-span-1">
              <Plus size={13} /> New Job Card
            </Button>
          </div>
        </header>

        <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(280px,0.95fr)_minmax(320px,1.05fr)_minmax(235px,0.72fr)]">
          <div className="min-w-0 border-b border-line p-3 xl:border-b-0 xl:border-r">
            <div className="relative mb-2.5">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, vehicle or job" className="h-9 w-full rounded-lg border border-line bg-surface-2 pl-8 pr-3 text-[10px] text-content outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="flex max-h-[440px] flex-col gap-1.5 overflow-y-auto pr-1">
              {filteredBookings.map((booking) => {
                const active = booking.id === selectedBooking?.id;
                return (
                  <button key={booking.id} type="button" onClick={() => setSelectedBookingId(booking.id)} className={`w-full rounded-lg border px-2.5 py-2.5 text-left transition ${active ? 'border-primary/40 bg-primary-soft' : 'border-line bg-surface hover:bg-surface-2'}`}>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="min-w-0 truncate text-[10px] font-semibold text-content">{booking.id} · {booking.customer}</div>
                      <Badge variant={statusVariant(booking.status)} className="shrink-0">{booking.status}</Badge>
                    </div>
                    <div className="mt-1 truncate text-[9px] text-muted">{booking.vehicle}</div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px]">
                      <span className="truncate text-secondary">{booking.service}</span>
                      <span className="shrink-0 font-medium text-muted">{booking.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 border-b border-line p-3.5 xl:border-b-0 xl:border-r">
            {selectedBooking ? (
              <div className="flex h-full min-h-[390px] min-w-0 flex-col">
                <div className="flex min-w-0 items-start justify-between gap-3 border-b border-line pb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-content">{selectedBooking.id}</span>
                      <Badge variant={statusVariant(selectedBooking.status)}>{selectedBooking.status}</Badge>
                    </div>
                    <div className="mt-1 truncate text-[10px] font-medium text-content">{selectedBooking.vehicle}</div>
                  </div>
                  <button type="button" onClick={() => navigate('/jobs')} className="shrink-0 text-[9px] font-semibold text-primary">View Job</button>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-b border-line py-3 sm:grid-cols-3">
                  <div><div className="text-[8px] font-semibold uppercase tracking-wide text-muted">Customer</div><div className="mt-1 truncate text-[10px] font-medium text-content">{selectedBooking.customer}</div></div>
                  <div><div className="text-[8px] font-semibold uppercase tracking-wide text-muted">Booking Time</div><div className="mt-1 text-[10px] font-medium text-content">{selectedBooking.time}</div></div>
                  <div><div className="text-[8px] font-semibold uppercase tracking-wide text-muted">Advisor</div><div className="mt-1 text-[10px] font-medium text-content">{user?.name || 'Alex Rivera'}</div></div>
                  <div className="col-span-2 sm:col-span-3"><div className="text-[8px] font-semibold uppercase tracking-wide text-muted">Service Request</div><div className="mt-1 text-[10px] font-medium text-content">{selectedBooking.service}</div></div>
                </div>

                <div className="py-3">
                  <div className="text-[9px] font-semibold text-content">Repair Details</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
                    <div className="rounded-lg bg-surface-2 p-2.5"><span className="block text-muted">Job Status</span><span className="mt-1 block font-medium text-content">{selectedBooking.status}</span></div>
                    <div className="rounded-lg bg-surface-2 p-2.5"><span className="block text-muted">Assigned Team</span><span className="mt-1 block font-medium text-content">Workshop A</span></div>
                  </div>
                </div>

                <div className="mt-auto rounded-lg border border-line bg-surface-2 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3"><div className="text-[9px] font-semibold text-content">Progress</div><div className="text-[8px] font-medium text-muted">Live workshop stages</div></div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {repairStages.map((stage, index) => (
                      <div key={stage.key} className="min-w-0 text-center">
                        <div className={`mx-auto grid size-6 place-items-center rounded-full border ${index < 3 ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-muted'}`}>
                          {index < 3 ? <CheckCircle2 size={11} /> : <span className="text-[8px] font-bold">{index + 1}</span>}
                        </div>
                        <div className="mt-1 truncate text-[8px] font-medium text-muted">{stage.label}</div>
                        <div className="mt-0.5 text-[9px] font-semibold text-content">{data?.jobProgress?.[stage.key] ?? 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : <div className="grid min-h-[390px] place-items-center text-[10px] text-muted">No booking selected</div>}
          </div>

          <aside className="min-w-0 p-3">
            <div className="flex items-center justify-between gap-2"><h3 className="m-0 text-[10px] font-semibold text-content">Active Repair</h3><button type="button" onClick={() => navigate('/jobs')} className="text-[8px] font-semibold text-primary">View All</button></div>
            <div className="mt-2.5 rounded-lg border border-line bg-surface-2 p-3">
              <div className="grid min-h-[88px] place-items-center rounded-lg bg-surface"><Car size={46} strokeWidth={1.1} className="text-secondary" /></div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0"><div className="truncate text-[10px] font-semibold text-content">{data?.recentJobs?.[0]?.vehicle || 'Vehicle'}</div><div className="mt-0.5 truncate text-[8px] text-muted">{data?.recentJobs?.[0]?.id}</div></div>
                <Badge variant="success">In Progress</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div><div className="text-[7px] uppercase tracking-wide text-muted">Customer</div><div className="mt-1 truncate text-[9px] font-medium text-content">{data?.recentJobs?.[0]?.customer}</div></div>
                <div><div className="text-[7px] uppercase tracking-wide text-muted">Mechanic</div><div className="mt-1 truncate text-[9px] font-medium text-content">{data?.recentJobs?.[0]?.mechanic}</div></div>
              </div>
              <div className="mt-3"><div className="flex items-center justify-between text-[8px]"><span className="text-muted">Overall Progress</span><span className="font-semibold text-primary">70%</span></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface"><div className="h-full w-[70%] rounded-full bg-primary" /></div></div>
            </div>

            <div className="mt-3 rounded-lg border border-line p-3">
              <div className="flex items-center gap-1.5"><Activity size={12} className="text-primary" /><span className="text-[9px] font-semibold text-content">Smart Insights</span></div>
              <div className="mt-2.5 flex flex-col gap-2">
                {(data?.stockAlerts || []).slice(0, 2).map((alert) => (
                  <button key={alert.id} type="button" onClick={() => navigate('/stock')} className="rounded-lg bg-surface-2 p-2.5 text-left">
                    <div className="flex items-start gap-2">
                      <PackageSearch size={12} className={alert.priority === 'critical' ? 'mt-0.5 shrink-0 text-danger' : 'mt-0.5 shrink-0 text-warning'} />
                      <div className="min-w-0"><div className="truncate text-[9px] font-semibold text-content">{alert.partName}</div><div className="mt-1 text-[8px] leading-3.5 text-muted">{alert.message}. Stock {alert.currentStock}.</div></div>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/stock')} className="mt-2.5 h-8 w-full rounded-lg text-[9px]">Review Stock</Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-2.5 lg:grid-cols-3">
        <article className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="m-0 text-[11px] font-semibold text-content">Finance & Collections</h2><CircleDollarSign size={14} className="text-primary" /></div>
          <div className="mt-2.5 divide-y divide-line">
            {[
              ['Billed Revenue', data?.payments?.billedAmount],
              ['Collected Cash', data?.payments?.receivedPayments],
              ['Overdue Dues', data?.payments?.overdueAmount],
            ].map(([label, value], index) => <div key={label} className="flex items-center justify-between gap-3 py-2 text-[9px]"><span className="text-muted">{label}</span><span className={`font-semibold ${index === 2 ? 'text-danger' : 'text-content'}`}>{value}</span></div>)}
          </div>
        </article>

        <article className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="m-0 text-[11px] font-semibold text-content">Workshop Staff</h2><UserRound size={14} className="text-primary" /></div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {(data?.staffAvailability || []).slice(0, 3).map((staff) => (
              <div key={staff.name} className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-2.5 py-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><UserRound size={12}/></span>
                <div className="min-w-0 flex-1"><div className="truncate text-[9px] font-semibold text-content">{staff.name}</div><div className="mt-0.5 truncate text-[8px] text-muted">{staff.role} · {staff.activeJobs} jobs</div></div>
                <span className={`size-1.5 shrink-0 rounded-full ${staff.status === 'Active Duty' ? 'bg-success' : 'bg-warning'}`} />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="m-0 text-[11px] font-semibold text-content">Quick Actions</h2><Wrench size={14} className="text-primary" /></div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {[
              ['New Customer', '/customers/new'],
              ['New Job Card', '/jobs/new'],
              ['Create Invoice', '/invoices/new'],
              ['Stock Issue', '/stock'],
            ].map(([label, path]) => (
              <button key={label} type="button" onClick={() => navigate(path)} className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-2.5 text-left text-[9px] font-semibold text-content transition hover:border-primary/40 hover:bg-primary-soft">
                <span className="truncate">{label}</span><ArrowRight size={11} className="shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
