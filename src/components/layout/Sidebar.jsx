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

  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">
          <span className="sidebar-logo">CG</span>
          {!collapsed && (
            <span className="sidebar-brand-copy">
              <strong>CubeGears</strong>
              <small>Workshop Management</small>
            </span>
          )}
        </div>

        {!collapsed ? (
          <button type="button" className="sidebar-collapse-button" onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">
            <ChevronLeft size={14} />
          </button>
        ) : (
          <button type="button" className="sidebar-expand-button" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-sections">
          {sections.map((section) => {
            const items = routeConfig.filter((route) => route.section === section);
            if (!items.length) return null;

            return (
              <section key={section} className="sidebar-section">
                {!collapsed && <div className="sidebar-section-title">{section}</div>}

                <div className="sidebar-items">
                  {items.map((route) => {
                    const Icon = route.icon;
                    const active = isRouteActive(route);

                    return (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        ref={active ? activeItemRef : null}
                        title={collapsed ? route.label : undefined}
                        className={`sidebar-nav-item ${active ? 'is-active' : ''} ${collapsed ? 'is-icon-only' : ''}`}
                      >
                        <span className="sidebar-nav-icon"><Icon size={15} strokeWidth={active ? 2.2 : 1.8} /></span>
                        {!collapsed && <span className="sidebar-nav-label">{route.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-theme-switch">
            <button type="button" className={themeMode === 'light' ? 'is-active' : ''} onClick={() => setThemeMode('light')} title="Light"><Sun size={13} /></button>
            <button type="button" className={themeMode === 'dark' ? 'is-active' : ''} onClick={() => setThemeMode('dark')} title="Dark"><Moon size={13} /></button>
            <button type="button" className={themeMode === 'system' ? 'is-active' : ''} onClick={() => setThemeMode('system')} title="System"><Laptop size={13} /></button>
          </div>
        )}

        <div className={`sidebar-user ${collapsed ? 'is-collapsed-user' : ''}`}>
          <img src={user?.avatar} alt="" />
          {!collapsed && (
            <>
              <span className="sidebar-user-copy">
                <strong>{user?.name || 'User'}</strong>
                <small>{user?.role || 'ADMIN'}</small>
              </span>
              <button type="button" className="sidebar-logout" onClick={logout} aria-label="Log out"><LogOut size={14} /></button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
