

export const SettingsSectionNav = ({ sections, active, dirtySections = [], onChange }) => (
  <aside className="settings-dashboard-sidebar">
    <div className="settings-dashboard-sidebar-head">
      <span>Settings Sections</span>
      <strong>{sections.length} sections</strong>
    </div>
    <nav className="settings-dashboard-nav" aria-label="Settings sections">
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={active === id ? 'active' : ''}
          aria-current={active === id ? 'page' : undefined}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon size={17} aria-hidden="true"/>
          <span>{label}</span>
          {dirtySections.includes(id) && <span className="settings-nav-dirty" aria-label="Unsaved changes" />}
        </button>
      ))}
    </nav>
  </aside>
);
