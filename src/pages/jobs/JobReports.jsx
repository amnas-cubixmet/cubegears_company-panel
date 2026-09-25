import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, FileText, Hourglass, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

export const JobReports = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    jobService.getJobs().then((data) => setJobs(Array.isArray(data) ? data : []));
  }, []);

  const data = useMemo(() => {
    const open = jobs.filter((job) => !['Delivered', 'Cancelled'].includes(job.status));
    const completed = jobs.filter((job) => job.status === 'Delivered');
    const pendingApproval = jobs.filter((job) => ['Pending', 'Estimate Pending'].includes(job.approvalStatus) || job.status === 'Estimate Pending');
    const waitingParts = jobs.filter((job) => job.status === 'Waiting for Parts');

    const labourRevenue = jobs.reduce((sum, job) => {
      return sum + (job.labourRecords || []).reduce(
        (inner, row) => inner + Number(row.customerCharge || 0),
        0
      );
    }, 0);

    const repairHours = completed
      .map((job) => (job.labourRecords || []).reduce((sum, row) => sum + Number(row.hours || 0), 0))
      .filter((value) => value > 0);

    const avgRepair = repairHours.length
      ? repairHours.reduce((sum, value) => sum + value, 0) / repairHours.length
      : 0;

    const tech = new Map();
    jobs.forEach((job) => {
      const name = job.assignedEmployeeName || 'Unassigned';
      const current = tech.get(name) || { name, jobs: 0, delivered: 0, labourRevenue: 0, hours: 0 };
      current.jobs += 1;
      if (job.status === 'Delivered') current.delivered += 1;
      current.labourRevenue += (job.labourRecords || []).reduce((sum, row) => sum + Number(row.customerCharge || 0), 0);
      current.hours += (job.labourRecords || []).reduce((sum, row) => sum + Number(row.hours || 0), 0);
      tech.set(name, current);
    });

    return {
      open,
      completed,
      pendingApproval,
      waitingParts,
      labourRevenue,
      avgRepair,
      technicians: [...tech.values()].sort((a,b)=>b.jobs-a.jobs)
    };
  }, [jobs]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button onClick={()=>navigate('/jobs')} className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-secondary"><ArrowLeft size={17}/></button>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">Workshop Analytics</div>
            <h1 className="mt-1 text-2xl font-black text-content">Job Card Reports</h1>
            <p className="mt-1 text-xs text-muted">Operational job status, technician load, labour revenue and repair-time summary.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['Open Jobs', data.open.length, Wrench],
          ['Completed', data.completed.length, FileText],
          ['Pending Approval', data.pendingApproval.length, Hourglass],
          ['Waiting Parts', data.waitingParts.length, Clock3],
          ['Labour Revenue', money.format(data.labourRevenue), FileText],
          ['Avg Repair Time', `${data.avgRepair.toFixed(1)}h`, Clock3]
        ].map(([label,value,Icon])=>(
          <div key={label} className="rounded-2xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-muted"><span>{label}</span><Icon size={14} className="text-primary"/></div>
            <div className="mt-2 text-lg font-black text-content">{value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm font-extrabold text-content">Technician-wise Jobs</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-xs">
            <thead className="bg-surface-2 text-[10px] uppercase tracking-wide text-muted">
              <tr>
                {['Technician','Assigned Jobs','Delivered','Productive Hours','Labour Revenue'].map((head)=><th key={head} className="px-3 py-3">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.technicians.map((row)=>(
                <tr key={row.name} className="border-t border-line">
                  <td className="px-3 py-3 font-bold text-content">{row.name}</td>
                  <td className="px-3 py-3 text-content">{row.jobs}</td>
                  <td className="px-3 py-3 text-content">{row.delivered}</td>
                  <td className="px-3 py-3 text-content">{row.hours.toFixed(1)}h</td>
                  <td className="px-3 py-3 font-bold text-primary">{money.format(row.labourRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatusList title="Open Jobs" jobs={data.open} navigate={navigate}/>
        <StatusList title="Waiting for Parts" jobs={data.waitingParts} navigate={navigate}/>
      </section>
    </div>
  );
};

function StatusList({ title, jobs, navigate }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-sm font-extrabold text-content">{title}</div>
      <div className="mt-3 flex flex-col gap-2">
        {jobs.slice(0,8).map((job)=>(
          <button key={job.id} onClick={()=>navigate(`/jobs/${job.id}/overview`)} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3 text-left">
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-content">{job.jobNumber} · {job.vehicleReg}</div>
              <div className="mt-1 truncate text-[10px] text-muted">{job.customerName} · {job.assignedEmployeeName || 'Unassigned'}</div>
            </div>
            <span className="shrink-0 rounded-full bg-primary-soft px-2 py-1 text-[9px] font-bold text-primary">{job.status}</span>
          </button>
        ))}
        {!jobs.length ? <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted">No records.</div> : null}
      </div>
    </div>
  );
}

export default JobReports;
