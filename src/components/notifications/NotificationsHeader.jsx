import React from 'react';
import { BellRing, CheckCheck } from 'lucide-react';

export const NotificationsHeader=({unread,onMarkAll})=><header className="notifications-dashboard-header">
  <div><h1>Notifications</h1><p>Operational, finance, stock, people and account alerts in one place.</p></div>
  <div className="notifications-dashboard-header-actions">
    <div className="notifications-dashboard-header-badge"><BellRing size={13}/><span>Alerts Inbox</span></div>
    <button className="notification-mark-all" onClick={onMarkAll} disabled={!unread}><CheckCheck size={14}/>Mark all read</button>
  </div>
</header>;