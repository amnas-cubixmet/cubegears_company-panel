import React, { useEffect, useState } from 'react';
import { ArrowLeft, HardHat, Plus } from 'lucide-react';
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
        <div className="outside-labour-page-actions duty-controls">
          <button type="button" className="dashboard-button outside-labour-back" onClick={() => navigate('/jobs')}><ArrowLeft size={16}/> Job Cards</button>
          {hasPermission(user, 'jobs.create') && (
            <button type="button" className="dashboard-button is-primary" onClick={() => navigate('/jobs/new')}><Plus size={16}/> New Job Card</button>
          )}
        </div>
      </header>
      {error && <p className="outside-labour-error" role="alert">{error}</p>}
      <OutsideLabourPanel jobId={validJob || undefined} jobs={jobs} />
    </main>
  );
};
