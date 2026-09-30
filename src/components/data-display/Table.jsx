import React from 'react';

export const Table = ({ columns = [], data = [], renderRow, className = '' }) => (
  <div className={`w-full max-w-full overflow-x-auto rounded-card border border-line bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`.trim()}>
    <table className="w-full min-w-[680px] border-collapse text-left text-[13px] text-content">
      <thead className="bg-surface-2">
        <tr>
          {columns.map((column) => (
            <th key={column.key || column.label} className="whitespace-nowrap border-b border-line px-3.5 py-3 text-[11px] font-bold uppercase tracking-[0.03em] text-muted">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {data.length ? data.map((row, index) => (
          <tr key={row.id || index} className="transition-colors hover:bg-surface-2/70">
            {renderRow ? renderRow(row, index) : columns.map((column) => (
              <td key={column.key} className="px-3.5 py-3 align-middle text-[13px] leading-5 text-secondary">
                {row[column.key]}
              </td>
            ))}
          </tr>
        )) : (
          <tr>
            <td colSpan={Math.max(columns.length, 1)} className="px-4 py-10 text-center text-sm text-muted">
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
