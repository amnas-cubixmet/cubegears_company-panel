import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, UploadCloud, X } from 'lucide-react';
import { jobService } from '../../services/job.service';

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

function JobWorkPhoto({ jobId, photo }) {
  const [previewUrl, setPreviewUrl] = useState(photo.url || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!photo.hasUpload) {
      setPreviewUrl(photo.url || '');
      return;
    }
    let active = true;
    let objectUrl = '';
    setPreviewUrl('');
    setError('');
    jobService.getJobWorkPhotoBlob(jobId, photo.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => { if (active) setError('Image unavailable'); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [jobId, photo.id, photo.url, photo.hasUpload]);

  const caption = photo.caption?.trim() || 'Work photo';
  return (
    <figure className="job-update-photo-card">
      <div className="job-update-photo-picture">
        {previewUrl ? (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer"
            aria-label={'Open photo: ' + caption}>
            <img src={previewUrl} alt={caption} loading="lazy" />
          </a>
        ) : (
          <span role="status">{error || 'Loading image…'}</span>
        )}
      </div>
      <figcaption>
        <strong>{caption}</strong>
        <small>{photo.created_at || photo.timestamp
          ? new Date(photo.created_at || photo.timestamp).toLocaleString('en-IN')
          : 'Work update'}</small>
      </figcaption>
    </figure>
  );
}

export function JobWorkPhotoPanel({ jobId, photos = [], onUploaded, disabled = false }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setError('');
    setSuccess('');
    if (!selected) return;
    if (!ALLOWED_IMAGES.includes(selected.type)) {
      setFile(null);
      setError('Choose a JPG, PNG, WebP or GIF image.');
      event.target.value = '';
      return;
    }
    if (!selected.size || selected.size > MAX_SIZE) {
      setFile(null);
      setError('Choose a photo under 5 MB.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file || busy || disabled) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await jobService.uploadJobWorkPhoto(jobId, file, caption.trim());
      setFile(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess('Photo and caption saved.');
      try {
        await onUploaded?.();
      } catch {
        setError('Photo saved, but could not refresh the gallery. Reload to view it.');
      }
    } catch (err) {
      setError(err?.message || 'Could not upload photo. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="job-work-photo-panel" aria-label="Work photos and captions">
      <header className="job-work-photo-header">
        <div>
          <h3><Camera size={17} aria-hidden="true"/> Work Photos</h3>
          <p>Add an image and caption to document the repair.</p>
        </div>
        <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
      </header>

      <form className="job-work-photo-form" onSubmit={upload}>
        <label className="job-work-photo-file-field">
          <span>Choose image</span>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={chooseFile} disabled={busy || disabled} />
        </label>
        <label className="job-work-photo-caption-field">
          <span>Image Caption</span>
          <input type="text" maxLength={255} value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="e.g. Replaced brake pads — before testing"
            disabled={busy || disabled} />
          <small>{caption.length}/255</small>
        </label>
        {preview && (
          <div className="job-work-photo-selected">
            <img src={preview} alt="Selected work photo preview"/>
            <span>{file?.name}</span>
            <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} disabled={busy}
              aria-label="Remove selected image"><X size={16}/></button>
          </div>
        )}
        <div className="job-work-photo-form-footer">
          <span>JPG, PNG, WebP or GIF · Max 5 MB</span>
          <button type="submit" disabled={!file || busy || disabled}>
            {busy ? <UploadCloud size={16} aria-hidden="true"/> : <ImagePlus size={16} aria-hidden="true"/>}
            {busy ? 'Uploading…' : 'Add Photo'}
          </button>
        </div>
        {error && <p role="alert" className="job-work-photo-error">{error}</p>}
        {success && <p role="status" className="job-work-photo-success">{success}</p>}
      </form>

      <div className="job-work-photo-gallery" aria-label="Uploaded work photos">
        {photos.length ? photos.map((photo) => (
          <JobWorkPhoto key={photo.id} jobId={jobId} photo={photo}/>
        )) : (
          <div className="job-work-photo-empty">
            <Camera size={22} aria-hidden="true"/>
            <span>No work photos yet. Add the first image above.</span>
          </div>
        )}
      </div>
    </section>
  );
}
