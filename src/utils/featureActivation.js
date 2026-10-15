export function isFeatureActivationReady(bundle, wallet) {
  return Boolean(bundle?.purchaseEnabled && wallet?.canManage);
}
