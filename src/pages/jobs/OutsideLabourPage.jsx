import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
    <main className="job-management-page outside-labour-page">
      <JobBreadcrumbs current="Outside Labour" />
      <header className="outside-labour-page-head">
        <div>
          <h1>Outside Labour</h1>
          <p>Manual freelance and part-work charges. Workers are not created as staff.</p>
        </div>
        <button type="button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={15}/> Dashboard
        </button>
      </header>
      {error && <p className="outside-labour-error" role="alert">{error}</p>}
      <OutsideLabourPanel jobId={validJob || undefined} jobs={jobs} />
    </main>
  );
};
