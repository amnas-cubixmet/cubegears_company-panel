import React from 'react';

export const SettingsSectionNav=({sections,active,onChange})=><aside className="settings-dashboard-sidebar">
  <div className="settings-dashboard-sidebar-head"><span>Configuration</span><strong>{sections.length} sections</strong></div>
  <nav className="settings-dashboard-nav" aria-label="Settings sections">
    {sections.map(({id,label,icon:Icon})=><button type="button" key={id} className={active===id?'active':''} onClick={()=>onChange(id)}><Icon size={14}/><span>{label}</span></button>)}
  </nav>
</aside>;