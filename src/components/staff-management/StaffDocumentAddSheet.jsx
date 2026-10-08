import React, { useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const StaffDocumentAddSheet = ({
  open,
  onClose,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    documentType: 'ID Proof',
    fileUrl: '',
    expiryDate: '',
    notes: '',
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.fileUrl.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
      setForm({
        title: '',
        documentType: 'ID Proof',
        fileUrl: '',
        expiryDate: '',
        notes: '',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={open}
      onClose={onClose}
      title="Add Staff Document"
      maxWidth="560px"
    >
      <form className="staff-document-add-form" onSubmit={submit}>
        <label>Document Name<input required value={form.title} onChange={(e) => setForm((old) => ({ ...old, title: e.target.value }))} /></label>
        <label>
          Type
          <select value={form.documentType} onChange={(e) => setForm((old) => ({ ...old, documentType: e.target.value }))}>
            {['ID Proof','Licence','Certificate','Offer Letter','Contract','Other'].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="is-wide">File URL<input required type="url" value={form.fileUrl} onChange={(e) => setForm((old) => ({ ...old, fileUrl: e.target.value }))} placeholder="https://..." /></label>
        <label>Expiry Date<input type="date" value={form.expiryDate} onChange={(e) => setForm((old) => ({ ...old, expiryDate: e.target.value }))} /></label>
        <label className="is-wide">Notes<textarea rows={3} value={form.notes} onChange={(e) => setForm((old) => ({ ...old, notes: e.target.value }))} /></label>

        <div className="staff-profile-edit-actions is-wide">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="is-primary" disabled={saving}>
            <FilePlus2 size={13} />
            {saving ? 'Adding…' : 'Add Document'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
