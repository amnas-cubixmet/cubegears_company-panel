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
