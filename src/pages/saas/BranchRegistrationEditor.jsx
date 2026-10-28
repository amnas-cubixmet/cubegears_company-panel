import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { branchService } from '../../services/branch.service';
import { INDIA_STATES } from '../../utils/indiaGst.js';
import { invoiceStateCode } from '../../utils/invoiceTaxUi.js';

const names = new Map(INDIA_STATES);
const describeState = (code) => code
  ? code + ' — ' + (names.get(code) || 'Unknown') : 'Not configured';

/**
 * A company administrator may correct the *actual* state of their workshop
 * branch. We never silently rewrite a branch to match the company GSTIN:
 * an actual out-of-state branch may require its own GST registration.
 */
export function BranchRegistrationEditor({ companyState = '', gstin = '' }) {
  const location = useLocation();
  const requestedId = new URLSearchParams(location.search).get('branchId') || '';
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [state, setState] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    branchService.getBranches().then((rows) => {
      if (!active) return;
      const list = Array.isArray(rows) ? rows : [];
      setBranches(list);
      setSelectedId((current) => (
        list.some((row) => String(row.id) === requestedId) ? requestedId
          : list.some((row) => String(row.id) === current) ? current
            : list.length === 1 ? String(list[0].id) : ''
      ));
    }).catch((err) => {
      if (active) setError(err?.message || 'Unable to load branch details.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [requestedId]);

  const selected = branches.find((item) => String(item.id) === selectedId);
  useEffect(() => {
    setState(invoiceStateCode(selected?.state || ''));
    setConfirmed(false);
    setError('');
    setSuccess('');
  }, [selected?.id, selected?.state]);

  const registeredState = invoiceStateCode(String(gstin || '').slice(0, 2));
  const effectiveState = invoiceStateCode(selected?.state || companyState);
  const actualMismatch = Boolean(registeredState && effectiveState && registeredState !== effectiveState);
  const selectedName = names.get(state);
  const isChanged = Boolean(selected && state && selectedName && selectedName !== selected.state);
  const save = async (event) => {
    event.preventDefault();
    if (!selected || !selectedName || !confirmed || !isChanged || saving) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await branchService.updateBranchState(selected.id, selectedName);
      setBranches((current) => current.map((item) => String(item.id) === String(selected.id)
        ? { ...item, ...updated, state: selectedName } : item));
      setSuccess('Branch state saved. Return to New Invoice and reload the page.');
    } catch (err) {
      setError(err?.message || 'Unable to update the branch state.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="workshop-branches" className="owner-company-branches">
      <h2>Supplying Branch State</h2>
      <p>The branch location must reflect the actual workshop address. Only correct an inaccurate branch record; do not change a real branch location just to bypass GST validation.</p>
      <p className="owner-company-branch-registration">
        Company GSTIN registered state: <strong>{describeState(registeredState)}</strong>
      </p>
      {loading && <p role="status">Loading workshop branches…</p>}
      {error && <p className="owner-company-notice is-error" role="alert">{error}</p>}
      {success && <p className="owner-company-notice is-success" role="status">{success}</p>}
      {!loading && !branches.length && !error && (
        <p role="status">No separate branches are configured. Check the Company State field above against the GSTIN registered state.</p>
      )}
      {!loading && branches.length > 0 && (
        <form onSubmit={save} className="owner-company-branch-form">
          <label>
            <span>Supplying branch</span>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Select branch</option>
              {branches.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
          {selected && <>
            <p className="owner-company-branch-registration">
              Current branch state: <strong>{selected.state || 'Not specified (uses Company State)'}</strong>
              {actualMismatch && <span className="owner-company-branch-mismatch" role="status">
                State mismatch: {describeState(effectiveState)} does not match GSTIN {describeState(registeredState)}.
              </span>}
            </p>
            <label>
              <span>Actual branch state</span>
              <select value={state} onChange={(event) => {
                setState(event.target.value);
                setConfirmed(false);
                setSuccess('');
              }}>
                <option value="">Select actual state</option>
                {INDIA_STATES.map(([code, name]) => (
                  <option value={code} key={code}>{code} — {name}</option>
                ))}
              </select>
            </label>
            {isChanged && <label className="owner-company-branch-confirm">
              <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              I confirm this is the actual state where the selected branch operates.
            </label>}
            {isChanged && registeredState && state !== registeredState && <p className="owner-company-branch-mismatch">
              This state still differs from the company GSTIN. The existing GST invoice restriction will remain until the appropriate supplying registration is configured.
            </p>}
            <button type="submit" disabled={!isChanged || !confirmed || saving}>
              {saving ? 'Saving branch…' : 'Save branch state'}
            </button>
          </>}
        </form>
      )}
    </section>
  );
}
