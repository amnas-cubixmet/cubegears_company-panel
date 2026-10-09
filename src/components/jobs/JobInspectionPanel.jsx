import { useCallback, useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, ClipboardCheck, Plus, RefreshCcw, Search, ShieldCheck, Trash2, Wrench } from 'lucide-react';
import { jobInspectionService, DEFAULT_INSPECTION_CATEGORIES } from '../../services/jobInspection.service';

const newFinding = () => ({
  description: '', severity: 'Medium', recommendedAction: '', estimatedCost: ''
});

const STATUS_OPTIONS = ['Not Checked', 'Good', 'Needs Attention', 'Critical'];
const baseInput = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface-2 px-3 text-sm text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/10';
const formatMoney = (number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(number) || 0);

const readImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read the photo.'));
  reader.readAsDataURL(file);
});

export function JobInspectionPanel({ job, onChanged }) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [finding, setFinding] = useState(newFinding());
  const [diagnostic, setDiagnostic] = useState({ code: '', description: '' });

  const reload = useCallback(async () => {
    const result = await jobInspectionService.getInspection(job.id);
    setInspection(result || { status: 'Not Started', checklist: {}, findings: [], photos: [], diagnosticScan: { codes: [] } });
    return result;
  }, [job.id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    jobInspectionService.getInspection(job.id)
      .then((result) => {
        if (active) setInspection(result || { status: 'Not Started', checklist: {}, findings: [], photos: [], diagnosticScan: { codes: [] } });
      })
      .catch((e) => { if (active) setError(e?.message || 'Could not load inspection.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [job.id]);

  const perform = async (label, operation) => {
    if (busy) return false;
    setBusy(label);
    setError('');
    try {
      await operation();
      await reload();
      await onChanged?.();
      return true;
    } catch (e) {
      setError(e?.message || 'Unable to save inspection.');
      return false;
    } finally {
      setBusy('');
    }
  };

  const checklist = inspection?.checklist || {};
  const items = useMemo(() => [...new Set(DEFAULT_INSPECTION_CATEGORIES.flatMap((group) => group.items))], []);
  const total = items.length;
  const completed = items.filter((item) => checklist[item] && checklist[item] !== 'Not Checked').length;
  const good = items.filter((item) => checklist[item] === 'Good').length;
  const attention = items.filter((item) => ['Needs Attention', 'Critical'].includes(checklist[item])).length;
  const findings = inspection?.findings || [];
  const photos = inspection?.photos || [];
  const codes = inspection?.diagnosticScan?.codes || [];
  const isCompleted = inspection?.status === 'Completed';
  const isStarted = inspection?.status === 'In Progress' || isCompleted;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const activeGroups = DEFAULT_INSPECTION_CATEGORIES.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()) || group.name.toLowerCase().includes(search.trim().toLowerCase()))
  })).filter((group) => group.items.length);

  const saveFinding = async (event) => {
    event.preventDefault();
    if (!finding.description.trim()) {
      setError('Describe the finding before saving.');
      return;
    }
    const saved = await perform('finding', () => jobInspectionService.addFinding(job.id, {
      ...finding,
      title: finding.description.trim(),
      description: finding.description.trim(),
      estimatedPartCharge: Number(finding.estimatedCost) || 0
    }));
    if (saved) setFinding(newFinding());
  };

  const saveDiagnostic = async (event) => {
    event.preventDefault();
    if (!diagnostic.code.trim()) return;
    const saved = await perform('diagnostic', () => jobInspectionService.addDiagnosticCode(job.id, {
      code: diagnostic.code.trim().toUpperCase(), description: diagnostic.description.trim()
    }));
    if (saved) setDiagnostic({ code: '', description: '' });
  };

  const savePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setError('Choose an image under 2 MB.');
      return;
    }
    try {
      const url = await readImage(file);
      await perform('photo', () => jobInspectionService.addInspectionPhoto(job.id, {
        url, type: 'Inspection', caption: file.name
      }));
    } catch (e) {
      setError(e?.message || 'Photo could not be saved.');
    }
  };

  if (loading) return <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">Loading inspection…</div>;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl bg-primary-soft p-2.5 text-primary"><ShieldCheck size={21} /></div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-content sm:text-lg">Vehicle inspection</h2>
              <p className="mt-1 break-words text-xs text-muted">{job.vehicleReg || job.vehicle?.registration || 'Vehicle'} · {job.vehicleInfo || 'Check all safety and service items'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-surface-2 px-3 py-2 text-xs font-bold text-content">{inspection?.status || 'Not Started'}</span>
            <button type="button" aria-label="Refresh inspection" onClick={() => perform('refresh', async () => {})} disabled={!!busy} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-secondary disabled:opacity-50"><RefreshCcw size={16}/></button>
            {!isStarted && <button type="button" disabled={!!busy} onClick={() => perform('start', () => jobInspectionService.startInspection(job.id))} className="h-10 rounded-xl bg-primary px-4 text-xs font-bold text-white disabled:opacity-50">Start inspection</button>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Checked', completed + ' / ' + total],
            ['Good', good],
            ['Needs attention', attention],
            ['Findings', findings.length]
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-xl bg-surface-2 p-3">
              <p className="text-[11px] font-semibold text-muted">{label}</p>
              <p className="mt-1 text-lg font-extrabold text-content">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-secondary">Checklist progress</span><strong className="text-primary">{progress}%</strong></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label="Inspection checklist progress"><div className="h-full rounded-full bg-primary transition-all" style={{ width: progress + '%' }} /></div>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="flex items-center gap-2 text-sm font-extrabold text-content"><ClipboardCheck size={17} className="text-primary"/>Inspection checklist</h3><p className="mt-1 text-xs text-muted">Save each check as you inspect the vehicle.</p></div>
            <label className="relative block w-full sm:w-52"><Search size={15} className="absolute left-3 top-3.5 text-muted"/><input aria-label="Search inspection items" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search checks" className={baseInput + ' pl-9'}/></label>
          </div>
          {!isStarted && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-secondary">Start the inspection to record checklist results.</p>}
          <div className="mt-4 flex min-w-0 flex-col gap-2">
            {activeGroups.map((group, groupIndex) => (
              <details key={group.id} open={search ? true : undefined} className="min-w-0 rounded-xl border border-line bg-surface-2" >
                <summary className="cursor-pointer select-none px-3 py-3 text-xs font-bold text-content sm:px-4">{group.name} <span className="ml-2 font-medium text-muted">{group.items.filter((item)=>checklist[item] && checklist[item] !== 'Not Checked').length}/{group.items.length}</span></summary>
                <div className="grid grid-cols-1 gap-2 border-t border-line p-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <label key={group.id + item} className="min-w-0 rounded-lg border border-line bg-surface p-3">
                      <span className="mb-2 block break-words text-xs font-semibold text-content">{item}</span>
                      <select aria-label={item + ' condition'} value={checklist[item] || 'Not Checked'} disabled={!isStarted || !!busy || isCompleted} onChange={(e)=>perform('check',()=>jobInspectionService.updateChecklistItem(job.id,item,e.target.value))} className={baseInput + ' bg-surface text-[13px] disabled:opacity-60'}>
                        {STATUS_OPTIONS.map((status)=><option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </details>
            ))}
            {!activeGroups.length && <p className="p-4 text-center text-sm text-muted">No checks match your search.</p>}
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-content"><Wrench size={17} className="text-primary"/>Add finding</h3>
            <p className="mt-1 text-xs text-muted">Record issues before estimating repairs.</p>
            <form onSubmit={saveFinding} className="mt-4 flex flex-col gap-3">
              <label className="text-xs font-semibold text-secondary">Issue / damage *
                <textarea required value={finding.description} onChange={(e)=>setFinding({...finding,description:e.target.value})} rows={3} placeholder="Describe the condition" className={baseInput + ' mt-1 resize-y py-3'}/>
              </label>
              <label className="text-xs font-semibold text-secondary">Severity
                <select className={baseInput + ' mt-1'} value={finding.severity} onChange={(e)=>setFinding({...finding,severity:e.target.value})}>
                  {['Low','Medium','High','Critical'].map((s)=><option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-secondary">Recommended action
                <input value={finding.recommendedAction} onChange={(e)=>setFinding({...finding,recommendedAction:e.target.value})} placeholder="Repair / replace / check" className={baseInput + ' mt-1'}/>
              </label>
              <label className="text-xs font-semibold text-secondary">Estimated parts cost (₹)
                <input value={finding.estimatedCost} onChange={(e)=>setFinding({...finding,estimatedCost:e.target.value})} type="number" min="0" step="0.01" placeholder="0" className={baseInput + ' mt-1'}/>
              </label>
              <button disabled={!isStarted || isCompleted || !!busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-50"><Plus size={17}/>Save finding</button>
            </form>
          </section>

          <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-content">Diagnostic codes</h3>
            <form className="mt-3 flex flex-col gap-2" onSubmit={saveDiagnostic}>
              <input aria-label="Diagnostic code" value={diagnostic.code} onChange={(e)=>setDiagnostic({...diagnostic,code:e.target.value})} placeholder="DTC code e.g. P0300" className={baseInput}/>
              <input aria-label="Diagnostic description" value={diagnostic.description} onChange={(e)=>setDiagnostic({...diagnostic,description:e.target.value})} placeholder="Code description" className={baseInput}/>
              <button disabled={!isStarted || isCompleted || !!busy || !diagnostic.code.trim()} className="h-10 rounded-xl border border-line bg-surface-2 text-xs font-bold text-content disabled:opacity-50">Add diagnostic code</button>
            </form>
            {!!codes.length && <div className="mt-3 flex flex-col gap-2">{codes.map((code)=><div key={code.id} className="rounded-lg bg-surface-2 p-3 text-xs"><strong className="text-content">{code.code}</strong><p className="mt-1 break-words text-muted">{code.description || 'No description'}</p></div>)}</div>}
          </section>
          <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-content">Inspection photos</h3>
            <p className="mt-1 text-xs text-muted">Camera or image upload, max 2 MB each.</p>
            <label className={'mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-xs font-bold text-content ' + (!isStarted || isCompleted || busy ? 'opacity-50' : 'cursor-pointer')}>
              <Camera size={16}/>Take / upload photo
              <input disabled={!isStarted || isCompleted || !!busy} type="file" accept="image/*" capture="environment" onChange={savePhoto} className="sr-only"/>
            </label>
            {!!photos.length && <div className="mt-3 grid grid-cols-3 gap-2">{photos.map((photo)=><a href={photo.url} target="_blank" rel="noreferrer" key={photo.id} title={photo.caption || 'Inspection photo'}><img src={photo.url} alt={photo.caption || 'Inspection'} className="aspect-square w-full rounded-lg border border-line object-cover"/></a>)}</div>}
          </section>
        </div>
      </div>

      <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-extrabold text-content">Inspection findings</h3><p className="mt-1 text-xs text-muted">{findings.length} recorded</p></div></div>
        <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
          {findings.map((item) => (
            <article key={item.id} className="min-w-0 rounded-xl border border-line bg-surface-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><strong className="min-w-0 flex-1 break-words text-sm text-content">{item.description || item.title}</strong><span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary">{item.severity}</span></div>
              <p className="mt-2 break-words text-xs text-secondary">{item.recommendedAction || 'No action recorded'}</p>
              <p className="mt-2 text-xs font-bold text-content">{formatMoney(item.estimatedPartCharge ?? item.estimatedCost)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={!!busy || item.addedToEstimate} onClick={() => perform('estimate',()=>jobInspectionService.addFindingToEstimate(job.id,item.id))} className="min-h-9 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-content disabled:opacity-60">{item.addedToEstimate ? 'Marked for estimate' : 'Mark for estimate'}</button>
                {!isCompleted && <button type="button" aria-label="Delete finding" disabled={!!busy} onClick={() => perform('delete',()=>jobInspectionService.deleteFinding(job.id,item.id))} className="flex min-h-9 items-center gap-1 rounded-lg border border-red-500/20 px-3 text-xs font-semibold text-red-600 disabled:opacity-50"><Trash2 size={13}/>Delete</button>}
              </div>
            </article>
          ))}
          {!findings.length && <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted md:col-span-2">No issues recorded. Good-condition inspections can be completed without findings.</div>}
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-sm backdrop-blur sm:static sm:p-4">
        <p className="min-w-0 flex-1 text-xs text-secondary">{isCompleted ? 'Inspection completed and saved.' : completed ? completed + ' checks recorded. Finish to proceed to estimates.' : 'Record at least one check to complete.'}</p>
        {isCompleted
          ? <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-soft px-4 text-xs font-bold text-primary"><CheckCircle2 size={16}/>Completed</span>
          : <button type="button" disabled={!isStarted || completed===0 || !!busy} onClick={() => perform('complete',()=>jobInspectionService.completeInspection(job.id,true))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 size={16}/>{busy==='complete'?'Finishing…':'Complete inspection'}</button>
        }
      </div>
    </div>
  );
}

export default JobInspectionPanel;
