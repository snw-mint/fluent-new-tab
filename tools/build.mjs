/**
 * Fluent New Tab — Build Script
 * Copies static assets and minifies JS, JSON (_locales), and HTML for release builds.
 *
 * Usage:
 *   node tools/build.mjs           → dev build (copy only, no minification)
 *   node tools/build.mjs --release → full minification of all dist files
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { resolve, join, extname, relative } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const dist = resolve(root, 'dist');
const isRelease = process.argv.includes('--release');

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

const copyMap = [
  ['manifest.json', 'manifest.json'],
  ['index.html', 'index.html'],
  ['assets', 'assets'],
  ['scripts', 'scripts'],
  ['_locales', '_locales'],
];

for (const [from, to] of copyMap) {
  cpSync(resolve(root, from), resolve(dist, to), {
    recursive: true,
    force: true,
  });
}

console.log('✔  Static extension files copied to dist/.');

if (!isRelease) {
  console.log(
    'ℹ  Dev build complete (no minification). Use --release for full minification.',
  );
  process.exit(0);
}

console.log('🔧 Release build: minifying all dist files…');

const jsTargets = ['dist/script.js'];

for (const target of jsTargets) {
  const full = resolve(root, target);
  if (!existsSync(full)) continue;
  execSync(`npx terser "${full}" --compress --mangle --output "${full}"`, {
    stdio: 'inherit',
  });
  console.log(`  ✔ JS minified: ${target}`);
}

const scriptsDir = resolve(dist, 'scripts');
const jsScripts = readdirSync(scriptsDir).filter(
  (f) => f.endsWith('.js') && !f.includes('.min.'),
);

for (const file of jsScripts) {
  const full = join(scriptsDir, file);
  execSync(`npx terser "${full}" --compress --mangle --output "${full}"`, {
    stdio: 'inherit',
  });
  console.log(`  ✔ Script minified: scripts/${file}`);
}

function minifyJsonDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      minifyJsonDir(full);
    } else if (extname(entry) === '.json') {
      try {
        const raw = readFileSync(full, 'utf8');
        const minified = JSON.stringify(JSON.parse(raw));
        writeFileSync(full, minified, 'utf8');
        console.log(`  ✔ JSON minified: ${relative(dist, full)}`);
      } catch (e) {
        console.warn(`  ⚠ Could not minify JSON: ${full} — ${e.message}`);
      }
    }
  }
}

minifyJsonDir(resolve(dist, '_locales'));

const manifestPath = resolve(dist, 'manifest.json');
try {
  const raw = readFileSync(manifestPath, 'utf8');
  writeFileSync(manifestPath, JSON.stringify(JSON.parse(raw)), 'utf8');
  console.log('  ✔ JSON minified: manifest.json');
} catch (e) {
  console.warn(`  ⚠ Could not minify manifest.json — ${e.message}`);
}

const htmlPath = resolve(dist, 'index.html');
try {
  let html = readFileSync(htmlPath, 'utf8');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/\s+/g, ' ');
  html = html.replace(/>\s+</g, '><');
  html = html.trim();

  writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✔ HTML minified: index.html');
} catch (e) {
  console.warn(`  ⚠ Could not minify index.html — ${e.message}`);
}

console.log('\n✅ Release build complete.');
