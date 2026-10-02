import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, LayoutTemplate, ReceiptText, Save, Sparkles } from 'lucide-react';
import '../../styles/document-templates.css';

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
  customShowTaxTable: true
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
          {settings.showSellerMark && <div className="template-preview-mark">CG</div>}
          <div>
            <strong>CubixGear Workshop</strong>
            <span>Business address · Phone · Email</span>
            <span>GSTIN: 32XXXXXXXXXXXXX</span>
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
          {selected === 'custom' && settings.customFooter && <small>{settings.customFooter}</small>}
        </div>
        <div className="template-preview-total">
          <span>Total</span>
          <strong>₹3,280.00</strong>
        </div>
      </div>
    </div>
  );
}

export function DocumentTemplates() {
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);

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

  const update = (key, value) => setSettings((old) => ({ ...old, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  return (
    <div className="document-templates-page">
      <header className="document-templates-head">
        <div>
          <span className="document-templates-kicker">ACCOUNT · DOCUMENTS</span>
          <h1>PDF Templates</h1>
          <p>Choose how invoices and estimates should look when printed or saved as PDF.</p>
        </div>

        <button className="template-save-button" onClick={save}>
          {saved ? <Check size={17}/> : <Save size={17}/>}
          {saved ? 'Saved' : 'Save Templates'}
        </button>
      </header>

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
