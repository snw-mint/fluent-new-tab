/**
 * Fluent New Tab — Build Script
 * Copies static assets and minifies JS, JSON (_locales), and HTML for release builds.
 *
 * Usage:
 *   node tools/build.mjs           → dev build (copy only, no minification)
 *   node tools/build.mjs --release → full minification of all dist files
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, join, extname, relative } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const dist = resolve(root, 'dist');
const isRelease = process.argv.includes('--release');

// ─── Step 1: Ensure dist exists ───────────────────────────────────────────────
if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

// ─── Step 2: Copy static files ────────────────────────────────────────────────
const copyMap = [
  ['manifest.json', 'manifest.json'],
  ['index.html',    'index.html'],
  ['assets',        'assets'],
  ['scripts',       'scripts'],
  ['_locales',      '_locales'],
];

for (const [from, to] of copyMap) {
  cpSync(resolve(root, from), resolve(dist, to), { recursive: true, force: true });
}

console.log('✔  Static extension files copied to dist/.');

if (!isRelease) {
  console.log('ℹ  Dev build complete (no minification). Use --release for full minification.');
  process.exit(0);
}

// ─── Step 3: Release — minify everything ──────────────────────────────────────
console.log('🔧 Release build: minifying all dist files…');

// 3a. Minify compiled JS files with terser (already compiled from TS)
const jsTargets = [
  'dist/script.js',
];

for (const target of jsTargets) {
  const full = resolve(root, target);
  if (!existsSync(full)) continue;
  execSync(`npx terser "${full}" --compress --mangle --output "${full}"`, { stdio: 'inherit' });
  console.log(`  ✔ JS minified: ${target}`);
}

// 3b. Minify plain JS scripts (i18n.js, theme-loader.js — skip already-minified sortable)
const scriptsDir = resolve(dist, 'scripts');
const jsScripts = readdirSync(scriptsDir).filter(f =>
  f.endsWith('.js') && !f.includes('.min.')
);

for (const file of jsScripts) {
  const full = join(scriptsDir, file);
  execSync(`npx terser "${full}" --compress --mangle --output "${full}"`, { stdio: 'inherit' });
  console.log(`  ✔ Script minified: scripts/${file}`);
}

// 3c. Minify _locales JSON (remove whitespace — saves ~25-35% per file)
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

// 3d. Minify manifest.json
const manifestPath = resolve(dist, 'manifest.json');
try {
  const raw = readFileSync(manifestPath, 'utf8');
  writeFileSync(manifestPath, JSON.stringify(JSON.parse(raw)), 'utf8');
  console.log('  ✔ JSON minified: manifest.json');
} catch (e) {
  console.warn(`  ⚠ Could not minify manifest.json — ${e.message}`);
}

// 3e. Minify index.html (strip HTML comments and collapse whitespace between tags)
const htmlPath = resolve(dist, 'index.html');
try {
  let html = readFileSync(htmlPath, 'utf8');

  // Remove HTML comments (but NOT IE conditionals — not used here)
  html = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');

  // Collapse runs of whitespace between tags to a single space
  html = html.replace(/>\s{2,}</g, '> <');

  // Trim leading/trailing whitespace on each line and remove blank lines
  html = html
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('');

  writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✔ HTML minified: index.html');
} catch (e) {
  console.warn(`  ⚠ Could not minify index.html — ${e.message}`);
}

console.log('\n✅ Release build complete.');
