import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { NewJobModal as LegacyNewJobModal } from './NewJobModalLegacy';
import { PhotoCaptureUpload } from '../common/PhotoCaptureUpload';
import { saasAccountService } from '../../services/saasAccount.service';
import { storageHistoryService } from '../../services/storageHistory.service';

const PHOTO_MAP_KEY = 'cubixgear-job-photo-map';

const saveJobPhotoMap = (jobId, photos) => {
  try {
    const current = JSON.parse(localStorage.getItem(PHOTO_MAP_KEY) || '{}');
    current[jobId] = photos.map((item) => ({
      name: item.name,
      sizeMb: item.sizeMb,
      category: 'Job Card',
      capturedAt: new Date().toISOString()
    }));
    localStorage.setItem(PHOTO_MAP_KEY, JSON.stringify(current));
  } catch {
    // Ignore local mock mapping failures. Real API mode should persist job-media relations server-side.
  }
};

export const NewJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const [photos, setPhotos] = useState([]);
  const [photoPanelOpen, setPhotoPanelOpen] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const handleCreated = async (created) => {
    const files = photos.map((item) => item.file).filter(Boolean);
    if (files.length) {
      setUploadingPhotos(true);
      try {
        const storage = await saasAccountService.uploadMediaFiles(files, 'Job Card');
        await storageHistoryService.recordTodayStorageSnapshot(storage);
        saveJobPhotoMap(created.id, photos);
      } finally {
        setUploadingPhotos(false);
      }
    }
    onJobCreated?.(created);
    setPhotos([]);
  };

  const close = () => {
    setPhotos([]);
    setPhotoPanelOpen(true);
    onClose?.();
  };

  return (
    <>
      <LegacyNewJobModal isOpen={isOpen} onClose={close} onJobCreated={handleCreated} />

      {isOpen && (
        <div className={`job-photo-dock ${photoPanelOpen ? 'open' : 'collapsed'}`}>
          <button
            type="button"
            className="job-photo-dock-toggle"
            onClick={() => setPhotoPanelOpen((value) => !value)}
            aria-expanded={photoPanelOpen}
          >
            <Camera size={17} />
            <span>Job Photos</span>
            {photos.length > 0 && <strong>{photos.length}</strong>}
            {photoPanelOpen && <X size={15} />}
          </button>

          {photoPanelOpen && (
            <div className="job-photo-dock-body">
              <PhotoCaptureUpload
                value={photos}
                onChange={setPhotos}
                label="Vehicle / Job photos"
                helper="Take live photos or upload from the device before creating the job card."
                category="Job Card"
                maxFiles={12}
                maxFileMb={20}
              />
              {uploadingPhotos && <p className="job-photo-uploading">Saving photos…</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
};
