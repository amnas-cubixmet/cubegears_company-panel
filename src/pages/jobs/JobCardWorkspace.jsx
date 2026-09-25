import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  History,
  PackageSearch,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { staffService } from '../../services/staff.service';
import { JobPartsWorkflow } from './JobPartsWorkflow';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

const JOB_STATUSES = [
  'New',
  'Inspection',
  'Estimate Pending',
  'Approved',
  'In Progress',
  'Waiting for Parts',
  'QC',
  'Ready for Delivery',
  'Delivered'
];

const TABS = [
  ['overview', 'Overview'],
  ['complaints', 'Complaints'],
  ['inspection', 'Inspection'],
  ['work', 'Work & Labour'],
  ['parts', 'Parts'],
  ['estimate', 'Estimate'],
  ['updates', 'Technician Updates'],
  ['qc', 'QC'],
  ['invoice', 'Invoice'],
  ['activity', 'Activity']
];

const blankLabour = () => ({
  service: '',
  mechanicName: '',
  estimatedHours: '',
  hours: '',
  rate: '',
  internalCost: ''
});

const blankFinding = () => ({
  description: '',
  severity: 'Medium',
  recommendedAction: '',
  estimatedCost: ''
});

const cleanNumber = (value) => Number(String(value ?? '').replace(/[^0-9.]/g, '')) || 0;

export function JobCardWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [staff, setStaff] = useState([]);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [complaintText, setComplaintText] = useState('');
  const [finding, setFinding] = useState(blankFinding());
  const [labour, setLabour] = useState(blankLabour());
  const [updateNote, setUpdateNote] = useState('');
  const [updateType, setUpdateType] = useState('Work Update');
  const [estimateTax, setEstimateTax] = useState('18');
  const [estimateDiscount, setEstimateDiscount] = useState('0');
  const [qcRoadTest, setQcRoadTest] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({
    finalKm: '',
    customerSignature: '',
    warrantyNotes: ''
  });

  const activeTab = useMemo(() => {
    const section = location.pathname.split('/').filter(Boolean).at(-1);
    return TABS.some(([key]) => key === section) ? section : 'overview';
  }, [location.pathname]);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [data, staffData] = await Promise.all([
        jobService.getJobById(id),
        staffService.getStaff()
      ]);

      setJob(data || null);
      setStaff(Array.isArray(staffData) ? staffData.filter((item) => item.employmentStatus === 'Active') : []);

      if (data?.vehicleReg) {
        const history = await jobService.getVehicleHistory(data.vehicleReg);
        setVehicleHistory(history.filter((item) => item.id !== data.id));
      } else {
        setVehicleHistory([]);
      }

      setDeliveryForm({
        finalKm: data?.delivery?.finalKm || data?.kilometre || '',
        customerSignature: data?.delivery?.acknowledgedBy || '',
        warrantyNotes: data?.delivery?.notes || ''
      });
      setQcRoadTest(data?.qualityCheck?.testDriveNotes || '');
    } catch (e) {
      setError(e?.message || 'Unable to load job card.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const persist = async (patch) => {
    if (!job) return null;

    setSaving(true);
    setError('');

    try {
      const updated = await jobService.updateJob(job.id, patch);
      const next = updated || { ...job, ...patch };
      setJob(next);
      return next;
    } catch (e) {
      setError(e?.message || 'Could not save job card.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status) => {
    setSaving(true);
    try {
      const updated = await jobService.updateJobStatus(job.id, status);
      setJob(updated || { ...job, status });
    } finally {
      setSaving(false);
    }
  };

  const assignTechnician = async (staffId) => {
    const selected = staff.find((item) => item.id === staffId);
    await persist({
      assignedEmployeeId: selected?.id || '',
      assignedEmployeeName: selected?.name || ''
    });
  };

  const complaints = job?.complaints || job?.customerComplaints || [];
  const findings = job?.inspectionFindings || [];
  const labourRecords = job?.labourRecords || [];
  const parts = job?.partsUsed || [];
  const outsidePurchases = job?.outsidePurchases || [];
  const estimates = job?.estimates || [];
  const updates = job?.workUpdates || [];
  const timeline = job?.timeline || [];
  const qc = job?.qualityCheck || {
    inspector: 'Unassigned',
    status: 'Pending',
    checklist: [],
    testDriveNotes: '',
    remarks: ''
  };

  const partsTotal = useMemo(
    () => parts.reduce((sum, item) => sum + cleanNumber(item.total || cleanNumber(item.qty) * cleanNumber(item.unitPrice || item.sellingPrice)), 0),
    [parts]
  );

  const outsideTotal = useMemo(
    () => outsidePurchases.reduce((sum, item) => sum + cleanNumber(item.sellingPrice || item.purchasePrice) * cleanNumber(item.qty || 1), 0),
    [outsidePurchases]
  );

  const labourTotal = useMemo(() => {
    if (labourRecords.length) {
      return labourRecords.reduce((sum, item) => sum + cleanNumber(item.customerCharge || cleanNumber(item.hours) * cleanNumber(item.rate)), 0);
    }

    return (job?.services || []).reduce((sum, item) => sum + cleanNumber(item.labourRate) * cleanNumber(item.qty || 1), 0);
  }, [labourRecords, job?.services]);

  const estimateSubtotal = partsTotal + outsideTotal + labourTotal;
  const estimateDiscountAmount = cleanNumber(estimateDiscount);
  const taxable = Math.max(0, estimateSubtotal - estimateDiscountAmount);
  const estimateTaxAmount = taxable * cleanNumber(estimateTax) / 100;
  const estimateGrandTotal = taxable + estimateTaxAmount;

  const latestEstimate = estimates.at(-1) || null;

  const addComplaint = async () => {
    const description = complaintText.trim();
    if (!description) return;

    const record = {
      id: `CMP-${Date.now()}`,
      description,
      wording: description,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    await persist({ complaints: [...complaints, record] });
    setComplaintText('');
  };

  const updateComplaintStatus = async (complaintId, status) => {
    await persist({
      complaints: complaints.map((item) => item.id === complaintId ? { ...item, status } : item)
    });
  };

  const addFinding = async (event) => {
    event.preventDefault();
    if (!finding.description.trim()) return;

    const record = {
      id: `FND-${Date.now()}`,
      ...finding,
      estimatedCost: cleanNumber(finding.estimatedCost),
      addedToEstimate: true,
      createdAt: new Date().toISOString()
    };

    await persist({
      inspectionFindings: [...findings, record],
      status: job.status === 'New' ? 'Inspection' : job.status
    });
    setFinding(blankFinding());
  };

  const addLabour = async (event) => {
    event.preventDefault();
    if (!labour.service.trim()) return;

    const record = {
      id: `LAB-${Date.now()}`,
      ...labour,
      estimatedHours: cleanNumber(labour.estimatedHours),
      hours: cleanNumber(labour.hours),
      rate: cleanNumber(labour.rate),
      internalCost: cleanNumber(labour.internalCost),
      customerCharge: cleanNumber(labour.hours || labour.estimatedHours) * cleanNumber(labour.rate),
      status: 'In Progress',
      startedAt: new Date().toISOString()
    };

    await persist({ labourRecords: [...labourRecords, record] });
    setLabour(blankLabour());
  };

  const createEstimate = async (kind = 'Estimate') => {
    const nextVersion = estimates.length + 1;
    const record = {
      id: `EST-${Date.now()}`,
      version: kind === 'Additional Work' ? `Additional Work V${nextVersion}` : `Estimate V${nextVersion}`,
      type: kind,
      date: new Date().toLocaleString('en-IN'),
      servicesTotal: labourTotal,
      partsTotal,
      outsidePurchasesTotal: outsideTotal,
      subtotal: estimateSubtotal,
      discount: estimateDiscountAmount,
      taxPercent: cleanNumber(estimateTax),
      taxAmount: estimateTaxAmount,
      grandTotal: estimateGrandTotal,
      approvalStatus: 'Pending',
      approvedBy: null,
      approvedAt: null
    };

    await persist({
      estimates: [...estimates, record],
      approvalStatus: 'Pending',
      status: 'Estimate Pending'
    });
  };

  const setEstimateApproval = async (estimateId, approvalStatus) => {
    const nextEstimates = estimates.map((item) => item.id === estimateId
      ? {
          ...item,
          approvalStatus,
          approvedBy: approvalStatus === 'Approved' ? job.customerName : null,
          approvedAt: approvalStatus === 'Approved' ? new Date().toLocaleString('en-IN') : null
        }
      : item
    );

    await persist({
      estimates: nextEstimates,
      approvalStatus,
      status: approvalStatus === 'Approved' ? 'Approved' : 'Estimate Pending'
    });
  };

  const addTechnicianUpdate = async (presetType) => {
    const note = updateNote.trim() || presetType;
    if (!note) return;

    const record = {
      id: `UPD-${Date.now()}`,
      staff: job.assignedEmployeeName || 'Current Technician',
      createdBy: job.assignedEmployeeName || 'Current Technician',
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: presetType || updateType,
      note,
      status: presetType === 'Work Started' ? 'In Progress' : job.status
    };

    const patch = { workUpdates: [record, ...updates] };
    if (presetType === 'Work Started' || presetType === 'Resume') patch.status = 'In Progress';
    await persist(patch);
    setUpdateNote('');
  };

  const defaultChecklist = [
    'Engine / Mechanical Check',
    'Fluid Levels',
    'Electrical / Warning Lights',
    'Brake & Tyre Check',
    'Road Test',
    'Cleaning & Final Presentation'
  ];

  const qcChecklist = qc.checklist?.length
    ? qc.checklist
    : defaultChecklist.map((item, index) => ({
        id: `QC-${index + 1}`,
        item,
        status: 'Pending',
        remark: ''
      }));

  const updateQcItem = async (itemId, status) => {
    await persist({
      qualityCheck: {
        ...qc,
        checklist: qcChecklist.map((item) => item.id === itemId ? { ...item, status } : item)
      }
    });
  };

  const completeQc = async (status) => {
    await persist({
      qualityCheck: {
        ...qc,
        inspector: qc.inspector === 'Unassigned' ? (job.serviceAdvisor || 'Workshop Supervisor') : qc.inspector,
        checkDate: new Date().toISOString().split('T')[0],
        checklist: qcChecklist,
        testDriveNotes: qcRoadTest,
        status
      },
      status: status === 'Pass' ? 'Ready for Delivery' : 'QC'
    });
  };

  const createInvoice = () => {
    const invoiceItems = [
      ...parts.map((item) => ({
        id: `ROW-${item.id}`,
        type: 'Stock Part',
        description: item.name || item.partName || 'Part',
        code: item.sku || item.partNo || '',
        qty: cleanNumber(item.qty || 1),
        purchasePrice: cleanNumber(item.purchasePrice || item.costPrice || 0),
        rate: cleanNumber(item.unitPrice || item.sellingPrice || 0),
        discount: 0,
        inventoryId: item.partId || ''
      })),
      ...outsidePurchases.map((item) => ({
        id: `ROW-${item.id}`,
        type: 'Outside Purchase',
        description: item.partName || item.name || 'Outside purchase',
        code: item.partNumber || item.billNo || '',
        qty: cleanNumber(item.qty || 1),
        purchasePrice: cleanNumber(item.purchasePrice || 0),
        rate: cleanNumber(item.sellingPrice || item.purchasePrice || 0),
        discount: 0,
        inventoryId: ''
      })),
      ...labourRecords.map((item) => ({
        id: `ROW-${item.id}`,
        type: 'Labour',
        description: item.service || 'Labour',
        code: '',
        qty: 1,
        purchasePrice: cleanNumber(item.internalCost || 0),
        rate: cleanNumber(item.customerCharge || cleanNumber(item.hours) * cleanNumber(item.rate)),
        discount: 0,
        inventoryId: ''
      }))
    ];

    localStorage.setItem('cubixgear:invoice-job-prefill', JSON.stringify({
      jobId: job.id,
      jobNumber: job.jobNumber || job.id,
      customer: {
        name: job.customerName || '',
        phone: job.customerPhone || '',
        address: job.customer?.address || ''
      },
      vehicle: {
        registration: job.vehicleReg || '',
        makeModel: job.vehicleInfo || '',
        odometer: job.kilometre || '',
        vin: job.vin || job.vehicle?.vin || ''
      },
      items: invoiceItems
    }));

    navigate(`/invoices/new?kind=invoice&jobId=${encodeURIComponent(job.id)}`);
  };

  const saveDelivery = async () => {
    const nextDelivery = {
      ...(job.delivery || {}),
      finalKm: deliveryForm.finalKm,
      acknowledgedBy: deliveryForm.customerSignature,
      notes: deliveryForm.warrantyNotes,
      deliveryTime: new Date().toLocaleString('en-IN'),
      readyStatus: 'Delivered'
    };

    await persist({
      delivery: nextDelivery,
      status: 'Delivered'
    });
  };

  const openTab = (key) => {
    navigate(`/jobs/${job.id}/${key}`);
  };

  if (loading) return <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">Loading job card…</div>;
  if (!job) return <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">Job card not found.</div>;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 pb-24 md:pb-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-secondary" onClick={() => navigate('/jobs')} aria-label="Back">
            <ArrowLeft size={18}/>
          </button>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.12em] text-primary">Job Card</div>
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-content">{job.jobNumber || job.id}</h1>
            <p className="mt-1 text-xs text-muted">{job.vehicleReg} · {job.vehicleInfo || 'Vehicle'} · {job.customerName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={job.status || 'New'}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
            className="h-10 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-content"
          >
            {JOB_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          <button onClick={createInvoice} className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white">
            <ReceiptText size={15}/>Create Invoice
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        {[
          ['Customer', job.customerName || 'Walk-in'],
          ['KM', job.kilometre || '—'],
          ['Fuel', job.fuelLevel || '—'],
          ['Technician', job.assignedEmployeeName || 'Unassigned'],
          ['Estimate', latestEstimate ? money.format(latestEstimate.grandTotal || 0) : 'Not created'],
          ['Payment', job.paymentStatus || 'Pending']
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-2xl border border-line bg-surface p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
            <div className="mt-1 truncate text-sm font-extrabold text-content">{value}</div>
          </div>
        ))}
      </section>

      <nav className="flex w-full gap-1.5 overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => openTab(key)}
            className={[
              'h-10 shrink-0 rounded-xl border-0 px-3 text-xs font-semibold transition',
              activeTab === key ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-secondary hover:bg-surface-2 hover:text-content'
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </nav>

      {error ? <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600">{error}</div> : null}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-content"><UserRound size={16} className="text-primary"/>Customer & Vehicle</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Info label="Customer" value={job.customerName}/>
              <Info label="Phone" value={job.customerPhone}/>
              <Info label="Registration" value={job.vehicleReg}/>
              <Info label="Make / Model" value={job.vehicleInfo}/>
              <Info label="VIN / Chassis" value={job.vin || job.vehicle?.vin || '—'}/>
              <Info label="Service Type" value={job.serviceType || '—'}/>
              <Info label="Check-In" value={job.checkInTime || job.createdDate}/>
              <Info label="Branch" value={job.branch}/>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-content"><Wrench size={16} className="text-primary"/>Assignment</div>
            <label className="mt-4 block text-xs font-semibold text-secondary">Assigned Technician
              <select value={job.assignedEmployeeId || ''} onChange={(e) => assignTechnician(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-content">
                <option value="">Unassigned</option>
                {staff.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.designation}</option>)}
              </select>
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Info label="Service Advisor" value={job.serviceAdvisor || '—'}/>
              <Info label="Priority" value={job.priority || 'Medium'}/>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4 xl:col-span-2">
            <div className="flex items-center gap-2 text-sm font-extrabold text-content"><History size={16} className="text-primary"/>Vehicle Service History</div>
            {!vehicleHistory.length ? (
              <div className="mt-3 rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted">No previous job cards for this registration.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {vehicleHistory.slice(0, 6).map((item) => (
                  <button key={item.id} onClick={() => navigate(`/jobs/${item.id}/overview`)} className="rounded-xl border border-line bg-surface-2 p-3 text-left">
                    <div className="text-xs font-extrabold text-content">{item.jobNumber}</div>
                    <div className="mt-1 text-[10px] text-muted">{item.createdDate} · {item.status}</div>
                    <div className="mt-2 line-clamp-2 text-[11px] text-secondary">{item.complaints?.[0]?.description || 'Service / repair visit'}</div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'complaints' && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">Customer Complaints</div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder="Add complaint exactly as customer explains it..." className="min-h-20 flex-1 rounded-xl border border-line bg-surface-2 p-3 text-sm text-content"/>
            <button onClick={addComplaint} disabled={!complaintText.trim() || saving} className="h-11 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white"><Plus size={15} className="inline"/> Add Complaint</button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {complaints.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-content">{item.description}</div>
                  <div className="mt-1 text-[10px] text-muted">{item.relatedService || 'Not linked to work item'}</div>
                </div>
                <select value={item.status || 'Open'} onChange={(e) => updateComplaintStatus(item.id, e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[11px] font-semibold text-content">
                  <option>Open</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
            ))}
            {!complaints.length ? <Empty text="No customer complaints recorded."/> : null}
          </div>
        </section>
      )}

      {activeTab === 'inspection' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Vehicle Inspection</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Info label="Existing Damage" value={(job.existingDamage || []).join(', ') || 'None recorded'}/>
              <Info label="Accessories" value={(job.accessories || []).join(', ') || 'None recorded'}/>
              <Info label="Fuel Level" value={job.fuelLevel || '—'}/>
              <Info label="Vehicle Photos" value={`${job.photos?.length || 0} uploaded`}/>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              {['Tyres','Warning Lights','Battery','Engine Oil','Coolant','Brake Fluid'].map((item) => (
                <div key={item} className="rounded-xl border border-line bg-surface-2 p-3"><strong className="text-content">{item}</strong><div className="mt-1 text-muted">Inspect & record</div></div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Add Finding</div>
            <form onSubmit={addFinding} className="mt-3 grid grid-cols-1 gap-3">
              <input value={finding.description} onChange={(e)=>setFinding({...finding,description:e.target.value})} placeholder="Finding / issue" className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
              <div className="grid grid-cols-2 gap-2">
                <select value={finding.severity} onChange={(e)=>setFinding({...finding,severity:e.target.value})} className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm text-content">
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
                <input inputMode="decimal" value={finding.estimatedCost} onChange={(e)=>setFinding({...finding,estimatedCost:e.target.value})} placeholder="Estimated cost ₹" className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
              </div>
              <input value={finding.recommendedAction} onChange={(e)=>setFinding({...finding,recommendedAction:e.target.value})} placeholder="Recommended action" className="h-11 rounded-xl border border-line bg-surface-2 px-3 text-sm text-content"/>
              <button disabled={saving} className="h-10 rounded-xl border-0 bg-primary text-xs font-bold text-white">Save Finding</button>
            </form>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4 xl:col-span-2">
            <div className="text-sm font-extrabold text-content">Inspection Findings</div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {findings.map((item)=>(
                <div key={item.id} className="rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-content">{item.description}</strong>
                    <span className="rounded-full bg-primary-soft px-2 py-1 text-[9px] font-bold text-primary">{item.severity}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-secondary">{item.recommendedAction || 'No recommendation'}</div>
                  <div className="mt-2 text-xs font-bold text-content">{money.format(item.estimatedCost || 0)}</div>
                </div>
              ))}
              {!findings.length ? <Empty text="No inspection findings."/> : null}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'work' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Labour & Work Items</div>
            <div className="mt-3 flex flex-col gap-2">
              {labourRecords.map((item)=>(
                <div key={item.id} className="rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-content">{item.service}</div>
                      <div className="mt-1 text-[10px] text-muted">{item.mechanicName || 'Unassigned'} · Estimated {item.estimatedHours || 0}h · Actual {item.hours || 0}h</div>
                    </div>
                    <strong className="text-xs text-primary">{money.format(item.customerCharge || 0)}</strong>
                  </div>
                </div>
              ))}
              {!labourRecords.length ? <Empty text="No labour entries yet."/> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Add Labour</div>
            <form onSubmit={addLabour} className="mt-3 flex flex-col gap-2">
              <input value={labour.service} onChange={(e)=>setLabour({...labour,service:e.target.value})} placeholder="Labour / work item" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
              <select value={labour.mechanicName} onChange={(e)=>setLabour({...labour,mechanicName:e.target.value})} className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
                <option value="">Technician</option>
                {staff.map((item)=><option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input inputMode="decimal" value={labour.estimatedHours} onChange={(e)=>setLabour({...labour,estimatedHours:e.target.value})} placeholder="Est. hours" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
                <input inputMode="decimal" value={labour.hours} onChange={(e)=>setLabour({...labour,hours:e.target.value})} placeholder="Actual hours" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input inputMode="decimal" value={labour.rate} onChange={(e)=>setLabour({...labour,rate:e.target.value})} placeholder="Rate / hour ₹" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
                <input inputMode="decimal" value={labour.internalCost} onChange={(e)=>setLabour({...labour,internalCost:e.target.value})} placeholder="Internal cost ₹" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
              </div>
              <button disabled={saving} className="h-10 rounded-xl border-0 bg-primary text-xs font-bold text-white">Add Labour</button>
            </form>
          </section>
        </div>
      )}

      {activeTab === 'parts' && (
        <JobPartsWorkflow jobId={job.id} assignedTo={job.assignedEmployeeName || ''} onJobUpdated={load}/>
      )}

      {activeTab === 'estimate' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Estimate History</div>
            <div className="mt-3 flex flex-col gap-2">
              {estimates.map((item)=>(
                <div key={item.id || item.version} className="rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-content">{item.version}</div>
                      <div className="mt-1 text-[10px] text-muted">{item.date}</div>
                    </div>
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold text-primary">{item.approvalStatus}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-secondary">
                    <div>Parts <strong className="float-right text-content">{money.format(item.partsTotal || 0)}</strong></div>
                    <div>Labour <strong className="float-right text-content">{money.format(item.servicesTotal || 0)}</strong></div>
                    <div>Tax <strong className="float-right text-content">{money.format(item.taxAmount || 0)}</strong></div>
                    <div>Discount <strong className="float-right text-content">{money.format(item.discount || 0)}</strong></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <strong className="text-sm text-content">{money.format(item.grandTotal || 0)}</strong>
                    {item.approvalStatus === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={()=>setEstimateApproval(item.id,'Approved')} className="h-8 rounded-lg border-0 bg-emerald-600 px-3 text-[10px] font-bold text-white">Approve</button>
                        <button onClick={()=>setEstimateApproval(item.id,'Rejected')} className="h-8 rounded-lg border-0 bg-red-500 px-3 text-[10px] font-bold text-white">Reject</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {!estimates.length ? <Empty text="No estimate created yet."/> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Current Estimate</div>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <AmountRow label="Parts" value={partsTotal}/>
              <AmountRow label="Outside Purchase" value={outsideTotal}/>
              <AmountRow label="Labour" value={labourTotal}/>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <label className="text-[10px] font-semibold text-muted">Tax %
                  <input inputMode="decimal" value={estimateTax} onChange={(e)=>setEstimateTax(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line bg-surface-2 px-2 text-xs text-content"/>
                </label>
                <label className="text-[10px] font-semibold text-muted">Discount ₹
                  <input inputMode="decimal" value={estimateDiscount} onChange={(e)=>setEstimateDiscount(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-line bg-surface-2 px-2 text-xs text-content"/>
                </label>
              </div>
              <AmountRow label="Tax" value={estimateTaxAmount}/>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-primary-soft p-3">
                <span className="text-xs font-bold text-primary">Estimated Total</span>
                <strong className="text-lg text-content">{money.format(estimateGrandTotal)}</strong>
              </div>
              <button onClick={()=>createEstimate('Estimate')} className="mt-2 h-10 rounded-xl border-0 bg-primary text-xs font-bold text-white">Create Estimate</button>
              <button onClick={()=>createEstimate('Additional Work')} className="h-10 rounded-xl border border-line bg-surface text-xs font-bold text-content">Additional Work Approval</button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'updates' && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-content">Technician Updates</div>
              <div className="mt-1 text-xs text-muted">Track work start, pause/resume, notes, photos and completion.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Work Started','Pause','Resume','Completed Work'].map((type)=>(
                <button key={type} onClick={()=>addTechnicianUpdate(type)} className="h-9 rounded-xl border border-line bg-surface-2 px-3 text-[11px] font-semibold text-content">{type}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
            <select value={updateType} onChange={(e)=>setUpdateType(e.target.value)} className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
              <option>Work Update</option><option>Inspection</option><option>Parts Update</option><option>Customer Update</option><option>Issue Found</option>
            </select>
            <input value={updateNote} onChange={(e)=>setUpdateNote(e.target.value)} placeholder="Technician note..." className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
            <button onClick={()=>addTechnicianUpdate(updateType)} disabled={!updateNote.trim()} className="h-10 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white">Add Update</button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {updates.map((item)=>(
              <div key={item.id} className="rounded-xl border border-line bg-surface-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs text-content">{item.type || 'Update'}</strong>
                  <span className="text-[10px] text-muted">{item.time || new Date(item.createdAt || Date.now()).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 text-[11px] text-secondary">{item.note}</div>
                <div className="mt-1 text-[10px] text-muted">{item.staff || item.createdBy || 'Staff'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'qc' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-content"><ShieldCheck size={16} className="text-primary"/>Quality Check</div>
            <div className="mt-3 flex flex-col gap-2">
              {qcChecklist.map((item)=>(
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3">
                  <span className="text-xs font-semibold text-content">{item.item}</span>
                  <select value={item.status || 'Pending'} onChange={(e)=>updateQcItem(item.id,e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[10px] font-bold text-content">
                    <option>Pending</option><option>Pass</option><option>Fail</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Road Test & Result</div>
            <textarea value={qcRoadTest} onChange={(e)=>setQcRoadTest(e.target.value)} rows={5} placeholder="Road test notes / issues found..." className="mt-3 min-h-28 w-full rounded-xl border border-line bg-surface-2 p-3 text-xs text-content"/>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={()=>completeQc('Pass')} className="h-10 rounded-xl border-0 bg-emerald-600 text-xs font-bold text-white">QC Passed</button>
              <button onClick={()=>completeQc('Rework Required')} className="h-10 rounded-xl border-0 bg-red-500 text-xs font-bold text-white">QC Failed</button>
            </div>
            <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-secondary">Current: <strong className="text-content">{qc.status || 'Pending'}</strong></div>
          </section>
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-content"><FileText size={16} className="text-primary"/>Invoice & Payment</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Info label="Invoice No" value={job.billing?.invoiceNumber || 'Not generated'}/>
              <Info label="Invoice Total" value={money.format(job.billing?.invoiceTotal || latestEstimate?.grandTotal || 0)}/>
              <Info label="Paid" value={money.format(job.billing?.paidAmount || 0)}/>
              <Info label="Balance" value={money.format(job.billing?.outstandingBalance || 0)}/>
              <Info label="Payment Status" value={job.paymentStatus || 'Pending'}/>
              <Info label="Method" value={job.billing?.paymentMethod || '—'}/>
            </div>
            <button onClick={createInvoice} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white"><ReceiptText size={15}/>Create / Open Invoice</button>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="text-sm font-extrabold text-content">Delivery</div>
            <div className="mt-3 flex flex-col gap-2">
              <input value={deliveryForm.finalKm} onChange={(e)=>setDeliveryForm({...deliveryForm,finalKm:e.target.value})} placeholder="Final KM" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
              <input value={deliveryForm.customerSignature} onChange={(e)=>setDeliveryForm({...deliveryForm,customerSignature:e.target.value})} placeholder="Customer acknowledgement / signature name" className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
              <textarea rows={4} value={deliveryForm.warrantyNotes} onChange={(e)=>setDeliveryForm({...deliveryForm,warrantyNotes:e.target.value})} placeholder="Warranty / service notes" className="rounded-xl border border-line bg-surface-2 p-3 text-xs text-content"/>
              <button onClick={saveDelivery} className="h-10 rounded-xl border-0 bg-emerald-600 text-xs font-bold text-white">Mark Delivered</button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'activity' && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-sm font-extrabold text-content">Job Activity</div>
          <div className="mt-4 border-l border-line pl-4">
            {[...timeline, ...updates.map((item)=>({
              time: item.time || new Date(item.createdAt || Date.now()).toLocaleString('en-IN'),
              title: item.type || 'Work Update',
              desc: item.note
            }))].map((item,index)=>(
              <div key={`${item.time}-${index}`} className="relative pb-5">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-surface"/>
                <div className="text-[10px] font-semibold text-muted">{item.time}</div>
                <div className="mt-1 text-xs font-extrabold text-content">{item.title}</div>
                <div className="mt-1 text-[11px] text-secondary">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-line bg-surface px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 md:hidden">
        <MobileAction icon={Wrench} label="Work" onClick={()=>openTab('work')}/>
        <MobileAction icon={PackageSearch} label="Parts" onClick={()=>openTab('parts')}/>
        <MobileAction icon={ShieldCheck} label="QC" onClick={()=>openTab('qc')}/>
        <MobileAction icon={FileText} label="Invoice" onClick={()=>openTab('invoice')}/>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 p-3">
      <div className="text-[10px] font-semibold text-muted">{label}</div>
      <div className="mt-1 break-words text-xs font-bold text-content">{value || '—'}</div>
    </div>
  );
}

function AmountRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2">
      <span className="text-secondary">{label}</span>
      <strong className="text-content">{money.format(value || 0)}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted"><Clock3 size={16} className="mx-auto mb-2"/>{text}</div>;
}

function MobileAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 border-0 bg-transparent py-1 text-[10px] font-bold text-secondary">
      <Icon size={18}/><span>{label}</span>
    </button>
  );
}

export default JobCardWorkspace;
