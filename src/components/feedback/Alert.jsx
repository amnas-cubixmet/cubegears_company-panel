import React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
const icons = { success: CheckCircle2, warning: TriangleAlert, info: Info, error: AlertCircle };
export const Alert = ({ variant = 'info', title, children, className = '' }) => { const Icon = icons[variant] || Info; return <div className={`ui-alert ui-alert--${variant} ${className}`.trim()} role={variant === 'error' ? 'alert' : 'status'}><Icon size={18} /><div>{title && <strong style={{ display: 'block', marginBottom: 2 }}>{title}</strong>}{children}</div></div>; };
