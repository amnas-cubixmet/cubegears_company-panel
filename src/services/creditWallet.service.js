import apiClient from '../api/apiClient';

export const creditWalletService = {
  overview: () => apiClient.get('/saas/credits/overview'),
  packages: () => apiClient.get('/saas/credits/packages'),
  bundles: () => apiClient.get('/saas/credits/bundles'),
  purchaseBundle: (bundleId) => apiClient.post('/saas/credits/bundles/purchase', { bundleId }),
  disableBundle: (bundleId) => apiClient.post('/saas/credits/bundles/disable', { bundleId }),
  features: () => apiClient.get('/saas/credits/features'),
  logs: (limit = 100) => apiClient.get(`/saas/credits/logs?limit=${limit}`),
  createHostedCheckout: (packageId) => apiClient.post('/saas/credits/checkout-links', { packageId }),
  hostedCheckoutStatus: (purchaseId) => apiClient.get(`/saas/credits/checkout-links/${encodeURIComponent(purchaseId)}/status`),
  enableFeature: (key) => apiClient.post('/saas/credits/features/enable', { key }),
  disableFeature: (key) => apiClient.post('/saas/credits/features/disable', { key }),
};

// Redirect to Razorpay's own hosted checkout page. Never handle card or UPI data.
export async function purchaseCredits(packageId) {
  const checkout = await creditWalletService.createHostedCheckout(packageId);
  const url = new URL(checkout?.checkoutUrl || '');
  if (!checkout?.purchaseId || url.protocol !== 'https:' ||
      !['rzp.io', 'payments.razorpay.com'].includes(url.hostname)) {
    throw new Error('Razorpay returned an invalid payment page.');
  }
  window.location.assign(url.href);
  return checkout;
}

export const notifyCreditChange = () => window.dispatchEvent(new Event('cubegear:credits-updated'));
