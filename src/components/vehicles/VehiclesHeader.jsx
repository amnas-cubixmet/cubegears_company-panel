import React from 'react';
import { CarFront, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const VehiclesHeader = ({ onAddVehicle }) => {
  const { user } = useAuth();

  return (
    <header className="vehicle-dashboard-header">
      <div>
        <h1>Vehicles</h1>
        <p>Customer vehicles, active jobs, service schedules and insurance reminders.</p>
      </div>

      <div className="vehicle-dashboard-header-actions">
        <div className="vehicle-dashboard-header-badge">
          <CarFront size={13} />
          <span>Workshop Fleet</span>
        </div>

        {hasPermission(user, 'vehicles.create') && (
          <button type="button" className="vehicle-primary-button" onClick={onAddVehicle}>
            <Plus size={14} />
            Add Vehicle
          </button>
        )}
      </div>
    </header>
  );
};
