# GoJob

**Dénicheur d'opportunités** — application desktop (Windows), *local-first*, qui centralise tes offres d'emploi provenant de plusieurs sources dans une seule interface.

GoJob récupère et regroupe les offres de **France Travail, Adzuna, Jooble, Reed** et de ta **boîte mail** (alertes IMAP), puis te laisse les explorer avec un tableau de bord (répartition par plateforme) et un moteur de recherche/filtres (mots-clés, source, ville, type de contrat, télétravail).

---

## Prérequis

- Node.js 20+
- npm 10+
- Windows 10 ou 11

## Installation (développement)

```bash
git clone <url-du-repo>
cd gojob
npm install
```

### Lancer en développement

```bash
npm run dev:electron
```

Lance Vite (serveur de dev) + Electron en parallèle, avec hot-reload.

### Construire l'exécutable

```bash
npm run electron:build
```

Génère dans le dossier **`release/`** :

- `GoJob Setup 1.0.0.exe` — **installateur** NSIS (choix du dossier, raccourcis bureau/menu démarrer)
- `GoJob.exe` — **version portable** (aucune installation)

> L'exécutable n'est pas signé : au premier lancement, Windows SmartScreen affichera « Éditeur inconnu » → *Informations complémentaires → Exécuter quand même*.
>
> Astuce : ferme les instances en cours avant de builder (`taskkill /f /im GoJob.exe`).

---

## Configurer les sources

Tout se fait **dans l'application**, onglet **Paramètres** — jamais dans un fichier.

| Source | Ce qu'il faut renseigner | Où l'obtenir |
|---|---|---|
| France Travail | Identifiants API (client) | Compte partenaire `francetravail.io` |
| Adzuna | Identifiants API (app) | `developer.adzuna.com` |
| Jooble | Clé API | `jooble.org` (API) |
| Reed | Clé API | `reed.co.uk/developers` |
| Boîte mail (IMAP) | Hôte, port, identifiant, mot de passe, TLS | Ton fournisseur mail |

Chaque source dispose d'un interrupteur d'activation et d'un bouton **« Tester la connexion »**. Une source désactivée disparaît partout (tableau de bord, compteurs, filtres).

⚠️ **Aucune clé n'est stockée dans un fichier `.env` ni dans l'exécutable.** Les secrets sont chiffrés via `safeStorage` d'Electron dans le dossier utilisateur de la machine. Une installation sur une autre machine démarre donc **sans aucune clé** — chacun configure les siennes.

---

## Structure du projet

```text
gojob/
├── electron/
│   ├── main.cjs         # Processus principal (fenêtre, IPC, safeStorage, connecteurs API)
│   ├── preload.cjs      # Pont sécurisé main ↔ renderer
│   └── dev-launch.cjs   # Lanceur Electron en développement
├── src/
│   ├── components/      # Composants React (onglets, sidebar, UI)
│   ├── store/           # Zustand (profil, offres, réglages)
│   ├── utils/           # Filtrage/normalisation des offres
│   └── i18n/            # Traductions (fr, es)
├── public/              # Assets (logo, favicon, icône)
├── build/               # Ressources d'installateur (electron-builder)
├── dist/                # Build Vite (généré)
└── release/             # Exécutables produits (généré)
```

---

## Sécurité

- `contextIsolation: true` + `nodeIntegration: false`
- Secrets (identifiants des sources) chiffrés via `safeStorage` d'Electron, hors du projet et hors du build
- CSP restrictive : seuls les assets locaux et les endpoints des sources autorisés
- Aucun fichier `.env` chargé ; l'export de données ne contient **jamais** les secrets

---

## Licence

Privé — usage personnel.
