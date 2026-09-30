import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2, X } from 'lucide-react';

const makePreview = (file) => ({
  id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
  file,
  name: file.name,
  sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
  url: URL.createObjectURL(file)
});

export function PhotoCaptureUpload({
  value = [],
  onChange,
  maxFiles = 12,
  maxFileMb = 20,
  label = 'Photos',
  helper = 'Upload from device or take a photo using the camera.',
  category = 'General'
}) {
  const [items, setItems] = useState([]);
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const next = (value || []).filter(Boolean).map((item) => {
      if (item.file && item.url) return item;
      if (item instanceof File) return makePreview(item);
      return item;
    });
    setItems(next);
    return () => next.forEach((item) => item?.url?.startsWith('blob:') && URL.revokeObjectURL(item.url));
  }, []);

  const countText = useMemo(() => `${items.length}/${maxFiles}`, [items.length, maxFiles]);

  const emit = (next) => {
    setItems(next);
    onChange?.(next);
  };

  const addFiles = (fileList) => {
    const allowed = Array.from(fileList || []).filter((file) =>
      file.type.startsWith('image/') && file.size <= maxFileMb * 1024 * 1024
    );
    if (!allowed.length) return;
    const available = Math.max(0, maxFiles - items.length);
    const additions = allowed.slice(0, available).map(makePreview);
    emit([...items, ...additions]);
  };

  const remove = (id) => {
    const current = items.find((item) => item.id === id);
    if (current?.url?.startsWith('blob:')) URL.revokeObjectURL(current.url);
    emit(items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    items.forEach((item) => item?.url?.startsWith('blob:') && URL.revokeObjectURL(item.url));
    emit([]);
  };

  return (
    <div className="photo-capture-upload">
      <div className="photo-capture-head">
        <div>
          <strong>{label}</strong>
          <span>{helper}</span>
        </div>
        <span className="photo-capture-count">{countText}</span>
      </div>

      <div className="photo-capture-actions">
        <button type="button" onClick={() => uploadRef.current?.click()} className="photo-action primary">
          <ImagePlus size={17} /> Upload photos
        </button>
        <button type="button" onClick={() => cameraRef.current?.click()} className="photo-action">
          <Camera size={17} /> Take photo
        </button>
        {items.length > 0 && (
          <button type="button" onClick={clearAll} className="photo-action danger subtle">
            <Trash2 size={16} /> Clear
          </button>
        )}
      </div>

      <input
        ref={uploadRef}
        hidden
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
      />
      <input
        ref={cameraRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
      />

      {items.length > 0 && (
        <div className="photo-preview-grid">
          {items.map((item) => (
            <article key={item.id} className="photo-preview-card">
              <img src={item.url} alt={item.name || `${category} photo`} />
              <div className="photo-preview-meta">
                <strong>{item.name || 'Photo'}</strong>
                <span>{item.sizeMb ? `${item.sizeMb} MB` : category}</span>
              </div>
              <button type="button" className="photo-preview-remove" aria-label={`Remove ${item.name || 'photo'}`} onClick={() => remove(item.id)}>
                <X size={15} />
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="photo-capture-note">JPG, PNG, WebP · max {maxFileMb} MB each · up to {maxFiles} photos.</p>
    </div>
  );
}
