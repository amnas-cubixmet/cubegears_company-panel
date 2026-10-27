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

/**
 * Parse YYYY-MM-DD or a backend ISO timestamp as a local calendar day.
 * Avoid interpreting a date-only string in UTC or appending a second 'T'.
 */
export const parseAttendanceLocalDate = (value) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};
