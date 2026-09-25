import React, { forwardRef, useId } from 'react';
import { Label } from './Label';

export const Textarea = forwardRef(function Textarea({ label, error, helper, success, required = false, disabled = false, rows = 3, containerStyle, className = '', id, ...props }, ref) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const message = error || success || helper;
  return <div className={`flex w-full min-w-0 flex-col gap-1.5 ${className}`.trim()} style={containerStyle}>
    {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
    <textarea ref={ref} id={inputId} rows={rows} required={required} disabled={disabled} aria-invalid={Boolean(error)} className={`min-h-24 w-full resize-y rounded-xl border bg-[var(--field-bg)] px-3 py-2.5 text-[13px] font-medium leading-5 text-content outline-none transition placeholder:font-normal placeholder:text-muted focus:bg-[var(--field-focus-bg)] focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-danger' : 'border-line focus:border-primary'}`} {...props} />
    {message && <span className={`text-[11px] ${error ? 'font-medium text-danger' : success ? 'font-medium text-success' : 'text-muted'}`}>{message}</span>}
  </div>;
});
