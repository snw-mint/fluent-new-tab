import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as vm from 'node:vm';
import * as ts from 'typescript';
import test from 'node:test';

test('sanitizeUrl securely sanitizes URLs', () => {
  const code = fs.readFileSync('./src/core/dom-utils.ts', 'utf8');
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  });

  const context = vm.createContext({
    window: { location: { href: 'http://localhost' } },
    document: {},
    URL: URL,
    console: console
  });

  vm.runInContext(result.outputText, context);

  // Dangerous
  assert.strictEqual(context.sanitizeUrl('javascript:alert(1)'), '#');
  assert.strictEqual(context.sanitizeUrl('  javascript:alert(1)'), '#');
  assert.strictEqual(context.sanitizeUrl('java\x00script:alert(1)'), '#');
  assert.strictEqual(context.sanitizeUrl('javascript://%250Aalert(1)'), '#');
  assert.strictEqual(context.sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.strictEqual(context.sanitizeUrl('vbscript:msgbox(1)'), '#');
  assert.strictEqual(context.sanitizeUrl('file:///etc/passwd'), '#');

  // Safe
  assert.strictEqual(context.sanitizeUrl('http://example.com'), 'http://example.com');
  assert.strictEqual(context.sanitizeUrl('https://example.com'), 'https://example.com');
  assert.strictEqual(context.sanitizeUrl('ftp://example.com'), 'ftp://example.com');
  assert.strictEqual(context.sanitizeUrl('mailto:test@example.com'), 'mailto:test@example.com');

  // Relative URLs
  assert.strictEqual(context.sanitizeUrl('/relative/path'), '/relative/path');
  assert.strictEqual(context.sanitizeUrl('relative/path'), 'relative/path');
  assert.strictEqual(context.sanitizeUrl('?query=1'), '?query=1');
  assert.strictEqual(context.sanitizeUrl('#hash'), '#hash');

  // Invalid/Empty
  assert.strictEqual(context.sanitizeUrl(null), '#');
  assert.strictEqual(context.sanitizeUrl(undefined), '#');
  assert.strictEqual(context.sanitizeUrl(''), '#');
});
