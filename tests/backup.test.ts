import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('isValidBackupPayload validation', () => {
  // Read src/script.ts
  const scriptContent = fs.readFileSync('src/script.ts', 'utf-8');

  // Extract the function using regex
  const functionRegex = /function isValidBackupPayload[\s\S]*?return true;\n}/;
  const match = scriptContent.match(functionRegex);

  if (!match) {
    throw new Error('Could not find isValidBackupPayload function in src/script.ts');
  }

  // Define BackupPayload for the transpile step to work without errors
  // but transpiling will just strip it anyway.
  const codeToTranspile = `
    type BackupPayload = Record<string, string | undefined>;
    ${match[0]}
    // Attach to global to make it accessible
    globalThis.isValidBackupPayload = isValidBackupPayload;
  `;

  // Transpile to JS
  const transpiled = ts.transpileModule(codeToTranspile, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;

  // Run in a VM context
  const context = vm.createContext({ globalThis: {} });
  vm.runInContext(transpiled, context);

  const isValidBackupPayload = context.globalThis.isValidBackupPayload;

  // Now test various payloads

  // Valid cases
  assert.strictEqual(isValidBackupPayload({}), true, 'Empty object should be valid');
  assert.strictEqual(isValidBackupPayload({ a: '1', b: '2' }), true, 'Object with string values should be valid');
  assert.strictEqual(isValidBackupPayload({ _backupDate: '2023-01-01T00:00:00.000Z' }), true, 'Object with _backupDate string should be valid');

  // Invalid cases
  assert.strictEqual(isValidBackupPayload(null), false, 'Null should be invalid');
  assert.strictEqual(isValidBackupPayload(undefined), false, 'Undefined should be invalid');
  assert.strictEqual(isValidBackupPayload([]), false, 'Array should be invalid');
  assert.strictEqual(isValidBackupPayload([{a: '1'}]), false, 'Array of objects should be invalid');
  assert.strictEqual(isValidBackupPayload("string"), false, 'Primitive string should be invalid');
  assert.strictEqual(isValidBackupPayload(123), false, 'Primitive number should be invalid');
  assert.strictEqual(isValidBackupPayload({ a: 1 }), false, 'Object with number value should be invalid');
  assert.strictEqual(isValidBackupPayload({ a: true }), false, 'Object with boolean value should be invalid');
  assert.strictEqual(isValidBackupPayload({ a: { b: '1' } }), false, 'Object with object value should be invalid');
  assert.strictEqual(isValidBackupPayload({ a: ['1'] }), false, 'Object with array value should be invalid');
});