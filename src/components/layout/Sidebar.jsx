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
  }, [location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);
  const isRouteActive = (route) => route.path === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);

  const isChildActive = (child) => {
    const pathname = child.path.split('?')[0];
    const currentKind = new URLSearchParams(location.search).get('kind') || 'invoice';
    return child.matchSearch
      ? location.pathname === pathname && currentKind === child.matchSearch
      : location.pathname === pathname;
  };

  const themeButtonClass = (mode) => `grid h-8 flex-1 place-items-center rounded-lg border-0 transition ${themeMode === mode ? 'bg-surface text-primary shadow-sm' : 'bg-transparent text-muted hover:bg-surface hover:text-content'}`;

  return (
    <aside className={`relative z-30 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface font-sans transition-[width] duration-200 md:flex ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}>
      <div className={`flex h-16 shrink-0 items-center border-b border-line ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <div className={`flex min-w-0 items-center ${collapsed ? '' : 'gap-3'}`}>
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-[11px] font-extrabold tracking-tight text-white">CG</div>
          {!collapsed && <div className="min-w-0"><div className="truncate text-sm font-bold tracking-tight text-content">CubeGears</div><div className="truncate text-[10px] font-medium text-muted">Workshop Management</div></div>}
        </div>
        {!collapsed && <button type="button" onClick={() => setCollapsed(true)} className="grid size-8 place-items-center rounded-lg border border-line bg-transparent text-muted transition hover:bg-surface-2 hover:text-content" aria-label="Collapse sidebar"><ChevronLeft size={16}/></button>}
        {collapsed && <button type="button" onClick={() => setCollapsed(false)} className="absolute -right-3.5 top-[18px] grid size-7 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm transition hover:text-primary" aria-label="Expand sidebar"><ChevronRight size={14}/></button>}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-5">
          {sections.map((section) => {
            const items = routeConfig.filter((route) => route.section === section);
            if (!items.length) return null;
            return <section key={section} className="flex flex-col gap-1">
              {!collapsed && <div className="px-3 pb-1 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-muted">{section}</div>}
              {items.map((route) => {
                const Icon = route.icon;
                const active = isRouteActive(route);
                return <React.Fragment key={route.id}>
                  <NavLink to={route.path} ref={active ? activeItemRef : null} title={collapsed ? route.label : undefined}
                    className={`group relative flex h-10 items-center rounded-xl text-left no-underline transition-colors ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${active ? 'bg-primary-soft text-primary' : 'text-secondary hover:bg-surface-2 hover:text-content'}`}>
                    {active && !collapsed && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />}
                    <span className="grid size-5 shrink-0 place-items-center"><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /></span>
                    {!collapsed && <span className={`min-w-0 flex-1 truncate text-left text-[13px] leading-5 ${active ? 'font-semibold' : 'font-medium'}`}>{route.label}</span>}
                  </NavLink>
                  {!collapsed && active && route.children?.length > 0 && <div className="ml-[21px] mt-1 border-l border-line pl-4">
                    {route.children.map((child) => {
                      const childActive = isChildActive(child);
                      return <NavLink key={child.id} to={child.path} className={`flex min-h-8 items-center rounded-lg px-3 py-1.5 text-left text-[11px] leading-4 no-underline transition ${childActive ? 'bg-primary-soft font-semibold text-primary' : 'font-medium text-muted hover:bg-surface-2 hover:text-content'}`}>{child.label}</NavLink>;
                    })}
                  </div>}
                </React.Fragment>;
              })}
            </section>;
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        {!collapsed && <div className="mb-2.5 flex rounded-xl border border-line bg-surface-2 p-1">
          <button type="button" onClick={() => setThemeMode('light')} className={themeButtonClass('light')} title="Light"><Sun size={14}/></button>
          <button type="button" onClick={() => setThemeMode('dark')} className={themeButtonClass('dark')} title="Dark"><Moon size={14}/></button>
          <button type="button" onClick={() => setThemeMode('system')} className={themeButtonClass('system')} title="System"><Laptop size={14}/></button>
        </div>}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 rounded-xl border border-line bg-surface-2 p-2'}`}>
          <img src={user?.avatar} alt="" className="size-8 shrink-0 rounded-full border border-line bg-surface object-cover" />
          {!collapsed && <><div className="min-w-0 flex-1"><div className="truncate text-[11px] font-semibold text-content">{user?.name || 'User'}</div><div className="truncate text-[9px] font-medium uppercase tracking-wide text-muted">{user?.role || 'ADMIN'}</div></div><button type="button" onClick={logout} className="grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger transition hover:bg-danger/10" aria-label="Log out"><LogOut size={16}/></button></>}
        </div>
      </div>
    </aside>
  );
};
