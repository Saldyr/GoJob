// Garde anti-ELECTRON_RUN_AS_NODE : si cette variable est héritée de l'environnement
// (VS Code, terminal Hermes...), Electron démarre en Node pur et l'app crashe au lancement
// Garde anti-ELECTRON_RUN_AS_NODE...
if (process.env.ELECTRON_RUN_AS_NODE) {
  try {
    const { spawnSync } = require('child_process')
    const electronBin = require('electron')
    const cleanEnv = { ...process.env }
    delete cleanEnv.ELECTRON_RUN_AS_NODE
    const appDir = require('path').join(__dirname, '..')
    const result = spawnSync(electronBin, [appDir], { env: cleanEnv, stdio: 'inherit' })
    process.exit(result.status ?? 0)
  } catch { process.exit(1) }
}

// ── Piège à exceptions non rattrapées ──────────────────────────────────
// Évite qu'une erreur asynchrone (ex : timeout IMAP) ne fasse crasher l'app.
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message, err.stack?.split('\n').slice(0, 3).join('\n'))
})
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})

const { app, BrowserWindow, ipcMain, session, safeStorage, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const net = require('net')
const tls = require('tls')
const { ImapFlow } = require('imapflow')

let mainWindow = null

// CSP — stricte en production (exe packagé). En dev, Vite + React-Refresh injectent un
// script inline (préambule) + HMR (eval, websocket) : sans assouplissement, la CSP bloque
// le préambule -> "@vitejs/plugin-react can't detect preamble" -> écran blanc.
const CSP_PROD = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.deepseek.com https://api.groq.com https://api.openai.com https://api.francetravail.io https://entreprise.francetravail.fr; img-src 'self' data:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
const CSP_DEV = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:5173 http://localhost:5173 https://api.deepseek.com https://api.groq.com https://api.openai.com https://api.francetravail.io https://entreprise.francetravail.fr; img-src 'self' data:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"

// ===== VALIDATION =====
// Validation centralisée des payloads IPC pour éviter les données invalides accidentelles ou malveillantes.
function validatePayload(payload, schema) {
  if (!payload || typeof payload !== 'object') return { ok: false, erreur: 'Données invalides.' }
  for (const [key, rule] of Object.entries(schema)) {
    const val = payload[key]
    if (rule === 'required-string') {
      if (typeof val !== 'string' || val.trim() === '') return { ok: false, erreur: `Champ '${key}' requis.` }
    } else if (rule === 'optional-string') {
      if (val !== undefined && val !== null && typeof val !== 'string') return { ok: false, erreur: `Champ '${key}' doit être une chaîne.` }
    } else if (rule === 'required-number') {
      if (typeof val !== 'number' || isNaN(val)) return { ok: false, erreur: `Champ '${key}' doit être un nombre.` }
    } else if (rule === 'optional-number') {
      if (val !== undefined && val !== null && (typeof val !== 'number' || isNaN(val))) return { ok: false, erreur: `Champ '${key}' doit être un nombre.` }
    } else if (rule === 'boolean') {
      if (typeof val !== 'boolean') return { ok: false, erreur: `Champ '${key}' doit être un booléen.` }
    }
  }
  return null // null = OK
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 900,
    minHeight: 640,
    resizable: true,
    title: 'GoJob',
    icon: path.join(__dirname, '..', 'public', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = app.isPackaged ? CSP_PROD : CSP_DEV
    callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp] } })
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault()
  })

  // Charger les secrets IMMÉDIATEMENT, avant tout affichage
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('secrets-charges')
  })

  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => { if (mainWindow === null) createWindow() })

// ===== SAFE STORAGE =====
// Clé API et identifiants IMAP sont chiffrés via safeStorage d'Electron.
// L'export (voir plus bas) ne contient JAMAIS ces secrets.

const SECRETS_FILE = path.join(app.getPath('userData'), 'gojob-secrets.enc')

// Persistance des secrets: sauvegarde d'un objet { cleApi, franceTravailClientId, franceTravailClientSecret, imap }
ipcMain.handle('sauvegarder-secrets', async (_event, secrets) => {
  if (!secrets || typeof secrets !== 'object') return { ok: false, erreur: 'Données invalides.' }
  const json = JSON.stringify(secrets)
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(SECRETS_FILE, safeStorage.encryptString(json))
  } else {
    fs.writeFileSync(SECRETS_FILE, Buffer.from(json).toString('base64'))
  }
  return { ok: true }
})

ipcMain.handle('charger-secrets', async () => {
  try {
    if (!fs.existsSync(SECRETS_FILE)) return {}
    const data = fs.readFileSync(SECRETS_FILE)
    let json
    if (safeStorage.isEncryptionAvailable()) {
      json = safeStorage.decryptString(data)
    } else {
      json = Buffer.from(data.toString(), 'base64').toString('utf-8')
    }
    return JSON.parse(json)
  } catch {
    return {}
  }
})

// ===== FRANCE TRAVAIL =====
let franceTravailToken = null
let franceTravailTokenExpires = 0

ipcMain.handle('france-travail-connect', async (_event, { clientId, clientSecret, scope }) => {
  const err = validatePayload({ clientId, clientSecret }, { clientId: 'required-string', clientSecret: 'required-string' })
  if (err) return err
  // Nettoyage : un copier-coller depuis le portail France Travail ajoute souvent un espace
  // ou un retour-ligne → OAuth renvoie alors « invalid_client ». On retire ces blancs.
  clientId = (clientId || '').trim()
  clientSecret = (clientSecret || '').trim()
  try {
    const scopeFinal = scope || 'api_offresdemploiv2 o2dsoffre'
    const res = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scopeFinal,
      }),
    })
    const body = await res.text()
    if (!res.ok) {
      if (body.includes('invalid_client')) {
        throw new Error('Identifiants France Travail refusés (invalid_client). Vérifie le Client ID et le Client Secret : ils doivent provenir de la même application France Travail (avec l\'API « Offres d\'emploi v2 » activée), sans espace ni caractère manquant.')
      }
      throw new Error(`OAuth error ${res.status} — ${body}`)
    }
    const data = JSON.parse(body)
    franceTravailToken = data.access_token
    franceTravailTokenExpires = Date.now() + (data.expires_in || 3600) * 1000
    return { ok: true }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

ipcMain.handle('france-travail-offres', async (_event, { motsCles, localisation }) => {
  const err = validatePayload({}, {})
  if (err) return err
  try {
    if (!franceTravailToken || Date.now() > franceTravailTokenExpires) {
      return { ok: false, erreur: 'Non connecté à France Travail. Reconfigure tes identifiants.' }
    }

    // Logs console uniquement (jamais d'écriture fichier : illisible dans l'app packagée/asar).
    const log = (...args) => console.log('[FT]', ...args)
    log('recherche France Travail')

    // Résoudre localisation → code département
    let locCode = ''
    log('🔍 FT search - localisation reçue:', localisation)
    if (localisation && localisation.trim()) {
      const loc = localisation.trim()
      log('🔍 FT search - loc trim:', loc)
      if (/^\d{2,3}$/.test(loc)) {
        // Déjà un code département
        locCode = loc
        log('🔍 FT search - code département fourni:', locCode)
      } else if (/^\d{5}$/.test(loc)) {
        // Code INSEE → extraire les 2 premiers chiffres (département)
        locCode = loc.slice(0, 2)
        log('🔍 FT search - code INSEE → département:', locCode)
      } else {
        // Tentative de résolution via geo.api.gouv.fr → on demande le département
        try {
          log('🔍 FT search - appel geo API pour:', loc)
          const geoRes = await fetch(
            `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(loc)}&fields=code,codeDepartement&boost=population&limit=1`
          )
          log('🔍 FT search - geoRes status:', geoRes.status)
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            log('🔍 FT search - geoData:', JSON.stringify(geoData))
            if (geoData.length > 0) {
              // Priorité au code département
              locCode = geoData[0].codeDepartement || geoData[0].code.slice(0, 2)
              log('🔍 FT search - département trouvé:', locCode)
            }
          } else {
            log('🔍 FT search - geo pas ok')
          }
        } catch (e) {
          log('🔍 FT search - geo exception:', e.message)
        }
      }
    }
    log('🔍 FT search - code localisation final:', locCode)

    // Construire les paramètres GET
    const params = new URLSearchParams()
    if (motsCles) params.set('motsCles', motsCles)
    
    // Filtre localisation
    if (locCode) {
      if (/^\d{5}$/.test(locCode)) {
        params.set('commune', locCode)
        params.set('rayon', '10')
      } else {
        params.set('departement', locCode)
      }
    }

    log('🔍 FT search - URL:', `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`)
    log('🔍 FT search - token begins:', franceTravailToken.slice(0, 10) + '...')

    const res = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${franceTravailToken}`, Accept: 'application/json' },
      }
    )
    const jsonBody = await res.text()
    log('🔍 FT search - res status:', res.status)
    log('🔍 FT search - res body:', jsonBody)
    if (!res.ok) throw new Error(`API error ${res.status} — ${jsonBody}`)
    const data = JSON.parse(jsonBody)
    return {
      ok: true,
      offres: (data.resultats || []).map(o => ({
        id: o.id,
        titre: o.intitule || o.appellationCourt || 'Offre sans titre',
        entreprise: o.entreprise?.nom || o.contact?.nom || 'Entreprise non précisée',
        description: o.description || '',
        url: o.url ?? o.origineOffre?.urlReponse ?? (o.id ? `https://candidat.francetravail.fr/offres/recherche/detail/${o.id}` : ''),
        source: 'France Travail',
        dateAjout: new Date().toISOString(),
        ville: o.lieuTravail?.libelle || '',
        typeContrat: (o.typeContrat || '').toLowerCase() || undefined,
        remote: o.origineOffre?.teletravailPossible === true || false,
      })),
    }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

// ===== RECHERCHE EN LIGNE — connecteurs plateformes (API) =====
// Chaque connecteur renvoie des offres normalisées (clé gratuite requise par plateforme).

function offreEnLigne(o) {
  return {
    id: o.id,
    titre: o.titre || 'Offre',
    entreprise: o.entreprise || '',
    description: (o.description || '').slice(0, 2000),
    url: o.url || '',
    source: o.source,
    dateAjout: new Date().toISOString(),
    ville: o.ville || '',
    typeContrat: o.typeContrat || '',
    remote: !!o.remote,
    tags: o.tags || [],
  }
}

// --- Adzuna (FR/UK/ES/DE) ---
const ADZUNA_PAYS = { fr: 'FR', gb: 'UK', es: 'ES', de: 'DE' }
async function fetchAdzuna(appId, appKey, requete, localisation, pays) {
  appId = (appId || '').trim(); appKey = (appKey || '').trim()
  const params = new URLSearchParams({ app_id: appId, app_key: appKey, results_per_page: '50', what: requete, 'content-type': 'application/json' })
  if (localisation) params.set('where', localisation)
  const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${pays}/search/1?${params}`)
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Clés Adzuna invalides.')
    throw new Error(`Adzuna ${ADZUNA_PAYS[pays] || pays} : erreur ${res.status}`)
  }
  const data = await res.json()
  const label = ADZUNA_PAYS[pays] || pays.toUpperCase()
  return (data.results || []).map((o) => offreEnLigne({
    id: `adzuna-${o.id}`, titre: o.title, entreprise: o.company?.display_name || '',
    description: o.description || '', url: o.redirect_url || '', source: `Adzuna ${label}`,
    ville: o.location?.display_name || '', typeContrat: o.contract_type === 'permanent' ? 'cdi' : o.contract_type === 'contract' ? 'cdd' : '',
    remote: /remote|t[ée]l[ée]travail/i.test((o.title || '') + (o.description || '')),
  }))
}

// --- Jooble (agrégateur multi-pays) ---
async function fetchJooble(key, requete, localisation) {
  key = (key || '').trim()
  const res = await fetch(`https://jooble.org/api/${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: requete, location: localisation || '' }),
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Clé Jooble invalide.')
    throw new Error(`Jooble : erreur ${res.status}`)
  }
  const data = await res.json()
  return (data.jobs || []).slice(0, 50).map((j, i) => offreEnLigne({
    id: `jooble-${j.id || i}-${Date.now()}`, titre: j.title, entreprise: j.company || '',
    description: (j.snippet || '').replace(/<[^>]+>/g, ' '), url: j.link || '', source: 'Jooble',
    ville: j.location || '', remote: /remote|t[ée]l[ée]travail/i.test((j.title || '') + (j.snippet || '')),
  }))
}

// --- Reed (UK) ---
async function fetchReed(key, requete, localisation) {
  key = (key || '').trim()
  const params = new URLSearchParams({ keywords: requete, resultsToTake: '50' })
  if (localisation) params.set('locationName', localisation)
  const auth = Buffer.from(`${key}:`).toString('base64')
  const res = await fetch(`https://www.reed.co.uk/api/1.0/search?${params}`, { headers: { Authorization: `Basic ${auth}` } })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Clé Reed invalide.')
    throw new Error(`Reed : erreur ${res.status}`)
  }
  const data = await res.json()
  return (data.results || []).map((r) => offreEnLigne({
    id: `reed-${r.jobId}`, titre: r.jobTitle, entreprise: r.employerName || '',
    description: r.jobDescription || '', url: r.jobUrl || '', source: 'Reed UK', ville: r.locationName || '',
  }))
}

ipcMain.handle('chercher-en-ligne', async (_event, cfg) => {
  const { motsCles, localisation, adzunaAppId, adzunaAppKey, joobleKey, reedKey } = cfg || {}
  const requete = (motsCles || '').trim() || 'architecte'
  const offres = []
  const erreurs = []

  const lancer = async (fn) => {
    try { offres.push(...await fn()) } catch (e) { erreurs.push(e.message || 'Erreur connecteur') }
  }

  const taches = []
  if (adzunaAppId && adzunaAppKey) {
    for (const p of ['fr', 'gb', 'es', 'de']) {
      taches.push(lancer(() => fetchAdzuna(adzunaAppId, adzunaAppKey, requete, p === 'fr' ? localisation : '', p)))
    }
  }
  if (joobleKey) taches.push(lancer(() => fetchJooble(joobleKey, requete, localisation)))
  if (reedKey) taches.push(lancer(() => fetchReed(reedKey, requete, localisation)))

  await Promise.all(taches)
  return { ok: true, offres, erreurs, total: offres.length }
})

// Teste la clé d'une plateforme : lance une requête réelle ('architect') et renvoie le nombre d'offres.
// Une clé invalide fait remonter l'erreur du connecteur (401/403 → « Clé … invalide »).
ipcMain.handle('tester-cle', async (_event, cfg) => {
  const { plateforme, adzunaAppId, adzunaAppKey, joobleKey, reedKey } = cfg || {}
  try {
    let offres = []
    if (plateforme === 'adzuna') {
      if (!adzunaAppId || !adzunaAppKey) return { ok: false, erreur: 'Renseigne App ID et App Key.' }
      offres = await fetchAdzuna(adzunaAppId, adzunaAppKey, 'architect', '', 'gb')
    } else if (plateforme === 'jooble') {
      if (!joobleKey) return { ok: false, erreur: 'Renseigne la clé Jooble.' }
      offres = await fetchJooble(joobleKey, 'architect', '')
    } else if (plateforme === 'reed') {
      if (!reedKey) return { ok: false, erreur: 'Renseigne la clé Reed.' }
      offres = await fetchReed(reedKey, 'architect', '')
    } else {
      return { ok: false, erreur: 'Plateforme inconnue.' }
    }
    return { ok: true, count: offres.length }
  } catch (e) {
    return { ok: false, erreur: e.message || 'Erreur de connexion' }
  }
})

// ===== IMAP RÉEL =====
// Deux modes :
//   TLS (port 993) : tls.connect() direct — chiffré dès le handshake.
//   Non-TLS (port 143) : net.Socket + STARTTLS + LOGIN (LOGIN jamais en clair).
// Pour Gmail/Outlook : utiliser TLS 993 (recommandé et standard).

function escapeIMAP(str) {
  // RFC 3501 quoted-string : backslash et guillemet échappés
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

ipcMain.handle('imap-connect', async (_event, { host, port, user, password, tlsEnabled }) => {
  const err = validatePayload({ host, user, password }, { host: 'required-string', user: 'required-string', password: 'required-string' })
  if (err) return err
  host = host.trim()
  const portNum = port || 993
  // Port 993 = TLS implicite TOUJOURS. Port 143 = STARTTLS. Autres ports = selon la case TLS.
  const useTls = portNum === 143 ? false : (tlsEnabled !== false)

  return new Promise((resolve) => {
    let buffer = ''
    let authenticated = false
    let settled = false
    let step = 0 // 0=greeting, 2=STARTTLS envoyé, 3=upgrade TLS, 4/5=LOGIN, 6=LIST
    let sock = null
    let tag = 1

    const tagStr = () => `A${String(tag++).padStart(3, '0')}`
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (sock && !sock.destroyed) sock.destroy()
      resolve(result)
    }
    const send = (cmd) => { if (sock && !sock.destroyed) sock.write(cmd + '\r\n') }
    // Le mot de passe n'est JAMAIS envoyé avant la négociation TLS.
    const doLogin = () => send(`${tagStr()} LOGIN "${escapeIMAP(user)}" "${escapeIMAP(password)}"`)

    const timeout = setTimeout(() => {
      finish({ ok: false, erreur: `Pas de réponse de ${host}:${portNum} (15s). Vérifie l'hôte/port et que TLS correspond (993 = TLS coché, 143 = décoché).` })
    }, 15000)

    const onData = (data) => {
      buffer += data.toString()
      const lines = buffer.split('\r\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (step === 0 && line.startsWith('* OK')) {
          step = 1
          if (useTls) {
            // TLS implicite (port 993) : déjà chiffré, on s'authentifie directement
            doLogin()
            step = 5
          } else {
            // Port 143 sans TLS : STARTTLS d'abord
            send(`${tagStr()} STARTTLS`)
            step = 2
          }
        } else if (step === 2 && line.match(/^A\d{3} OK/i)) {
          // STARTTLS accepté → upgrade la socket (pas de LOGIN avant secureConnect)
          step = 3
          const rawSocket = sock
          sock = tls.connect({ socket: rawSocket, host, servername: host, rejectUnauthorized: true })
          sock.on('secureConnect', () => {
            rawSocket.removeListener('data', onData)
            sock.on('data', onData)
            doLogin()
            step = 4
          })
          sock.on('error', (e) => finish({ ok: false, erreur: 'Erreur TLS : ' + e.message }))
        } else if (step === 2 && line.match(/^A\d{3} (BAD|NO)/i)) {
          // STARTTLS refusé → on n'envoie JAMAIS LOGIN en clair
          finish({ ok: false, erreur: 'STARTTLS refusé par le serveur. Utilise le port 993 (TLS direct).' })
        } else if ((step === 4 || step === 5) && line.match(/^A\d{3} OK/i)) {
          // Réponse de succès au LOGIN (Gmail renvoie "OK ... authenticated", sans le mot LOGIN)
          authenticated = true
          send(`${tagStr()} LIST "" "*"`)
          step = 6
        } else if (step === 6 && line.match(/^A\d{3} OK/i)) {
          finish({ ok: true, message: `Connecté à ${host} (IMAP${useTls ? ' TLS' : ''})` })
        } else if (line.match(/^A\d{3} (NO|BAD)/i)) {
          const errPart = line.replace(/^A\d{3} (NO|BAD)\s*/i, '').trim()
          finish({ ok: false, erreur: 'IMAP : ' + (errPart || "échec d'authentification — pour Gmail, utilise un mot de passe d'application") })
        } else if (line.startsWith('* BYE')) {
          finish({ ok: false, erreur: 'Connexion fermée par le serveur' })
        }
      }
    }

    if (useTls) {
      sock = tls.connect({ host, port: portNum, servername: host, rejectUnauthorized: true })
    } else {
      sock = new net.Socket()
      sock.connect(portNum, host)
    }

    sock.on('data', onData)
    sock.on('error', (e) => finish({ ok: false, erreur: 'Erreur IMAP : ' + e.message }))
    sock.on('close', () => { if (!authenticated) finish({ ok: false, erreur: 'Connexion fermée avant authentification' }) })
  })
})

// ===== IMAP FETCH (imapflow) =====
// Récupère les emails des 30 derniers jours provenant des plateformes d'emploi
// connues (ALERT_SENDERS) et extrait les offres (titre + lien) depuis le HTML.
ipcMain.handle('imap-fetch-recent', async (_event, { host, port, user, password, tlsEnabled, maxEmails }) => {
  const err = validatePayload({ host, user, password }, { host: 'required-string', user: 'required-string', password: 'required-string' })
  if (err) return err
  host = host.trim()
  const portNum = port || 993
  // Port 993 = TLS implicite TOUJOURS. Port 143 = STARTTLS (secure:false). Autres = selon la case.
  const useTls = portNum === 143 ? false : (tlsEnabled !== false)
  const limit = maxEmails && maxEmails > 50 ? maxEmails : 150

  try {
    const client = new ImapFlow({
      host,
      port: portNum,
      secure: useTls,
      auth: { user, pass: password },
      logger: false,
    })
    client.on('error', (err) => {
      console.error('[IMAP] Erreur client:', err.message)
    })
    client.on('close', () => {
      // Nettoyage silencieux
    })

    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connexion IMAP trop longue (>20s)')), 20000)
      ),
    ])
    const lock = await client.getMailboxLock('INBOX')

    try {
      // Emails (lus OU non lus) des derniers jours provenant des plateformes d'emploi connues.
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // Union des UIDs par expéditeur connu (LinkedIn, Indeed, Meteojob, etc.)
      const uidSet = new Set()
      for (const dom of ALERT_SENDERS) {
        try {
          const found = await client.search({ since, from: dom }, { uid: true })
          if (Array.isArray(found)) found.forEach((u) => uidSet.add(u))
        } catch { /* expéditeur ignoré */ }
      }
      const allUids = [...uidSet]
      const list = []
      const seen = new Set() // déduplication par offre

      if (allUids.length > 0) {
        for await (const msg of client.fetch(allUids.join(','), { uid: true, envelope: true, source: true }, { uid: true })) {
          const env = msg.envelope || {}
          const sujet = env.subject || ''
          const fromAddr = (env.from && env.from[0] && env.from[0].address) || ''
          const sourceDefaut = detecterSourceDepuisSujet(sujet) || detecterSourceDepuisAdresse(fromAddr) || 'Email'

          let html = ''
          try { html = extraireHtml(msg.source.toString('utf-8')) } catch { html = '' }

          for (const j of extraireOffresDepuisHtml(html, sourceDefaut)) {
            const cle = cleOffre(j.url)
            if (seen.has(cle)) continue
            seen.add(cle)
            list.push({
              id: `imap-${msg.uid}-${list.length}-${Date.now()}`,
              titre: j.titre,
              entreprise: j.entreprise || '',
              description: '',
              ville: j.ville || '',
              source: j.source || sourceDefaut,
              dateAjout: new Date().toISOString(),
              url: j.url,
              typeContrat: '',
              remote: false,
              tags: [],
            })
            if (list.length >= limit) break
          }
          if (list.length >= limit) break
        }
      }

      return { ok: true, offres: list, total: allUids.length, uids: allUids }
    } finally {
      lock.release()
      await client.logout()
    }
  } catch (err) {
    return { ok: false, erreur: `Erreur IMAP : ${err.message}` }
  }
})

// === Expéditeurs d'alertes emploi (filtre de recherche IMAP) ===
const ALERT_SENDERS = [
  'linkedin.com', 'indeed.', 'meteojob.com', 'hellowork.com', 'hello-work.com',
  'welcometothejungle.com', 'wttj.co', 'apec.fr', 'jobijoba', 'glassdoor',
  'monster.', 'cadremploi.fr', 'regionsjob', 'talent.com', 'jobteaser.com',
  'pole-emploi', 'francetravail', 'leboncoin',
]

// Liens pointant vers une offre individuelle (pas les liens de pub/désabonnement)
const JOB_LINK = /(linkedin\.com\/(?:comm\/)?jobs\/view|indeed\.[a-z.]+\/(?:rc\/clk|viewjob|pagead|job|cmp)|meteojob\.com\/[^"']*(?:offre|emploi|job)|hello-?work\.com\/[^"']*emploi|welcometothejungle\.com\/[^"']*\/jobs\/|apec\.fr\/[^"']*(?:offre|detail)|jobijoba\.com\/[^"']*offre|glassdoor\.[a-z.]+\/[^"']*[Jj]ob|monster\.[a-z.]+\/[^"']*(?:job|emploi)|cadremploi\.fr\/[^"']*offre|leboncoin\.fr\/[^"']*offres)/i

// Textes d'ancre génériques à ignorer
const TEXTE_IGNORE = /^(voir|see all|view|postuler|apply|unsubscribe|se d[ée]sabonner|d[ée]sabonner|g[ée]rer|manage|toutes les offres|all jobs|plus d.offres|view all|en savoir plus|learn more|param[èe]tres|settings|aide|help|se connecter|sign in|t[ée]l[ée]charger|download)\b/i

function decodeHtmlEntities(s) {
  return s
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
}

function nettoyerTexte(s) {
  return decodeHtmlEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

// Décode et isole la partie text/html d'un email MIME brut
function extraireHtml(raw) {
  const idx = raw.search(/Content-Type:\s*text\/html/i)
  if (idx === -1) return raw
  const part = raw.slice(idx)
  const sep = part.search(/\r?\n\r?\n/)
  if (sep === -1) return raw
  const headers = part.slice(0, sep)
  let body = part.slice(sep).replace(/^\r?\n\r?\n/, '')
  const fin = body.search(/\r?\n--[-A-Za-z0-9_]+/)
  if (fin !== -1) body = body.slice(0, fin)
  const cte = (headers.match(/Content-Transfer-Encoding:\s*([\w-]+)/i) || [])[1] || ''
  if (/base64/i.test(cte)) {
    try { return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf-8') } catch { return body }
  }
  if (/quoted-printable/i.test(cte)) {
    return body.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  }
  return body
}

// Extrait les offres individuelles (titre + lien) depuis le HTML d'une alerte
function extraireOffresDepuisHtml(html, sourceDefaut) {
  if (!html) return []
  const jobs = []
  const vus = new Set()
  const anchorRe = /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = anchorRe.exec(html)) !== null) {
    const url = decodeHtmlEntities(m[1].trim())
    if (!JOB_LINK.test(url)) continue
    const titre = nettoyerTexte(m[2])
    if (!titre || titre.length < 4 || titre.length > 160) continue
    if (TEXTE_IGNORE.test(titre)) continue
    if (/^https?:/i.test(titre)) continue
    const cle = cleOffre(url)
    if (vus.has(cle)) continue
    vus.add(cle)
    jobs.push({ titre, url, source: detecterSourceDepuisUrl(url) || sourceDefaut, entreprise: '', ville: '' })
  }
  return jobs
}

// Clé de déduplication : id d'offre si extractible, sinon host+chemin
function cleOffre(url) {
  const li = url.match(/jobs\/view\/(\d+)/i); if (li) return 'li:' + li[1]
  const ind = url.match(/[?&]jk=([a-z0-9]+)/i); if (ind) return 'in:' + ind[1]
  try { const u = new URL(url); return (u.hostname + u.pathname).toLowerCase().replace(/\/+$/, '') } catch { return url.toLowerCase() }
}

function detecterSourceDepuisAdresse(addr) {
  const a = (addr || '').toLowerCase()
  if (a.includes('linkedin')) return 'LinkedIn'
  if (a.includes('indeed')) return 'Indeed'
  if (a.includes('hellowork') || a.includes('hello-work')) return 'HelloWork'
  if (a.includes('meteojob')) return 'Meteojob'
  if (a.includes('welcometothejungle') || a.includes('wttj')) return 'Welcome to the Jungle'
  if (a.includes('apec')) return 'APEC'
  if (a.includes('jobijoba')) return 'Jobijoba'
  if (a.includes('glassdoor')) return 'Glassdoor'
  if (a.includes('monster')) return 'Monster'
  if (a.includes('cadremploi')) return 'Cadremploi'
  if (a.includes('francetravail') || a.includes('pole-emploi')) return 'France Travail'
  if (a.includes('leboncoin')) return 'Leboncoin'
  return ''
}

// Sur une URL, on réutilise la même détection par sous-chaîne de domaine
function detecterSourceDepuisUrl(url) {
  return detecterSourceDepuisAdresse(url)
}

// Détecte la source depuis le sujet ou l'expéditeur
function detecterSourceDepuisSujet(sujet) {
  const s = sujet.toLowerCase()
  if (s.includes('linkedin')) return 'LinkedIn'
  if (s.includes('indeed')) return 'Indeed'
  if (s.includes('hello work') || s.includes('hellowork')) return 'HelloWork'
  if (s.includes('france travail') || s.includes('francetravail') || s.includes('pôle emploi') || s.includes('pole emploi')) return 'France Travail'
  if (s.includes('meteojob') || s.includes('météojob')) return 'Meteojob'
  if (s.includes('jobijoba')) return 'Jobijoba'
  if (s.includes('welcome') && s.includes('jungle')) return 'Welcome to the Jungle'
  if (s.includes('apec')) return 'APEC'
  if (s.includes('malt')) return 'Malt'
  if (s.includes('comet')) return 'Comet'
  return ''
}

// ── Ouvrir une URL externe ──────────────────────────────
ipcMain.handle('open-url', async (_event, url) => {
  if (typeof url === 'string' && url.startsWith('http')) shell.openExternal(url)
})
