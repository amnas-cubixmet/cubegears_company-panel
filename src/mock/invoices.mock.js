export let invoicesMock = [
  {
    id: "INV-0001",
    invoiceNumber: "INV-0001",
    jobId: "JOB-0001",
    customerId: "CUS-0001",
    customerName: "Sarah Jenkins",
    billingDate: "2026-09-10",
    dueDate: "2026-09-24",
    subtotal: 300.00,
    taxAmount: 24.00,
    discountAmount: 0.00,
    totalAmount: 324.00,
    paidAmount: 324.00,
    status: "paid"
  },
  {
    id: "INV-0002",
    invoiceNumber: "INV-0002",
    jobId: "JOB-0002",
    customerId: "CUS-0002",
    customerName: "Michael Chang",
    billingDate: "2026-09-11",
    dueDate: "2026-09-25",
    subtotal: 240.00,
    taxAmount: 19.20,
    discountAmount: 10.00,
    totalAmount: 249.20,
    paidAmount: 0.00,
    status: "pending"
  }
];

export const getMockInvoices = () => [...invoicesMock];
export const getMockInvoiceById = (id) => invoicesMock.find((i) => i.id === id || i.invoiceNumber === id);
export const addMockInvoice = (data) => {
  const newInvNum = `INV-${String(invoicesMock.length + 1).padStart(4, '0')}`;
  const newInv = {
    id: newInvNum,
    invoiceNumber: newInvNum,
    billingDate: new Date().toISOString().split('T')[0],
    paidAmount: 0,
    status: "pending",
    ...data
  };
  invoicesMock.unshift(newInv);
  return newInv;
};
