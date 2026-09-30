import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { mobilePrimaryRoutes, mobileMoreRoutes } from '../../routes/routeConfig';
import { MoreHorizontal } from 'lucide-react';
import { MobileSlideSidebar } from './MobileSlideSidebar';
import '../../styles/mobile-bottom-nav.css';

export const MobileBottomNav = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMoreActive = mobileMoreRoutes.some((route) => location.pathname.startsWith(route.path));

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobilePrimaryRoutes.map((route) => {
          const IconComp = route.icon;
          const isActive = location.pathname.startsWith(route.path);

          return (
            <NavLink
              key={route.id}
              to={route.path}
              className={`mobile-bottom-item ${isActive ? 'is-active' : ''}`}
            >
              <span className="mobile-bottom-icon">
                <IconComp size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className="mobile-bottom-label">{route.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`mobile-bottom-item mobile-more-button ${isMoreActive ? 'is-active' : ''}`}
        >
          <span className="mobile-bottom-icon">
            <MoreHorizontal size={19} strokeWidth={2} />
          </span>
          <span className="mobile-bottom-label">More</span>
        </button>
      </nav>

      <MobileSlideSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
