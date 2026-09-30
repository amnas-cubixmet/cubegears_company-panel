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
  return apiClient.get('/api/attendance-manager/approvals');
};

export const updateApprovalStatus = async (approvalId, decision, note) => {
  if (USE_MOCK_API) {
    await delay();
    const item = mockManagerApprovals.find(a => a.id === approvalId);
    if (item) {
      item.status = decision === 'approve' ? 'Approved' : 'Rejected';
      item.managerNote = note;
    }
    return Promise.resolve(item);
  }
  return apiClient.post(`/api/attendance-manager/approvals/${approvalId}`, { decision, note });
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
  return apiClient.get('/api/attendance-manager/team', { params });
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

  return apiClient.put(`/api/attendance-manager/team/${attendanceId}`, {
    ...updates,
    auditReason
  });
};

export const getMasterRecords = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockMasterLedger]);
  }
  return apiClient.get('/api/attendance-manager/master', { params });
};

export const getLeaveTypes = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockLeaveTypesList]);
  }
  return apiClient.get('/api/attendance-manager/leave-types');
};

export const createLeaveType = async (payload) => {
  if (USE_MOCK_API) {
    await delay();
    const newRecord = {
      id: `LT-0${mockLeaveTypesList.length + 1}`,
      name: payload.name,
      code: payload.code,
      type: payload.type || (payload.isPaid ? 'Paid' : 'Unpaid'),
      allocation: payload.allocation || `${payload.annualAllocation || 12} Days / Year`,
      halfDay: payload.halfDay !== undefined ? payload.halfDay : true,
      carryForward: payload.carryForward || `${payload.maxCarryForward || 0} Days`,
      status: payload.status || 'Active'
    };
    mockLeaveTypesList.push(newRecord);
    return Promise.resolve(newRecord);
  }
  return apiClient.post('/api/attendance-manager/leave-types', payload);
};

export const getHolidays = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve([...mockHolidaysList]);
  }
  return apiClient.get('/api/attendance-manager/holidays');
};

export const getRules = async () => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve({ ...mockAttendanceRulesConfig });
  }
  return apiClient.get('/api/attendance-manager/rules');
};

export const saveRules = async (updatedRules) => {
  if (USE_MOCK_API) {
    await delay();
    Object.assign(mockAttendanceRulesConfig, updatedRules);
    return Promise.resolve({ ...mockAttendanceRulesConfig });
  }
  return apiClient.post('/api/attendance-manager/rules', updatedRules);
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
  return apiClient.get(`/api/attendance-manager/staff-details/${staffId}/${date}`);
};

export const attendanceManagerService = {
  getApprovals,
  updateApprovalStatus,
  getTeamAttendance,
  updateTeamAttendance,
  getMasterRecords,
  getLeaveTypes,
  createLeaveType,
  getHolidays,
  getRules,
  saveRules,
  getStaffAttendanceDetails
};
