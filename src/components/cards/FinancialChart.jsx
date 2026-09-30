import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

export const FinancialChart = ({ data = [] }) => {
  const [activePoint, setActivePoint] = useState(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.billed, d.collected]), 10000);
  const chartHeight = 180;
  const padding = 20;

  return (
    <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Billed Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--success)', borderRadius: '2px' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Collected Cash</span>
        </div>
      </div>

      <div style={{ width: '100%', height: `${chartHeight + 40}px`, position: 'relative', minWidth: 0, overflow: 'hidden' }}>
        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => (
            <line
              key={idx}
              x1="0"
              y1={padding + (chartHeight * ratio)}
              x2="100%"
              y2={padding + (chartHeight * ratio)}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bar Pairs per period */}
          {data.map((item, idx) => {
            const stepPercent = 100 / data.length;
            const groupX = (idx * stepPercent) + (stepPercent / 4);
            const barWidth = 12;

            const billedH = (item.billed / maxVal) * chartHeight;
            const collectedH = (item.collected / maxVal) * chartHeight;

            const billedY = padding + (chartHeight - billedH);
            const collectedY = padding + (chartHeight - collectedH);

            return (
              <g key={idx} onMouseEnter={() => setActivePoint(item)} onTouchStart={() => setActivePoint(item)}>
                {/* Billed Bar */}
                <rect
                  x={`${groupX}%`}
                  y={billedY}
                  width={barWidth}
                  height={billedH}
                  fill="var(--primary)"
                  rx="3"
                />
                {/* Collected Bar */}
                <rect
                  x={`calc(${groupX}% + ${barWidth + 2}px)`}
                  y={collectedY}
                  width={barWidth}
                  height={collectedH}
                  fill="var(--success)"
                  rx="3"
                />
                {/* Period Label */}
                <text
                  x={`calc(${groupX}% + 10px)`}
                  y={chartHeight + padding + 18}
                  fill="var(--text-muted)"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {item.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Touch Active Tooltip */}
        {activePoint && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}>
            <strong>{activePoint.period}:</strong> Billed {formatCurrency(activePoint.billed)} | Collected {formatCurrency(activePoint.collected)}
          </div>
        )}
      </div>
    </div>
  );
};
