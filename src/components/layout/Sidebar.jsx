import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { routeConfig, ROUTE_SECTIONS } from '../../routes/routeConfig';
import { ChevronLeft, ChevronRight, LogOut, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const activeItemRef = useRef(null);
  const navContainerRef = useRef(null);

  // Auto-scroll active menu item into view
  useEffect(() => {
    if (activeItemRef.current && navContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [location.pathname]);

  const sections = Object.values(ROUTE_SECTIONS);

  return (
    <aside
      className="sidebar desktop-only-sidebar scroll-hidden"
      style={{
        width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 30,
        position: 'relative'
      }}
    >
      {/* Brand Header */}
      <div style={{
        height: '64px',
        padding: collapsed ? '0 16px' : '0 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        flexShrink: 0,
        backgroundColor: 'var(--sidebar-bg)'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              backgroundColor: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#ffffff',
              fontSize: '16px'
            }}>
              CG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.2 }}>CubeGears</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Garage Enterprise</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
            CG
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Independent Scrollable Navigation (Visually Hidden Scrollbar) */}
      <div
        ref={navContainerRef}
        className="sidebar-nav scroll-hidden"
        style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {sections.map((sec) => {
          const items = routeConfig.filter(r => r.section === sec);
          if (items.length === 0) return null;

          return (
            <div key={sec} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!collapsed && (
                <span style={{
                  padding: '0 8px 4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {sec}
                </span>
              )}
              {items.map((route) => {
                const IconComp = route.icon;
                const isActive = location.pathname.startsWith(route.path);
                const hasChildren = route.children && route.children.length > 0;

                return (
                  <React.Fragment key={route.id}>
                    <NavLink
                      to={route.path}
                      ref={isActive ? activeItemRef : null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: collapsed ? '10px 0' : '10px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: isActive ? '600' : '500',
                        textDecoration: 'none',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                        transition: 'all 0.15s ease'
                      }}
                      title={collapsed ? route.label : undefined}
                    >
                      <IconComp size={18} style={{ flexShrink: 0 }} />
                      {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.label}</span>}
                    </NavLink>

                    {/* Submenu links if expanded and active */}
                    {!collapsed && hasChildren && isActive && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '32px', marginBottom: '4px' }}>
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
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: isChildActive ? '600' : '400',
                                color: isChildActive ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: isChildActive ? 'var(--surface-2)' : 'transparent',
                                textDecoration: 'none'
                              }}
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

      {/* User & Theme Footer Section */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0,
        backgroundColor: 'var(--sidebar-bg)'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', backgroundColor: 'var(--surface-2)', borderRadius: '6px', padding: '2px' }}>
            <button onClick={() => setThemeMode('light')} style={{ flex: 1, border: 'none', background: themeMode === 'light' ? 'var(--surface)' : 'transparent', color: themeMode === 'light' ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }} title="Light"><Sun size={14} style={{ margin: '0 auto' }} /></button>
            <button onClick={() => setThemeMode('dark')} style={{ flex: 1, border: 'none', background: themeMode === 'dark' ? 'var(--surface)' : 'transparent', color: themeMode === 'dark' ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }} title="Dark"><Moon size={14} style={{ margin: '0 auto' }} /></button>
            <button onClick={() => setThemeMode('system')} style={{ flex: 1, border: 'none', background: themeMode === 'system' ? 'var(--surface)' : 'transparent', color: themeMode === 'system' ? 'var(--primary)' : 'var(--text-muted)', padding: '4px', borderRadius: '4px', cursor: 'pointer' }} title="System"><Laptop size={14} style={{ margin: '0 auto' }} /></button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img src={user?.avatar} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</span>
              </div>
            </div>
          ) : (
            <img src={user?.avatar} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          )}
          {!collapsed && (
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Log out">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
