import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';
import {
  mockManagerApprovals,
  mockTeamAttendance,
  mockMasterLedger,
  mockLeaveTypesList,
  mockHolidaysList,
  mockAttendanceRulesConfig
} from '../mock/attendanceManager.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getApprovals = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockManagerApprovals]);
  }
  return apiClient.get('/attendance-manager/approvals');
};

export const updateApprovalStatus = async (approvalId, decision, note, extra = {}) => {
  if (USE_MOCK_API) {
    await delay();
    const item = mockManagerApprovals.find(a => a.id === approvalId);
    if (item) {
      item.status = decision === 'approve' ? 'Approved' : 'Rejected';
      item.managerNote = note;
      if (item.type === 'Overtime' && decision === 'approve') {
        const rate = Number(extra.rate || item.rate || 0);
        if (!rate || rate <= 0) throw new Error('Overtime rate is required before approval.');
        item.rate = rate;
        item.amount = Number((((Number(item.minutes || 0) / 60) || Number(item.overtimeHours || 0)) * rate).toFixed(2));
      }
    }
    return Promise.resolve(item);
  }
  return apiClient.post(`/attendance-manager/approvals/${approvalId}`, {
    decision,
    note,
    ...extra,
  });
};

export const getTeamAttendance = async (params = {}) => {
  if (USE_MOCK_API) {
    await delay();
    let result = [...mockTeamAttendance];

    if (params.branch && params.branch !== 'All') {
      result = result.filter((item) => item.branch === params.branch);
    }
    if (params.status && params.status !== 'All') {
      result = result.filter((item) => item.status === params.status);
    }
    if (params.role && params.role !== 'All') {
      result = result.filter((item) => item.designation === params.role);
    }

    return Promise.resolve(result);
  }
  return apiClient.get('/attendance-manager/team', { params });
};

export const createTeamAttendance = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    return { id: `ATT-${Date.now()}`, ...payload };
  }
  return apiClient.post('/attendance-manager/team', payload);
};

export const updateTeamAttendance = async (attendanceId, updates, auditReason = '') => {
  if (USE_MOCK_API) {
    await delay();
    const item = mockTeamAttendance.find((row) => row.id === attendanceId);
    if (!item) throw new Error('Attendance record not found.');

    item.auditHistory = item.auditHistory || [];
    item.auditHistory.unshift({
      action: 'Attendance Updated',
      reason: auditReason || 'Manager attendance correction',
      previousStatus: item.status,
      nextStatus: updates.status ?? item.status,
      actor: 'Attendance Manager',
      timestamp: new Date().toLocaleString()
    });

    Object.assign(item, updates);
    return Promise.resolve({ ...item });
  }

  return apiClient.put(`/attendance-manager/team/${attendanceId}`, {
    ...updates,
    auditReason
  });
};

export const getMasterRecords = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockMasterLedger]);
  }
  return apiClient.get('/attendance-manager/master', { params });
};

export const getLeaveTypes = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockLeaveTypesList]);
  }
  return apiClient.get('/attendance-manager/leave-types');
};

export const createLeaveType = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    const monthly = payload.allocationMethod === 'monthly';
    const newRecord = {
      id: `LT-0${mockLeaveTypesList.length + 1}`,
      name: payload.name,
      code: payload.code,
      type: 'Paid',
      allocationMethod: payload.allocationMethod || 'annual',
      annualAllocation: Number(payload.annualAllocation || 0),
      monthlyAllocation: Number(payload.monthlyAllocation || 0),
      allocation: monthly
        ? `${payload.monthlyAllocation || 0} Days / Month`
        : `${payload.annualAllocation || 0} Days / Year`,
      halfDay: payload.halfDay !== undefined ? payload.halfDay : true,
      carryForward: payload.carryForward || `${payload.maxCarryForward || 0} Days`,
      maxCarryForward: Number(payload.maxCarryForward || 0),
      status: payload.status || 'Active'
    };
    mockLeaveTypesList.push(newRecord);
    return Promise.resolve(newRecord);
  }
  return apiClient.post('/attendance-manager/leave-types', payload);
};

export const updateLeaveType = async (id, payload) => {
  if (USE_MOCK_API) {
    await delay();
    const index = mockLeaveTypesList.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Leave type not found.');
    const next = { ...mockLeaveTypesList[index], ...payload, type: 'Paid' };
    next.allocation =
      next.allocationMethod === 'monthly'
        ? `${next.monthlyAllocation || 0} Days / Month`
        : `${next.annualAllocation || 0} Days / Year`;
    mockLeaveTypesList[index] = next;
    return Promise.resolve({ ...next });
  }
  return apiClient.patch(`/attendance-manager/leave-types/${id}`, payload);
};

export const getHolidays = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockHolidaysList]);
  }
  return apiClient.get('/attendance-manager/holidays');
};

export const getRules = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve({ ...mockAttendanceRulesConfig });
  }
  return apiClient.get('/attendance-manager/rules');
};

export const saveRules = async (updatedRules) => {
  const payload = {
    ...updatedRules,
    weekendEffectiveFrom: updatedRules.weekendEffectiveFrom || null,
    startTime: String(updatedRules.startTime || '09:00').slice(0, 5),
    endTime: String(updatedRules.endTime || '18:00').slice(0, 5),
  };

  if (USE_MOCK_API) {
    await delay();
    Object.assign(mockAttendanceRulesConfig, payload);
    return Promise.resolve({ ...mockAttendanceRulesConfig });
  }

  return apiClient.post('/attendance-manager/rules', payload);
};

export const getMonthlyCalendar = async (month, year) => {
  if (USE_MOCK_API) {
    await delay();
    return { month, year, days: 30, employees: [], holidays: [] };
  }
  return apiClient.get('/attendance-manager/calendar', { params: { month, year } });
};

export const createHoliday = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    const row = { id: `HOL-${Date.now()}`, ...payload };
    mockHolidaysList.push(row);
    return row;
  }
  return apiClient.post('/attendance-manager/holidays', payload);
};

export const deleteHoliday = async (id) => {
  if (USE_MOCK_API) {
    await delay();
    const index = mockHolidaysList.findIndex((row) => row.id === id);
    if (index >= 0) mockHolidaysList.splice(index, 1);
    return true;
  }
  return apiClient.delete(`/attendance-manager/holidays/${id}`);
};

export const getShiftSetup = async () => {
  if (USE_MOCK_API) {
    await delay();
    return { shifts: [], teams: [], employees: [] };
  }
  return apiClient.get('/attendance-manager/shifts');
};

export const saveShift = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    return { id: payload.shiftId || `SHIFT-${Date.now()}`, ...payload };
  }
  return apiClient.post('/attendance-manager/shifts', {
    action: 'save_shift',
    ...payload,
  });
};

export const assignShift = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    return { assigned: payload.staffIds?.length || 0 };
  }
  return apiClient.post('/attendance-manager/shifts', {
    action: 'assign',
    ...payload,
  });
};

export const getStaffAttendanceDetails = async (staffId, date) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve({
      staffInfo: {
        id: staffId || "EMP-0012",
        name: "Ajmal K",
        designation: "Senior Mechanic",
        branch: "Main Garage Branch",
        shift: "General Shift (09:00 AM - 06:00 PM)",
        weeklyOff: "Sunday"
      },
      attendanceSummary: {
        date: date || "2026-09-12",
        status: "Present",
        workedHours: "10h 36m",
        lateMinutes: 4,
        earlyExitMinutes: 0,
        missingClockOut: false
      },
      sessions: [
        { clockIn: "09:04 AM", clockOut: "01:10 PM", duration: "4h 06m" },
        { clockIn: "02:00 PM", clockOut: "08:30 PM", duration: "6h 30m" }
      ],
      correctionInfo: {
        status: "Approved",
        originalClockOut: "Missing",
        correctedClockOut: "06:30 PM",
        reason: "Forgot to clock out before leaving garage premises during shift handover.",
        approvedBy: "Branch Manager",
        approvedAt: "12 Sep 2026 08:20 PM"
      },
      leaveInfo: null,
      auditHistory: [
        { action: "Clocked In", actor: "Ajmal K", timestamp: "12 Sep 2026 09:04 AM" },
        { action: "Punch Correction Requested", actor: "Ajmal K", timestamp: "12 Sep 2026 07:30 PM" },
        { action: "Punch Correction Approved", actor: "Branch Manager", timestamp: "12 Sep 2026 08:20 PM" },
        { action: "Overtime Submitted (2.5h)", actor: "Ajmal K", timestamp: "12 Sep 2026 08:35 PM" },
        { action: "Overtime Approved", actor: "Branch Manager", timestamp: "12 Sep 2026 09:00 PM" }
      ]
    });
  }
  const data = await apiClient.get(`/attendance-manager/staff-details/${staffId}/${date}`);

  const formatTime = (value) => {
    if (!value) return 'Missing';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMinutes = (value) => {
    if (typeof value === 'string' && value.includes('h')) return value;
    const minutes = Number(value || 0);
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
  };

  return {
    ...data,
    sessions: (data?.sessions || []).map((session) => ({
      ...session,
      clockIn: formatTime(session.clockIn),
      clockOut: session.clockOut ? formatTime(session.clockOut) : 'Missing',
      duration: formatMinutes(session.duration),
    })),
  };
};

export const attendanceManagerService = {
  getApprovals,
  updateApprovalStatus,
  getTeamAttendance,
  createTeamAttendance,
  updateTeamAttendance,
  getMasterRecords,
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getMonthlyCalendar,
  getShiftSetup,
  saveShift,
  assignShift,
  getRules,
  saveRules,
  getStaffAttendanceDetails
};
