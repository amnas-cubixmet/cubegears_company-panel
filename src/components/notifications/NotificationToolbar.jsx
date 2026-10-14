import { Filter, Search } from 'lucide-react';

export const NotificationToolbar = ({
  query, onQuery, category, onCategory, priority, onPriority,
  status, onStatus, categories, priorities, resultCount
}) => (
  <section className="notifications-dashboard-toolbar" aria-label="Notification filters">
    <label className="notifications-dashboard-search">
      <Search size={16} aria-hidden="true"/>
      <input type="search" aria-label="Search notifications" value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search notifications..." />
    </label>
    <label className="notifications-dashboard-filter">
      <Filter size={15} aria-hidden="true"/>
      <select aria-label="Category" value={category} onChange={(event) => onCategory(event.target.value)}>
        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
    <label className="notifications-dashboard-filter">
      <select aria-label="Priority" value={priority} onChange={(event) => onPriority(event.target.value)}>
        {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
    <label className="notifications-dashboard-filter">
      <select aria-label="Read status" value={status} onChange={(event) => onStatus(event.target.value)}>
        {['All', 'Unread', 'Read'].map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
    <div className="notifications-dashboard-count">
      <span>Results</span><strong>{resultCount}</strong>
    </div>
  </section>
);
