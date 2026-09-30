import React, { useState } from 'react';
import { Upload, File, Trash2 } from 'lucide-react';

export const FileUpload = ({
  label,
  accept = '*',
  onChange,
  className = ''
}) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      onChange?.(selected);
    }
  };

  return (
    <div className={`form-field cubegears-field-group ${className}`} style={{ width: '100%' }}>
      {label && <label className="form-label cubegears-label">{label}</label>}
      {!file ? (
        <label className="file-upload-dropzone">
          <Upload size={22} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Drag & drop document here, or <span style={{ color: 'var(--primary)' }}>Browse Files</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PDF, PNG, JPG up to 10MB</span>
          <input type="file" accept={accept} onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      ) : (
        <div style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <File size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{file.name}</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              onChange?.(null);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
