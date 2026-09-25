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

  const navContainerRef = useRef(null);
  const activeItemRef = useRef(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);

  const isRouteActive = (route) => {
    if (route.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);
  };

  const isChildActive = (child) => {
    const pathname = child.path.split('?')[0];
    const currentKind = new URLSearchParams(location.search).get('kind') || 'invoice';

    return child.matchSearch
      ? location.pathname === pathname && currentKind === child.matchSearch
      : location.pathname === pathname;
  };

  const navClass = (active) =>
    [
      'group flex h-10 items-center gap-3 rounded-xl text-[13px] no-underline transition-all duration-150',
      collapsed ? 'mx-1 justify-center px-0' : 'ml-2 mr-2 px-3',
      active
        ? 'bg-primary-soft font-semibold text-primary'
        : 'font-medium text-content hover:bg-surface-2'
    ].join(' ');

  const themeButtonClass = (mode) =>
    [
      'grid h-8 flex-1 place-items-center rounded-md border-0 transition',
      themeMode === mode
        ? 'bg-surface text-primary shadow-sm'
        : 'bg-transparent text-muted hover:bg-surface hover:text-content'
    ].join(' ');

  return (
    <aside
      className={[
        'sidebar desktop-only-sidebar relative z-30 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-line bg-surface shadow-[1px_0_0_rgba(15,23,42,0.02)] transition-[width] duration-300 md:flex',
        collapsed ? 'w-[72px]' : 'w-[220px]'
      ].join(' ')}
    >
      <div
        className={[
          'flex h-16 shrink-0 items-center border-b border-line',
          collapsed ? 'justify-center px-2.5' : 'justify-between px-3'
        ].join(' ')}
      >
        <div className={['flex min-w-0 items-center', collapsed ? '' : 'gap-3'].join(' ')}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-xs font-black text-white shadow-sm">
            CG
          </div>

          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-tight text-content">
                CubeGears
              </div>
              <div className="truncate text-[10px] font-medium text-muted">
                Garage Enterprise
              </div>
            </div>
          ) : null}
        </div>

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="grid size-8 place-items-center rounded-lg border border-line bg-surface-2 text-muted transition hover:bg-surface hover:text-content"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16}/>
          </button>
        ) : null}

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute -right-4 top-4 grid size-8 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:text-primary"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight size={16}/>
          </button>
        ) : null}
      </div>

      <div
        ref={navContainerRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-2 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => {
          const items = routeConfig.filter((route) => route.section === section);
          if (!items.length) return null;

          return (
            <section key={section} className="flex flex-col gap-[5px]">
              {!collapsed ? (
                <div className="px-3 pb-1 pt-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">
                  {section}
                </div>
              ) : null}

              {items.map((route) => {
                const IconComp = route.icon;
                const active = isRouteActive(route);
                const hasChildren = Boolean(route.children?.length);

                return (
                  <React.Fragment key={route.id}>
                    <NavLink
                      to={route.path}
                      ref={active ? activeItemRef : null}
                      className={navClass(active)}
                      title={collapsed ? route.label : undefined}
                    >
                      <IconComp
                        size={17}
                        strokeWidth={1.9}
                        className={[
                          'shrink-0',
                          active ? 'text-primary' : 'text-secondary group-hover:text-content'
                        ].join(' ')}
                      />

                      {!collapsed ? (
                        <span className="min-w-0 flex-1 truncate">
                          {route.label}
                        </span>
                      ) : null}
                    </NavLink>

                    {!collapsed && active && hasChildren ? (
                      <div className="ml-[32px] mr-2 mt-1.5 flex flex-col">
                        {route.children.map((child, childIndex) => {
                          const childActive = isChildActive(child);
                          const isLastChild = childIndex === route.children.length - 1;

                          return (
                            <div key={child.id} className="relative min-h-9 pl-4">
                              <span
                                aria-hidden="true"
                                className={[
                                  'absolute left-0 top-0 w-px',
                                  childActive ? 'bg-primary/35' : 'bg-line',
                                  isLastChild ? 'h-1/2' : 'h-full'
                                ].join(' ')}
                              />
                              <span
                                aria-hidden="true"
                                className={['absolute left-0 top-1/2 h-px w-3', childActive ? 'bg-primary/35' : 'bg-line'].join(' ')}
                              />

                              <NavLink
                                to={child.path}
                                className={[
                                  'flex min-h-8 items-center justify-center rounded-lg px-2 text-center text-[11px] leading-tight no-underline transition-all',
                                  childActive
                                    ? 'bg-primary-soft font-semibold text-primary'
                                    : 'font-medium text-muted hover:bg-surface-2 hover:text-content'
                                ].join(' ')}
                              >
                                {child.label}
                              </NavLink>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </section>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-line bg-surface p-2.5">
        {!collapsed ? (
          <div className="mb-3 flex rounded-xl border border-line bg-surface-2 p-1">
            <button type="button" onClick={() => setThemeMode('light')} className={themeButtonClass('light')} title="Light theme">
              <Sun size={14}/>
            </button>
            <button type="button" onClick={() => setThemeMode('dark')} className={themeButtonClass('dark')} title="Dark theme">
              <Moon size={14}/>
            </button>
            <button type="button" onClick={() => setThemeMode('system')} className={themeButtonClass('system')} title="System theme">
              <Laptop size={14}/>
            </button>
          </div>
        ) : null}

        <div
          className={[
            'flex items-center',
            collapsed
              ? 'justify-center'
              : 'justify-between gap-2 rounded-xl border border-line bg-surface-2 p-2'
          ].join(' ')}
        >
          <div className={['flex min-w-0 items-center', collapsed ? '' : 'gap-2.5'].join(' ')}>
            <img
              src={user?.avatar}
              alt="User"
              className="size-8 shrink-0 rounded-full border border-line bg-surface object-cover"
            />

            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-[11px] font-semibold text-content">
                  {user?.name || 'User'}
                </div>
                <div className="truncate text-[9px] font-medium uppercase tracking-wide text-muted">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
            ) : null}
          </div>

          {!collapsed ? (
            <button
              type="button"
              onClick={logout}
              className="grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger transition hover:bg-red-50"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16}/>
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
