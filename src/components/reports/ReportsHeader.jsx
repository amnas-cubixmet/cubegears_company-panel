import React from 'react';
import { Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';

export const ReportsHeader = ({ onRefresh, onCsv, onPrint, loading, canExport }) =>
  <header className="reports-dashboard-header no-print">
    <div>
      <span className="reports-heading-kicker">ANALYTICS / WORKSHOP</span>
      <h1>Business Reports</h1>
      <p>Financial performance, invoice collections, expenses and live stock in one place.</p>
    </div>
    <div className="reports-dashboard-actions">
      <button type="button" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={16}/>{loading ? 'Refreshing…' : 'Refresh'}
      </button>
      <button type="button" onClick={onCsv} disabled={!canExport}
        title="Download filtered invoice records as CSV">
        <FileSpreadsheet size={16}/> Export CSV
      </button>
      <button type="button" onClick={onPrint}>
        <Printer size={16}/> Print
      </button>
      <button type="button" className="is-primary" onClick={onPrint}
        title="Open browser print dialog and choose Save as PDF">
        <Download size={16}/> Save as PDF
      </button>
    </div>
  </header>;
