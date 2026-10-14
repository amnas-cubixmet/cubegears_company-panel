import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  invoiceAmounts, isRealInvoice, buildReportSummary, reportChartBuckets,
  reportFilterOptions, reportPeriodOptions, reportMoney, reportRows,
} from '../src/pages/reports/reportsDashboard.utils.js';

const page = readFileSync(new URL('../src/pages/reports/Reports.jsx',import.meta.url),'utf8');
const chart = readFileSync(new URL('../src/components/reports/ReportCharts.jsx',import.meta.url),'utf8');
const styles = readFileSync(new URL('../src/styles/reports-dashboard-polished.css',import.meta.url),'utf8');
const filters = readFileSync(new URL('../src/components/reports/ReportPeriodFilter.jsx',import.meta.url),'utf8');

const invoice = (date, total, paid, balance, extras = {}) => ({
  kind:'invoice',status:'Finalized',number:'INV-12',
  date,total:String(total),paid:String(paid),balance:String(balance),...extras,
});
const receipt = (date, amount, extras = {}) => ({
  date,amount:String(amount),status:'Completed',...extras,
});
const expense = (date, amount, category='Tools', extras={}) => ({
  date,amount:String(amount),category,status:'Paid',...extras,
});

test('Django persisted invoice total/paid/balance are the source of truth', () => {
  assert.deepEqual(invoiceAmounts(invoice('2026-10-05',1200,700,500)),
    {total:1200,paid:700,balance:500});
  const doc={kind:'invoice',items:[{qty:2,rate:350,discount:0,taxRate:0}],
    taxMode:'none',invoiceType:'regular',paid:'200'};
  assert.deepEqual(invoiceAmounts(doc),{total:700,paid:200,balance:500});
  assert.equal(reportMoney(null),'—');
  assert.equal(reportMoney(12500),'₹12,500.00');
});

test('October 2026 query month resolves exact inclusive date boundaries', () => {
  assert.deepEqual(reportPeriodOptions(2026,10),{
    from:'2026-10-01',to:'2026-10-31',
  });
  assert.deepEqual(reportPeriodOptions(2024,2),{
    from:'2024-02-01',to:'2024-02-29',
  });
  assert.equal(reportPeriodOptions(2026,13),null);
});

test('finance totals exclude drafts/cancelled invoices, pending/refunded payments', () => {
  const result=buildReportSummary({
    from:'2026-10-01',to:'2026-10-31',
    invoices:[
      invoice('2026-10-05',1200,700,500),
      invoice('2026-10-20',250,250,0,{status:'Paid'}),
      invoice('2026-10-08',700,0,700,{status:'Draft'}),
      invoice('2026-10-09',800,0,800,{status:'Cancelled'}),
      invoice('2026-10-10',400,0,400,{kind:'estimate'}),
      invoice('2026-09-30',400,0,400),
    ],
    payments:[
      receipt('2026-10-11',500),
      receipt('2026-10-20',100,{status:'Refunded'}),
      receipt('2026-10-22',100,{status:'Pending'}),
    ],
    expenses:[expense('2026-10-17',200,'Fuel'),expense('2026-10-20',150,'Tools')],
    stock:[{onHand:'12',costPrice:'100',minimumStock:'10',reserved:'2'}],
  });
  assert.deepEqual({
    billed:result.sales, collected:result.collected, expenses:result.expenseTotal,
    net:result.netCash, outstanding:result.outstanding, stock:result.stockValue,
    invoiceCount:result.invoiceRows.length,
  },{billed:1450,collected:500,expenses:350,net:150,outstanding:500,
    stock:1200,invoiceCount:2});
  assert.equal(result.lowStock.length,1);
  assert.equal(result.expenseCategories.length,2);
  assert.equal(isRealInvoice({kind:'estimate',status:'Paid'}),false);
});

test('bar chart records sum to filtered finance source figures',()=>{
  const r=buildReportSummary({
    from:'2026-10-01',to:'2026-10-31',
    invoices:[invoice('2026-10-03',1500,400,1100)],
    payments:[receipt('2026-10-03',300),receipt('2026-10-25',100)],
    expenses:[expense('2026-10-17',200)],
  });
  const buckets=reportChartBuckets(r,'2026-10-01','2026-10-31');
  assert.equal(buckets.length,5);
  assert.equal(buckets.reduce((sum,row)=>sum+row.billed,0),1500);
  assert.equal(buckets.reduce((sum,row)=>sum+row.collected,0),400);
  assert.equal(buckets.reduce((sum,row)=>sum+row.expenses,0),200);
  assert.equal(buckets[0].label,'W1');
});

test('branch and staff select only attributed records, stock snapshot not misrepresented',()=>{
  const input={
    from:'2026-10-01',to:'2026-10-31',
    branch:'Main',staff:'Aslam',
    invoices:[
      invoice('2026-10-03',400,300,100,{branch:'Main',staff:'Aslam'}),
      invoice('2026-10-05',1000,0,1000,{branch:'Branch B',staff:'Aslam'}),
      invoice('2026-10-06',100,0,100,{branch:'Main',staff:'Babu'}),
    ],
    payments:[receipt('2026-10-03',300,{branch:'Main',recordedBy:'Aslam'})],
    stock:[{onHand:100,costPrice:100}],
  };
  const r=buildReportSummary(input);
  assert.equal(r.invoiceRows.length,1);
  assert.equal(r.sales,400);
  assert.equal(r.collected,300);
  assert.equal(r.comparable,false);
  assert.equal(r.stockRows.length,0);
  const opts=reportFilterOptions([input.invoices,input.payments]);
  assert.deepEqual(opts.branches,['Branch B','Main']);
  assert.deepEqual(opts.staff,['Aslam','Babu']);
});

test('failed API sources are represented by unavailable figures, not invented zero',()=>{
  const r=buildReportSummary({
    available:{invoices:false,payments:false,expenses:false,stock:false},
  });
  assert.equal(r.available.invoices,false);
  assert.equal(r.invoiceRows.length,0);
  assert.equal(reportRows({results:[{id:1}]}).length,1);
  assert.match(page,/Promise\.allSettled/);
  assert.match(page,/Missing figures are shown as — instead of ₹0/);
});

test('reports page contains custom period, branch/staff, real charts, tables and print actions',()=>{
  assert.match(page,/useSearchParams/);
  assert.match(page,/params\.get\('month'\)/);
  assert.match(page,/params\.get\('year'\)/);
  assert.match(page,/onBranch=\{\(value\) => modifyParams/);
  assert.match(page,/onStaff=\{\(value\) => modifyParams/);
  assert.match(page,/<ReportPerformanceChart/);
  assert.match(page,/<ReportExpenseCategoryChart/);
  assert.match(page,/window\.print\(\)/);
  assert.match(page,/exportCsv/);
  assert.match(filters,/aria-label="Month"/);
  assert.match(filters,/aria-label="Year"/);
  assert.match(filters,/aria-label="Branch"/);
  assert.match(filters,/aria-label="Staff"/);
  assert.match(chart,/report-performance-bar/);
  assert.match(chart,/report-category-chart-track/);
  assert.match(chart,/aria-pressed=\{selected === index\}/);
  assert.match(styles,/@media\(max-width:600px\)/);
  assert.match(styles,/@media print/);
});
