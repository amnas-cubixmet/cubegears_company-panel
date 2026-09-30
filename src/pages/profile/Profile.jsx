import React from 'react';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="profile-page-simple">
      <header className="profile-page-head">
        <div><span className="profile-kicker">ACCOUNT</span><h1>Profile</h1><p>Your workshop account and role information.</p></div>
        <button type="button" className="profile-settings-btn" onClick={() => navigate('/settings')}><Settings size={16}/> Settings</button>
      </header>
      <section className="profile-card-simple">
        <div className="profile-avatar-large">{user?.avatar ? <img src={user.avatar} alt="Profile"/> : <User size={30}/>}</div>
        <div className="profile-main-copy"><h2>{user?.name || 'User'}</h2><span>{user?.role || 'ADMIN'}</span></div>
        <div className="profile-info-grid">
          <div><span>Email</span><strong>{user?.email || 'Not set'}</strong></div>
          <div><span>Phone</span><strong>{user?.phone || 'Not set'}</strong></div>
          <div><span>Role</span><strong>{user?.role || 'ADMIN'}</strong></div>
          <div><span>Workspace</span><strong>CubeGears</strong></div>
        </div>
      </section>
    </div>
  );
};
