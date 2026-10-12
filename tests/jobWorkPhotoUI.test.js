import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workspace = read('../src/pages/jobs/JobCardWorkspace.jsx');
const photos = read('../src/components/jobs/JobWorkPhotoPanel.jsx');
const service = read('../src/services/job.service.js');
const css = read('../src/styles/job-workspace-dashboard.css');

const updates = workspace.slice(
  workspace.indexOf("{activeTab === 'updates' && ("),
  workspace.indexOf("{activeTab === 'qc' && (")
);

test('Technician Updates includes a real photo uploader and caption gallery', () => {
  assert.match(updates, /<JobWorkPhotoPanel/);
  assert.match(updates, /jobId=\{job\.id\}/);
  assert.match(updates, /photos=\{\(job\.photos \|\| \[\]\)/);
  assert.match(photos, /Image Caption/);
  assert.match(photos, /maxLength=\{255\}/);
  assert.match(photos, /onSubmit=\{upload\}/);
  assert.match(photos, /Add Photo/);
  assert.match(photos, /Selected work photo preview/);
  assert.match(photos, /<figcaption>/);
});

test('Photos upload as multipart and downloaded previews require authenticated API', () => {
  assert.match(service, /new FormData\(\)/);
  assert.match(service, /form\.append\('image', file\)/);
  assert.match(service, /form\.append\('caption', caption \|\| ''\)/);
  assert.match(service, /\/photos\/upload/);
  assert.match(service, /\/photos\/\$\{photoId\}\/file/);
  assert.match(service, /responseType: 'blob'/);
  assert.match(photos, /getJobWorkPhotoBlob\(jobId, photo\.id\)/);
  assert.match(photos, /URL\.revokeObjectURL/);
  assert.doesNotMatch(workspace, /const addPhoto = async/);
});

test('Client restricts images to supported types under five megabytes', () => {
  assert.match(photos, /'image\/jpeg', 'image\/png', 'image\/webp', 'image\/gif'/);
  assert.match(photos, /MAX_SIZE = 5 \* 1024 \* 1024/);
  assert.match(photos, /Choose a photo under 5 MB/);
  assert.match(photos, /disabled=\{!file \|\| busy \|\| disabled\}/);
});

test('Work update notes retain content when save fails and gallery reloads from Django', () => {
  assert.match(workspace, /const saved = await persist\(patch\)/);
  assert.match(workspace, /if \(saved\) setUpdateNote\(''\)/);
  assert.match(updates, /jobService\.getJobById\(job\.id\)/);
  assert.match(updates, /setJob\(refreshed\)/);
});

test('Caption form and image history support mobile layouts and regular input fonts', () => {
  assert.match(css, /\.job-work-photo-gallery \{/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /font-weight:400!important/);
});
