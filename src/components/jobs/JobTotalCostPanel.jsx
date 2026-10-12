import { useEffect, useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { jobService } from '../../services/job.service';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2
}).format(Number(value) || 0);

export function JobTotalCostPanel({ jobId, refreshVersion = 0 }) {
  const { user } = useAuth();
  const permitted = ['jobs.view', 'payroll.view', 'expenses.view', 'stock.view']
    .every((code) => hasPermission(user, code));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId || !permitted) return;
    let active = true;
    setLoading(true);
    setError('');
    jobService.getJobCostSummary(jobId)
      .then((data) => { if (active) setSummary(data); })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.detail || err?.message || 'Unable to load job cost summary.');
        setSummary(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId, refreshVersion, permitted]);

  const [reload, setReload] = useState(0);
  // Reload is an explicit user action and does not mutate any financial data.
  useEffect(() => {
    if (!reload || !jobId || !permitted) return;
    let active = true;
    setLoading(true);
    setError('');
    jobService.getJobCostSummary(jobId)
      .then((data) => { if (active) setSummary(data); })
      .catch((err) => {
        if (active) setError(err?.response?.data?.detail || err?.message || 'Could not refresh costs.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  return (
    <section className="job-total-cost-panel" aria-label="Job Card total cost">
      <header className="job-total-cost-heading">
        <div>
          <h3><Calculator size={18} aria-hidden="true" /> Total Cost</h3>
          <p>Recorded direct costs for this Job Card, not customer charges or invoice totals.</p>
        </div>
        {permitted && (
          <button type="button" onClick={() => setReload((old) => old + 1)}
            disabled={loading} aria-label="Refresh job total costs" className="job-total-cost-refresh">
            <RefreshCw size={15} aria-hidden="true"/> Refresh
          </button>
        )}
      </header>

      {!permitted ? (
        <p className="job-total-cost-notice">
          Cost details require Jobs View, Payroll View, Expenses View and Stock View permissions.
        </p>
      ) : error && !summary ? (
        <p role="alert" className="job-total-cost-notice">{error}</p>
      ) : (
        <>
          <div className="job-total-cost-grid" aria-busy={loading}>
            {[
              { label: 'Mechanic Cost', value: summary?.mechanicCost, desc: 'Approved worker charges' },
              { label: 'Outside Staff Cost', value: summary?.outsideStaffCost, desc: 'Agreed worker charges' },
              { label: 'Parts Cost', value: summary?.partsCost, desc: 'Net issued stock at purchase cost' },
              { label: 'Total Cost', value: summary?.totalCost, desc: 'Direct recorded cost', primary: true }
            ].map(({ label, value, desc, primary }) => (
              <div key={label} className={primary ? 'job-total-cost-card is-primary' : 'job-total-cost-card'}>
                <span>{label}</span>
                <strong>{summary ? money(value) : loading ? 'Loading…' : '—'}</strong>
                <small>{desc}</small>
              </div>
            ))}
          </div>
          {!!summary && (
            <div className="job-total-cost-footnotes">
              {Number(summary.outsidePending || 0) > 0 && (
                <p>Outside Staff payment pending: <strong>{money(summary.outsidePending)}</strong> (already included in total).</p>
              )}
              {(summary.unallocatedDailyWages || summary.unapprovedMechanicWork) && (
                <p>Daily-wage mechanic cost may not be allocated to this Job Card; unapproved work is excluded. Total is not a full profit calculation.</p>
              )}
              {summary.partsAtCurrentCost && (
                <p>Some older stock issues have no saved cost rate; current stock purchase prices were used as estimates.</p>
              )}
              <p>{summary.note}</p>
              {error && <p role="alert">{error}</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}
