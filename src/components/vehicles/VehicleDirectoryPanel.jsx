import React from 'react';
import {
  Car,
  ChevronRight,
  ClipboardList,
  Edit3,
  User,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { getVehicleStatus } from './vehicles.utils';

export const VehicleDirectoryPanel = ({
  vehicles,
  onNavigate,
}) => {
  const { user } = useAuth();
  const canEdit = hasPermission(user, 'vehicles.edit');
  const canCreateJob = hasPermission(user, 'jobs.create');

  return (
    <section className="vehicle-dashboard-directory">
      <header className="vehicle-dashboard-section-title">
        <div>
          <h2>Vehicle Directory</h2>
          <p>Open profiles, review active jobs or create a new Job Card.</p>
        </div>
        <span>{vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'}</span>
      </header>

      <div className="vehicle-table-wrap">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>Service</th>
              <th>Open Job</th>
              <th>Status</th>
              <th aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const status = getVehicleStatus(vehicle);
              const lastService =
                vehicle.latestJob?.createdDate ||
                vehicle.lastServiceDate ||
                '—';

              return (
                <tr
                  key={vehicle.id}
                  onClick={() => onNavigate(`/vehicles/${vehicle.id}`)}
                >
                  <td>
                    <strong>{vehicle.registration || 'No Registration'}</strong>
                    <span>
                      {vehicle.make} {vehicle.model}
                      {vehicle.variant ? ` · ${vehicle.variant}` : ''}
                    </span>
                  </td>
                  <td>
                    <strong>{vehicle.customerName}</strong>
                    <span>{vehicle.customerPhone || vehicle.customerId || 'No contact'}</span>
                  </td>
                  <td>
                    <strong>{lastService}</strong>
                    <span>Next: {vehicle.nextServiceDue || 'Not set'}</span>
                  </td>
                  <td>
                    {vehicle.openJob ? (
                      <button
                        type="button"
                        className="vehicle-table-job"
                        onClick={(event) => {
                          event.stopPropagation();
                          onNavigate(`/jobs/${vehicle.openJob.id}/overview`);
                        }}
                      >
                        <Wrench size={12} />
                        <span>{vehicle.openJob.jobNumber || vehicle.openJob.id}</span>
                      </button>
                    ) : (
                      <span className="vehicle-table-empty">No active job</span>
                    )}
                  </td>
                  <td>
                    <span className={`vehicle-status is-${status.tone}`}>
                      {status.label}
                    </span>
                  </td>
                  <td><ChevronRight size={15} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="vehicle-mobile-grid">
        {vehicles.map((vehicle) => {
          const status = getVehicleStatus(vehicle);
          const lastService =
            vehicle.latestJob?.createdDate ||
            vehicle.lastServiceDate ||
            '—';
          const odometer =
            vehicle.latestJob?.kilometre ||
            vehicle.odometer ||
            '—';

          return (
            <article key={vehicle.id} className="vehicle-mobile-card">
              <div className="vehicle-mobile-card-head">
                <div>
                  <strong>{vehicle.registration || 'No Registration'}</strong>
                  <span>{vehicle.make} {vehicle.model}</span>
                </div>
                <span className={`vehicle-status is-${status.tone}`}>
                  {status.label}
                </span>
              </div>

              <div className="vehicle-owner-row">
                <User size={14} />
                <div>
                  <strong>{vehicle.customerName}</strong>
                  <span>{vehicle.customerPhone || vehicle.customerId || 'No owner contact'}</span>
                </div>
              </div>

              <div className="vehicle-mobile-meta">
                <div><span>Odometer</span><strong>{odometer}</strong></div>
                <div><span>Last Service</span><strong>{lastService}</strong></div>
                <div><span>Next Service</span><strong>{vehicle.nextServiceDue || 'Not set'}</strong></div>
                <div><span>Insurance</span><strong>{vehicle.insuranceExpiry || 'Not set'}</strong></div>
              </div>

              {vehicle.openJob && (
                <button
                  type="button"
                  className="vehicle-open-job"
                  onClick={() => onNavigate(`/jobs/${vehicle.openJob.id}/overview`)}
                >
                  <ClipboardList size={13} />
                  <span>{vehicle.openJob.jobNumber || vehicle.openJob.id}</span>
                  <b>{vehicle.openJob.status}</b>
                  <ChevronRight size={13} />
                </button>
              )}

              <div className="vehicle-card-actions">
                <button type="button" onClick={() => onNavigate(`/vehicles/${vehicle.id}`)}>
                  <Car size={13} /> View
                </button>

                {canEdit && (
                  <button type="button" onClick={() => onNavigate(`/vehicles/${vehicle.id}/edit`)}>
                    <Edit3 size={13} /> Edit
                  </button>
                )}

                {canCreateJob && (
                  <button
                    type="button"
                    className="is-primary"
                    onClick={() => onNavigate(
                      `/jobs/new?customerId=${vehicle.customerId || ''}&vehicle=${encodeURIComponent(vehicle.registration || '')}`
                    )}
                  >
                    <ClipboardList size={13} /> New Job
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!vehicles.length && (
        <div className="vehicle-dashboard-empty">No vehicles matched your search.</div>
      )}
    </section>
  );
};
