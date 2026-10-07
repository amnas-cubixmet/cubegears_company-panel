import React from 'react';
import { AlertCircle, Bell, BellRing, Check } from 'lucide-react';
export const NotificationStats=({unread,high,today,total})=>{
 const cards=[['Unread',unread,'needs attention',BellRing,'primary'],['High Priority',high,'important alerts',AlertCircle,'danger'],['Today',today,'created today',Bell,'primary'],['Total',total,'all notifications',Check,'success']];
 return <section className="notifications-dashboard-stats">{cards.map(([label,value,meta,Icon,tone])=><article key={label}><div><span>{label}</span><strong>{value}</strong><small>{meta}</small></div><i className={'is-'+tone}><Icon size={15}/></i></article>)}</section>;
};