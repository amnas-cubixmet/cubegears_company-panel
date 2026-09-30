import React from 'react';
import { Label } from '../ui/Label';

export const FormField = ({ label, required = false, error, helper, success, children, className = '' }) => <div className={`ui-field ${className}`.trim()}>
  {label && <Label required={required}>{label}</Label>}
  {children}
  {(error || success || helper) && <span className={`ui-field__message${error ? ' ui-field__message--error' : success ? ' ui-field__message--success' : ''}`}>{error || success || helper}</span>}
</div>;
