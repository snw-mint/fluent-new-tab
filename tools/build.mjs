/**
 * Fluent New Tab — Build Script
 * Copies static assets and minifies JS, JSON (_locales), and HTML for release builds.
 *
 * Usage:
 *   node tools/build.mjs           → dev build (copy only, no minification)
 *   node tools/build.mjs --release → full minification of all dist files
 *   node tools/build.mjs --clean   → clears target assets in dist/ before copying
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { resolve, join, extname, relative } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const dist = resolve(root, 'dist');
const isRelease = process.argv.includes('--release');
const isClean = process.argv.includes('--clean');

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

const copyMap = [
  ['manifest.json', 'manifest.json'],
  ['index.html', 'index.html'],
  ['assets', 'assets'],
  ['scripts', 'scripts'],
  ['_locales', '_locales'],
  ['setup', 'setup'],
];

for (const [from, to] of copyMap) {
  const dest = resolve(dist, to);
  if (isClean && existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(resolve(root, from), dest, {
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

const setupScriptsDir = resolve(dist, 'setup');
if (existsSync(setupScriptsDir)) {
  const jsSetupScripts = readdirSync(setupScriptsDir).filter(
    (f) => f.endsWith('.js') && !f.includes('.min.'),
  );

  for (const file of jsSetupScripts) {
    const full = join(setupScriptsDir, file);
    execSync(`npx terser "${full}" --compress --mangle --output "${full}"`, {
      stdio: 'inherit',
    });
    console.log(`  ✔ Script minified: setup/${file}`);
  }
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

// Minify JSON files in _locales/
minifyJsonDir(resolve(dist, '_locales'));

// Minify JSON files in setup/
minifyJsonDir(resolve(dist, 'setup'));

// Minify manifest.json
const manifestPath = resolve(dist, 'manifest.json');
try {
  const raw = readFileSync(manifestPath, 'utf8');
  writeFileSync(manifestPath, JSON.stringify(JSON.parse(raw)), 'utf8');
  console.log('  ✔ JSON minified: manifest.json');
} catch (e) {
  console.warn(`  ⚠ Could not minify manifest.json — ${e.message}`); //
}

function minifyHtmlFile(filePath) {
  try {
    let html = readFileSync(filePath, 'utf8');
    html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
    html = html.replace(/\s+/g, ' '); // Collapse whitespace
    html = html.replace(/>\s+</g, '><'); // Remove whitespace between tags
    html = html.trim(); // Trim leading/trailing whitespace

    writeFileSync(filePath, html, 'utf8');
    console.log(`  ✔ HTML minified: ${relative(dist, filePath)}`);
  } catch (e) {
    console.warn(
      `  ⚠ Could not minify HTML: ${relative(dist, filePath)} — ${e.message}`,
    );
  }
}

function minifyHtmlDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      minifyHtmlDir(full);
    } else if (extname(entry) === '.html') {
      minifyHtmlFile(full);
    }
  }
}

function minifyCssFile(filePath) {
  try {
    let css = readFileSync(filePath, 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comentários
    css = css.replace(/\s+/g, ' '); // Colapsa quebras de linha e espaços extras
    css = css.replace(/\s*([\{\}\:\;\,])\s*/g, '$1'); // Remove espaços em volta de caracteres de sintaxe
    css = css.replace(/;\}/g, '}'); // Remove o último ponto-e-vírgula antes de fechar a chave
    css = css.trim();

    writeFileSync(filePath, css, 'utf8');
    console.log(`  ✔ CSS minified: ${relative(dist, filePath)}`);
  } catch (e) {
    console.warn(
      `  ⚠ Could not minify CSS: ${relative(dist, filePath)} — ${e.message}`,
    );
  }
}

function minifyCssDir(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      minifyCssDir(full);
    } else if (extname(entry) === '.css') {
      minifyCssFile(full);
    }
  }
}

// Minify index.html
minifyHtmlFile(resolve(dist, 'index.html'));

// Minify HTML files in setup/ (if any)
if (existsSync(resolve(dist, 'setup'))) {
  minifyHtmlDir(resolve(dist, 'setup'));
  minifyCssDir(resolve(dist, 'setup'));
}

console.log('\n✅ Release build complete.');
