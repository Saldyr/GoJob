// Test des regex IMAP
const reLogin = /^A\d{3} OK LOGIN/i
const reList = /^A\d{3} OK LIST/i
const reNo = /^A\d{3} NO/i
const reBad = /^A\d{3} BAD/i

const tests = [
  ['A002 OK LOGIN completed', reLogin, true],
  ['a002 ok login', reLogin, true],
  ['A003 OK LIST completed', reList, true],
  ['A003 NO LOGIN failed', reNo, true],
  ['A003 BAD LOGIN', reBad, true],
  ['A9999 OK LOGIN extra', reLogin, false], // 4 digits, fail
  ['OK LOGIN', reLogin, false],
]

let allOk = true
for (const [line, re, expected] of tests) {
  const result = re.test(line)
  const ok = result === expected
  if (!ok) {
    console.log(`FAIL: "${line}" => ${result}, attendu ${expected}`)
    allOk = false
  } else {
    console.log(`PASS: "${line}" => ${result}`)
  }
}

// Test escapeIMAP
function escapeIMAP(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

const escapeTests = [
  ['simple', 'simple'],
  ['pass"word', 'pass\\"word'],
  ['back\\slash', 'back\\\\slash'],
  ['normal', 'normal'],
]

for (const [input, expected] of escapeTests) {
  const result = escapeIMAP(input)
  const ok = result === expected
  if (!ok) {
    console.log(`FAIL: escape("${input}") => "${result}", attendu "${expected}"`)
    allOk = false
  } else {
    console.log(`PASS: escape("${input}") => "${result}"`)
  }
}

console.log(allOk ? '\n✅ TOUS LES TESTS PASSENT' : '\n❌ ÉCHEC')
process.exit(allOk ? 0 : 1)
