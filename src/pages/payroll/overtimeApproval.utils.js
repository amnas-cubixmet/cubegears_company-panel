export const PAYROLL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const monthNumber = (month) => {
  const value = String(month || '').trim();
  if (!value || value.toLowerCase() === 'all') return null;
  const index = PAYROLL_MONTHS.findIndex(name => name.toLowerCase() === value.toLowerCase());
  if (index >= 0) return index + 1;
  if (/^(?:[1-9]|0[1-9]|1[0-2])$/.test(value)) return Number(value);
  return null;
};

export const overtimeWorkDate = row =>
  String(row.date || row.affectedDate || row.affected_date || '').slice(0, 10);

export const overtimePeriod = row => {
  const raw = String(row.payrollMonth || row.payroll_month || '').trim();
  if (/^\d{4}-(?:0[1-9]|1[0-2])$/.test(raw)) return raw;
  const date = overtimeWorkDate(row);
  return /^\d{4}-(?:0[1-9]|1[0-2])-\d{2}$/.test(date) ? date.slice(0, 7) : '';
};

const same = (a,b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

export const pendingOvertime = rows => (Array.isArray(rows) ? rows : [])
  .filter(row => row.type === 'Overtime' && row.status === 'Pending');

export const filterOvertimeApprovals = (rows, { month='All', year='All', branch='All', staff='All', search='' } = {}) => {
  const monthIndex = monthNumber(month);
  const text = String(search).trim().toLowerCase();
  return pendingOvertime(rows).filter(row => {
    const period = overtimePeriod(row);
    if (monthIndex !== null && period.slice(5,7) !== String(monthIndex).padStart(2,'0')) return false;
    if (String(year) !== 'All' && period.slice(0,4) !== String(year)) return false;
    if (String(branch) !== 'All' &&
      !same(branch,row.branchId) && !same(branch,row.branchName) && !same(branch,row.branch)) return false;
    if (String(staff) !== 'All' &&
      !same(staff,row.employeeId) && !same(staff,row.staffId)) return false;
    if (text && ![
      row.staffName, row.staffId, row.employeeId, row.branchName, row.reason,
      overtimeWorkDate(row),
    ].some(value => String(value || '').toLowerCase().includes(text))) return false;
    return true;
  }).sort((a,b)=>overtimeWorkDate(b).localeCompare(overtimeWorkDate(a)));
};

export const overtimeHours = row => Number(row.minutes || 0) > 0 ?
  Number(row.minutes) / 60 : Number(row.overtimeHours || 0);

export const validOvertimeRate = raw => {
  const text = String(raw ?? '').trim();
  return /^\d+(?:\.\d{1,2})?$/.test(text) &&
    Number(text) > 0 && Number.isFinite(Number(text)) && Number(text) <= 99999999;
};

export const overtimeAmount = (row,rate) =>
  Math.round((overtimeHours(row) * Number(rate || 0) + Number.EPSILON)*100)/100;
