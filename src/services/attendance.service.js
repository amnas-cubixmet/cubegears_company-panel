import { USE_MOCK_API } from '../api/apiConfig';
import { API_ENDPOINTS } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { getMockAttendanceLogs, getMockCalendarEvents, mockPersonalAttendanceLogs } from '../mock/attendance.mock';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPersonalAttendanceLogs = async (params) => {
  if (USE_MOCK_API) {
    await delay();
    let logs = getMockAttendanceLogs();
    if (params?.status && params.status !== 'ALL') {
      logs = logs.filter(l => l.status === params.status);
    }
    return Promise.resolve(logs);
  }
  return apiClient.get('/api/my-attendance/logs', { params });
};

export const getCalendarEvents = async (month, year) => {
  if (USE_MOCK_API) {
    await delay();
    return Promise.resolve(getMockCalendarEvents());
  }
  return apiClient.get('/api/my-attendance/calendar', { params: { month, year } });
};

export const submitPunchCorrection = async (correctionData) => {
  if (USE_MOCK_API) {
    await delay();
    const log = mockPersonalAttendanceLogs.find(l => l.id === correctionData.attendanceId);
    if (log) {
      log.correction = {
        id: `CORR-${Math.floor(1000 + Math.random() * 9000)}`,
        originalClockOut: correctionData.originalClockOut || 'Missing',
        proposedClockOut: correctionData.proposedClockOut,
        reason: correctionData.reason,
        status: 'Pending',
        submittedAt: new Date().toISOString()
      };
    }
    return Promise.resolve(log?.correction);
  }
  return apiClient.post('/api/my-attendance/corrections', correctionData);
};

export const attendanceService = {
  getPersonalAttendanceLogs,
  getCalendarEvents,
  submitPunchCorrection
};
