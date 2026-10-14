import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FilePenLine, HardDrive, ShieldCheck, Coins, Zap, FileClock, CreditCard } from 'lucide-react';

// One shared navigation for every Account route. Settings remains available
// outside Account; it is intentionally not a wallet tab.
const tabs=[
 ['overview','Overview','/account',Coins],
 ['credits-buy','Buy Credits','/account/credits/buy',CreditCard],
 ['credits-features','Features','/account/credits/features',Zap],
 ['storage','Storage','/account/storage',HardDrive],
 ['credits-logs','Logs','/account/credits/logs',FileClock],
 ['templates','Templates','/account/templates',FilePenLine],
 ['security','Security','/account/security',ShieldCheck],
];

export const AccountHeader=({title,subtitle,active,onNavigate,actions})=>{
  const location = useLocation();
  const tabListRef = useRef(null);

  // Only scroll the tab strip horizontally. Calling scrollIntoView here would
  // also move the dashboard's vertical scroll container unexpectedly.
  useEffect(() => {
    const nav = tabListRef.current;
    const selected = nav?.querySelector('[aria-current="page"]');
    if (!nav || !selected) return;
    const left = selected.offsetLeft - nav.offsetLeft;
    const target = Math.max(0, left - (nav.clientWidth - selected.offsetWidth) / 2);
    nav.scrollLeft = target;
  }, [active]);

  const openTab = (path) => {
    if (location.pathname === path) {
      document.querySelector('.app-scroll-area')?.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    onNavigate(path);
  };

  return <>
    <header className="account-dashboard-header">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {actions ? <div className="account-dashboard-actions">{actions}</div> : null}
    </header>
    <nav ref={tabListRef} className="account-dashboard-tabs" aria-label="Account navigation">
      {tabs.map(([key,label,path,Icon])=><button
        type="button"
        key={key}
        className={active===key?'is-active':''}
        aria-current={active===key?'page':undefined}
        onClick={()=>openTab(path)}
      ><Icon size={15} aria-hidden="true"/>{label}</button>)}
    </nav>
  </>;
};
