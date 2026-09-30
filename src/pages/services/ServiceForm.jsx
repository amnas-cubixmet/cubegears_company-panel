import React from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ServiceForm = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Create Service Catalog Item</h2>
      <Input label="Service Title" placeholder="e.g. Wheel Alignment" />
      <Input label="Duration (Minutes)" type="number" placeholder="45" />
      <Input label="Price ($)" type="number" placeholder="120.00" />
      <Button variant="primary">Save Service</Button>
    </div>
  );
};
