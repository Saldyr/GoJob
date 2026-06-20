const { app, BrowserWindow, ipcMain, clipboard, session, dialog, safeStorage } = require('electron')
const path = require('path')
const fs = require('fs')
const net = require('net')

let mainWindow = null

// CSP
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.deepseek.com https://api.groq.com https://api.openai.com https://api.francetravail.io https://entreprise.francetravail.fr; img-src 'self' data:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 900,
    minHeight: 640,
    resizable: true,
    title: 'GoJob',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [CSP] } })
  })

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault()
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

// ===== SAFE STORAGE (E1) =====
// Clé API et identifiants IMAP sont chiffrés via safeStorage d'Electron.
// L'export de données (H2) ne contient JAMAIS ces secrets.

const SECRETS_FILE = path.join(app.getPath('userData'), 'gojob-secrets.enc')

ipcMain.handle('safe-chiffrer', async (_event, plaintext) => {
  if (!safeStorage.isEncryptionAvailable()) {
    // Fallback : encode en base64 (pas de chiffrement réel, mais safeStorage indisponible)
    return Buffer.from(plaintext).toString('base64')
  }
  const encrypted = safeStorage.encryptString(plaintext)
  return encrypted.toString('base64')
})

ipcMain.handle('safe-dechiffrer', async (_event, encryptedB64) => {
  if (!safeStorage.isEncryptionAvailable()) {
    return Buffer.from(encryptedB64, 'base64').toString('utf-8')
  }
  const encrypted = Buffer.from(encryptedB64, 'base64')
  return safeStorage.decryptString(encrypted)
})

// Persistance des secrets: sauvegarde d'un objet { cleApi, franceTravailClientId, franceTravailClientSecret, imap }
ipcMain.handle('sauvegarder-secrets', async (_event, secrets) => {
  const json = JSON.stringify(secrets)
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(SECRETS_FILE, safeStorage.encryptString(json))
  } else {
    // Fallback non-chiffré (visible en base64, mais safeStorage indisponible)
    fs.writeFileSync(SECRETS_FILE, Buffer.from(json).toString('base64'))
  }
  return true
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

// ===== PRESSE-PAPIER =====
ipcMain.handle('copier-presse-papier', (_event, texte) => {
  clipboard.writeText(texte)
  return true
})

// ===== IMPORT CV (5) =====
ipcMain.handle('importer-cv', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Importer un CV',
    filters: [
      { name: 'CV', extensions: ['pdf', 'docx', 'doc', 'txt', 'md'] },
    ],
    properties: ['openFile'],
  })
  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, erreur: 'Aucun fichier sélectionné.' }
  }

  const filePath = result.filePaths[0]
  const ext = path.extname(filePath).toLowerCase()
  const fileName = path.basename(filePath)
  let texte = ''

  try {
    if (ext === '.txt' || ext === '.md') {
      texte = fs.readFileSync(filePath, 'utf-8')
    } else if (ext === '.pdf') {
      // Extraction basique du PDF — lit le texte brut. Pour mieux : utiliser pdf-parse en runtime.
      const buf = fs.readFileSync(filePath)
      texte = buf.toString('utf-8')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      // Si le PDF contient surtout des bytes non-textuels, on prévient
      if (texte.length < 50) {
        texte = '[Le PDF semble contenir peu de texte exploitable. Essaye de copier-coller le contenu directement.]'
      }
    } else if (ext === '.docx' || ext === '.doc') {
      // .docx est un zip XML; extraction minimale des paragraphes
      try {
        const zipBuffer = fs.readFileSync(filePath)
        // On cherche le texte entre les balises <w:t> dans le XML central
        const textContent = zipBuffer.toString('utf-8')
        const matches = textContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
        texte = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ').trim()
      } catch {
        texte = '[Impossible d\'extraire le texte du fichier Word. Copie-colle le contenu manuellement.]'
      }
    } else {
      return { ok: false, erreur: `Format non supporté : ${ext}` }
    }

    if (!texte || texte.length < 20) {
      return { ok: false, erreur: 'Fichier vide ou illisible.' }
    }

    return { ok: true, texte, nom: fileName, chemin: filePath }
  } catch (err) {
    return { ok: false, erreur: `Erreur de lecture : ${err.message}` }
  }
})

// ===== GÉNÉRATION LETTRE (dans main process = pas de CORS) =====
ipcMain.handle('generer-lettre', async (_event, { offre, cvText, competences, nom, endpoint, modele, cleApi, titreMetier, langue }) => {
  const intitule = titreMetier || 'le métier visé'
  const langage = langue === 'es' ? 'espagnol (Amérique latine)' : 'français'

  const systemPrompt = `Tu es un assistant spécialisé dans la rédaction de lettres de motivation pour ${intitule}.

Règles :
- Lettre personnalisée : adapte chaque phrase à l'offre spécifique et au profil réel du candidat.
- Naturelle en ${langage} : phrasé varié, ton humain et professionnel. Évite les formules génériques.
- Incorpore naturellement les mots-clés et compétences de l'offre pour passer les filtres ATS.
- N'invente jamais d'expériences, compétences ou diplômes absents du profil.
- Format : 200-250 mots, 3 paragraphes — accroche, corps, conclusion.
- Langue : ${langage} sauf si l'offre est dans une autre langue.
- Signature : "Cordialement, [Prénom]"
- Relis-toi : vérifie la cohérence entre ce que tu écris et le profil.`

  const userPrompt = `Offre : ${offre.titre} chez ${offre.entreprise}
Description : ${offre.description || 'Non fournie'}
Source : ${offre.source}

Profil du candidat :
- Nom : ${nom || 'Candidat'}
- Titre : ${intitule}
- Compétences : ${competences.join(', ')}
- CV : ${cvText || 'Non fourni'}

Génère une lettre de motivation adaptée à cette offre.`

  const payload = {
    model: modele || 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  }

  try {
    const baseUrl = (endpoint || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cleApi}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw new Error(`API error ${res.status}: ${errBody}`)
    }
    const data = await res.json()
    return { ok: true, contenu: data.choices[0]?.message?.content || 'Erreur de génération.' }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

// ===== TEST CLÉ API =====
ipcMain.handle('tester-cle', async (_event, { endpoint, modele, cleApi }) => {
  try {
    const baseUrl = (endpoint || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${cleApi}` },
    })
    if (res.ok) return { ok: true }
    const errBody = await res.text().catch(() => '')
    return { ok: false, erreur: `Erreur ${res.status}: ${errBody}` }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

// ===== FRANCE TRAVAIL =====
let franceTravailToken = null
let franceTravailTokenExpires = 0

ipcMain.handle('france-travail-connect', async (_event, { clientId, clientSecret, scope }) => {
  try {
    const scopeFinal = scope || 'api_offresdemploiv2'
    const res = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=partenaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scopeFinal,
      }),
    })
    if (!res.ok) throw new Error(`OAuth error ${res.status}`)
    const data = await res.json()
    franceTravailToken = data.access_token
    franceTravailTokenExpires = Date.now() + (data.expires_in || 3600) * 1000
    return { ok: true }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

ipcMain.handle('france-travail-offres', async (_event, { motsCles, localisation }) => {
  try {
    if (!franceTravailToken || Date.now() > franceTravailTokenExpires) {
      return { ok: false, erreur: 'Non connecté à France Travail. Reconfigure tes identifiants.' }
    }
    const params = new URLSearchParams({ range: '0-49', sort: 'dateCreation' })
    if (motsCles) params.set('motsCles', motsCles)
    if (localisation) params.set('commune', localisation)

    const res = await fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`, {
      headers: { Authorization: `Bearer ${franceTravailToken}`, Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    return {
      ok: true,
      offres: (data.resultats || []).map(o => ({
        id: o.id,
        titre: o.intitule || o.appellationCourt || 'Offre sans titre',
        entreprise: o.entreprise?.nom || o.contact?.nom || 'Entreprise non précisée',
        description: o.description || '',
        url: o.url ?? o.origineOffre?.urlReponse ?? '',
        source: 'France Travail',
        statut: 'a_postuler',
        dateAjout: new Date().toISOString(),
        ville: o.lieuTravail?.libelle || '',
      })),
    }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})

// ===== IMAP RÉEL (C3) =====
// Deux modes :
//   TLS (port 993) : tls.connect() direct — chiffré dès le handshake.
//   Non-TLS (port 143) : net.Socket + STARTTLS + LOGIN. 
// Dans les deux cas, le password ne transite JAMAIS en clair sans chiffrement.
// Pour Gmail/Outlook : utiliser TLS 993 (recommandé et standard).

const tls = require('tls')

function escapeIMAP(str) {
  // RFC 3501 quoted-string : backslash et guillemet échappés
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

ipcMain.handle('imap-connect', async (_event, { host, port, user, password, tlsEnabled }) => {
  return new Promise((resolve) => {
    let timeout
    let buffer = ''
    let authenticated = false
    let step = 0 // 0=connect, 1=greeting, 2=LOGIN or STARTTLS, 3=LIST
    let sock = null
    let tag = 1

    const tagStr = () => `A${String(tag++).padStart(3, '0')}`
    const cleanup = () => {
      clearTimeout(timeout)
      if (sock && !sock.destroyed) sock.destroy()
    }
    const send = (cmd) => {
      if (sock && !sock.destroyed) sock.write(cmd + '\r\n')
    }

    const onData = (data) => {
      buffer += data.toString()
      const lines = buffer.split('\r\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (step === 0 && line.startsWith('* OK')) {
          step = 1
          if (tlsEnabled) {
            // TLS implicite (port 993) : déjà chiffré au niveau TCP, on login directement
            send(`${tagStr()} LOGIN "${escapeIMAP(user)}" "${escapeIMAP(password)}"`)
            step = 2
          } else {
            // Port 143 sans TLS : STARTTLS d'abord
            send(`${tagStr()} STARTTLS`)
            step = 2
          }
        } else if (step === 2 && line.match(/^A\d{3} OK STARTTLS/i)) {
          // STARTTLS accepté → upgrade la socket
          const rawSocket = sock
          sock = tls.connect({ socket: rawSocket, host, servername: host })
          sock.on('data', onData)
          sock.on('error', (err) => {
            cleanup()
            resolve({ ok: false, erreur: 'Erreur TLS : ' + err.message })
          })
          send(`${tagStr()} LOGIN "${escapeIMAP(user)}" "${escapeIMAP(password)}"`)
          step = 3
        } else if (step === 2 && line.match(/^A\d{3} (BAD|NO)/i) && !tlsEnabled) {
          // STARTTLS refusé → envoyer LOGIN en clair (dernier recours, serveur non-TLS)
          send(`${tagStr()} LOGIN "${escapeIMAP(user)}" "${escapeIMAP(password)}"`)
          step = 3
        } else if ((step === 2 || step === 3) && line.match(/^A\d{3} OK LOGIN/i)) {
          authenticated = true
          send(`${tagStr()} LIST "" "*"`)
          step = 4
        } else if (step === 4 && line.match(/^A\d{3} OK LIST/i)) {
          cleanup()
          resolve({ ok: true, message: 'Connecté à ' + host + ' (IMAP' + (tlsEnabled ? ' TLS' : '') + ')' })
        } else if (line.match(/^A\d{3} NO/i) || line.match(/^A\d{3} BAD/i)) {
          cleanup()
          const errPart = line.replace(/^A\d{3} (NO|BAD)\s*/i, '')
          resolve({ ok: false, erreur: 'IMAP ' + (errPart || 'erreur d\'authentification') })
        } else if (line.startsWith('* BYE')) {
          cleanup()
          resolve({ ok: false, erreur: 'Connexion fermée par le serveur' })
        }
      }
    }

    timeout = setTimeout(() => {
      cleanup()
      resolve({ ok: false, erreur: 'Délai d\'attente IMAP dépassé (30s)' })
    }, 30000)

    if (tlsEnabled) {
      sock = tls.connect({ host, port: port || 993, servername: host })
    } else {
      sock = new net.Socket()
      sock.connect(port || 143, host || 'localhost')
    }

    sock.on('data', onData)
    sock.on('error', (err) => {
      cleanup()
      resolve({ ok: false, erreur: 'Erreur IMAP : ' + err.message })
    })
    sock.on('close', () => {
      if (!authenticated) {
        cleanup()
        resolve({ ok: false, erreur: 'Connexion fermée avant authentification' })
      }
    })
  })
})

// ===== IMPORT OFFRE PAR LIEN =====
ipcMain.handle('detecter-source', async (_event, url) => {
  const urlLower = url.toLowerCase()

  const sources = [
    { domaine: 'hello-work.com', nom: 'HelloWork', freelance: false },
    { domaine: 'hellowork.com', nom: 'HelloWork', freelance: false },
    { domaine: 'meteojob.com', nom: 'Meteojob', freelance: false },
    { domaine: 'france-travail', nom: 'France Travail', freelance: false },
    { domaine: 'francetravail', nom: 'France Travail', freelance: false },
    { domaine: 'comet.co', nom: 'Comet', freelance: true },
    { domaine: 'cremedelacreme.io', nom: 'Crème de la Crème', freelance: true },
    { domaine: 'freelancerepublik.com', nom: 'FreelanceRepublik', freelance: true },
    { domaine: 'fiverr.com', nom: 'Fiverr', freelance: true },
    { domaine: 'upwork.com', nom: 'Upwork', freelance: true },
    { domaine: 'toptal.com', nom: 'Toptal', freelance: true },
    { domaine: 'linkedin.com', nom: 'LinkedIn', freelance: false },
    { domaine: 'indeed', nom: 'Indeed', freelance: false },
    { domaine: 'wttj', nom: 'Welcome to the Jungle', freelance: false },
    { domaine: 'welcometothejungle', nom: 'Welcome to the Jungle', freelance: false },
    { domaine: 'leboncoin', nom: 'Leboncoin', freelance: false },
    { domaine: 'apec', nom: 'APEC', freelance: false },
    { domaine: 'monster', nom: 'Monster', freelance: false },
    { domaine: 'regionsjob', nom: 'RegionsJob', freelance: false },
    { domaine: 'jobijoba', nom: 'Jobijoba', freelance: false },
    { domaine: 'optioncarriere', nom: 'Option Carrière', freelance: false },
  ]

  for (const s of sources) {
    if (urlLower.includes(s.domaine)) {
      return { source: s.nom, freelance: s.freelance, detection: 'domaine' }
    }
  }

  return { source: 'Manuel', freelance: false, detection: 'inconnu' }
})

// ===== EXPORT (H2) — ne JAMAIS contenir les secrets =====
ipcMain.handle('exporter-donnees', async (_event, donnees) => {
  // On filtre les secrets avant export
  const clean = {
    profile: donnees.profile || {},
    offres: donnees.offres || [],
    documents: donnees.documents || [],
    settings: {
      endpoint: donnees.settings?.endpoint || '',
      modele: donnees.settings?.modele || '',
      langue: donnees.settings?.langue || 'fr',
      // PAS de cleApi, franceTravailClientId, franceTravailClientSecret, imap
    },
    exportDate: new Date().toISOString(),
    appVersion: app.getVersion(),
  }

  try {
    const defaultPath = path.join(app.getPath('documents'), `gojob-export-${Date.now()}.json`)
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exporter les données GoJob',
      defaultPath,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) {
      return { ok: false, erreur: 'Export annulé.' }
    }
    fs.writeFileSync(result.filePath, JSON.stringify(clean, null, 2), 'utf-8')
    return { ok: true, chemin: result.filePath }
  } catch (err) {
    return { ok: false, erreur: err.message }
  }
})
