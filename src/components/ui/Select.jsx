import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from './Label';

export const Select = forwardRef(function Select({ label, options = [], children, error, helper, success, required = false, disabled = false, icon: Icon, containerStyle, className = '', id, ...props }, ref) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const message = error || success || helper;
  return <div className={`flex w-full min-w-0 flex-col gap-1.5 ${className}`.trim()} style={containerStyle}>
    {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
    <div className={`relative flex min-h-11 w-full min-w-0 items-center gap-2 rounded-xl border bg-[var(--field-bg)] px-3 transition focus-within:bg-[var(--field-focus-bg)] focus-within:ring-2 focus-within:ring-primary/15 ${error ? 'border-danger' : success ? 'border-success' : 'border-line focus-within:border-primary'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
      {Icon && <Icon size={17} className="shrink-0 text-muted" aria-hidden="true" />}
      <select ref={ref} id={inputId} className="h-10 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 pr-6 text-[13px] font-medium text-content outline-none" required={required} disabled={disabled} aria-invalid={Boolean(error)} {...props}>
        {children || options.map((option) => { const value = typeof option === 'object' ? option.value : option; const text = typeof option === 'object' ? option.label : option; return <option key={value} value={value}>{text}</option>; })}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 text-muted" />
    </div>
    {message && <span className={`text-[11px] ${error ? 'font-medium text-danger' : success ? 'font-medium text-success' : 'text-muted'}`}>{message}</span>}
  </div>;
});
