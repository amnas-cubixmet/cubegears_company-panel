export const mockPersonalAttendanceLogs = [
  {
    id: "ATT-2026-0912",
    date: "2026-09-12",
    dayOfWeek: "Saturday",
    status: "Present",
    shiftName: "General Shift (09:00 AM - 06:00 PM)",
    totalWorkedMinutes: 525, // 8h 45m
    lateMinutes: 2,
    earlyExitMinutes: 0,
    sessions: [
      {
        id: "SES-101",
        clockIn: "09:02 AM",
        clockOut: "01:05 PM",
        duration: "4h 03m"
      },
      {
        id: "SES-102",
        clockIn: "02:01 PM",
        clockOut: "06:43 PM",
        duration: "4h 42m"
      }
    ],
    correction: null
  },
  {
    id: "ATT-2026-0911",
    date: "2026-09-11",
    dayOfWeek: "Friday",
    status: "Present",
    shiftName: "General Shift (09:00 AM - 06:00 PM)",
    totalWorkedMinutes: 480, // 8h 00m
    lateMinutes: 15,
    earlyExitMinutes: 0,
    sessions: [
      {
        id: "SES-201",
        clockIn: "09:15 AM",
        clockOut: "05:15 PM",
        duration: "8h 00m"
      }
    ],
    correction: null
  },
  {
    id: "ATT-2026-0910",
    date: "2026-09-10",
    dayOfWeek: "Thursday",
    status: "Missing Clock Out",
    locationStatus: "OK",
    locationName: "Main Workshop",
    shiftName: "General Shift (09:00 AM - 06:00 PM)",
    totalWorkedMinutes: 240, // 4h 00m recorded so far
    lateMinutes: 0,
    earlyExitMinutes: 0,
    sessions: [
      {
        id: "SES-301",
        clockIn: "09:00 AM",
        clockOut: null,
        duration: "Incomplete",
        location: "Main Workshop",
        gpsVerified: true
      }
    ],
    correction: {
      id: "CORR-0910",
      originalClockOut: "Missing",
      proposedClockOut: "06:00 PM",
      reason: "Forgot to clock out before leaving garage premises.",
      status: "Pending",
      submittedAt: "2026-09-10T19:30:00Z"
    }
  },
  {
    id: "ATT-2026-0909",
    date: "2026-09-09",
    dayOfWeek: "Wednesday",
    status: "Present",
    locationStatus: "OK",
    locationName: "Main Workshop",
    shiftName: "General Shift (09:00 AM - 06:00 PM)",
    totalWorkedMinutes: 510, // 8h 30m
    lateMinutes: 0,
    earlyExitMinutes: 0,
    sessions: [
      {
        id: "SES-401",
        clockIn: "08:55 AM",
        clockOut: "05:25 PM",
        duration: "8h 30m",
        location: "Main Workshop",
        gpsVerified: true
      }
    ],
    correction: {
      id: "CORR-0909",
      originalClockOut: "05:10 PM",
      proposedClockOut: "05:25 PM",
      reason: "Clock-out scanner delayed during shift handover.",
      status: "Approved",
      approvedBy: "Branch Manager",
      approvedAt: "2026-09-09T18:20:00Z",
      submittedAt: "2026-09-09T17:30:00Z"
    }
  },
  {
    id: "ATT-2026-0908",
    date: "2026-09-08",
    dayOfWeek: "Tuesday",
    status: "On Leave",
    leaveType: "Casual Leave",
    totalWorkedMinutes: 0,
    sessions: [],
    correction: null
  },
  {
    id: "ATT-2026-0907",
    date: "2026-09-07",
    dayOfWeek: "Monday",
    status: "Present",
    locationStatus: "GPS Unavailable",
    locationName: "Main Workshop",
    shiftName: "General Shift (09:00 AM - 06:00 PM)",
    totalWorkedMinutes: 480,
    lateMinutes: 0,
    earlyExitMinutes: 20,
    sessions: [
      {
        id: "SES-501",
        clockIn: "09:00 AM",
        clockOut: "05:00 PM",
        duration: "8h 00m",
        location: "GPS Signal Low",
        gpsVerified: false
      }
    ],
    correction: null
  },
  {
    id: "ATT-2026-0906",
    date: "2026-09-06",
    dayOfWeek: "Sunday",
    status: "Weekly Off",
    totalWorkedMinutes: 0,
    sessions: [],
    correction: null
  },
  {
    id: "ATT-2026-0905",
    date: "2026-09-05",
    dayOfWeek: "Saturday",
    status: "Holiday",
    holidayName: "Teachers Day Workshop Break",
    totalWorkedMinutes: 0,
    sessions: [],
    correction: null
  }
];

export const mockCalendarEvents = [
  { date: "2026-09-05", title: "Teachers Day Break", type: "Company Holiday" },
  { date: "2026-09-06", title: "Sunday Weekly Off", type: "Weekly Off" },
  { date: "2026-09-08", title: "Casual Leave (Approved)", type: "Approved Leave" },
  { date: "2026-09-13", title: "Sunday Weekly Off", type: "Weekly Off" },
  { date: "2026-09-15", title: "Onam Festival Holiday", type: "Company Holiday" },
  { date: "2026-09-16", title: "Third Onam Branch Break", type: "Branch Holiday" },
  { date: "2026-09-20", title: "Sunday Weekly Off", type: "Weekly Off" },
  { date: "2026-09-27", title: "Sunday Weekly Off", type: "Weekly Off" }
];

export const getMockAttendanceLogs = () => [...mockPersonalAttendanceLogs];
export const getMockCalendarEvents = () => [...mockCalendarEvents];
