import React, { useEffect, useRef } from 'react';

export const MobileTabRail = ({ tabs = [], activeTab, onTabChange, className = '' }) => {
  const activeTabRef = useRef(null);
  const railRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      activeTabRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className={['w-full min-w-0 rounded-2xl border border-line bg-surface p-1.5 shadow-sm', className].join(' ')}>
      <div
        ref={railRef}
        className="mobile-tab-rail scroll-hidden flex w-full min-w-0 gap-1.5 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComp = tab.icon;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={[
                'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border-0 px-3.5',
                'text-[12px] font-semibold leading-none transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-transparent text-secondary hover:bg-surface-2 hover:text-content'
              ].join(' ')}
            >
              {IconComp ? <IconComp size={15} /> : null}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
