import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '../ui/Button';
export const EmptyState = ({ title = 'No data yet', description = 'There are no records to display.', actionLabel, onAction, icon: Icon = PackageOpen, className = '' }) => <div className={`ui-empty ${className}`.trim()}><Icon size={34} /><h4>{title}</h4><p>{description}</p>{actionLabel && <Button size="sm" onClick={onAction} style={{ marginTop: 14 }}>{actionLabel}</Button>}</div>;
