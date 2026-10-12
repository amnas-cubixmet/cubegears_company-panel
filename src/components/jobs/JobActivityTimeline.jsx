import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, Clock3, RefreshCw, Search, UserRound } from 'lucide-react';
import { jobService } from '../../services/job.service';

const GROUPS = [
  ['All', 'All activity'],
  ['Job', 'Job & Workflow'],
  ['Inspection', 'Inspection'],
  ['Estimate', 'Estimate'],
  ['Mechanic', 'Mechanic & Staff'],
  ['Parts', 'Parts & Purchase'],
  ['QC', 'QC & Updates'],
  ['Billing', 'Billing & Payment']
];

export const activityCategory = (event = '') => {
  const text = String(event).toLowerCase();
  if (/inspection|checklist|finding|diagnostic/.test(text)) return 'Inspection';
  if (/estimate|quotation/.test(text)) return 'Estimate';
  if (/mechanic|outside staff|labour|work session|work records|assignment/.test(text)) return 'Mechanic';
  if (/part|stock|purchase order|received/.test(text)) return 'Parts';
  if (/quality|qc|technician update|work photo|job photo|photo/.test(text)) return 'QC';
  if (/invoice|payment|billing|paid/.test(text)) return 'Billing';
  return 'Job';
};

const safeText = (value, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const dateOf = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const datetime = (value) => {
  const date = dateOf(value);
  return date ? new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(date) : 'Time not recorded';
};

const dayKey = (value) => {
  const date = dateOf(value);
  return date ? new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date) : 'Unknown date';
};

const dayLabel = (value) => {
  const date = dateOf(value);
  return date
    ? new Intl.DateTimeFormat('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(date)
    : 'Date not recorded';
};

export function JobActivityTimeline({ jobId }) {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    setLoading(true);
    setError('');
    jobService.getJobActivity(jobId)
      .then((data) => {
        if (!active) return;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError?.response?.data?.detail || requestError?.message || 'Could not load activity log.');
        setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [jobId, refresh]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events
      .filter((event) => category === 'All' || activityCategory(event.event) === category)
      .filter((event) => {
        if (!needle) return true;
        return [event.event, event.description, event.actorName, event.from_status, event.to_status]
          .some((part) => safeText(part).toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const delta = (dateOf(a.created_at || a.createdAt)?.getTime() || 0) -
          (dateOf(b.created_at || b.createdAt)?.getTime() || 0);
        return sort === 'newest' ? -delta : delta;
      });
  }, [events, category, query, sort]);

  const groups = useMemo(() => {
    const result = [];
    for (const event of filtered) {
      const time = event.created_at || event.createdAt;
      const key = dayKey(time);
      if (!result.length || result[result.length - 1].key !== key) {
        result.push({ key, title: dayLabel(time), rows: [] });
      }
      result[result.length - 1].rows.push(event);
    }
    return result;
  }, [filtered]);

  return (
    <section className="job-activity-dashboard" aria-label="Full Job Card activity log">
      <header className="job-activity-header">
        <div className="job-activity-heading">
          <span className="job-activity-heading-icon" aria-hidden="true"><Activity size={19} /></span>
          <div>
            <h2>Job Activity Log</h2>
            <p>Recorded job actions from creation through delivery, with staff and timestamps.</p>
          </div>
        </div>
        <button type="button" className="job-activity-refresh" disabled={loading}
          onClick={() => setRefresh((number) => number + 1)}>
          <RefreshCw size={15} aria-hidden="true"/> {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      <div className="job-activity-toolbar">
        <label className="job-activity-search">
          <Search size={16} aria-hidden="true"/>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Search action, staff or description" aria-label="Search Job Card activity"/>
        </label>
        <label className="job-activity-order">
          <span>Order</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="job-activity-filters" role="group" aria-label="Filter by activity category">
        {GROUPS.map(([value, label]) => (
          <button key={value} type="button" className={category === value ? 'is-active' : ''}
            aria-pressed={category === value} onClick={() => setCategory(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="job-activity-count" role="status">
        <span>{filtered.length} {filtered.length === 1 ? 'event' : 'events'} shown</span>
        {events.length > 0 && <span>{events.length} recorded in this Job Card</span>}
      </div>

      {error && <p className="job-activity-message" role="alert">{error}</p>}
      {loading ? (
        <div className="job-activity-message" role="status">Loading activity records…</div>
      ) : !error && !filtered.length ? (
        <div className="job-activity-message">
          <Clock3 size={22} aria-hidden="true"/>
          <strong>{events.length ? 'No matching activity' : 'No recorded activity yet'}</strong>
          <p>{events.length ? 'Try another category or clear your search.' :
            'Events appear here when workshop actions are saved. Earlier unrecorded actions cannot be reconstructed.'}</p>
        </div>
      ) : (
        <div className="job-activity-groups">
          {groups.map((group) => (
            <section key={group.key} className="job-activity-day">
              <h3><CalendarDays size={15} aria-hidden="true" />{group.title}</h3>
              <ol className="job-activity-events">
                {group.rows.map((event, index) => {
                  const eventName = safeText(event.event, 'Job Update');
                  const description = safeText(event.description);
                  const actor = safeText(event.actorName, 'System / Unknown');
                  const before = safeText(event.from_status);
                  const after = safeText(event.to_status);
                  return (
                    <li key={event.id || `${group.key}-${index}`} className="job-activity-event">
                      <span className="job-activity-dot" aria-hidden="true"/>
                      <div className="job-activity-event-main">
                        <div className="job-activity-event-top">
                          <strong>{eventName}</strong>
                          <span className="job-activity-category">{activityCategory(eventName)}</span>
                        </div>
                        {description && <p>{description}</p>}
                        {before && after && before !== after && (
                          <div className="job-activity-status-change">
                            <span>{before}</span><span aria-hidden="true">→</span><span>{after}</span>
                          </div>
                        )}
                        <div className="job-activity-meta">
                          <span><UserRound size={13} aria-hidden="true"/>{actor}</span>
                          <time dateTime={dateOf(event.created_at || event.createdAt)?.toISOString()}>
                            <Clock3 size={13} aria-hidden="true"/>{datetime(event.created_at || event.createdAt)}
                          </time>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
      <p className="job-activity-disclaimer">
        This is the saved activity history. Actions performed before audit recording was enabled may not appear.
      </p>
    </section>
  );
}
