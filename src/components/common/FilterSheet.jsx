import React, { useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from './Button';

export const FilterSheet = ({ isOpen, onClose, title = "Filter Records", children, onApply, onClear }) => {
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
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-950/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-line bg-surface pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            <h3 className="m-0 text-base font-bold text-content">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
          {children}
        </div>

        <div className="flex gap-3 border-t border-line px-5 py-4">
          <Button variant="primary" className="flex-1" onClick={onApply}>Apply Filters</Button>
          <Button variant="outline" className="flex-1" onClick={onClear}>Reset</Button>
        </div>
      </div>
    </div>
  );
};

