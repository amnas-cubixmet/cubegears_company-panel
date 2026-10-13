import React from 'react';
import { Activity, BarChart3, PieChart } from 'lucide-react';
import { moneyText } from '../../pages/reports/reportAnalytics';

const palette = {
  sales: '#4169e1',
  collected: '#0b9777',
  expenses: '#e59b46',
};
const compactMoney = (n) => new Intl.NumberFormat('en-IN', { notation: 'compact',
  maximumFractionDigits: 1 }).format(n);
const titles = { sales: 'Billed', collected: 'Collected', expenses: 'Expenses' };

export function ReportBarChart({ series, available }) {
  if (!available) return <ChartEmpty reason="Financial data unavailable. Retry loading reports." />;
  if (!series.length || !series.some((x) => x.sales || x.collected || x.expenses)) {
    return <ChartEmpty reason="No sales, collections or expenses in this period." />;
  }
  const top = Math.max(1, ...series.flatMap((row) => [row.sales, row.collected, row.expenses]));
  const width = Math.max(660, 80 + series.length * 98);
  const height = 282, chartTop = 30, chartHeight = 206, baseY = chartTop + chartHeight;
  const plotLeft = 52, plotRight = width - 18;
  const groupW = (plotRight - plotLeft) / series.length;
  const barWidth = Math.min(18, (groupW - 18) / 3 - 3);
  return (
    <div className="report-chart-scroll" role="group" aria-label="Billing, collections and expenses bar chart">
      <svg viewBox={'0 0 ' + width + ' ' + height}
        width={width} height={height} className="report-bar-svg" role="img"
        aria-label="Billed, collected and expenses by date interval">
        {[0, .25, .5, .75, 1].map((fraction) => {
          const y = baseY - fraction * chartHeight;
          return <g key={fraction}>
            <line x1={plotLeft} y1={y} x2={plotRight} y2={y}
              className="report-chart-gridline"/>
            <text x={plotLeft - 9} y={y + 4} textAnchor="end"
              className="report-chart-axis">{compactMoney(Math.round(top * fraction))}</text>
          </g>;
        })}
        {series.map((row, index) => {
          const x = plotLeft + index * groupW + groupW / 2;
          return <g key={row.from}>
            {['sales', 'collected', 'expenses'].map((key, i) => {
              const value = Math.max(0, row[key]);
              const barH = value / top * chartHeight;
              return <rect key={key}
                x={x - 1.5 * barWidth + i * barWidth + (i - 1) * 4}
                y={baseY - barH} width={barWidth} height={Math.max(0, barH)}
                rx={4} fill={palette[key]}>
                <title>{row.from} – {row.to}: {titles[key]} {moneyText(value)}</title>
              </rect>;
            })}
            <text x={x} y={baseY + 23} className="report-chart-axis" textAnchor="middle">
              {row.label}
            </text>
          </g>;
        })}
      </svg>
    </div>
  );
}

export function ReportCashFlowChart({ series, available }) {
  if (!available) return <ChartEmpty reason="Collections or expense data unavailable." />;
  if (!series.length || !series.some((x) => x.collected || x.expenses)) {
    return <ChartEmpty reason="No cash movement recorded in this period." />;
  }
  const values = series.reduce((acc, row) => {
    acc.push((acc.at(-1) || 0) + row.net);
    return acc;
  }, []);
  const minimum = Math.min(0, ...values), maximum = Math.max(0, ...values);
  const range = Math.max(1, maximum - minimum);
  const w = 670, h = 265, left = 57, right = 636, top = 27, bottom = 220;
  const coords = values.map((value, i) => ({
    x: left + (values.length === 1 ? (right-left)/2 : i*(right-left)/(values.length-1)),
    y: top + (maximum - value)/range*(bottom-top),
    value,
  }));
  const path = coords.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');
  const zeroY = top + (maximum/range)*(bottom-top);
  return <div className="report-chart-scroll">
    <svg viewBox={'0 0 ' + w + ' ' + h} width="100%" className="report-line-svg"
      role="img" aria-label="Running net cash from collections minus expenses">
      <line x1={left} y1={zeroY} x2={right} y2={zeroY} className="report-chart-gridline"/>
      <text x={left - 10} y={top + 8} textAnchor="end"
        className="report-chart-axis">{compactMoney(maximum)}</text>
      <text x={left - 10} y={bottom} textAnchor="end"
        className="report-chart-axis">{compactMoney(minimum)}</text>
      <path d={path} fill="none" className="report-line-path" strokeWidth="3.4"
        strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((p, i) => <g key={series[i].from}>
        <circle cx={p.x} cy={p.y} r="4.6" fill="#4169e1" stroke="white" strokeWidth="1.7">
          <title>{series[i].from} – {series[i].to}: cumulative net cash {moneyText(p.value)}</title>
        </circle>
        {(series.length <= 8 || i % Math.ceil(series.length / 7) === 0 || i === series.length - 1) &&
          <text x={p.x} y={bottom + 24} textAnchor="middle"
            className="report-chart-axis">{series[i].label}</text>}
      </g>)}
    </svg>
  </div>;
}

export function ReportExpenseBreakdown({ categories, available }) {
  if (!available) return <ChartEmpty reason="Expense data unavailable." />;
  if (!categories.length) return <ChartEmpty reason="No expenses in this period." />;
  const total = categories.reduce((sum, r) => sum + r.total, 0);
  if (!(total > 0)) return <ChartEmpty reason="No positive expenses to chart." />;
  const visible = categories.slice(0, 6);
  return <div className="report-category-bars">
    {visible.map((row) => {
      const percent = 100 * row.total / total;
      return <div className="report-category-bar" key={row.category}>
        <div><strong title={row.category}>{row.category}</strong>
          <span>{moneyText(row.total)} <small>({percent.toFixed(1)}%)</small></span></div>
        <div className="report-category-track" role="progressbar"
          aria-label={row.category + ' share of expense'}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
          <div style={{ width: Math.max(.6, percent) + '%' }}/>
        </div>
      </div>;
    })}
    {categories.length > 6 && <p className="report-chart-small-note">
      Showing top 6 of {categories.length} categories.
    </p>}
  </div>;
}

function ChartEmpty({ reason }) {
  return <div className="report-chart-empty">
    <BarChart3 size={27} aria-hidden="true"/>
    <strong>No chart data</strong>
    <span>{reason}</span>
  </div>;
}

export function ReportsCharts({ series, categories, available, tab, from, to }) {
  const showAll = tab === 'overview';
  const showTrend = showAll || tab === 'sales' || tab === 'payments';
  const showExpense = showAll || tab === 'expenses';
  const cashReady = available.payments && available.expenses;
  if (!showTrend && !showExpense) return null;
  return <section className="reports-visuals" aria-label="Reports analytics charts">
    <div className="reports-visuals-head">
      <div>
        <span className="reports-chart-eyebrow">PERFORMANCE ANALYTICS</span>
        <h2>Business performance</h2>
        <p>Actual recorded transactions {from && to ? ' · ' + from + ' to ' + to : ' · selected period'}</p>
      </div>
    </div>
    <div className="reports-charts-grid">
      {showTrend && <article className="report-chart-card report-chart-card--wide">
        <header><div className="report-chart-card-title">
          <BarChart3 size={17}/><div><h3>Billing vs Collections vs Expenses</h3>
            <p>Transaction totals grouped by date</p></div></div></header>
        <div className="report-chart-legend">
          {Object.entries(palette).map(([k, color])=><span key={k}>
            <i style={{ background:color }}/> {titles[k]}</span>)}
        </div>
        <ReportBarChart series={series}
          available={available.invoices && available.payments && available.expenses}/>
      </article>}
      {showTrend && <article className="report-chart-card">
        <header><div className="report-chart-card-title">
          <Activity size={17}/><div><h3>Running Net Cash</h3>
            <p>Collections less expenses · not accounting profit</p></div></div></header>
        <ReportCashFlowChart series={series} available={cashReady}/>
      </article>}
      {showExpense && <article className="report-chart-card">
        <header><div className="report-chart-card-title">
          <PieChart size={17}/><div><h3>Expense Distribution</h3>
            <p>Where workshop spending is recorded</p></div></div></header>
        <ReportExpenseBreakdown categories={categories} available={available.expenses}/>
      </article>}
    </div>
  </section>;
}
