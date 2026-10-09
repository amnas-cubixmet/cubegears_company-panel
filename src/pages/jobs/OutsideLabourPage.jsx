import React, { useEffect, useState } from 'react';
import { HardHat, Plus, RefreshCcw, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OutsideLabourPanel } from '../../components/jobs/OutsideLabourPanel';
import { JobBreadcrumbs } from '../../components/jobs/JobBreadcrumbs';
import { jobService } from '../../services/job.service';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

export const OutsideLabourPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const canView = hasPermission(user, 'expenses.view');
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const selectedJob = params.get('job') || '';

  useEffect(() => {
    if (!canView) return;
    let active = true;
    jobService.getJobs()
      .then((data) => { if (active) setJobs(Array.isArray(data) ? data : data?.results || []); })
      .catch((err) => { if (active) setError(err?.message || 'Could not load Job Cards.'); });
    return () => { active = false; };
  }, [canView]);

  const validJob = selectedJob && jobs.some((job) => job.id === selectedJob) ? selectedJob : '';

  return (
    <main className="dashboard-page job-management-page outside-labour-page">
      <JobBreadcrumbs current="Outside Labour" />
      <header className="dashboard-heading outside-labour-page-head">
        <div className="dashboard-heading-copy outside-labour-page-title">
          <span className="outside-labour-page-icon" aria-hidden="true"><HardHat size={22}/></span>
          <div>
            <h1>Outside Labour</h1>
            <p>Record outside painters, mechanics and part-work charges without creating staff profiles.</p>
          </div>
        </div>
        <div className="outside-labour-page-actions outside-labour-action-wrapper" role="group" aria-label="Outside Labour actions">
          {hasPermission(user, 'jobs.create') && (
            <button type="button" className="dashboard-button is-primary outside-labour-new-job" onClick={() => navigate('/jobs/new')}>
              <Plus size={16} aria-hidden="true"/> New Job Card
            </button>
          )}
          {canView && (
            <button type="button" className="dashboard-button outside-labour-page-refresh" onClick={() => setRefreshVersion((value) => value + 1)}>
              <RefreshCcw size={16} aria-hidden="true"/> Refresh
            </button>
          )}
          {canView && hasPermission(user, 'expenses.create') && (
            <button
              type="button"
              className="dashboard-button is-primary outside-labour-page-form-toggle"
              aria-expanded={formOpen}
              onClick={() => setFormOpen((value) => !value)}
            >
              {formOpen ? <X size={16} aria-hidden="true"/> : <Plus size={16} aria-hidden="true"/>}
              {formOpen ? 'Close Form' : 'Add Outside Labour'}
            </button>
          )}
        </div>
      </header>
      {error && <p className="outside-labour-error" role="alert">{error}</p>}
      <OutsideLabourPanel
        jobId={validJob || undefined}
        jobs={jobs}
        formOpen={formOpen}
        onFormOpenChange={setFormOpen}
        refreshVersion={refreshVersion}
        hideToolbar
      />
    </main>
  );
};
