import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/** Dashboard-style navigation without leaking internal Job Card UUIDs. */
export const JobBreadcrumbs = ({ current = 'Job Cards', jobLabel, jobId }) => {
  const steps = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Job Cards', href: current === 'Job Cards' ? null : '/jobs' },
  ];
  if (jobLabel && jobId) {
    steps.push({ label: jobLabel, href: current === 'Overview' ? null : `/jobs/${jobId}` });
  }
  if (current !== 'Job Cards' && (current !== 'Overview' || !jobLabel)) {
    steps.push({ label: current, href: null });
  } else if (current === 'Overview' && jobLabel) {
    steps.push({ label: current, href: null });
    steps[steps.length - 2].href = `/jobs/${jobId}`;
  }
  return (
    <nav className="job-page-breadcrumb" aria-label="Breadcrumb">
      {steps.map((step, index) => (
        <React.Fragment key={`${index}-${step.label}`}>
          {index > 0 && <ChevronRight size={13} aria-hidden="true" className="job-page-breadcrumb-chevron" />}
          {step.href ? (
            <Link to={step.href} className="job-page-breadcrumb-link">
              {step.icon && <step.icon size={13} aria-hidden="true" />}
              <span>{step.label}</span>
            </Link>
          ) : (
            <span className="job-page-breadcrumb-current" aria-current="page">{step.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
