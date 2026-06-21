# SPEC — Refonte UI GoJob

> **Objectif** : Remplacer l'apparence « vieux logiciel / plat / tassé » par une UI moderne, professionnelle, aérée, avec de la profondeur, du mouvement et des couleurs qui claquent.

---

## 1. Ambiance visuelle cible

| Aspect | Cible |
|---|---|
| **Style** | Clean pro — inspiré Linear / Raycast / Notion |
| **Sensation** | Aérée, respirée, premium |
| **Profondeur** | Ombres marquées, cartes qui se détachent du fond |
| **Couleurs** | Teal (`--color-marine`) devient la couleur *primaire* ; orange (`--color-action`) devient *accent secondaire*. Le fond crème reste mais moins présent. |
| **Mouvement** | Micro-animations partout (hover, entrée, chargement) |

---

## 2. Palette — Nouveau système de couleurs (`index.css`)

### Changements majeurs

1. **`--color-marine` (teal) devient la couleur primaire** — boutons, liens, nav active, icônes principales
2. **`--color-action` (orange) devient l'accent secondaire** — badges, highlights, éléments « attention »
3. **Ajout de dégradés** pour les cartes et la sidebar
4. **Ombres doublées en intensité**
5. **`--color-creme` devient plus chaud** → `#f7f5f0`

### Nouvelles variables

```css
@theme {
  --font-sans: "Inter Variable", -apple-system, "Segoe UI", Roboto, sans-serif;

  /* --- PRIMAIRE : Teal (marine) --- */
  --color-marine: #0f766e;
  --color-marine-vif: #14b8a6;
  --color-marine-soft: #ccfbf1;      /* tint 15% */
  --color-marine-subtle: #f0fdfa;    /* tint 5% */

  /* --- ACCENT : Orange (action) --- */
  --color-action: #c2410c;
  --color-action-vif: #ea580c;
  --color-action-soft: #fff1ea;

  /* --- NEUTRES CHAUDS --- */
  --color-creme: #f7f5f0;             /* ← plus chaud qu'avant */
  --color-cacao: #1c1917;
  --color-taupe: #78716c;
  --color-bordure: #e7e5e4;
  --color-survol: #efede8;            /* ← légèrement plus chaud */

  /* --- ÉTATS (inchangés) --- */
  --color-vert-success: #16a34a;
  --color-rouge-error: #dc2626;
  --color-ambre-warn: #d97706;

  /* --- PROFONDEUR — ombres FORTES --- */
  --shadow-sm: 0 1px 2px rgba(28,25,23,0.06),
               0 4px 12px rgba(28,25,23,0.06);
  --shadow-md: 0 4px 12px rgba(28,25,23,0.10),
               0 12px 32px rgba(28,25,23,0.10);
  --shadow-lg: 0 8px 24px rgba(28,25,23,0.12),
               0 24px 48px rgba(28,25,23,0.10);
  --shadow-xl: 0 12px 36px rgba(28,25,23,0.16),
               0 32px 64px rgba(28,25,23,0.12);

  /* --- BORDURES ARRONDIES (constants, déjà bons) --- */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
```

> **Pourquoi `--shadow-lg` et `--shadow-xl` ?** Les cartes en `shadow-md` actuelles sont trop plates. Les ombres `lg/xl` servent : modales, panneaux info, cartes en hover. Les ombres utilisent `rgba(28,25,23, …)` = notre cacao, cohérent avec la palette chaude.

---

## 3. Nouveau système de layout (`App.tsx`)

### Actuel
```tsx
<main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-10">
  <div className="max-w-5xl mx-auto">
```

### Nouveau
```tsx
<main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto
                 p-6 lg:p-10 2xl:p-12
                 bg-gradient-to-br from-creme via-creme to-marine-subtle/40">
  <div className="max-w-6xl mx-auto">
```

### Quoi changer précisément

| Propriété | Avant | Après | Raison |
|---|---|---|---|
| `max-w-5xl` | 1024px | **`max-w-6xl`** (1152px) | Plus d'espace, moins tassé |
| `p-10` fixe | 40px | `p-6 lg:p-10 2xl:p-12` | Responsif, plus large en grand écran |
| Fond main | `bg-creme` uni | **dégradé subtil** `bg-gradient-to-br from-creme via-creme to-marine-subtle/40` | Apporte de la vie sans agresser |
| Sidebar bg | `#f0e7d8` (beige) | **`from-marine/5 to-creme` dégradé** | Sidebar moins terne |

---

## 4. Sidebar — Refonte (`Sidebar.tsx`)

### Actuel
```tsx
<aside className="w-64 min-w-[256px] h-screen bg-[#f0e7d8] flex flex-col border-r border-bordure shadow-sm">
```

### Nouveau
```tsx
<aside className="w-64 min-w-[256px] h-screen
                bg-gradient-to-b from-creme via-creme to-marine-subtle/60
                flex flex-col border-r border-bordure shadow-md">
```

### Nav items

| État | Avant | Après |
|---|---|---|
| Inactif | `text-cacao/70 hover:bg-white/60` | `text-taupe hover:bg-white/70 hover:text-cacao hover:shadow-sm` |
| Actif | `bg-action text-white shadow-sm` | **`bg-marine text-white shadow-md`** |
| Arrondi | `rounded-xl` | **`rounded-lg`** (moins arrondi = plus pro) |

Animation survol item nav :
```tsx
className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
  transition-all duration-150 ease-out
  ${currentTab === id
    ? 'bg-marine text-white shadow-md'
    : 'text-taupe hover:bg-white/70 hover:text-cacao hover:shadow-sm'
  }`}
```

> **Icones nav** : taille `size={18}` au lieu de `size={20}`. Texte en `text-sm` (14px) au lieu de `text-base` (16px). Plus compact, plus pro.

---

## 5. Composants UI — Changements

### 5.1 Carte (`Carte.tsx`)

```tsx
// AVANT
<section className="rounded-2xl bg-white border border-bordure shadow-sm p-7">

// APRÈS
<section className="rounded-xl bg-white/95 backdrop-blur-sm
                    border border-bordure/80 shadow-md p-6
                    transition-all duration-200 hover:shadow-lg
                    hover:border-bordure">
```

| Propriété | Avant | Après |
|---|---|---|
| `padding` | `p-7` (28px) | **`p-6`** (24px) |
| `rounded` | `rounded-2xl` (16px) | **`rounded-xl`** (12px) |
| `border` | `border-bordure` | **`border-bordure/80`** + **`hover:border-bordure`** |
| `shadow` | `shadow-sm` | **`shadow-md` hover → `shadow-lg`** |
| Fond | `bg-white` | **`bg-white/95 backdrop-blur-sm`** — verre subtil |
| Icône titre | `text-action` | **`text-marine`** |

### 5.2 Bouton (`Bouton.tsx`)

```tsx
// AVANT — primaire
bg-action text-white hover:bg-action-vif

// APRÈS — primaire (utilise marine)
bg-marine text-white hover:bg-marine-vif shadow-sm hover:shadow-md

// APRÈS — secondaire
bg-white border border-bordure/80 text-cacao hover:bg-survol hover:border-bordure shadow-sm
```

Ajouter un effet `active:scale-[0.97]` (déjà présent), mais augmenter la durée :
```tsx
const base = 'rounded-lg px-5 py-2.5 text-sm font-semibold
             shadow-sm transition-all duration-150
             active:scale-[0.97]
             focus-visible:ring-2 focus-visible:ring-marine/40
             disabled:opacity-50 disabled:cursor-not-allowed'
```

> **Changement** : `rounded-xl` → `rounded-lg`, `px-5 py-3` → `px-5 py-2.5` (moins haut). `focus-visible:ring-action/40` → `...ring-marine/40`.

### 5.3 Champ (`Champ.tsx`)

```tsx
// AVANT
"w-full px-4 py-3 rounded-xl border border-bordure bg-white text-cacao
 text-[15px] placeholder:text-taupe/70 focus:border-action focus:ring-2 focus:ring-action/15"

// APRÈS
"w-full px-4 py-2.5 rounded-lg border border-bordure/80 bg-white text-sm text-cacao
 placeholder:text-taupe/50 focus:border-marine focus:ring-2 focus:ring-marine/15
 transition-all duration-150"
```

> **Changement** : `py-3` → `py-2.5`, `rounded-xl` → `rounded-lg`, `text-[15px]` → `text-sm`, `focus:border-action` → `focus:border-marine`.

### 5.4 StatutBadge (`StatutBadge.tsx`)

```tsx
// AVANT
rounded-full px-3 py-1 text-xs font-medium

// APRÈS — ajouter un dot coloré à gauche
<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${styles[statut]}`}>
  <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[statut]}`} />
  {labels[statut] || statut}
</span>
```

Styles dots :
```ts
const dotStyles: Record<string, string> = {
  a_postuler: 'bg-taupe',
  postulee: 'bg-action',
  relancee: 'bg-action-vif',
  entretien: 'bg-marine-vif',
  acceptee: 'bg-vert-success',
  refus: 'bg-rouge-error',
}
```

> Le dot apporte de la lisibilité sans mot-clé pour les statuts.

### 5.5 Chip (`Chip.tsx`)

```tsx
// AVANT
"inline-flex items-center gap-1 bg-ambre/10 text-action text-sm px-3 py-1 rounded-xl font-medium"

// APRÈS
"inline-flex items-center gap-1.5 bg-marine-soft text-marine text-sm px-3 py-1 rounded-lg font-medium"
```

---

## 6. Espacements et grille — Cohérence

### Règle générale

| Usage | Valeur |
|---|---|
| Gap entre sections dans un onglet | `space-y-6` (au lieu de `space-y-8`) |
| Gap entre items dans une carte | `space-y-3` (inchangé) |
| Gap entre champs dans un grid | `gap-4` (au lieu de `gap-5`) |
| Padding carte | `p-6` (au lieu de `p-7`) |
| Padding main content | `p-6 lg:p-10` |
| Gap entre stats tiles | `gap-3` (au lieu de `gap-4`) |
| Gap grid offres | `gap-4` (inchangé) |

### Grid grand écran (2xl+)

```tsx
// Sur OngletAccueil — la grille des tuiles de stats
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
→ <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
```

### Formulaire d'ajout d'offre

```tsx
// AVANT
<div className="rounded-2xl bg-white border border-bordure shadow-sm p-6">

// APRÈS
<div className="rounded-xl bg-white/95 backdrop-blur-sm border border-bordure/80 shadow-md p-6">
```

---

## 7. Animations et transitions

### 7.1 Nouvelles animations CSS (dans `index.css`)

Ajouter à la fin :

```css
/* === MICRO-ANIMATIONS === */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(12px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-up { animation: fade-in-up 0.3s ease-out both; }
.animate-fade-in    { animation: fade-in 0.2s ease-out both; }
.animate-scale-in   { animation: scale-in 0.2s ease-out both; }
.animate-slide-in-right { animation: slide-in-right 0.25s ease-out both; }
```

### 7.2 Transition par défaut sur tous les éléments interactifs

```css
button, a, input, textarea, select {
  transition: all 0.15s ease-out;
}
```

(Remplacer les `transition-all` et `transition-colors` qui traînent — un seul `transition` global.)

### 7.3 Framer Motion — OngletAccueil

Actuellement :
```tsx
transition={{ duration: 0.22, ease: 'easeOut' }}
```

Nouveau :
```tsx
transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}  /* ease-out quintique */
```

### 7.4 Stagger des items (OngletAccueil)

```ts
// AVANT
staggerChildren: 0.06

// APRÈS
staggerChildren: 0.05, delayChildren: 0.08
```

### 7.5 Hover cartes

Actuellement quelques cartes ont `hover:shadow-md transition-shadow`. **Toutes** les cartes doivent avoir :

```tsx
className="... transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
```

### 7.6 Barre de défilement

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 3px;
  border: none;
}
::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
::-webkit-scrollbar-track { background: transparent; }
```

> Plus fine (6px au lieu de 10px), plus moderne.

---

## 8. Détail onglet par onglet

### 8.1 OngletAccueil

- **Tuile stats** : `rounded-xl bg-white/95 border border-bordure/80 shadow-md p-5 text-center` + `hover:shadow-lg hover:-translate-y-0.5`
- **Checklist onboarding** : idem, wrap dans une Carte
- **Cartes « Réponses reçues / À faire / Nouvelles offres / Vue d'ensemble »** : utiliser la Carte refaite
- **Actions rapides** : `gap-3` (au lieu de `gap-4`)

### 8.2 OngletOffres

- **Header** : icône en `text-marine` (pas `text-action`)
- **Bouton « Ajouter »** : primaire en `bg-marine`
- **État vide** : icône en `text-marine/40`, titre plus petit
- **Cartes offre** : `rounded-xl bg-white/95 border border-bordure/80 shadow-md p-5 hover:shadow-lg hover:-translate-y-0.5`
- **Statut badge** : utiliser le nouveau StatutBadge avec dot
- **Icône source** (les lettres dans le cercle) : remplacer le fond `bg-creme` par `bg-survol`

### 8.3 OngletCandidater

- **Sélecteur offre** : border plus fin `border-bordure/80`
- **Bouton « Générer »** : `bg-marine` (primaire)
- **Zone texte lettre** : `rounded-xl border border-bordure/80 bg-white/95 p-5` au lieu de `bg-creme`
- **Bouton « Copier »** : primaire en `bg-marine` ou secondaire avec bordure

### 8.4 OngletSuivi

- **Tuiles stats** : idem refonte des tuiles
- **Carte « Candidatures en cours »** : les items qui ont besoin de relance ont `bg-marine-subtle/60 border-marine/30` au lieu de `bg-ambre/5 border-ambre/30`
- **Bouton « Marquer comme relancée »** : `bg-marine`

### 8.5 OngletProfil

- **Cartes** : Carte refaite
- **Boutons « Ajouter »** : `bg-marine`
- **Bouton « Importer un CV »** : `bg-marine`
- **Bouton « Sauvegarder »** : `bg-marine`
- **Chips compétences/langues** : nouveau style Chip

### 8.6 OngletRéglages

- **Cartes** : Carte refaite
- **Présélection fournisseur** : l'item actif a une bordure `border-marine` au lieu de `border-ambre`
- **Check icon** : `text-marine` au lieu de `text-action`
- **Badge « Recommandé »** : `bg-marine text-white`
- **Boutons « Tester »** : secondaires avec `bg-white border border-bordure/80`
- **Bouton « Connecter France Travail / Tester IMAP »** : `bg-marine` (primaire)
- **Section sécurité** : `rounded-xl bg-white/95 backdrop-blur-sm border border-bordure/80 shadow-md p-6` au lieu de `bg-creme border shadow-sm` — la section sécurité doit ressembler à une carte normale

---

## 9. Résumé des changements par fichier

| Fichier | Changements |
|---|---|
| `src/index.css` | Nouvelles couleurs, ombres `lg`/`xl`, animations, transition globale, scrollbar |
| `src/App.tsx` | Fond dégradé, `max-w-6xl`, padding responsive, transition framer |
| `src/components/Sidebar.tsx` | Fond dégradé, nav actif `bg-marine`, icônes plus petites items |
| `src/components/ui/Carte.tsx` | `p-6 rounded-xl bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg` |
| `src/components/ui/Bouton.tsx` | Primaire `bg-marine`, `rounded-lg`, `py-2.5` |
| `src/components/ui/Champ.tsx` | `rounded-lg`, `py-2.5`, focus `marine` |
| `src/components/ui/StatutBadge.tsx` | Dot coloré, fonds ajustés |
| `src/components/ui/Chip.tsx` | `bg-marine-soft text-marine`, `rounded-lg` |
| `src/components/OngletAccueil.tsx` | Tuiles + cartes refaites + stagger ajusté |
| `src/components/OngletOffres.tsx` | Cartes refaites, icônes marine, statut avec dot |
| `src/components/OngletCandidater.tsx` | Cartes refaites, boutons marine |
| `src/components/OngletSuivi.tsx` | Tuiles + cartes + boutons marine, items relance en marine-soft |
| `src/components/OngletProfil.tsx` | Cartes + chips + boutons marine |
| `src/components/OngletReglages.tsx` | Cartes + presets marine + badges + section sécurité en carte |

---

## 10. Ordre d'implémentation recommandé

1. **`index.css`** — palette, ombres, animations, transition globale, scrollbar
2. **Composants UI** — Carte, Bouton, Champ, StatutBadge, Chip
3. **Sidebar** — dégradé, nav couleurs
4. **App.tsx** — layout, fond dégradé
5. **OngletAccueil** — cartes, tuiles, stagger
6. **Tous les autres onglets** — un par un (Offres, Candidater, Suivi, Profil, Réglages)

Chaque étape donne un résultat visible immédiatement. On peut s'arrêter à n'importe quelle étape et l'app sera déjà mieux qu'avant.
