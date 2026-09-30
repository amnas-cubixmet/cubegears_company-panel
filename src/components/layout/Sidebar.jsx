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
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [location.pathname]);

  const sections = Object.values(ROUTE_SECTIONS);
  const isRouteActive = (route) =>
    route.path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);

  const themeButtonClass = (mode) =>
    `grid h-8 flex-1 place-items-center rounded-lg border-0 transition ${themeMode === mode ? 'bg-surface text-primary shadow-sm' : 'bg-transparent text-muted hover:bg-surface hover:text-content'}`;

  return (
    <aside className={`relative z-30 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex ${collapsed ? 'w-[64px]' : 'w-[208px]'}`}>
      <div className={`flex h-14 shrink-0 items-center border-b border-line ${collapsed ? 'justify-center px-2' : 'justify-between px-3'}`}>
        <div className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-2.5'}`}>
          <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-[9px] font-black tracking-tight text-white">CG</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[12px] font-bold tracking-tight text-content">CubeGears</div>
              <div className="truncate text-[8px] font-medium text-muted">Workshop Management</div>
            </div>
          )}
        </div>
        {!collapsed ? (
          <button type="button" onClick={() => setCollapsed(true)} className="grid size-7 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-surface-2 hover:text-content" aria-label="Collapse sidebar">
            <ChevronLeft size={14} />
          </button>
        ) : (
          <button type="button" onClick={() => setCollapsed(false)} className="absolute -right-3 top-4 z-10 grid size-6 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm" aria-label="Expand sidebar">
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-4">
          {sections.map((section) => {
            const items = routeConfig.filter((route) => route.section === section);
            if (!items.length) return null;
            return (
              <section key={section} className="flex flex-col gap-0.5">
                {!collapsed && <div className="px-2.5 pb-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-muted">{section}</div>}
                {items.map((route) => {
                  const Icon = route.icon;
                  const active = isRouteActive(route);
                  return (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      ref={active ? activeItemRef : null}
                      title={collapsed ? route.label : undefined}
                      className={`group relative flex h-9 items-center rounded-lg no-underline transition-colors ${collapsed ? 'mx-auto w-9 justify-center' : 'w-full gap-2.5 px-2.5'} ${active ? 'bg-primary-soft text-primary' : 'text-secondary hover:bg-surface-2 hover:text-content'}`}
                    >
                      <span className="grid size-4 shrink-0 place-items-center"><Icon size={15} strokeWidth={active ? 2.2 : 1.8} /></span>
                      {!collapsed && <span className={`min-w-0 flex-1 truncate text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{route.label}</span>}
                    </NavLink>
                  );
                })}
              </section>
            );
          })}
        </div>
      </nav>

      <div className={`shrink-0 border-t border-line ${collapsed ? 'p-2' : 'p-2.5'}`}>
        {!collapsed && (
          <div className="mb-2 flex rounded-lg border border-line bg-surface-2 p-1">
            <button type="button" onClick={() => setThemeMode('light')} className={themeButtonClass('light')} title="Light"><Sun size={13}/></button>
            <button type="button" onClick={() => setThemeMode('dark')} className={themeButtonClass('dark')} title="Dark"><Moon size={13}/></button>
            <button type="button" onClick={() => setThemeMode('system')} className={themeButtonClass('system')} title="System"><Laptop size={13}/></button>
          </div>
        )}
        <div className={`flex min-w-0 items-center ${collapsed ? 'justify-center py-1' : 'gap-2 rounded-lg p-1.5'}`}>
          <img src={user?.avatar} alt="" className="size-7 shrink-0 rounded-full border border-line bg-surface-2 object-cover" />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-semibold text-content">{user?.name || 'User'}</div>
                <div className="truncate text-[8px] font-medium uppercase tracking-wide text-muted">{user?.role || 'ADMIN'}</div>
              </div>
              <button type="button" onClick={logout} className="grid size-7 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger hover:bg-danger/10" aria-label="Log out"><LogOut size={14}/></button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
