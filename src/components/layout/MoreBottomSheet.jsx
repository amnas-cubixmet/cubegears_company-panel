import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { mobileMoreRoutes } from '../../routes/routeConfig';
import { X } from 'lucide-react';

export const MoreBottomSheet = ({ isOpen, onClose }) => {
  const location = useLocation();
  const activeItemRef = useRef(null);
  const sheetScrollRef = useRef(null);

  // Auto-scroll active item into view when sheet opens
  useEffect(() => {
    if (isOpen && activeItemRef.current && sheetScrollRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isOpen, location.pathname]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderTop: '1px solid #334155',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle / Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#475569', borderRadius: '2px', margin: '0 auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>All Workshop Modules</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Items Grid / List */}
        <div
          ref={sheetScrollRef}
          className="custom-scrollbar"
          style={{
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px'
          }}
        >
          {mobileMoreRoutes.map((route) => {
            const IconComp = route.icon;
            const isActive = location.pathname.startsWith(route.path);

            return (
              <NavLink
                key={route.id}
                to={route.path}
                onClick={onClose}
                ref={isActive ? activeItemRef : null}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 10px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#6366f1' : '#0f172a',
                  border: isActive ? '1px solid #6366f1' : '1px solid #334155',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <IconComp size={22} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span style={{ fontSize: '12px', fontWeight: '500', lineHeight: 1.2 }}>{route.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
