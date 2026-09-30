import React from 'react';
import { Car } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../ui/Badge';
export const VehicleCard = ({ registration, make, model, owner, status = 'Active', className = '' }) => <Card className={className}><div className="ui-entity-card"><span className="ui-avatar"><Car size={18} /></span><div className="ui-entity-card__body"><div className="ui-entity-card__title">{registration}</div><div className="ui-entity-card__meta">{make} {model} · {owner}</div></div><Badge variant="success">{status}</Badge></div></Card>;
