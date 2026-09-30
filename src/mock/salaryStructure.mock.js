export let mockSalaryStructures = [
  {
    id: "STR-001",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    salaryBasis: "Hourly",
    hourlyRate: 95,
    fixedMonthlySalary: 0,
    dailyRate: 0,
    basicSalary: 0,
    allowances: 6000,
    fixedIncentives: 4000,
    effectiveDate: "2025-01-12",
    status: "Active",
    notes: "Mechanic paid by approved worked hours."
  },
  {
    id: "STR-002",
    staffId: "EMP-0014",
    staffName: "Rajesh V",
    salaryBasis: "Fixed Monthly",
    fixedMonthlySalary: 30000,
    hourlyRate: 0,
    dailyRate: 0,
    basicSalary: 30000,
    allowances: 10000,
    fixedIncentives: 8000,
    effectiveDate: "2024-03-01",
    status: "Active",
    notes: "Branch Manager fixed monthly salary."
  },
  {
    id: "STR-003",
    staffId: "EMP-0015",
    staffName: "Priya Nair",
    salaryBasis: "Fixed Monthly",
    fixedMonthlySalary: 15000,
    hourlyRate: 0,
    dailyRate: 0,
    basicSalary: 15000,
    allowances: 5000,
    fixedIncentives: 1000,
    effectiveDate: "2025-06-01",
    status: "Active",
    notes: "Reception fixed monthly salary."
  },
  {
    id: "STR-004",
    staffId: "EMP-0013",
    staffName: "Niyas P",
    salaryBasis: "Commission Only",
    fixedMonthlySalary: 0,
    hourlyRate: 0,
    dailyRate: 0,
    basicSalary: 0,
    allowances: 0,
    fixedIncentives: 0,
    effectiveDate: "2026-01-01",
    status: "Active",
    notes: "Salary comes from approved commission entries."
  }
];

export let mockSalaryPayments = [
  {
    id: "PMT-001",
    payrollId: "PAY-2026-08-01",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    period: "August 2026",
    amount: 12000,
    method: "UPI",
    reference: "UTR98127391",
    date: "2026-09-01",
    remarks: "Advance salary transfer",
    recordedBy: "Accountant",
    transferStatus: "Successful"
  }
];

export let mockSalaryAdvances = [
  {
    id: "ADV-001",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    advanceDate: "2026-08-10",
    advanceAmount: 10000,
    recoveredAmount: 4000,
    outstandingBalance: 6000,
    monthlyRecovery: 2000,
    reason: "Emergency medical expense",
    recoveryStartMonth: "September 2026",
    recoveryMethod: "Payroll Deduction",
    notes: "Approved by Workshop Manager",
    approvalStatus: "Approved",
    status: "Active",
    recoveryHistory: [
      { id: "REC-101", date: "2026-09-01", amount: 2000, month: "August 2026", recordedBy: "Payroll System", reference: "PAY-2026-08-01" },
      { id: "REC-102", date: "2026-08-15", amount: 2000, month: "Direct Deposit", recordedBy: "Ajmal K", reference: "CASH-REC-01" }
    ]
  }
];
