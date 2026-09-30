import React, { useState } from 'react';
import { Download, FileText, Table as TableIcon, X } from 'lucide-react';
import { exportToCsv } from '../../utils/exportCsv';

export const ExportButton = ({ data, columns, filenamePrefix = 'cubegears-attendance' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleExport = (format) => {
    setExporting(true);
    setStatusMsg('Exporting...');
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `${filenamePrefix}-${dateStr}.${format === 'excel' ? 'csv' : 'csv'}`;
      exportToCsv(filename, data, columns);
      setExporting(false);
      setIsOpen(false);
      setStatusMsg('Export completed');
      setTimeout(() => setStatusMsg(''), 2500);
    }, 400);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        disabled={exporting}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: '38px',
          padding: '0 14px',
          borderRadius: '10px',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Download size={14} /> {exporting ? 'Exporting...' : 'Export'}
      </button>

      {/* Toast Feedback */}
      {statusMsg && (
        <span style={{
          position: 'absolute',
          top: '-32px',
          right: 0,
          backgroundColor: 'var(--surface-3)',
          color: 'var(--text-primary)',
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          border: '1px solid var(--border)',
          zIndex: 100
        }}>
          {statusMsg}
        </span>
      )}

      {/* Desktop Dropdown (< 768px uses sheet / >=768px uses dropdown) */}
      {isOpen && (
        <>
          {/* Desktop Dropdown */}
          <div className="desktop-table-view" style={{
            position: 'absolute',
            top: '44px',
            right: 0,
            width: '160px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 999
          }}>
            <button
              onClick={() => handleExport('csv')}
              style={{
                width: '100%',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13px',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <FileText size={14} /> Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              style={{
                width: '100%',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '13px',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <TableIcon size={14} /> Export Excel
            </button>
          </div>

          {/* Mobile Bottom Action Sheet (< 768px) */}
          <div className="mobile-card-view" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              backgroundColor: 'var(--surface)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Export Attendance Data
                </h4>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <button
                onClick={() => handleExport('csv')}
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={16} /> Download CSV File
              </button>

              <button
                onClick={() => handleExport('excel')}
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <TableIcon size={16} /> Download Excel Spreadsheet
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
