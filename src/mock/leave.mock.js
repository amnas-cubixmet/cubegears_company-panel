export const mockLeaveRequests = [
  {
    id: "LV-2026-004",
    type: "Leave",
    leaveMode: "Full Day",
    startDate: "2026-09-18",
    endDate: "2026-09-19",
    daysCount: 2,
    reason: "Family function in hometown.",
    status: "Pending",
    submittedAt: "2026-09-12T10:15:00Z",
    attachment: "invitation_letter.pdf",
    canCancel: true
  },
  {
    id: "LV-2026-003",
    type: "Leave",
    leaveMode: "Full Day",
    startDate: "2026-09-08",
    endDate: "2026-09-08",
    daysCount: 1,
    reason: "Personal work at vehicle registry office.",
    status: "Approved",
    approvedBy: "Branch Manager",
    approvedAt: "2026-09-07T14:30:00Z",
    submittedAt: "2026-09-06T09:00:00Z",
    attachment: null,
    canCancel: false
  },
  {
    id: "LV-2026-002",
    type: "Leave",
    leaveMode: "Half Day",
    halfDaySession: "Second Half",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    daysCount: 0.5,
    reason: "Doctor appointment for dental checkup.",
    status: "Approved",
    approvedBy: "Branch Manager",
    approvedAt: "2026-08-24T16:00:00Z",
    submittedAt: "2026-08-24T11:20:00Z",
    attachment: "medical_slip.png",
    canCancel: false
  },
  {
    id: "LV-2026-001",
    type: "Leave",
    leaveMode: "Full Day",
    startDate: "2026-07-10",
    endDate: "2026-07-14",
    daysCount: 5,
    reason: "Summer family vacation.",
    status: "Approved",
    approvedBy: "Branch Manager",
    approvedAt: "2026-07-02T11:00:00Z",
    submittedAt: "2026-07-01T15:45:00Z",
    attachment: null,
    canCancel: false
  }
];

export const getMockLeaveRequests = () => [...mockLeaveRequests];
