import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission } from '../../utils/permissions';
import { branchService } from '../../services/branch.service';

export const StaffDirectoryToolbar = ({
  query,
  onQueryChange,
  branch,
  onBranchChange,
  status,
  onStatusChange,
  onAdd,
}) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    branchService.getBranches()
      .then((rows) =>
        setBranches(
          (Array.isArray(rows) ? rows : []).filter(
            (item) => item.is_active !== false,
          ),
        ),
      )
      .catch(() => setBranches([]));
  }, []);

  return (
    <section className="staff-directory-toolbar">
      <label className="staff-directory-search">
        <Search size={14} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search staff name, employee number or designation"
        />
      </label>

      <select value={branch} onChange={(event) => onBranchChange(event.target.value)}>
        <option value="All">All Branches</option>
        {branches.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
        <option value="All">All Status</option>
        <option value="Active">Active</option>
        <option value="Probation">Probation</option>
        <option value="Notice Period">Notice Period</option>
        <option value="Suspended">Suspended</option>
        <option value="Resigned">Resigned</option>
        <option value="Terminated">Terminated</option>
        <option value="Inactive">Inactive</option>
      </select>

      {hasPermission(user, 'staff.create') && (
        <button type="button" className="staff-add-button" onClick={onAdd}>
          <Plus size={14} />
          Add Staff
        </button>
      )}
    </section>
  );
};
