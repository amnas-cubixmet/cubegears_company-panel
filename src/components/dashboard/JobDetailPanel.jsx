import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { dashboardText, repairStages, statusClass } from './dashboard.utils';

export const JobDetailPanel = ({ selectedBooking, jobProgress, advisorName, onViewJob }) => (
  <div className="job-detail-pane">
    {selectedBooking ? (
      <div className="job-detail">
        <div className="job-detail-head">
          <div>
            <div className="job-id-row">
              <strong>{dashboardText(selectedBooking.id)}</strong>
              <span className={`status-pill ${statusClass(dashboardText(selectedBooking.status, 'Pending'))}`}>{dashboardText(selectedBooking.status, 'Pending')}</span>
            </div>
            <span>{dashboardText(selectedBooking.vehicle)}</span>
          </div>
          <button type="button" className="text-link" onClick={onViewJob}>View Job</button>
        </div>

        <div className="job-meta-grid">
          <div><small>Customer</small><strong>{dashboardText(selectedBooking.customer)}</strong></div>
          <div><small>Booking Time</small><strong>{dashboardText(selectedBooking.time)}</strong></div>
          <div><small>Advisor</small><strong>{advisorName || 'Workshop Advisor'}</strong></div>
          <div className="job-meta-wide"><small>Service Request</small><strong>{dashboardText(selectedBooking.service, 'Service not specified')}</strong></div>
        </div>

        <div className="repair-details">
          <h3>Repair Details</h3>
          <div className="repair-detail-grid">
            <div><span>Job Status</span><strong>{dashboardText(selectedBooking.status, 'Pending')}</strong></div>
            <div><span>Assigned Team</span><strong>Workshop A</strong></div>
          </div>
        </div>

        <div className="progress-card">
          <div className="progress-title-row">
            <strong>Progress</strong>
            <span>Live workshop stages</span>
          </div>
          <div className="progress-grid">
            {repairStages.map((stage, index) => (
              <div key={stage.key} className="progress-stage">
                <span className={`progress-circle ${index < 3 ? 'is-done' : ''}`}>
                  {index < 3 ? <CheckCircle2 size={12} /> : index + 1}
                </span>
                <small>{stage.label}</small>
                <strong>{jobProgress?.[stage.key] ?? 0}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="empty-job">No booking selected</div>
    )}
  </div>
);
