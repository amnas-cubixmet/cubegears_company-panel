export const getEmployeeSequence = (staff = {}, fallbackIndex = 0) => {
  const source =
    staff.displayEmployeeNo ||
    staff.employeeId ||
    staff.employee_code ||
    '';

  const match = String(source).match(/(\d+)(?!.*\d)/);
  if (match) return Number(match[1]);

  return Number(fallbackIndex) + 1;
};

export const getEmployeeLabel = (staff = {}, fallbackIndex = 0) =>
  `Employee ${getEmployeeSequence(staff, fallbackIndex)}`;

export const getStaffInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'ST';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
