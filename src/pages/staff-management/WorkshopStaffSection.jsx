import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, UserCheck, UserMinus, UserPlus, Building2, Wrench, Clock3, Briefcase,
  Gauge, FileText, AlertTriangle, Star, IndianRupee, Download, ShieldCheck,
  CalendarDays, Activity, CheckCircle2
} from 'lucide-react';
import { staffService } from '../../services/staff.service';
import {
  workshopDepartments,
  workshopSkills,
  workshopShifts,
  staffJobAssignments,
  staffPerformance
} from '../../mock/staffManagement.mock';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [
    header,
    ...rows.map((row) => header.map((key) => row[key] ?? ''))
  ]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const SectionHeader = ({ title, description, action }) => (
  <section className="staff-workshop-section-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {action || null}
  </section>
);

const MetricCard = ({ label, value, icon: Icon, tone = 'primary', note }) => (
  <article className="staff-workshop-kpi-card">
    <div className="staff-workshop-kpi-card__top">
      <span>{label}</span>
      <span className={`staff-workshop-kpi-card__icon is-${tone}`}>
        <Icon size={16} />
      </span>
    </div>
    <strong>{value}</strong>
    {note ? <small>{note}</small> : null}
  </article>
);

export const WorkshopStaffSection = ({ section }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffService.getStaff()
      .then(setStaff)
      .finally(() => setLoading(false));
  }, []);

  const activeStaff = useMemo(
    () => staff.filter((item) => ['Active', 'Probation', 'Notice Period'].includes(item.employmentStatus)),
    [staff]
  );

  const overview = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return {
      total: staff.length,
      active: staff.filter((item) => item.employmentStatus === 'Active').length,
      onLeave: staff.filter((item) => item.employmentStatus === 'On Leave').length,
      newJoiners: staff.filter((item) => {
        const joined = safeDate(item.joiningDate);
        return joined && joined >= oneYearAgo;
      }).length,
      inactive: staff.filter((item) =>
        ['Inactive', 'Resigned', 'Terminated', 'Suspended'].includes(item.employmentStatus)
      ).length
    };
  }, [staff]);

  const performanceRows = useMemo(
    () =>
      activeStaff.map((person) => ({
        person,
        metrics: staffPerformance[person.id] || {
          jobsCompleted: 0,
          labourRevenue: 0,
          productiveHours: 0,
          utilization: 0,
          comebackJobs: 0,
          customerRating: 0
        }
      })),
    [activeStaff]
  );

  if (loading) {
    return <div className="staff-workshop-empty">Loading staff management data...</div>;
  }

  if (section === 'overview') {
    const missingDocs = activeStaff.filter((item) => !item.documents?.length).length;

    return (
      <div className="staff-workshop-view">
        <div className="staff-workshop-kpi-grid">
          <MetricCard label="Total Staff" value={overview.total} icon={Users} />
          <MetricCard label="Active" value={overview.active} icon={UserCheck} tone="success" />
          <MetricCard label="On Leave" value={overview.onLeave} icon={CalendarDays} tone="warning" />
          <MetricCard label="New Joiners" value={overview.newJoiners} icon={UserPlus} />
          <MetricCard label="Resigned / Inactive" value={overview.inactive} icon={UserMinus} tone="danger" />
        </div>

        <div className="staff-workshop-two-column">
          <section className="staff-workshop-panel">
            <div className="staff-workshop-panel__header">
              <div>
                <h3>Department / Team</h3>
                <p>Current workshop staff distribution.</p>
              </div>
              <Building2 size={17} />
            </div>
            <div className="staff-department-list">
              {workshopDepartments.map((department) => {
                const members = staff.filter((item) => item.department === department.name);
                return (
                  <div key={department.id} className="staff-data-row">
                    <div>
                      <strong>{department.name}</strong>
                      <span>{department.lead}</span>
                    </div>
                    <b>{members.length}</b>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="staff-workshop-panel">
            <div className="staff-workshop-panel__header">
              <div>
                <h3>Workshop Attention</h3>
                <p>Items that need staff manager follow-up.</p>
              </div>
              <AlertTriangle size={17} />
            </div>
            <div className="staff-attention-grid">
              <div><span>Missing Documents</span><strong>{missingDocs}</strong></div>
              <div><span>Notice Period</span><strong>{staff.filter((item) => item.employmentStatus === 'Notice Period').length}</strong></div>
              <div><span>Suspended</span><strong>{staff.filter((item) => item.employmentStatus === 'Suspended').length}</strong></div>
              <div><span>Open Job Assignments</span><strong>{staffJobAssignments.length}</strong></div>
            </div>
          </section>
        </div>

        <section className="staff-workshop-panel">
          <div className="staff-workshop-panel__header">
            <div>
              <h3>Active Job Assignments</h3>
              <p>Mechanic and supervisor workload from current job cards.</p>
            </div>
            <Briefcase size={17} />
          </div>
          <div className="staff-job-grid">
            {staffJobAssignments.map((job) => {
              const person = staff.find((item) => item.id === job.staffId);
              return (
                <article key={job.id} className="staff-job-card">
                  <div className="staff-job-card__head">
                    <strong>{job.id}</strong>
                    <span>{job.status}</span>
                  </div>
                  <h4>{job.vehicle}</h4>
                  <p>{job.work}</p>
                  <div className="staff-job-card__meta">
                    <span>{person?.name || job.staffId}</span>
                    <span>{job.bookedHours}h</span>
                  </div>
                  <div className="staff-progress"><i style={{ width: `${job.progress}%` }} /></div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (section === 'teams') {
    return (
      <div className="staff-workshop-view">
        <SectionHeader
          title="Departments & Teams"
          description="Group technicians and support staff by workshop function and team lead."
        />
        <div className="staff-team-grid">
          {workshopDepartments.map((department) => {
            const members = staff.filter((item) => item.department === department.name);
            return (
              <article key={department.id} className="staff-workshop-panel staff-team-card">
                <div className="staff-team-card__head">
                  <div>
                    <h3>{department.name}</h3>
                    <p>Lead: {department.lead}</p>
                  </div>
                  <span>{members.length}</span>
                </div>
                <div className="staff-team-members">
                  {members.length ? members.map((member) => (
                    <div key={member.id} className="staff-team-member">
                      <img src={member.photo} alt="" />
                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.designation}</span>
                      </div>
                    </div>
                  )) : <div className="staff-workshop-empty is-compact">No staff assigned.</div>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  if (section === 'shifts') {
    return (
      <div className="staff-workshop-view">
        <SectionHeader
          title="Shift Assignment"
          description="Morning, evening and custom workshop shifts with weekly-off and branch allocation."
        />
        <div className="staff-shift-grid">
          {workshopShifts.map((shift) => {
            const members = staff.filter((item) =>
              String(item.shift || '').toLowerCase().includes(shift.name.replace(' Shift', '').toLowerCase())
            );
            return (
              <article key={shift.id} className="staff-workshop-panel staff-shift-card">
                <div className="staff-shift-card__icon"><Clock3 size={18} /></div>
                <h3>{shift.name}</h3>
                <strong>{shift.time}</strong>
                <div className="staff-shift-card__details">
                  <span>Weekly Off <b>{shift.weeklyOff}</b></span>
                  <span>Branch <b>{shift.branch}</b></span>
                  <span>Assigned Staff <b>{members.length}</b></span>
                </div>
                <div className="staff-chip-row">
                  {members.map((member) => <span key={member.id}>{member.name}</span>)}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  if (section === 'skills') {
    return (
      <div className="staff-workshop-view">
        <SectionHeader
          title="Skills & Specialization"
          description="Workshop skill coverage for assignment planning and technician development."
        />

        <div className="staff-skill-coverage">
          {workshopSkills.map((skill) => {
            const count = staff.filter((item) => item.skills?.includes(skill)).length;
            return (
              <div key={skill} className="staff-skill-coverage__item">
                <Wrench size={14} />
                <span>{skill}</span>
                <strong>{count}</strong>
              </div>
            );
          })}
        </div>

        <div className="staff-skill-person-grid">
          {activeStaff.map((person) => (
            <article key={person.id} className="staff-workshop-panel staff-skill-person">
              <div className="staff-skill-person__head">
                <img src={person.photo} alt="" />
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.designation} · {person.department}</p>
                </div>
              </div>
              <div className="staff-chip-row">
                {person.skills?.length
                  ? person.skills.map((skill) => <span key={skill}>{skill}</span>)
                  : <span className="is-muted">No skills assigned</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'performance') {
    const totals = performanceRows.reduce((acc, row) => ({
      jobs: acc.jobs + row.metrics.jobsCompleted,
      revenue: acc.revenue + row.metrics.labourRevenue,
      hours: acc.hours + row.metrics.productiveHours,
      rating: acc.rating + row.metrics.customerRating
    }), { jobs: 0, revenue: 0, hours: 0, rating: 0 });

    const rated = performanceRows.filter((row) => row.metrics.customerRating > 0).length;

    return (
      <div className="staff-workshop-view">
        <div className="staff-workshop-kpi-grid is-four">
          <MetricCard label="Jobs Completed" value={totals.jobs} icon={CheckCircle2} />
          <MetricCard label="Labour Revenue" value={money(totals.revenue)} icon={IndianRupee} tone="success" />
          <MetricCard label="Productive Hours" value={`${totals.hours.toFixed(1)}h`} icon={Gauge} />
          <MetricCard label="Avg. Feedback" value={rated ? (totals.rating / rated).toFixed(1) : '—'} icon={Star} tone="warning" />
        </div>

        <SectionHeader
          title="Staff Performance"
          description="Jobs completed, labour revenue, productivity, comeback jobs and customer feedback."
        />

        <div className="staff-performance-grid">
          {performanceRows.map(({ person, metrics }) => (
            <article key={person.id} className="staff-workshop-panel staff-performance-card">
              <div className="staff-performance-card__head">
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.designation} · {person.department}</p>
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
              <div className="staff-progress"><i style={{ width: `${metrics.utilization}%` }} /></div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'documents') {
    const documentRows = staff.flatMap((person) =>
      (person.documents || []).map((document) => ({
        ...document,
        staffId: person.id,
        staffName: person.name
      }))
    );

    return (
      <div className="staff-workshop-view">
        <SectionHeader
          title="Staff Documents"
          description="ID proof, licence, certificates, offer letter and employment contract records."
        />

        <div className="staff-document-summary">
          <div><FileText size={16}/><span>Total Documents</span><strong>{documentRows.length}</strong></div>
          <div><ShieldCheck size={16}/><span>Staff With Documents</span><strong>{staff.filter((item) => item.documents?.length).length}</strong></div>
          <div><AlertTriangle size={16}/><span>Missing Documents</span><strong>{staff.filter((item) => !item.documents?.length).length}</strong></div>
        </div>

        <div className="staff-document-grid">
          {staff.map((person) => (
            <article key={person.id} className="staff-workshop-panel staff-document-card">
              <div className="staff-document-card__head">
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.id} · {person.designation}</p>
                </div>
                <span className={person.documents?.length ? 'is-complete' : 'is-missing'}>
                  {person.documents?.length ? `${person.documents.length} files` : 'Missing'}
                </span>
              </div>
              <div className="staff-document-list">
                {person.documents?.length ? person.documents.map((doc) => (
                  <div key={doc.id} className="staff-data-row">
                    <div>
                      <strong>{doc.name}</strong>
                      <span>{doc.type} · {doc.uploadedDate}</span>
                    </div>
                    <FileText size={14}/>
                  </div>
                )) : <div className="staff-workshop-empty is-compact">No documents uploaded.</div>}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'reports') {
    const staffRows = staff.map((person) => ({
      employee_id: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      branch: person.branch,
      joining_date: person.joiningDate,
      employment_status: person.employmentStatus,
      shift: person.shift,
      weekly_off: person.weeklyOff
    }));

    const perfRows = performanceRows.map(({ person, metrics }) => ({
      employee_id: person.id,
      name: person.name,
      jobs_completed: metrics.jobsCompleted,
      labour_revenue: metrics.labourRevenue,
      productive_hours: metrics.productiveHours,
      utilization_percent: metrics.utilization,
      comeback_jobs: metrics.comebackJobs,
      customer_rating: metrics.customerRating
    }));

    return (
      <div className="staff-workshop-view">
        <SectionHeader
          title="Staff Reports"
          description="Operational HR reports for staff master, skills, performance and document compliance."
        />

        <div className="staff-report-grid">
          <button onClick={() => downloadCsv('staff-master.csv', staffRows)}>
            <Users size={18}/><span><strong>Staff Master</strong><small>Role, team, branch, shift and status</small></span><Download size={15}/>
          </button>
          <button onClick={() => downloadCsv('staff-performance.csv', perfRows)}>
            <Activity size={18}/><span><strong>Performance Report</strong><small>Jobs, revenue, hours, comeback and rating</small></span><Download size={15}/>
          </button>
          <button onClick={() => downloadCsv('staff-skills.csv', staff.map((person) => ({
            employee_id: person.id,
            name: person.name,
            department: person.department,
            skills: (person.skills || []).join(' | ')
          })))}>
            <Wrench size={18}/><span><strong>Skills Matrix</strong><small>Technician specialization coverage</small></span><Download size={15}/>
          </button>
          <button onClick={() => downloadCsv('staff-document-compliance.csv', staff.map((person) => ({
            employee_id: person.id,
            name: person.name,
            document_count: person.documents?.length || 0,
            id_proof: person.idProof,
            compliance: person.documents?.length ? 'Available' : 'Missing'
          })))}>
            <FileText size={18}/><span><strong>Document Compliance</strong><small>ID proof and employment file status</small></span><Download size={15}/>
          </button>
        </div>

        <section className="staff-workshop-panel">
          <div className="staff-workshop-panel__header">
            <div>
              <h3>Employment Status Report</h3>
              <p>Current staff lifecycle status by branch and team.</p>
            </div>
            <Users size={17}/>
          </div>
          <div className="staff-report-status-list">
            {staff.map((person) => (
              <div key={person.id} className="staff-data-row">
                <div>
                  <strong>{person.name}</strong>
                  <span>{person.id} · {person.department} · {person.branch}</span>
                </div>
                <b>{person.employmentStatus}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return <div className="staff-workshop-empty">This staff management section is not available.</div>;
};
