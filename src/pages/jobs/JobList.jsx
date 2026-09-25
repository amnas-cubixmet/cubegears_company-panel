import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ChevronRight, Wrench, Car, User, History, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const normalizeReg = (value) => String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

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

    const candidates = jobs.filter((job) => normalizeReg(job.vehicleReg).includes(q) || q.includes(normalizeReg(job.vehicleReg)));
    if (!candidates.length) return null;

    const registration = candidates[0].vehicleReg;
    const sameVehicle = jobs
      .filter((job) => normalizeReg(job.vehicleReg) === normalizeReg(registration))
      .sort((a, b) => String(b.createdDate || '').localeCompare(String(a.createdDate || '')));

    const currentOpen = sameVehicle.find((job) => !['Delivered', 'Cancelled'].includes(job.status));
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

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">Workshop</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-content">Job Cards</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Track every vehicle from check-in and customer complaint through inspection, approval, repair, QC, invoice and delivery.</p>
        </div>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white" onClick={() => navigate('/jobs/new')}>
          <Plus size={16}/>New Job Card
        </button>
      </header>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ['Total', counts.total, 'All'],
          ['Active', counts.active, 'All'],
          ['Waiting Parts', counts.waiting, 'Waiting for Parts'],
          ['Ready', counts.ready, 'Ready for Delivery']
        ].map(([label,value,nextStatus])=>(
          <button key={label} onClick={()=>setStatus(nextStatus)} className="rounded-2xl border border-line bg-surface p-3 text-left">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</span>
            <strong className="mt-1 block text-xl font-black text-content">{value}</strong>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[minmax(260px,1fr)_200px]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3">
          <Search size={16} className="text-muted"/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search job, customer, phone or vehicle registration" className="min-w-0 flex-1 border-0 bg-transparent text-xs text-content outline-none"/>
        </label>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
          <option>All</option>
          {['New','Inspection','Estimate Pending','Approved','In Progress','Waiting for Parts','QC','Ready for Delivery','Delivered','Cancelled'].map((item)=><option key={item}>{item}</option>)}
        </select>
      </div>

      {vehicleLookup ? (
        <section className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-primary"><Car size={16}/>{vehicleLookup.registration}</div>
              <div className="mt-1 text-sm font-black text-content">{vehicleLookup.latest.customerName} · {vehicleLookup.latest.vehicleInfo}</div>
              <div className="mt-1 text-[11px] text-secondary">{vehicleLookup.latest.customerPhone}</div>
            </div>
            {vehicleLookup.currentOpen ? (
              <button onClick={()=>navigate(`/jobs/${vehicleLookup.currentOpen.id}/overview`)} className="h-9 rounded-xl border-0 bg-primary px-3 text-[11px] font-bold text-white">
                Open Current Job
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <LookupStat icon={History} label="Previous Visits" value={vehicleLookup.sameVehicle.length}/>
            <LookupStat icon={Wrench} label="Last Status" value={vehicleLookup.latest.status}/>
            <LookupStat icon={WalletCards} label="Total Spending" value={money.format(vehicleLookup.spending)}/>
            <LookupStat icon={Car} label="Last Service" value={vehicleLookup.latest.createdDate || '—'}/>
          </div>

          <div className="mt-3 rounded-xl bg-surface/80 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Last Replaced / Used Parts</div>
            <div className="mt-2 text-xs font-semibold text-content">{vehicleLookup.lastParts.length ? vehicleLookup.lastParts.join(' · ') : 'No parts history found'}</div>
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">Loading job cards…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">No job cards found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((job) => (
            <button type="button" className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-primary/25 hover:shadow-sm" key={job.id} onClick={() => navigate(`/jobs/${job.id}/overview`)}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-content">{job.jobNumber || job.id}</strong>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[9px] font-bold text-primary">{job.status || 'New'}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-secondary">
                  <span className="inline-flex items-center gap-1"><Car size={13}/>{job.vehicleReg || 'No registration'} · {job.vehicleInfo || 'Vehicle'}</span>
                  <span className="inline-flex items-center gap-1"><User size={13}/>{job.customerName || 'Walk-in customer'}</span>
                  {job.assignedEmployeeName ? <span className="inline-flex items-center gap-1"><Wrench size={13}/>{job.assignedEmployeeName}</span> : null}
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted"/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function LookupStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-surface/80 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted"><Icon size={13}/>{label}</div>
      <div className="mt-1 truncate text-xs font-extrabold text-content">{value}</div>
    </div>
  );
}

export default JobList;
