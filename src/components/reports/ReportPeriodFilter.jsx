import React from 'react';
import { CalendarDays } from 'lucide-react';

export const ReportPeriodFilter=({from,to,onFrom,onTo,onThisMonth,onAllTime})=><section className="reports-dashboard-filter no-print">
  <label><CalendarDays size={13}/><span>From</span><input type="date" value={from} onChange={e=>onFrom(e.target.value)}/></label>
  <label><span>To</span><input type="date" value={to} onChange={e=>onTo(e.target.value)}/></label>
  <button onClick={onThisMonth}>This Month</button>
  <button onClick={onAllTime}>All Time</button>
</section>;