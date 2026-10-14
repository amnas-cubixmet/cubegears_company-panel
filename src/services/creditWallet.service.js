import apiClient from '../api/apiClient';

export const creditWalletService = {
  overview: () => apiClient.get('/saas/credits/overview'),
  packages: () => apiClient.get('/saas/credits/packages'),
  features: () => apiClient.get('/saas/credits/features'),
  logs: (limit = 100) => apiClient.get(`/saas/credits/logs?limit=${limit}`),
  order: (packageId) => apiClient.post('/saas/credits/orders', { packageId }),
  verify: (receipt) => apiClient.post('/saas/credits/verify', receipt),
  enableFeature: (key) => apiClient.post('/saas/credits/features/enable', { key }),
  disableFeature: (key) => apiClient.post('/saas/credits/features/disable', { key }),
};

let checkoutLoader;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutLoader) {
    checkoutLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => window.Razorpay ? resolve() : reject(new Error('Razorpay Checkout unavailable.'));
      script.onerror = () => reject(new Error('Unable to load secure payment checkout.'));
      document.head.appendChild(script);
    }).catch((error) => { checkoutLoader = null; throw error; });
  }
  return checkoutLoader;
}

export async function purchaseCredits(packageId) {
  const order = await creditWalletService.order(packageId);
  if (!order?.orderId || !order?.keyId || !order?.amount) {
    throw new Error('The payment provider did not create a valid order.');
  }
  await loadCheckout();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (cb) => { if (!settled) { settled = true; cb(); } };
    const checkout = new window.Razorpay({
      key: order.keyId, order_id: order.orderId, amount: order.amount,
      currency: 'INR', name: 'CubeGear Credits',
      description: `${order.credits} wallet credits`,
      prefill: order.prefill || {}, theme: { color: '#2458e6' },
      handler: async (payload) => {
        try {
          const confirmed = await creditWalletService.verify(payload);
          if (!confirmed?.credited) throw new Error('Payment is awaiting verification; no credits have been added.');
          finish(() => resolve(confirmed));
        } catch (error) { finish(() => reject(error)); }
      },
      modal: { ondismiss: () => finish(() => reject(new Error('Payment window closed without confirmation.'))) },
    });
    checkout.on('payment.failed', (event) => finish(() => reject(new Error(
      event?.error?.description || 'Payment failed; credits were not added.'
    ))));
    checkout.open();
  });
}

export const notifyCreditChange = () => window.dispatchEvent(new Event('cubegear:credits-updated'));
