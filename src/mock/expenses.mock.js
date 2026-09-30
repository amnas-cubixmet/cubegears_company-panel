export let expensesMock = [
  {
    id: "EXP-0001",
    title: "Monthly Workshop Utility Bill",
    category: "Utilities",
    amount: 620.00,
    paymentMethod: "Bank Transfer",
    vendor: "Springfield Power & Light",
    expenseDate: "2026-09-01",
    status: "approved"
  },
  {
    id: "EXP-0002",
    title: "Hydraulic Lift Repair Service",
    category: "Equipment Maintenance",
    amount: 1200.00,
    paymentMethod: "Company Card",
    vendor: "Garage Equipment Specialists",
    expenseDate: "2026-09-05",
    status: "approved"
  }
];

export const getMockExpenses = () => [...expensesMock];
export const addMockExpense = (data) => {
  const newExp = {
    id: `EXP-${String(expensesMock.length + 1).padStart(4, '0')}`,
    expenseDate: new Date().toISOString().split('T')[0],
    status: "approved",
    ...data
  };
  expensesMock.unshift(newExp);
  return newExp;
};


export const getMockExpenseById = (id) =>
  expensesMock.find((expense) => expense.id === id) || null;

export const updateMockExpense = (id, data) => {
  const index = expensesMock.findIndex((expense) => expense.id === id);
  if (index === -1) return null;
  expensesMock[index] = { ...expensesMock[index], ...data, id };
  return expensesMock[index];
};

export const deleteMockExpense = (id) => {
  const index = expensesMock.findIndex((expense) => expense.id === id);
  if (index === -1) return false;
  expensesMock.splice(index, 1);
  return true;
};
