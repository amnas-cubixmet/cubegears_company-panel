import React from 'react';
import { Button } from '../ui/Button';
export const FormActions = ({ onCancel, onReset, submitLabel = 'Save', loading = false, className = '' }) => <div className={`form-actions ${className}`.trim()}>
  {onReset && <Button type="button" variant="ghost" onClick={onReset}>Reset</Button>}
  {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
  <Button type="submit" loading={loading}>{submitLabel}</Button>
</div>;
