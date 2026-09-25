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

  const mainNavItemClass = (active) =>
    [
      'group flex h-10 items-center gap-3 rounded-xl text-[13px] no-underline transition-all duration-150',
      collapsed ? 'mx-1 justify-center px-0' : 'ml-2 mr-2 px-3',
      active
        ? 'bg-primary-soft font-semibold text-primary'
        : 'font-medium text-secondary hover:bg-surface-2 hover:text-content'
    ].join(' ');

  const themeButtonClass = (mode) =>
    [
      'grid h-7 flex-1 place-items-center rounded-lg border-0 transition-colors',
      themeMode === mode
        ? 'bg-surface text-primary shadow-sm'
        : 'bg-transparent text-muted hover:bg-surface hover:text-content'
    ].join(' ');

  return (
    <aside
      className={[
        'sidebar desktop-only-sidebar relative z-30 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-200 md:flex',
        collapsed ? 'w-[72px]' : 'w-[248px]'
      ].join(' ')}
    >
      {/* 9. LOGO AREA */}
      <div
        className={[
          'flex h-[60px] shrink-0 items-center border-b border-line',
          collapsed ? 'justify-center px-2.5' : 'justify-between px-3'
        ].join(' ')}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-sans text-xs font-bold text-white">
            CG
          </div>

          {!collapsed ? (
            <div className="min-w-0 text-left">
              <div className="truncate font-sans text-[14px] font-bold text-content leading-tight">
                CubeGears
              </div>
              <div className="truncate font-sans text-[10px] font-medium text-muted leading-tight mt-0.5">
                Workshop Management
              </div>
            </div>
          ) : null}
        </div>

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted transition hover:bg-surface hover:text-content"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        ) : null}

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-4 z-40 grid size-7 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:text-primary"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight size={14} />
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
            <section key={section} className="flex flex-col gap-1">
              {!collapsed ? (
                <div className="px-3 pb-1.5 text-left font-sans text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                  {section}
                </div>
              ) : null}

              {items.map((route) => {
                const IconComp = route.icon;
                const active = isRouteActive(route);

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
      </nav>

      {/* FOOTER AREA */}
      <div className="shrink-0 border-t border-line bg-surface p-3">
        {/* 12. THEME SWITCHER */}
        {!collapsed ? (
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
        ) : null}

        {/* 13. USER PROFILE */}
        <div
          className={[
            'flex items-center',
            collapsed
              ? 'justify-center'
              : 'justify-between rounded-xl border border-line bg-surface-2 p-2.5 gap-2'
          ].join(' ')}
        >
          <div className={['flex min-w-0 items-center', collapsed ? '' : 'gap-2.5'].join(' ')}>
            <img
              src={user?.avatar}
              alt={user?.name || 'User avatar'}
              className="size-8 shrink-0 rounded-full border border-line bg-surface object-cover"
            />

            {!collapsed ? (
              <div className="min-w-0 text-left">
                <div className="truncate font-sans text-[11px] font-semibold text-content leading-tight">
                  {user?.name || 'User'}
                </div>
                <div className="truncate font-sans text-[9px] font-medium uppercase tracking-wider text-muted leading-tight mt-0.5">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
            ) : null}
          </div>

          {!collapsed ? (
            <button
              type="button"
              onClick={logout}
              className="grid size-7 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger transition hover:bg-red-500/10"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

