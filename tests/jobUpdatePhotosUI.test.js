import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const panel = read('../src/components/jobs/JobWorkPhotoPanel.jsx');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const css = read('../src/styles/job-workspace-dashboard.css');

test('Updates shows Add Image button and keeps the uploader initially collapsed', () => {
  assert.match(panel, /useState\(false\)/);
  assert.match(panel, /aria-expanded=\{adding\}/);
  assert.match(panel, /onClick=\{\(\) => \{ setAdding/);
  assert.match(panel, /\{adding \? 'Cancel' : 'Add Image'\}/);
  assert.match(panel, /\{adding && <form/);
});

test('photo requires caption, type validation and safe max upload size', () => {
  assert.match(panel, /<span>Image Caption \*<\/span>/);
  assert.match(panel, /required maxLength=\{255\}/);
  assert.match(panel, /!caption\.trim\(\)/);
  assert.match(panel, /MAX_SIZE = 5 \* 1024 \* 1024/);
  assert.match(panel, /jobService\.uploadJobWorkPhoto\(jobId, file, caption\.trim\(\)\)/);
});

test('uploaded photos with captions remain visible and refresh their Job Card', () => {
  assert.match(panel, /job-work-photo-gallery/);
  assert.match(panel, /<strong>\{caption\}<\/strong>/);
  assert.match(panel, /await onUploaded\?\.\(\)/);
  assert.match(workspace, /<JobWorkPhotoPanel/);
  assert.match(workspace, /photo\.photo_type !== 'inspection'/);
});

test('mobile Add Image action has full-width-friendly layout', () => {
  assert.match(css, /\.job-work-photo-head-actions/);
  assert.match(css, /\.job-work-photo-add-toggle/);
  assert.match(css, /@media \(max-width:650px\)/);
});
