import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

const EMPTY = {
  name: '',
  code: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'Kerala',
  pincode: '',
  is_head_office: false,
};

export const BranchCreateSheet = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim() || saving) return;

    setSaving(true);
    setError('');
    try {
      await onCreate({
        ...form,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      });
      setForm(EMPTY);
      onClose();
    } catch (err) {
      setError(err?.message || 'Unable to create branch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Branch"
      maxWidth="620px"
    >
      <form className="staff-branch-form" onSubmit={submit}>
        {error && <div className="staff-crud-error">{error}</div>}

        <div className="staff-branch-form__intro">
          <Building2 size={16} />
          <div>
            <strong>New Workshop Branch</strong>
            <span>Create once and use it in teams, shifts and staff assignment.</span>
          </div>
        </div>

        <div className="staff-crud-form__grid">
          <label>
            Branch Name *
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Chalakudy Branch"
            />
          </label>

          <label>
            Branch Code *
            <input
              required
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              placeholder="e.g. CLK"
            />
          </label>

          <label>
            Phone
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>

          <label>
            City
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>

          <label>
            State
            <input value={form.state} onChange={(e) => set('state', e.target.value)} />
          </label>

          <label>
            Pincode
            <input value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          </label>

          <label className="staff-branch-checkbox">
            <span>
              <strong>Head Office</strong>
              <small>Mark this branch as the company head office.</small>
            </span>
            <input
              type="checkbox"
              checked={form.is_head_office}
              onChange={(e) => set('is_head_office', e.target.checked)}
            />
          </label>
        </div>

        <label>
          Address
          <textarea
            rows={3}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Full branch address"
          />
        </label>

        <div className="staff-crud-form__actions">
          <button type="button" className="staff-crud-cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="staff-crud-save-button" disabled={saving}>
            <Save size={14} />
            {saving ? 'Creating...' : 'Create Branch'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
