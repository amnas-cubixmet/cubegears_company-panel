import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/role.service';
import { Shield, Plus, Users, Building, Check, Save } from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

export const UserRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const availableModules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'customers', label: 'Customers' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'services', label: 'Services' },
    { key: 'jobs', label: 'Job Cards' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'stock', label: 'Stock Management' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'payments', label: 'Payments' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'staff', label: 'Staff' },
    { key: 'payroll', label: 'Payroll' },
    { key: 'reports', label: 'Reports' },
    { key: 'website', label: 'Website' },
    { key: 'settings', label: 'Settings' }
  ];

  const actionsList = ['view', 'create', 'edit', 'archive', 'approve', 'export'];

  const initialPermissions = () => {
    const perm = {};
    availableModules.forEach((m) => {
      perm[m.key] = { view: true, create: false, edit: false, archive: false, approve: false, export: false };
    });
    return perm;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    branchScope: 'Assigned Branch Only',
    selectedBranches: ['Main Garage Branch'],
    status: 'Active',
    permissions: initialPermissions()
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      branchScope: 'Assigned Branch Only',
      selectedBranches: ['Main Garage Branch'],
      status: 'Active',
      permissions: initialPermissions()
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      branchScope: role.branchScope || 'Assigned Branch Only',
      selectedBranches: role.selectedBranches || ['Main Garage Branch'],
      status: role.status || 'Active',
      permissions: role.permissions || initialPermissions()
    });
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (moduleKey, actionKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [actionKey]: !prev.permissions[moduleKey]?.[actionKey]
        }
      }
    }));
  };

  const handleSelectAllModule = (moduleKey, enableAll) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          view: enableAll,
          create: enableAll,
          edit: enableAll,
          archive: enableAll,
          approve: enableAll,
          export: enableAll
        }
      }
    }));
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.name.trim() || !formData.branchScope) {
      alert('Role Name and Branch Scope are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, formData);
        setToastMsg('Role updated successfully.');
      } else {
        await roleService.createRole(formData);
        setToastMsg('Role created successfully.');
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 3000);
      loadRoles();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const countEnabledPermissions = (perms) => {
    if (!perms) return 0;
    let count = 0;
    Object.values(perms).forEach((mod) => {
      Object.values(mod).forEach((val) => {
        if (val) count++;
      });
    });
    return count;
  };

  return (
    <div className="staff-roles" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Toast Feedback */}
      {toastMsg && (
        <div style={{
          backgroundColor: 'var(--success)',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header UI Fix (Stacked on Mobile, Row on Desktop) */}
      <div className="user-role-header staff-section-header" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '100%' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', lineHeight: 1.25 }}>
            Company User Roles
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5, width: '100%', maxWidth: '100%' }}>
            Configure custom roles, branch scopes, and module permission guards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="add-role-btn"
          style={{
            height: '46px',
            padding: '0 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={16} /> Add New Role
        </button>
      </div>

      {/* Role List Cards */}
      <div className="role-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', width: '100%' }}>
        {roles.map((r) => (
          <div
            key={r.id}
            className="role-card"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} style={{ color: r.isProtected ? 'var(--warning)' : 'var(--primary)' }} />
                  {r.name}
                  {r.isProtected && (
                    <span style={{ fontSize: '10px', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', padding: '1px 5px', borderRadius: '4px' }}>
                      Protected
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.description}</div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: r.status === 'Active' ? 'var(--success-soft)' : 'var(--danger-soft)',
                color: r.status === 'Active' ? 'var(--success)' : 'var(--danger)'
              }}>
                {r.status || 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div><Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Users Assigned: <strong>{r.usersCount}</strong></div>
              <div><Building size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Branch Scope: <strong>{r.branchScope}</strong></div>
              <div><Shield size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Permissions: <strong>{countEnabledPermissions(r.permissions)} Enabled</strong></div>
            </div>

            <button
              onClick={() => handleOpenEdit(r)}
              style={{
                width: '100%',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Edit Role & Permissions
            </button>
          </div>
        ))}
      </div>

      {/* Role Add/Edit Responsive Sheet / Modal */}
      <ResponsiveModalSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Add New Role'}
        maxWidth="720px"
      >
        <form className="role-form-sheet" onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Role Name *
            </label>
            <input
              type="text"
              required
              disabled={editingRole?.isProtected}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Workshop Supervisor"
              style={{
                width: '100%',
                height: '46px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of role responsibilities..."
              style={{
                width: '100%',
                height: '46px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Branch Scope *
              </label>
              <select
                required
                value={formData.branchScope}
                onChange={(e) => setFormData({ ...formData, branchScope: e.target.value })}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Assigned Branch Only">Assigned Branch Only</option>
                <option value="Selected Branches">Selected Branches</option>
                <option value="All Permitted Company Branches">All Permitted Company Branches</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Role Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={editingRole?.isProtected}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Module Permission Touch-Friendly Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Module Permissions</div>
            {availableModules.map((mod) => {
              const currentModPerms = formData.permissions[mod.key] || {};
              const allChecked = actionsList.every((act) => !!currentModPerms[act]);

              return (
                <div
                  key={mod.key}
                  className="permission-module-card"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{mod.label}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllModule(mod.key, !allChecked)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {allChecked ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {actionsList.map((act) => {
                      const isChecked = !!currentModPerms[act];
                      return (
                        <label
                          key={act}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: isChecked ? 'var(--primary-soft, rgba(59,130,246,0.1))' : 'var(--surface)',
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            fontWeight: isChecked ? '700' : '500',
                            color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(mod.key, act)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          {act === 'archive' ? 'Archive' : act}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Action Footer Bar */}
          <div className="role-form-actions" style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'var(--surface)'
          }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
