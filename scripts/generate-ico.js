// Génère un .ico Windows avec le PNG existant
// Windows accepte les PNG encapsulés dans .ico depuis Vista
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const png = readFileSync(join(publicDir, 'icon-256.png'))

// Construire le .ico : en-tête + répertoire + données PNG
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)        // reserved
header.writeUInt16LE(1, 2)        // type = 1 (ICO)
header.writeUInt16LE(1, 4)        // count = 1

const dirEntry = Buffer.alloc(16)
dirEntry.writeUInt8(0, 0)         // width (0 = 256)
dirEntry.writeUInt8(0, 1)         // height (0 = 256)
dirEntry.writeUInt8(0, 2)         // colors
dirEntry.writeUInt8(0, 3)         // reserved
dirEntry.writeUInt16LE(1, 4)      // planes
dirEntry.writeUInt16LE(32, 6)     // bpp
dirEntry.writeUInt32LE(png.length, 8)  // image size
dirEntry.writeUInt32LE(22, 12)    // image offset (6 + 16)

const ico = Buffer.concat([header, dirEntry, png])
writeFileSync(join(publicDir, 'icon.ico'), ico)
console.log('✅ icon.ico created (' + ico.length + ' bytes)')
