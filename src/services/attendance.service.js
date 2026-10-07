import { USE_MOCK_API } from '../api/apiConfig';
import apiClient from '../api/apiClient';
import { getMockAttendanceLogs, getMockCalendarEvents, mockPersonalAttendanceLogs } from '../mock/attendance.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const dayName = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { weekday: 'long' });
};

const normalizeSession = (session = {}, fallbackId = 'session') => ({
  ...session,
  id: session.id || fallbackId,
  clockIn: session.clockIn ?? session.clock_in ?? null,
  clockOut: session.clockOut ?? session.clock_out ?? null,
  workedMinutes: Number(session.workedMinutes ?? session.worked_minutes ?? 0),
  autoClosed: Boolean(session.autoClosed ?? session.auto_closed ?? false),
  source: session.source || 'web',
});

const normalizeAttendanceLog = (row = {}) => {
  const rawSessions = Array.isArray(row.sessions)
    ? row.sessions
    : (row.clock_in || row.clock_out)
      ? [{
          id: `${row.id || 'attendance'}-session`,
          clock_in: row.clock_in || null,
          clock_out: row.clock_out || null,
          worked_minutes: Number(row.worked_minutes ?? row.workedMinutes ?? 0),
        }]
      : [];

  return {
    ...row,
    dayOfWeek: row.dayOfWeek || dayName(row.date),
    shiftName: row.shiftName || 'General Shift (09:00 AM - 06:00 PM)',
    totalWorkedMinutes: Number(row.totalWorkedMinutes ?? row.worked_minutes ?? row.workedMinutes ?? 0),
    lateMinutes: Number(row.lateMinutes ?? row.late_minutes ?? 0),
    earlyExitMinutes: Number(row.earlyExitMinutes ?? row.early_exit_minutes ?? 0),
    overtimeMinutes: Number(row.overtimeMinutes ?? row.overtime_minutes ?? 0),
    sessions: rawSessions.map((session, index) =>
      normalizeSession(session, `${row.id || 'attendance'}-${index + 1}`)
    ),
  };
};

export const getPersonalAttendanceLogs = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    let logs = getMockAttendanceLogs();
    if (params?.status && params.status !== 'ALL' && params.status !== 'All') {
      logs = logs.filter((log) => log.status === params.status);
    }
    return logs.map(normalizeAttendanceLog);
  }

  const rows = await apiClient.get('/my-attendance/logs', { params });
  const list = Array.isArray(rows) ? rows : rows?.results || [];
  return list.map(normalizeAttendanceLog);
};

export const getCalendarEvents = async (month, year) => {
  if (USE_MOCK_API) {
    await delay();
    return getMockCalendarEvents();
  }

  const rows = await apiClient.get('/my-attendance/calendar', { params: { month, year } });
  return Array.isArray(rows) ? rows : rows?.results || [];
};

export const submitPunchCorrection = async (correctionData) => {
  if (USE_MOCK_API) {
    await delay();
    const log = mockPersonalAttendanceLogs.find((item) => item.id === correctionData.attendanceId);
    if (log) {
      log.correction = {
        id: `CORR-${Math.floor(1000 + Math.random() * 9000)}`,
        originalClockOut: correctionData.originalClockOut || 'Missing',
        proposedClockOut: correctionData.proposedClockOut,
        reason: correctionData.reason,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
      };
    }
    return log?.correction;
  }

  return apiClient.post('/my-attendance/corrections', correctionData);
};

export const attendanceService = {
  getPersonalAttendanceLogs,
  getCalendarEvents,
  submitPunchCorrection,
};
