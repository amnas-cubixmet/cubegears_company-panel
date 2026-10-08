import React from 'react';
import { Activity, Building2, Download, FileText, Users } from 'lucide-react';
import { getEmployeeLabel } from './staffDisplay';

const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header, ...rows.map((row) => header.map((key) => row[key] ?? ''))]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
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

export const StaffReportsSection = ({ staff = [], performanceRows = [] }) => {
  const staffRows = staff.map((person) => ({
    employee_number: getEmployeeLabel(person),
    name: person.name,
    role: person.role,
    department: person.department,
    branch: person.branch,
    joining_date: person.joiningDate,
    employment_status: person.employmentStatus,
    shift: person.shift,
    weekly_off: person.weeklyOff,
  }));

  const perfRows = performanceRows.map(({ person, metrics }) => ({
    employee_number: getEmployeeLabel(person),
    name: person.name,
    jobs_completed: metrics.jobsCompleted,
    labour_revenue: metrics.labourRevenue,
    productive_hours: metrics.productiveHours,
    utilization_percent: metrics.utilization,
    comeback_jobs: metrics.comebackJobs,
    customer_rating: metrics.customerRating,
  }));

  const complianceRows = staff.map((person) => ({
    employee_number: getEmployeeLabel(person),
    name: person.name,
    document_count: person.documents?.length || 0,
    id_proof: person.idProof || '—',
    compliance: person.documents?.length ? 'Available' : 'Missing',
  }));

  const branchRows = staff.map((person) => ({
    employee_number: getEmployeeLabel(person),
    name: person.name,
    branch: person.branch || 'Unassigned',
    department: person.department || 'Unassigned',
    shift: person.shift || 'Unassigned',
    status: person.employmentStatus,
  }));

  const reports = [
    ['Staff Master', 'Role, team, branch, shift and status', Users, 'staff-master.csv', staffRows],
    ['Performance Report', 'Jobs, revenue, hours, comeback and rating', Activity, 'staff-performance.csv', perfRows],
    ['Document Compliance', 'ID proof and employment file status', FileText, 'staff-document-compliance.csv', complianceRows],
    ['Branch & Shift', 'Staff allocation by branch, team and shift', Building2, 'staff-branch-shift.csv', branchRows],
  ];

  return (
    <div className="staff-dashboard-subpage">
      <section className="staff-subpage-header">
        <div>
          <h2>Staff Reports</h2>
          <p>Operational HR exports for staff, performance, documents and branch allocation.</p>
        </div>
      </section>

      <div className="staff-report-grid">
        {reports.map(([title, description, Icon, filename, rows]) => (
          <button key={title} type="button" onClick={() => downloadCsv(filename, rows)}>
            <Icon size={18}/>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <Download size={15}/>
          </button>
        ))}
      </div>

      <section className="staff-workshop-panel staff-report-status-panel">
        <div className="staff-workshop-panel__header">
          <div>
            <h3>Employment Status</h3>
            <p>Current staff lifecycle status by branch and team.</p>
          </div>
          <Users size={17}/>
        </div>

        <div className="staff-report-status-list">
          {staff.map((person) => (
            <div key={person.id} className="staff-data-row">
              <div>
                <strong>{person.name}</strong>
                <span>
                  {getEmployeeLabel(person)} · {person.department || 'Unassigned'} · {person.branch || 'No branch'}
                </span>
              </div>
              <b>{person.employmentStatus}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
