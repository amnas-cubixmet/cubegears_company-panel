import React from 'react';
import { Button } from '../ui/Button';
import { Modal } from './Modal';
export const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm action', description = 'Are you sure you want to continue?', confirmLabel = 'Confirm', danger = true }) => <Modal open={open} onClose={onClose} title={title} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button></>}><p style={{ color: 'var(--text-secondary)', margin: 0 }}>{description}</p></Modal>;
