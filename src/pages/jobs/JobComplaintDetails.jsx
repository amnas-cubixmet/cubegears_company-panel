import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CarFront, CheckCircle2, FileText, UserRound } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { JobBreadcrumbs } from '../../components/jobs/JobBreadcrumbs';
import { jobDisplayLabel } from '../../components/jobs/jobs.utils';

const textValue = (value, fallback = 'Not added') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const complaintList = (job) => {
  const data = job?.complaints || job?.customerComplaints;
  return Array.isArray(data) ? data : [];
};

const findComplaint = (complaints, complaintId) => {
  // Current entries have a real id. Older records can have no id; for those,
  // the detail link uses a deterministic position token.
  const match = complaints.findIndex((entry) => entry?.id != null && String(entry.id) === complaintId);
  if (match >= 0) return { entry: complaints[match], index: match };
  const missingId = /^row-(\d+)$/.exec(complaintId || '');
  if (!missingId) return null;
  const index = Number(missingId[1]);
  const entry = complaints[index];
  return entry && entry.id == null ? { entry, index } : null;
};

export function JobComplaintDetails() {
  const { id: jobId, complaintId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const backToComplaints = `/jobs/${encodeURIComponent(jobId)}/complaints${location.search}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    jobService.getJobById(jobId)
      .then((data) => { if (active) setJob(data); })
      .catch((err) => {
        if (active) {
          setJob(null);
          setError(err?.response?.data?.detail || err?.message || 'Could not load complaint details.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId]);

  const complaints = useMemo(() => complaintList(job), [job]);
  const found = useMemo(() => findComplaint(complaints, complaintId), [complaints, complaintId]);
  const complaint = found?.entry;
  const status = complaint?.status || 'Open';
  const description = textValue(complaint?.description || complaint?.wording, 'No description recorded');

  const changeStatus = async (nextStatus) => {
    if (!job || !found || saving || nextStatus === status) return;
    setSaving(true);
    setError('');
    try {
      const nextComplaints = complaints.map((entry, index) =>
        index === found.index ? { ...entry, status: nextStatus } : entry
      );
      const saved = await jobService.updateJob(job.id, { complaints: nextComplaints });
      // Re-read instead of trusting a partial PATCH response.
      const updated = await jobService.getJobById(jobId);
      setJob(updated || saved || { ...job, complaints: nextComplaints });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Could not update complaint status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="job-complaint-detail-page">
      <JobBreadcrumbs current="Complaint Details" jobLabel={job ? jobDisplayLabel(job) : undefined} jobId={jobId} />
      <header className="job-complaint-detail-header">
        <div className="job-complaint-detail-title">
          <span className="job-complaint-detail-icon"><FileText size={20} aria-hidden="true"/></span>
          <div>
            <h1>Complaint Details</h1>
            <p>Customer concern recorded against this Job Card.</p>
          </div>
        </div>
        <button type="button" className="job-complaint-detail-back" onClick={() => navigate(backToComplaints)}>
          <ArrowLeft size={16} aria-hidden="true"/> Back to Complaints
        </button>
      </header>

      {loading ? (
        <section className="job-complaint-detail-message" role="status">Loading complaint details…</section>
      ) : !job ? (
        <section className="job-complaint-detail-message" role="alert">
          {error || 'Job Card could not be found.'}
        </section>
      ) : !found ? (
        <section className="job-complaint-detail-message" role="status">
          <strong>Complaint not found.</strong>
          <p>This record may have been changed or removed. Return to Complaints to see the current list.</p>
        </section>
      ) : (
        <>
          {error && <p className="job-complaint-detail-error" role="alert">{error}</p>}
          <section className="job-complaint-detail-card">
            <div className="job-complaint-detail-section-heading">
              <div>
                <h2>Customer Complaint</h2>
                <p>What the customer reported about this vehicle.</p>
              </div>
              <span className="job-complaint-detail-status">
                <CheckCircle2 size={15} aria-hidden="true"/> {status}
              </span>
            </div>
            <p className="job-complaint-detail-description">{description}</p>

            <div className="job-complaint-detail-fields">
              <div>
                <span>Related Work / Service</span>
                <strong>{textValue(complaint.relatedService, 'Not linked')}</strong>
              </div>
              <div>
                <span>Complaint Reference</span>
                <strong>{textValue(complaint.id, `Record ${found.index + 1}`)}</strong>
              </div>
              <div>
                <span><CalendarClock size={14} aria-hidden="true"/> Recorded</span>
                <strong>{complaint.createdAt || complaint.created_at
                  ? new Date(complaint.createdAt || complaint.created_at).toLocaleString('en-IN')
                  : 'Not recorded'}</strong>
              </div>
              <div>
                <span>Update Status</span>
                <select
                  aria-label="Update complaint status"
                  value={status}
                  disabled={saving}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  {!['Open', 'In Progress', 'Completed'].includes(status) && (
                    <option value={status}>{status}</option>
                  )}
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <small>{saving ? 'Saving status…' : 'Changes save directly to this Job Card.'}</small>
              </div>
            </div>
          </section>

          <section className="job-complaint-detail-card">
            <div className="job-complaint-detail-section-heading">
              <div>
                <h2>Customer & Vehicle</h2>
                <p>Details linked to the complaint's Job Card.</p>
              </div>
            </div>
            <div className="job-complaint-detail-fields">
              <div><span><UserRound size={14} aria-hidden="true"/> Customer</span><strong>{textValue(job.customerName)}</strong></div>
              <div><span>Phone</span><strong>{textValue(job.customerPhone)}</strong></div>
              <div><span><CarFront size={14} aria-hidden="true"/> Registration</span><strong>{textValue(job.vehicleReg)}</strong></div>
              <div><span>Make / Model</span><strong>{textValue(job.vehicleInfo)}</strong></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default JobComplaintDetails;
