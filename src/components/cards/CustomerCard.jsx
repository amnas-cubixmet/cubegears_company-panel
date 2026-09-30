import React from 'react';
import { Card } from './Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
export const CustomerCard = ({ name, phone, vehicles = 0, status = 'Active', className = '' }) => <Card className={className}><div className="ui-entity-card"><Avatar name={name} /><div className="ui-entity-card__body"><div className="ui-entity-card__title">{name}</div><div className="ui-entity-card__meta">{phone} · {vehicles} vehicle{vehicles === 1 ? '' : 's'}</div></div><Badge variant="success">{status}</Badge></div></Card>;
