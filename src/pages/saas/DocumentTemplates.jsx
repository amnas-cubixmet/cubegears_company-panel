import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, FileText, ImagePlus, LayoutTemplate, ReceiptText, Save, Sparkles, Trash2 } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { AccountHeader } from '../../components/account';
import '../../styles/document-templates.css';
import '../../styles/account-dashboard.css';

const STORAGE_KEY = 'cubixgear:document-template-settings';

const defaults = {
  invoiceTemplate: 'modern',
  estimateTemplate: 'modern',
  accent: 'teal',
  showOriginal: true,
  showSellerMark: true,
  compactTable: false,
  customName: 'My Custom Template',
  customHeader: 'Tax Invoice',
  customFooter: 'Thank you for your business.',
  customShowTransport: true,
  customShowTaxTable: true,
  businessLogo: '',
  businessName: 'CubixGear Workshop',
  businessLegalName: '',
  businessGstin: '',
  businessPhone: '',
  businessEmail: '',
  businessAddress: '',
  businessState: 'Kerala',
  businessStateCode: '32',
  businessWebsite: '',
  businessPan: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankUpi: '',
  authorizedSignatory: '',
  termsText: 'Goods once sold will not be taken back.',
  showBusinessLogo: true,
  showBankDetails: true,
  showTerms: true,
  showSignature: true
};

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean business layout with strong hierarchy and compact tax summary.'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional invoice structure with simple borders and accounting-first layout.'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Lightweight document with reduced decoration and maximum readability.'
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your own document layout settings, labels and optional sections.'
  }
];

const accents = [
  { id: 'teal', label: 'Teal' },
  { id: 'blue', label: 'Blue' },
  { id: 'graphite', label: 'Graphite' }
];

function readSettings() {
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) };
  } catch {
    return defaults;
  }
}

function Preview({ kind, settings }) {
  const selected = kind === 'invoice' ? settings.invoiceTemplate : settings.estimateTemplate;

  return (
    <div className={`template-preview template-${selected} accent-${settings.accent} ${settings.compactTable ? 'is-compact' : ''}`}>
      <div className="template-preview-top">
        <span>{settings.showOriginal ? 'ORIGINAL' : ''}</span>
        <span>{kind === 'invoice' ? 'FINALIZED' : 'ISSUED'}</span>
      </div>

      <div className="template-preview-head">
        <div className="template-preview-brand">
          {settings.showBusinessLogo && settings.businessLogo
            ? <img className="template-preview-logo" src={settings.businessLogo} alt="Business logo"/>
            : settings.showSellerMark && <div className="template-preview-mark">{(settings.businessName || 'CG').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</div>}
          <div>
            <strong>{settings.businessName || 'Business Name'}</strong>
            {settings.businessLegalName && <span>{settings.businessLegalName}</span>}
            <span>{[settings.businessAddress, settings.businessPhone, settings.businessEmail].filter(Boolean).join(' · ') || 'Business address · Phone · Email'}</span>
            <span>GSTIN: {settings.businessGstin || 'Not set'}{settings.businessPan ? ` · PAN: ${settings.businessPan}` : ''}</span>
          </div>
        </div>
        <div className="template-preview-meta">
          <span>{kind === 'invoice' ? 'Tax Invoice' : 'Estimate'}</span>
          <strong>{kind === 'invoice' ? 'INV-2026-0042' : 'EST-2026-0018'}</strong>
          <small>02-10-2026</small>
        </div>
      </div>

      <div className="template-preview-title">{selected === 'custom' ? (settings.customHeader || (kind === 'invoice' ? 'Tax Invoice' : 'Estimate / Quotation')) : (kind === 'invoice' ? 'Tax Invoice' : 'Estimate / Quotation')}</div>

      <div className="template-preview-info">
        <div><b>Bill To</b><strong>Customer Name</strong><span>Customer address</span></div>
        {settings.customShowTransport !== false && <div><b>Transport</b><span>Vehicle: KL08AB1234</span></div>}
        <div><b>Document</b><span>Place of Supply: 32-Kerala</span></div>
      </div>

      <div className="template-preview-table">
        <div className="head"><span>#</span><span>Item</span><span>Qty</span><span>GST</span><span>Amount</span></div>
        <div className="row"><span>1</span><span>Service / Part</span><span>1</span><span>18%</span><span>₹1,180.00</span></div>
        <div className="row"><span>2</span><span>Workshop Item</span><span>2</span><span>5%</span><span>₹2,100.00</span></div>
      </div>

      <div className="template-preview-bottom">
        <div>
          <b>Amount in Words</b>
          <span>Three Thousand Two Hundred Eighty Rupees only</span>
          {settings.showTerms && settings.termsText && <small><b>Terms:</b> {settings.termsText}</small>}
          {settings.showBankDetails && (settings.bankName || settings.bankAccountNumber || settings.bankUpi) && (
            <small><b>Bank:</b> {[settings.bankName, settings.bankAccountNumber, settings.bankIfsc, settings.bankUpi].filter(Boolean).join(' · ')}</small>
          )}
          {selected === 'custom' && settings.customFooter && <small>{settings.customFooter}</small>}
        </div>
        <div className="template-preview-total">
          <span>Total</span>
          <strong>₹3,280.00</strong>
          {settings.showSignature && <small>{settings.authorizedSignatory || 'Authorised Signatory'}</small>}
        </div>
      </div>
    </div>
  );
}

export function DocumentTemplates() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const invoiceTemplate = useMemo(
    () => templates.find((item) => item.id === settings.invoiceTemplate) || templates[0],
    [settings.invoiceTemplate]
  );
  const estimateTemplate = useMemo(
    () => templates.find((item) => item.id === settings.estimateTemplate) || templates[0],
    [settings.estimateTemplate]
  );

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  useEffect(() => {
    let alive = true;
    settingsService.getSettings('company').then((company) => {
      if (!alive || !company) return;
      setSettings((old) => ({
        ...old,
        businessName: old.businessName === defaults.businessName ? (company.name || old.businessName) : old.businessName,
        businessGstin: old.businessGstin || company.gstNo || '',
        businessPhone: old.businessPhone || company.phone || '',
        businessEmail: old.businessEmail || company.email || '',
        businessAddress: old.businessAddress || company.address || ''
      }));
      setProfileLoaded(true);
    }).catch(() => setProfileLoaded(true));
    return () => { alive = false; };
  }, []);

  const update = (key, value) => setSettings((old) => ({ ...old, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  const uploadLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => update('businessLogo', String(reader.result || ''));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="document-templates-page">
      <AccountHeader
        title="PDF Templates"
        subtitle="Choose how invoices and estimates look when printed or saved as PDF."
        active="templates"
        onNavigate={navigate}
        actions={
          <button className="template-save-button" onClick={save}>
            {saved ? <Check size={15}/> : <Save size={15}/>}
            {saved ? 'Saved' : 'Save Templates'}
          </button>
        }
      />

      <section className="template-settings-card business-branding-card">
        <div className="template-settings-title">
          <Building2 size={18}/>
          <div>
            <strong>Business Identity</strong>
            <span>Logo, legal details, GST, contact and payment details used on your document templates.</span>
          </div>
        </div>

        <div className="business-branding-layout">
          <div className="business-logo-panel">
            <div className="business-logo-preview">
              {settings.businessLogo ? <img src={settings.businessLogo} alt="Business logo"/> : <span>{(settings.businessName || 'CG').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="business-logo-actions">
              <label className="template-upload-button"><ImagePlus size={15}/>Upload Logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={uploadLogo}/></label>
              {settings.businessLogo && <button type="button" className="template-remove-logo" onClick={() => update('businessLogo', '')}><Trash2 size={14}/>Remove</button>}
            </div>
            <small>PNG, JPG, WEBP or SVG. Saved in this browser for document use.</small>
          </div>

          <div className="business-fields-grid">
            <label>Business / Brand Name<input value={settings.businessName || ''} onChange={(e) => update('businessName', e.target.value)} placeholder="CubixGear Workshop"/></label>
            <label>Legal Business Name<input value={settings.businessLegalName || ''} onChange={(e) => update('businessLegalName', e.target.value)} placeholder="Registered legal name"/></label>
            <label>GSTIN<input value={settings.businessGstin || ''} onChange={(e) => update('businessGstin', e.target.value.toUpperCase())} placeholder="32XXXXXXXXXXXXX"/></label>
            <label>PAN<input value={settings.businessPan || ''} onChange={(e) => update('businessPan', e.target.value.toUpperCase())} placeholder="ABCDE1234F"/></label>
            <label>Phone<input value={settings.businessPhone || ''} onChange={(e) => update('businessPhone', e.target.value)} placeholder="+91 98765 43210"/></label>
            <label>Email<input type="email" value={settings.businessEmail || ''} onChange={(e) => update('businessEmail', e.target.value)} placeholder="accounts@company.com"/></label>
            <label>State<input value={settings.businessState || ''} onChange={(e) => update('businessState', e.target.value)} placeholder="Kerala"/></label>
            <label>State Code<input value={settings.businessStateCode || ''} onChange={(e) => update('businessStateCode', e.target.value)} placeholder="32"/></label>
            <label>Website<input value={settings.businessWebsite || ''} onChange={(e) => update('businessWebsite', e.target.value)} placeholder="www.company.com"/></label>
            <label className="business-field-wide">Registered Address<textarea value={settings.businessAddress || ''} onChange={(e) => update('businessAddress', e.target.value)} placeholder="Full registered business address"/></label>
          </div>
        </div>

        <div className="business-subsection">
          <div className="business-subsection-head"><strong>Bank & Payment Details</strong><span>Optional details shown on invoice / estimate.</span></div>
          <div className="business-fields-grid">
            <label>Bank Name<input value={settings.bankName || ''} onChange={(e) => update('bankName', e.target.value)} placeholder="Bank name"/></label>
            <label>Account Name<input value={settings.bankAccountName || ''} onChange={(e) => update('bankAccountName', e.target.value)} placeholder="Account holder"/></label>
            <label>Account Number<input value={settings.bankAccountNumber || ''} onChange={(e) => update('bankAccountNumber', e.target.value)} placeholder="Account number"/></label>
            <label>IFSC<input value={settings.bankIfsc || ''} onChange={(e) => update('bankIfsc', e.target.value.toUpperCase())} placeholder="IFSC code"/></label>
            <label>UPI ID<input value={settings.bankUpi || ''} onChange={(e) => update('bankUpi', e.target.value)} placeholder="business@upi"/></label>
            <label>Authorised Signatory<input value={settings.authorizedSignatory || ''} onChange={(e) => update('authorizedSignatory', e.target.value)} placeholder="Name / designation"/></label>
            <label className="business-field-wide">Terms & Conditions<textarea value={settings.termsText || ''} onChange={(e) => update('termsText', e.target.value)} placeholder="Payment / warranty / jurisdiction terms"/></label>
          </div>
        </div>

        <div className="template-toggle-row">
          <label><input type="checkbox" checked={settings.showBusinessLogo !== false} onChange={(e) => update('showBusinessLogo', e.target.checked)}/><span>Show business logo</span></label>
          <label><input type="checkbox" checked={settings.showBankDetails !== false} onChange={(e) => update('showBankDetails', e.target.checked)}/><span>Show bank details</span></label>
          <label><input type="checkbox" checked={settings.showTerms !== false} onChange={(e) => update('showTerms', e.target.checked)}/><span>Show terms</span></label>
          <label><input type="checkbox" checked={settings.showSignature !== false} onChange={(e) => update('showSignature', e.target.checked)}/><span>Show signature area</span></label>
        </div>
      </section>

      <section className="template-settings-card">
        <div className="template-settings-title">
          <Sparkles size={18}/>
          <div>
            <strong>Document Style</strong>
            <span>Invoice and estimate can use different templates.</span>
          </div>
        </div>

        <div className="template-control-grid">
          <label>
            <span><ReceiptText size={15}/>Invoice Template</span>
            <select value={settings.invoiceTemplate} onChange={(e) => update('invoiceTemplate', e.target.value)}>
              {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <small>{invoiceTemplate.description}</small>
          </label>

          <label>
            <span><FileText size={15}/>Estimate Template</span>
            <select value={settings.estimateTemplate} onChange={(e) => update('estimateTemplate', e.target.value)}>
              {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <small>{estimateTemplate.description}</small>
          </label>

          <label>
            <span><LayoutTemplate size={15}/>Accent</span>
            <select value={settings.accent} onChange={(e) => update('accent', e.target.value)}>
              {accents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <small>Used for headings, document cards and totals.</small>
          </label>
        </div>

        <div className="template-toggle-row">
          <label><input type="checkbox" checked={settings.showOriginal} onChange={(e) => update('showOriginal', e.target.checked)}/><span>Show ORIGINAL label</span></label>
          <label><input type="checkbox" checked={settings.showSellerMark} onChange={(e) => update('showSellerMark', e.target.checked)}/><span>Show seller initials mark</span></label>
          <label><input type="checkbox" checked={settings.compactTable} onChange={(e) => update('compactTable', e.target.checked)}/><span>Compact item table</span></label>
        </div>

        {(settings.invoiceTemplate === 'custom' || settings.estimateTemplate === 'custom') && (
          <div className="custom-template-maker">
            <div className="custom-template-maker-head">
              <div>
                <span>CUSTOM TEMPLATE MAKER</span>
                <h3>Build your own PDF template</h3>
                <p>Change document labels and optional sections. Preview updates instantly.</p>
              </div>
            </div>

            <div className="custom-template-grid">
              <label>Template Name
                <input value={settings.customName || ''} onChange={(e) => update('customName', e.target.value)} placeholder="My Custom Template"/>
              </label>
              <label>Document Heading
                <input value={settings.customHeader || ''} onChange={(e) => update('customHeader', e.target.value)} placeholder="Tax Invoice"/>
              </label>
              <label className="custom-template-wide">Footer Note
                <textarea value={settings.customFooter || ''} onChange={(e) => update('customFooter', e.target.value)} placeholder="Thank you for your business."/>
              </label>
            </div>

            <div className="template-toggle-row">
              <label><input type="checkbox" checked={settings.customShowTransport !== false} onChange={(e) => update('customShowTransport', e.target.checked)}/><span>Show transport section</span></label>
              <label><input type="checkbox" checked={settings.customShowTaxTable !== false} onChange={(e) => update('customShowTaxTable', e.target.checked)}/><span>Show tax summary</span></label>
            </div>
          </div>
        )}
      </section>

      <div className="template-preview-grid">
        <section className="template-preview-card">
          <div className="template-preview-card-head">
            <div><span>INVOICE</span><h2>{invoiceTemplate.name}</h2></div>
            <ReceiptText size={20}/>
          </div>
          <Preview kind="invoice" settings={settings}/>
        </section>

        <section className="template-preview-card">
          <div className="template-preview-card-head">
            <div><span>ESTIMATE</span><h2>{estimateTemplate.name}</h2></div>
            <FileText size={20}/>
          </div>
          <Preview kind="estimate" settings={settings}/>
        </section>
      </div>
    </div>
  );
}

export default DocumentTemplates;
