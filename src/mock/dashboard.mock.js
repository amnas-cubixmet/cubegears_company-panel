export let dashboardMock = {
  attendance: {
    status: 'CLOCKED_IN',
    clockInTime: '08:15 AM',
    workedHours: '6h 45m'
  },
  stats: {
    todaysVehicles: 18,
    ongoingJobs: 28,
    readyForDelivery: 7,
    todaysCollection: '₹4,850',
    outstandingBalance: '₹12,420',
    totalRevenue: '₹45,280',
    lowStockAlerts: 4
  },
  bookings: [
    { id: 'BK-101', time: '09:30 AM', customer: 'Rahul Kumar', vehicle: 'Toyota Camry (KL 10 AB 1234)', service: 'Periodic Service & Oil Change', status: 'Confirmed' },
    { id: 'BK-102', time: '10:45 AM', customer: 'Michael Chang', vehicle: 'BMW X5 (MH 02 BZ 9876)', service: 'Brake Pad Inspection & Replacement', status: 'Checked In' },
    { id: 'BK-103', time: '02:00 PM', customer: 'David Smith', vehicle: 'Ford F-150 (DL 01 C 5544)', service: 'AC Gas Refill & Filter Check', status: 'Pending' }
  ],
  jobProgress: {
    inspection: 4,
    awaitingApproval: 3,
    inProgress: 14,
    waitingForParts: 4,
    qualityCheck: 3
  },
  deliveries: [
    { id: 'JOB-0002', vehicle: 'BMW X5 (MH 02 BZ 9876)', customer: 'Michael Chang', expectedTime: '04:30 PM Today', status: 'Ready', phone: '+91 98765 43210' },
    { id: 'JOB-0005', vehicle: 'Honda Civic (KA 05 M 9900)', customer: 'Lisa Wong', expectedTime: '05:45 PM Today', status: 'Due Today', phone: '+91 98123 45678' },
    { id: 'JOB-0008', vehicle: 'Audi A4 (DL 03 X 4411)', customer: 'Robert Vance', expectedTime: '11:00 AM Tomorrow', status: 'Delayed', phone: '+91 99887 76655' }
  ],
  recentJobs: [
    { id: 'JOB-0001', customer: 'Sarah Jenkins', vehicle: 'Toyota Camry 2022', service: 'Full Engine Tuneup', mechanic: 'Alex Rivera', status: 'in_progress', amount: '₹18,500' },
    { id: 'JOB-0002', customer: 'Michael Chang', vehicle: 'BMW X5 2021', service: 'Brake Pad Replacement', mechanic: 'Dan Miller', status: 'completed', amount: '₹14,200' },
    { id: 'JOB-0003', customer: 'David Smith', vehicle: 'Ford F-150 Lariat', service: 'Synthetic Oil Change', mechanic: 'Alex Rivera', status: 'pending', amount: '₹4,850' }
  ],
  payments: {
    billedAmount: '₹45,280',
    receivedPayments: '₹32,860',
    unpaidInvoices: 8,
    partiallyPaidInvoices: 3,
    overdueAmount: '₹4,200'
  },
  staffAvailability: [
    { name: 'Alex Rivera', role: 'Lead Mechanic', activeJobs: 2, status: 'Active Duty', available: true },
    { name: 'Dan Miller', role: 'Diagnostic Specialist', activeJobs: 3, status: 'Active Duty', available: false },
    { name: 'Elena Rostova', role: 'Service Advisor', activeJobs: 0, status: 'On Break', available: true }
  ],
  stockAlerts: [
    { id: 'STK-0003', partName: 'Bosch Heavy Duty Oil Filter', sku: 'FLT-OIL-HD', currentStock: 4, minStock: 15, priority: 'critical', message: '4 Jobs Waiting for Parts' },
    { id: 'EST-909', partName: 'Brembo Ceramic Brake Pads', sku: 'BP-CRMC-01', currentStock: 42, minStock: 10, priority: 'warning', message: 'Pending Customer Estimate Approval' }
  ],
  chartData: [
    { period: 'Mon', billed: 42000, collected: 38000 },
    { period: 'Tue', billed: 65000, collected: 52000 },
    { period: 'Wed', billed: 58000, collected: 61000 },
    { period: 'Thu', billed: 82000, collected: 74000 },
    { period: 'Fri', billed: 95000, collected: 81000 },
    { period: 'Sat', billed: 110800, collected: 22600 }
  ],
  myAttendanceSummary: {
    todayPunches: '08:15 AM - Present',
    pendingLeaveRequests: 0,
    flaggedPunches: 0,
    monthlyHours: '168.5 Hours',
    lateDays: 1,
    approvedOvertime: '14.5 Hours'
  },
  recentActivity: [
    { id: 1, type: 'JOB', text: 'New Job Card #JOB-0003 created for Ford F-150', time: '12 mins ago' },
    { id: 2, type: 'PAYMENT', text: 'Payment of ₹18,500 recorded for Invoice #INV-0001', time: '45 mins ago' },
    { id: 3, type: 'STOCK', text: 'Issued 4 units Castrol 5W-30 Oil to Job #JOB-0001', time: '2 hours ago' }
  ],
  serviceFollowUps: [
    { customer: 'James Wilson', vehicle: 'Mercedes C300 (MB-9090)', serviceDue: 'Major 60,000 km Service', dueDate: 'Sep 18, 2026', phone: '+91 98765 11223', assignedStaff: 'Elena Rostova' },
    { customer: 'Patricia Arquette', vehicle: 'Nissan Rogue (NIS-2233)', serviceDue: 'Brake Fluid Replacement', dueDate: 'Sep 20, 2026', phone: '+91 98123 44556', assignedStaff: 'Elena Rostova' }
  ]
};

export const getMockDashboard = () => ({ ...dashboardMock });

export const toggleMockClockIn = (newStatus) => {
  dashboardMock.attendance.status = newStatus;
  if (newStatus === 'CLOCKED_IN') {
    dashboardMock.attendance.clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return dashboardMock.attendance;
};
