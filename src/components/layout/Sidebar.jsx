import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { routeConfig, ROUTE_SECTIONS } from '../../routes/routeConfig';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Laptop,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const activeItemRef = useRef(null);
  const navContainerRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (activeItemRef.current && navContainerRef.current && !query) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [location.pathname, location.search, query]);

  useEffect(() => {
    const closeProfile = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);

  const isRouteActive = (route) => {
    if (route.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);
  };

  const isChildActive = (child) => {
    const childPathname = child.path.split('?')[0];
    const currentKind = new URLSearchParams(location.search).get('kind') || 'invoice';

    return child.matchSearch
      ? location.pathname === childPathname && currentKind === child.matchSearch
      : location.pathname === childPathname;
  };

  const filteredSections = useMemo(() => {
    const search = query.trim().toLowerCase();

    return sections
      .map((section) => {
        const items = routeConfig
          .filter((route) => route.section === section)
          .filter((route) => {
            if (!search) return true;

            const parentMatch = route.label.toLowerCase().includes(search);
            const childMatch = route.children?.some((child) =>
              child.label.toLowerCase().includes(search)
            );

            return parentMatch || childMatch;
          });

        return { section, items };
      })
      .filter(({ items }) => items.length > 0);
  }, [query, sections]);

  const railItemClass = (active) =>
    [
      'relative grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-150',
      active
        ? 'bg-primary-soft text-primary'
        : 'text-muted hover:bg-surface-2 hover:text-content'
    ].join(' ');

  const panelNavClass = (active) =>
    [
      'group flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-[12px] no-underline transition-all duration-150',
      active
        ? 'bg-surface-2 font-bold text-content'
        : 'font-medium text-secondary hover:bg-surface-2 hover:text-content'
    ].join(' ');

  const themeButtonClass = (mode) =>
    [
      'grid size-8 place-items-center rounded-lg border-0 transition',
      themeMode === mode
        ? 'bg-primary-soft text-primary'
        : 'bg-transparent text-muted hover:bg-surface-2 hover:text-content'
    ].join(' ');

  return (
    <aside
      className={[
        'sidebar desktop-only-sidebar relative z-30 hidden h-dvh shrink-0 overflow-visible border-r border-line bg-surface transition-[width] duration-300 md:flex',
        collapsed ? 'w-14' : 'w-[272px]'
      ].join(' ')}
    >
      <div className="flex h-full w-14 shrink-0 flex-col border-r border-line bg-surface">
        <div className="grid h-16 shrink-0 place-items-center border-b border-line">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-[11px] font-black text-white shadow-sm">
            CG
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {routeConfig.map((route) => {
            const IconComp = route.icon;
            const active = isRouteActive(route);

            return (
              <NavLink
                key={route.id}
                to={route.path}
                className={railItemClass(active)}
                title={route.label}
                aria-label={route.label}
              >
                {active ? (
                  <span className="absolute -left-2 h-5 w-[2px] rounded-full bg-primary" />
                ) : null}
                <IconComp size={17} strokeWidth={1.8} />
              </NavLink>
            );
          })}
        </nav>

        <div className="flex shrink-0 flex-col items-center gap-2 border-t border-line px-2 py-3">
          <button
            type="button"
            onClick={() => {
              setCollapsed((value) => !value);
              setProfileOpen(false);
            }}
            className="grid size-9 place-items-center rounded-xl border border-line bg-surface-2 text-muted transition hover:bg-primary-soft hover:text-primary"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className={[
                'grid size-9 place-items-center overflow-hidden rounded-xl border bg-surface transition',
                profileOpen ? 'border-primary ring-2 ring-primary/10' : 'border-line hover:border-primary/30'
              ].join(' ')}
              aria-label="Open account menu"
              aria-expanded={profileOpen}
            >
              <img
                src={user?.avatar}
                alt="User"
                className="size-full object-cover"
              />
            </button>

            {profileOpen ? (
              <div
                className={[
                  'absolute bottom-0 z-[130] w-[230px] rounded-2xl border border-line bg-surface p-2 shadow-2xl',
                  collapsed ? 'left-[48px]' : 'left-[264px]'
                ].join(' ')}
              >
                <div className="mb-1 flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5">
                  <img
                    src={user?.avatar}
                    alt="User"
                    className="size-9 shrink-0 rounded-lg border border-line object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-extrabold text-content">
                      {user?.name || 'User'}
                    </div>
                    <div className="truncate text-[9px] font-semibold uppercase tracking-wide text-muted">
                      {user?.role || 'ADMIN'}
                    </div>
                  </div>
                </div>

                <NavLink
                  to="/profile"
                  className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[11px] font-semibold text-content no-underline transition hover:bg-surface-2"
                >
                  <User size={14}/>Profile & Account
                </NavLink>

                <NavLink
                  to="/settings"
                  className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[11px] font-semibold text-content no-underline transition hover:bg-surface-2"
                >
                  <Settings size={14}/>Settings
                </NavLink>

                <NavLink
                  to="/notifications"
                  className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[11px] font-semibold text-content no-underline transition hover:bg-surface-2"
                >
                  <Bell size={14}/>Notifications
                </NavLink>

                <div className="my-1 h-px bg-line" />

                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-semibold text-muted">Theme</span>
                  <div className="flex rounded-xl border border-line bg-surface-2 p-1">
                    <button type="button" onClick={() => setThemeMode('light')} className={themeButtonClass('light')} title="Light">
                      <Sun size={13}/>
                    </button>
                    <button type="button" onClick={() => setThemeMode('dark')} className={themeButtonClass('dark')} title="Dark">
                      <Moon size={13}/>
                    </button>
                    <button type="button" onClick={() => setThemeMode('system')} className={themeButtonClass('system')} title="System">
                      <Laptop size={13}/>
                    </button>
                  </div>
                </div>

                <div className="my-1 h-px bg-line" />

                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-9 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-left text-[11px] font-semibold text-danger transition hover:bg-red-50"
                >
                  <LogOut size={14}/>Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {!collapsed ? (
        <div className="flex h-full w-[216px] min-w-0 flex-col bg-surface">
          <div className="shrink-0 border-b border-line px-3 pb-3 pt-3">
            <div className="mb-2.5 flex min-h-9 items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-extrabold tracking-tight text-content">
                  CubeGears
                </div>
                <div className="truncate text-[9px] font-medium text-muted">
                  Garage Enterprise
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="grid size-7 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-surface-2 hover:text-content"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={14}/>
              </button>
            </div>

            <div className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface-2 px-2.5 transition focus-within:border-primary/40 focus-within:bg-surface">
              <Search size={14} className="shrink-0 text-muted"/>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[11px] font-medium text-content outline-none placeholder:text-muted"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="border-0 bg-transparent p-0 text-[9px] font-semibold text-muted hover:text-content"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div
            ref={navContainerRef}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredSections.map(({ section, items }) => (
              <section key={section} className="flex flex-col gap-[5px]">
                <span className="px-2 pb-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-muted">
                  {section}
                </span>

                {items.map((route) => {
                  const IconComp = route.icon;
                  const active = isRouteActive(route);
                  const hasChildren = Boolean(route.children?.length);
                  const showChildren = hasChildren && (active || Boolean(query));

                  const visibleChildren = query
                    ? route.children?.filter((child) =>
                        child.label.toLowerCase().includes(query.trim().toLowerCase()) ||
                        route.label.toLowerCase().includes(query.trim().toLowerCase())
                      )
                    : route.children;

                  return (
                    <React.Fragment key={route.id}>
                      <NavLink
                        to={route.path}
                        ref={active ? activeItemRef : null}
                        className={panelNavClass(active)}
                      >
                        <IconComp
                          size={15}
                          strokeWidth={1.8}
                          className={active ? 'shrink-0 text-primary' : 'shrink-0 text-muted group-hover:text-content'}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {route.label}
                        </span>
                      </NavLink>

                      {showChildren && visibleChildren?.length ? (
                        <div className="ml-[26px] flex flex-col gap-[5px] border-l border-line pl-2">
                          {visibleChildren.map((child) => {
                            const childActive = isChildActive(child);

                            return (
                              <NavLink
                                key={child.id}
                                to={child.path}
                                className={[
                                  'flex min-h-8 items-center rounded-lg px-2.5 text-[10.5px] leading-tight no-underline transition',
                                  childActive
                                    ? 'bg-primary-soft font-bold text-primary'
                                    : 'font-medium text-muted hover:bg-surface-2 hover:text-content'
                                ].join(' ')}
                              >
                                {child.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </section>
            ))}

            {filteredSections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line px-3 py-5 text-center text-[10px] text-muted">
                No matching module
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-line p-2.5">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-2 text-left transition hover:bg-surface"
            >
              <img
                src={user?.avatar}
                alt="User"
                className="size-8 shrink-0 rounded-lg border border-line object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10.5px] font-extrabold text-content">
                  {user?.name || 'User'}
                </div>
                <div className="truncate text-[8.5px] font-semibold uppercase tracking-wide text-muted">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
              <ChevronRight size={14} className="shrink-0 text-muted"/>
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
};
