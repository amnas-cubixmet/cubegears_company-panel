import React from 'react';
import { FilePlus } from 'lucide-react';

export const LeavePageHeader = ({ onApply, disabled = false }) => (
  <section className="leave-page-heading">
    <div>
      <h2>Leave Management</h2>
      <p>Check balances, apply for leave and track request status.</p>
    </div>

    <button
      type="button"
      className="leave-apply-button"
      onClick={onApply}
      disabled={disabled}
      title={disabled ? 'No active leave policy with available allocation.' : 'Apply for leave'}
    >
      <FilePlus size={14} />
      Apply Leave
    </button>
  </section>
);
