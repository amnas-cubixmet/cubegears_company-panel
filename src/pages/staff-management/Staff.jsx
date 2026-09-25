import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { Search, Plus, Filter, User, Phone, Mail, Building, Calendar, Shield, MoreVertical, Eye, Power } from 'lucide-react';
import { StaffFormSheet } from '../../components/staff-management/StaffFormSheet';
import { StaffProfile } from './staff/StaffProfile';

export const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await staffService.getStaff();
      setStaffList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (formData) => {
    if (selectedStaff) {
      await staffService.updateStaff(selectedStaff.id, formData);
      setToastMsg('Staff member updated successfully.');
    } else {
      await staffService.createStaff(formData);
      setToastMsg('Staff member added successfully.');
    }
    setTimeout(() => setToastMsg(''), 3000);
    loadStaff();
  };

  const handleToggleStatus = async (e, id) => {
    e.stopPropagation();
    await staffService.toggleAccountStatus(id);
    loadStaff();
  };

  const filteredStaff = staffList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase()) ||
                          item.designation.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || item.branch === selectedBranch;
    const matchesStatus = selectedStatus === 'All' || item.employmentStatus === selectedStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  if (viewingProfileId) {
    return (
      <StaffProfile
        staffId={viewingProfileId}
        onBack={() => {
          setViewingProfileId(null);
          loadStaff();
        }}
      />
    );
  }

  return (
    <div className="staff-directory" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
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

      {/* Header Bar & Actions */}
      <div className="staff-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search staff name, ID, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '36px',
                paddingRight: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            aria-label="Filter staff by branch"
            style={{ height: '40px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
          >
            <option value="All">All Branches</option>
            <option value="Main Garage Branch">Main Garage Branch</option>
            <option value="Kochi South Branch">Kochi South Branch</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter staff by status"
            style={{ height: '40px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Notice Period">Notice Period</option>
            <option value="Suspended">Suspended</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="staff-add-button"
            onClick={() => {
              setSelectedStaff(null);
              setIsFormOpen(true);
            }}
            style={{
              height: '40px',
              padding: '0 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Cards (Mobile/Responsive view) */}
      <div className="staff-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', width: '100%' }}>
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="staff-member-card"
            onClick={() => setViewingProfileId(staff.id)}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={staff.photo}
                  alt={staff.name}
                  style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{staff.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{staff.id} • {staff.designation}</div>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: staff.employmentStatus === 'Active' ? 'var(--success-soft)' : ['Probation', 'Notice Period'].includes(staff.employmentStatus) ? 'var(--warning-soft)' : 'var(--danger-soft)',
                color: staff.employmentStatus === 'Active' ? 'var(--success)' : ['Probation', 'Notice Period'].includes(staff.employmentStatus) ? 'var(--warning)' : 'var(--danger)'
              }}>
                {staff.employmentStatus}
              </span>
            </div>

            {/* Info list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} style={{ color: 'var(--text-muted)' }} /> {staff.branch}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: 'var(--text-muted)' }} /> {staff.department || 'Workshop'} · {staff.role}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} style={{ color: 'var(--text-muted)' }} /> Shift: {staff.shift}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> Joined: {staff.joiningDate}
              </div>
            </div>

            {staff.skills?.length ? (
              <div className="staff-directory-skills">
                {staff.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
                {staff.skills.length > 3 ? <span>+{staff.skills.length - 3}</span> : null}
              </div>
            ) : null}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '2px' }}>
              <button
                className="staff-view-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingProfileId(staff.id);
                }}
                style={{
                  flex: 1,
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={14} /> View Profile
              </button>

              <button
                className="staff-status-button"
                onClick={(e) => handleToggleStatus(e, staff.id)}
                title={staff.accountStatus === 'Active' ? 'Deactivate Staff' : 'Activate Staff'}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: staff.accountStatus === 'Active' ? 'var(--danger-soft)' : 'var(--success-soft)',
                  border: 'none',
                  color: staff.accountStatus === 'Active' ? 'var(--danger)' : 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Power size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Add/Edit Form Dialog */}
      <StaffFormSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveStaff}
        initialData={selectedStaff}
      />
    </div>
  );
};
