import React from 'react';
import { Building2, Clock3, UserRound } from 'lucide-react';

export const EmployeeAttendanceCard = ({ employee }) => {
  if (!employee) return null;

  const meta = [
    employee.employeeCode
      ? { label: 'Employee ID', value: employee.employeeCode, icon: UserRound }
      : null,
    employee.branchName
      ? { label: 'Branch', value: employee.branchName, icon: Building2 }
      : null,
    employee.shiftName
      ? { label: 'Shift', value: employee.shiftName, icon: Clock3 }
      : null,
  ].filter(Boolean);

  return (
    <section className="attendance-employee-card">
      <div className="attendance-employee-main">
        <div className="attendance-employee-avatar">
          <UserRound size={22} />
        </div>

        <div className="attendance-employee-copy">
          <span>Employee</span>
          <h3>{employee.name}</h3>
          {employee.roleName ? <p>{employee.roleName}</p> : null}
        </div>
      </div>

      {meta.length > 0 && (
        <div className="attendance-employee-meta">
          {meta.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <Icon size={14} />
              <span>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
