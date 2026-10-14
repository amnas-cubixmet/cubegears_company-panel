import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appConfirm, appAlert, appPrompt, subscribeAppDialogs,
  resolveAppDialog, cancelAppDialog,
} from '../src/components/common/appDialogs.js';

const sourceDir = new URL('../src/', import.meta.url).pathname;

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return walk(path);
  return /\.(?:jsx|js|tsx|ts)$/.test(entry.name) ? [path] : [];
});

test('all project source files avoid native confirm/alert/prompt dialog calls', () => {
  const invalid = [];
  for (const path of walk(sourceDir)) {
    const text = readFileSync(path, 'utf8');
    const regex = /\b(?:window\.)?(?:confirm|alert|prompt)\s*\(/g;
    if (regex.test(text)) invalid.push(path.replace(sourceDir, 'src/'));
  }
  assert.deepEqual(invalid, []);
});

test('confirm returns true only on explicit confirmation and false on cancellation', async () => {
  const requests = [];
  const unsubscribe = subscribeAppDialogs((dialog) => { if (dialog) requests.push(dialog); });
  try {
    const yes = appConfirm('Finish this job stage?');
    assert.equal(requests.at(-1).kind, 'confirm');
    resolveAppDialog(true);
    assert.equal(await yes, true);

    const no = appConfirm('Remove an item?');
    cancelAppDialog();
    assert.equal(await no, false);
  } finally { unsubscribe(); }
});

test('input prompt returns entered value or null on cancellation', async () => {
  const unsubscribe = subscribeAppDialogs(() => {});
  try {
    const entered = appPrompt('Reason?', 'Initial value');
    resolveAppDialog('Supervisor review');
    assert.equal(await entered, 'Supervisor review');

    const cancelled = appPrompt('Rejected reason?');
    cancelAppDialog();
    assert.equal(await cancelled, null);
  } finally { unsubscribe(); }
});

test('alert resolves after dismissal and the modal host is mounted under theme provider', async () => {
  const unsubscribe = subscribeAppDialogs(() => {});
  try {
    const promise = appAlert('Saved successfully');
    resolveAppDialog(undefined);
    assert.equal(await promise, undefined);
  } finally { unsubscribe(); }
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const host = readFileSync(new URL('../src/components/common/AppDialogHost.jsx', import.meta.url), 'utf8');
  assert.match(app, /<AppDialogHost \/>/);
  assert.match(host, /role=\{isPrompt \? 'dialog' : 'alertdialog'\}/);
  assert.match(host, /event\.key === 'Escape'/);
  assert.match(host, /aria-modal="true"/);
});
