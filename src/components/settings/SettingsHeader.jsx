
import { FilePenLine, Save, Settings2 } from 'lucide-react';

export const SettingsHeader = ({ saving, disabled, hasUnsaved, onSave, onTemplates }) => (
  <header className="settings-dashboard-header">
    <div className="settings-dashboard-heading">
      <span className="settings-dashboard-eyebrow"><Settings2 size={14} aria-hidden="true"/> Workspace Settings</span>
      <h1>Settings</h1>
      <p>Manage workshop information, operations, billing, inventory and staff preferences.</p>
      {hasUnsaved && <span className="settings-unsaved-indicator">Unsaved changes</span>}
    </div>
    <div className="settings-dashboard-header-actions">
      <button type="button" className="settings-secondary-button" onClick={onTemplates}>
        <FilePenLine size={16} aria-hidden="true"/> PDF Templates
      </button>
      <button type="button" className="settings-primary-button" onClick={onSave} disabled={saving || disabled}>
        <Save size={16} aria-hidden="true"/>{saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  </header>
);
