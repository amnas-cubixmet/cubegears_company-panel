import React from 'react';
import { Car, ChevronRight, User, Wrench } from 'lucide-react';
import { jobDisplayLabel, statusClass } from './jobs.utils';

export const JobRecordsPanel = ({
  jobs,
  loading,
  status,
  searchTerm = '',
  onOpenJob,
}) => (
  <section className="jobs-records-panel">
    <header className="jobs-records-head">
      <div>
        <span>Job Records</span>
        <h2>{status === 'All' ? 'All Job Cards' : status}</h2>
      </div>
      <strong aria-live="polite">{jobs.length} record{jobs.length === 1 ? '' : 's'}</strong>
    </header>

    {loading ? (
      <div className="jobs-state">Loading job cards…</div>
    ) : jobs.length === 0 ? (
      <div className="jobs-state is-empty">
        {searchTerm || status !== 'All' ? 'No jobs match these filters. Clear search or change the status.' : 'No Job Cards yet. Create your first Job Card to begin.'}
      </div>
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
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <button className="jobs-table-job-link" type="button" onClick={() => onOpenJob(job.id)}>{jobDisplayLabel(job)}</button>
                    <span>{job.serviceType || job.createdDate || 'Workshop service'}</span>
                  </td>
                  <td>
                    <strong>{job.vehicleReg || 'No registration'}</strong>
                    <span>{job.vehicleInfo || 'Vehicle'}</span>
                  </td>
                  <td>
                    <strong>{job.customerName || 'Walk-in customer'}</strong>
                    <span>{job.customerPhone || '—'}</span>
                  </td>
                  <td><strong>{job.assignedEmployeeName || 'Unassigned'}</strong></td>
                  <td>
                    <span className={`jobs-status-chip is-${statusClass(job.status)}`}>
                      {job.status || 'New'}
                    </span>
                  </td>
                  <td><strong>{job.createdDate || '—'}</strong></td>
                  <td><button type="button" className="jobs-table-open" onClick={() => onOpenJob(job.id)} aria-label={`Open ${jobDisplayLabel(job)}`}><ChevronRight size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="jobs-mobile-list">
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className="jobs-mobile-card"
              onClick={() => onOpenJob(job.id)}
            >
              <div className="jobs-mobile-card-head">
                <div>
                  <strong>{jobDisplayLabel(job)}</strong>
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
);
