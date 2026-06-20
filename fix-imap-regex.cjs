const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'electron', 'main.cjs')
let src = fs.readFileSync(filePath, 'utf8')

// L.433 : /^A\\\\d{3} OK LOGIN/i  →  /^A\\d{3} OK LOGIN/i
// L.437 : /^A\\\\d{3} OK LIST/i   →  /^A\\d{3} OK LIST/i
// Le correctif : enlever un niveau d'échappement dans les regex.

let count = 0
// Avant : /^A\\\\d{3} OK LOGIN/i  (fichier source)
// Après :  /^A\\d{3} OK LOGIN/i   (fichier source)
src = src.replace(
  /\(\/\\\^A\\\\\\\\d\{3\} OK LOGIN\/i\)/,
  '(/^A\\\\d{3} OK LOGIN/i)'
)
count++

src = src.replace(
  /\(\/\\\^A\\\\\\\\d\{3\} OK LIST\/i\)/,
  '(/^A\\\\d{3} OK LIST/i)'
)
count++

fs.writeFileSync(filePath, src, 'utf8')
console.log(`✅ ${count} regex corrigée(s)`)

// Vérification
const lines = src.split('\n')
console.log('L433:', JSON.stringify(lines[432]))
console.log('L437:', JSON.stringify(lines[436]))

// Test
const reLogin = /^A\\d{3} OK LOGIN/i
const reList = /^A\\d{3} OK LIST/i
console.log('Test LOGIN A002 OK LOGIN completed:', reLogin.test('A002 OK LOGIN completed'))
console.log('Test LIST  A003 OK LIST completed:',  reList.test('A003 OK LIST completed'))
