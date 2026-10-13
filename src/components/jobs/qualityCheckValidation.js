export const DEFAULT_QC_ITEMS = [
  'Engine / Mechanical Check',
  'Fluid Levels',
  'Electrical / Warning Lights',
  'Brake & Tyre Check',
  'Road Test',
  'Cleaning & Final Presentation',
];

const STATUS = new Set(['Pending', 'Pass', 'Fail']);

// Keep the inspector already recorded on a QC, otherwise use the authenticated
// account name. Never substitute a job-assigned mechanic or fake default name.
export const resolveQcInspector = (savedInspector, loggedInName = '') => {
  const existing = String(savedInspector || '').trim();
  if (existing && existing !== 'Unassigned') return existing;
  return String(loggedInName || '').trim();
};

export const makeQcDraft = (qc = {}, loggedInName = '') => ({
  inspector: resolveQcInspector(qc?.inspector, loggedInName),
  testDriveNotes: String(qc?.testDriveNotes || ''),
  checklist: (Array.isArray(qc?.checklist) && qc.checklist.length
    ? qc.checklist
    : DEFAULT_QC_ITEMS.map((item) => ({ item, status: 'Pending' })))
    .map((row, index) => ({
      ...row,
      id: String(row?.id || 'QC-' + (index + 1)),
      item: String(row?.item || DEFAULT_QC_ITEMS[index] || 'QC Check ' + (index + 1)),
      status: STATUS.has(row?.status) ? row.status : 'Pending',
      remark: String(row?.remark || ''),
    })),
});

export const qcSummary = (draft) => ({
  pass: draft.checklist.filter((row) => row.status === 'Pass').length,
  fail: draft.checklist.filter((row) => row.status === 'Fail').length,
  pending: draft.checklist.filter((row) => row.status === 'Pending').length,
  total: draft.checklist.length,
});

/**
 * status: 'Draft' | 'Pass' | 'Rework Required'.
 * Draft saves partial QC without unlocking Invoice.
 * QC Passed requires every check Pass; QC Failed requires a failed check
 * and written reason so staff can understand the rework.
 */
export const qcFormErrors = (draft, mode) => {
  const errors = { items: {}, inspector: '', testDriveNotes: '', form: '' };
  const inspector = String(draft.inspector || '').trim();
  const notes = String(draft.testDriveNotes || '').trim();
  if (inspector.length > 120) errors.inspector = 'Inspector name must be 120 characters or fewer.';
  if (notes.length > 2000) errors.testDriveNotes = 'Road test notes must be 2,000 characters or fewer.';
  if (!Array.isArray(draft.checklist) || !draft.checklist.length) {
    errors.form = 'Add at least one Quality Check item.';
    return errors;
  }
  if (draft.checklist.some((item) => !STATUS.has(item.status))) {
    errors.form = 'Choose a valid status for each Quality Check.';
    return errors;
  }
  if (mode !== 'Draft') {
    if (!inspector) errors.inspector = 'Enter the QC inspector name.';
    if (mode === 'Pass') {
      draft.checklist.forEach((item) => {
        if (item.status !== 'Pass') errors.items[item.id] = 'Mark this check as Pass before approving QC.';
      });
    }
    if (mode === 'Rework Required') {
      if (!draft.checklist.some((item) => item.status === 'Fail')) {
        errors.form = 'Mark at least one checklist item as Fail.';
      }
      if (!notes) errors.testDriveNotes = 'Describe the failure or work needed before submitting QC Failed.';
    }
  }
  return errors;
};

export const qcHasErrors = (errors) =>
  Boolean(errors.form || errors.inspector || errors.testDriveNotes || Object.keys(errors.items).length);

export const qcPayload = (draft, status) => ({
  inspector: draft.inspector.trim(),
  testDriveNotes: draft.testDriveNotes.trim(),
  checklist: draft.checklist.map((item) => ({
    id: item.id,
    item: item.item,
    status: item.status,
    remark: item.remark || '',
  })),
  status,
  checkDate: new Date().toISOString().slice(0, 10),
});
