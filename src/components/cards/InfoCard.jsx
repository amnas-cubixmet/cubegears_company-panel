import React from 'react';
import { Card } from './Card';
export const InfoCard = ({ icon: Icon, title, description, children, className = '' }) => <Card className={className}><div className="ui-entity-card">{Icon && <span className="ui-avatar"><Icon size={18} /></span>}<div className="ui-entity-card__body"><div className="ui-entity-card__title">{title}</div><div className="ui-entity-card__meta">{description}</div>{children}</div></div></Card>;
