import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ExternalLink,
  Filter,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { resourceConfigs } from '../operations/resourceConfigs';
import '../../styles/notifications.css';

const service = resourceConfigs.notifications.service;
const categories = ['All', 'Operational', 'Approvals & People', 'Finance', 'Stock', 'Website & Account'];
const priorities = ['All', 'Critical', 'High', 'Normal', 'Low'];

const iconFor = (category) => {
  if (category === 'Finance') return '₹';
  if (category === 'Stock') return 'ST';
  if (category === 'Approvals & People') return 'HR';
  if (category === 'Website & Account') return 'AC';
  return 'OP';
};

const timeLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function Notifications() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await service.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !q || [row.title, row.description, row.reference, row.category]
        .some((value) => String(value || '').toLowerCase().includes(q));
      const matchesCategory = category === 'All' || row.category === category;
      const matchesPriority = priority === 'All' || row.priority === priority;
      const matchesStatus = status === 'All' || row.status === status;
      return matchesQuery && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [rows, query, category, priority, status]);

  const unread = rows.filter((row) => row.status === 'Unread').length;
  const high = rows.filter((row) => ['High', 'Critical'].includes(row.priority) && row.status !== 'Archived').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.filter((row) => String(row.created || row.createdAt || '').slice(0, 10) === today).length;

  const updateStatus = async (row, nextStatus) => {
    try {
      const updated = await service.update(row.id, { status: nextStatus });
      setRows((old) => old.map((item) => item.id === row.id ? { ...item, ...updated } : item));
      if (selected?.id === row.id) setSelected((old) => ({ ...old, ...updated }));
    } catch (e) {
      setError(e?.message || 'Unable to update notification.');
    }
  };

  const openNotification = async (row) => {
    setSelected(row);
    if (row.status === 'Unread') await updateStatus(row, 'Read');
  };

  const markAllRead = async () => {
    const unreadRows = rows.filter((row) => row.status === 'Unread');
    try {
      const updated = await Promise.all(unreadRows.map((row) => service.update(row.id, { status: 'Read' })));
      const map = new Map(updated.map((row) => [row.id, row]));
      setRows((old) => old.map((row) => map.has(row.id) ? { ...row, ...map.get(row.id) } : row));
    } catch (e) {
      setError(e?.message || 'Unable to mark all as read.');
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await service.remove(row.id);
      setRows((old) => old.filter((item) => item.id !== row.id));
      if (selected?.id === row.id) setSelected(null);
    } catch (e) {
      setError(e?.message || 'Unable to delete notification.');
    }
  };

  return (
    <div className="notifications-page">
      <header className="notifications-head">
        <div>
          <span className="notifications-kicker">INBOX & ALERTS</span>
          <h1>Notifications</h1>
          <p>Operational, finance, stock, people and account alerts in one place.</p>
        </div>
        <button className="notification-mark-all" onClick={markAllRead} disabled={!unread}>
          <CheckCheck size={16}/>Mark all read
        </button>
      </header>

      <section className="notification-stats">
        <article><i><BellRing size={16}/></i><div><span>Unread</span><strong>{unread}</strong></div></article>
        <article><i><AlertCircle size={16}/></i><div><span>High Priority</span><strong>{high}</strong></div></article>
        <article><i><Bell size={16}/></i><div><span>Today</span><strong>{todayCount}</strong></div></article>
        <article><i><Check size={16}/></i><div><span>Total</span><strong>{rows.length}</strong></div></article>
      </section>

      <section className="notifications-toolbar">
        <label className="notifications-search">
          <Search size={16}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, reference or category…" />
        </label>

        <div className="notifications-filters">
          <label><Filter size={14}/><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>{['All','Unread','Read','Archived'].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      </section>

      {error && <div className="notifications-error">{error}</div>}

      <div className="notifications-layout">
        <section className="notifications-list">
          {loading ? <div className="notifications-empty">Loading notifications…</div> : filtered.length ? filtered.map((row) => (
            <article
              key={row.id}
              className={`notification-row ${row.status === 'Unread' ? 'is-unread' : ''}`}
              onClick={() => openNotification(row)}
            >
              <div className={`notification-avatar priority-${String(row.priority || 'Normal').toLowerCase()}`}>{iconFor(row.category)}</div>

              <div className="notification-copy">
                <div className="notification-title-line">
                  <strong>{row.title}</strong>
                  {row.status === 'Unread' && <span className="unread-dot" aria-label="Unread"/>}
                </div>
                <p>{row.description || row.reference || 'System notification'}</p>
                <div className="notification-meta">
                  <span>{row.category || 'General'}</span>
                  <span>{row.priority || 'Normal'}</span>
                  {row.reference && <span>{row.reference}</span>}
                </div>
              </div>

              <div className="notification-side">
                <time>{timeLabel(row.created || row.createdAt)}</time>
                <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                  <button title={row.status === 'Unread' ? 'Mark read' : 'Mark unread'} onClick={() => updateStatus(row, row.status === 'Unread' ? 'Read' : 'Unread')}>
                    {row.status === 'Unread' ? <Check size={14}/> : <Bell size={14}/>}
                  </button>
                  <button className="danger" title="Delete" onClick={() => remove(row)}><Trash2 size={14}/></button>
                </div>
              </div>
            </article>
          )) : <div className="notifications-empty">No notifications match your filters.</div>}
        </section>

        <aside className={`notification-detail ${selected ? 'is-open' : ''}`}>
          {selected ? (
            <>
              <div className="notification-detail-head">
                <div>
                  <span>{selected.category || 'Notification'}</span>
                  <h2>{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)}><X size={16}/></button>
              </div>

              <div className="notification-detail-body">
                <div className="notification-detail-badges">
                  <span>{selected.priority || 'Normal'} Priority</span>
                  <span>{selected.status || 'Read'}</span>
                </div>

                <p>{selected.description || 'No additional description was provided for this notification.'}</p>

                <div className="notification-detail-grid">
                  <div><span>Reference</span><strong>{selected.reference || '—'}</strong></div>
                  <div><span>Created</span><strong>{timeLabel(selected.created || selected.createdAt)}</strong></div>
                  <div><span>Category</span><strong>{selected.category || 'General'}</strong></div>
                  <div><span>Status</span><strong>{selected.status || '—'}</strong></div>
                </div>
              </div>

              <div className="notification-detail-actions">
                {selected.status !== 'Archived' && <button onClick={() => updateStatus(selected, 'Archived')}>Archive</button>}
                <button className="danger" onClick={() => remove(selected)}><Trash2 size={14}/>Delete</button>
              </div>
            </>
          ) : (
            <div className="notification-detail-empty">
              <ExternalLink size={22}/>
              <strong>Select a notification</strong>
              <span>Open an alert to view full details and actions.</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Notifications;
