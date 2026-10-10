import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlobalSearch } from '../common/GlobalSearch';
import { resourceConfigs } from '../../pages/operations/resourceConfigs';
import { getUserRoleLabel } from '../../utils/authDisplay';
import { hasPermission } from '../../utils/permissions';
import { staffService } from '../../services/staff.service';

const resolveStaticPageTitle = (pathname) => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (/^\/staff-management\/staff\/[^/]+$/.test(pathname)) return 'Staff Profile';

  const last = pathname.split('/').filter(Boolean).slice(-1)[0] || 'Workspace';
  const decoded = decodeURIComponent(last);

  if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(decoded)) return 'Details';

  return decoded.replace(/-/g, ' ');
};

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [pageTitle, setPageTitle] = useState(() =>
    resolveStaticPageTitle(location.pathname),
  );
  const roleLabel = getUserRoleLabel(user);
  const initials = String(user?.name || user?.email || 'CG')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CG';
  const canViewNotifications = hasPermission(user, 'notifications.view');
  const canViewSettings = hasPermission(user, 'settings.view');
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
    let active = true;
    const fallback = resolveStaticPageTitle(location.pathname);
    setPageTitle(fallback);

    const staffProfileMatch = location.pathname.match(
      /^\/staff-management\/staff\/([^/]+)$/,
    );

    if (staffProfileMatch) {
      staffService
        .getStaffById(decodeURIComponent(staffProfileMatch[1]))
        .then((profile) => {
          if (active) setPageTitle(profile?.name || 'Staff Profile');
        })
        .catch(() => {
          if (active) setPageTitle('Staff Profile');
        });
    }

    return () => {
      active = false;
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

  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderProfileMenu = () => (
    <div className="header-profile-menu">
      <button type="button" onClick={() => go('/profile')}><User size={15}/> Profile & Account</button>
      {canViewSettings && (
        <button type="button" onClick={() => go('/settings')}><Settings size={15}/> Settings</button>
      )}
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

          {canViewNotifications && (
            <button type="button" className="header-icon-button has-notification-count" onClick={() => navigate('/notifications')} aria-label={`Notifications, ${notificationCount} unread`}>
              <Bell size={15}/>
              {notificationCount > 0 && <span className="header-notification-count">{notificationCount > 99 ? '99+' : notificationCount}</span>}
            </button>
          )}

          {canViewSettings && (
            <button type="button" className="header-icon-button" onClick={() => navigate('/settings')} aria-label="Settings">
              <Settings size={15}/>
            </button>
          )}

          <div className="header-profile-wrap" ref={desktopProfileRef}>
            <button type="button" className="header-profile-button" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                <span className="header-avatar-fallback" aria-hidden="true">{initials}</span>
              )}
              <span className="header-profile-copy">
                <strong>{user?.name || 'User'}</strong>
                <small>{roleLabel}</small>
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
            <span className="mobile-brand-copy">
              <strong>CubixGear</strong>
              <small>{pageTitle}</small>
            </span>
          </button>

          <div className="mobile-header-actions">
            <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label={searchOpen ? "Close workspace search" : "Open workspace search"} aria-expanded={searchOpen}><Search size={15}/></button>
            {canViewNotifications && (
              <button type="button" className="mobile-notification-button" onClick={() => navigate('/notifications')} aria-label={`Notifications, ${notificationCount} unread`}>
                <Bell size={15}/>
                {notificationCount > 0 && <span className="header-notification-count">{notificationCount > 99 ? '99+' : notificationCount}</span>}
              </button>
            )}
            <div className="header-profile-wrap" ref={mobileProfileRef}>
              <button type="button" className="mobile-profile-button" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" />
                ) : (
                  <span className="mobile-avatar-fallback" aria-hidden="true">{initials}</span>
                )}
              </button>
              {profileDropdownOpen && renderProfileMenu()}
            </div>
          </div>
        </div>

        {searchOpen && <div className="mobile-search-wrap"><GlobalSearch isMobileView onMobileClose={() => setSearchOpen(false)} /></div>}
      </div>
    </header>
  );
};
