import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  ChevronRight,
  Wrench,
  Car,
  User,
  History,
  WalletCards,
  Clock3,
  CircleCheckBig,
  PackageSearch,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import '../../styles/jobs-dashboard.css';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const normalizeReg = (value) => String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

const STATUS_OPTIONS = [
  'All',
  'New',
  'Inspection',
  'Estimate Pending',
  'Approved',
  'In Progress',
  'Waiting for Parts',
  'QC',
  'Ready for Delivery',
  'Delivered',
  'Cancelled'
];

const statusClass = (status) =>
  String(status || 'New').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobs();
        setJobs(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = status === 'All' || job.status === status;
      const matchesQuery = !q || [
        job.jobNumber,
        job.id,
        job.customerName,
        job.customerPhone,
        job.vehicleReg,
        job.vehicleInfo,
        job.assignedEmployeeName
      ].some((value) => String(value || '').toLowerCase().includes(q));

      return matchesStatus && matchesQuery;
    });
  }, [jobs, query, status]);

  const vehicleLookup = useMemo(() => {
    const q = normalizeReg(query);
    if (q.length < 5) return null;

    const candidates = jobs.filter(
      (job) =>
        normalizeReg(job.vehicleReg).includes(q) ||
        q.includes(normalizeReg(job.vehicleReg))
    );

    if (!candidates.length) return null;

    const registration = candidates[0].vehicleReg;
    const sameVehicle = jobs
      .filter((job) => normalizeReg(job.vehicleReg) === normalizeReg(registration))
      .sort((a, b) => String(b.createdDate || '').localeCompare(String(a.createdDate || '')));

    const currentOpen = sameVehicle.find(
      (job) => !['Delivered', 'Cancelled'].includes(job.status)
    );
    const latest = sameVehicle[0];
    const lastParts = sameVehicle
      .flatMap((job) => job.partsUsed || [])
      .slice(0, 4)
      .map((item) => item.name || item.partName)
      .filter(Boolean);

    const spending = sameVehicle.reduce((sum, job) => {
      const total = job.billing?.invoiceTotal || job.estimates?.at(-1)?.grandTotal || 0;
      return sum + Number(total || 0);
    }, 0);

    return {
      registration,
      latest,
      sameVehicle,
      currentOpen,
      lastParts,
      spending
    };
  }, [jobs, query]);

  const counts = {
    total: jobs.length,
    active: jobs.filter((j) => !['Delivered', 'Cancelled'].includes(j.status)).length,
    waiting: jobs.filter((j) => j.status === 'Waiting for Parts').length,
    ready: jobs.filter((j) => j.status === 'Ready for Delivery').length
  };

  const kpis = [
    { label: 'Total Jobs', value: counts.total, icon: ClipboardList, filter: 'All', tone: 'default' },
    { label: 'Active Jobs', value: counts.active, icon: Clock3, filter: 'All', tone: 'primary' },
    { label: 'Waiting Parts', value: counts.waiting, icon: PackageSearch, filter: 'Waiting for Parts', tone: 'warning' },
    { label: 'Ready Delivery', value: counts.ready, icon: CircleCheckBig, filter: 'Ready for Delivery', tone: 'success' }
  ];

  return (
    <div className="jobs-dashboard">
      <header className="jobs-dashboard-header">
        <div>
          <span className="jobs-dashboard-eyebrow">Workshop Operations</span>
          <h1>Job Cards</h1>
          <p>Track every vehicle from check-in to repair, quality control, billing and delivery.</p>
        </div>

        <div className="jobs-dashboard-actions">
          <button
            type="button"
            className="jobs-secondary-button"
            onClick={() => navigate('/jobs/reports')}
          >
            <History size={15} />
            <span>Reports</span>
          </button>

          <button
            type="button"
            className="jobs-primary-button"
            onClick={() => navigate('/jobs/new')}
          >
            <Plus size={15} />
            <span>New Job Card</span>
          </button>
        </div>
      </header>

      <section className="jobs-kpi-grid">
        {kpis.map(({ label, value, icon: Icon, filter, tone }) => (
          <button
            key={label}
            type="button"
            className={`jobs-kpi-card is-${tone}`}
            onClick={() => setStatus(filter)}
          >
            <span className="jobs-kpi-icon"><Icon size={16} /></span>
            <span className="jobs-kpi-label">{label}</span>
            <strong>{value}</strong>
            <small>View records</small>
          </button>
        ))}
      </section>

      <section className="jobs-toolbar">
        <label className="jobs-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search job, customer, phone or vehicle registration"
          />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      {vehicleLookup && (
        <section className="jobs-vehicle-lookup">
          <div className="jobs-vehicle-lookup-head">
            <div>
              <span className="jobs-vehicle-reg"><Car size={15} />{vehicleLookup.registration}</span>
              <h2>{vehicleLookup.latest.customerName} · {vehicleLookup.latest.vehicleInfo}</h2>
              <p>{vehicleLookup.latest.customerPhone}</p>
            </div>

            {vehicleLookup.currentOpen && (
              <button
                type="button"
                className="jobs-primary-button"
                onClick={() => navigate(`/jobs/${vehicleLookup.currentOpen.id}/overview`)}
              >
                Open Current Job
              </button>
            )}
          </div>

          <div className="jobs-vehicle-stats">
            <LookupStat icon={History} label="Previous Visits" value={vehicleLookup.sameVehicle.length} />
            <LookupStat icon={Wrench} label="Last Status" value={vehicleLookup.latest.status} />
            <LookupStat icon={WalletCards} label="Total Spending" value={money.format(vehicleLookup.spending)} />
            <LookupStat icon={Car} label="Last Service" value={vehicleLookup.latest.createdDate || '—'} />
          </div>

          <div className="jobs-parts-history">
            <span>Last Replaced / Used Parts</span>
            <strong>
              {vehicleLookup.lastParts.length
                ? vehicleLookup.lastParts.join(' · ')
                : 'No parts history found'}
            </strong>
          </div>
        </section>
      )}

      <section className="jobs-records-panel">
        <div className="jobs-records-head">
          <div>
            <span>Job Records</span>
            <h2>{status === 'All' ? 'All Job Cards' : status}</h2>
          </div>
          <strong>{filtered.length} records</strong>
        </div>

        {loading ? (
          <div className="jobs-state">Loading job cards…</div>
        ) : filtered.length === 0 ? (
          <div className="jobs-state is-empty">No job cards found.</div>
        ) : (
          <>
            <div className="jobs-table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}/overview`)}>
                      <td>
                        <strong>{job.jobNumber || job.id}</strong>
                        <span>{job.id}</span>
                      </td>
                      <td>
                        <strong>{job.vehicleReg || 'No registration'}</strong>
                        <span>{job.vehicleInfo || 'Vehicle'}</span>
                      </td>
                      <td>
                        <strong>{job.customerName || 'Walk-in customer'}</strong>
                        <span>{job.customerPhone || '—'}</span>
                      </td>
                      <td>
                        <strong>{job.assignedEmployeeName || 'Unassigned'}</strong>
                      </td>
                      <td>
                        <span className={`jobs-status-chip is-${statusClass(job.status)}`}>
                          {job.status || 'New'}
                        </span>
                      </td>
                      <td>
                        <strong>{job.createdDate || '—'}</strong>
                      </td>
                      <td>
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="jobs-mobile-list">
              {filtered.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className="jobs-mobile-card"
                  onClick={() => navigate(`/jobs/${job.id}/overview`)}
                >
                  <div className="jobs-mobile-card-head">
                    <div>
                      <strong>{job.jobNumber || job.id}</strong>
                      <span>{job.vehicleReg || 'No registration'}</span>
                    </div>
                    <span className={`jobs-status-chip is-${statusClass(job.status)}`}>
                      {job.status || 'New'}
                    </span>
                  </div>

                  <div className="jobs-mobile-card-meta">
                    <span><Car size={12} />{job.vehicleInfo || 'Vehicle'}</span>
                    <span><User size={12} />{job.customerName || 'Walk-in customer'}</span>
                    <span><Wrench size={12} />{job.assignedEmployeeName || 'Unassigned'}</span>
                  </div>

                  <div className="jobs-mobile-card-footer">
                    <span>{job.createdDate || '—'}</span>
                    <ChevronRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

function LookupStat({ icon: Icon, label, value }) {
  return (
    <div className="jobs-lookup-stat">
      <span><Icon size={13} />{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default JobList;
