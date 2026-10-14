import { AlertCircle, Bell, BellRing, CheckCheck } from 'lucide-react';

export const NotificationStats = ({ unread, high, today, total }) => {
  const cards = [
    ['Unread', unread, 'Need attention', BellRing, 'primary'],
    ['High Priority', high, 'Important alerts', AlertCircle, 'danger'],
    ['Today', today, 'Received today', Bell, 'primary'],
    ['Total', total, 'All notifications', CheckCheck, 'success'],
  ];
  return (
    <section className="notifications-dashboard-stats" aria-label="Notification summary">
      {cards.map(([label, value, meta, Icon, tone]) => (
        <article key={label}>
          <div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>
          <span className={`notification-stat-icon is-${tone}`} aria-hidden="true"><Icon size={18}/></span>
        </article>
      ))}
    </section>
  );
};
