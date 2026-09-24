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
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);

  const navClass = (active) =>
    [
      'flex min-h-10 items-center gap-3 rounded-lg text-sm no-underline transition-colors duration-150',
      collapsed ? 'justify-center px-0' : 'justify-start px-3',
      active
        ? 'bg-primary-soft font-semibold text-primary'
        : 'font-medium text-secondary hover:bg-surface-2 hover:text-content'
    ].join(' ');

  const themeButtonClass = (mode) =>
    [
      'grid min-h-7 flex-1 place-items-center rounded-md border-0 p-1 transition-colors',
      themeMode === mode ? 'bg-surface text-primary shadow-sm' : 'bg-transparent text-muted hover:text-content'
    ].join(' ');

  return (
    <aside
      className={[
        'sidebar desktop-only-sidebar scroll-hidden relative z-30 hidden h-[100dvh] shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 md:flex',
        collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width-expanded)]'
      ].join(' ')}
    >
      <div
        className={[
          'flex h-16 shrink-0 items-center border-b border-line bg-surface',
          collapsed ? 'justify-center px-3' : 'justify-between px-4'
        ].join(' ')}
      >
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-[34px] shrink-0 place-items-center rounded-lg bg-primary text-base font-extrabold text-white">
              CG
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold leading-tight text-content">CubeGears</div>
              <div className="truncate text-[11px] text-muted">Garage Enterprise</div>
            </div>
          </div>
        ) : (
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-bold text-white">
            CG
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={[
            'grid size-7 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-secondary transition hover:bg-surface-3 hover:text-content',
            collapsed ? 'absolute -right-3 top-[18px]' : ''
          ].join(' ')}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div
        ref={navContainerRef}
        className="sidebar-nav scroll-hidden flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"
      >
        {sections.map((section) => {
          const items = routeConfig.filter((route) => route.section === section);
          if (!items.length) return null;

          return (
            <div key={section} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted">
                  {section}
                </span>
              )}

              {items.map((route) => {
                const IconComp = route.icon;
                const isActive = location.pathname.startsWith(route.path);
                const hasChildren = Boolean(route.children?.length);

                return (
                  <React.Fragment key={route.id}>
                    <NavLink
                      to={route.path}
                      ref={isActive ? activeItemRef : null}
                      className={navClass(isActive)}
                      title={collapsed ? route.label : undefined}
                    >
                      <IconComp size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate whitespace-nowrap">{route.label}</span>}
                    </NavLink>

                    {!collapsed && hasChildren && isActive && (
                      <div className="mb-1 ml-8 flex flex-col gap-0.5 border-l border-line pl-2">
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
                                'rounded-md px-2.5 py-1.5 text-xs no-underline transition-colors',
                                isChildActive
                                  ? 'bg-surface-2 font-bold text-primary'
                                  : 'font-medium text-muted hover:bg-surface-2 hover:text-content'
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
          <div className="mb-3 flex rounded-lg bg-surface-2 p-1">
            <button type="button" onClick={() => setThemeMode('light')} className={themeButtonClass('light')} title="Light">
              <Sun size={14} />
            </button>
            <button type="button" onClick={() => setThemeMode('dark')} className={themeButtonClass('dark')} title="Dark">
              <Moon size={14} />
            </button>
            <button type="button" onClick={() => setThemeMode('system')} className={themeButtonClass('system')} title="System">
              <Laptop size={14} />
            </button>
          </div>
        )}

        <div className={['flex items-center', collapsed ? 'justify-center' : 'justify-between gap-2'].join(' ')}>
          <div className={['flex min-w-0 items-center', collapsed ? '' : 'gap-2.5'].join(' ')}>
            <img
              src={user?.avatar}
              alt="User"
              className="size-8 shrink-0 rounded-full object-cover"
            />
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-content">{user?.name || 'User'}</div>
                <div className="truncate text-[10px] text-muted">{user?.role || 'ADMIN'}</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              className="grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger transition hover:bg-red-50/70"
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
