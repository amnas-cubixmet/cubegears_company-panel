/**
 * New workshop invoice tax status is authoritative from Django's gst-context
 * endpoint. A typed seller GSTIN or customer GSTIN must never enable GST.
 */
export function workshopInvoiceType(context) {
  if (!context || typeof context.registered !== 'boolean' || typeof context.gstin !== 'string') {
    throw new Error('Workshop GST registration could not be verified. Refresh the invoice page.');
  }
  if (Boolean(context.gstin.trim()) !== context.registered) {
    throw new Error('Workshop GST registration details are inconsistent. Check Company Settings.');
  }
  return context.registered ? 'gst' : 'regular';
}

export function applyWorkshopTaxProfile(draft, context) {
  const invoiceType = workshopInvoiceType(context);
  return {
    ...draft,
    invoiceType,
    taxMode: invoiceType === 'regular' ? 'none' : draft.taxMode,
    // The real seller GSTIN belongs to Company Settings, never this form.
    seller: { ...draft.seller, gstin: context.gstin.trim().toUpperCase() },
    // On non-GST invoices, do not keep old job-card/stock tax rates in payloads.
    items: invoiceType === 'regular'
      ? (draft.items || []).map(item => ({ ...item, taxRate: 0 }))
      : draft.items,
  };
}
