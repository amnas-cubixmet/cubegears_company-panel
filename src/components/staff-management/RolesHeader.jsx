import React from 'react';
import { Plus, ShieldCheck } from 'lucide-react';

export const RolesHeader = ({ onAdd }) => (
  <section className="roles-dashboard-header">
    <div>
      <h2>Company User Roles</h2>
      <p>Configure custom roles, branch scope and module-level access.</p>
    </div>

    <div className="roles-dashboard-header-actions">
      <div className="roles-dashboard-badge">
        <ShieldCheck size={13} />
        <span>RBAC</span>
      </div>

      <button type="button" className="roles-primary-button" onClick={onAdd}>
        <Plus size={14} />
        Add New Role
      </button>
    </div>
  </section>
);
