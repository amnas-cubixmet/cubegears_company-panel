import React from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

export const RolesHeader = ({ onAdd, canManage = false }) => (
  <section className="roles-dashboard-header">
    <div>
      <h2>Company User Roles</h2>
      <p>Company Owner creates staff roles and chooses their module permissions.</p>
    </div>

    <div className="roles-dashboard-header-actions">
      <div className="roles-dashboard-badge">
        <ShieldCheck size={13} />
        <span>RBAC</span>
      </div>

      {canManage && (
        <button type="button" className="roles-primary-button" onClick={onAdd}>
          <Plus size={14} />
          Add New Role
        </button>
      )}
    </div>
  </section>
);
