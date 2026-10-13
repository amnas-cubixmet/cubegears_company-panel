import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Building2, CalendarDays, CheckCircle2, CreditCard, FilePenLine,
  HardDrive, LockKeyhole, Mail, MapPin, Phone, ReceiptText, Save, Settings2,
  ShieldCheck, Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const display = (value) => value === null || value === undefined || value === '' ? '—' : String(value);
const fmtMoney = (value) => value === null || value === undefined
  ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR',
    maximumFractionDigits: 2 }).format(Number(value) || 0);
const fmtDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—'
    : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EDIT_FIELDS = [
  ['name','Workshop / Company Name','text',true],
  ['phone','Company Phone','tel',false],
  ['email','Official Email','email',false],
  ['gstNo','GSTIN','text',false],
  ['address','Registered Address','textarea',false],
];

export function AccountOverview({
  billing, storage, company, companyError,
  onSaveCompany, onReload, loading, onNavigate,
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!editing) setDraft({
      name: company?.name || '', phone: company?.phone || '',
      email: company?.email || '', gstNo: company?.gstNo || '',
      address: company?.address || '',
    });
  }, [company, editing]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (saving || !company || !onSaveCompany) return;
    const name = draft.name?.trim();
    if (!name) return setSaveError('Enter a workshop / company name.');
    if (name.length > 180) return setSaveError('Company name must be 180 characters or fewer.');
    const gstNo = String(draft.gstNo || '').toUpperCase().trim();
    if (gstNo && !/^[0-9]{2}[A-Z0-9]{13}$/.test(gstNo)) {
      return setSaveError('GSTIN must contain 15 letters and digits.');
    }
    setSaving(true); setSaveError(''); setSaveMessage('');
    try {
      await onSaveCompany({ ...draft, name, gstNo });
      setEditing(false);
      setSaveMessage('Company details updated successfully.');
    } catch (err) {
      setSaveError(err?.message || 'Could not save company details.');
    } finally { setSaving(false); }
  };

  const cards = [
    { label: 'Current Plan', value: display(billing?.plan?.name),
      note: billing?.plan?.status || 'Unavailable', icon: CreditCard },
    { label: 'Active Users', value: display(billing?.usage?.seatsUsed),
      note: 'Active login accounts', icon: Users },
    { label: 'Media Storage', value: storage?.usedGb == null ? '—' : storage.usedGb + ' GB',
      note: 'Stored media, current usage', icon: HardDrive },
    { label: 'Next Renewal', value: fmtDate(billing?.plan?.nextBillingDate),
      note: billing?.plan?.nextBillingDate ? 'From subscription record' : 'Not scheduled', icon: CalendarDays },
  ];
  const actions = [
    { title: 'Billing & Plan', description: 'Subscription and charges', href: '/account/billing', icon: ReceiptText },
    { title: 'Media Storage', description: 'Uploads and usage history', href: '/account/storage', icon: HardDrive },
    { title: 'Invoice Templates', description: 'Workshop document styling', href: '/account/templates', icon: FilePenLine },
    { title: 'Account Security', description: 'Password and sign-in', href: '/account/security', icon: ShieldCheck },
    { title: 'Company Settings', description: 'Workshop preferences', href: '/settings', icon: Settings2 },
  ];

  return (
    <div className="account-overview account-overview-refined">
      <section className="account-overview-welcome">
        <div className="account-overview-avatar" aria-hidden="true">
          {String(user?.name || 'U').trim().split(/\s+/).slice(0,2)
            .map((part) => part[0]?.toUpperCase()).join('')}
        </div>
        <div className="account-overview-welcome__details">
          <span className="account-overview-eyebrow">ACCOUNT WORKSPACE</span>
          <h2>{display(company?.name || user?.companyName || 'Your workshop')}</h2>
          <p>Signed in as <strong>{display(user?.name)}</strong> · {display(user?.email)}</p>
        </div>
        <button type="button" className="account-overview-refresh" onClick={onReload} disabled={loading}>
          <CheckCircle2 size={15}/> {loading ? 'Loading…' : 'Refresh Data'}
        </button>
      </section>

      <section className="account-overview-stats" aria-label="Account overview">
        {cards.map(({label,value,note,icon:Icon}) => (
          <article key={label}>
            <div><span>{label}</span><strong title={value}>{value}</strong><small>{note}</small></div>
            <i><Icon size={19} aria-hidden="true"/></i>
          </article>
        ))}
      </section>
      {saveMessage && <p className="account-overview-success" role="status">{saveMessage}</p>}
      <div className="account-overview-grid">
        <article className="account-overview-panel account-overview-company">
          <header>
            <div><h2><Building2 size={18} aria-hidden="true"/> Company Information</h2>
              <p>Real company profile from your workshop account.</p></div>
            {!editing && company && (
              <button type="button" className="account-overview-edit" onClick={() => {
                setSaveMessage('');setSaveError('');setEditing(true);
              }}>Edit Details</button>
            )}
          </header>

          {companyError && !company && <p className="account-overview-warning" role="alert">
            Company information unavailable. {companyError}
          </p>}
          {editing ? (
            <form className="account-overview-company-form" onSubmit={onSubmit}>
              {EDIT_FIELDS.map(([key,label,type,required]) => (
                <label key={key} className={type==='textarea'?'is-wide':''}>
                  {label}
                  {type==='textarea'
                    ? <textarea rows={3} value={draft[key] || ''} maxLength={500}
                        onChange={(e) => setDraft((prev)=>({...prev,[key]:e.target.value}))}/>
                    : <input type={type} value={draft[key] || ''} required={required}
                        maxLength={key==='gstNo'?15:key==='name'?180:key==='phone'?30:254}
                        onChange={(e) => setDraft((prev)=>({...prev,[key]:e.target.value}))}/>}
                </label>
              ))}
              {saveError && <p className="account-overview-warning" role="alert">{saveError}</p>}
              <div className="account-overview-form-actions">
                <button type="button" disabled={saving} onClick={()=>{setEditing(false);setSaveError('');}}>Cancel</button>
                <button type="submit" className="is-primary" disabled={saving}>
                  <Save size={15} aria-hidden="true"/>{saving?'Saving…':'Save Company'}
                </button>
              </div>
            </form>
          ) : (
            <div className="account-overview-rows">
              <div><span><Building2 size={14}/> Company</span><strong>{display(company?.name)}</strong></div>
              <div><span><Mail size={14}/> Email</span><strong>{display(company?.email)}</strong></div>
              <div><span><Phone size={14}/> Phone</span><strong>{display(company?.phone)}</strong></div>
              <div><span><MapPin size={14}/> Address</span><strong>{display(company?.address)}</strong></div>
              <div><span>GSTIN</span><strong>{display(company?.gstNo)}</strong></div>
            </div>
          )}
        </article>

        <article className="account-overview-panel">
          <header><div><h2><ReceiptText size={18}/> Subscription Summary</h2>
            <p>Charges and usage from your current subscription.</p></div></header>
          <div className="account-overview-rows">
            <div><span>Current Plan</span><strong>{display(billing?.plan?.name)}</strong></div>
            <div><span>Plan Status</span><strong>{display(billing?.plan?.status)}</strong></div>
            <div><span>Base Amount</span><strong>{fmtMoney(billing?.plan?.basePrice)}</strong></div>
            <div><span>Active Users</span><strong>{display(billing?.usage?.seatsUsed)}</strong></div>
            <div><span>Included Seats</span><strong>{display(billing?.plan?.includedSeats)}</strong></div>
            <div><span>Media Storage</span><strong>{storage?.usedGb == null ? '—' : storage.usedGb + ' GB'}</strong></div>
          </div>
          {billing?.billingNote && <p className="account-overview-info">{billing.billingNote}</p>}
          {!billing && <p className="account-overview-info">Subscription information unavailable. Check account permissions.</p>}
        </article>
      </div>
      <section className="account-overview-shortcuts">
        <header><h2>Manage Your Account</h2>
          <p>Account settings, billing, files and security in one place.</p></header>
        <div className="account-overview-shortcut-grid">
          {actions.map(({title,description,href,icon:Icon}) => (
            <button type="button" key={href} onClick={()=>onNavigate(href)}>
              <i><Icon size={20}/></i>
              <strong>{title}</strong><span>{description}</span>
              <ArrowRight size={16} className="account-overview-arrow"/>
            </button>
          ))}
        </div>
      </section>
      <p className="account-overview-footer-note"><LockKeyhole size={14}/>
        Company records are scoped to your logged-in workshop. Restricted settings require appropriate permissions.
      </p>
    </div>
  );
}
