import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
export const Drawer = ({ open, onClose, title, children, className = '' }) => open ? <div className="ui-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}><aside className={`ui-drawer ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}><header className="ui-modal__header"><h3 className="ui-card__title">{title}</h3><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></header><div className="ui-modal__body">{children}</div></aside></div> : null;
