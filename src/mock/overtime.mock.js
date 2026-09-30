export let mockOvertimeList = [
  {
    id: "OT-2026-09-001",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    date: "2026-09-12",
    payrollMonth: "September 2026",
    branch: "Main Garage Branch",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    clockIn: "09:00 AM",
    clockOut: "08:30 PM",
    overtimeHours: 2.5,
    calculationMethod: "Hourly Rate",
    rate: 150,
    amount: 375,
    reason: "Emergency engine overhaul for customer job #JC-8812",
    notes: "Worked 2.5 hours extra with shop manager approval.",
    status: "Approved", // Pending | Approved | Rejected | Cancelled
    approvedBy: "Rajesh V (Branch Manager)",
    approvedAt: "2026-09-12 09:00 PM",
    auditHistory: [
      { action: "Overtime Requested", actor: "Ajmal K", timestamp: "2026-09-12 08:35 PM" },
      { action: "Approved Overtime (2.5h @ ₹150/hr)", actor: "Rajesh V", timestamp: "2026-09-12 09:00 PM" }
    ]
  },
  {
    id: "OT-2026-09-002",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    date: "2026-09-10",
    payrollMonth: "September 2026",
    branch: "Main Garage Branch",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    clockIn: "09:00 AM",
    clockOut: "07:30 PM",
    overtimeHours: 1.5,
    calculationMethod: "Hourly Rate",
    rate: 150,
    amount: 225,
    reason: "Brake service completion",
    notes: "Awaiting approval",
    status: "Pending",
    auditHistory: [
      { action: "Overtime Requested", actor: "Ajmal K", timestamp: "2026-09-10 07:35 PM" }
    ]
  },
  {
    id: "OT-2026-08-001",
    staffId: "EMP-0014",
    staffName: "Rajesh V",
    date: "2026-08-25",
    payrollMonth: "August 2026",
    branch: "Main Garage Branch",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    clockIn: "09:00 AM",
    clockOut: "09:00 PM",
    overtimeHours: 3.0,
    calculationMethod: "Fixed Amount",
    rate: 200,
    amount: 600,
    reason: "Monthly inventory audit",
    notes: "Authorized fixed OT payout",
    status: "Approved",
    approvedBy: "Regional Director",
    approvedAt: "2026-08-26 10:00 AM",
    auditHistory: [
      { action: "Approved Overtime", actor: "Regional Director", timestamp: "2026-08-26 10:00 AM" }
    ]
  }
];
