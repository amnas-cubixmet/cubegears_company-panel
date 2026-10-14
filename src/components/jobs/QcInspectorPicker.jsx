import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, UserRoundPlus } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { staffService } from '../../services/staff.service';
import {
  eligibleQcInspectors, qcInspectorDuplicate, searchQcInspectors, validateNewQcInspector,
} from './qcInspectorPicker.utils';

/** Select a real employee or create a new active QC Inspector staff profile. */
export function QcInspectorPicker({ staff = [], value = '', inspectorId = '', disabled = false,
  invalid = false, onSelect, onStaffCreated }) {
  const [query, setQuery] = useState(value);
  const [opened, setOpened] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (value) setQuery(String(value)); }, [value]);

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpened(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const matches = useMemo(() => searchQcInspectors(staff, query), [staff, query]);
  const eligibleCount = useMemo(() => eligibleQcInspectors(staff).length, [staff]);

  const choose = (person) => {
    onSelect({ inspector: person.name, inspectorId: String(person.id) });
    setQuery(person.name);
    setOpened(false);
    setApiError('');
  };

  const openNew = () => {
    setName(query.trim() || '');
    setPhone('');
    setErrors({});
    setApiError('');
    setOpened(false);
    setShowAdd(true);
  };

  const create = async (event) => {
    event.preventDefault();
    if (saving || disabled) return;
    const invalidFields = validateNewQcInspector(name, phone);
    setErrors(invalidFields);
    if (Object.keys(invalidFields).length) return;

    const duplicate = qcInspectorDuplicate(staff, name);
    if (duplicate) {
      setApiError('This inspector already exists. Select them from the search results.');
      return;
    }
    setSaving(true);
    setApiError('');
    try {
      const saved = await staffService.createStaff({
        name: name.trim(),
        phone: phone.trim(),
        designation: 'QC Inspector',
        department: 'Quality Check',
        employmentStatus: 'Active',
      });
      if (!saved?.id) throw new Error('Staff profile did not return an ID. Refresh before retrying.');
      onStaffCreated?.(saved);
      choose({ id: saved.id, name: saved.name || name.trim() });
      setShowAdd(false);
      setName('');
      setPhone('');
    } catch (error) {
      const response = error?.response?.data;
      const detail = response?.name || response?.phone || response?.detail || response?.message ||
        response?.non_field_errors || error?.message;
      setApiError(Array.isArray(detail) ? detail.join(' ') :
        typeof detail === 'string' ? detail : 'Unable to add inspector. Check staff creation permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="job-qc-inspector-search" ref={rootRef}>
        <div className="job-qc-inspector-input-wrap">
          <Search size={17} aria-hidden="true"/>
          <input
            id="job-qc-inspector" ref={inputRef} type="search"
            value={query} disabled={disabled || saving}
            placeholder="Search inspector name, role or employee number"
            autoComplete="off" role="combobox"
            aria-autocomplete="list"
            aria-expanded={opened}
            aria-controls="job-qc-inspector-results"
            aria-invalid={invalid}
            onFocus={() => !disabled && setOpened(true)}
            onChange={(event) => {
              const next = event.target.value;
              setQuery(next);
              setOpened(true);
              // Search text must never be silently saved as the selected inspector.
              if (value || inspectorId) onSelect({ inspector: '', inspectorId: '' });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpened(false);
              if (event.key === 'ArrowDown') setOpened(true);
              if (event.key === 'Enter' && opened && matches.length === 1) {
                event.preventDefault();
                choose(matches[0]);
              }
            }}
          />
          <button type="button" className="job-qc-inspector-expand" aria-label="Show inspectors"
            disabled={disabled} onClick={() => { setOpened((current) => !current); inputRef.current?.focus(); }}>
            <ChevronDown size={17} aria-hidden="true"/>
          </button>
        </div>
        {Boolean(value) && (
          <div className="job-qc-selected-inspector">
            <Check size={14} aria-hidden="true"/> Selected: <strong>{value}</strong>
          </div>
        )}
        {!disabled && opened && (
          <div className="job-qc-inspector-results" id="job-qc-inspector-results" role="listbox" aria-label="Matching staff">
            {matches.length ? matches.map((person) => (
              <button key={person.id} type="button" role="option"
                aria-selected={String(inspectorId) === person.id}
                onClick={() => choose(person)}>
                <span><strong>{person.name}</strong>{person.subtitle && <small>{person.subtitle}</small>}</span>
                {String(inspectorId) === person.id && <Check size={16} aria-hidden="true"/>}
              </button>
            )) : (
              <p className="job-qc-no-inspector">
                {eligibleCount ? 'No matching active staff. Add a new inspector below.' : 'No active staff found. Add a new inspector.'}
              </p>
            )}
            <button type="button" className="job-qc-inspector-add-option" onClick={openNew}>
              <UserRoundPlus size={17} aria-hidden="true"/>
              <span><strong>Add New QC Inspector</strong><small>Create a new staff profile</small></span>
            </button>
          </div>
        )}
        {!disabled && <button type="button" className="job-qc-inspector-add-trigger" onClick={openNew}>
          <Plus size={15} aria-hidden="true"/> Add New Inspector
        </button>}
      </div>

      <ResponsiveModalSheet isOpen={showAdd} onClose={() => { if (!saving) setShowAdd(false); }}
        title="Add New QC Inspector" maxWidth="490px">
        <form className="job-qc-add-inspector-form" onSubmit={create}>
          <p>Creates an active staff profile in CubixGear and selects this inspector for the current Quality Check.</p>
          {apiError && <div className="job-qc-error" role="alert">{apiError}</div>}
          <label htmlFor="job-qc-new-name">Inspector Name *</label>
          <input autoFocus id="job-qc-new-name" required maxLength={120}
            value={name} onChange={(event) => { setName(event.target.value); setErrors({}); setApiError(''); }}
            placeholder="Inspector full name" aria-invalid={Boolean(errors.name)} disabled={saving}/>
          {errors.name && <small className="job-qc-field-error" role="alert">{errors.name}</small>}
          <label htmlFor="job-qc-new-phone">Phone (optional)</label>
          <input id="job-qc-new-phone" type="tel" maxLength={30}
            value={phone} onChange={(event) => { setPhone(event.target.value); setErrors({}); setApiError(''); }}
            placeholder="Staff contact number" aria-invalid={Boolean(errors.phone)} disabled={saving}/>
          {errors.phone && <small className="job-qc-field-error" role="alert">{errors.phone}</small>}
          <div className="job-qc-add-inspector-actions">
            <button type="button" className="job-qc-inspector-cancel" disabled={saving} onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="job-qc-inspector-create" disabled={saving}>
              <Plus size={16} aria-hidden="true"/>{saving ? 'Adding…' : 'Save & Select Inspector'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </>
  );
}
