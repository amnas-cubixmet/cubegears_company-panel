import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlobalSearch } from '../common/GlobalSearch';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  const pageTitle = location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'Workspace';

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderProfileMenu = () => (
    <div className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-52 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-2xl">
      <button type="button" onClick={() => go('/profile')} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-content transition hover:bg-surface-2"><User size={15}/> Profile & Account</button>
      <button type="button" onClick={() => go('/settings')} className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-content transition hover:bg-surface-2"><Settings size={15}/> Settings</button>
      <div className="my-1 h-px bg-line" />
      <button type="button" className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-semibold text-danger transition hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => { setProfileDropdownOpen(false); logout(); }}><LogOut size={15}/> Logout</button>
    </div>
  );

  return (
    <header className="relative z-50 shrink-0 border-b border-line bg-surface">
      <div className="hidden h-14 min-w-0 items-center gap-3 px-4 lg:flex xl:px-6">
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold capitalize tracking-tight text-content">{pageTitle}</span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {searchOpen ? (
            <div className="w-[360px] max-w-[32vw]">
              <GlobalSearch />
            </div>
          ) : (
            <button type="button" onClick={() => setSearchOpen(true)} className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-content" aria-label="Open search">
              <Search size={15}/>
            </button>
          )}

          <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[10px] font-medium text-secondary">
            <CalendarDays size={13} className="text-muted"/>
            <span>{dateLabel}</span>
          </div>

          <button type="button" className="relative grid size-9 place-items-center rounded-lg border border-line bg-surface text-secondary transition hover:bg-surface-2 hover:text-content" onClick={() => navigate('/notifications')} aria-label="Notifications">
            <Bell size={15}/>
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
          </button>

          <button type="button" className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-secondary transition hover:bg-surface-2 hover:text-content" onClick={() => navigate('/settings')} aria-label="Settings">
            <Settings size={15}/>
          </button>

          <div className="relative" ref={desktopProfileRef}>
            <button type="button" className="flex h-9 max-w-[160px] items-center gap-2 rounded-lg border border-line bg-surface px-1.5 text-content transition hover:bg-surface-2" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
              <img src={user?.avatar} alt="" className="size-6 shrink-0 rounded-full border border-line bg-surface-2 object-cover" />
              <span className="hidden min-w-0 text-left xl:block">
                <strong className="block max-w-28 truncate text-[9px] font-semibold">{user?.name || 'User'}</strong>
                <small className="block max-w-28 truncate text-[7px] font-medium uppercase tracking-wide text-muted">{user?.role || 'ADMIN'}</small>
              </span>
              <ChevronDown size={12} className="hidden text-muted xl:block"/>
            </button>
            {profileDropdownOpen && renderProfileMenu()}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col lg:hidden">
        <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3">
          <button type="button" className="flex min-w-0 items-center gap-2 border-0 bg-transparent p-0" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[9px] font-black text-white">CG</span>
            <span className="truncate text-[12px] font-semibold text-content">CubeGears</span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={() => setSearchOpen((value) => !value)} className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-secondary"><Search size={15}/></button>
            <button type="button" onClick={() => navigate('/notifications')} className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-secondary"><Bell size={15}/></button>
            <div className="relative" ref={mobileProfileRef}>
              <button type="button" className="grid size-9 place-items-center rounded-lg border border-line bg-surface p-1.5" onClick={() => setProfileDropdownOpen((value) => !value)} aria-expanded={profileDropdownOpen}>
                <img src={user?.avatar} alt="Profile" className="size-6 rounded-full bg-surface-2 object-cover" />
              </button>
              {profileDropdownOpen && renderProfileMenu()}
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="min-w-0 border-t border-line/60 px-3 py-2">
            <GlobalSearch isMobileView />
          </div>
        )}
      </div>
    </header>
  );
};
