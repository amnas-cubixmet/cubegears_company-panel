import React from 'react';
import { Save } from 'lucide-react';

export const SettingsEditor=({active,sections,schema,data,themeMode,setThemeMode,onUpdate,onReset,onSave,saving})=>{
 const current=sections.find(item=>item.id===active);
 return <section className="settings-dashboard-card">
   <header className="settings-dashboard-card-head"><div><span>Current Section</span><h2>{current?.label}</h2><p>Changes apply to company defaults unless a branch override exists.</p></div></header>
   {active==='company'&&<div className="settings-theme"><span><b>Appearance</b><small>Light, dark or follow system preference.</small></span><select value={themeMode} onChange={e=>setThemeMode(e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>}
   <div className="settings-form-grid">{(schema||[]).map(([key,label,type,options])=>{
     const value=data?.[key]??(type==='checkbox'?false:'');
     if(type==='checkbox') return <label className="settings-toggle" key={key}><span><b>{label}</b><small>Company default</small></span><input type="checkbox" checked={Boolean(value)} onChange={e=>onUpdate(key,e.target.checked)}/></label>;
     return <label className={type==='textarea'?'crud-field full':'crud-field'} key={key}><span>{label}</span>{type==='select'?<select value={value} onChange={e=>onUpdate(key,e.target.value)}>{options.map(option=><option key={option} value={option}>{option}</option>)}</select>:type==='textarea'?<textarea rows="4" value={value} onChange={e=>onUpdate(key,e.target.value)}/>:<input type={type} value={value} onChange={e=>onUpdate(key,type==='number'?Number(e.target.value):e.target.value)}/>}</label>;
   })}</div>
   <footer className="settings-footer"><button type="button" className="settings-secondary-button" onClick={onReset}>Reset Changes</button><button type="button" className="settings-primary-button" onClick={onSave} disabled={saving}><Save size={14}/>{saving?'Saving…':'Save Changes'}</button></footer>
 </section>;
};