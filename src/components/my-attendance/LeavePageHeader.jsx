import React from 'react';
import { FilePlus } from 'lucide-react';

export const LeavePageHeader = ({ onApply, disabled = false }) => (
  <section className="leave-page-heading">
    <div>
      <h2>Leave Management</h2>
      <p>Apply for unpaid leave and track approval status. Leave earns ₹0 base wage.</p>
    </div>

    <button
      type="button"
      className="leave-apply-button"
      onClick={onApply}
      disabled={disabled}
      title={disabled ? 'Please wait while leave records load.' : 'Apply for leave'}
    >
      <FilePlus size={14} />
      Apply Leave
    </button>
  </section>
);
