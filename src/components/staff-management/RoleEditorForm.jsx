import React from 'react';
import { Save } from 'lucide-react';
import { RolePermissionMatrix } from './RolePermissionMatrix';

export const RoleEditorForm = ({
  editingRole,
  formData,
  setFormData,
  modules,
  saving,
  onSubmit,
  onCancel,
  onPermissionToggle,
  onToggleModule,
}) => {
  const protectedRole = Boolean(editingRole?.isProtected);

  return (
    <form className="role-editor-form" onSubmit={onSubmit}>
      <section className="role-editor-card">
        <div className="role-editor-grid">
          <label className="role-editor-field">
            <span>Role Name *</span>
            <input
              type="text"
              required
              disabled={protectedRole}
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Workshop Supervisor"
            />
          </label>

          <label className="role-editor-field">
            <span>Role Status</span>
            <select
              value={formData.status}
              disabled={protectedRole}
              onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label className="role-editor-field is-wide">
            <span>Description</span>
            <input
              type="text"
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              placeholder="Brief summary of role responsibilities"
            />
          </label>

          <div className="role-editor-field is-wide">
            <span>Access scope</span>
            <p role="note">Permissions apply within this company. Branch-specific restrictions are not available yet.</p>
          </div>
        </div>
      </section>

      <RolePermissionMatrix
        modules={modules}
        permissions={formData.permissions}
        protectedRole={protectedRole}
        onToggle={onPermissionToggle}
        onToggleModule={onToggleModule}
      />

      <div className="role-editor-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="is-primary" disabled={saving || protectedRole}>
          <Save size={14} />
          {protectedRole ? 'Protected Full Access' : saving ? 'Saving…' : 'Save Role'}
        </button>
      </div>
    </form>
  );
};
