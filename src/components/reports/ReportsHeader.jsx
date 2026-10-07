import React from 'react';
import { Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';

export const ReportsHeader=({onRefresh,onCsv,onPrint})=><header className="reports-dashboard-header no-print">
  <div><h1>Business Reports</h1><p>Sales, collections, expenses and stock performance in one place.</p></div>
  <div className="reports-dashboard-actions">
    <button onClick={onRefresh}><RefreshCw size={13}/>Refresh</button>
    <button onClick={onCsv}><FileSpreadsheet size={13}/>CSV</button>
    <button onClick={onPrint}><Printer size={13}/>Print</button>
    <button className="is-primary" onClick={onPrint}><Download size={13}/>PDF</button>
  </div>
</header>;