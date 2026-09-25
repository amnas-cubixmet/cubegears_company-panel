import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Send, Lock, Unlock, User, Building2, Clock3, Wrench,
  Gauge, DollarSign, FileText, Activity, ShieldCheck,
  Phone, Mail, MapPin, CalendarDays, Star, AlertTriangle
} from 'lucide-react';
import { staffService } from '../../../services/staff.service';
import { staffJobAssignments, staffPerformance } from '../../../mock/staffManagement.mock';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);

const tabs = [
  'Overview',
  'Attendance',
  'Assigned Jobs',
  'Performance',
  'Payroll',
  'Documents',
  'Activity History'
];

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="staff360-info-item">
    {Icon ? <Icon size={14} /> : null}
    <div>
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  </div>
);

export const StaffProfile = ({ staffId, onBack }) => {
  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    staffService.getStaffById(staffId).then(setStaff);
  }, [staffId]);

  const jobs = useMemo(
    () => staffJobAssignments.filter((item) => item.staffId === staffId),
    [staffId]
  );

  const performance = staffPerformance[staffId] || {
    jobsCompleted: 0,
    labourRevenue: 0,
    productiveHours: 0,
    utilization: 0,
    comebackJobs: 0,
    customerRating: 0
  };

  const showToast = (message) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(''), 2800);
  };

  const refresh = () => staffService.getStaffById(staffId).then(setStaff);

  const handleSendInvite = async () => {
    await staffService.sendLoginInvite(staff.id);
    showToast('Login invite sent.');
    refresh();
  };

  const handleToggleAccount = async () => {
    await staffService.toggleAccountStatus(staff.id);
    showToast(staff.accountStatus === 'Active' ? 'Account deactivated.' : 'Account activated.');
    refresh();
  };

  if (!staff) {
    return <div className="staff-workshop-empty">Loading 360° staff profile...</div>;
  }

  const attendance = {
    present: staff.employmentStatus === 'Active' ? 22 : 0,
    absent: staff.employmentStatus === 'Active' ? 1 : 0,
    leave: staff.employmentStatus === 'Active' ? 2 : 0,
    late: staff.employmentStatus === 'Active' ? 2 : 0,
    workedHours: staff.employmentStatus === 'Active' ? '176h 30m' : '—',
    leaveBalance: staff.employmentStatus === 'Active' ? '12 days' : '—'
  };

  return (
    <div className="staff-profile staff360">
      {toastMsg ? <div className="staff360-toast">{toastMsg}</div> : null}

      <div className="staff-profile-topbar">
        <button type="button" onClick={onBack} aria-label="Back to all staff">
          <ArrowLeft size={17} />
        </button>
        <div>
          <h2>360° Staff Profile</h2>
          <p>Attendance, assigned jobs, performance, payroll and employment record in one view.</p>
        </div>
      </div>

      <section className="staff-profile-hero staff360-hero">
        <div className="staff360-person">
          {staff.photo ? (
            <img src={staff.photo} alt={staff.name} />
          ) : (
            <div className="staff360-avatar-fallback">{staff.name?.slice(0, 1)}</div>
          )}
          <div>
            <div className="staff360-name-row">
              <h3>{staff.name}</h3>
              <span className={`staff360-status is-${String(staff.employmentStatus || '').toLowerCase().replaceAll(' ', '-')}`}>
                {staff.employmentStatus}
              </span>
            </div>
            <p>{staff.id} · {staff.designation} · {staff.department}</p>
            <div className="staff360-contact-line">
              <span><Phone size={12}/>{staff.phone}</span>
              <span><Mail size={12}/>{staff.email || 'No email'}</span>
            </div>
          </div>
        </div>

        <div className="staff360-hero-actions">
          <button type="button" onClick={handleSendInvite} className="staff360-secondary-button">
            <Send size={14}/> Send Login Invite
          </button>
          <button type="button" onClick={handleToggleAccount} className="staff360-secondary-button">
            {staff.accountStatus === 'Active' ? <Lock size={14}/> : <Unlock size={14}/>}
            {staff.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </section>

      <nav className="staff-profile-tabs staff360-tabs" aria-label="Staff profile sections">
        <div className="scroll-hidden">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <section className="staff-profile-panel staff360-panel">
        {activeTab === 'Overview' && (
          <div className="staff360-overview">
            <div className="staff360-section">
              <div className="staff360-section__title"><User size={15}/> Personal & Employment</div>
              <div className="staff360-info-grid">
                <InfoItem label="Full Name" value={staff.name} icon={User} />
                <InfoItem label="Employee ID" value={staff.id} icon={ShieldCheck} />
                <InfoItem label="Phone" value={staff.phone} icon={Phone} />
                <InfoItem label="Email" value={staff.email} icon={Mail} />
                <InfoItem label="Address" value={staff.address} icon={MapPin} />
                <InfoItem label="Emergency Contact" value={staff.emergencyContact} icon={Phone} />
                <InfoItem label="ID Proof" value={staff.idProof} icon={FileText} />
                <InfoItem label="Joining Date" value={staff.joiningDate} icon={CalendarDays} />
              </div>
            </div>

            <div className="staff360-section">
              <div className="staff360-section__title"><Building2 size={15}/> Workshop Assignment</div>
              <div className="staff360-info-grid">
                <InfoItem label="Role" value={staff.role} icon={ShieldCheck} />
                <InfoItem label="Department" value={staff.department} icon={Building2} />
                <InfoItem label="Branch" value={staff.branch} icon={Building2} />
                <InfoItem label="Reporting Manager" value={staff.reportingManager} icon={User} />
                <InfoItem label="Shift" value={staff.shift} icon={Clock3} />
                <InfoItem label="Weekly Off" value={staff.weeklyOff} icon={CalendarDays} />
                <InfoItem label="Payment Type" value={staff.paymentType} icon={DollarSign} />
                <InfoItem label="Login Status" value={staff.loginStatus} icon={ShieldCheck} />
              </div>
            </div>

            <div className="staff360-section">
              <div className="staff360-section__title"><Wrench size={15}/> Skills & Specialization</div>
              <div className="staff-chip-row">
                {staff.skills?.length
                  ? staff.skills.map((skill) => <span key={skill}>{skill}</span>)
                  : <span className="is-muted">No skills assigned</span>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="staff360-tab-stack">
            <div className="staff360-metric-grid">
              <div><span>Present Days</span><strong>{attendance.present}</strong></div>
              <div><span>Absent Days</span><strong>{attendance.absent}</strong></div>
              <div><span>Leave Days</span><strong>{attendance.leave}</strong></div>
              <div><span>Late Entries</span><strong>{attendance.late}</strong></div>
              <div><span>Worked Hours</span><strong>{attendance.workedHours}</strong></div>
              <div><span>Leave Balance</span><strong>{attendance.leaveBalance}</strong></div>
            </div>
            <div className="staff360-note-card">
              <Clock3 size={16}/>
              <div><strong>Assigned Shift</strong><span>{staff.shift} · Weekly off: {staff.weeklyOff}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'Assigned Jobs' && (
          <div className="staff360-tab-stack">
            {jobs.length ? (
              <div className="staff360-job-list">
                {jobs.map((job) => (
                  <article key={job.id} className="staff360-job-card">
                    <div>
                      <span>{job.id}</span>
                      <strong>{job.vehicle}</strong>
                      <p>{job.work}</p>
                    </div>
                    <div className="staff360-job-side">
                      <b>{job.status}</b>
                      <span>{job.bookedHours}h assigned</span>
                    </div>
                    <div className="staff-progress"><i style={{ width: `${job.progress}%` }}/></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="staff-workshop-empty">No active job cards assigned to this staff member.</div>
            )}
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="staff360-tab-stack">
            <div className="staff360-metric-grid">
              <div><span>Jobs Completed</span><strong>{performance.jobsCompleted}</strong></div>
              <div><span>Labour Revenue</span><strong>{money(performance.labourRevenue)}</strong></div>
              <div><span>Productive Hours</span><strong>{performance.productiveHours}h</strong></div>
              <div><span>Utilization</span><strong>{performance.utilization}%</strong></div>
              <div><span>Comeback Jobs</span><strong>{performance.comebackJobs}</strong></div>
              <div><span>Customer Feedback</span><strong>{performance.customerRating || '—'} <Star size={12}/></strong></div>
            </div>
            <div className="staff360-note-card">
              <Gauge size={16}/>
              <div><strong>Productivity</strong><span>Workshop utilization based on assigned productive hours.</span></div>
              <div className="staff-progress"><i style={{ width: `${performance.utilization}%` }}/></div>
            </div>
          </div>
        )}

        {activeTab === 'Payroll' && (
          <div className="staff360-tab-stack">
            <div className="staff360-payroll-banner">
              <div><span>Payment Type</span><strong>{staff.paymentType || 'Monthly Salary'}</strong></div>
              <b>{staff.commissionRules ? 'Commission Linked' : 'Salary Based'}</b>
            </div>
            <div className="staff360-metric-grid">
              <div><span>Basic Salary</span><strong>{money(staff.salary?.basic)}</strong></div>
              <div><span>Allowances</span><strong>{money(staff.salary?.allowances)}</strong></div>
              <div><span>Incentives</span><strong>{money(staff.salary?.incentives)}</strong></div>
              <div><span>Gross Salary</span><strong>{money(staff.salary?.grossSalary)}</strong></div>
              <div><span>Advance Balance</span><strong>{money(staff.salary?.advanceBalance)}</strong></div>
            </div>
            {staff.commissionRules ? (
              <div className="staff360-info-grid">
                <InfoItem label="Commission Basis" value={staff.commissionRules.basis} />
                <InfoItem label="Default Rate" value={staff.commissionRules.defaultRate} />
                <InfoItem label="Applicable Services" value={staff.commissionRules.applicableServices} />
                <InfoItem label="Effective From" value={staff.commissionRules.effectiveDate} />
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="staff360-tab-stack">
            <div className="staff360-document-head">
              <div>
                <strong>Employment Documents</strong>
                <span>ID proof, licence, certificates, offer letter and contracts.</span>
              </div>
              <span className={staff.documents?.length ? 'is-complete' : 'is-missing'}>
                {staff.documents?.length ? `${staff.documents.length} files` : 'No files'}
              </span>
            </div>
            {staff.documents?.length ? (
              <div className="staff360-document-list">
                {staff.documents.map((doc) => (
                  <div key={doc.id}>
                    <FileText size={15}/>
                    <div><strong>{doc.name}</strong><span>{doc.type} · {doc.uploadedDate}</span></div>
                    <b>{doc.uploadedBy}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="staff360-note-card is-warning">
                <AlertTriangle size={16}/>
                <div><strong>Documents missing</strong><span>Upload ID proof and employment documents for compliance.</span></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Activity History' && (
          <div className="staff360-activity-list">
            {staff.activityHistory?.length ? staff.activityHistory.map((item) => (
              <div key={item.id}>
                <span className="staff360-activity-icon"><Activity size={14}/></span>
                <div>
                  <strong>{item.action}</strong>
                  <p>{item.oldValue} → {item.newValue}</p>
                  <small>{item.actor} · {item.timestamp}</small>
                </div>
              </div>
            )) : <div className="staff-workshop-empty">No audit history available.</div>}
          </div>
        )}
      </section>
    </div>
  );
};
