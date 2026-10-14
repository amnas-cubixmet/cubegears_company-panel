// Shared normalization for the Django notifications API and optional mock mode.
// Django uses is_read; demo records may have status: "Unread" or "Read".
export const isNotificationUnread = (row) => {
  if (typeof row?.is_read === 'boolean') return !row.is_read;
  if (typeof row?.isRead === 'boolean') return !row.isRead;
  return String(row?.status || '').toLowerCase() === 'unread';
};

export const unreadNotificationCount = (rows) =>
  (Array.isArray(rows) ? rows : []).filter(isNotificationUnread).length;

export const normalizeNotification = (row = {}) => {
  const data = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {};
  const type = String(row.notification_type || row.notificationType || '');
  const attendanceAlert = type.startsWith('attendance_');
  const priority = row.priority ||
    (['attendance_leave_request', 'attendance_overtime_request', 'attendance_missing_punch'].includes(type)
      ? 'High' : 'Normal');

  return {
    ...row,
    title: typeof row.title === 'string' ? row.title : 'Notification',
    description: typeof row.description === 'string' ? row.description : String(row.message || ''),
    category: row.category || (attendanceAlert ? 'Approvals & People' : 'Operational'),
    priority,
    reference: row.reference || data.requestId || data.recordId || '',
    status: isNotificationUnread(row) ? 'Unread' : 'Read',
    created: row.created || row.created_at || row.createdAt || '',
    route: row.route || data.route || '',
  };
};
