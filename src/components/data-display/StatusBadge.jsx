import React from 'react';
import { Badge } from '../ui/Badge';
const statusVariants = { active: 'success', completed: 'success', paid: 'success', delivered: 'success', pending: 'warning', unpaid: 'warning', 'in progress': 'info', booked: 'info', overdue: 'danger', cancelled: 'danger', inactive: 'neutral' };
export const StatusBadge = ({ status, variant, className = '' }) => <Badge variant={variant || statusVariants[String(status).toLowerCase()] || 'neutral'} className={className}>{status}</Badge>;
