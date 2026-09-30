import React, { useContext, useEffect, useState } from 'react';
import { Bell, Boxes, Building2, Clock3, CreditCard, Plug, Save, ShieldCheck, WalletCards } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { settingsService } from '../../services/settings.service';

const sections = [
  { id: 'company', label: 'Company & Locale', icon: Building2 },
  { id: 'operations', label: 'Workshop Operations', icon: Clock3 },
  { id: 'billing', label: 'Billing & Tax', icon: CreditCard },
  { id: 'inventory', label: 'Inventory Defaults', icon: Boxes },
  { id: 'attendance', label: 'Attendance Rules', icon: Clock3 },
  { id: 'payroll', label: 'Payroll', icon: WalletCards },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Roles & Security', icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', icon: Plug }
];

const schemas = {
  company: [
    ['name', 'Workshop / Company Name', 'text'], ['phone', 'Phone', 'tel'], ['email', 'Official Email', 'email'], ['gstNo', 'GSTIN / Tax Number', 'text'], ['address', 'Registered Address', 'textarea'],
    ['currency', 'Currency', 'select', ['INR', 'USD', 'AED', 'SAR']], ['timezone', 'Timezone', 'select', ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Riyadh', 'UTC']], ['dateFormat', 'Date Format', 'select', ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']]
  ],
  operations: [
    ['workingStart', 'Working Day Starts', 'time'], ['workingEnd', 'Working Day Ends', 'time'], ['bookingSlotMinutes', 'Booking Slot Minutes', 'number'], ['bookingCapacity', 'Vehicles per Slot', 'number'], ['jobPrefix', 'Job Number Prefix', 'text'], ['deliveryCreditAllowed', 'Allow Delivery With Balance', 'checkbox']
  ],
  billing: [
    ['invoicePrefix', 'Invoice Prefix', 'text'], ['defaultTaxRate', 'Default Tax %', 'number'], ['paymentTermsDays', 'Default Payment Terms (Days)', 'number'], ['rounding', 'Enable Invoice Rounding', 'checkbox']
  ],
  inventory: [
    ['defaultMinimumStock', 'Default Minimum Stock', 'number'], ['defaultReorderQty', 'Default Reorder Quantity', 'number'], ['lowStockAlerts', 'Enable Low Stock Alerts', 'checkbox'], ['negativeStock', 'Allow Negative Stock', 'checkbox']
  ],
  attendance: [
    ['graceMinutes', 'Late Grace Minutes', 'number'], ['overtimeAfterMinutes', 'Overtime After Worked Minutes', 'number'], ['locationRequired', 'Require Location for Punch', 'checkbox'], ['correctionApproval', 'Correction Requires Approval', 'checkbox']
  ],
  payroll: [
    ['payrollDay', 'Payroll Day', 'number'], ['overtimeMultiplier', 'Overtime Multiplier', 'number'], ['managerApproval', 'Manager Approval Required', 'checkbox']
  ],
  notifications: [
    ['lowStock', 'Low Stock Alerts', 'checkbox'], ['overdueInvoice', 'Overdue Invoice Alerts', 'checkbox'], ['jobReady', 'Job Ready Alerts', 'checkbox'], ['leaveDecision', 'Leave Decision Alerts', 'checkbox'], ['email', 'Email Channel', 'checkbox'], ['whatsapp', 'WhatsApp Channel', 'checkbox'], ['browserPush', 'Browser Push', 'checkbox']
  ],
  security: [
    ['sessionHours', 'Session Lifetime (Hours)', 'number'], ['requireStrongPassword', 'Strong Password Required', 'checkbox'], ['auditExports', 'Audit Data Exports', 'checkbox'], ['twoFactor', 'Two-factor Authentication', 'checkbox']
  ],
  integrations: [
    ['razorpayEnabled', 'Razorpay Enabled', 'checkbox'], ['whatsappEnabled', 'WhatsApp Integration Enabled', 'checkbox'], ['emailEnabled', 'Email Integration Enabled', 'checkbox'], ['webhookUrl', 'Webhook URL', 'url']
  ]
};

export const Settings = () => {
  const [active, setActive] = useState('company');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { themeMode, setThemeMode } = useContext(ThemeContext);

  useEffect(() => {
    settingsService.getAllSettings().then(setData).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setData((prev) => ({ ...prev, [active]: { ...(prev[active] || {}), [key]: value } }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await settingsService.updateSettings(active, data[active] || {});
      setMessage('Settings saved successfully.');
    } catch (error) {
      setMessage(error?.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="crud-empty">Loading settings…</div>;

  return (
    <div className="settings-page crud-page">
      <div className="crud-heading">
        <div><p className="crud-eyebrow">CUBIXGEAR</p><h1>Settings</h1><p>Company defaults, branch operations, finance, people, alerts and integrations.</p></div>
        <button type="button" className="crud-btn crud-btn-primary" onClick={save} disabled={saving}><Save size={17} />{saving ? 'Saving…' : 'Save Settings'}</button>
      </div>

      {message && <div className="settings-message">{message}</div>}

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={active === id ? 'active' : ''} onClick={() => { setActive(id); setMessage(''); }}><Icon size={16} /><span>{label}</span></button>)}
        </nav>

        <section className="settings-card">
          <div className="settings-card-head"><div><h2>{sections.find((item) => item.id === active)?.label}</h2><p>Changes apply to the company default configuration unless a branch override exists.</p></div></div>

          {active === 'company' && <div className="settings-theme"><span><b>Appearance</b><small>Light, dark or follow system preference.</small></span><select value={themeMode} onChange={(e) => setThemeMode(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>}

          <div className="settings-form-grid">
            {(schemas[active] || []).map(([key, label, type, options]) => {
              const value = data[active]?.[key] ?? (type === 'checkbox' ? false : '');
              if (type === 'checkbox') return <label className="settings-toggle" key={key}><span><b>{label}</b><small>Company default</small></span><input type="checkbox" checked={Boolean(value)} onChange={(e) => update(key, e.target.checked)} /></label>;
              return <label className={type === 'textarea' ? 'crud-field full' : 'crud-field'} key={key}><span>{label}</span>{type === 'select' ? <select value={value} onChange={(e) => update(key, e.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea rows="4" value={value} onChange={(e) => update(key, e.target.value)} /> : <input type={type} value={value} onChange={(e) => update(key, type === 'number' ? Number(e.target.value) : e.target.value)} />}</label>;
            })}
          </div>

          <div className="settings-footer"><button type="button" className="crud-btn" onClick={() => settingsService.getAllSettings().then(setData)}>Cancel Changes</button><button type="button" className="crud-btn crud-btn-primary" onClick={save} disabled={saving}><Save size={16} />Save</button></div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
