import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  FilePlus2,
  FileText,
  Gauge,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  ShieldCheck,
  Star,
  Unlock,
  User,
  WalletCards,
  Wrench,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  StaffAttendanceCalendar,
  StaffAvatar,
  StaffDocumentAddSheet,
  StaffPayrollHistory,
  StaffProfileEditSheet,
} from '../../../components/staff-management';
import { getEmployeeLabel } from '../../../components/staff-management/staffDisplay';
import { useAuth } from '../../../hooks/useAuth';
import { USE_MOCK_API } from '../../../api/apiConfig';
import { hasPermission } from '../../../utils/permissions';
import { attendanceManagerService } from '../../../services/attendanceManager.service';
import { jobService } from '../../../services/job.service';
import { payrollService } from '../../../services/payroll.service';
import { roleService } from '../../../services/role.service';
import { staffService } from '../../../services/staff.service';
import { staffManagementService } from '../../../services/staffManagement.service';
import {
  staffJobAssignments,
  staffPerformance,
} from '../../../mock/staffManagement.mock';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const currentMonthValue = () => new Date().toISOString().slice(0, 7);

const displayText = (value, fallback = '—') => {
  if (value === null || value === undefined || value === '') return fallback;

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => displayText(item, ''))
      .filter(Boolean)
      .join(', ');
    return text || fallback;
  }

  if (typeof value === 'object') {
    const preferredKeys = [
      'description',
      'name',
      'title',
      'label',
      'code',
      'status',
      'value',
    ];

    for (const key of preferredKeys) {
      const candidate = value[key];
      if (
        candidate !== null &&
        candidate !== undefined &&
        candidate !== '' &&
        (typeof candidate === 'string' || typeof candidate === 'number')
      ) {
        return String(candidate);
      }
    }

    const primitiveValues = Object.values(value)
      .filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          item !== '' &&
          (typeof item === 'string' || typeof item === 'number'),
      )
      .map(String);

    return primitiveValues.join(' · ') || fallback;
  }

  return String(value);
};


const TABS = [
  ['Overview', User],
  ['Attendance', CalendarDays],
  ['Assigned Work', BriefcaseBusiness],
  ['Performance', Gauge],
  ['Payroll', WalletCards],
  ['Documents', FileText],
  ['Activity History', Activity],
];

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="staff360-info-item">
    {Icon ? <Icon size={14} /> : null}
    <div>
      <span>{label}</span>
      <strong>{displayText(value)}</strong>
    </div>
  </div>
);

const normalizeDocument = (document = {}) => ({
  ...document,
  name: document.name || document.title || 'Document',
  type: document.type || document.document_type || 'Document',
  uploadedDate:
    document.uploadedDate ||
    document.created_at?.slice?.(0, 10) ||
    '—',
  uploadedBy: document.uploadedBy || document.uploaded_by || 'Admin',
  fileUrl: document.fileUrl || document.file_url || '',
  expiryDate: document.expiryDate || document.expiry_date || '',
  staffId:
    document.staffId ||
    document.employee ||
    document.employeeId ||
    document.employee_id,
});

const normalizeActivity = (item = {}) => ({
  ...item,
  actor: displayText(item.actorName || item.actor, 'System'),
  timestamp:
    item.created_at ||
    item.timestamp ||
    '',
  details: displayText(
    item.details ||
      [item.oldValue, item.newValue].filter(Boolean).join(' → '),
    '',
  ),
});

export const StaffProfile = ({ staffId: staffIdProp, onBack }) => {
  const navigate = useNavigate();
  const { staffId: routeStaffId } = useParams();
  const staffId = staffIdProp || routeStaffId;
  const goBack = onBack || (() => navigate('/staff-management/staff'));
  const { user } = useAuth();

  const [staff, setStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [error, setError] = useState('');

  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);

  const [attendanceMonth, setAttendanceMonth] = useState(currentMonthValue());
  const [attendanceCalendar, setAttendanceCalendar] = useState(null);
  const [payrollMonth, setPayrollMonth] = useState('All');

  const [editOpen, setEditOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);

  const isOwnProfile =
    Boolean(user?.employeeProfileId) &&
    String(user.employeeProfileId) === String(staffId);

  const canEdit = hasPermission(user, 'staff.edit');
  const canManageAttendance = hasPermission(user, 'attendance.manage');
  const canViewPayroll = hasPermission(user, 'payroll.view');
  const canManagePayroll = hasPermission(user, 'payroll.edit');

  const showToast = (message) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(''), 2600);
  };

  const loadStaff = async () => {
    const profile = isOwnProfile
      ? await staffService.getMyStaff()
      : await staffService.getStaffById(staffId);
    setStaff(profile);
    return profile;
  };

  const loadSupportData = async (profile) => {
    const tasks = [
      roleService.getRoles(),
      staffManagementService.getTeams(),
      staffManagementService.getShifts(),
      staffManagementService.getSkills(),
      staffManagementService.getDocuments(),
      staffService.getActivities(profile.id),
      jobService.getJobs(),
      canViewPayroll || isOwnProfile
        ? payrollService.getPayrolls({ staffId: profile.id })
        : Promise.resolve([]),
      canViewPayroll || isOwnProfile
        ? payrollService.getSalaryStructures()
        : Promise.resolve([]),
    ];

    const results = await Promise.allSettled(tasks);
    const value = (index, fallback = []) =>
      results[index]?.status === 'fulfilled'
        ? results[index].value
        : fallback;

    setRoles(Array.isArray(value(0)) ? value(0) : []);
    setTeams(Array.isArray(value(1)) ? value(1) : []);
    setShifts(Array.isArray(value(2)) ? value(2) : []);
    setSkills(Array.isArray(value(3)) ? value(3) : []);

    const allDocuments = Array.isArray(value(4)) ? value(4) : [];
    setDocuments(
      allDocuments
        .map(normalizeDocument)
        .filter((document) =>
          String(document.staffId || '') === String(profile.id),
        ),
    );

    setActivities(
      (Array.isArray(value(5)) ? value(5) : []).map(normalizeActivity),
    );

    const allJobs = Array.isArray(value(6)) ? value(6) : [];
    if (USE_MOCK_API) {
      setJobs(
        staffJobAssignments
          .filter((job) =>
            String(job.staffId) ===
            String(profile.employeeId || profile.id),
          )
          .map((job) => ({
            ...job,
            jobNumber: job.id,
            labourTotal: 0,
            customerRating: null,
            customerFeedback: '',
          })),
      );
    } else {
      const linkedUser = profile.user;
      setJobs(
        allJobs.filter((job) =>
          [
            job.technician,
            job.technicianId,
            job.assignedEmployee,
            job.assignedEmployeeId,
            job.staffId,
          ].some((value) =>
            String(value || '') === String(linkedUser || profile.id),
          ),
        ),
      );
    }

    const payrollRows = Array.isArray(value(7)) ? value(7) : [];
    setPayrolls(payrollRows);

    const structures = Array.isArray(value(8)) ? value(8) : [];
    setSalaryStructure(
      structures.find((row) =>
        String(row.staffId || row.employee) === String(profile.id),
      ) || null,
    );
  };

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await loadStaff();
      await loadSupportData(profile);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load staff profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [staffId]);

  useEffect(() => {
    if (!staff || !canManageAttendance) {
      setAttendanceCalendar(null);
      return;
    }

    const [year, month] = attendanceMonth.split('-').map(Number);
    attendanceManagerService
      .getMonthlyCalendar(month, year)
      .then(setAttendanceCalendar)
      .catch(() => setAttendanceCalendar(null));
  }, [staff?.id, attendanceMonth, canManageAttendance]);

  const attendanceEmployee = useMemo(() => {
    const rows = attendanceCalendar?.employees || [];
    return rows.find((row) =>
      String(row.employeeId || '') === String(staff?.id || '') ||
      String(row.staffId || '') === String(staff?.employeeId || ''),
    );
  }, [attendanceCalendar, staff]);

  const attendanceSummary = useMemo(() => {
    const days = Object.values(attendanceEmployee?.days || {});
    const count = (status) =>
      days.filter((day) => day.status === status).length;

    return {
      present: count('Present'),
      absent: count('Absent'),
      leave: count('On Leave'),
      late: days.filter((day) => Number(day.lateMinutes || 0) > 0).length,
      weeklyOff: count('Weekly Off'),
      holidays: count('Holiday'),
    };
  }, [attendanceEmployee]);

  const performance = useMemo(() => {
    if (USE_MOCK_API) {
      return staffPerformance[staff?.employeeId || staff?.id] || {
        jobsCompleted: 0,
        labourRevenue: 0,
        productiveHours: 0,
        utilization: 0,
        comebackJobs: 0,
        customerRating: 0,
      };
    }

    const completed = jobs.filter((job) => job.status === 'Delivered');
    const labourRevenue = completed.reduce(
      (sum, job) =>
        sum + Number(job.labourTotal || job.labour_total || 0),
      0,
    );
    const ratings = jobs
      .map((job) => Number(job.customerRating || job.customer_rating || 0))
      .filter((rating) => rating > 0);

    return {
      jobsCompleted: completed.length,
      labourRevenue,
      productiveHours: jobs.reduce(
        (sum, job) => sum + Number(job.bookedHours || job.productiveHours || 0),
        0,
      ),
      utilization: 0,
      comebackJobs: jobs.filter((job) => job.isComeback || job.comeback).length,
      customerRating: ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0,
      averageLabourValue: completed.length
        ? labourRevenue / completed.length
        : 0,
    };
  }, [jobs, staff]);

  const handleSendInvite = async () => {
    if (!staff?.email) {
      showToast('Add an email address before sending an invite.');
      return;
    }
    try {
      await staffService.sendLoginInvite(staff.id);
      showToast('Login invite sent by email.');
      await refreshAll();
    } catch (requestError) {
      showToast(requestError?.message || 'Unable to send invite.');
    }
  };

  const handleToggleAccount = async () => {
    try {
      await staffService.toggleAccountStatus(staff.id);
      showToast(
        staff.accountStatus === 'Active'
          ? 'Account deactivated.'
          : 'Account activated.',
      );
      await refreshAll();
    } catch (requestError) {
      showToast(requestError?.message || 'Unable to change account status.');
    }
  };

  const handleEdit = async (payload) => {
    await staffService.updateStaff(staff.id, payload);
    showToast('Staff profile updated.');
    await refreshAll();
  };

  const handleAddDocument = async (payload) => {
    await staffManagementService.createDocument(staff.id, payload);
    showToast('Document added.');
    await refreshAll();
  };

  if (loading) {
    return <div className="staff-workshop-empty">Loading staff profile…</div>;
  }

  if (error || !staff) {
    return (
      <div className="staff-workshop-empty">
        {error || 'Staff profile not found.'}
      </div>
    );
  }

  return (
    <div className="staff-profile staff360">
      {toastMsg && <div className="staff360-toast">{toastMsg}</div>}

      <div className="staff-profile-topbar">
        <button type="button" onClick={goBack} aria-label="Back to staff">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h2>Staff Profile</h2>
          <p>Attendance, assignments, performance, payroll, documents and activity.</p>
        </div>
      </div>

      <section className="staff-profile-hero staff360-hero">
        <div className="staff360-person">
          <StaffAvatar staff={staff} size="lg" />
          <div>
            <div className="staff360-name-row">
              <h3>{staff.name}</h3>
              <span className={'staff360-status is-' + String(staff.employmentStatus || '').toLowerCase().replaceAll(' ', '-')}>
                {staff.employmentStatus}
              </span>
            </div>
            <p>
              {getEmployeeLabel(staff)} · {displayText(staff.designation, 'Staff')} · {displayText(staff.department, 'Unassigned Team')}
            </p>
            <div className="staff360-contact-line">
              <span><Phone size={12}/>{staff.phone || 'No phone'}</span>
              <span><Mail size={12}/>{staff.email || 'No email'}</span>
            </div>
          </div>
        </div>

        {(canEdit || canManagePayroll) && (
          <div className="staff360-hero-actions">
            {canManagePayroll && (
              <button type="button" className="staff360-secondary-button" onClick={() => navigate(`/staff/${staff.id}/wages`)}>
                <WalletCards size={14}/>
                Daily Wage Account
              </button>
            )}
            {canEdit && (
              <>
                <button type="button" className="staff360-secondary-button" onClick={() => setEditOpen(true)}>
                  <Pencil size={14}/>
                  Edit Profile
                </button>
                <button type="button" onClick={handleSendInvite} className="staff360-secondary-button">
                  <Send size={14}/>
                  Send Login Invite
                </button>
                <button type="button" onClick={handleToggleAccount} className="staff360-secondary-button">
                  {staff.accountStatus === 'Active' ? <Lock size={14}/> : <Unlock size={14}/>}
                  {staff.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <nav className="staff-profile-tabs staff360-tabs" aria-label="Staff profile sections">
        <div className="scroll-hidden">
          {TABS.map(([tab, Icon]) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              <Icon size={12} />
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <section className="staff-profile-panel staff360-panel">
        {activeTab === 'Overview' && (
          <div className="staff360-overview">
            <div className="staff360-overview-commandbar">
              <div>
                <strong>Profile Overview</strong>
                <span>Use Edit Profile to change role, team, shift, skills or employment details.</span>
              </div>
              {canEdit && (
                <button type="button" onClick={() => setEditOpen(true)}>
                  <Pencil size={13}/>
                  Edit / Change
                </button>
              )}
            </div>

            <div className="staff360-section">
              <div className="staff360-section__title"><User size={15}/> Personal & Employment</div>
              <div className="staff360-info-grid">
                <InfoItem label="Employee Number" value={getEmployeeLabel(staff)} icon={ShieldCheck} />
                <InfoItem label="Full Name" value={staff.name} icon={User} />
                <InfoItem label="Phone" value={staff.phone} icon={Phone} />
                <InfoItem label="Email" value={staff.email} icon={Mail} />
                <InfoItem label="Address" value={staff.address} icon={MapPin} />
                <InfoItem label="Emergency Contact" value={staff.emergencyContact} icon={Phone} />
                <InfoItem label="Joining Date" value={staff.joiningDate} icon={CalendarDays} />
                <InfoItem label="Status" value={staff.employmentStatus} icon={ShieldCheck} />
              </div>
            </div>

            <div className="staff360-section">
              <div className="staff360-section__title"><Building2 size={15}/> Workshop Assignment</div>
              <div className="staff360-info-grid">
                <InfoItem label="Role" value={staff.role} icon={ShieldCheck} />
                <InfoItem label="Team / Department" value={staff.department} icon={Building2} />
                <InfoItem label="Branch" value={staff.branch?.name || staff.branch} icon={Building2} />
                <InfoItem label="Shift" value={staff.shift} icon={Clock3} />
                <InfoItem label="Login Status" value={staff.loginStatus} icon={ShieldCheck} />
              </div>
            </div>

            <div className="staff360-section">
              <div className="staff360-section__title"><Wrench size={15}/> Skills & Specialization</div>
              <div className="staff-chip-row">
                {staff.skills?.length
                  ? staff.skills.map((skill, index) => {
                      const label = displayText(skill, 'Skill');
                      return <span key={String(skill?.id || skill?.name || label || index)}>{label}</span>;
                    })
                  : <span className="is-muted">No skills assigned</span>}
              </div>
            </div>

            <div className="staff360-quick-grid">
              {[
                ['Attendance', 'Attendance', CalendarDays],
                ['Assigned Work', 'Assigned Work', BriefcaseBusiness],
                ['Payroll', 'Payroll', WalletCards],
                ['Documents', 'Documents', FileText],
              ].map(([label, tab, Icon]) => (
                <button type="button" key={label} onClick={() => setActiveTab(tab)}>
                  <Icon size={14}/>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="staff360-tab-stack">
            {canManageAttendance ? (
              <>
                <div className="staff360-metric-grid is-six">
                  <div><span>Present</span><strong>{attendanceSummary.present}</strong></div>
                  <div><span>Absent</span><strong>{attendanceSummary.absent}</strong></div>
                  <div><span>Leave</span><strong>{attendanceSummary.leave}</strong></div>
                  <div><span>Weekly Off</span><strong>{attendanceSummary.weeklyOff}</strong></div>
                  <div><span>Holiday</span><strong>{attendanceSummary.holidays}</strong></div>
                  <div><span>Shift</span><strong>{displayText(staff.shift)}</strong></div>
                </div>

                <StaffAttendanceCalendar
                  monthValue={attendanceMonth}
                  onMonthChange={setAttendanceMonth}
                  calendar={attendanceCalendar}
                  employee={attendanceEmployee}
                  onDayOpen={(date) =>
                    navigate(
                      `/attendance-manager/team-review/${encodeURIComponent(staff.employeeId || staff.id)}/${date}`,
                    )
                  }
                />
              </>
            ) : (
              <div className="staff-workshop-empty">
                Attendance calendar is available to attendance managers.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Assigned Work' && (
          <div className="staff360-tab-stack">
            <div className="staff360-work-summary">
              <div><span>Total Assigned</span><strong>{jobs.length}</strong></div>
              <div><span>In Progress</span><strong>{jobs.filter((job) => job.status === 'In Progress').length}</strong></div>
              <div><span>Waiting Parts</span><strong>{jobs.filter((job) => job.status === 'Waiting for Parts' || job.status === 'Waiting Parts').length}</strong></div>
              <div><span>Completed</span><strong>{jobs.filter((job) => job.status === 'Delivered' || job.status === 'Completed').length}</strong></div>
            </div>

            <div className="staff360-job-list">
              {jobs.map((job) => (
                <article key={job.id} className="staff360-job-card">
                  <div>
                    <span>{job.jobNumber || job.id}</span>
                    <strong>{displayText(job.vehicle || job.vehicleReg || job.vehicleInfo, 'Vehicle')}</strong>
                    <p>{displayText(job.work || job.notes, 'Assigned workshop work')}</p>
                  </div>

                  <div className="staff360-job-side">
                    <b>{displayText(job.status, 'Assigned')}</b>
                    <span>
                      {job.bookedHours
                        ? `${job.bookedHours}h assigned`
                        : money(job.labourTotal || job.labour_total || 0) + ' labour'}
                    </span>
                  </div>

                  {Number(job.progress) >= 0 && job.progress !== undefined && (
                    <div className="staff-progress">
                      <i style={{ width: `${Math.min(100, Number(job.progress || 0))}%` }} />
                    </div>
                  )}

                  <div className="staff360-job-feedback">
                    <span>Customer Feedback</span>
                    <strong>
                      {Number(job.customerRating || job.customer_rating || 0) > 0
                        ? `${job.customerRating || job.customer_rating}/5`
                        : 'No feedback'}
                    </strong>
                    {(job.customerFeedback || job.customer_feedback) && (
                      <p>{displayText(job.customerFeedback || job.customer_feedback, '')}</p>
                    )}
                  </div>

                  {!USE_MOCK_API && (
                    <button type="button" onClick={() => navigate(`/jobs/${job.id}/overview`)}>
                      Open Job
                    </button>
                  )}
                </article>
              ))}

              {!jobs.length && (
                <div className="staff-workshop-empty">
                  No jobs are currently linked to this staff member.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="staff360-tab-stack">
            <div className="staff360-metric-grid">
              <div><span>Jobs Completed</span><strong>{performance.jobsCompleted}</strong></div>
              <div><span>Labour Revenue</span><strong>{money(performance.labourRevenue)}</strong></div>
              <div><span>Avg Labour / Job</span><strong>{money(performance.averageLabourValue || (performance.jobsCompleted ? performance.labourRevenue / performance.jobsCompleted : 0))}</strong></div>
              <div><span>Productive Hours</span><strong>{Number(performance.productiveHours || 0).toFixed(1)}h</strong></div>
              <div><span>Comeback Jobs</span><strong>{performance.comebackJobs}</strong></div>
              <div>
                <span>Customer Feedback</span>
                <strong>
                  {performance.customerRating
                    ? Number(performance.customerRating).toFixed(1)
                    : '—'} <Star size={12}/>
                </strong>
              </div>
            </div>

            <div className="staff360-note-card">
              <Gauge size={16}/>
              <div>
                <strong>Performance is work-linked</strong>
                <span>Completed jobs, labour value, comeback jobs and available customer ratings are used here.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Payroll' && (
          <div className="staff360-tab-stack">
            {canViewPayroll || isOwnProfile ? (
              <div className="staff360-pay-config-command">
                <div>
                  <WalletCards size={17}/>
                  <div>
                    <strong>Daily Wage Account</strong>
                    <span>Approved attendance, extra earnings, running balance and payment history.</span>
                  </div>
                </div>
                <button type="button" onClick={() => navigate(`/staff/${staff.id}/wages`)}>
                  <WalletCards size={14}/> Open Wage Account
                </button>
              </div>
            ) : (
              <div className="staff-workshop-empty">Payroll access is not assigned to your role.</div>
            )}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="staff360-tab-stack">
            <div className="staff360-document-head">
              <div>
                <strong>Employment Documents</strong>
                <span>ID proof, licences, certificates, offer letters and contracts.</span>
              </div>
              <div className="staff360-document-actions">
                <span className={documents.length ? 'is-complete' : 'is-missing'}>
                  {documents.length ? `${documents.length} files` : 'No files'}
                </span>
                {canEdit && (
                  <button type="button" onClick={() => setDocumentOpen(true)}>
                    <FilePlus2 size={13}/>
                    Add Document
                  </button>
                )}
              </div>
            </div>

            {documents.length ? (
              <div className="staff360-document-list">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl || undefined}
                    target={doc.fileUrl ? '_blank' : undefined}
                    rel="noreferrer"
                    onClick={(event) => {
                      if (!doc.fileUrl) event.preventDefault();
                    }}
                  >
                    <FileText size={15}/>
                    <div>
                      <strong>{doc.name}</strong>
                      <span>
                        {doc.type} · {doc.uploadedDate}
                        {doc.expiryDate ? ` · Expires ${doc.expiryDate}` : ''}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="staff-workshop-empty">
                No staff documents added yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Activity History' && (
          <div className="staff360-activity-list">
            {activities.length ? (
              activities.map((item) => (
                <div key={item.id}>
                  <span className="staff360-activity-icon"><Activity size={14}/></span>
                  <div>
                    <strong>{displayText(item.action, 'Activity')}</strong>
                    {item.details && <p>{displayText(item.details, '')}</p>}
                    <small>
                      {item.actor || 'System'}
                      {item.timestamp
                        ? ` · ${new Date(item.timestamp).toLocaleString('en-IN')}`
                        : ''}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="staff-workshop-empty">No activity history available.</div>
            )}
          </div>
        )}
      </section>

      {canEdit && (
        <>
          <StaffProfileEditSheet
            open={editOpen}
            onClose={() => setEditOpen(false)}
            staff={staff}
            roles={roles}
            teams={teams}
            shifts={shifts}
            skills={skills}
            onSave={handleEdit}
          />

          <StaffDocumentAddSheet
            open={documentOpen}
            onClose={() => setDocumentOpen(false)}
            onSave={handleAddDocument}
          />
        </>
      )}
    </div>
  );
};
