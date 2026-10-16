import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';

export const RoleCardGrid = ({
  roles,
  countPermissions,
  onOpen,
  canManage = false,
  onDelete,
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
            <p>{role.isProtected ? 'Protected workshop owner role' : role.code}</p>
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
            <ShieldCheck size={13} />
            <span>Permissions</span>
            <strong>{countPermissions(role.permissions)} Enabled</strong>
          </div>
        </div>

        {canManage && (
          <div className="roles-dashboard-card-actions">
            <button type="button" onClick={() => onOpen(role)}>
              {role.isProtected ? 'View Owner Role' : 'Edit Permissions'}
            </button>
            {!role.isProtected && (
              <button type="button" disabled={Number(role.usersCount) > 0}
                title={Number(role.usersCount) > 0 ? 'Reassign assigned staff before deleting this role' : undefined}
                onClick={() => onDelete(role)}>
                Delete
              </button>
            )}
          </div>
        )}
      </article>
    ))}

    {!roles.length && (
      <div className="roles-dashboard-empty">No roles configured yet.</div>
    )}
  </section>
);
