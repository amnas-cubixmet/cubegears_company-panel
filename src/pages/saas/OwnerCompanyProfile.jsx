import { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';

const fields = [
  ['name', 'Shop name', 180], ['legal_name', 'Legal name', 220],
  ['email', 'Email', 254], ['phone', 'Phone', 30], ['gstin', 'GSTIN', 20],
  ['address', 'Address', null], ['city', 'City', 100], ['state', 'State', 100],
  ['country', 'Country', 100], ['pincode', 'PIN code', 12],
];

export function OwnerCompanyProfile() {
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    apiClient.get('/company/me').then(data => { if (active) setValues(data); })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);
  const submit = async event => {
    event.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const payload = Object.fromEntries(fields.map(([key]) => [key, values[key] || '']));
      setValues(await apiClient.patch('/company/me', payload));
      setSaved(true);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <section className="owner-company-page">
    <header><h1>Shop Details</h1><p>Manage your company registration and contact details.</p></header>
    {error && <p role="alert">{error}</p>}
    {saved && <p role="status">Shop details saved.</p>}
    {!values && !error && <p role="status">Loading shop details…</p>}
    {values && <form onSubmit={submit}><div className="owner-company-fields">
      {fields.map(([key, label, maxLength]) => <label key={key}>{label}
        <input name={key} value={values[key] || ''} type={key === 'email' ? 'email' : 'text'} maxLength={maxLength || undefined} required={key === 'name'} onChange={event => { setValues({ ...values, [key]: event.target.value }); setSaved(false); }}/>
      </label>)}
    </div><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save shop details'}</button></form>}
  </section>;
}
