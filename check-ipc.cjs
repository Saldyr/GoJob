const fs = require('fs');
const main = fs.readFileSync('electron/main.js', 'utf8');
const preload = fs.readFileSync('electron/preload.js', 'utf8');
const api = fs.readFileSync('src/utils/api.ts', 'utf8');
const store = fs.readFileSync('src/store/useStore.ts', 'utf8');

console.log('=== main.js ===');
console.log('generer-lettre IPC:', main.includes("ipcMain.handle('generer-lettre'") ? 'OK' : 'FAIL');
console.log('copier-presse-papier IPC:', main.includes("ipcMain.handle('copier-presse-papier'") ? 'OK' : 'FAIL');
console.log('fetch dans handler:', main.includes('fetch(') ? 'OK' : 'FAIL');
console.log('endpoint params:', main.includes('endpoint ||') ? 'OK' : 'FAIL');
console.log('cleApi params:', main.includes('cleApi') ? 'OK' : 'FAIL');
console.log('modele params:', main.includes('modele ||') ? 'OK' : 'FAIL');

console.log('');
console.log('=== preload.js ===');
console.log('contextBridge:', preload.includes('contextBridge.exposeInMainWorld') ? 'OK' : 'FAIL');
console.log('genererLettre:', preload.includes('genererLettre') ? 'OK' : 'FAIL');
console.log('copierPressePapier:', preload.includes('copierPressePapier') ? 'OK' : 'FAIL');

console.log('');
console.log('=== api.ts (renderer) ===');
console.log('electronAPI detection:', api.includes('window as unknown') ? 'OK' : 'FAIL');
console.log('IPC path:', api.includes('electronAPI.genererLettre') ? 'OK' : 'FAIL');
console.log('fallback fetch:', api.includes('fetch(') ? 'OK' : 'FAIL');
console.log('plus de clé inline Vite:', !api.includes('VITE_DEEPSEEK_API_KEY') ? 'OK (runtime only)' : 'FAIL');

console.log('');
console.log('=== store useStore.ts ===');
console.log('settings interface:', store.includes('settings:') ? 'OK' : 'FAIL');
console.log('cleApi:', store.includes('cleApi') ? 'OK' : 'FAIL');
console.log('endpoint:', store.includes('endpoint') ? 'OK' : 'FAIL');
console.log('modele:', store.includes('modele') ? 'OK' : 'FAIL');
console.log('updateSettings:', store.includes('updateSettings') ? 'OK' : 'FAIL');
console.log('save settings localStorage:', store.includes('s.settings') ? 'OK' : 'FAIL');
console.log('load settings localStorage:', store.includes('parsed.settings') ? 'OK' : 'FAIL');
