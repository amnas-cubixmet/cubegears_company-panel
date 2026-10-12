// Complaint progress follows the validated Job Card workflow rather than
// letting each operator set a disconnected manual status.
export const complaintStatusForJob = (job, workflow = null) => {
  const completed = workflow?.completed || [];
  if (completed.includes('qc') || ['Ready for Delivery', 'Delivered'].includes(job?.status)) {
    return 'Completed';
  }
  if (completed.includes('estimate') ||
    ['Approved', 'In Progress', 'Waiting for Parts', 'QC'].includes(job?.status)) {
    return 'In Progress';
  }
  return 'Open';
};

export const complaintStatusClass = (status) => {
  if (status === 'Completed') return 'is-completed';
  if (status === 'In Progress') return 'is-progress';
  return 'is-open';
};
