import { BellRing, CheckCheck, RefreshCw } from 'lucide-react';

export const NotificationsHeader = ({ unread, onMarkAll, onRefresh, loading }) => (
  <header className="notifications-dashboard-header">
    <div className="notifications-dashboard-header-title">
      <span className="notifications-dashboard-header-icon" aria-hidden="true"><BellRing size={19}/></span>
      <div>
        <h1>Notifications</h1>
        <p>Workshop alerts, approvals, stock, payments and account updates.</p>
      </div>
    </div>
    <div className="notifications-dashboard-header-actions">
      <span className="notifications-dashboard-header-badge">{unread} unread</span>
      <button type="button" className="notification-refresh" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={15} aria-hidden="true"/> Refresh
      </button>
      <button type="button" className="notification-mark-all" onClick={onMarkAll} disabled={loading || !unread}>
        <CheckCheck size={15} aria-hidden="true"/> Mark all read
      </button>
    </div>
  </header>
);
