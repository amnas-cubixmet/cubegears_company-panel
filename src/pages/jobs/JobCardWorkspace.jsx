import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  Star,
  Trash2,
  UserRound,
  Wrench,
  ChevronRight,
  ChevronDown,
  LockKeyhole
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { billingService } from '../../services/billing.service';
import { paymentService } from '../../services/payment.service';
import { USE_MOCK_API } from '../../api/apiConfig';
import { staffService } from '../../services/staff.service';
import { JobPartsWorkflow } from './JobPartsWorkflow';
import { JobInspectionPanel } from '../../components/jobs/JobInspectionPanel';
import { JobWorkerAssignments } from '../../components/jobs/JobWorkerAssignments';
import { OutsideLabourPanel } from '../../components/jobs/OutsideLabourPanel';
import { JobWorkTimerPanel } from '../../components/jobs/JobWorkTimerPanel';
import { jobDisplayLabel } from '../../components/jobs/jobs.utils';
import { JobBreadcrumbs } from '../../components/jobs/JobBreadcrumbs';

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

const normalizeJobStatus = (status) => {
  if (status === 'Checked In') return 'New';
  if (status === 'Awaiting Approval') return 'Estimate Pending';
  if (status === 'Quality Check') return 'QC';
  return JOB_STATUSES.includes(status) ? status : 'New';
};

const INSPECTION_CHECKS = ['Tyres', 'Warning Lights', 'Battery', 'Engine Oil', 'Coolant', 'Brake Fluid'];

const TABS = [
  ['overview', 'Overview'],
  ['complaints', 'Complaints'],
  ['inspection', 'Inspection'],
  ['estimate', 'Estimate'],
  ['work', 'Work & Labour'],
  ['parts', 'Parts'],
  ['updates', 'Technician Updates'],
  ['qc', 'QC'],
  ['invoice', 'Invoice'],
  ['activity', 'Activity']
];

const SECTION_DETAILS = {
  overview: 'Customer, vehicle and technician at a glance.',
  complaints: 'Customer concerns and work requests.',
  inspection: 'Vehicle checks and inspection findings.',
  estimate: 'Labour, parts, estimates and customer approval.',
  work: 'Technician assignments and workshop work.',
  parts: 'Spare parts request, issue and usage.',
  updates: 'Technician notes and work updates.',
  qc: 'Quality inspection and final checks.',
  invoice: 'Invoice, payments, balance and delivery.',
  activity: 'Job Card activity and recorded events.'
};
const GUIDED_STAGES = ['overview', 'inspection', 'estimate', 'work', 'qc', 'invoice'];

const TAB_ICONS = {
  overview: Gauge,
  complaints: FileText,
  inspection: ShieldCheck,
  estimate: ReceiptText,
  work: Wrench,
  parts: PackageSearch,
  updates: History,
  qc: CheckCircle2,
  invoice: ReceiptText,
  activity: Clock3,
};

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
  const workflowTabsRef = useRef(null);
  const moreStepsRef = useRef(null);

  const [job, setJob] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [jobInvoices, setJobInvoices] = useState([]);
  const [jobPayments, setJobPayments] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [staff, setStaff] = useState([]);
  const [timerRefreshVersion, setTimerRefreshVersion] = useState(0);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Cash'
  });
  const [feedbackRating, setFeedbackRating] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const activeTab = useMemo(() => {
    const section = location.pathname.split('/').filter(Boolean).at(-1);
    return TABS.some(([key]) => key === section) ? section : 'overview';
  }, [location.pathname]);

  useEffect(() => {
    const rail = workflowTabsRef.current;
    const activeButton = rail?.querySelector('[aria-current="step"]');
    if (!rail || !activeButton || rail.scrollWidth <= rail.clientWidth) return;
    const left = activeButton.offsetLeft - rail.offsetLeft - (rail.clientWidth - activeButton.clientWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: 'instant' });
  }, [activeTab]);

  const loadBilling = async () => {
    if (!id) return;
    setBillingLoading(true);
    setBillingError('');
    try {
      const invoiceResponse = await billingService.list({ jobId: id });
      const allInvoices = Array.isArray(invoiceResponse) ? invoiceResponse : invoiceResponse?.results || [];
      const related = allInvoices.filter((row) =>
        (row.kind || 'invoice') === 'invoice' &&
        (String(row.sourceJobId || '') === String(id) ||
         (job?.jobNumber && String(row.jobCardNo || '') === String(job.jobNumber)))
      ).sort((a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));
      const current = related.find((row) => row.status !== 'Cancelled') || related[0];
      const paymentResponse = current ? await paymentService.getPayments({ invoice: current.id }) : [];
      const allPayments = Array.isArray(paymentResponse) ? paymentResponse : paymentResponse?.results || [];
      setJobInvoices(related);
      setJobPayments(allPayments.filter((row) => String(row.invoice || '') === String(current?.id))
        .sort((a, b) => String(b.created_at || b.date || '').localeCompare(String(a.created_at || a.date || ''))));
    } catch (requestError) {
      setBillingError(requestError?.message || 'Unable to load invoice and payment records.');
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'invoice' && job?.id) loadBilling();
  }, [activeTab, job?.id, job?.jobNumber]);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [data, staffData, flow] = await Promise.all([
        jobService.getJobById(id),
        staffService.getStaff(),
        jobService.getJobWorkflow(id)
      ]);

      setJob(data || null);
      setWorkflow(flow || null);
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
      setPaymentForm((old) => ({
        ...old,
        amount: '',
        method: data?.billing?.paymentMethod || old.method || 'Cash'
      }));
      setFeedbackRating(
        data?.customerRating || data?.customer_rating || ''
      );
      setFeedbackText(
        data?.customerFeedback || data?.customer_feedback || ''
      );
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

  const assignTechnician = async (staffId) => {
    const selected = staff.find((item) => String(item.id) === String(staffId));

    if (USE_MOCK_API) {
      await persist({
        assignedEmployeeId: selected?.id || '',
        assignedEmployeeName: selected?.name || ''
      });
      return;
    }

    await persist({
      technician: selected?.user || null
    });
  };

  const complaints = job?.complaints || job?.customerComplaints || [];
  const findings = job?.inspection?.findings || job?.vehicleInspection?.findings || job?.inspectionFindings || [];
  const inspectionChecks = job?.inspection?.checklist || {};
  const labourRecords = USE_MOCK_API ? (job?.labourRecords || []) : (job?.work || []);
  const parts = job?.partsUsed || [];
  const outsidePurchases = job?.outsidePurchases || [];
  const estimates = (job?.estimates || [])
    .map((item) => ({
      ...item,
      approvalStatus: item.approvalStatus || (item.status === 'Draft' ? 'Pending' : item.status),
      grandTotal: item.grandTotal ?? item.total,
      taxAmount: item.taxAmount ?? item.tax,
      version: USE_MOCK_API ? item.version : 'Estimate V' + (item.version || 1)
    }))
    .sort((a, b) => String(a.created_at || a.date || '').localeCompare(String(b.created_at || b.date || '')));
  const updates = job?.workUpdates || [];
  const timeline = job?.timeline || [];
  const qc = (USE_MOCK_API ? job?.qualityCheck : job?.qc) || {
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
  const linkedInvoice = jobInvoices.find((row) => row.status !== 'Cancelled') || null;
  const invoiceTotal = linkedInvoice
    ? cleanNumber(linkedInvoice.total)
    : (USE_MOCK_API ? cleanNumber(job?.billing?.invoiceTotal || latestEstimate?.grandTotal || 0) : 0);
  const invoicePaid = linkedInvoice ? cleanNumber(linkedInvoice.paid) : cleanNumber(job?.billing?.paidAmount || 0);
  const invoiceBalance = Math.max(0, linkedInvoice ? cleanNumber(linkedInvoice.balance ?? (invoiceTotal - invoicePaid)) : invoiceTotal - invoicePaid);
  const invoicePaymentStatus = linkedInvoice
    ? (invoiceTotal <= 0 ? 'No amount due' : invoiceBalance <= 0 ? 'Paid' : invoicePaid > 0 ? 'Partially Paid' : 'Unpaid')
    : (USE_MOCK_API ? job?.paymentStatus || 'Pending' : 'Not invoiced');


  // The backend workflow endpoint is the single source of truth for
  // persisted completion; visual checks below cover auxiliary sections only.
  const coreStages = workflow?.stages || GUIDED_STAGES;
  const coreCompleted = workflow?.completed || [];
  const sectionComplete = {
    overview: coreCompleted.includes('overview'),
    inspection: coreCompleted.includes('inspection'),
    estimate: coreCompleted.includes('estimate'),
    work: coreCompleted.includes('work'),
    qc: coreCompleted.includes('qc'),
    invoice: coreCompleted.includes('invoice'),
    complaints: complaints.length > 0,
    parts: parts.length > 0 || outsidePurchases.length > 0,
    updates: updates.length > 0,
    activity: true
  };
  const currentStage = workflow?.current || 'overview';
  const isSectionLocked = (key) => {
    if (!workflow) return false;
    if (coreStages.includes(key)) return workflow.locked?.includes(key) || false;
    if (key === 'complaints') return false;
    if (key === 'parts') {
      // Parts can be prepared when the Estimate stage opens.
      return ['overview', 'inspection'].includes(currentStage);
    }
    if (key === 'updates') {
      return ['overview', 'inspection', 'estimate'].includes(currentStage);
    }
    return false;
  };
  // One compact main workflow for every Job Card route. Supporting sections
  // remain accessible from More without becoming required approval stages.
  const visibleTabs = TABS.filter(([key]) => GUIDED_STAGES.includes(key));
  const extraTabs = TABS.filter(([key]) => !GUIDED_STAGES.includes(key));
  const activeExtraTab = extraTabs.some(([key]) => key === activeTab);
  const visibleTabIndex = visibleTabs.findIndex(([key]) => key === activeTab);
  const nextVisibleTab = visibleTabs[visibleTabIndex + 1] || null;
  const activeTabComplete = Boolean(sectionComplete[activeTab]);
  const activeTabLocked = isSectionLocked(activeTab);
  const ActiveSectionIcon = TAB_ICONS[activeTab] || FileText;
  const activeTabLabel = TABS.find(([key]) => key === activeTab)?.[1] || 'Overview';

  useEffect(() => {
    if (!job?.id || !workflow) return;
    const pieces = location.pathname.split('/').filter(Boolean);
    const requested = pieces.length > 2 ? pieces[2] : null;
    const supported = TABS.some(([key]) => key === requested);
    if (!supported || isSectionLocked(requested)) {
      navigate('/jobs/' + job.id + '/' + currentStage, { replace: true });
    }
  }, [job?.id, workflow, location.pathname, currentStage, navigate]);

  const refreshJobWorkflow = async (advanceFrom = null) => {
    const [updated, flow] = await Promise.all([
      jobService.getJobById(id),
      jobService.getJobWorkflow(id)
    ]);
    setJob(updated);
    setWorkflow(flow);
    if (advanceFrom && flow.current !== advanceFrom) {
      navigate('/jobs/' + id + '/' + flow.current, { replace: true });
    }
    return flow;
  };

  const completeStage = async (stage) => {
    if (!workflow || saving) return;
    const options = {};
    if (stage === 'estimate') {
      if (!window.confirm('Confirm that the customer approved the latest estimate?')) return;
      options.approveEstimate = true;
    }
    if (stage === 'work') {
      if (!window.confirm('Confirm all work is finished and mechanic timers are stopped?')) return;
      options.confirmWorkDone = true;
    }
    setSaving(true);
    setError('');
    try {
      const result = await jobService.completeJobStage(job.id, stage, options);
      if (result.job) setJob(result.job);
      setWorkflow(result);
      if (result.current && result.current !== stage) {
        navigate('/jobs/' + job.id + '/' + result.current, { replace: true });
      }
    } catch (e) {
      const details = e?.response?.data;
      setError(details?.stage || details?.message || e?.message || 'Unable to complete this stage.');
    } finally {
      setSaving(false);
    }
  };

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

  const updateInspectionCheck = async (item, status) => {
    await persist({
      inspection: {
        ...(job.inspection || {}),
        checklist: { ...inspectionChecks, [item]: status },
      },
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

    const updated = await persist(USE_MOCK_API
      ? { labourRecords: [...labourRecords, record] }
      : { work: [...labourRecords, record] });
    if (updated) setLabour(blankLabour());
  };

  const createEstimate = async (kind = 'Estimate') => {
    const nextVersion = estimates.length + 1;
    if (!USE_MOCK_API) {
      setSaving(true);
      setError('');
      try {
        await jobService.createJobEstimate(job.id, {
          version: nextVersion,
          status: 'Draft',
          items: [{ description: kind, quantity: 1 }],
          subtotal: estimateSubtotal.toFixed(2),
          tax: estimateTaxAmount.toFixed(2),
          total: estimateGrandTotal.toFixed(2)
        });
        await refreshJobWorkflow();
      } catch (e) {
        setError(e?.response?.data?.detail || e?.message || 'Estimate could not be created.');
      } finally {
        setSaving(false);
      }
      return;
    }
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

  const setEstimateApproval = async (estimateKey, approvalStatus) => {
    if (!USE_MOCK_API) {
      if (approvalStatus === 'Approved') return completeStage('estimate');
      setSaving(true);
      setError('');
      try {
        await jobService.rejectJobEstimate(job.id, estimateKey);
        await refreshJobWorkflow();
      } catch (e) {
        setError(e?.response?.data?.detail || e?.message || 'Estimate decision could not be saved.');
      } finally {
        setSaving(false);
      }
      return;
    }
    const nextEstimates = estimates.map((item) => (item.id || item.version) === estimateKey
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

  const addPhoto = async (file, stage = 'Inspection') => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const record = {
        id: `PH-${Date.now()}`,
        stage,
        url: reader.result,
        caption: `${stage} photo`,
        uploadedBy: job.assignedEmployeeName || job.serviceAdvisor || 'Current User',
        timestamp: new Date().toLocaleString('en-IN')
      };

      await persist({ photos: [record, ...(job.photos || [])] });
    };
    reader.readAsDataURL(file);
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
    ? qc.checklist.map((item, index) => ({
        ...item,
        id: item.id || `QC-${index + 1}`
      }))
    : defaultChecklist.map((item, index) => ({
        id: `QC-${index + 1}`,
        item,
        status: 'Pending',
        remark: ''
      }));

  const updateQcItem = async (itemId, status) => {
    const update = {
      ...qc,
      checklist: qcChecklist.map((item) => item.id === itemId ? { ...item, status } : item)
    };
    await persist(USE_MOCK_API ? { qualityCheck: update } : { qc: update });
  };

  const completeQc = async (status) => {
    if (status === 'Pass' && qcChecklist.some((item) => item.status !== 'Pass')) {
      setError('Mark every Quality Check item as Pass before completing this stage.');
      return;
    }
    const result = {
      ...qc,
      inspector: qc.inspector === 'Unassigned' ? (job.serviceAdvisor || 'Workshop Supervisor') : qc.inspector,
      checkDate: new Date().toISOString().split('T')[0],
      checklist: qcChecklist,
      testDriveNotes: qcRoadTest,
      status
    };
    const updated = await persist(USE_MOCK_API
      ? { qualityCheck: result, status: status === 'Pass' ? 'Ready for Delivery' : 'QC' }
      : { qc: result });
    if (updated && status === 'Pass') await completeStage('qc');
  };

  const saveCustomerFeedback = async () => {
    const rating = Number(feedbackRating || 0);
    if (rating < 1 || rating > 5) {
      setError('Customer feedback rating must be between 1 and 5.');
      return;
    }

    const updated = await persist({
      customerRating: rating,
      customerFeedback: feedbackText.trim()
    });

    if (updated) {
      setFeedbackRating(updated.customerRating || rating);
      setFeedbackText(updated.customerFeedback || feedbackText.trim());
    }
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

  const recordPayment = async (event) => {
    event.preventDefault();

    const paymentAmount = cleanNumber(paymentForm.amount);
    if (paymentAmount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    if (invoiceTotal <= 0) {
      setError('Create an estimate or invoice before recording payment.');
      return;
    }

    if (paymentAmount > invoiceBalance) {
      setError('Payment cannot exceed the outstanding invoice balance.');
      return;
    }

    if (!USE_MOCK_API) {
      if (!linkedInvoice?.id || !job?.customerId) {
        setError('Create an invoice linked to this Job Card before recording payment.');
        return;
      }
      setSaving(true);
      setError('');
      try {
        const today = new Date();
        const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
        await paymentService.createPayment({
          invoice: linkedInvoice.id,
          customer: job.customerId,
          date,
          amount: paymentAmount.toFixed(2),
          method: paymentForm.method
        });
        setPaymentForm((old) => ({ ...old, amount: '' }));
        await loadBilling();
      } catch (requestError) {
        setError(requestError?.message || 'Payment could not be recorded.');
      } finally {
        setSaving(false);
      }
      return;
    }

    const currentPaid = cleanNumber(job.billing?.paidAmount || 0);
    const paidAmount = Math.min(invoiceTotal, currentPaid + paymentAmount);
    const outstandingBalance = Math.max(0, invoiceTotal - paidAmount);
    const paymentStatus = paidAmount <= 0
      ? 'Pending'
      : outstandingBalance <= 0
        ? 'Paid'
        : 'Partial';

    const paymentEntry = {
      id: `PAY-${Date.now()}`,
      amount: paymentAmount,
      method: paymentForm.method,
      date: new Date().toLocaleString('en-IN')
    };

    await persist({
      paymentStatus,
      billing: {
        ...(job.billing || {}),
        invoiceTotal,
        paidAmount,
        outstandingBalance,
        paymentMethod: paymentForm.method,
        payments: [paymentEntry, ...(job.billing?.payments || [])]
      }
    });

    setPaymentForm((old) => ({ ...old, amount: '' }));
  };

  const saveDelivery = async () => {
    if (!USE_MOCK_API) {
      await completeStage('invoice');
      return;
    }
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
    if (isSectionLocked(key)) {
      setError('Complete the current Job Card stage to unlock this section.');
      return;
    }
    setError('');
    moreStepsRef.current?.removeAttribute('open');
    navigate(`/jobs/${job.id}/${key}`);
  };

  if (loading) return <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">Loading job card…</div>;
  if (!job) return (
    <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted" role={error ? 'alert' : undefined}>
      <p>{error || 'Job card not found.'}</p>
      {error && <button type="button" className="mt-3 rounded-lg border border-line px-4 py-2 text-content" onClick={load}>Retry</button>}
    </div>
  );

  return (
    <div className="job-management-page cg-job-detail job-workspace-dashboard flex w-full min-w-0 flex-col gap-4 pb-4">
      <JobBreadcrumbs current={TABS.find(([key]) => key === activeTab)?.[1] || "Overview"} jobLabel={jobDisplayLabel(job)} jobId={job.id} />
      <header className="job-detail-header flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-content">{jobDisplayLabel(job)}</h1>
            <p className="mt-1 text-xs text-muted">{job.vehicleReg} · {job.vehicleInfo || 'Vehicle'} · {job.customerName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'overview' ? (
            <span className="job-overview-status-badge">{normalizeJobStatus(job.status)}</span>
          ) : (
            <>
              <select
                aria-label="Job Card status"
                value={normalizeJobStatus(job.status)}
                disabled
                title="Status advances only when the current workflow stage is completed"
                className="h-10 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-content"
              >
                {JOB_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
              <button type="button" onClick={() => openTab('invoice')} className="inline-flex h-10 items-center gap-2 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white">
                <ReceiptText size={15}/>{linkedInvoice ? 'View Invoice' : 'Create Invoice'}
              </button>
            </>
          )}
        </div>
      </header>

      {activeTab !== 'overview' && (
        <>
      <div className="job-workspace-toolbar">
        <span>Current status <strong>{normalizeJobStatus(job.status)}</strong></span>
        <div className="job-workspace-toolbar-actions">
          <span className="job-workspace-lock-note"><LockKeyhole size={14} aria-hidden="true"/> Next stage unlocks on completion</span>
          <button type="button" onClick={() => setShowAdvanced((value) => !value)} aria-expanded={showAdvanced}>
            {showAdvanced ? 'Simple view' : 'Show all details'}
          </button>
        </div>
      </div>

      <section className="job-detail-summary grid grid-cols-2 gap-2 md:grid-cols-3">
        {[
          ['Customer', job.customerName || 'Walk-in'],
          ['KM', job.kilometre || '—'],
          ['Fuel', job.fuelLevel || '—'],
          ['Technician', job.assignedEmployeeName || 'Unassigned'],
          ['Estimate', latestEstimate ? money.format(latestEstimate.grandTotal || 0) : 'Not created'],
          ['Payment', job.paymentStatus || 'Pending']
        ].filter(([label]) => showAdvanced || ['Customer', 'Technician', 'Payment'].includes(label)).map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-2xl border border-line bg-surface p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
            <div className="mt-1 truncate text-sm font-extrabold text-content">{value}</div>
          </div>
        ))}
      </section>



        </>
      )}


      <div className="job-simple-step-nav" aria-label="Job Card sections">
        <nav ref={workflowTabsRef} className="job-detail-tabs job-workflow-tabs" aria-label="Main Job Card workflow">
          {visibleTabs.map(([key, label], index) => {
            const complete = Boolean(sectionComplete[key]);
            const locked = isSectionLocked(key);
            const isActive = activeTab === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => openTab(key)}
                disabled={locked}
                aria-current={isActive ? 'step' : undefined}
                className={['job-workflow-tab', isActive ? 'is-active' : '', complete ? 'is-complete' : '', locked ? 'is-locked' : ''].join(' ')}
                title={locked ? label + ' – complete the previous stage first' : label}
              >
                <span className="job-workflow-tab-number" aria-hidden="true">{index + 1}</span>
                <span className="job-workflow-tab-label">{label}</span>
                {locked ? (
                  <LockKeyhole size={13} className="job-workflow-tab-lock" aria-label="Locked" />
                ) : complete && !isActive ? (
                  <CheckCircle2 size={14} className="job-workflow-tab-check" aria-label="Completed" />
                ) : null}
              </button>
            );
          })}
        </nav>
        <details ref={moreStepsRef} className={['job-workflow-more', activeExtraTab ? 'has-active-step' : ''].join(' ')}>
          <summary aria-label={activeExtraTab ? 'More sections, current: ' + activeTabLabel : 'More Job Card sections'}>
            <span>More</span>
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div className="job-workflow-more-menu" aria-label="Additional Job Card sections">
            {extraTabs.map(([key, label]) => {
              const locked = isSectionLocked(key);
              const completed = Boolean(sectionComplete[key]);
              const ExtraIcon = TAB_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={locked}
                  onClick={() => openTab(key)}
                  aria-current={activeTab === key ? 'page' : undefined}
                  className={activeTab === key ? 'is-current' : ''}
                >
                  <ExtraIcon size={15} aria-hidden="true" />
                  <span>{label}</span>
                  {locked ? <LockKeyhole size={13} aria-label="Locked" /> : completed ? <CheckCircle2 size={13} aria-label="Completed" /> : null}
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {activeTab !== 'overview' && (
        <>
      <section className="job-workspace-section-bar" aria-label={activeTabLabel + ' section'}>
        <div className="job-workspace-section-icon"><ActiveSectionIcon size={17} aria-hidden="true"/></div>
        <div className="job-workspace-section-title">
          <h2>{activeTabLabel}</h2>
          <p>{SECTION_DETAILS[activeTab]}</p>
        </div>
        <span className={'job-workspace-section-state ' + (activeTabLocked ? 'is-locked' : activeTabComplete ? 'is-complete' : 'is-open')}>
          {activeTabLocked ? <LockKeyhole size={13} aria-hidden="true"/> : activeTabComplete ? <CheckCircle2 size={13} aria-hidden="true"/> : <Clock3 size={13} aria-hidden="true"/>}
          {activeTabLocked ? 'Locked' : activeTabComplete ? 'Complete' : 'In progress'}
        </span>
        {!activeTabLocked && !activeTabComplete && activeTab === currentStage && (
          <button type="button" className="job-stage-complete-button" disabled={saving} onClick={() => completeStage(activeTab)}>
            <CheckCircle2 size={15} aria-hidden="true" />
            {saving ? 'Saving…' : activeTab === 'estimate' ? 'Approve & Continue' : activeTab === 'work' ? 'Finish Work & Continue' : activeTab === 'invoice' ? 'Finish Job Card' : 'Complete & Continue'}
          </button>
        )}
      </section>

      <div className={'job-workflow-gate ' + (activeTabLocked ? 'is-locked' : activeTabComplete ? 'is-complete' : 'is-pending')}>
        <div>
          <strong>{activeTabLocked ? 'Stage locked' : activeTabComplete ? 'Section complete' : 'Section in progress'}</strong>
          <span>{'Complete each stage to unlock the next. Finished stages remain accessible.'}</span>
        </div>
        {nextVisibleTab && !activeTabLocked ? (
          <button type="button" disabled={saving || isSectionLocked(nextVisibleTab[0])} onClick={() => openTab(nextVisibleTab[0])}>
            Next: {nextVisibleTab[1]}
            {isSectionLocked(nextVisibleTab[0]) ? <LockKeyhole size={14} aria-hidden="true"/> : <ChevronRight size={14}/>}
          </button>
        ) : null}
      </div>

        </>
      )}

      {error ? <div role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600">{error}</div> : null}

      {activeTabLocked ? (
        <section className="job-workspace-locked-panel">
          <LockKeyhole size={24} aria-hidden="true" />
          <h3>{activeTabLabel} is locked</h3>
          <p>Complete the current required stage to unlock this section.</p>
          <button type="button" onClick={() => navigate('/jobs/' + job.id + '/' + currentStage, { replace: true })}>Go to current stage</button>
        </section>
      ) : (
        <>
      {activeTab === 'overview' && (
        <div className="job-overview-simple">
          <section className="job-overview-intro" aria-label="Job Card overview">
            <div className="job-overview-intro-copy">
              <span className="job-overview-eyebrow">Job Card · Step 1 of 6</span>
              <h2>Job Overview</h2>
              <p>Check the customer and vehicle details before starting inspection.</p>
            </div>
            <div className="job-overview-intro-actions">
              <button type="button" className="job-overview-secondary-action" onClick={() => setShowAdvanced((value) => !value)} aria-expanded={showAdvanced}>
                {showAdvanced ? 'Hide details' : 'More details'}
              </button>
              {sectionComplete.overview ? (
                <button type="button" className="job-overview-main-action" onClick={() => openTab(currentStage)}>
                  <CheckCircle2 size={16} aria-hidden="true" /> {currentStage === 'overview' ? 'Overview complete' : 'Go to current stage'}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              ) : (
                <button type="button" className="job-overview-main-action" onClick={() => completeStage('overview')} disabled={saving || activeTabLocked}>
                  <CheckCircle2 size={16} aria-hidden="true" /> {saving ? 'Saving…' : 'Complete & Continue'}
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </section>

          <div className="job-overview-primary-grid">
            <section className="job-overview-card" aria-labelledby="job-overview-customer-heading">
              <div className="job-overview-card-header">
                <span className="job-overview-card-icon"><UserRound size={18} aria-hidden="true"/></span>
                <div>
                  <h3 id="job-overview-customer-heading">Customer & Vehicle</h3>
                  <p>Basic job information</p>
                </div>
              </div>
              <dl className="job-overview-detail-grid">
                <div><dt>Customer name</dt><dd>{job.customerName || 'Not added'}</dd></div>
                <div><dt>Phone number</dt><dd>{job.customerPhone || 'Not added'}</dd></div>
                <div><dt>Vehicle number</dt><dd>{job.vehicleReg || 'Not added'}</dd></div>
                <div><dt>Make / Model</dt><dd>{job.vehicleInfo || 'Not added'}</dd></div>
                <div><dt>Service type</dt><dd>{job.serviceType || 'General Service'}</dd></div>
                <div><dt>Odometer (KM)</dt><dd>{job.kilometre ?? '—'}</dd></div>
              </dl>
            </section>

            <section className="job-overview-card" aria-labelledby="job-overview-assignment-heading">
              <div className="job-overview-card-header">
                <span className="job-overview-card-icon"><Wrench size={18} aria-hidden="true"/></span>
                <div>
                  <h3 id="job-overview-assignment-heading">Mechanic Assignment</h3>
                  <p>Select who will handle this job</p>
                </div>
              </div>
              <label className="job-overview-assignment-label" htmlFor="job-overview-technician">
                Assigned mechanic
              </label>
              <select
                id="job-overview-technician"
                value={job.assignedEmployeeId || ''}
                onChange={(event) => assignTechnician(event.target.value)}
                disabled={saving}
                className="job-overview-mechanic-select"
              >
                <option value="">Choose a mechanic (optional)</option>
                {staff.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {item.designation || 'Workshop staff'}</option>
                ))}
              </select>
              <div className="job-overview-assignment-foot">
                <div><span>Service advisor</span><strong>{job.serviceAdvisor || 'Not assigned'}</strong></div>
                <div><span>Priority</span><strong>{job.priority || 'Medium'}</strong></div>
              </div>
              <p className="job-overview-supporting-note">You can assign or change the mechanic later.</p>
            </section>
          </div>

          <section className="job-overview-complaint" aria-label="Customer complaint">
            <div>
              <h3><FileText size={17} aria-hidden="true"/> Customer complaint</h3>
              <p>{complaints[0]?.description || complaints[0]?.wording || 'No customer complaint added yet.'}</p>
              {complaints.length > 1 && <span>{complaints.length} complaints recorded</span>}
            </div>
            <button type="button" onClick={() => openTab('complaints')}>
              {complaints.length ? 'View complaints' : 'Add complaint'} <ChevronRight size={15} aria-hidden="true"/>
            </button>
          </section>

          {showAdvanced && (
            <section className="job-overview-more" aria-label="Additional job details">
              <h3>Additional details</h3>
              <dl className="job-overview-detail-grid">
                <div><dt>VIN / Chassis</dt><dd>{job.vin || job.vehicle?.vin || '—'}</dd></div>
                <div><dt>Fuel level</dt><dd>{job.fuelLevel || '—'}</dd></div>
                <div><dt>Check-in</dt><dd>{job.checkInTime || job.createdDate || '—'}</dd></div>
                <div><dt>Branch</dt><dd>{job.branch || '—'}</dd></div>
                <div><dt>Estimate</dt><dd>{latestEstimate ? money.format(latestEstimate.grandTotal || 0) : 'Not created'}</dd></div>
                <div><dt>Payment</dt><dd>{job.paymentStatus || 'Pending'}</dd></div>
              </dl>
              <div className="job-overview-more-grid">
                <div className="job-overview-feedback">
                  <h4><Star size={16} aria-hidden="true"/> Customer Feedback</h4>
                  <div className="job-overview-feedback-fields">
                    <label>Rating
                      <select value={feedbackRating} onChange={(event) => setFeedbackRating(event.target.value)}>
                        <option value="">Select rating</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very Good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </label>
                    <label>Customer comment
                      <input value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="Customer feedback"/>
                    </label>
                    <button type="button" onClick={saveCustomerFeedback} disabled={saving || !feedbackRating}>Save Feedback</button>
                  </div>
                </div>
                <div className="job-overview-history">
                  <h4><History size={16} aria-hidden="true"/> Vehicle Service History</h4>
                  {vehicleHistory.length === 0 ? (
                    <p>No previous service records for this vehicle.</p>
                  ) : (
                    vehicleHistory.slice(0, 5).map((item) => (
                      <button key={item.id} type="button" onClick={() => navigate(`/jobs/${item.id}`)}>
                        <span><strong>{jobDisplayLabel(item)}</strong><small>{item.createdDate || 'Previous visit'}</small></span>
                        <ChevronRight size={15} aria-hidden="true"/>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <section className="job-panel job-complaints-panel rounded-2xl border border-line bg-surface p-4">
          <div className="job-panel-title text-sm font-extrabold text-content">Customer Complaints</div>
          <div className="job-complaint-compose mt-3 flex flex-col gap-2 sm:flex-row">
            <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder="Add complaint exactly as customer explains it..." className="min-h-20 flex-1 rounded-xl border border-line bg-surface-2 p-3 text-sm text-content"/>
            <button type="button" onClick={addComplaint} disabled={!complaintText.trim() || saving} className="h-11 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white"><Plus size={15} className="inline"/> Add Complaint</button>
          </div>

          <div className="job-complaint-list mt-4 flex flex-col gap-2">
            {complaints.map((item) => (
              <div key={item.id} className="job-complaint-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-content">{item.description}</div>
                  <div className="mt-1 text-[10px] text-muted">{item.relatedService || 'Not linked to work item'}</div>
                </div>
                <select aria-label={`Status for complaint ${item.description}`} value={item.status || 'Open'} onChange={(e) => updateComplaintStatus(item.id, e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[11px] font-semibold text-content">
                  <option>Open</option><option>In Progress</option><option>Completed</option>
                </select>
              </div>
            ))}
            {!complaints.length ? <Empty text="No customer complaints recorded."/> : null}
          </div>
        </section>
      )}

      {activeTab === 'inspection' && (
        <JobInspectionPanel
          job={job}
          onChanged={async () => {
            try {
              await refreshJobWorkflow('inspection');
            } catch (e) {
              setError(e?.message || 'Could not refresh job details.');
            }
          }}
        />
      )}

      {activeTab === 'work' && (
        <div className="job-work-payroll-stack">
          <OutsideLabourPanel jobId={job.id} />
          <JobWorkerAssignments
            key={timerRefreshVersion}
            jobId={job.id}
            staff={staff}
            onChanged={() => setTimerRefreshVersion((value) => value + 1)}
          />

          <JobWorkTimerPanel
            jobId={job.id}
            jobStatus={normalizeJobStatus(job.status)}
            labourRecords={labourRecords}
            onChanged={() => setTimerRefreshVersion((value) => value + 1)}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="job-panel rounded-2xl border border-line bg-surface p-4">
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

          <section className="job-panel rounded-2xl border border-line bg-surface p-4">
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
        </div>
      )}

      {activeTab === 'parts' && (
        <JobPartsWorkflow jobId={job.id} assignedTo={job.assignedEmployeeName || ''} onJobUpdated={load}/>
      )}

      {activeTab === 'estimate' && (
        <div className="job-estimate-grid grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="job-panel job-estimate-history-panel rounded-2xl border border-line bg-surface p-4">
            <div className="job-panel-title text-sm font-extrabold text-content">Estimate History</div>
            <div className="job-estimate-history mt-3 flex flex-col gap-2">
              {estimates.map((item)=>(
                <div key={item.id || item.version} className="job-estimate-card rounded-xl border border-line bg-surface-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-content">{item.version}</div>
                      <div className="mt-1 text-[10px] text-muted">{item.date}</div>
                    </div>
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold text-primary">{item.approvalStatus}</span>
                  </div>
                  <div className="job-estimate-breakdown mt-3 grid grid-cols-2 gap-2 text-[11px] text-secondary">
                    <div>Parts <strong className="float-right text-content">{money.format(item.partsTotal || 0)}</strong></div>
                    <div>Labour <strong className="float-right text-content">{money.format(item.servicesTotal || 0)}</strong></div>
                    <div>Tax <strong className="float-right text-content">{money.format(item.taxAmount || 0)}</strong></div>
                    <div>Discount <strong className="float-right text-content">{money.format(item.discount || 0)}</strong></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <strong className="text-sm text-content">{money.format(item.grandTotal || 0)}</strong>
                    {item.approvalStatus === 'Pending' && (USE_MOCK_API || item.id === estimates.at(-1)?.id) ? (
                      <div className="flex gap-2">
                        <button onClick={()=>setEstimateApproval(item.id || item.version,'Approved')} className="h-8 rounded-lg border-0 bg-emerald-600 px-3 text-[10px] font-bold text-white">Approve</button>
                        <button onClick={()=>setEstimateApproval(item.id || item.version,'Rejected')} className="h-8 rounded-lg border-0 bg-red-500 px-3 text-[10px] font-bold text-white">Reject</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {!estimates.length ? <Empty text="No estimate created yet."/> : null}
            </div>
          </section>

          <section className="job-panel job-current-estimate rounded-2xl border border-line bg-surface p-4">
            <div className="job-panel-title text-sm font-extrabold text-content">Current Estimate</div>
            <div className="job-current-estimate__body mt-3 flex flex-col gap-2 text-xs">
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
              <div className="job-estimate-total mt-2 flex items-center justify-between rounded-xl bg-primary-soft p-3">
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
        <section className="job-panel job-updates-panel rounded-2xl border border-line bg-surface p-4">
          <div className="job-updates-header flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-content">Technician Updates</div>
              <div className="mt-1 text-xs text-muted">Track work start, pause/resume, notes, photos and completion.</div>
            </div>
            <div className="job-update-actions flex flex-wrap gap-2">
              {['Work Started','Pause','Resume','Completed Work'].map((type)=>(
                <button key={type} onClick={()=>addTechnicianUpdate(type)} className="h-9 rounded-xl border border-line bg-surface-2 px-3 text-[11px] font-semibold text-content">{type}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-[11px] font-semibold text-content">
              <Camera size={14}/>Add Work Photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>addPhoto(e.target.files?.[0],'During Repair')}/>
            </label>
          </div>

          <div className="job-update-compose mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
            <select value={updateType} onChange={(e)=>setUpdateType(e.target.value)} className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content">
              <option>Work Update</option><option>Inspection</option><option>Parts Update</option><option>Customer Update</option><option>Issue Found</option>
            </select>
            <input value={updateNote} onChange={(e)=>setUpdateNote(e.target.value)} placeholder="Technician note..." className="h-10 rounded-xl border border-line bg-surface-2 px-3 text-xs text-content"/>
            <button onClick={()=>addTechnicianUpdate(updateType)} disabled={!updateNote.trim()} className="h-10 rounded-xl border-0 bg-primary px-4 text-xs font-bold text-white">Add Update</button>
          </div>

          <div className="job-update-list mt-4 flex flex-col gap-2">
            {updates.map((item)=>(
              <div key={item.id} className="job-update-card rounded-xl border border-line bg-surface-2 p-3">
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
        <div className="job-qc-grid grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="job-panel job-qc-checklist-panel rounded-2xl border border-line bg-surface p-4">
            <div className="job-panel-title flex items-center gap-2 text-sm font-extrabold text-content"><ShieldCheck size={16} className="text-primary"/>Quality Check</div>
            <div className="job-qc-list mt-3 flex flex-col gap-2">
              {qcChecklist.map((item)=>(
                <div key={item.id} className="job-qc-row flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3">
                  <span className="text-xs font-semibold text-content">{item.item}</span>
                  <select value={item.status || 'Pending'} onChange={(e)=>updateQcItem(item.id,e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[10px] font-bold text-content">
                    <option>Pending</option><option>Pass</option><option>Fail</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="job-panel job-qc-result-panel rounded-2xl border border-line bg-surface p-4">
            <div className="job-panel-title text-sm font-extrabold text-content">Road Test & Result</div>
            <textarea value={qcRoadTest} onChange={(e)=>setQcRoadTest(e.target.value)} rows={5} placeholder="Road test notes / issues found..." className="mt-3 min-h-28 w-full rounded-xl border border-line bg-surface-2 p-3 text-xs text-content"/>
            <div className="job-qc-actions mt-3 grid grid-cols-2 gap-2">
              <button onClick={()=>completeQc('Pass')} className="h-10 rounded-xl border-0 bg-emerald-600 text-xs font-bold text-white">QC Passed</button>
              <button onClick={()=>completeQc('Rework Required')} className="h-10 rounded-xl border-0 bg-red-500 text-xs font-bold text-white">QC Failed</button>
            </div>
            <div className="mt-3 rounded-xl bg-surface-2 p-3 text-xs text-secondary">Current: <strong className="text-content">{qc.status || 'Pending'}</strong></div>
          </section>
        </div>
      )}


      {activeTab === 'invoice' && (
        <div className="job-invoice-dashboard">
          <header className="job-invoice-dashboard-head">
            <div>
              <h2><ReceiptText size={18} aria-hidden="true" /> Invoice & Payment</h2>
              <p>Review the invoice, outstanding amount and vehicle delivery in one place.</p>
            </div>
            <button
              type="button"
              onClick={() => linkedInvoice ? navigate('/invoices/' + linkedInvoice.id) : createInvoice()}
              className="job-primary-action"
            >
              <ReceiptText size={15} aria-hidden="true" />
              {linkedInvoice ? 'View Invoice' : 'Create Invoice'}
            </button>
          </header>

          <div className="job-invoice-dashboard-stats">
            {[
              ['Invoice Total', invoiceTotal, 'total'],
              ['Paid Amount', invoicePaid, 'paid'],
              ['Balance Due', invoiceBalance, 'balance']
            ].map(([label, amount, tone]) => (
              <div className={'job-invoice-stat is-' + tone} key={label}>
                <span>{label}</span>
                <strong>{money.format(amount)}</strong>
              </div>
            ))}
            <div className="job-invoice-stat is-status">
              <span>Payment Status</span>
              <strong>{invoicePaymentStatus}</strong>
            </div>
          </div>

          {billingLoading && <p className="job-invoice-inline-message" role="status">Loading invoice and payment records…</p>}
          {billingError && <div className="job-invoice-inline-message is-error" role="alert">
            {billingError}
            <button type="button" onClick={loadBilling}>Retry</button>
          </div>}

          <div className="job-invoice-dashboard-columns">
            <section className="job-panel job-invoice-billing-card">
              <div className="job-invoice-section-heading">
                <div>
                  <h3>Billing details</h3>
                  <p>{linkedInvoice ? 'Linked to the official invoice record' : 'Create an invoice to start billing this job'}</p>
                </div>
                <span className="job-invoice-status-badge">{linkedInvoice?.status || 'Not invoiced'}</span>
              </div>

              <div className="job-invoice-details">
                <div><span>Invoice Number</span><strong>{linkedInvoice?.number || (USE_MOCK_API ? job.billing?.invoiceNumber : '') || 'Not generated'}</strong></div>
                <div><span>Customer</span><strong>{job.customerName || 'Walk-in'}</strong></div>
                <div><span>Vehicle</span><strong>{job.vehicleReg || '—'}</strong></div>
                <div><span>Payment Method</span><strong>{linkedInvoice?.paymentMode || (USE_MOCK_API ? job.billing?.paymentMethod : '') || '—'}</strong></div>
              </div>

              {jobInvoices.length > 1 && (
                <div className="job-invoice-document-list">
                  <h4>Other invoices for this Job Card</h4>
                  {jobInvoices.filter((row) => row.id !== linkedInvoice?.id).map((row) => (
                    <button key={row.id} type="button" onClick={() => navigate('/invoices/' + row.id)}>
                      <span>{row.number || 'Invoice'} · {row.status}</span>
                      <strong>{money.format(cleanNumber(row.total))}</strong>
                    </button>
                  ))}
                </div>
              )}

              {(!linkedInvoice && !USE_MOCK_API) ? (
                <div className="job-invoice-empty">
                  <FileText size={20} aria-hidden="true" />
                  <strong>No invoice linked yet</strong>
                  <p>Generate an invoice from this job before recording a payment.</p>
                  <button type="button" onClick={createInvoice} className="job-primary-action">Create Invoice</button>
                </div>
              ) : (
                <form className="job-payment-form" onSubmit={recordPayment}>
                  <div className="job-payment-form__title">Record payment</div>
                  <div className="job-payment-form__grid">
                    <label>
                      Amount (₹)
                      <input
                        inputMode="decimal"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        placeholder="Enter amount"
                        aria-label="Payment amount"
                      />
                    </label>
                    <label>
                      Payment method
                      <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                        <option>Cash</option><option>Card</option><option>UPI</option><option>Bank</option>
                      </select>
                    </label>
                  </div>
                  <button type="submit" disabled={saving || billingLoading || invoiceBalance <= 0} className="job-payment-submit">
                    {saving ? 'Saving…' : 'Record Payment'}
                  </button>
                </form>
              )}

              {(USE_MOCK_API ? job.billing?.payments || [] : jobPayments).length > 0 && (
                <div className="job-payment-history">
                  <h4>Recent payments</h4>
                  {(USE_MOCK_API ? job.billing?.payments || [] : jobPayments).slice(0, 4).map((payment) => (
                    <div key={payment.id}>
                      <span>{payment.date || 'Payment'}</span>
                      <strong>{money.format(cleanNumber(payment.amount))} · {payment.method}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="job-panel job-invoice-delivery-card">
              <div className="job-invoice-section-heading">
                <div>
                  <h3>Vehicle delivery</h3>
                  <p>Confirm final handover details.</p>
                </div>
              </div>
              {!USE_MOCK_API && (
                <p className="job-invoice-inline-message">The backend currently supports delivery status, but not storing the KM, acknowledgement and warranty fields shown below.</p>
              )}
              <div className="job-invoice-delivery-fields">
                <label>
                  Final KM
                  <input disabled={!USE_MOCK_API} value={deliveryForm.finalKm} onChange={(e) => setDeliveryForm({ ...deliveryForm, finalKm: e.target.value })} placeholder="Vehicle odometer" />
                </label>
                <label>
                  Customer acknowledgement
                  <input disabled={!USE_MOCK_API} value={deliveryForm.customerSignature} onChange={(e) => setDeliveryForm({ ...deliveryForm, customerSignature: e.target.value })} placeholder="Customer name" />
                </label>
                <label>
                  Warranty / service notes
                  <textarea disabled={!USE_MOCK_API} rows={3} value={deliveryForm.warrantyNotes} onChange={(e) => setDeliveryForm({ ...deliveryForm, warrantyNotes: e.target.value })} placeholder="Handover notes" />
                </label>
                <button type="button" disabled={saving || normalizeJobStatus(job.status) === 'Delivered'} onClick={saveDelivery} className="job-invoice-deliver-button">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {normalizeJobStatus(job.status) === 'Delivered' ? 'Vehicle Delivered' : 'Mark Delivered'}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <section className="job-panel job-activity-panel rounded-2xl border border-line bg-surface p-4">
          <div className="job-panel-title text-sm font-extrabold text-content">Job Activity</div>
          <div className="job-activity-timeline mt-4 border-l border-line pl-4">
            {[...timeline, ...updates.map((item)=>({
              time: item.time || new Date(item.createdAt || Date.now()).toLocaleString('en-IN'),
              title: item.type || 'Work Update',
              desc: item.note
            }))].map((item,index)=>(
              <div key={`${item.time}-${index}`} className="job-activity-item relative pb-5">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-surface"/>
                <div className="text-[10px] font-semibold text-muted">{item.time}</div>
                <div className="mt-1 text-xs font-extrabold text-content">{item.title}</div>
                <div className="mt-1 text-[11px] text-secondary">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      )}

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="job-info-card min-w-0 rounded-xl bg-surface-2 p-3">
      <div className="text-[10px] font-semibold text-muted">{label}</div>
      <div className="mt-1 break-words text-xs font-bold text-content">{value || '—'}</div>
    </div>
  );
}

function AmountRow({ label, value }) {
  return (
    <div className="job-amount-row flex items-center justify-between border-b border-line py-2">
      <span className="text-secondary">{label}</span>
      <strong className="text-content">{money.format(value || 0)}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted"><Clock3 size={16} className="mx-auto mb-2"/>{text}</div>;
}

export default JobCardWorkspace;
