import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  JobRecordsPanel,
  JobsHeader,
  JobsStats,
  JobsToolbar,
  VehicleLookupPanel,
} from '../../components/jobs';
import { normalizeRegistration } from '../../components/jobs/jobs.utils';
import { JobBreadcrumbs } from '../../components/jobs/JobBreadcrumbs';
import { jobService } from '../../services/job.service';
import '../../styles/jobs-dashboard.css';

export const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await jobService.getJobs();
        if (active) setJobs(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        if (active) setLoadError(err?.message || 'Could not load Job Cards. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJobs();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredJobs = useMemo(() => {
    const search = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesStatus = status === 'All' || (status === 'Active' ? !['Delivered', 'Cancelled'].includes(job.status) : job.status === status);
      const matchesSearch =
        !search ||
        [
          job.jobNumber,
          job.id,
          job.customerName,
          job.customerPhone,
          job.vehicleReg,
          job.vehicleInfo,
          job.assignedEmployeeName,
        ].some((value) =>
          String(value || '').toLowerCase().includes(search),
        );

      return matchesStatus && matchesSearch;
    });
  }, [jobs, query, status]);

  const vehicleLookup = useMemo(() => {
    const registrationQuery = normalizeRegistration(query);
    if (registrationQuery.length < 5) return null;

    const candidates = jobs.filter((job) => {
      const registration = normalizeRegistration(job.vehicleReg);
      return (
        registration.includes(registrationQuery) ||
        registrationQuery.includes(registration)
      );
    });

    if (!candidates.length) return null;

    const registration = candidates[0].vehicleReg;
    const sameVehicle = jobs
      .filter(
        (job) =>
          normalizeRegistration(job.vehicleReg) ===
          normalizeRegistration(registration),
      )
      .sort((a, b) =>
        String(b.createdDate || '').localeCompare(String(a.createdDate || '')),
      );

    const currentOpen = sameVehicle.find(
      (job) => !['Delivered', 'Cancelled'].includes(job.status),
    );
    const latest = sameVehicle[0];

    const lastParts = sameVehicle
      .flatMap((job) => job.partsUsed || [])
      .slice(0, 4)
      .map((item) => item.name || item.partName)
      .filter(Boolean);

    const spending = sameVehicle.reduce((sum, job) => {
      const total =
        job.billing?.invoiceTotal ||
        job.estimates?.at(-1)?.grandTotal ||
        0;
      return sum + Number(total || 0);
    }, 0);

    return {
      registration,
      latest,
      sameVehicle,
      currentOpen,
      lastParts,
      spending,
    };
  }, [jobs, query]);

  const counts = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter(
        (job) => !['Delivered', 'Cancelled'].includes(job.status),
      ).length,
      waiting: jobs.filter((job) => job.status === 'Waiting for Parts').length,
      ready: jobs.filter((job) => job.status === 'Ready for Delivery').length,
    }),
    [jobs],
  );

  const openJob = (id) => navigate(`/jobs/${id}`);

  return (
    <div className="jobs-dashboard">
      <JobBreadcrumbs />
      <JobsHeader onNavigate={navigate} />

      <JobsStats counts={counts} selectedStatus={status} onFilter={setStatus} />

      <JobsToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
      />

      <VehicleLookupPanel
        lookup={vehicleLookup}
        onOpenCurrentJob={() =>
          vehicleLookup?.currentOpen
            ? openJob(vehicleLookup.currentOpen.id)
            : null
        }
      />

      {loadError && (
        <div className="jobs-load-error" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>Retry</button>
        </div>
      )}
      <JobRecordsPanel
        jobs={filteredJobs}
        loading={loading}
        status={status}
        searchTerm={query}
        onOpenJob={openJob}
      />
    </div>
  );
};

export default JobList;
