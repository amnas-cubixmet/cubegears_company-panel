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
    if (!isOpen || !activeItemRef.current) return undefined;

    const timer = window.setTimeout(() => {
      activeItemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isOpen, location.pathname, location.search]);

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

  const themeClass = (mode) =>
    [
      'grid h-7 flex-1 place-items-center rounded-lg border-0 transition-colors',
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
          'fixed bottom-0 right-0 top-0 z-[100] flex h-dvh w-[min(90vw,340px)] flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        ].join(' ')}
      >
        {/* LOGO / HEADER AREA */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-sans text-xs font-bold text-white">
              CG
            </div>

            <div className="min-w-0 text-left">
              <div className="truncate font-sans text-[14px] font-bold text-content leading-tight">
                CubeGears
              </div>
              <div className="truncate font-sans text-[10px] font-medium text-muted leading-tight mt-0.5">
                Workshop Management
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-muted transition hover:bg-surface hover:text-content"
            aria-label="Close menu"
            title="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-3 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((section) => {
            const items = routeConfig.filter((route) => route.section === section);
            if (!items.length) return null;

            return (
              <section key={section} className="flex flex-col gap-[5px]">
                <span className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.11em] text-muted">
                  {section}
                </span>

                {items.map((route) => {
                  const IconComp = route.icon;
                  const isActive = isRouteActive(route);

                  return (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={onClose}
                      ref={isActive ? activeItemRef : null}
                      className={[
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-[13px] no-underline transition-colors',
                        isActive
                          ? 'bg-primary-soft font-semibold text-primary'
                          : 'font-medium text-content hover:bg-surface-2'
                      ].join(' ')}
                    >
                      <IconComp size={17} strokeWidth={1.9} className={isActive ? 'shrink-0 text-primary' : 'shrink-0 text-secondary'} />
                      <span className="min-w-0 flex-1 truncate">{route.label}</span>
                    </NavLink>
                  );
                })}
              </section>
            );
          })}
        </nav>

        {/* FOOTER AREA */}
        <div className="shrink-0 border-t border-line bg-surface p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {/* THEME TOGGLE */}
          <div className="mb-3 flex rounded-xl border border-line bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={themeClass('light')}
              title="Light theme"
              aria-label="Light theme"
            >
              <Sun size={14} />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={themeClass('dark')}
              title="Dark theme"
              aria-label="Dark theme"
            >
              <Moon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={themeClass('system')}
              title="System theme"
              aria-label="System theme"
            >
              <Laptop size={14} />
            </button>
          </div>

          {/* USER PROFILE */}
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 p-2.5 gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={user?.avatar}
                alt={user?.name || 'User avatar'}
                className="size-8 shrink-0 rounded-full border border-line bg-surface object-cover"
              />

              <div className="min-w-0 text-left">
                <div className="truncate font-sans text-[11px] font-semibold text-content leading-tight">
                  {user?.name || 'User'}
                </div>
                <div className="truncate font-sans text-[9px] font-medium uppercase tracking-wider text-muted leading-tight mt-0.5">
                  {user?.role || 'ADMIN'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="grid size-7 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-danger transition hover:bg-red-500/10"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

