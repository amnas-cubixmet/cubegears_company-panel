import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { mobilePrimaryRoutes, mobileMoreRoutes } from '../../routes/routeConfig';
import { MoreHorizontal } from 'lucide-react';
import { MobileSlideSidebar } from './MobileSlideSidebar';

export const MobileBottomNav = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMoreActive = mobileMoreRoutes.some((route) => location.pathname.startsWith(route.path));

  const itemClass = (active) =>
    [
      'flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1',
      'text-[11px] font-medium no-underline transition-colors duration-150',
      active ? 'text-primary' : 'text-secondary'
    ].join(' ');

  const iconShellClass = (active) =>
    [
      'flex min-h-7 items-center justify-center rounded-full px-3 transition-colors duration-150',
      active ? 'bg-primary-soft text-primary' : 'bg-transparent text-secondary'
    ].join(' ');

  return (
    <>
      <nav className="mobile-only-bottom-nav fixed inset-x-0 bottom-0 z-50 hidden h-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))] items-center justify-around border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] max-[767px]:flex">
        {mobilePrimaryRoutes.map((route) => {
          const IconComp = route.icon;
          const isActive = location.pathname.startsWith(route.path);

          return (
            <NavLink key={route.id} to={route.path} className={itemClass(isActive)}>
              <span className={iconShellClass(isActive)}>
                <IconComp size={20} />
              </span>
              <span className={isActive ? 'font-bold' : 'font-medium'}>{route.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`${itemClass(isMoreActive)} border-0 bg-transparent p-0`}
        >
          <span className={iconShellClass(isMoreActive)}>
            <MoreHorizontal size={20} />
          </span>
          <span className={isMoreActive ? 'font-bold' : 'font-medium'}>More</span>
        </button>
      </nav>

      <MobileSlideSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
