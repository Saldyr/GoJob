# GoJob

Assistant de recherche d'emploi intelligent — desktop, Windows, local-first.

Gère tes candidatures, importe ton CV, connecte France Travail, et génère des lettres de motivation personnalisées avec un LLM de ton choix.

---

## Prérequis

- Node.js 20+
- npm 10+
- Windows 10 ou 11

## Installation (pour toi, développeur)

```bash
git clone <url-du-repo>
cd gojob
npm install
```

### Lancer en développement

```bash
npm run dev:electron
```

Ça lance Vite (serveur web) + Electron en parallèle. Modifie le code, ça hot-reload.

### Builder l'installeur .exe

```bash
npm run electron:build
```

L'installeur NSIS (Setup.exe) est créé dans `C:/projets/release/`. L'utilisatrice double-clique et c'est installé.

> **Important** : tue toujours les processus Electron avant de builder :
> ```cmd
> taskkill /f /im electron.exe
> taskkill /f /im GoJob.exe
> ```

---

## Configurer la clé API (LLM)

Tu fais ça **dans l'application** :

1. Lance GoJob
2. Va dans l'onglet **Réglages**
3. Renseigne ta clé API DeepSeek (ou autre fournisseur compatible OpenAI)
4. Clique sur « Tester la connexion »

⚠️ **Ne mets jamais ta clé dans un fichier `.env`** — GoJob ne lit aucun fichier de configuration. La clé est stockée chiffrée via `safeStorage` d'Electron et n'apparaît dans aucun export de données.

### Fournisseurs gratuits / peu chers

| Fournisseur | Endpoint | Modèle | Coût |
|---|---|---|---|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` | Gratuit (quota) |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Gratuit (limité req/min) |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` | Payant (très faible) |

---

## Réception automatique des offres

- **France Travail** : connecte-toi via l'onglet Réglages avec les identifiants API France Travail de ton compte partenaire. La récupération se fait en temps réel.
- **HelloWork, Meteojob, Comet, FreelanceRepublik, LinkedIn, etc.** : activable par alerte email IMAP (configurable dans Réglages) ou en ajoutant manuellement le lien de l'offre.

---

## Structure du projet

```
gojob/
├── electron/
│   ├── main.js          # Processus principal Electron (IPC, fenêtre, safeStorage)
│   └── preload.js       # Pont sécurisé entre main et renderer
├── src/
│   ├── components/      # Composants React (onglets, sidebar, etc.)
│   ├── store/           # Zustand store (profil, offres, réglages)
│   ├── utils/           # API LLM, utilitaires
│   └── i18n/            # Traductions (fr, es)
├── dist/                # Build Vite (généré)
├── build/               # Assets de build (icône, etc.)
└── package.json
```

---

## Sécurité

- `contextIsolation: true` + `nodeIntegration: false` + sandbox
- Clé API et identifiants IMAP chiffrés via `safeStorage` d'Electron
- CSP restrictive : seuls les assets locaux et les endpoints API autorisés
- Export de données : ne contient **jamais** les secrets (clé API, identifiants)
- Aucun fichier `.env` jamais chargé

---

## Licence

Private — usage personnel.
