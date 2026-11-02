#!/usr/bin/env node
// Assembles a Safari-ready copy of the extension from an existing `parcel build`.
//   node scripts/build-safari.mjs [version]
// Output: dist-safari/VandyScheduler/ and dist-safari/VandyScheduler.zip
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist-safari');
const extDir = join(outDir, 'VandyScheduler');

const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const backgroundScript = manifest.background.service_worker;

// Everything the manifest references
const files = [
  ...Object.values(manifest.icons),
  ...manifest.content_scripts.flatMap(({ js = [], css = [] }) => [...js, ...css]),
  backgroundScript,
  ...manifest.web_accessible_resources.flatMap(({ resources }) => resources),
];
const missing = files.filter((file) => !existsSync(join(root, file)));
if (missing.length > 0) {
  console.error(`Missing files, run \`parcel build\` first: ${missing.join(', ')}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(extDir, { recursive: true });
for (const dir of new Set(files.map((file) => file.split('/')[0]))) {
  cpSync(join(root, dir), join(extDir, dir), { recursive: true });
}

// Use a non-persistent background script rather than a module service worker for Safari.
// The bundle has no imports or exports, so it loads as a classic script.
manifest.background = { scripts: [backgroundScript], persistent: false };
// Safari grants site access from the toolbar item, which needs an action to exist.
manifest.action = { default_title: manifest.name, default_icon: manifest.icons };
manifest.version = process.argv[2] ?? manifest.version;
writeFileSync(join(extDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

execFileSync('zip', ['-rq', '../VandyScheduler.zip', '.'], { cwd: extDir });
console.log(`Safari extension ${manifest.version} written to ${extDir}`);
