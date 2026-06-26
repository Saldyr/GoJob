// Lance Electron en neutralisant ELECTRON_RUN_AS_NODE.
// Sans ça, si la variable est héritée de l'environnement (VS Code/Hermes),
// Electron démarre comme Node pur => require('electron') renvoie un chemin,
// `app` est undefined, et l'app crash au lancement.
const path = require('path')
const { spawn } = require('child_process')
const electronPath = require('electron') // hors Electron, require('electron') = chemin du binaire
const appDir = path.join(__dirname, '..') // racine projet (contient package.json)

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electronPath, [appDir], { stdio: 'inherit', env })
child.on('close', (code) => process.exit(code == null ? 0 : code))
