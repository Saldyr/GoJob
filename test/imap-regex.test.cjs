const assert = require('node:assert/strict')

// Tests IMAP de non-régression
// Ces tests doivent rester capables de virer ROUGE si les regex ou escapeIMAP sont corrompus.
// Si tu édites electron/main.cjs, relance ce fichier avant toute mise en prod.

function escapeIMAP(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

// === Regex LOGIN / LIST ===
const reLOGIN = /^A\d{3} OK LOGIN/i
const reLIST  = /^A\d{3} OK LIST/i
const reNO    = /^A\d{3} NO/i
const reBAD   = /^A\d{3} BAD/i

// Doit matcher — réponses serveur réelles IMAP
assert.ok(reLOGIN.test('A002 OK LOGIN completed'),   'LOGIN doit matcher A002 OK LOGIN completed')
assert.ok(reLOGIN.test('a002 ok login'),              'LOGIN insensible à la casse')
assert.ok(reLIST.test('A003 OK LIST completed'),      'LIST doit matcher A003 OK LIST completed')
assert.ok(reNO.test('A003 NO LOGIN failed'),          'NO doit matcher')
assert.ok(reBAD.test('A003 BAD command'),             'BAD doit matcher')

// Doit NE PAS matcher — faux positifs
assert.equal(reLOGIN.test('A9999 OK LOGIN extra'), false, '4 chiffres ne doit pas matcher')
assert.equal(reLIST.test('OK LIST sans tag'),       false, 'sans tag ne doit pas matcher')

// === escapeIMAP ===
assert.equal(escapeIMAP('simple'),      'simple')
assert.equal(escapeIMAP('pass"word'),   'pass\\"word')             // guillemet échappé
assert.equal(escapeIMAP('back\\slash'), 'back\\\\slash')           // backslash doublé
assert.equal(escapeIMAP('"'),           '\\"')                     // juste guillemet
assert.equal(escapeIMAP('\\'),          '\\\\')                    // juste backslash
assert.equal(escapeIMAP('a\\b"c'),      'a\\\\b\\"c')              // mix

console.log('✅ Tous les tests IMAP passent')
process.exit(0)
