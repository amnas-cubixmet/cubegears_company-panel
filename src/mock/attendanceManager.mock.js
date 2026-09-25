export const mockManagerApprovals = [
  {
    id: "APP-1001",
    staffId: "EMP-0012",
    staffName: "Ajmal K",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    role: "Senior Technician",
    branch: "Main Workshop",
    type: "Punch Correction",
    affectedDate: "2026-09-12",
    submittedAt: "2026-09-12T19:30:00Z",
    originalValue: "Clock Out Missing",
    requestedValue: "06:30 PM",
    reason: "Forgot to clock out before leaving garage premises during shift handover.",
    status: "Pending",
    attachment: "shift_log_sheet.pdf",
    isSelfRequest: false
  },
  {
    id: "APP-1002",
    staffId: "EMP-0001",
    staffName: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    role: "Service Advisor / Manager",
    branch: "Main Workshop",
    type: "Leave Request",
    leaveType: "Casual Leave",
    affectedDate: "2026-09-18 to 2026-09-19",
    submittedAt: "2026-09-12T10:15:00Z",
    originalValue: "Scheduled Shift",
    requestedValue: "2 Days Full Leave",
    reason: "Family function in hometown.",
    status: "Pending",
    attachment: "event_invite.jpg",
    isSelfRequest: true // Manager self-request -> cannot self approve
  },
  {
    id: "APP-1004",
    staffId: "EMP-0020",
    staffName: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    role: "Accounts Executive",
    branch: "Main Workshop",
    type: "Overtime",
    affectedDate: "2026-09-10",
    submittedAt: "2026-09-10T20:15:00Z",
    originalValue: "Shift End 06:00 PM",
    requestedValue: "2.5 Hours Overtime",
    reason: "Urgent monthly GST invoicing reconciliation.",
    status: "Pending",
    attachment: null,
    isSelfRequest: false
  }
];

export const mockTeamAttendance = [
  {
    id: "TEAM-101",
    staffId: "EMP-0012",
    name: "Ajmal K",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    designation: "Senior Mechanic",
    branch: "Main Workshop",
    shift: "09:00 AM - 06:00 PM",
    clockIn: "09:04 AM",
    clockOut: "Working",
    worked: "6h 12m",
    status: "Present",
    lateMinutes: 4,
    missingPunch: false
  },
  {
    id: "TEAM-102",
    staffId: "EMP-0015",
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    designation: "Electrician",
    branch: "Main Workshop",
    shift: "09:00 AM - 06:00 PM",
    clockIn: "09:15 AM",
    clockOut: "Working",
    worked: "6h 01m",
    status: "Present",
    lateMinutes: 15,
    missingPunch: false
  },
  {
    id: "TEAM-103",
    staffId: "EMP-0008",
    name: "Dan Miller",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    designation: "Body Shop Lead",
    branch: "Main Workshop",
    shift: "09:00 AM - 06:00 PM",
    clockIn: null,
    clockOut: null,
    worked: "0h",
    status: "On Leave",
    leaveType: "Sick Leave",
    missingPunch: false
  },
  {
    id: "TEAM-104",
    staffId: "EMP-0022",
    name: "Vipin Das",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    designation: "AC Technician",
    branch: "Main Workshop",
    shift: "09:00 AM - 06:00 PM",
    clockIn: "09:00 AM",
    clockOut: null,
    worked: "Incomplete",
    status: "Missing Clock Out",
    lateMinutes: 0,
    missingPunch: true
  }
];

export const mockMasterLedger = [
  {
    id: "MST-901",
    date: "2026-09-12",
    staffId: "EMP-0012",
    name: "Ajmal K",
    branch: "Main Workshop",
    shift: "General Shift",
    clockIn: "09:04 AM",
    clockOut: "06:15 PM",
    worked: "8h 41m",
    status: "Present",
    correction: "Approved",
    modifiedBy: "Branch Manager",
    reason: "Updated punch session via manual verification"
  },
  {
    id: "MST-902",
    date: "2026-09-11",
    staffId: "EMP-0015",
    name: "Rahul Sharma",
    branch: "Main Workshop",
    shift: "General Shift",
    clockIn: "09:15 AM",
    clockOut: "05:15 PM",
    worked: "8h 00m",
    status: "Present",
    correction: "None",
    modifiedBy: "System",
    reason: "Standard Punch"
  }
];

export const mockLeaveTypesList = [
  {
    id: "LT-01",
    name: "Casual Leave",
    code: "CL",
    type: "Paid",
    allocation: "12 Days / Year",
    halfDay: true,
    carryForward: "5 Days",
    status: "Active"
  },
  {
    id: "LT-02",
    name: "Sick Leave",
    code: "SL",
    type: "Paid",
    allocation: "10 Days / Year",
    halfDay: true,
    carryForward: "3 Days",
    status: "Active"
  },
  {
    id: "LT-03",
    name: "Annual Earned Leave",
    code: "AL",
    type: "Paid",
    allocation: "15 Days / Year",
    halfDay: false,
    carryForward: "10 Days",
    status: "Active"
  }
];

export const mockHolidaysList = [
  {
    id: "HOL-01",
    name: "Onam Festival Holiday",
    date: "2026-09-15",
    type: "Company Holiday",
    branches: "All Branches",
    recurring: true,
    status: "Active"
  },
  {
    id: "HOL-02",
    name: "Third Onam Branch Break",
    date: "2026-09-16",
    type: "Branch Holiday",
    branches: "Kochi North Branch",
    recurring: false,
    status: "Active"
  }
];

export const mockAttendanceRulesConfig = {
  shiftName: "General Workshop Shift",
  startTime: "09:00 AM",
  endTime: "06:00 PM",
  lateGraceMinutes: 15,
  earlyExitThreshold: 15,
  overtimeThreshold: 60, // 1 hour
  missingPunchPolicy: "Manager Review Required before Payroll Hold",
  allowSelfApproval: false,
  weekendDays: ["Sunday"],
  alternateSaturdayEnabled: false,
  alternateSaturdayPattern: "2nd & 4th Saturday",
  weekendAttendancePolicy: "Mark as Weekly Off",
  weekendEffectiveFrom: "2026-09-01"
};
