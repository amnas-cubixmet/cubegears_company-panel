import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Settings } from 'lucide-react';

export const MobileNav = () => {
  return (
    <div style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: '#1e293b',
      borderTop: '1px solid #334155',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 50
    }}>
      <NavLink to="/dashboard" style={{ color: '#94a3b8' }}><LayoutDashboard size={20} /></NavLink>
      <NavLink to="/customers" style={{ color: '#94a3b8' }}><Users size={20} /></NavLink>
      <NavLink to="/jobs" style={{ color: '#94a3b8' }}><ClipboardList size={20} /></NavLink>
      <NavLink to="/settings" style={{ color: '#94a3b8' }}><Settings size={20} /></NavLink>
    </div>
  );
};
