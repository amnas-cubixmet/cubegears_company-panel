import React from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const AddExpense = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px' }}>
      <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>Log New Expense</h2>
      <Input label="Category" placeholder="e.g. Shop Supplies" />
      <Input label="Amount ($)" type="number" placeholder="150.00" />
      <Button variant="primary">Record Expense</Button>
    </div>
  );
};
