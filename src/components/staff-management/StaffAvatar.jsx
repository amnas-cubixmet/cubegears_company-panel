import React, { useState } from 'react';
import { getStaffInitials } from './staffDisplay';

export const StaffAvatar = ({ staff, size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const photo = staff?.photo || staff?.photoUrl || staff?.avatar || '';

  if (photo && !failed) {
    return (
      <img
        className={`staff-avatar staff-avatar--${size} ${className}`}
        src={photo}
        alt={staff?.name || 'Staff'}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`staff-avatar staff-avatar--${size} staff-avatar--fallback ${className}`}
      aria-label={staff?.name || 'Staff'}
    >
      {getStaffInitials(staff?.name)}
    </div>
  );
};
