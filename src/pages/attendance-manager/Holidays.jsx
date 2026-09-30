import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';

export const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState('Company Holiday');
  const [branches, setBranches] = useState('All Branches');
  const [recurring, setRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const data = await attendanceManagerService.getHolidays();
      setHolidays(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) return;

    setSaving(true);
    setTimeout(() => {
      const newHol = {
        id: `HOL-0${holidays.length + 1}`,
        name: holidayName,
        date: holidayDate,
        type: holidayType,
        branches,
        recurring,
        notes,
        status: 'Active'
      };
      setHolidays([...holidays, newHol]);
      setIsAddHolidayOpen(false);
      setSaving(false);
      setHolidayName('');
      setHolidayDate('');
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Company & Branch Holidays</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Configure global company holidays and specific branch off days.</p>
        </div>

        <button
          onClick={() => setIsAddHolidayOpen(true)}
          style={{ height: '42px', padding: '0 16px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' }}>
        {holidays.map(h => (
          <div key={h.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{h.name}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: h.type === 'Company Holiday' ? 'var(--danger-soft)' : 'var(--warning-soft)', color: h.type === 'Company Holiday' ? 'var(--danger)' : 'var(--warning)' }}>
                {h.type}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {h.date}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Branches:</strong> {h.branches}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Recurring:</strong> {h.recurring ? 'Annual' : 'One-time'}</div>
              {h.notes && <div><strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {h.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Holiday Responsive Modal Sheet */}
      <ResponsiveModalSheet
        isOpen={isAddHolidayOpen}
        onClose={() => setIsAddHolidayOpen(false)}
        title="Add New Holiday"
      >
        <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Holiday Name *
            </label>
            <input
              type="text"
              required
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Onam Festival"
              style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Holiday Date *
              </label>
              <input
                type="date"
                required
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Holiday Type *
              </label>
              <select
                value={holidayType}
                onChange={(e) => setHolidayType(e.target.value)}
                style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
              >
                <option value="Company Holiday">Company Holiday</option>
                <option value="Branch Holiday">Branch Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Applicable Branches
            </label>
            <input
              type="text"
              value={branches}
              onChange={(e) => setBranches(e.target.value)}
              placeholder="e.g. Main Workshop, Kochi North"
              style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              />
              Recurring Annual Holiday
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Notes / Description
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional holiday details..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
            <button
              type="button"
              onClick={() => setIsAddHolidayOpen(false)}
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, height: '46px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
