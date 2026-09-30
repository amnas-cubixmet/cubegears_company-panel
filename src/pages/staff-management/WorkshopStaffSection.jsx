import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, UserCheck, UserMinus, UserPlus, Building2, Wrench, Clock3, Briefcase,
  Gauge, FileText, AlertTriangle, Star, IndianRupee, Download, ShieldCheck,
  CalendarDays, Activity, CheckCircle2, Plus, Save
} from 'lucide-react';
import { staffService } from '../../services/staff.service';
import { staffManagementService } from '../../services/staffManagement.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { StaffShiftCrud } from './StaffShiftCrud';
import { StaffSkillCrud } from './StaffSkillCrud';
import { StaffDocumentCrud } from './StaffDocumentCrud';
import {
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
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamStaffTarget, setTeamStaffTarget] = useState(null);
  const [teamStaffSelection, setTeamStaffSelection] = useState([]);
  const [savingTeamStaff, setSavingTeamStaff] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: '',
    lead: '',
    branch: 'Main Garage Branch',
    description: ''
  });

  useEffect(() => {
    Promise.all([
      staffService.getStaff(),
      staffManagementService.getTeams()
    ])
      .then(([staffData, teamData]) => {
        setStaff(staffData);
        setTeams(teamData);
      })
      .finally(() => setLoading(false));
  }, []);

  const createTeam = async (event) => {
    event.preventDefault();
    if (!teamForm.name.trim() || savingTeam) return;

    setSavingTeam(true);
    try {
      await staffManagementService.createTeam(teamForm);
      const nextTeams = await staffManagementService.getTeams();
      setTeams(nextTeams);
      setTeamForm({
        name: '',
        lead: '',
        branch: 'Main Garage Branch',
        description: ''
      });
      setIsTeamFormOpen(false);
    } finally {
      setSavingTeam(false);
    }
  };

  const openTeamStaff = (team) => {
    setTeamStaffTarget(team);
    setTeamStaffSelection([]);
  };

  const toggleTeamStaff = (staffId) => {
    setTeamStaffSelection((current) =>
      current.includes(staffId)
        ? current.filter((id) => id !== staffId)
        : [...current, staffId]
    );
  };

  const assignTeamStaff = async (event) => {
    event.preventDefault();
    if (!teamStaffTarget || !teamStaffSelection.length || savingTeamStaff) return;

    setSavingTeamStaff(true);
    try {
      await staffManagementService.assignStaffToTeam(teamStaffTarget.id, teamStaffSelection);
      const nextStaff = await staffService.getStaff();
      setStaff(nextStaff);
      setTeamStaffSelection([]);
      setTeamStaffTarget(null);
    } finally {
      setSavingTeamStaff(false);
    }
  };

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
              {teams.map((department) => {
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
          action={(
            <button
              type="button"
              className="staff-team-add-button"
              onClick={() => setIsTeamFormOpen(true)}
            >
              <Plus size={15} /> Add Team
            </button>
          )}
        />

        <div className="staff-team-grid">
          {teams.map((department) => {
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

                {(department.branch || department.description) ? (
                  <div className="staff-team-card__meta">
                    {department.branch ? <span>{department.branch}</span> : null}
                    {department.description ? <p>{department.description}</p> : null}
                  </div>
                ) : null}

                <div className="staff-team-members">
                  {members.length ? members.map((member) => (
                    <div key={member.id} className="staff-team-member">
                      {member.photo ? (
                        <img src={member.photo} alt="" />
                      ) : (
                        <span className="staff-team-member__avatar">
                          {member.name?.slice(0, 1)}
                        </span>
                      )}
                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.designation}</span>
                      </div>
                    </div>
                  )) : <div className="staff-workshop-empty is-compact">No staff assigned.</div>}
                </div>

                <button
                  type="button"
                  className="staff-team-assign-button"
                  onClick={() => openTeamStaff(department)}
                >
                  <UserPlus size={14}/> Add Staff
                </button>
              </article>
            );
          })}
        </div>

        <ResponsiveModalSheet
          isOpen={isTeamFormOpen}
          onClose={() => setIsTeamFormOpen(false)}
          title="Add Workshop Team"
          maxWidth="520px"
        >
          <form className="staff-team-form" onSubmit={createTeam}>
            <label>
              Team / Department Name *
              <input
                required
                value={teamForm.name}
                onChange={(event) => setTeamForm((old) => ({ ...old, name: event.target.value }))}
                placeholder="e.g. Diesel Team"
              />
            </label>

            <label>
              Team Lead
              <select
                value={teamForm.lead}
                onChange={(event) => setTeamForm((old) => ({ ...old, lead: event.target.value }))}
              >
                <option value="">Not Assigned</option>
                {activeStaff.map((person) => (
                  <option key={person.id} value={person.name}>
                    {person.name} · {person.designation}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Branch
              <select
                value={teamForm.branch}
                onChange={(event) => setTeamForm((old) => ({ ...old, branch: event.target.value }))}
              >
                <option>Main Garage Branch</option>
                <option>Kochi South Branch</option>
                <option>All Branches</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                rows={3}
                value={teamForm.description}
                onChange={(event) => setTeamForm((old) => ({ ...old, description: event.target.value }))}
                placeholder="What this team handles in the workshop"
              />
            </label>

            <div className="staff-team-form__actions">
              <button
                type="button"
                className="staff-team-cancel-button"
                onClick={() => setIsTeamFormOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="staff-team-save-button" disabled={savingTeam}>
                <Save size={14} />
                {savingTeam ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </ResponsiveModalSheet>

        <ResponsiveModalSheet
          isOpen={!!teamStaffTarget}
          onClose={() => {
            setTeamStaffTarget(null);
            setTeamStaffSelection([]);
          }}
          title={teamStaffTarget ? `Add Staff to ${teamStaffTarget.name}` : 'Add Staff to Team'}
          maxWidth="560px"
        >
          <form className="staff-crud-form" onSubmit={assignTeamStaff}>
            <div className="staff-assignment-note">
              Selected staff will be moved from their current department/team to <strong>{teamStaffTarget?.name}</strong>.
            </div>

            <fieldset className="staff-crud-assignment-fieldset">
              <legend>Select Staff</legend>
              <div className="staff-crud-check-grid">
                {activeStaff
                  .filter((person) => person.department !== teamStaffTarget?.name)
                  .map((person) => (
                    <label key={person.id} className="staff-crud-check">
                      <input
                        type="checkbox"
                        checked={teamStaffSelection.includes(person.id)}
                        onChange={() => toggleTeamStaff(person.id)}
                      />
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.designation} · Current: {person.department || 'Unassigned'}</small>
                      </span>
                    </label>
                  ))}
              </div>
            </fieldset>

            {!activeStaff.some((person) => person.department !== teamStaffTarget?.name) ? (
              <div className="staff-workshop-empty is-compact">All active staff are already in this team.</div>
            ) : null}

            <div className="staff-crud-form__actions">
              <button
                type="button"
                className="staff-crud-cancel-button"
                onClick={() => {
                  setTeamStaffTarget(null);
                  setTeamStaffSelection([]);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="staff-crud-save-button"
                disabled={!teamStaffSelection.length || savingTeamStaff}
              >
                <UserPlus size={14}/>
                {savingTeamStaff ? 'Assigning...' : `Add ${teamStaffSelection.length || ''} Staff`}
              </button>
            </div>
          </form>
        </ResponsiveModalSheet>
      </div>
    );
  }

  if (section === 'shifts') {
    return <StaffShiftCrud staff={staff} />;
  }

  if (section === 'skills') {
    return <StaffSkillCrud staff={staff} />;
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
    return <StaffDocumentCrud staff={staff} />;
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
