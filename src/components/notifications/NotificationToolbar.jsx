import React from 'react';
import { Filter, Search } from 'lucide-react';
export const NotificationToolbar=({query,onQuery,category,onCategory,priority,onPriority,status,onStatus,categories,priorities,resultCount})=><section className="notifications-dashboard-toolbar">
 <label className="notifications-dashboard-search"><Search size={14}/><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search title, reference or category"/></label>
 <label className="notifications-dashboard-filter"><Filter size={13}/><select value={category} onChange={e=>onCategory(e.target.value)}>{categories.map(item=><option key={item}>{item}</option>)}</select></label>
 <label className="notifications-dashboard-filter"><select value={priority} onChange={e=>onPriority(e.target.value)}>{priorities.map(item=><option key={item}>{item}</option>)}</select></label>
 <label className="notifications-dashboard-filter"><select value={status} onChange={e=>onStatus(e.target.value)}>{['All','Unread','Read','Archived'].map(item=><option key={item}>{item}</option>)}</select></label>
 <div className="notifications-dashboard-count"><span>Showing</span><strong>{resultCount}</strong></div>
</section>;