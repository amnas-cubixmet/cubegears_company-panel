export const invoiceStatusClass = (status = '') =>
  'is-' + String(status || 'Draft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const invoiceKindLabel = (kind = 'invoice') =>
  kind === 'estimate' ? 'Estimate' : 'Invoice';
