import React from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const AddEmployee = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Register Employee</h2>
      <Input label="Full Name" placeholder="Jane Doe" />
      <Input label="Role" placeholder="Technician" />
      <Button variant="primary">Save Employee</Button>
    </div>
  );
};
