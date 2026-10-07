import React from 'react';
import { Activity, IndianRupee, Layers3, Wrench } from 'lucide-react';

export const ServiceOverviewStats = ({ metrics, formatMoney }) => {
  const cards=[
    ['Total Services',metrics.total,'configured services',Wrench,'primary'],
    ['Active Services',metrics.active,'available for job cards',Activity,'success'],
    ['Categories',metrics.categories,'service groups',Layers3,'primary'],
    ['Avg Labour Charge',formatMoney(metrics.averagePrice),'average base charge',IndianRupee,'primary'],
  ];
  return (
    <section className="service-dashboard-stats">
      {cards.map(([label,value,meta,Icon,tone])=>(
        <article key={label} className="service-dashboard-stat-card">
          <div className="service-dashboard-stat-top">
            <div><span>{label}</span><strong>{value}</strong></div>
            <i className={'is-'+tone}><Icon size={15}/></i>
          </div>
          <small>{meta}</small>
        </article>
      ))}
    </section>
  );
};