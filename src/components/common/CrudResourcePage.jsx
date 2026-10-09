import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { showServerFormErrors } from '../../utils/formValidation';

const emptyFromFields = (fields) => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']));

const formatCell = (value, type) => {
  if (type === 'currency') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
  if (type === 'date' && value) return new Date(value).toLocaleDateString('en-IN');
  if (type === 'datetime-local' && value) return new Date(value).toLocaleString('en-IN');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '—');
};

const resolveBasePath = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length ? `/${parts[0]}` : '/';
};

const resolveMode = (pathname, id) => {
  if (pathname.endsWith('/new') || pathname.endsWith('/add')) return 'create';
  if (pathname.endsWith('/edit')) return 'edit';
  if (pathname.endsWith('/delete')) return 'delete';
  if (id) return 'view';
  return 'list';
};

export function CrudResourcePage({ title, subtitle, service, fields, columns, addLabel = 'Add New', searchPlaceholder = 'Search records…', statCards = [], actions = null }) {
  const location = useLocation();
  const formRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id || params.itemId || params.recordId;
  const basePath = resolveBasePath(location.pathname);
  const mode = resolveMode(location.pathname, id);

  const [rows, setRows] = useState([]);
  const [record, setRecord] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => emptyFromFields(fields));

  const loadList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await service.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load data.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecord = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await service.get(id);
      if (!data) {
        setError('Record not found.');
        setRecord(null);
        return;
      }
      setRecord(data);
      setForm(Object.fromEntries(fields.map((field) => [field.name, data[field.name] ?? field.defaultValue ?? ''])));
    } catch (err) {
      setError(err?.message || 'Unable to load record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'list' || mode === 'create') {
      if (mode === 'create') setForm(emptyFromFields(fields));
      loadList();
    } else {
      loadRecord();
    }
  }, [location.pathname, id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(q)));
  }, [rows, query]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      fields.forEach((field) => {
        if (field.type === 'number' || field.type === 'currency') payload[field.name] = Number(payload[field.name] || 0);
        if (field.type === 'checkbox') payload[field.name] = Boolean(payload[field.name]);
      });
      const saved = mode === 'edit' ? await service.update(id, payload) : await service.create(payload);
      navigate(`${basePath}/${saved?.id || id}`, { replace: true });
    } catch (err) {
      showServerFormErrors(formRef.current, err);
      setError(err?.message || 'Unable to save record.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await service.remove(id);
      navigate(basePath, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to delete record.');
      setSaving(false);
    }
  };

  const resolvedStats = statCards.map((stat) => ({ ...stat, value: typeof stat.value === 'function' ? stat.value(rows) : stat.value }));

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="crud-page">
        <div className="crud-heading">
          <div>
            <p className="crud-eyebrow">{mode === 'edit' ? 'EDIT RECORD' : 'CREATE RECORD'}</p>
            <h1>{mode === 'edit' ? `Edit ${title}` : addLabel}</h1>
            <p>{mode === 'edit' ? `Editing ID: ${id}` : subtitle}</p>
          </div>
        </div>
        {error && <div className="crud-error" role="alert">{error}</div>}
        {loading && mode === 'edit' ? <div className="crud-empty">Loading…</div> : (
          <form ref={formRef} className="crud-panel" onSubmit={save}>
            <div className="crud-form-grid" style={{ padding: 20 }}>
              {fields.map((field) => <label className={field.full ? 'crud-field full' : 'crud-field'} key={field.name}>
                <span>{field.label}{field.required ? ' *' : ''}</span>
                {field.type === 'select' ? <select name={field.name} required={field.required} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}><option value="">Select</option>{(field.options || []).map((option) => <option value={typeof option === 'string' ? option : option.value} key={typeof option === 'string' ? option : option.value}>{typeof option === 'string' ? option : option.label}</option>)}</select> : field.type === 'textarea' ? <textarea name={field.name} required={field.required} rows="4" value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} /> : field.type === 'checkbox' ? <input name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })} /> : <input name={field.name} required={field.required} type={field.type === 'currency' ? 'number' : (field.type || 'text')} min={field.min} step={field.step} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />}
              </label>)}
            </div>
            <div className="crud-modal-footer" style={{ padding: 20 }}><button type="button" className="crud-btn" onClick={() => navigate(mode === 'edit' ? `${basePath}/${id}` : basePath)}>Cancel</button><button type="submit" className="crud-btn crud-btn-primary" disabled={saving}>{saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create'}</button></div>
          </form>
        )}
      </div>
    );
  }

  if (mode === 'view' || mode === 'delete') {
    return (
      <div className="crud-page">
        <div className="crud-heading">
          <div>
            <p className="crud-eyebrow">{mode === 'delete' ? 'DELETE RECORD' : 'RECORD DETAILS'}</p>
            <h1>{record?.name || record?.title || record?.invoiceNo || record?.registration || record?.id || title}</h1>
            <p>ID: {id}</p>
          </div>
          {mode === 'view' && record && <div className="crud-heading-actions"><button type="button" className="crud-btn" onClick={() => navigate(`${basePath}/${id}/edit`)}><Edit3 size={16}/> Edit</button><button type="button" className="crud-btn" onClick={() => navigate(`${basePath}/${id}/delete`)}><Trash2 size={16}/> Delete</button></div>}
        </div>
        {error && <div className="crud-error" role="alert">{error}</div>}
        {loading ? <div className="crud-empty">Loading…</div> : record && mode === 'view' ? (
          <div className="crud-panel"><div className="crud-mobile-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', padding: 20, gap: 16 }}>{fields.map((field) => <div key={field.name}><span>{field.label}</span><b>{formatCell(record[field.name], field.type)}</b></div>)}</div></div>
        ) : record && mode === 'delete' ? (
          <div className="crud-panel" style={{ padding: 24 }}><h2>Delete this record?</h2><p>This action will remove <strong>{record.name || record.title || record.id}</strong>. Record ID: <strong>{id}</strong>.</p><div className="crud-heading-actions" style={{ marginTop: 20 }}><button type="button" className="crud-btn" onClick={() => navigate(`${basePath}/${id}`)}>Cancel</button><button type="button" className="crud-btn crud-btn-primary" disabled={saving} onClick={remove}><Trash2 size={16}/>{saving ? 'Deleting…' : 'Delete Record'}</button></div></div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="crud-page">
      <div className="crud-heading">
        <div><p className="crud-eyebrow">CUBIXGEAR</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        <div className="crud-heading-actions">{actions}<button type="button" className="crud-btn crud-btn-primary" onClick={() => navigate(`${basePath}/new`)}><Plus size={17}/>{addLabel}</button></div>
      </div>
      {resolvedStats.length > 0 && <div className="crud-stats">{resolvedStats.map((stat) => <div className="crud-stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div>}
      <div className="crud-toolbar"><label className="crud-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder}/></label><span className="crud-count">{filtered.length} records</span></div>
      {error && <div className="crud-error" role="alert">{error}</div>}
      <div className="crud-panel">
        {loading ? <div className="crud-empty">Loading…</div> : filtered.length === 0 ? <div className="crud-empty">No records found.</div> : <>
          <div className="crud-table-wrap"><table className="crud-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>Actions</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{formatCell(row[column.key], column.type)}</td>)}<td><div className="crud-row-actions"><button type="button" onClick={() => navigate(`${basePath}/${row.id}`)} aria-label="View record"><Eye size={16}/></button><button type="button" onClick={() => navigate(`${basePath}/${row.id}/edit`)} aria-label="Edit record"><Edit3 size={16}/></button><button type="button" className="danger" onClick={() => navigate(`${basePath}/${row.id}/delete`)} aria-label="Delete record"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>
          <div className="crud-mobile-list">{filtered.map((row) => <article className="crud-mobile-card" key={row.id}><div className="crud-mobile-card-head"><strong>{formatCell(row[columns[0]?.key], columns[0]?.type)}</strong><div className="crud-row-actions"><button type="button" onClick={() => navigate(`${basePath}/${row.id}`)} aria-label="View record"><Eye size={16}/></button><button type="button" onClick={() => navigate(`${basePath}/${row.id}/edit`)} aria-label="Edit record"><Edit3 size={16}/></button><button type="button" className="danger" onClick={() => navigate(`${basePath}/${row.id}/delete`)} aria-label="Delete record"><Trash2 size={16}/></button></div></div><div className="crud-mobile-fields">{columns.slice(1).map((column) => <div key={column.key}><span>{column.label}</span><b>{formatCell(row[column.key], column.type)}</b></div>)}</div></article>)}</div>
        </>}
      </div>
    </div>
  );
}
