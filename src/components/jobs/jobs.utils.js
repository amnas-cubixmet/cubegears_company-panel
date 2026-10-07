export const STATUS_OPTIONS = [
  'All',
  'New',
  'Inspection',
  'Estimate Pending',
  'Approved',
  'In Progress',
  'Waiting for Parts',
  'QC',
  'Ready for Delivery',
  'Delivered',
  'Cancelled',
];

export const statusClass = (status) =>
  String(status || 'New').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const normalizeRegistration = (value) =>
  String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

export const jobMoney = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
