import React, { useId, useState } from 'react';
import { File, Trash2, Upload } from 'lucide-react';
import { Label } from './Label';
import { IconButton } from './IconButton';

export const FileUpload = ({ label, helper = 'PDF, PNG or JPG up to 10 MB.', required = false, className = '', id, onChange, accept = '*', multiple = false }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [files, setFiles] = useState([]);
  const handleChange = (event) => {
    const selected = [...event.target.files];
    setFiles(selected);
    onChange?.(multiple ? selected : selected[0] || null, event);
  };

  return <div className={`ui-field ${className}`.trim()}>
    {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
    {files.length === 0 ? (
      <label className="ui-file-upload" htmlFor={inputId}>
        <Upload size={19} />
        <span>Drop file here or <strong>browse files</strong></span>
        <input id={inputId} type="file" accept={accept} multiple={multiple} required={required} onChange={handleChange} />
      </label>
    ) : (
      <div className="ui-file-upload">
        <File size={19} />
        <span style={{ flex: 1, textAlign: 'left' }}>{files.map((file) => file.name).join(', ')}</span>
        <IconButton label="Remove file" onClick={() => { setFiles([]); onChange?.(null); }}><Trash2 size={16} /></IconButton>
      </div>
    )}
    {helper && <span className="ui-field__message">{helper}</span>}
  </div>;
};
