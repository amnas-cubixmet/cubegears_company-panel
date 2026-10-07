import React from 'react';
import { Layers3, Wrench } from 'lucide-react';

export const ServiceCatalogTabs = ({ activeView, onChange }) => (
  <nav className="service-dashboard-tabs">
    <button className={activeView==='services'?'is-active':''} onClick={()=>onChange('services')}><Wrench size={13}/> Services</button>
    <button className={activeView==='categories'?'is-active':''} onClick={()=>onChange('categories')}><Layers3 size={13}/> Categories</button>
  </nav>
);