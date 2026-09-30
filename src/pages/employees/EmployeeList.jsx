import React from 'react';
import { Table } from '../../components/common/Table';

export const EmployeeList = () => {
  const employees = [
    { id: 'EMP-01', name: 'Alex Rivera', role: 'Lead Mechanic', status: 'Active' },
    { id: 'EMP-02', name: 'Dan Miller', role: 'Diagnostic Specialist', status: 'Active' }
  ];

  const columns = [
    { key: 'id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div>
      <h1 style={{ color: '#f8fafc', marginBottom: '20px' }}>Staff & Employee Roster</h1>
      <Table
        columns={columns}
        data={employees}
        renderRow={(item) => (
          <>
            <td style={{ padding: '12px 16px', color: '#6366f1', fontWeight: '600' }}>{item.id}</td>
            <td style={{ padding: '12px 16px', color: '#f8fafc' }}>{item.name}</td>
            <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{item.role}</td>
            <td style={{ padding: '12px 16px', color: '#34d399' }}>{item.status}</td>
          </>
        )}
      />
    </div>
  );
};
