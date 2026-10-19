import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';
import {
  subscribeAppDialogs, resolveAppDialog, cancelAppDialog,
} from './appDialogs';
import '../../styles/app-dialogs.css';

export const AppDialogHost = () => {
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const firstControl = useRef(null);
  const previousFocus = useRef(null);
  const container = useRef(null);

  useEffect(() => subscribeAppDialogs(setDialog), []);

  useEffect(() => {
    if (!dialog) return undefined;
    previousFocus.current = document.activeElement;
    setValue(dialog.defaultValue || '');
    setError('');
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus after render so the dialog is accessible on desktop and mobile.
    requestAnimationFrame(() => firstControl.current?.focus());
    return () => {
      document.body.style.overflow = oldOverflow;
      previousFocus.current?.focus?.();
    };
  }, [dialog]);

  if (!dialog) return null;

  const isPrompt = dialog.kind === 'prompt';
  const isAlert = dialog.kind === 'alert';
  const title = dialog.title || (isPrompt ? 'Enter Details' : isAlert ? 'Notification' : 'Confirm Action');
  const confirmLabel = dialog.confirmLabel || (isPrompt ? 'Save' : isAlert ? 'OK' : dialog.tone === 'danger' ? 'Confirm' : 'Continue');
  const Icon = dialog.tone === 'danger' ? AlertCircle : isAlert ? CheckCircle2 : HelpCircle;

  const submit = (event) => {
    event?.preventDefault();
    if (isPrompt) {
      if (dialog.required && !value.trim()) {
        setError('This field is required.');
        return;
      }
      resolveAppDialog(value);
    } else {
      resolveAppDialog(isAlert ? undefined : true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelAppDialog();
    }
    if (event.key === 'Tab') {
      const focusable = [...(container.current?.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled])') || [])];
      if (!focusable.length) return;
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && (index <= 0)) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  };

  return (
    <div className="cg-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) cancelAppDialog();
    }}>
      <section
        ref={container}
        className="cg-dialog-panel"
        role={isPrompt ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby="cg-global-dialog-title"
        aria-describedby="cg-global-dialog-description"
        onKeyDown={handleKeyDown}
      >
        <header className="cg-dialog-header">
          <div className={'cg-dialog-icon is-' + dialog.tone}><Icon size={20} aria-hidden="true" /></div>
          <button type="button" className="cg-dialog-close" aria-label="Close dialog" onClick={cancelAppDialog}>
            <X size={18}/>
          </button>
        </header>
        <form onSubmit={submit}>
          <h2 id="cg-global-dialog-title">{title}</h2>
          <p id="cg-global-dialog-description">{dialog.message}</p>
          {isPrompt && (
            <div className="cg-dialog-input-row">
              <label htmlFor="cg-global-dialog-input">Your response</label>
              <textarea
                id="cg-global-dialog-input"
                ref={firstControl}
                rows={2}
                value={value}
                placeholder={dialog.placeholder}
                onChange={(event) => { setValue(event.target.value); setError(''); }}
              />
              {error && <small role="alert">{error}</small>}
            </div>
          )}
          <div className="cg-dialog-buttons">
            {!isAlert && (
              <button type="button" className="cg-dialog-cancel" ref={!isPrompt ? firstControl : undefined}
                onClick={cancelAppDialog}>{dialog.cancelLabel}</button>
            )}
            <button type="submit" className={'cg-dialog-confirm is-' + dialog.tone}
              ref={isAlert ? firstControl : undefined}>{confirmLabel}</button>
          </div>
        </form>
      </section>
    </div>
  );
};
