import React, { useState } from 'react';
import { HardHat, History, MoreHorizontal, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const JobsHeader = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  return (
    <header className="jobs-dashboard-header">
      <div>
        <h1>Job Cards</h1>
        <p>Track every vehicle from check-in to repair, quality control, billing and delivery.</p>
      </div>

      <div className="jobs-dashboard-actions">
        {(hasPermission(user, 'reports.view') || hasPermission(user, 'expenses.view')) && (
          <button type="button" className="jobs-secondary-button" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)}>
            <MoreHorizontal size={16} aria-hidden="true" />
            <span>{showMore ? 'Less' : 'More'}</span>
          </button>
        )}
        {showMore && hasPermission(user, 'reports.view') && (
          <button
            type="button"
            className="jobs-secondary-button"
            onClick={() => onNavigate('/jobs/reports')}
          >
            <History size={14} />
            <span>Reports</span>
          </button>
        )}

        {showMore && hasPermission(user, 'expenses.view') && (
          <button
            type="button"
            className="jobs-secondary-button jobs-outside-labour-button"
            onClick={() => onNavigate('/jobs/outside-labour')}
          >
            <HardHat size={16} aria-hidden="true" />
            <span>Outside Labour</span>
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
