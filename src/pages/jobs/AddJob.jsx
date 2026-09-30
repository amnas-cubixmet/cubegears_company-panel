import React from 'react';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';

export const AddJob = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Create New Job Card</h2>
      <Select label="Customer" options={[{ value: '1', label: 'Sarah Jenkins' }, { value: '2', label: 'Michael Chang' }]} />
      <Select label="Vehicle" options={[{ value: '1', label: 'Toyota Camry' }, { value: '2', label: 'BMW X5' }]} />
      <Input label="Primary Issue / Service Notes" placeholder="e.g. Engine noise during startup" />
      <Button variant="primary">Create Job Card</Button>
    </div>
  );
};
