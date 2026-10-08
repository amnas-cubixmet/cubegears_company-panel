import React from 'react';
import { Building2, ShieldCheck, Users } from 'lucide-react';

export const RoleCardGrid = ({
  roles,
  countPermissions,
  onOpen,
}) => (
  <section className="roles-dashboard-grid">
    {roles.map((role) => (
      <article key={role.id} className="roles-dashboard-card">
        <div className="roles-dashboard-card-head">
          <div>
            <div className="roles-dashboard-card-title">
              <ShieldCheck size={15} />
              <strong>{role.name}</strong>
              {role.isProtected && <span>Protected</span>}
            </div>
            <p>{role.description || 'Company role with configurable module access.'}</p>
          </div>

          <b className={(role.status || 'Active') === 'Active' ? 'is-active' : 'is-inactive'}>
            {role.status || 'Active'}
          </b>
        </div>

        <div className="roles-dashboard-card-meta">
          <div>
            <Users size={13} />
            <span>Users Assigned</span>
            <strong>{role.usersCount || 0}</strong>
          </div>
          <div>
            <Building2 size={13} />
            <span>Branch Scope</span>
            <strong>{role.branchScope || 'Assigned Branch Only'}</strong>
          </div>
          <div>
            <ShieldCheck size={13} />
            <span>Permissions</span>
            <strong>{countPermissions(role.permissions)} Enabled</strong>
          </div>
        </div>

        <button type="button" onClick={() => onOpen(role)}>
          {role.isProtected ? 'View Full Access' : 'Edit Role & Permissions'}
        </button>
      </article>
    ))}

    {!roles.length && (
      <div className="roles-dashboard-empty">No roles configured yet.</div>
    )}
  </section>
);
