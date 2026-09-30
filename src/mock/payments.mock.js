export let paymentsMock = [
  {
    id: "PAY-0001",
    invoiceId: "INV-0001",
    customerId: "CUS-0001",
    customerName: "Sarah Jenkins",
    paymentMethod: "Credit Card (Stripe)",
    amount: 324.00,
    transactionRef: "ch_3M89x92E1",
    paymentDate: "2026-09-10",
    status: "completed"
  },
  {
    id: "PAY-0002",
    invoiceId: "INV-0002",
    customerId: "CUS-0002",
    customerName: "Michael Chang",
    paymentMethod: "Cash",
    amount: 100.00,
    transactionRef: "REC-9002",
    paymentDate: "2026-09-11",
    status: "completed"
  }
];

export const getMockPayments = () => [...paymentsMock];
export const getMockPaymentById = (id) => paymentsMock.find((p) => p.id === id);
export const addMockPayment = (data) => {
  const newPay = {
    id: `PAY-${String(paymentsMock.length + 1).padStart(4, '0')}`,
    paymentDate: new Date().toISOString().split('T')[0],
    status: "completed",
    ...data
  };
  paymentsMock.unshift(newPay);
  return newPay;
};
