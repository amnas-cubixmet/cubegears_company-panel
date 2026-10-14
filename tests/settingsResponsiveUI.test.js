import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const settings = read('../src/pages/settings/Settings.jsx');
const header = read('../src/components/settings/SettingsHeader.jsx');
const nav = read('../src/components/settings/SettingsSectionNav.jsx');
const editor = read('../src/components/settings/SettingsEditor.jsx');
const css = read('../src/styles/settings-ui-polish.css');

test('Settings page keeps existing API and section schemas', () => {
  assert.match(settings, /settingsService\.getAllSettings\(\)/);
  assert.match(settings, /settingsService\.updateSettings\(active, payload\)/);
  for (const id of ['company', 'operations', 'billing', 'inventory', 'attendance', 'payroll', 'notifications', 'security', 'integrations']) {
    assert.ok(settings.includes(`id: '${id}'`));
  }
});

test('Settings safely handles loading failure, retry, and saved feedback', () => {
  assert.match(settings, /setLoadError\(error\?\.message/);
  assert.match(settings, /role="alert"/);
  assert.match(settings, /onClick=\{loadSettings\}/);
  assert.match(settings, /setMessage\('Changes saved successfully\.'\)/);
  assert.match(settings, /setSavedData\(\(prev\) =>/);
});

test('Settings preserves unsaved edits per section and resets only active section', () => {
  assert.match(settings, /dirtySections\.includes\(active\)/);
  assert.match(settings, /setData\(\(prev\) => \(\{ \.\.\.prev, \[active\]: \{ \.\.\.\(savedData\[active\] \|\| \{\}\) \} \}\)\)/);
  assert.match(settings, /setData\(\(prev\) => \(\{ \.\.\.prev, \[active\]: \{ \.\.\.\(prev\[active\] \|\| \{\}\), \[key\]: value \} \}\)\)/);
  assert.match(nav, /dirtySections\.includes\(id\)/);
  assert.match(nav, /aria-current=\{active === id \? 'page'/);
});

test('Form controls keep values and existing theme behavior', () => {
  assert.match(editor, /onUpdate\(key, e\.target\.checked\)/);
  assert.match(editor, /onUpdate\(key, e\.target\.value\)/);
  assert.match(editor, /e\.target\.value === '' \? '' : Number\(e\.target\.value\)/);
  assert.match(editor, /setThemeMode\(e\.target\.value\)/);
  assert.match(editor, /disabled=\{saving \|\| !dirty\}/);
  assert.match(header, /disabled=\{saving \|\| disabled\}/);
});

test('Settings UI has readable desktop fields and swipeable mobile section nav', () => {
  assert.match(css, /grid-template-columns:236px minmax\(0,1fr\)/);
  assert.match(css, /font-size:12px/);
  assert.match(css, /height:44px;min-height:44px/);
  assert.match(css, /font-weight:400!important/);
  assert.match(css, /@media\(max-width:1000px\)/);
  assert.match(css, /overflow-x:auto;overflow-y:hidden/);
  assert.match(css, /scrollbar-width:none/);
  assert.match(css, /@media\(max-width:700px\)/);
});
