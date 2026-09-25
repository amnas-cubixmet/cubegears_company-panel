import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Search, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { staffService } from '../../services/staff.service';

const nowLocal = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

export const JobCreatePage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [staff, setStaff] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [form, setForm] = useState({
    jobDateTime: nowLocal(),
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleReg: '',
    vehicleInfo: '',
    vin: '',
    kilometre: '',
    fuelLevel: '50%',
    serviceType: 'General Service',
    complaint: '',
    assignedEmployeeId: '',
    assignedEmployeeName: '',
    serviceAdvisor: '',
    priority: 'Medium',
    status: 'New',
    branch: 'Main Garage Branch',
    notes: ''
  });

  useEffect(() => {
    staffService.getStaff().then((data) => setStaff(Array.isArray(data) ? data.filter((item) => item.employmentStatus === 'Active') : []));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (form.vehicleReg.trim().length < 5) {
        setHistory([]);
        return;
      }

      setHistoryLoading(true);
      try {
        const rows = await jobService.getVehicleHistory(form.vehicleReg);
        setHistory(rows);

        if (rows.length) {
          const latest = rows[0];
          setForm((old) => ({
            ...old,
            customerName: old.customerName || latest.customerName || '',
            customerPhone: old.customerPhone || latest.customerPhone || '',
            customerEmail: old.customerEmail || latest.customerEmail || '',
            vehicleInfo: old.vehicleInfo || latest.vehicleInfo || '',
            vin: old.vin || latest.vin || latest.vehicle?.vin || ''
          }));
        }
      } finally {
        setHistoryLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [form.vehicleReg]);

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const assignStaff = (id) => {
    const selected = staff.find((item) => item.id === id);
    setForm((old) => ({
      ...old,
      assignedEmployeeId: id,
      assignedEmployeeName: selected?.name || ''
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.vehicleReg.trim()) {
      setError('Customer name, phone and vehicle registration are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = await jobService.createJob({
        ...form,
        checkInTime: form.jobDateTime,
        customerComplaints: form.complaint
          ? [{ id: `CMP-${Date.now()}`, description: form.complaint, wording: form.complaint, status: 'Open' }]
          : [],
        complaints: form.complaint
          ? [{ id: `CMP-${Date.now()}`, description: form.complaint, wording: form.complaint, status: 'Open' }]
          : [],
        vehicle: {
          registration: form.vehicleReg,
          makeModel: form.vehicleInfo,
          vin: form.vin
        },
        services: [],
        partsUsed: [],
        outsidePurchases: [],
        labourRecords: [],
        estimates: [],
        workUpdates: [],
        photos: [],
        additionalApprovals: [],
        billing: { advancePaid: 0, paidAmount: 0, outstandingBalance: 0 }
      });

      navigate(`/jobs/${created.id}/overview`, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to create job card.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';
  const labelClass = 'text-xs font-semibold text-secondary';

  return (
    <div className="job-management-page job-create-page flex w-full min-w-0 flex-col gap-4">
      <div className="job-create-header flex flex-wrap items-start justify-between gap-3">
        <div>
          <button type="button" className="mb-3 inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-content" onClick={() => navigate('/jobs')}>
            <ArrowLeft size={15}/>Back
          </button>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">New Job Card</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-content">Vehicle Check-In</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Create the workshop job record from vehicle arrival through inspection, approval, repair, QC, invoice and delivery.</p>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600">{error}</div> : null}

      <form onSubmit={submit} className="job-create-form flex flex-col gap-4">
        <section className="job-create-section rounded-2xl border border-line bg-surface p-4 md:p-5">
          <h2 className="text-base font-extrabold text-content">Job & Customer</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className={labelClass}>Date / Time *
              <input type="datetime-local" required value={form.jobDateTime} onChange={(e) => set('jobDateTime', e.target.value)} className={inputClass}/>
            </label>
            <label className={labelClass}>Customer Name *
              <input required value={form.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder="Customer name" className={inputClass}/>
            </label>
            <label className={labelClass}>Phone *
              <input required inputMode="tel" value={form.customerPhone} onChange={(e) => set('customerPhone', e.target.value)} placeholder="+91..." className={inputClass}/>
            </label>
            <label className={labelClass}>Email
              <input type="email" value={form.customerEmail} onChange={(e) => set('customerEmail', e.target.value)} placeholder="Optional" className={inputClass}/>
            </label>
            <label className={labelClass}>Branch
              <select value={form.branch} onChange={(e) => set('branch', e.target.value)} className={inputClass}>
                <option>Main Garage Branch</option><option>Kochi South Branch</option>
              </select>
            </label>
            <label className={labelClass}>Service Type
              <select value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)} className={inputClass}>
                {['General Service','Running Repair','Breakdown','Insurance Repair','Body Shop','AC Service','Electrical','Engine Work','Periodic Maintenance'].map((item)=><option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="job-create-section rounded-2xl border border-line bg-surface p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Search size={17} className="text-primary"/>
            <h2 className="text-base font-extrabold text-content">Vehicle</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className={labelClass}>Registration Number *
              <input required autoCapitalize="characters" value={form.vehicleReg} onChange={(e) => set('vehicleReg', e.target.value.toUpperCase())} placeholder="KL 07 AB 1234" className={inputClass}/>
            </label>
            <label className={labelClass}>Make / Model
              <input value={form.vehicleInfo} onChange={(e) => set('vehicleInfo', e.target.value)} placeholder="Toyota Innova 2.5V" className={inputClass}/>
            </label>
            <label className={labelClass}>VIN / Chassis
              <input value={form.vin} onChange={(e) => set('vin', e.target.value.toUpperCase())} placeholder="VIN / chassis number" className={inputClass}/>
            </label>
            <label className={labelClass}>KM Reading
              <input inputMode="numeric" value={form.kilometre} onChange={(e) => set('kilometre', e.target.value.replace(/[^0-9]/g,''))} placeholder="52400" className={inputClass}/>
            </label>
            <label className={labelClass}>Fuel Level
              <select value={form.fuelLevel} onChange={(e) => set('fuelLevel', e.target.value)} className={inputClass}>
                {['Empty','10%','25%','50%','75%','Full'].map((item)=><option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          {historyLoading ? <div className="mt-3 text-xs text-muted">Checking vehicle history…</div> : history.length ? (
            <div className="job-create-history mt-4 rounded-xl border border-primary/20 bg-primary-soft p-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-primary"><History size={15}/>{history.length} previous job card{history.length > 1 ? 's' : ''} found</div>
              <div className="mt-2 text-[11px] text-secondary">
                Last visit: <strong className="text-content">{history[0].createdDate}</strong> · {history[0].status} · {history[0].customerName}
              </div>
            </div>
          ) : null}
        </section>

        <section className="job-create-section rounded-2xl border border-line bg-surface p-4 md:p-5">
          <h2 className="text-base font-extrabold text-content">Complaint & Assignment</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={labelClass + ' md:col-span-2'}>Customer Complaint
              <textarea rows={4} value={form.complaint} onChange={(e) => set('complaint', e.target.value)} placeholder="Record the customer's words separately..." className="mt-1 min-h-28 w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-content outline-none focus:border-primary"/>
            </label>
            <label className={labelClass}>Assigned Technician
              <select value={form.assignedEmployeeId} onChange={(e) => assignStaff(e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                {staff.map((item)=><option key={item.id} value={item.id}>{item.name} · {item.designation}</option>)}
              </select>
            </label>
            <label className={labelClass}>Service Advisor
              <select value={form.serviceAdvisor} onChange={(e) => set('serviceAdvisor', e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                {staff.map((item)=><option key={item.id} value={item.name}>{item.name} · {item.designation}</option>)}
              </select>
            </label>
            <label className={labelClass}>Priority
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputClass}>
                <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>
            </label>
            <label className={labelClass}>Initial Status
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                <option>New</option><option>Inspection</option>
              </select>
            </label>
            <label className={labelClass + ' md:col-span-2'}>Internal Notes
              <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-content outline-none focus:border-primary"/>
            </label>
          </div>
        </section>

        <div className="job-create-actions sticky bottom-0 z-20 flex gap-2 border-t border-line bg-surface/95 p-3 backdrop-blur md:static md:justify-end md:border-0 md:bg-transparent md:p-0">
          <button type="button" className="h-11 flex-1 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-content md:flex-none" onClick={() => navigate('/jobs')}>Cancel</button>
          <button disabled={saving} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 text-sm font-bold text-white md:flex-none">
            <CheckCircle2 size={17}/>{saving ? 'Creating…' : 'Create Job Card'}
          </button>
        </div>
      </form>
    </div>
  );
};
