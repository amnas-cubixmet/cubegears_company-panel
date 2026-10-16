import React, { useEffect, useState } from 'react';
import {
  RoleCardGrid,
  RoleEditorForm,
  RoleOverviewStats,
  RolesHeader,
} from '../../components/staff-management';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import {
  ROLE_PERMISSION_MODULES,
  createPermissionMatrix,
} from '../../config/rolePermissions';
import { roleService } from '../../services/role.service';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { appConfirm } from '../../components/common/appDialogs';

const createInitialForm = () => ({
  name: '',
  status: 'Active',
  permissions: createPermissionMatrix(false),
});

export const UserRoles = () => {
  const { isCompanyOwner } = useFeatureAccess();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(createInitialForm());

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    setRoles([]);

    try {
      const data = await roleService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleOpenAdd = () => {
    if (!isCompanyOwner) return;
    setEditingRole(null);
    setFormData(createInitialForm());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    if (!isCompanyOwner) return;
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      code: role.code,
      status: role.status || 'Active',
      permissions: role.permissions || createPermissionMatrix(false),
    });
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (moduleKey, actionKey) => {
    setFormData((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [moduleKey]: {
          ...current.permissions[moduleKey],
          [actionKey]: !current.permissions[moduleKey]?.[actionKey],
        },
      },
    }));
  };

  const handleSelectAllModule = (moduleKey, enableAll) => {
    const module = ROLE_PERMISSION_MODULES.find((item) => item.key === moduleKey);
    const nextPermissions = Object.fromEntries(
      (module?.actions || []).map((action) => [action, enableAll]),
    );

    setFormData((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [moduleKey]: nextPermissions,
      },
    }));
  };

  const handleSaveRole = async (event) => {
    event.preventDefault();
    if (!isCompanyOwner || saving || editingRole?.isProtected) return;

    if (!formData.name.trim()) {
      setError('Role Name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          ...formData,
          isProtected: editingRole.isProtected,
        });
        setToastMsg('Role updated successfully.');
      } else {
        await roleService.createRole(formData);
        setToastMsg('Role created successfully.');
      }

      setIsModalOpen(false);
      setEditingRole(null);
      setFormData(createInitialForm());
      await loadRoles();

      window.setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setError(err?.message || 'Unable to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!isCompanyOwner || saving || role.isProtected || Number(role.usersCount) > 0) return;
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    setSaving(true);
    setError('');
    try {
      await roleService.deleteRole(role.id);
      await loadRoles();
      setToastMsg('Role deleted successfully.');
    } catch (err) {
      setError(err?.message || 'Unable to delete this role.');
    } finally {
      setSaving(false);
    }
  };

  const countEnabledPermissions = (permissions) => {
    if (!permissions || typeof permissions !== 'object') return 0;

    return Object.values(permissions).reduce((total, modulePermissions) => {
      if (!modulePermissions || typeof modulePermissions !== 'object') return total;
      return total + Object.values(modulePermissions).filter(Boolean).length;
    }, 0);
  };

  return (
    <div className="staff-roles roles-dashboard">
      {toastMsg && <div className="roles-dashboard-toast">{toastMsg}</div>}
      {error && <div className="roles-dashboard-error">{error}</div>}

      <RolesHeader onAdd={handleOpenAdd} canManage={isCompanyOwner} />
      {!isCompanyOwner && (
        <p role="note" className="roles-dashboard-info">
          Only the company owner can create, edit or delete Roles & Permissions.
        </p>
      )}

      {loading ? (
        <div className="roles-dashboard-loading">Loading company roles…</div>
      ) : (
        <>
          <RoleOverviewStats roles={roles} />

          <RoleCardGrid
            roles={roles}
            countPermissions={countEnabledPermissions}
            onOpen={handleOpenEdit}
            onDelete={handleDeleteRole}
            canManage={isCompanyOwner}
          />
        </>
      )}

      <ResponsiveModalSheet
        isOpen={isCompanyOwner && isModalOpen}
        onClose={() => {
          if (saving) return;
          setIsModalOpen(false);
          setError('');
        }}
        title={editingRole ? `Role: ${editingRole.name}` : 'Add New Role'}
        maxWidth="760px"
      >
        <RoleEditorForm
          editingRole={editingRole}
          formData={formData}
          setFormData={setFormData}
          modules={ROLE_PERMISSION_MODULES}
          saving={saving}
          onSubmit={handleSaveRole}
          onCancel={() => {
            setIsModalOpen(false);
            setError('');
          }}
          onPermissionToggle={handlePermissionToggle}
          onToggleModule={handleSelectAllModule}
        />
      </ResponsiveModalSheet>
    </div>
  );
};
