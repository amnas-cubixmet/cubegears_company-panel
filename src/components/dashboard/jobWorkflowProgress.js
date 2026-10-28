/** Job workflow percentage represents COMPLETED backend stages, not elapsed time.
 * Matches Django apps/jobs/workflow.py STAGES and STATUS_INDEX.
 */
export const JOB_WORKFLOW_STAGES = Object.freeze([
  'overview', 'inspection', 'estimate', 'work', 'qc', 'invoice',
]);

const statusStages = Object.freeze({
  new: 0,
  inspection: 1,
  'estimate pending': 2,
  approved: 3,
  'in progress': 3,
  'waiting for parts': 3,
  qc: 4,
  'ready for delivery': 5,
  delivered: 6,
});

export const jobWorkflowProgress = (job) => {
  if (!job || typeof job !== 'object') return null;
  const status = String(job.status || '').toLowerCase()
    .replace(/[_-]+/g, ' ').trim();
  const workflow = job.workflowProgress || job.workflow_progress || {};
  const completed = Array.isArray(workflow.completed)
    ? workflow.completed.filter((stage) => JOB_WORKFLOW_STAGES.includes(stage))
    : [];
  const hasStatus = Object.prototype.hasOwnProperty.call(statusStages, status);
  if (!hasStatus && !completed.length) return null;
  // The backend treats later canonical statuses as implicitly completing
  // all earlier stages (for historical jobs).
  const statusCount = hasStatus ? statusStages[status] : 0;
  const doneStages = new Set([...JOB_WORKFLOW_STAGES.slice(0,statusCount), ...completed]);
  const completedCount = doneStages.size;
  return {
    completed: completedCount,
    total: JOB_WORKFLOW_STAGES.length,
    percentage: Math.round(100 * completedCount / JOB_WORKFLOW_STAGES.length),
  };
};
