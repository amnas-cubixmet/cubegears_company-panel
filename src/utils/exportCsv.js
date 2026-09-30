import React from 'react';

/**
 * Utility function to convert JSON objects to downloadable CSV format.
 * Generates a clean CSV file blob and triggers immediate browser download.
 */
export const exportToCsv = (filename, rows, columns) => {
  if (!rows || !rows.length) {
    console.warn('No data available to export.');
    return;
  }

  // Construct CSV Header Line
  const headerRow = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Construct Data Lines
  const dataRows = rows.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Simple CSV/HTML structured table export for Excel (.csv / .xlsx compatible format).
 */
export const exportToExcel = (filename, rows, columns) => {
  exportToCsv(filename.endsWith('.csv') ? filename : `${filename}.csv`, rows, columns);
};
