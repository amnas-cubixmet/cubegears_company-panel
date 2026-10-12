// Dashboard API fields can be descriptive objects rather than display strings.
// React must never receive an object as a text child (e.g. a complaint object
// with { id, description, wording, status } returned as booking.service).
const DISPLAY_KEYS = [
  'wording', 'description', 'displayName', 'name', 'title', 'label',
  'serviceName', 'makeModel', 'registration', 'vehicleReg', 'regNo',
  'code', 'status', 'id'
];

export const dashboardText = (value, fallback = '—') => {
  const unwrap = (candidate, depth = 0) => {
    if (candidate == null || depth > 3) return '';
    if (typeof candidate === 'string') return candidate.trim();
    if (typeof candidate === 'number' || typeof candidate === 'bigint') return String(candidate);
    if (typeof candidate === 'boolean') return candidate ? 'Yes' : 'No';
    if (Array.isArray(candidate)) {
      return candidate.map((item) => unwrap(item, depth + 1)).filter(Boolean).join(', ');
    }
    if (typeof candidate === 'object') {
      for (const key of DISPLAY_KEYS) {
        if (Object.prototype.hasOwnProperty.call(candidate, key)) {
          const label = unwrap(candidate[key], depth + 1);
          if (label) return label;
        }
      }
    }
    return '';
  };
  return unwrap(value) || fallback;
};

export const statusClass = (status = '') => {
  const value = String(status).toLowerCase();
  if (value.includes('confirm') || value.includes('complete') || value.includes('ready')) return 'is-success';
  if (value.includes('pending') || value.includes('check')) return 'is-warning';
  if (value.includes('delay') || value.includes('critical')) return 'is-danger';
  return 'is-info';
};

export const repairStages = [
  { key: 'inspection', label: 'Inspection' },
  { key: 'awaitingApproval', label: 'Approval' },
  { key: 'inProgress', label: 'Repairing' },
  { key: 'qualityCheck', label: 'QC' },
];
