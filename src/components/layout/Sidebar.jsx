import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { routeConfig, ROUTE_SECTIONS } from '../../routes/routeConfig';
import { ChevronLeft, ChevronRight, Laptop, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const activeItemRef = useRef(null);
  const navContainerRef = useRef(null);

  useEffect(() => {
    if (activeItemRef.current && navContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);

  const isRouteActive = (route) => {
    if (route.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);
  };

  const navClass = (active) =>
    [
      'group flex h-11 items-center gap-3 rounded-xl text-[13px] no-underline transition-all duration-150',
      collapsed ? 'justify-center px-0' : 'justify-start px-3',
      active
        ? 'bg-primary-soft font-bold text-primary shadow-[inset_3px_0_0_var(--primary)]'
        : 'font-medium text-content hover:bg-surface-2'
    ].join(' ');

  const themeButtonClass = (mode) =>
    [
      'grid h-8 flex-1 place-items-center rounded-lg border-0 transition',
      themeMode === mode
        ? 'bg-surface text-primary shadow-sm'
        : 'bg-transparent text-muted hover:bg-surface hover:text-content'
    ].join(' ');

  return (
    <aside
      className={[
        'sidebar desktop-only-sidebar relative z-30 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-300 md:flex',
        collapsed ? 'w-[80px]' : 'w-[260px]'
      ].join(' ')}
    >
      <div
        className={[
          'flex h-[72px] shrink-0 items-center border-b border-line bg-surface',
          collapsed ? 'justify-center px-3' : 'justify-between px-4'
        ].join(' ')}
      >
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">
              CG
            </div>

            <div className="min-w-0">
              <div className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-content">
                CubeGears
              </div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-muted">
                Garage Enterprise
              </div>
            </div>
          </div>
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">
            CG
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={[
            'grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-secondary transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary',
            collapsed ? 'absolute -right-4 top-5 shadow-sm' : ''
          ].join(' ')}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div
        ref={navContainerRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => {
          const items = routeConfig.filter((route) => route.section === section);
          if (!items.length) return null;

          return (
            <div key={section} className="flex flex-col gap-1.5">
              {!collapsed && (
                <span className="px-2 pb-1 pt-1 text-[9px] font-black uppercase tracking-[0.11em] text-muted">
                  {section}
                </span>
              )}

              {items.map((route) => {
                const IconComp = route.icon;
                const isActive = isRouteActive(route);
                const hasChildren = Boolean(route.children?.length);

                return (
                  <React.Fragment key={route.id}>
                    <NavLink
                      to={route.path}
                      ref={isActive ? activeItemRef : null}
                      className={navClass(isActive)}
                      title={collapsed ? route.label : undefined}
                    >
                      <IconComp
                        size={17}
                        strokeWidth={1.9}
                        className={[
                          'shrink-0 transition',
                          isActive ? 'text-primary' : 'text-secondary group-hover:text-content'
                        ].join(' ')}
                      />

                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                          {route.label}
                        </span>
                      )}
                    </NavLink>

                    {!collapsed && hasChildren && isActive && (
                      <div className="mb-2 ml-7 mr-1 mt-1 flex flex-col gap-1 rounded-xl border border-line bg-surface-2/70 p-1.5">
                        {route.children.map((child) => {
                          const childPathname = child.path.split('?')[0];
                          const currentKind = new URLSearchParams(location.search).get('kind') || 'invoice';
                          const isChildActive = child.matchSearch
                            ? location.pathname === childPathname && currentKind === child.matchSearch
                            : location.pathname === childPathname;

                          return (
                            <NavLink
                              key={child.id}
                              to={child.path}
                              className={[
                                'flex min-h-9 items-center rounded-lg px-3 py-2 text-[11.5px] leading-tight no-underline transition-all',
                                isChildActive
                                  ? 'bg-surface font-bold text-primary shadow-sm ring-1 ring-line'
                                  : 'font-medium text-secondary hover:bg-surface hover:text-content'
                              ].join(' ')}
                            >
                              {child.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-line bg-surface p-3">
        {!collapsed && (
          <div className="mb-3 flex rounded-xl border border-line bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={themeButtonClass('light')}
              title="Light theme"
              aria-label="Light theme"
            >
              <Sun size={14} />
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={themeButtonClass('dark')}
              title="Dark theme"
              aria-label="Dark theme"
            >
              <Moon size={14} />
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={themeButtonClass('system')}
              title="System theme"
              aria-label="System theme"
            >
              <Laptop size={14} />
            </button>
          </div>
        )}

        <div
          className={[
            'flex items-center rounded-xl',
            collapsed
              ? 'justify-center'
              : 'justify-between gap-2 border border-line bg-surface-2 p-2'
          ].join(' ')}
        >
          <div className={['flex min-w-0 items-center', collapsed ? '' : 'gap-2.5'].join(' ')}>
            <img
              src={user?.avatar}
              alt="User"
              className="size-9 shrink-0 rounded-full border border-line bg-surface object-cover"
            />

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-[11px] font-extrabold text-content">
                  {user?.name || 'User'}
                </div>
                <div className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-muted">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-transparent bg-transparent text-danger transition hover:border-red-200 hover:bg-red-50"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
