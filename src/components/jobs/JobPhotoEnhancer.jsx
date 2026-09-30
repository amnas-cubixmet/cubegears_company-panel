import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PhotoCaptureUpload } from '../common/PhotoCaptureUpload';
import { saasAccountService } from '../../services/saasAccount.service';
import { storageHistoryService } from '../../services/storageHistory.service';

export function JobPhotoEnhancer() {
  const [host, setHost] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const bypassRef = useRef(false);
  const photosRef = useRef([]);

  useEffect(() => { photosRef.current = photos; }, [photos]);

  useEffect(() => {
    const findForm = () => {
      const forms = Array.from(document.querySelectorAll('.responsive-modal-sheet form'));
      const form = forms.find((node) => node.closest('.responsive-modal-sheet')?.textContent?.includes('Create New Workshop Job Card'));
      if (!form) {
        setHost(null);
        return;
      }
      let mount = form.querySelector('[data-job-photo-host]');
      if (!mount) {
        mount = document.createElement('div');
        mount.dataset.jobPhotoHost = 'true';
        mount.className = 'job-photo-portal';
        const footer = form.lastElementChild;
        if (footer) form.insertBefore(mount, footer);
        else form.appendChild(mount);
      }
      setHost(mount);
    };

    findForm();
    const observer = new MutationObserver(findForm);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!host) {
      setPhotos([]);
      return undefined;
    }
    const form = host.closest('form');
    if (!form) return undefined;

    const beforeSubmit = async (event) => {
      if (bypassRef.current || !photosRef.current.length) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      setUploading(true);
      try {
        const files = photosRef.current.map((item) => item.file).filter(Boolean);
        if (files.length) {
          const storage = await saasAccountService.uploadMediaFiles(files, 'Job Card Intake');
          await storageHistoryService.recordTodayStorageSnapshot(storage);
        }
        bypassRef.current = true;
        setPhotos([]);
        requestAnimationFrame(() => {
          form.requestSubmit();
          setTimeout(() => { bypassRef.current = false; }, 0);
        });
      } catch (error) {
        console.error('Job photo upload failed', error);
        window.alert('Photo upload failed. Job card was not created. Please retry.');
      } finally {
        setUploading(false);
      }
    };

    form.addEventListener('submit', beforeSubmit, true);
    return () => form.removeEventListener('submit', beforeSubmit, true);
  }, [host]);

  if (!host) return null;
  return createPortal(
    <div className="job-photo-enhancer">
      <PhotoCaptureUpload
        value={photos}
        onChange={setPhotos}
        maxFiles={12}
        maxFileMb={20}
        category="Job Card"
        label="6. Vehicle Photos"
        helper="Capture vehicle condition or upload existing photos before creating the job card."
      />
      {uploading && <div className="job-photo-uploading">Uploading photos before creating job card…</div>}
    </div>,
    host
  );
}
