import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlobalSearch } from '../common/GlobalSearch';
import { resourceConfigs } from '../../pages/operations/resourceConfigs';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadNotificationCount = async () => {
      try {
        const rows = await resourceConfigs.notifications.service.list();
        if (mounted) setNotificationCount((Array.isArray(rows) ? rows : []).filter((row) => row.status === 'Unread').length);
      } catch {
        if (mounted) setNotificationCount(0);
      }
    };
    loadNotificationCount();
    const onStorage = (event) => {
      if (!event.key || event.key === 'cubixgear:notifications') loadNotificationCount();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
    };
  }, [location.pathname]);

  useEffect(() => {
    const close = (event) => {
      const inDesktopProfile = desktopProfileRef.current?.contains(event.target);
      const inMobileProfile = mobileProfileRef.current?.contains(event.target);
      if (!inDesktopProfile && !inMobileProfile) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (path) => {
    setProfileDropdownOpen(false);
    navigate(path);
  };

  const pageTitle = location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'Workspace';

  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderProfileMenu = () => (
    <div className="header-profile-menu">
      <button type="button" onClick={() => go('/profile')}><User size={15}/> Profile & Account</button>
      <button type="button" onClick={() => go('/settings')}><Settings size={15}/> Settings</button>
      <div className="header-menu-separator" />
      <button type="button" className="is-danger" onClick={() => { setProfileDropdownOpen(false); logout(); }}><LogOut size={15}/> Logout</button>
    </div>
  );

  return (
    <header className="app-header">
      <div className="desktop-header-row">
        <div className="header-page-title">{pageTitle}</div>

        <div className="header-actions">
          <div className="header-search-wrap">
            <GlobalSearch />
          </div>

          <div className="header-date">
            <CalendarDays size={13}/>
            <span>{dateLabel}</span>
          </div>

          <button type="button" className="header-icon-button has-notification-count" onClick={() => navigate('/notifications')} aria-label={`Notifications, ${notificationCount} unread`}>
            <Bell size={15}/>
            {notificationCount > 0 && <span className="header-notification-count">{notificationCount > 99 ? '99+' : notificationCount}</span>}
          </button>

          <button type="button" className="header-icon-button" onClick={() => navigate('/settings')} aria-label="Settings">
            <Settings size={15}/>
          </button>

          <div className="header-profile-wrap" ref={desktopProfileRef}>
            <button type="button" className="header-profile-button" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
              <img src={user?.avatar} alt="" />
              <span className="header-profile-copy">
                <strong>{user?.name || 'User'}</strong>
                <small>{user?.role || 'ADMIN'}</small>
              </span>
              <ChevronDown size={12}/>
            </button>
            {profileDropdownOpen && renderProfileMenu()}
          </div>
        </div>
      </div>

      <div className="mobile-header">
        <div className="mobile-header-row">
          <button type="button" className="mobile-brand" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
            <span>CG</span>
            <strong>CubeGears</strong>
          </button>

          <div className="mobile-header-actions">
            <button type="button" onClick={() => setSearchOpen((value) => !value)}><Search size={15}/></button>
            <button type="button" className="mobile-notification-button" onClick={() => navigate('/notifications')} aria-label={`Notifications, ${notificationCount} unread`}>
              <Bell size={15}/>
              {notificationCount > 0 && <span className="header-notification-count">{notificationCount > 99 ? '99+' : notificationCount}</span>}
            </button>
            <div className="header-profile-wrap" ref={mobileProfileRef}>
              <button type="button" className="mobile-profile-button" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
                <img src={user?.avatar} alt="Profile" />
              </button>
              {profileDropdownOpen && renderProfileMenu()}
            </div>
          </div>
        </div>

        {searchOpen && <div className="mobile-search-wrap"><GlobalSearch isMobileView /></div>}
      </div>
    </header>
  );
};
