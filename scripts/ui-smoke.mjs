// Browser layout smoke tests use intercepted API fixtures, never a live tenant.
// Run `npx playwright install chromium` once, then `npm run test:ui`.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROLE_PERMISSION_MODULES } from '../src/config/rolePermissions.js';
import { dashboardMock } from '../src/mock/dashboard.mock.js';
import { mockStaffList } from '../src/mock/staff.mock.js';
import { customersMock } from '../src/mock/customers.mock.js';
import { vehiclesMock } from '../src/mock/vehicles.mock.js';
import { jobsMock } from '../src/mock/jobs.mock.js';
import { invoicesMock } from '../src/mock/invoices.mock.js';
import { paymentsMock } from '../src/mock/payments.mock.js';
import { expensesMock } from '../src/mock/expenses.mock.js';

const port = Number(process.env.UI_TEST_PORT || 5184);
const baseURL = `http://127.0.0.1:${port}`;
const artifacts = process.env.UI_ARTIFACT_DIR || join(tmpdir(), 'cubegears-ui-smoke');
mkdirSync(artifacts, { recursive: true });
const permissions = [...new Set([
  ...ROLE_PERMISSION_MODULES.flatMap(module => module.actions.map(action => `${module.key}.${action}`)),
  'billing.view', 'billing.edit', 'company.manage', 'storage.view', 'storage.manage', 'attendance.self',
])];
const user = {id:'owner',name:'Workshop Owner',email:'owner@example.test',companyId:'company-a',
  company:{id:'company-a',name:'Test Workshop'},role:{name:'Owner',permissions:['*']},effectivePermissions:permissions,isCompanyOwner:true};
const settings = Object.fromEntries(['company','operations','billing','inventory','attendance','payroll','notifications','security','integrations'].map(key => [key, {}]));
settings.company = {name:'Test Workshop',country:'India',currency:'INR',timezone:'Asia/Kolkata'};
const bundles = [
  {id:null,key:'customers',name:'Customers',features:[{key:'customers',label:'Customers'}],perUserCredits:'0.00',totalCredits:'0.00',billingType:'monthly',purchaseEnabled:false,purchaseDisabledReason:'MODULE_PRICE_NOT_SET'},
  {id:'jobs',name:'Jobs',features:[{key:'jobs',label:'Jobs'}],perUserCredits:'20.00',totalCredits:'20.00',billingType:'monthly',purchaseEnabled:true},
];
function fixture(path) {
  if(path==='/auth/me') return user;
  if(path==='/billing/documents/gst-context') return {registered:false};
  if(path.startsWith('/billing/documents')) {
    const document={id:'INV-0001',number:'INV-0001',kind:'invoice',invoiceType:'regular',
      status:'Draft',date:'2026-10-19',seller:{name:'Test Workshop'},
      customer:{name:'Rahul Kumar'},vehicle:{registration:'KL10AB1234'},items:[],
      discount:0,adjustment:0,taxMode:'none',paid:0};
    return path==='/billing/documents'?[document]:document;
  }
  if(path==='/payroll/daily-wages') return {
    totalWorkers:1,todayExpense:600,outstanding:600,workersUnpaid:1,totalPayments:0,
    todayAttendance:{full:1,half:0,pending:0},
    employees:[{
      id:'EMP-0012',name:'Ajmal K',employeeCode:'EMP-0012',designation:'Mechanic',
      branchId:'branch-a',branchName:'Main Branch',dailyRate:600,currentBalance:600,
      lastPaymentDate:'2026-10-20',
      today:{finalized:true,attendance:'Full Day',totalWage:600,extraEarnings:0},
    }],
  };
  if(path==='/payroll/daily-wages/history') return [{
    id:'HIST-001',date:'2026-10-28',employeeId:'EMP-0012',
    employeeName:'Ajmal K',branchId:'branch-a',branchName:'Main Branch',
    attendance:'Full Day',dailyRate:600,baseWage:600,extras:0,
    adjustments:0,total:600,paymentStatus:'Unpaid',
  }];
  if(path==='/payroll/daily-wages/payments') return [{
    id:'PAY-001',date:'2026-10-28',employeeId:'EMP-0012',
    employeeName:'Ajmal K',branchId:'branch-a',branchName:'Main Branch',
    amount:300,method:'Cash',reference:'PAY-TEST',reversed:false,
  }];
  if(path.startsWith('/payroll/daily-wages/employees/')) return {
    employee:mockStaffList[0], currentRate:600, currentBalance:600, totalEarned:600, totalPaid:0,
    today:{date:'2026-10-19', finalized:true, attendance:'Full Day', totalWage:600, baseWage:600, extraEarnings:0},
    rates:[],history:[],extras:[],payments:[],audit:[],
  };
  if(path.startsWith('/saas/storage/history/')) return {
    date:'2026-10-19', usedGb:0, fileCount:0, files:[], charge:0, rate:null,
  };
  if(path.startsWith('/attendance-manager/staff-details/')) return {
    staffInfo:{id:'EMP-0012', name:'Ajmal K', designation:'Mechanic', branch:'Main', shift:'General'},
    attendanceSummary:{date:'2026-10-19', status:'Present', workedHours:'8h', lateMinutes:0, earlyExitMinutes:0},
    sessions:[], correctionInfo:null, leaveInfo:null, auditHistory:[],
  };
  if(path==='/e-way-bills') return [];
  if(path==='/e-way-bills/from-context') return { from: {
    gstin:'32ABCDE1234F1Z5', tradeName:'Test Workshop',address:'Main Road',
    place:'Thrissur',pincode:'680001',stateCode:'32',
  },branchId:'BR-01' };
  if(path==='/e-way-bills/from-context') return {
    from:{gstin:'32ABCDE1234F1Z5',tradeName:'Test Workshop',address:'Workshop Lane',
      place:'Thrissur',pincode:'680001',stateCode:'32'},branchId:'BR-01',
  };
  if(path.startsWith('/e-way-bills/')) return {id:'EWB-001',status:'Draft',supplyType:'Outward',subSupplyType:'Supply',transactionType:'Regular',documentType:'Tax Invoice',documentNo:'INV-0001',documentDate:'2026-10-19',from:{tradeName:'Test Workshop',stateCode:'32'},to:{tradeName:'Test Customer',stateCode:'32'},items:[],transport:{mode:'Road',distanceKm:'10',vehicleNo:'KL10AB1234'}};
  if(path==='/employees') return mockStaffList.map(row => ({...row, photo:''}));
  const records = {employees:mockStaffList, customers:customersMock, vehicles:vehiclesMock,
    jobs:jobsMock, invoices:invoicesMock, payments:paymentsMock, expenses:expensesMock};
  const [,resource,id,subresource] = path.split('/');
  if(records[resource] && !subresource) {
    if(!id) return records[resource];
    const row=records[resource].find(row=>row.id===id);
    if(row) return {...row, photo:'', ...(resource==='invoices'?{items:[],invoiceType:'non-gst'}:{})};
  }
  if(path==='/saas/credits/access') return {companyId:'company-a',permissions,enabledModules:permissions.map(code=>code.split('.')[0]),freeModules:['dashboard','staff','settings','roles','billing'],enforcementEnabled:true,isCompanyOwner:true,canManageFeatures:true};
  if(path==='/dashboard') return structuredClone(dashboardMock);
  if(path==='/settings') return settings;
  if(path.startsWith('/settings/')) return settings[path.split('/').pop()] || {};
  if(path==='/company/me') return user.company;
  if(path==='/saas/credits/overview') return {balance:'516500.00',canManage:true,checkoutAvailable:false};
  if(path==='/saas/credits/bundles') return bundles;
  if(path==='/saas/credits/billing-cycle') return {enabled:false};
  if(path==='/saas/credits/account') return {company:user.company,users:[]};
  if(path==='/saas/billing') return {plan:null,usage:{seatsUsed:0},users:[],invoices:[]};
  if(path==='/saas/storage') return {usedGb:0,files:[],settings:{allowedTypes:['image/png'],maxFileMb:10,retentionDays:0},billing:{creditsPerGb:'10',includedGb:'0',period:'monthly',active:true}};
  if(path==='/saas/storage/events') return {count:0,results:[]};
  if(path==='/attendance-manager/approvals') return [{
    id:'LEAVE-TEST-1',type:'Leave Request',status:'Pending',staffName:'Belle Trujillo',
    staffId:'EMP-0001',startDate:'2026-10-30',endDate:'2026-10-30',
    totalDays:1,reason:'Personal leave request',halfDay:false,canReview:true,
  },{
    id:'LEAVE-SELF-TEST',type:'Leave Request',status:'Pending',staffName:'Logged In Owner',
    staffId:'EMP-0002',startDate:'2026-10-30',endDate:'2026-10-30',
    totalDays:1,reason:'Own leave request',halfDay:false,canReview:false,
    reviewBlockReason:'Your own request must be reviewed by another authorized manager.',
  }];
  if(path==='/attendance/status') return {status:'CLOCKED_OUT',workedHours:'0h'};
  return [];
}
const source = readFileSync(new URL('../src/routes/AppRoutes.jsx', import.meta.url),'utf8');
const sampleIds={staffId:'EMP-0012', complaintId:'CMP-01', ewbId:'EWB-001', date:'2026-10-19'};
const templates=[...source.matchAll(/<Route path="([^"]+)"/g)].map(([,path])=>path);
const paths=[...new Set(templates.map(path=>path.replace(/:([A-Za-z]+)/g,(_,key)=>{
  if(sampleIds[key])return sampleIds[key];
  if(path.startsWith('/staff/'))return 'EMP-0012';
  return ({customers:'CUS-0001',vehicles:'VEH-0001',jobs:'JOB-00251',invoices:'INV-0001',
    payments:'PAY-0001',expenses:'EXP-0001',services:'SVC-001',reports:'REP-001',notifications:'NOT-001'})[path.split('/')[1]] || 'fixture-id';
}).replace('*','fixture-unknown')))].filter(path=>!process.env.UI_PATH_FILTER||path.includes(process.env.UI_PATH_FILTER));
const profiles = process.env.UI_QUICK ? [{width:390,height:844,theme:'light'}] : [
  {width:320,height:720,theme:'dark'}, {width:375,height:812,theme:'light'},
  {width:390,height:844,theme:'dark'}, {width:430,height:932,theme:'light'},
  {width:768,height:1024,theme:'dark'}, {width:1024,height:768,theme:'light'},
  {width:1440,height:1000,theme:'dark'}, {width:1920,height:1080,theme:'light'},
];
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js',...(process.env.UI_PRODUCTION ? ['preview'] : []),'--host','127.0.0.1','--port',String(port),'--strictPort'],{
  cwd:new URL('..',import.meta.url),env:{...process.env,VITE_API_URL:'http://127.0.0.1:8000/api/v1'},stdio:['ignore','pipe','pipe'],
});
// A Vite production preview can be ready without printing "Local:" on stdout.
const startupErrors = [];
server.stderr.on('data', data => startupErrors.push(data.toString()));
const waitForServer = async () => {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw Error(`Vite exited (${server.exitCode}): ${startupErrors.join('').slice(-2000)}`);
    }
    try {
      const response = await fetch(baseURL, { signal: AbortSignal.timeout(2500) });
      if (response.ok) return;
    } catch { /* The preview server is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  throw Error(`Vite preview never served HTTP after 60s: ${startupErrors.join('').slice(-2000)}`);
};

let browser;
try {
  await waitForServer();
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--use-gl=disabled']}: {})});
  const failures=[];
  let tested=0;
  await Promise.all(profiles.map(async (profile) => {
    const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},colorScheme:profile.theme==='dark'?'dark':'light'});
    await context.addInitScript(({user,theme})=>{
      localStorage.setItem('auth_token','fixture-token');localStorage.setItem('auth_user',JSON.stringify(user));
      if(!localStorage.getItem('cubegears-theme'))localStorage.setItem('cubegears-theme',theme);
    },{user,theme:profile.theme});
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      return url.origin===baseURL||url.pathname.startsWith('/api/v1/')?route.continue():route.abort();
    });
    await context.route('**/api/v1/**',async route=>{
      if(!['GET','HEAD'].includes(route.request().method())) {
        await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'Smoke tests do not write tenant data.'})});return;
      }
      const path=new URL(route.request().url()).pathname.replace('/api/v1','').replace(/\/$/,'');
      if (/^\/(?:billing\/documents|e-way-bills)\/[^/]+\/pdf$/.test(path)) {
        await route.fulfill({status:200,contentType:'application/pdf',body:'%PDF-1.4\n% UI fixture\n%%EOF'});
        return;
      }
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture(path))});
    });
    const page=await context.newPage();const errors=[];
    page.setDefaultTimeout(5000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error'&&message.text().includes('React render error'))errors.push(message.text());});
    let firstNavigation=true;
    for(const path of paths) {
      console.log(`Checking ${profile.width}px ${path}`);
      errors.length=0;
      try {
        if(firstNavigation) {
          await page.goto(baseURL+path,{waitUntil:'networkidle',timeout:15000});
          firstNavigation=false;
        } else {
          await page.evaluate(path=>{
            window.history.pushState({},'',path);
            window.dispatchEvent(new PopStateEvent('popstate'));
          },path);
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
          await page.waitForLoadState('networkidle');
        }
        await page.locator('.route-loading').waitFor({state:'hidden',timeout:15000});
        await page.waitForFunction(()=>document.body.innerText.length>=20);
        if(path==='/plans' || path==='/signup') {
          const expected=path==='/plans'?'/account/credits/buy':'/login';
          if(new URL(page.url()).pathname!==expected) throw Error('Redirect did not reach '+expected);
          if(new URL(page.url()).searchParams.has('month')) throw Error('Payroll filters leaked into unrelated route');
        }
        const text=await page.locator('body').innerText();
        if(text.length<20)throw Error('Blank page');
        if(errors.length)throw Error(errors.join('; '));
        if(path!='/access-denied' && page.url().includes('/access-denied'))throw Error('Authorized fixture denied');
        const overflow=await page.evaluate(()=>{
          const nodes=[document.documentElement,...document.querySelectorAll('.app-content,.login-shell')];
          return nodes.filter(node=>node.clientWidth>0&&node.scrollWidth>node.clientWidth+2).map(node=>node.className||node.tagName);
        });
        if(overflow.length)throw Error('Horizontal page overflow: '+overflow.join(', '));
        if(profile.width < 768) {
          const undersized = await page.locator('.ui-icon-button').evaluateAll(nodes => nodes
            .filter(node => node.getClientRects().length)
            .filter(node => { const rect=node.getBoundingClientRect(); return rect.width < 44 || rect.height < 44; })
            .map(node => node.getAttribute('aria-label') || 'Unlabelled icon action'));
          if(undersized.length) throw Error('Small touch controls: '+undersized.join(', '));
        }
        if(['/login','/settings','/staff-management/add','/customers/new','/vehicles/new'].includes(path)){
          const sizes=await page.locator('input:not([type=checkbox]):not([type=radio]):not([type=hidden]),textarea,select').evaluateAll(nodes=>nodes.filter(e=>e.getClientRects().length).map(e=>parseFloat(getComputedStyle(e).fontSize)));
          if(sizes.some(size=>size<16))throw Error('Form control text below 16px: '+sizes.join(','));
        }
        if(path==='/login'){
          // Regression for double red outline: the outer div owns the border,
          // even when both nested inputs are aria-invalid and focused.
          await page.locator('.login-input-shell').first().waitFor();
          await page.locator('.login-submit').click();
          await page.waitForFunction(()=>document.querySelectorAll('.login-input-shell.is-error').length===2);
          const styles=await page.locator('.login-input-shell').evaluateAll(nodes=>nodes.map(shell=>{
            const wrapper=getComputedStyle(shell);
            const input=getComputedStyle(shell.querySelector('input.login-input'));
            return {
              shellBorder:parseFloat(wrapper.borderTopWidth),
              innerBorder:parseFloat(input.borderTopWidth),
              innerOutline:input.outlineStyle,
              innerShadow:input.boxShadow,
              shellColor:wrapper.borderTopColor,
            };
          }));
          if(styles.length!==2 || styles.some(s=>s.shellBorder!==1 ||
            s.innerBorder!==0 || s.innerOutline!=='none' || s.innerShadow!=='none')) {
            throw Error('Login email/password has a second inner border/outline: '+JSON.stringify(styles));
          }
        }

        if(profile.width < 1024) {
          const wallet=page.locator('.mobile-header-actions > .cg-credit-chip');
          if(await wallet.count()) {
            const broken=await wallet.evaluate(node=>{
              const icon=node.querySelector('svg').getBoundingClientRect();
              const value=node.querySelector('.cg-credit-chip-mobile').getBoundingClientRect();
              return node.scrollWidth > node.clientWidth + 1 || Math.abs((icon.top+icon.height/2)-(value.top+value.height/2)) > 8;
            });
            if(broken) throw Error('Wallet balance wraps or overflows');
          }
        }
        if(path==='/invoices/INV-0001' && profile.width<=430) {
          await page.getByRole('button',{name:'Download Invoice PDF'}).click();
          const sheet=page.getByRole('dialog',{name:'Share invoice PDF'});
          await sheet.waitFor();
          await sheet.getByRole('button',{name:'Download PDF'}).waitFor({state:'visible'});
          await page.waitForFunction(()=>{
            const download=document.querySelector('.invoice-pdf-share-download');
            return download && !download.disabled;
          });
          const position=await sheet.evaluate(node=>{
            const rect=node.querySelector('.responsive-modal-sheet')?.getBoundingClientRect();
            return {bottom:rect?.bottom,viewport:window.innerHeight};
          });
          if(Math.abs(position.viewport-position.bottom)>2) {
            throw Error('Invoice PDF bottom sheet does not align to phone bottom: '+JSON.stringify(position));
          }
          await sheet.getByRole('button',{name:'Cancel'}).click();
          await sheet.waitFor({state:'hidden'});
        }

        if(path==='/invoices/e-way-bills/EWB-001' && profile.width===390) {
          const open = page.getByRole('button',{name:'Download PDF'}).first();
          await open.click();
          const modal = page.getByRole('dialog',{name:'Share E-Way Bill PDF'});
          await modal.waitFor();
          const download = modal.getByRole('button',{name:'Download PDF'});
          await page.waitForFunction(() =>
            !!document.querySelector('.invoice-pdf-share-download:not(:disabled)'));
          if(await download.isDisabled()) throw Error('Saved E-Way PDF did not become downloadable.');
          const bounds=await modal.evaluate(node=>{
            const sheet=node.querySelector('.responsive-modal-sheet')?.getBoundingClientRect();
            return {bottom:sheet?.bottom,viewport:innerHeight};
          });
          if(Math.abs(bounds.bottom-bounds.viewport)>3){
            throw Error('E-Way PDF share sheet not attached to phone bottom: '+JSON.stringify(bounds));
          }
          await modal.getByRole('button',{name:'Cancel'}).click();
          await modal.waitFor({state:'hidden'});
        }

        if(path==='/invoices/e-way-bills/new' && profile.width===390) {
          const to=page.locator('section').filter({has:page.getByText('SECTION 2 · TO',{exact:true})});
          const toGstin=to.getByPlaceholder('GSTIN / URP');
          const toState=to.getByRole('combobox',{name:'TO State Code'});
          const taxRate=page.getByRole('combobox',{name:'GST rate'}).first();
          await taxRate.waitFor();
          if(await taxRate.isDisabled()) throw Error('GST rate must be selectable before TO state.');
          await page.locator('.eway-goods-fields').getByPlaceholder('0.00').first().fill('100');
          await taxRate.selectOption('igst:18');
          if(await taxRate.inputValue()!=='igst:18') throw Error('IGST 18% choice was lost before state selection.');
          await toGstin.fill('33ABCDE1234F1Z5');
          if(await toState.inputValue()!=='33' || !(await toState.isDisabled())) {
            throw Error('TO State Code was not auto-filled and locked from Tamil Nadu GSTIN.');
          }
          await page.waitForFunction(() => [...document.querySelectorAll('.eway-goods-totals > div')]
            .some(node => node.innerText.includes('IGST') && node.innerText.includes('₹18.00')));
          await toGstin.fill('URP');
          if(await toState.isDisabled()) throw Error('URP recipient must allow manual State selection.');
          await toState.selectOption('32');
          // After crossing back to the supplier state the legal tax is CGST + SGST.
          await taxRate.selectOption('cgst:9');
          await page.waitForFunction(() => {
            const rows = [...document.querySelectorAll('.eway-goods-totals > div')];
            return rows.some(node => node.innerText.includes('CGST') && node.innerText.includes('₹9.00')) &&
              rows.some(node => node.innerText.includes('SGST') && node.innerText.includes('₹9.00'));
          });
          if(await taxRate.inputValue()!=='cgst:9') throw Error('CGST 9% was not selected for intra-state supply.');
        }

        if(path==='/invoices/e-way-bills/new' && profile.width===390) {
          await page.locator('[data-eway-field="from.gstin"]').waitFor();
          await page.waitForFunction(() => document.querySelector('[data-eway-field="from.gstin"]')?.value === '32ABCDE1234F1Z5');
          await page.getByRole('button',{name:'Prepare for API'}).click();
          const invalid=page.locator('[data-eway-field="documentNo"]');
          await page.waitForFunction(() => document.activeElement?.getAttribute('data-eway-field') === 'documentNo');
          if(await invalid.getAttribute('aria-invalid')!=='true'){
            throw Error('E-Way Bill should highlight first missing field');
          }
          await invalid.fill('INV-TEST-001');
          if(await invalid.getAttribute('aria-invalid')==='true'){
            throw Error('E-Way Bill error did not clear after correcting input');
          }
          if(await page.locator('.eway-gst-explanation,.eway-gst-breakdown').count()){
            throw Error('Removed GST explanation still rendered');
          }
        }

        if(path==='/dashboard') {
          const dimensions = await page.evaluate(() => {
            const top = document.querySelector('.dashboard-top-actions');
            const stats = document.querySelector('.dashboard-stats');
            const quick = document.querySelector('.dashboard-top-actions .quick-actions button');
            const finance = document.querySelector('.finance-list > div');
            const staff = document.querySelector('.staff-copy strong');
            const progress = document.querySelector('.overall-progress [role="progressbar"]');
            const width = document.documentElement.scrollWidth;
            const size = node => node ? parseFloat(getComputedStyle(node).fontSize) : null;
            return {
              topY: top?.getBoundingClientRect().top,
              statsY: stats?.getBoundingClientRect().top,
              quickFont: size(quick), financeFont: size(finance),
              staffFont: size(staff), progressWidth: progress?.getAttribute('aria-valuenow'),
              contentWidth: width,
            };
          });
          if(!(dimensions.topY < dimensions.statsY)){
            throw Error('Quick Actions does not appear above stats: '+JSON.stringify(dimensions));
          }
          for(const name of ['quickFont','financeFont','staffFont']){
            if(dimensions[name] != null && dimensions[name]<14){
              throw Error('Unreadable Dashboard '+name+': '+JSON.stringify(dimensions));
            }
          }
          if(dimensions.contentWidth>profile.width+2){
            throw Error('Dashboard overflows viewport: '+JSON.stringify(dimensions));
          }
          if(dimensions.progressWidth==='70'){
            throw Error('Overall Job Progress is still hardcoded to 70%');
          }
        }

        if(path==='/my-attendance/calendar') {
          const punch = page.locator('.attendance-punch-card');
          await punch.waitFor();
          const measured = await punch.evaluate(node => {
            const status = node.querySelector('.attendance-punch-status strong');
            const note = node.querySelector('.attendance-punch-note span');
            return {
              statusFont: status ? parseFloat(getComputedStyle(status).fontSize) : null,
              noteFont: note ? parseFloat(getComputedStyle(note).fontSize) : null,
              width: node.getBoundingClientRect().width,
            };
          });
          if (measured.statusFont != null && measured.statusFont < 16) {
            throw Error('My Attendance status too small: ' + JSON.stringify(measured));
          }
          if (measured.noteFont != null && measured.noteFont < 14) {
            throw Error('My Attendance completion note too small: ' + JSON.stringify(measured));
          }
          if (measured.width > profile.width + 2) {
            throw Error('My Attendance punch card overflows viewport: ' + JSON.stringify(measured));
          }
        }
        if(path==='/my-attendance/leave' && (profile.width === 390 || profile.width === 1440)) {
          await page.getByRole('button', { name: 'Apply Leave' }).click();
          const dialog = page.getByRole('dialog', { name: 'Apply for Leave' });
          await dialog.waitFor();
          const date = dialog.locator('input[type="date"]');
          const expected = await page.evaluate(() => {
            const d = new Date();
            return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'),
              String(d.getDate()).padStart(2,'0')].join('-');
          });
          if(await date.inputValue() !== expected) {
            throw Error('Leave Date not auto-filled to local today.');
          }
          const font = await date.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
          if(font < 16) throw Error('Leave Date input font below 16px: '+font);
          if(await dialog.getByText('All leave is unpaid.').count()) {
            throw Error('Old unpaid wage explanation still shown.');
          }
          await date.fill('2026-11-04');
          await dialog.getByRole('button', { name: 'Cancel' }).click();
          await dialog.waitFor({ state: 'hidden' });
          await page.getByRole('button', { name: 'Apply Leave' }).click();
          await date.waitFor();
          if(await date.inputValue() !== expected) {
            throw Error('Leave Date did not reset to today on reopening.');
          }
          await dialog.getByRole('button', { name: 'Cancel' }).click();
        }

        if(path==='/attendance-manager/leave-requests') {
          const blockedCard = page.locator('.am-approval-card').filter({hasText:'Logged In Owner'});
          await blockedCard.waitFor();
          await blockedCard.getByText('Your own request must be reviewed by another authorized manager.').waitFor();
          if(await blockedCard.getByRole('button',{name:'Approve'}).count()!==0) {
            throw Error('Own leave request still displays Approve action.');
          }
          if(await blockedCard.getByRole('button',{name:'Reject'}).count()!==0) {
            throw Error('Own leave request still displays Reject action.');
          }
          const other = page.locator('.am-approval-card').filter({hasText:'Belle Trujillo'});
          if(await other.getByRole('button',{name:'Approve'}).count()!==1) {
            throw Error('Another employee leave request lost approval action.');
          }
        }

        if(path.startsWith('/attendance-manager/') && [
          'overview','daily','calendar','leave-requests','shifts','reports','rules'
        ].includes(path.split('/')[2])) {
          const metrics = await page.evaluate(() => {
            const root = document.querySelector('.cg-attendance-manager');
            if (!root) return { missing: true };
            const font = selector => {
              const element = root.querySelector(selector);
              return element ? parseFloat(getComputedStyle(element).fontSize) : null;
            };
            const size = selector => {
              const element = root.querySelector(selector);
              return element ? Math.round(element.getBoundingClientRect().height) : null;
            };
            return {
              tab: font('.attendance-manager-dashboard-tabs button'),
              dailyWages: font('.attendance-manager-header-actions .dw-button'),
              rulesBadge: font('.attendance-manager-header-badge'),
              header: font('.am-section-header h2,.am-calendar-header h2,.am-daily-heading h2,.attendance-rules-header h2'),
              label: font('.am-approval-details strong,.am-table-card td,.am-dashboard-stat-top span,.am-shift-list strong,.am-report-filter label > span,.attendance-mode-copy .am-mode-description'),
              leaveButton: font('.am-approval-actions > button'),
              leaveButtonHeight: size('.am-approval-actions > button'),
              field: font('.am-daily-date input,.am-calendar-month-controls select,.am-shift-form input,.am-report-filter select,.attendance-rule-field input'),
              mainWidth: document.documentElement.scrollWidth,
              viewport: window.innerWidth,
            };
          });
          if(metrics.missing) throw Error('Attendance Manager route missing shared layout: '+path);
          for (const field of ['tab','dailyWages','rulesBadge','label','leaveButton']) {
            if(metrics[field]!==null && metrics[field]<13.5) {
              throw Error('Unreadable Attendance Manager '+field+' on '+path+': '+JSON.stringify(metrics));
            }
          }
          if(metrics.header!==null && metrics.header<16.5) {
            throw Error('Attendance Manager heading below readable minimum on '+path+': '+JSON.stringify(metrics));
          }
          if(metrics.field!==null && metrics.field<15.5) {
            throw Error('Attendance Manager form field below 16px on '+path+': '+JSON.stringify(metrics));
          }
          if(metrics.leaveButtonHeight!==null && metrics.leaveButtonHeight<44) {
            throw Error('Leave approval button below 44px: '+JSON.stringify(metrics));
          }
          if(metrics.mainWidth>metrics.viewport+2) {
            throw Error('Attendance Manager horizontal page overflow on '+path+': '+JSON.stringify(metrics));
          }
        }

        if ([
          '/staff-management/overview',
          '/staff-management/staff',
          '/staff-management/roles',
          '/staff-management/teams',
          '/staff-management/shifts',
        ].includes(path)) {
          const measured = await page.evaluate(() => {
            const root = document.querySelector('.cg-staff-management');
            const font = selector => {
              const element = root?.querySelector(selector);
              return element ? parseFloat(getComputedStyle(element).fontSize) : null;
            };
            const height = selector => {
              const element = root?.querySelector(selector);
              return element ? element.getBoundingClientRect().height : null;
            };
            return {
              tabs: font('.staff-dashboard-tab span'),
              heading: font('.staff-overview-page-heading h1,.staff-dashboard-header h1'),
              label: font('.staff-simple-metrics span,.staff-directory-details span,.roles-dashboard-card-meta span,.staff-team-card__meta,.staff-crud-detail-grid strong'),
              person: font('.staff-simple-person-details strong,.staff-directory-person strong,.roles-dashboard-card-title strong,.staff-team-card__head h3,.staff-crud-card__head h3'),
              button: font('.staff-simple-toolbar-actions button,.staff-add-button,.roles-primary-button,.staff-team-assign-button,.staff-crud-actions button'),
              touch: height('.staff-simple-toolbar-actions button,.staff-add-button,.roles-primary-button,.staff-team-assign-button,.staff-crud-actions button'),
              input: font('.staff-simple-search input,.staff-directory-search input,.roles-dashboard input'),
              overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
            };
          });
          for (const [key, min] of Object.entries({tabs:13.5,heading:22,label:13.5,person:14.5,button:13.5,input:15.5})) {
            if (measured[key] !== null && measured[key] < min) {
              throw Error('Staff Management unreadable '+key+' on '+path+': '+JSON.stringify(measured));
            }
          }
          if(measured.touch!==null && measured.touch < 43.5) {
            throw Error('Staff Management small touch target on '+path+': '+JSON.stringify(measured));
          }
          if(measured.overflow) {
            throw Error('Staff Management horizontal page overflow on '+path+': '+JSON.stringify(measured));
          }
        }

        if(path==='/staff-management/staff') {
          const card=page.locator('.staff-directory-card').first();
          await card.waitFor();
          const stats=await card.evaluate(node => {
            const facts=[...node.querySelectorAll('.staff-directory-fact')];
            const actions=[...node.querySelectorAll('.staff-directory-card__actions button')];
            const sizes=actions.map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}));
            const rect=node.getBoundingClientRect();
            const minFont=Math.min(...facts.flatMap(f=>[
              ...f.querySelectorAll('.staff-directory-fact__copy > span')
            ]).map(el=>parseFloat(getComputedStyle(el).fontSize)));
            const clipped=facts.some(f=>f.scrollWidth>f.clientWidth+2);
            return {font:minFont,actions:sizes,clipped,
              cardWidth:rect.width,viewport:innerWidth,
              pageOverflow:document.documentElement.scrollWidth>innerWidth+2,
              detailColumns:getComputedStyle(node.querySelector('.staff-directory-details')).gridTemplateColumns,
            };
          });
          if(stats.font<13.5 || stats.clipped || stats.pageOverflow) {
            throw Error('Staff Directory card text unreadable or clipped: '+JSON.stringify(stats));
          }
          if(stats.actions.some(b=>b.h<43.5 || b.w<43.5)) {
            throw Error('Staff Directory card touch button below 44px: '+JSON.stringify(stats));
          }
          if(stats.cardWidth<305 && stats.detailColumns.split(' ').length!==1) {
            throw Error('Narrow Staff card facts are not stacked: '+JSON.stringify(stats));
          }
          const power=card.locator('.staff-status-button');
          if(await power.count() && !(await power.getAttribute('aria-label'))) {
            throw Error('Staff account status icon lacks accessible label.');
          }
        }

        if ([
          '/payroll/daily-wages',
          '/payroll/daily-wages/history',
          '/payroll/payments',
        ].includes(path)) {
          const metrics = await page.evaluate(() => {
            const root = document.querySelector('.dw-page');
            const font = selector => {
              const el = root?.querySelector(selector);
              return el ? parseFloat(getComputedStyle(el).fontSize) : null;
            };
            const height = selector => {
              const el = root?.querySelector(selector);
              return el ? el.getBoundingClientRect().height : null;
            };
            return {
              heading: font('.dw-header h1'), subtitle: font('.dw-header p'),
              nav: font('.dw-nav a'), cardTitle: font('.dw-card-head h2'),
              count: font('.dw-card-head > span'),
              table: font('.dw-table tbody td'), tableLabel: font('.dw-table tbody td::before'),
              input: font('.dw-search input'), select: font('.dw-toolbar select'),
              actionHeight: height('.dw-button'),
              navHeight: height('.dw-nav a'),
              pageOverflow: document.documentElement.scrollWidth > innerWidth+2,
              scrollArea: !!root?.querySelector('.dw-table-scroll'),
              bodyRows: root?.querySelectorAll('.dw-table tbody tr').length || 0,
            };
          });
          for(const [key,min] of Object.entries({
            heading:21.5,subtitle:13.5,nav:13.5,cardTitle:18.5,
            count:13.5,table:13.5,input:15.5,select:15.5,
          })) {
            if(metrics[key]!==null && metrics[key]<min) {
              throw Error('Payroll unreadable '+key+' '+path+': '+JSON.stringify(metrics));
            }
          }
          if(metrics.pageOverflow || metrics.actionHeight<43.5 || metrics.navHeight<43.5) {
            throw Error('Payroll overflow or tiny button '+path+': '+JSON.stringify(metrics));
          }
          if(!metrics.scrollArea || !metrics.bodyRows) {
            throw Error('Payroll fixture data table not rendered '+path+': '+JSON.stringify(metrics));
          }
        }

        if(path==='/staff-management/overview') {
          const input=page.locator('.staff-simple-search input');
          const border=await input.evaluate(node=>getComputedStyle(node).borderTopWidth);
          if(border !== '0px') throw Error('Nested staff search border: '+border);
          await page.getByText('Ajmal K', {exact:true}).waitFor();
        }
        if(path==='/settings' && profile.width<=760){
          await page.getByRole('heading',{name:'Settings',exact:true}).waitFor({state:'visible'});
          const gap=await page.evaluate(()=>{
            const heading=document.querySelector('.settings-dashboard-heading');
            const actions=document.querySelector('.settings-dashboard-header-actions');
            const last=heading?.lastElementChild;
            return last&&actions?actions.getBoundingClientRect().top-last.getBoundingClientRect().bottom:Infinity;
          });
          if(gap>40)throw Error('Excess blank space below Settings heading: '+gap);
          const fixedBases=await page.evaluate(()=>[...document.querySelectorAll('.settings-dashboard-header,.settings-theme,.settings-footer')]
            .filter(node=>getComputedStyle(node).flexDirection.startsWith('column'))
            .flatMap(node=>[...node.children].filter(child=>parseFloat(getComputedStyle(child).flexBasis)>80).map(child=>child.className)));
          if(fixedBases.length)throw Error('Desktop flex basis used as mobile height: '+fixedBases.join(','));
        }
        if(path==='/staff-management/roles'){
          await page.getByRole('button',{name:/Add New Role|Add Role/}).click();
          const dialog=page.getByRole('dialog');
          await dialog.waitFor();
          const width=await dialog.evaluate(node=>node.getBoundingClientRect().width);
          if(width>profile.width+2)throw Error('Role dialog wider than viewport');
          const sizes=await dialog.locator('input:not([type=checkbox]),select,textarea').evaluateAll(nodes=>nodes.filter(e=>e.getClientRects().length).map(e=>parseFloat(getComputedStyle(e).fontSize)));
          if(sizes.some(size=>size<16))throw Error('Role dialog form text below 16px');
          await page.keyboard.press('Escape');
        }
        if(process.env.UI_SCREENSHOTS){
          await page.screenshot({path:join(artifacts,`${profile.width}-${profile.theme}-${path.replace(/\W+/g,'-')}.png`),timeout:5000});
        }
        tested++;
      } catch(error) {
        firstNavigation=true;
        const name=`${profile.width}-${profile.theme}-${path.replace(/\W+/g,'-')}`;
        failures.push(`${profile.width}/${profile.theme} ${path} (at ${page.url()}): ${error.message}`);
        console.error(failures.at(-1));
        await page.screenshot({path:join(artifacts,name+'.png'),timeout:2000}).catch(()=>{});
      }
    }
    let themeStep='open settings';
    try {
      await page.goto(baseURL+'/settings',{waitUntil:'networkidle',timeout:15000});
      await page.locator('.route-loading').waitFor({state:'hidden',timeout:15000});
      const appearance=page.getByLabel('Appearance');
      const alternateTheme=profile.theme==='dark'?'light':'dark';
      themeStep='apply alternate theme';
      await appearance.selectOption(alternateTheme);
      await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,alternateTheme);
      themeStep='check persisted theme';
      if(await page.evaluate(()=>localStorage.getItem('cubegears-theme'))!==alternateTheme) throw Error('Theme preference was not persisted');
      themeStep='reload saved theme';
      await page.reload({waitUntil:'networkidle'});
      await page.locator('.route-loading').waitFor({state:'hidden',timeout:15000});
      await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,alternateTheme);
      if(await page.getByLabel('Appearance').inputValue()!==alternateTheme) throw Error('Saved theme was not restored after reload');
      themeStep='restore starting theme';
      await page.getByLabel('Appearance').selectOption(profile.theme);
      await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,profile.theme);
      tested++;
    } catch(error) {
      const themeState=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,saved:localStorage.getItem('cubegears-theme'),path:location.pathname,selected:document.querySelector('[aria-label="Appearance"]')?.value}));
      failures.push(`${profile.width}/${profile.theme} Settings theme switch (${themeStep}): ${error.message}; state=${JSON.stringify(themeState)}`);
      console.error(failures.at(-1));
    }
    await context.close();
    console.log(`Checked ${paths.length} routes at ${profile.width}px (${profile.theme})`);
  }));
  if(failures.length){console.error(failures.join('\n'));throw Error(`${failures.length} UI checks failed; screenshots: ${artifacts}`);}
  console.log(`PASS ${tested} page checks: ${paths.length} routes, ${profiles.length} viewport/theme profiles. API responses are test fixtures.`);
} finally {await browser?.close();server.kill();}
