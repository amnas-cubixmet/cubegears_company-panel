import React, { useContext, useEffect, useState } from 'react';
import { Bell, Boxes, Building2, Clock3, CreditCard, Plug, ShieldCheck, WalletCards } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { settingsService } from '../../services/settings.service';
import { useNavigate } from 'react-router-dom';
import {
  SettingsEditor,
  SettingsHeader,
  SettingsSectionNav,
} from '../../components/settings';
import '../../styles/settings.css';

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
  const navigate = useNavigate();
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
    <div className="settings-page">
      <SettingsHeader
        saving={saving}
        onSave={save}
        onTemplates={() => navigate('/account/templates')}
      />

      {message && <div className="settings-message">{message}</div>}

      <div className="settings-dashboard-layout">
        <SettingsSectionNav
          sections={sections}
          active={active}
          onChange={(id) => {
            setActive(id);
            setMessage('');
          }}
        />

        <SettingsEditor
          active={active}
          sections={sections}
          schema={schemas[active] || []}
          data={data[active] || {}}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onUpdate={update}
          onReset={() => settingsService.getAllSettings().then(setData)}
          onSave={save}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default Settings;
