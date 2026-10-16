// The API supplies a company-scoped quote and the authoritative purchase flag.
// A client-side estimate or enabled button cannot grant paid access.
export function featureLabelStatus(bundle, wallet) {
  if (!bundle) return { label: 'Unavailable', message: 'Feature label could not be loaded.', allow: false };

  if (bundle.active && bundle.billingType === 'permanent') {
    return { label: 'Active', message: 'This label is already permanently owned.', allow: false };
  }
  const reasons = {
    FEATURE_ENTITLEMENTS_NOT_ENABLED: 'Platform feature billing must be enabled before labels can be activated.',
    METERED_OPERATION_NOT_READY: 'Per-use operations are not metered on the backend yet.',
    FEATURE_LABEL_EMPTY: 'This label has no active existing features.',
    FREE_MODULES_ONLY: 'These modules are already included free. No credits or activation required.',
    MODULE_PRICE_NOT_SET: 'Price not set. Your SaaS administrator must publish a positive price before activation.',
    INVALID_USER_PRICE: 'The administrator must configure a positive per-user credit rate.',
  };
  if (!bundle.purchaseEnabled) {
    return { label: 'Unavailable', message: reasons[bundle.purchaseDisabledReason] || 'Label activation is not available on the backend.', allow: false };
  }
  if (!wallet) return { label: 'Unavailable', message: 'Wallet information has not loaded.', allow: false };
  if (!wallet.canManage) return { label: 'Restricted', message: 'Only a billing administrator can activate labels.', allow: false };

  if (bundle.canResume) return { label: 'Inactive', message: 'Resume your paid access without another charge.', allow: true };
  const price = Number(bundle.totalCredits);
  const balance = Number(wallet.balance);
  if (!Number.isFinite(price) || price <= 0) {
    return { label: 'Unavailable', message: 'No verified server quote is available. Refresh the page.', allow: false };
  }
  if (!Number.isFinite(balance) || balance < price) {
    return { label: 'Low credits', message: 'Buy credits before activating this label.', allow: false };
  }
  return { label: bundle.active ? 'Active' : 'Inactive', message: '', allow: true };
}
