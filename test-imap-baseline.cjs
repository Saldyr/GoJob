const fs = require('fs');

// Test escapeIMAP actuel
const src = fs.readFileSync('electron/main.cjs', 'utf8');
const escapeMatch = src.match(/function escapeIMAP\(str\) \{[\s\S]*?return (.+)/);
console.log('Escape line:', escapeMatch ? escapeMatch[1] : 'not found');

// Extraire la fonction exacte
const fnSrc = src.match(/function escapeIMAP\(str\) \{\s*[\s\S]*?\n\}/)?.[0];
console.log('Full function:', fnSrc);

// Évaluer
eval(fnSrc);

// Tests
const tests = [
  { input: 'simple', expected: 'simple' },
  { input: 'pass"word', expected: 'pass\\"word' },
  { input: 'back\\slash', expected: 'back\\\\slash' },
];

let allOk = true;
for (const { input, expected } of tests) {
  const result = escapeIMAP(input);
  const ok = result === expected;
  console.log(`escape("${input}") => "${result}" ${ok ? 'PASS' : `FAIL (expected "${expected}")`}`);
  if (!ok) allOk = false;
}

// Test regex
const reLogin = /^A\d{3} OK LOGIN/i;
const reList = /^A\d{3} OK LIST/i;
console.log('');
console.log('LOGIN "A002 OK LOGIN completed":', reLogin.test('A002 OK LOGIN completed') ? 'PASS' : 'FAIL');
console.log('LIST  "A003 OK LIST completed":',  reList.test('A003 OK LIST completed') ? 'PASS' : 'FAIL');

console.log(allOk ? '\n✅ ALL PASS' : '\n❌ FAIL');
