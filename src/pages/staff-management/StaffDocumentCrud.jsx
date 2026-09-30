import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileText, Pencil, Plus, Save, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { staffManagementService } from '../../services/staffManagement.service';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY_FORM = {
  staffId: '',
  name: '',
  type: 'ID Proof',
  uploadedDate: today(),
  uploadedBy: 'Current Admin',
  expiryDate: '',
  status: 'Valid',
  fileName: ''
};

export const StaffDocumentCrud = ({ staff = [] }) => {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [staffFilter, setStaffFilter] = useState('All');

  const load = async () => setDocuments(await staffManagementService.getDocuments());

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, staffId: staff[0]?.id || '' });
    setError('');
    setOpen(true);
  };

  const openEdit = (document) => {
    setEditing(document);
    setForm({
      staffId: document.staffId,
      name: document.name || '',
      type: document.type || 'Document',
      uploadedDate: document.uploadedDate || today(),
      uploadedBy: document.uploadedBy || 'Current Admin',
      expiryDate: document.expiryDate || '',
      status: document.status || 'Valid',
      fileName: document.fileName || ''
    });
    setError('');
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.staffId || !form.name.trim() || saving) return;

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await staffManagementService.updateDocument(editing.staffId, editing.id, form);
      } else {
        await staffManagementService.createDocument(form.staffId, form);
      }

      await load();
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err?.message || 'Unable to save document.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (document) => {
    if (!window.confirm(`Delete "${document.name}" from ${document.staffName}?`)) return;
    try {
      await staffManagementService.deleteDocument(document.staffId, document.id);
      await load();
    } catch (err) {
      window.alert(err?.message || 'Unable to delete document.');
    }
  };

  const filteredDocuments = useMemo(
    () => staffFilter === 'All' ? documents : documents.filter((document) => document.staffId === staffFilter),
    [documents, staffFilter]
  );

  const staffWithDocs = new Set(documents.map((document) => document.staffId)).size;
  const expired = documents.filter((document) => document.status === 'Expired').length;

  return (
    <div className="staff-crud-view">
      <section className="staff-workshop-section-header">
        <div>
          <h2>Staff Documents</h2>
          <p>Create, edit and remove ID proof, licence, certificates, offer letters and contracts.</p>
        </div>
        <button type="button" className="staff-crud-add-button" onClick={openCreate}>
          <Plus size={15}/> Add Document
        </button>
      </section>

      <div className="staff-crud-summary-grid">
        <div><FileText size={16}/><span>Total Documents</span><strong>{documents.length}</strong></div>
        <div><ShieldCheck size={16}/><span>Staff With Docs</span><strong>{staffWithDocs}</strong></div>
        <div><AlertTriangle size={16}/><span>Expired</span><strong>{expired}</strong></div>
      </div>

      <section className="staff-crud-toolbar">
        <label>
          Staff
          <select value={staffFilter} onChange={(e)=>setStaffFilter(e.target.value)}>
            <option value="All">All Staff</option>
            {staff.map((person)=><option key={person.id} value={person.id}>{person.name} · {person.id}</option>)}
          </select>
        </label>
      </section>

      {filteredDocuments.length ? (
        <div className="staff-document-crud-grid">
          {filteredDocuments.map((document) => (
            <article key={`${document.staffId}-${document.id}`} className="staff-document-crud-card">
              <div className="staff-document-crud-card__head">
                <span className="staff-crud-card__icon"><FileText size={17}/></span>
                <div>
                  <h3>{document.name}</h3>
                  <p>{document.staffName} · {document.designation}</p>
                </div>
                <span className={`staff-document-status is-${String(document.status || 'valid').toLowerCase().replaceAll(' ','-')}`}>
                  {document.status || 'Valid'}
                </span>
              </div>

              <div className="staff-crud-detail-grid">
                <div><span>Type</span><strong>{document.type}</strong></div>
                <div><span>Uploaded</span><strong>{document.uploadedDate}</strong></div>
                <div><span>Expiry</span><strong>{document.expiryDate || 'No expiry'}</strong></div>
              </div>

              {document.fileName ? (
                <div className="staff-document-file"><Upload size={13}/>{document.fileName}</div>
              ) : null}

              <div className="staff-crud-actions">
                <button type="button" onClick={()=>openEdit(document)}><Pencil size={13}/> Edit</button>
                <button type="button" className="is-danger" onClick={()=>remove(document)}><Trash2 size={13}/> Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="staff-workshop-empty">No documents found for this filter.</div>
      )}

      <ResponsiveModalSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Staff Document' : 'Add Staff Document'}
        maxWidth="620px"
      >
        <form className="staff-crud-form" onSubmit={submit}>
          {error ? <div className="staff-crud-error">{error}</div> : null}

          <label>
            Staff Member *
            <select
              required
              value={form.staffId}
              disabled={!!editing}
              onChange={(e)=>setForm({...form,staffId:e.target.value})}
            >
              <option value="">Select staff</option>
              {staff.map((person)=><option key={person.id} value={person.id}>{person.name} · {person.id}</option>)}
            </select>
          </label>

          <div className="staff-crud-form__grid">
            <label>
              Document Name *
              <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Aadhaar Card"/>
            </label>
            <label>
              Document Type
              <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
                {['ID Proof','Licence','Certificate','Offer Letter','Contract','Medical','Document'].map((type)=><option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              Uploaded Date
              <input type="date" value={form.uploadedDate} onChange={(e)=>setForm({...form,uploadedDate:e.target.value})}/>
            </label>
            <label>
              Expiry Date
              <input type="date" value={form.expiryDate} onChange={(e)=>setForm({...form,expiryDate:e.target.value})}/>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
                <option>Valid</option>
                <option>Expiring Soon</option>
                <option>Expired</option>
                <option>Archived</option>
              </select>
            </label>
            <label>
              Uploaded By
              <input value={form.uploadedBy} onChange={(e)=>setForm({...form,uploadedBy:e.target.value})}/>
            </label>
          </div>

          <label className="staff-document-upload-field">
            File
            <input
              type="file"
              onChange={(e)=>{
                const file=e.target.files?.[0];
                if(file) setForm((current)=>({...current,fileName:file.name,name:current.name || file.name}));
              }}
            />
            {form.fileName ? <span>{form.fileName}</span> : <small>File selection is stored as mock metadata until backend storage is connected.</small>}
          </label>

          <div className="staff-crud-form__actions">
            <button type="button" className="staff-crud-cancel-button" onClick={()=>setOpen(false)}>Cancel</button>
            <button type="submit" className="staff-crud-save-button" disabled={saving}>
              <Save size={14}/>{saving ? 'Saving...' : editing ? 'Update Document' : 'Add Document'}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>
    </div>
  );
};
