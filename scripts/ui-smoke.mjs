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
  {width:1440,height:1000,theme:'light'}, {width:768,height:1024,theme:'dark'},
  {width:390,height:844,theme:'light'}, {width:360,height:800,theme:'dark'},
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
      localStorage.setItem('auth_token','fixture-token');localStorage.setItem('auth_user',JSON.stringify(user));localStorage.setItem('cubegears-theme',theme);
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
        if(path==='/staff-management/overview') {
          const input=page.locator('.staff-simple-search input');
          const border=await input.evaluate(node=>getComputedStyle(node).borderTopWidth);
          if(border !== '0px') throw Error('Nested staff search border: '+border);
          await page.getByText('Ajmal K', {exact:true}).waitFor();
        }
        if(path==='/settings' && profile.width<=760){
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
    await context.close();
    console.log(`Checked ${paths.length} routes at ${profile.width}px (${profile.theme})`);
  }));
  if(failures.length){console.error(failures.join('\n'));throw Error(`${failures.length} UI checks failed; screenshots: ${artifacts}`);}
  console.log(`PASS ${tested} page checks: ${paths.length} routes, ${profiles.length} viewport/theme profiles. API responses are test fixtures.`);
} finally {await browser?.close();server.kill();}
