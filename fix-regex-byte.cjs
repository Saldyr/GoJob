const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'electron', 'main.cjs')

// Lire en Buffer pour manipuler les octets exacts
const buf = fs.readFileSync(filePath)
const src = buf.toString('utf8')

// Le pattern qu'on cherche: 2 backslashes suivis de d{3}
// En bytes: 0x5C 0x5C 0x64 0x7B 0x33 0x7D
const patternLogin = Buffer.from([0x5C, 0x5C, 0x64, 0x7B, 0x33, 0x7D])  // \\d{3}
const patternList  = Buffer.from([0x5C, 0x5C, 0x64, 0x7B, 0x33, 0x7D])  // \\d{3}

function replaceBytes(buf, search, replace) {
  const idx = buf.indexOf(search)
  if (idx === -1) return null
  const result = Buffer.alloc(buf.length - search.length + replace.length)
  buf.copy(result, 0, 0, idx)
  replace.copy(result, idx)
  buf.copy(result, idx + replace.length, idx + search.length)
  return result
}

// On remplace \\d{3} par \d{3} dans TOUT le fichier (les deux regex et les autres)
const searchBytes = Buffer.from([0x5C, 0x5C, 0x64, 0x7B, 0x33, 0x7D])  // \\d{3}
const replaceBytesVal = Buffer.from([0x5C, 0x64, 0x7B, 0x33, 0x7D])     // \d{3}

let result = buf
let count = 0
// Ne remplacer que les occurrences qui sont dans des regex de LOGIN/LIST et non dans les autres regex (NO/BAD)
// Plus simple: remplacer TOUTES les occurrences de \\d{3} par \d{3} dans les regex seulement
// En fait remplaçons les 2 occurrences spécifiques

// Le contexte: on veut les \\d{3} qui sont dans /^A\\\\d{3} OK LOGIN/i et /^A\\\\d{3} OK LIST/i
// Ces patterns ont 2 backslashes, réparons-les un par un en trouvant "OK LOGIN" et "OK LIST" puis en remontant

// Trouver les occurrences de 'OK LOGIN' et 'OK LIST'
const str = src
const loginIdxInStr = str.lastIndexOf('/^A\\\\d{3} OK LOGIN/i')
const listIdxInStr  = str.lastIndexOf('/^A\\\\d{3} OK LIST/i')

console.log('LOGIN pattern starts at char:', loginIdxInStr)
console.log('LIST pattern starts at char:', listIdxInStr)

if (loginIdxInStr !== -1) {
  const slice = str.slice(loginIdxInStr, loginIdxInStr + 25)
  console.log('LOGIN slice:', JSON.stringify(slice))
  // Bytes de ce slice
  console.log('LOGIN bytes:', Buffer.from(slice))
}

if (listIdxInStr !== -1) {
  const slice = str.slice(listIdxInStr, listIdxInStr + 24)
  console.log('LIST slice:', JSON.stringify(slice))
  console.log('LIST bytes:', Buffer.from(slice))
}

// Le remplacement par buffer positionnel
// Position en bytes (UTF-8 safe car tout est ASCII ici)
const byteLoginIdx = Buffer.byteLength(str.slice(0, loginIdxInStr), 'utf8')
const byteListIdx  = Buffer.byteLength(str.slice(0, listIdxInStr), 'utf8')

console.log('LOGIN byte position:', byteLoginIdx)
console.log('LIST byte position:', byteListIdx)

// Le pattern \\d{3} en bytes dans le fichier commence à byteLoginIdx + 3 (après /^A)
const loginTargetIdx = byteLoginIdx + 3
const listTargetIdx  = byteListIdx + 3

console.log('Target bytes before fix login:', buf.slice(loginTargetIdx, loginTargetIdx + 6))
console.log('Target bytes before fix list:',  buf.slice(listTargetIdx, listTargetIdx + 6))

// Remplacer byte par byte
buf[loginTargetIdx + 1] = 0x64  // sauter le 2e backslash, écrire 'd' directement au 2e byte
// En fait c'est plus simple: décaler tout le contenu après
// Remplaçons \\d{3} (6 bytes) par \d{3} (5 bytes) en décalant
function removeByteAt(buf, pos) {
  const result = Buffer.alloc(buf.length - 1)
  buf.copy(result, 0, 0, pos)
  buf.copy(result, pos, pos + 1)
  return result
}

// Enlever le 2e backslash à chaque position
let fixed = buf

if (loginIdxInStr !== -1) {
  fixed = removeByteAt(fixed, byteLoginIdx + 4)  // enlever le 2e backslash après 'A'
  console.log('LOGIN fixed, new length:', fixed.length)
}

if (listIdxInStr !== -1) {
  const listBytePos = Buffer.byteLength(str.slice(0, listIdxInStr), 'utf8')
  fixed = removeByteAt(fixed, listBytePos + 4)
  console.log('LIST fixed, new length:', fixed.length)
}

fs.writeFileSync(filePath, fixed)

// Vérification post-fix
const after = fs.readFileSync(filePath, 'utf8')
const lines = after.split('\n')
console.log('L433 apres:', JSON.stringify(lines[432]))
console.log('L437 apres:', JSON.stringify(lines[436]))

const reLogin = /^A\\d{3} OK LOGIN/i
const reList  = /^A\\d{3} OK LIST/i
console.log('Test LOGIN A002 OK LOGIN completed:', reLogin.test('A002 OK LOGIN completed'))
console.log('Test LIST  A003 OK LIST completed:',  reList.test('A003 OK LIST completed'))
