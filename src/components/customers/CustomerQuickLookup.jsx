import React from 'react';
import { ChevronRight, ClipboardList, Search, Wrench } from 'lucide-react';

export const CustomerQuickLookup = ({
  query,
  onQueryChange,
  result,
  formatMoney,
  onNavigate,
}) => (
  <section className="customer-dashboard-lookup">
    <header className="customer-dashboard-panel-title">
      <div>
        <h2>Vehicle & Customer Quick Lookup</h2>
        <p>Search registration, VIN, Job Card, phone or customer name.</p>
      </div>
      <Search size={15} />
    </header>

    <label className="customer-dashboard-search">
      <Search size={14} />
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="KL 10 AB 1234 / VIN / JOB-00251 / phone"
      />
    </label>

    {result?.notFound ? (
      <div className="customer-dashboard-empty">No customer, vehicle or job matched this search.</div>
    ) : result ? (
      <div className="customer-dashboard-lookup-result">
        <div className="customer-dashboard-lookup-person">
          <div>
            <strong>{result.record.customer.name}</strong>
            <span>{result.record.customer.customerType} · {result.record.customer.phone}</span>
          </div>
          <button type="button" onClick={() => onNavigate(`/customers/${result.record.customer.id}`)}>
            Open Profile <ChevronRight size={13} />
          </button>
        </div>

        <div className="customer-dashboard-lookup-grid">
          <div>
            <span>Vehicle</span>
            <strong>{result.vehicle?.regNo || result.latestJob?.vehicleReg || '—'}</strong>
            <small>{result.vehicle?.makeModel || result.latestJob?.vehicleInfo || 'Vehicle'}</small>
          </div>
          <div>
            <span>Last Service</span>
            <strong>{result.latestJob?.createdDate || result.vehicle?.lastService || '—'}</strong>
            <small>{result.latestJob?.kilometre || result.vehicle?.kilometres || 'KM not recorded'}</small>
          </div>
          <div>
            <span>Outstanding</span>
            <strong>{formatMoney(result.record.outstanding)}</strong>
            <small>{result.record.invoices.filter((item) => Number(item.balanceDue || 0) > 0).length} pending invoice(s)</small>
          </div>
          <div>
            <span>Open Job</span>
            <strong>{result.openJob?.jobNumber || result.openJob?.id || 'None'}</strong>
            <small>{result.openJob?.status || 'No current open job'}</small>
          </div>
        </div>

        <div className="customer-dashboard-lookup-parts">
          <span>Last Replaced Parts</span>
          <div>
            {result.replacedParts.length
              ? result.replacedParts.map((part) => <b key={part}>{part}</b>)
              : <b>No replacement parts found</b>}
          </div>
        </div>

        <div className="customer-dashboard-lookup-actions">
          <button
            type="button"
            className="is-primary"
            onClick={() => onNavigate(
              `/jobs/new?customerId=${result.record.customer.id}&vehicle=${encodeURIComponent(result.vehicle?.regNo || result.latestJob?.vehicleReg || '')}`
            )}
          >
            <ClipboardList size={13} />
            Create Job Card
          </button>

          {result.openJob && (
            <button
              type="button"
              onClick={() => onNavigate(`/jobs/${result.openJob.id}/overview`)}
            >
              <Wrench size={13} />
              Open Current Job
            </button>
          )}
        </div>
      </div>
    ) : (
      <div className="customer-dashboard-hint">
        Type a vehicle number to show customer profile, repairs, last service, outstanding and current job.
      </div>
    )}
  </section>
);
