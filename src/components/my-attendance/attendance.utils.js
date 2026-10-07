export const statusTone = (status = '') => {
  const value = String(status || '').toLowerCase();
  if (value.includes('present')) return 'present';
  if (value.includes('leave')) return 'leave';
  if (value.includes('holiday')) return 'holiday';
  if (value.includes('off')) return 'off';
  if (value.includes('missing') || value.includes('late')) return 'late';
  return 'neutral';
};

export const minutesToHours = (minutes = 0) => {
  const total = Number(minutes || 0);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

export const formatAttendanceTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
