import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { routeConfig, ROUTE_SECTIONS } from '../../routes/routeConfig';
import { Laptop, LogOut, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const MobileSlideSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const activeItemRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeItemRef.current && containerRef.current) {
      const timer = window.setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 120);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [isOpen, location.pathname, location.search]);

  const sections = Object.values(ROUTE_SECTIONS);

  const isRouteActive = (route) => {
    if (route.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === route.path || location.pathname.startsWith(`${route.path}/`);
  };

  const themeClass = (mode) =>
    [
      'flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border-0 px-2 text-[11px] font-semibold transition',
      themeMode === mode
        ? 'bg-surface text-primary shadow-sm'
        : 'bg-transparent text-muted hover:bg-surface hover:text-content'
    ].join(' ');

  return (
    <>
      <button
        type="button"
        aria-label="Close menu backdrop"
        onClick={onClose}
        className={[
          'fixed inset-0 z-[90] border-0 bg-slate-950/55 p-0 backdrop-blur-[2px] transition-opacity duration-200 md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        ].join(' ')}
      />

      <aside
        aria-hidden={!isOpen}
        className={[
          'fixed bottom-0 right-0 top-0 z-[100] flex h-dvh w-[min(88vw,360px)] flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        ].join(' ')}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">
              CG
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-tight text-content">
                CubeGears
              </div>
              <div className="truncate text-[10px] font-medium text-muted">
                Garage Workspace
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-secondary transition hover:bg-surface hover:text-content"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((section) => {
            const items = routeConfig.filter((route) => route.section === section);
            if (!items.length) return null;

            return (
              <div key={section} className="flex flex-col gap-[5px]">
                <span className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.11em] text-muted">
                  {section}
                </span>

                {items.map((route) => {
                  const IconComp = route.icon;
                  const isActive = isRouteActive(route);
                  const hasChildren = Boolean(route.children?.length);

                  return (
                    <React.Fragment key={route.id}>
                      <NavLink
                        to={route.path}
                        onClick={onClose}
                        ref={isActive ? activeItemRef : null}
                        className={[
                          'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] no-underline transition',
                          isActive
                            ? 'bg-surface-2 font-semibold text-content ring-1 ring-line'
                            : 'font-medium text-content hover:bg-surface-2'
                        ].join(' ')}
                      >
                        <IconComp size={17} strokeWidth={1.9} className={isActive ? 'shrink-0 text-primary' : 'shrink-0 text-secondary'} />
                        <span className="min-w-0 flex-1 truncate">{route.label}</span>
                      </NavLink>

                      {hasChildren && isActive && (
                        <div className="ml-[26px] mr-2 mt-1 flex flex-col">
                          {route.children.map((child, childIndex) => {
                            const childPathname = child.path.split('?')[0];
                            const currentKind = new URLSearchParams(location.search).get('kind') || 'invoice';
                            const isChildActive = child.matchSearch
                              ? location.pathname === childPathname && currentKind === child.matchSearch
                              : location.pathname === childPathname;
                            const isLastChild = childIndex === route.children.length - 1;

                            return (
                              <div key={child.id} className="relative min-h-9 pl-4">
                                <span
                                  aria-hidden="true"
                                  className={[
                                    'absolute left-0 top-0 w-px bg-line',
                                    isLastChild ? 'h-1/2' : 'h-full'
                                  ].join(' ')}
                                />
                                <span
                                  aria-hidden="true"
                                  className="absolute left-0 top-1/2 h-px w-3 bg-line"
                                />

                                <NavLink
                                  to={child.path}
                                  onClick={onClose}
                                  className={[
                                    'flex min-h-9 items-center rounded-lg px-2 py-2 text-[11.5px] leading-tight no-underline transition',
                                    isChildActive
                                      ? 'bg-surface-2 font-semibold text-primary'
                                      : 'font-medium text-secondary hover:bg-surface-2 hover:text-content'
                                  ].join(' ')}
                                >
                                  {child.label}
                                </NavLink>
                              </div>
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

        <div className="shrink-0 border-t border-line bg-surface p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex rounded-xl border border-line bg-surface-2 p-1">
            <button type="button" onClick={() => setThemeMode('light')} className={themeClass('light')}>
              <Sun size={14}/>Light
            </button>
            <button type="button" onClick={() => setThemeMode('dark')} className={themeClass('dark')}>
              <Moon size={14}/>Dark
            </button>
            <button type="button" onClick={() => setThemeMode('system')} className={themeClass('system')}>
              <Laptop size={14}/>System
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={user?.avatar}
                alt="User"
                className="size-9 shrink-0 rounded-full border border-line bg-surface object-cover"
              />

              <div className="min-w-0">
                <div className="truncate text-[11px] font-extrabold text-content">
                  {user?.name || 'User'}
                </div>
                <div className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wide text-muted">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-transparent bg-transparent text-danger transition hover:border-red-200 hover:bg-red-50"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={17}/>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
