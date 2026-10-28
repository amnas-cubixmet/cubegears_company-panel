import { useEffect, useState } from 'react';
import { Download, FileText, Share2 } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';
import { billingService } from '../../services/billing.service';
import '../../styles/invoice-pdf-share-sheet.css';

/** A native iOS/Android share menu is available only in supported secure browsers.
 * This bottom sheet remains functional everywhere with a local PDF download.
 * We fetch the saved document while the sheet is open so the user's separate
 * tap on "Share PDF" directly invokes navigator.share with user activation.
 */
const canShareFile = (file) => {
  if (!file || typeof navigator.share !== 'function') return false;
  try {
    return typeof navigator.canShare !== 'function' ||
      navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
};

export function InvoicePdfShareSheet({ invoice, onClose, onLoadingChange }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState('');

  const invoiceId = invoice?.id;
  const invoiceName = invoice?.number || invoiceId || 'Invoice';

  useEffect(() => {
    if (!invoiceId) return undefined;
    let active = true;
    setFile(null);
    setError('');
    setNotice('');
    setLoading(true);
    onLoadingChange?.(true);

    billingService.getPdfFile(invoice).then((readyFile) => {
      if (active) setFile(readyFile);
    }).catch((err) => {
      if (active) setError(err?.message || 'Could not prepare the saved PDF.');
    }).finally(() => {
      if (active) {
        setLoading(false);
        onLoadingChange?.(false);
      }
    });

    return () => {
      active = false;
      onLoadingChange?.(false);
    };
  // Only refetch when a different saved invoice is opened or the user retries.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, retry]);

  if (!invoiceId) return null;

  const nativeSupported = canShareFile(file);
  const download = () => {
    try {
      if (!file) return;
      billingService.savePdfFile(file);
      setError('');
      setNotice('PDF download started.');
    } catch (err) {
      setError(err?.message || 'Unable to save the PDF.');
    }
  };
  const share = () => {
    if (!file || !nativeSupported || sharing) return;
    setError('');
    setNotice('');
    setSharing(true);
    try {
      // MUST be called synchronously from the Share button tap. Awaiting
      // a network download before this call loses transient user activation.
      const result = navigator.share({
        files: [file],
        title: invoiceName,
        text: 'Invoice PDF',
      });
      Promise.resolve(result).then(() => {
        setSharing(false);
        onClose();
      }).catch((err) => {
        setSharing(false);
        // Dismissing the OS share sheet is a normal cancellation.
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Sharing is unavailable. You can download the PDF instead.');
        }
      });
    } catch (err) {
      setSharing(false);
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Sharing is unavailable. You can download the PDF instead.');
      }
    }
  };

  return (
    <ResponsiveModalSheet isOpen onClose={onClose} title="Share invoice PDF" maxWidth="460px">
      <div className="invoice-pdf-share-panel">
        <div className="invoice-pdf-share-file">
          <span className="invoice-pdf-share-file-icon"><FileText size={23} aria-hidden="true"/></span>
          <div>
            <strong>{file?.name || invoiceName + '.pdf'}</strong>
            <span>Saved invoice · PDF document</span>
          </div>
        </div>
        {loading && <p role="status" className="invoice-pdf-share-info">Preparing your saved PDF…</p>}
        {error && <div role="alert" className="invoice-pdf-share-error">
          <p>{error}</p>
          {!file && <button type="button" onClick={() => setRetry((n) => n + 1)}>Try again</button>}
        </div>}
        {notice && <p role="status" className="invoice-pdf-share-info">{notice}</p>}
        {!loading && file && !nativeSupported && (
          <p className="invoice-pdf-share-info">
            Native sharing is not available in this browser. Save the PDF to share it from your device.
          </p>
        )}
        <div className="invoice-pdf-share-actions">
          <button type="button" className="invoice-pdf-share-primary"
            onClick={share} disabled={loading || sharing || !nativeSupported}>
            <Share2 size={20} aria-hidden="true"/>
            {sharing ? 'Opening share menu…' : 'Share PDF'}
          </button>
          <button type="button" className="invoice-pdf-share-download"
            onClick={download} disabled={loading || sharing || !file}>
            <Download size={20} aria-hidden="true"/> Download PDF
          </button>
          <button type="button" className="invoice-pdf-share-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </ResponsiveModalSheet>
  );
}
