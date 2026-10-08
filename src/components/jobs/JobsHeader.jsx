import React from 'react';
import { History, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const JobsHeader = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <header className="jobs-dashboard-header">
      <div>
        <h1>Job Cards</h1>
        <p>Track every vehicle from check-in to repair, quality control, billing and delivery.</p>
      </div>

      <div className="jobs-dashboard-actions">
        {hasPermission(user, 'reports.view') && (
          <button
            type="button"
            className="jobs-secondary-button"
            onClick={() => onNavigate('/jobs/reports')}
          >
            <History size={14} />
            <span>Reports</span>
          </button>
        )}

        {hasPermission(user, 'jobs.create') && (
          <button
            type="button"
            className="jobs-primary-button"
            onClick={() => onNavigate('/jobs/new')}
          >
            <Plus size={14} />
            <span>New Job Card</span>
          </button>
        )}
      </div>
    </header>
  );
};
