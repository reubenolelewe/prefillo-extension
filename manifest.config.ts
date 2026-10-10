import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

const apiOrigin = process.env.VITE_PREFILLO_API_ORIGIN || process.env.PREFILLO_API_ORIGIN || 'http://127.0.0.1:3000';
const apiHost = `${new URL(apiOrigin).origin}/*`;
const greenhouse = ['https://boards.greenhouse.io/*', 'https://job-boards.greenhouse.io/*'];
const lever = ['https://jobs.lever.co/*'];
const ashby = ['https://jobs.ashbyhq.com/*'];
const workday = [
  'https://*.myworkdayjobs.com/*',
  'https://*.myworkday.com/*',
  'https://*.myworkdaysite.com/*',
];

export default defineManifest({
  manifest_version: 3,
  name: 'Prefillo',
  version: pkg.version,
  description: 'Review-first job application autofill with source-grounded resumes.',
  icons: { '16': 'icons/icon16.png', '48': 'icons/icon48.png', '128': 'icons/icon128.png' },
  action: { default_title: 'Open Prefillo' },
  side_panel: { default_path: 'src/prefillo/panel/index.html' },
  background: { service_worker: 'src/prefillo/background.ts', type: 'module' },
  permissions: ['storage', 'activeTab', 'sidePanel'],
  host_permissions: [...greenhouse, ...lever, ...ashby, ...workday, apiHost],
  content_scripts: [{
    matches: [...greenhouse, ...lever, ...ashby, ...workday],
    js: ['src/prefillo/content.ts'],
    run_at: 'document_idle',
    all_frames: true,
  }],
});
