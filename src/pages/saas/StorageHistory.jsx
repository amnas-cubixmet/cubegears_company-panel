import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarRange, ChevronRight, Files, HardDrive, IndianRupee } from 'lucide-react';
import { storageHistoryService } from '../../services/storageHistory.service';

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const dayLabel = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const toIso = (date) => date.toISOString().slice(0, 10);
const daysAgo = (count) => toIso(new Date(Date.now() - count * 86400000));

export function StorageHistory() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(daysAgo(6));
  const [to, setTo] = useState(toIso(new Date()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    storageHistoryService.getStorageHistory({ from, to }).then(setRows).finally(() => setLoading(false));
  }, [from, to]);

  const summary = useMemo(() => storageHistoryService.summarizeStorageHistory(rows), [rows]);

  const preset = (days) => {
    setTo(toIso(new Date()));
    setFrom(daysAgo(days - 1));
  };

  return (
    <div className="saas-page storage-history-page">
      <header className="saas-page-head storage-history-head">
        <div>
          <span className="saas-kicker">STORAGE BILLING LEDGER</span>
          <h1>Usage history</h1>
          <p>Select an interval to review every daily storage snapshot and charge.</p>
        </div>
      </header>

      <section className="saas-card saas-wide storage-filter-card">
        <div className="storage-range-presets">
          <button onClick={() => preset(7)}>7 days</button>
          <button onClick={() => preset(30)}>30 days</button>
          <button onClick={() => preset(90)}>90 days</button>
        </div>
        <div className="storage-range-inputs">
          <label><span>From</span><input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
          <label><span>To</span><input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
      </section>

      <div className="storage-summary-grid">
        <section className="saas-card"><CalendarRange size={20} /><span>Interval</span><strong>{summary.days} days</strong></section>
        <section className="saas-card"><HardDrive size={20} /><span>Average stored</span><strong>{summary.averageGb.toFixed(2)} GB</strong></section>
        <section className="saas-card"><HardDrive size={20} /><span>Peak storage</span><strong>{summary.peakGb.toFixed(2)} GB</strong></section>
        <section className="saas-card"><IndianRupee size={20} /><span>Storage charge</span><strong>{money.format(summary.totalCharge)}</strong></section>
      </div>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">DAILY BREAKDOWN</span><h2>{from} → {to}</h2></div><span>{rows.length} snapshots</span></div>
        {loading ? <div className="saas-loading">Loading usage history…</div> : (
          <div className="storage-history-list">
            {rows.map((row) => (
              <button key={row.date} className="storage-history-row" onClick={() => navigate(`/account/storage/history/${row.date}`)}>
                <div className="storage-history-date"><strong>{dayLabel.format(new Date(`${row.date}T12:00:00`))}</strong><span>{row.snapshotType === 'live' ? 'Live snapshot' : 'Daily closing snapshot'}</span></div>
                <div><span>Stored</span><strong>{Number(row.usedGb).toFixed(2)} GB</strong></div>
                <div><span>Files</span><strong>{row.fileCount}</strong></div>
                <div><span>Rate</span><strong>₹{row.rate}/GB/day</strong></div>
                <div><span>Charge</span><strong>{money.format(row.charge)}</strong></div>
                <ChevronRight size={18} />
              </button>
            ))}
            {!rows.length && <p className="saas-muted">No usage snapshots in this interval.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

export function StorageDayDetail() {
  const navigate = useNavigate();
  const { date } = useParams();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageHistoryService.getStorageDay(date).then(setSnapshot).finally(() => setLoading(false));
  }, [date]);

  if (loading) return <div className="saas-page"><div className="saas-loading">Loading snapshot…</div></div>;
  if (!snapshot) return <div className="saas-page"><div className="saas-error">Storage snapshot not found.</div></div>;

  return (
    <div className="saas-page storage-history-page">
      <header className="saas-page-head">
        <div>
          <span className="saas-kicker">DAILY STORAGE SNAPSHOT</span>
          <h1>{dayLabel.format(new Date(`${snapshot.date}T12:00:00`))}</h1>
          <p>Files and storage recorded for this billing day.</p>
        </div>
      </header>

      <div className="storage-summary-grid">
        <section className="saas-card"><HardDrive size={20} /><span>Stored</span><strong>{Number(snapshot.usedGb).toFixed(2)} GB</strong></section>
        <section className="saas-card"><Files size={20} /><span>Files</span><strong>{snapshot.fileCount}</strong></section>
        <section className="saas-card"><IndianRupee size={20} /><span>Rate</span><strong>₹{snapshot.rate}/GB/day</strong></section>
        <section className="saas-card"><IndianRupee size={20} /><span>Daily charge</span><strong>{money.format(snapshot.charge)}</strong></section>
      </div>

      <section className="saas-card saas-wide">
        <div className="saas-card-head"><div><span className="saas-kicker">FILES IN SNAPSHOT</span><h2>Stored files</h2></div><span>{snapshot.files?.length || 0} files</span></div>
        <div className="saas-media-list">
          {(snapshot.files || []).map((file) => (
            <article className="saas-media-row" key={file.id}>
              <div className="saas-file-icon">IMG</div>
              <div className="saas-file-main"><strong>{file.name}</strong><span>{file.category} · {file.sizeMb} MB · {file.uploadedBy}</span></div>
              <span className="saas-file-date">{file.uploadedAt ? dayLabel.format(new Date(file.uploadedAt)) : '—'}</span>
            </article>
          ))}
          {!snapshot.files?.length && <p className="saas-muted">No file metadata was stored in this snapshot.</p>}
        </div>
      </section>
    </div>
  );
}
