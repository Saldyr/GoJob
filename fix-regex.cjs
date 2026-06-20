const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'electron', 'main.cjs')
let src = fs.readFileSync(filePath, 'utf8')

// On lit les octets pour comprendre exactement ce qu'on remplace
// Objectif: /^A\\\\d{3} OK LOGIN/i  →  /^A\\d{3} OK LOGIN/i
// En string JS: le fichier contient \\\\ (4 backslashes affichés en JSON)
// En réalité ce sont 2 backslashes dans le fichier: 0x5C 0x5C
// On veut 1 backslash: 0x5C

// Approche lisible: on cherche le pattern exact dans l'UTF-8
// Le fichier a: /^A\\\\d{3} OK LOGIN/i
//                   ^^-- 2 backslashes réels

// Trouvons les positions exactes
const loginIdx = src.indexOf('/^A\\\\d{3} OK LOGIN/i')
const listIdx  = src.indexOf('/^A\\\\d{3} OK LIST/i')

if (loginIdx === -1) {
  console.log('LOGIN regex NOT FOUND - already fixed?')
  console.log('Index LIST:', listIdx)
} else {
  // Remplacer les 2 backslashes par 1
  const before = src.slice(0, loginIdx + 3)  // up to "A"
  const after  = src.slice(loginIdx + 4)     // after first backslash
  src = before + '\\' + after
  console.log('LOGIN: fixed')
}

if (listIdx === -1) {
  console.log('LIST regex NOT FOUND - already fixed?')
} else {
  const before = src.slice(0, listIdx + 3)
  const after  = src.slice(listIdx + 4)
  src = before + '\\' + after
  console.log('LIST: fixed')
}

fs.writeFileSync(filePath, src, 'utf8')

// Vérification
const lines = src.split('\n')
console.log('L433:', JSON.stringify(lines[432]))
console.log('Test result:', /^A\\d{3} OK LOGIN/i.test('A002 OK LOGIN completed'))
