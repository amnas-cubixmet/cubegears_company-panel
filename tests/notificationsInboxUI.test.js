import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isNotificationUnread, unreadNotificationCount, normalizeNotification }
  from '../src/utils/notificationInbox.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const screen = read('../src/pages/notifications/Notifications.jsx');
const header = read('../src/components/layout/Header.jsx');
const sidebar = read('../src/components/layout/Sidebar.jsx');
const toolbar = read('../src/components/notifications/NotificationToolbar.jsx');
const api = read('../src/services/notificationInbox.service.js');
const css = read('../src/styles/notifications.css');

test('Django is_read and mock status produce the same unread counts', () => {
  const rows = [
    { id: 1, is_read: false, status: 'Read' },
    { id: 2, is_read: true, status: 'Unread' },
    { id: 3, status: 'Unread' },
    { id: 4, status: 'Read' }
  ];
  assert.equal(unreadNotificationCount(rows), 2);
  assert.equal(unreadNotificationCount(null), 0);
  assert.equal(isNotificationUnread(rows[0]), true);
  assert.equal(isNotificationUnread(rows[1]), false);
  assert.equal(normalizeNotification(rows[0]).status, 'Unread');
  assert.equal(normalizeNotification(rows[1]).status, 'Read');
});

test('Attendance alerts stay high priority and descriptive', () => {
  const alert = normalizeNotification({
    title: 'Attendance approval', message: 'Leave awaiting approval',
    notification_type: 'attendance_leave_request',
    data: { requestId: 'REQ-202' }, is_read: false
  });
  assert.equal(alert.priority, 'High');
  assert.equal(alert.description, 'Leave awaiting approval');
  assert.equal(alert.reference, 'REQ-202');
  assert.equal(alert.status, 'Unread');
});

test('Read/unread changes use supported Django PATCH endpoints and same-tab badge event', () => {
  assert.match(api, /apiClient\.patch\(\`\$\{API_ENDPOINTS\.NOTIFICATIONS\}\/\$\{row\.id\}\/read\`/);
  assert.match(api, /apiClient\.patch\(\`\$\{API_ENDPOINTS\.NOTIFICATIONS\}\/\$\{row\.id\}\`/);
  assert.match(api, /cubixgear:notifications-changed/);
  assert.doesNotMatch(api, /apiClient\.put/);
});

test('Both navigation badges read Django is_read and refresh after inbox changes', () => {
  for (const component of [header, sidebar]) {
    assert.match(component, /unreadNotificationCount\(rows\)/);
    assert.match(component, /addEventListener\('cubixgear:notifications-changed'/);
    assert.match(component, /removeEventListener\('cubixgear:notifications-changed'/);
  }
  assert.match(header, /<BellRing size=\{19\}/);
  assert.match(header, /mobile-notification-button/);
  assert.match(header, /navigate\('\/notifications'\)/);
});

test('Notifications actions are accessible and backend-consistent', () => {
  assert.match(screen, /className="notification-row-open"/);
  assert.match(screen, /aria-label=\{\`View notification:/);
  assert.match(screen, /role="alert"/);
  assert.match(screen, /Promise\.allSettled/);
  assert.match(screen, /notificationInboxService/);
  assert.doesNotMatch(screen, /'Archived'|>Archive</);
  assert.match(toolbar, /\['All', 'Unread', 'Read'\]/);
  assert.match(toolbar, /aria-label="Category"/);
  assert.match(toolbar, /aria-label="Read status"/);
});

test('Notifications Dashboard layout uses readable text and mobile single-column inbox', () => {
  assert.match(css, /\.notifications-dashboard-stats/);
  assert.match(css, /\.notification-row-open/);
  assert.match(css, /\.notification-detail/);
  assert.match(css, /font-size:13px/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /grid-template-columns:minmax\(0,1fr\)/);
});
