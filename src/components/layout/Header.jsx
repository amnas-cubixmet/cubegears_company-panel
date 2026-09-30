import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '../common/GlobalSearch';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);

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

  const renderProfileMenu = () => (
    <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-2xl">
      <button type="button" onClick={() => go('/profile')} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-content transition hover:bg-surface-2"><User size={15}/> Profile & Account</button>
      <button type="button" onClick={() => go('/settings')} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-content transition hover:bg-surface-2"><Settings size={15}/> Settings</button>
      <div className="my-1 h-px bg-line" />
      <button type="button" className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-semibold text-danger transition hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => { setProfileDropdownOpen(false); logout(); }}><LogOut size={15}/> Logout</button>
    </div>
  );

  const notificationButton = (size = 18) => (
    <button type="button" className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-secondary transition hover:bg-surface-2 hover:text-content" onClick={() => navigate('/notifications')} aria-label="Notifications">
      <Bell size={size}/>
      <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-surface bg-danger" />
    </button>
  );

  return (
    <header className="relative z-50 shrink-0 border-b border-line bg-surface">
      <div className="hidden h-16 min-w-0 items-center gap-3 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,620px)_minmax(0,1fr)] xl:gap-5 xl:px-6">
        <div className="min-w-0">
          <span className="block truncate text-sm font-extrabold tracking-tight text-content">CubeGears Workspace</span>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[620px]">
          <GlobalSearch />
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {notificationButton()}
          <div className="relative" ref={desktopProfileRef}>
            <button type="button" className="flex h-10 max-w-[170px] items-center gap-2 rounded-xl border border-line bg-surface px-2 text-content transition hover:bg-surface-2" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
              <img src={user?.avatar} alt="" className="size-7 shrink-0 rounded-full border border-line bg-surface-2 object-cover" />
              <span className="hidden min-w-0 text-left xl:block">
                <strong className="block max-w-32 truncate text-[11px] font-bold">{user?.name || 'User'}</strong>
                <small className="block max-w-32 truncate text-[9px] font-semibold uppercase tracking-wide text-muted">{user?.role || 'ADMIN'}</small>
              </span>
              <ChevronDown size={14} className="hidden text-muted xl:block"/>
            </button>
            {profileDropdownOpen && renderProfileMenu()}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col lg:hidden">
        <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3">
          <button type="button" className="flex min-w-0 items-center gap-2 border-0 bg-transparent p-0" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-[11px] font-black text-white">CG</span>
            <span className="truncate text-sm font-extrabold tracking-tight text-content">CubeGears</span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {notificationButton(17)}
            <div className="relative" ref={mobileProfileRef}>
              <button type="button" className="grid size-10 place-items-center rounded-xl border border-line bg-surface p-1.5" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
                <img src={user?.avatar} alt="Profile" className="size-7 rounded-full bg-surface-2 object-cover" />
              </button>
              {profileDropdownOpen && renderProfileMenu()}
            </div>
          </div>
        </div>
        <div className="min-w-0 border-t border-line/60 px-3 py-2">
          <GlobalSearch isMobileView />
        </div>
      </div>
    </header>
  );
};
