import apiClient from '../api/apiClient';

export const subscriptionApi = {
  access: () => apiClient.get('/saas/checkout/status'),
  plans: () => apiClient.get('/saas/plans'),
  history: () => apiClient.get('/saas/checkout/history'),
  order: (planId, billingCycle) => apiClient.post('/saas/checkout/orders', {
    plan_id: planId, billing_cycle: billingCycle
  }),
  verify: (receipt) => apiClient.post('/saas/checkout/verify', receipt),
  orderStatus: (orderId) => apiClient.get(`/saas/checkout/orders/${encodeURIComponent(orderId)}`)
};

let razorpayLoader;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => window.Razorpay ? resolve() : reject(new Error('Checkout failed to load.'));
      script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded.'));
      document.head.appendChild(script);
    }).catch((error) => { razorpayLoader = null; throw error; });
  }
  return razorpayLoader;
};

export const openRazorpayCheckout = async (order) => {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fulfill = (callback) => {
      if (settled) return;
      settled = true;
      callback();
    };
    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: 'INR',
      name: 'CubeGear',
      description: `${order.plan} • ${order.validityDays} days`,
      prefill: order.prefill || {},
      theme: { color: '#2563eb' },
      handler: async (payment) => {
        try {
          const verified = await subscriptionApi.verify(payment);
          fulfill(() => resolve(verified));
        } catch (error) {
          fulfill(() => reject(error));
        }
      },
      modal: {
        ondismiss: () => fulfill(() => reject(new Error('Checkout closed. You can try again.')))
      }
    });
    checkout.on('payment.failed', (event) => fulfill(() => reject(
      new Error(event?.error?.description || 'Payment failed. No access has been activated.')
    )));
    checkout.open();
  });
};
