import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true });
}

const copyMap = [
  ['manifest.json', 'manifest.json'],
  ['index.html', 'index.html'],
  ['assets', 'assets'],
  ['scripts', 'scripts'],
  ['_locales', '_locales']
];

for (const [from, to] of copyMap) {
  cpSync(resolve(root, from), resolve(dist, to), { recursive: true, force: true });
}

console.log('Static extension files copied to dist/.');
