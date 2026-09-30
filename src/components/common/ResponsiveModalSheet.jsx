import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const ResponsiveModalSheet = ({ isOpen, onClose, title, children, maxWidth = '720px' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal dialog'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 99999,
        display: 'flex',
        boxSizing: 'border-box'
      }}
      className="responsive-modal-overlay"
    >
      <div
        ref={modalRef}
        className="responsive-modal-sheet"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: maxWidth,
          width: '100%'
        }}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="mobile-drag-handle" style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Sticky Sheet Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            lineHeight: 1.25,
            color: 'var(--text-primary)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="responsive-modal-body scroll-hidden" style={{
          padding: '14px 16px',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

