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

          <label className="role-editor-field is-wide">
            <span>Branch Scope *</span>
            <select
              required
              value={formData.branchScope}
              onChange={(event) => setFormData((current) => ({ ...current, branchScope: event.target.value }))}
            >
              <option value="Assigned Branch Only">Assigned Branch Only</option>
              <option value="Selected Branches">Selected Branches</option>
              <option value="All Permitted Company Branches">All Permitted Company Branches</option>
            </select>
          </label>
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
