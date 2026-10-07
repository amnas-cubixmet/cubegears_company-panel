import React from 'react';
import { FilePenLine, Save, Settings2 } from 'lucide-react';

export const SettingsHeader=({saving,onSave,onTemplates})=><header className="settings-dashboard-header">
  <div><h1>Settings</h1><p>Company defaults, workshop operations, billing, inventory, people, alerts and integrations.</p></div>
  <div className="settings-dashboard-header-actions">
    <div className="settings-dashboard-header-badge"><Settings2 size={13}/><span>System Configuration</span></div>
    <button type="button" className="settings-secondary-button" onClick={onTemplates}><FilePenLine size={14}/>PDF Templates</button>
    <button type="button" className="settings-primary-button" onClick={onSave} disabled={saving}><Save size={14}/>{saving?'Saving…':'Save Settings'}</button>
  </div>
</header>;