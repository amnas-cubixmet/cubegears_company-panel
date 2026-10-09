import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AttendanceManagerHeader = () => (
  <header className="attendance-manager-dashboard-header">
    <div>
      <h1>Attendance Manager</h1>
      <p>Team attendance, shifts, leave and company attendance rules.</p>
    </div>

    <div className="attendance-manager-header-badge">
      <ShieldCheck size={13} />
      <span>Company Rules Active</span>
    </div>
  </header>
);
