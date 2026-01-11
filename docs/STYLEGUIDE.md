# HostelGuide - Style Guide

> Design system et conventions pour le projet

---

## Système de Theming

Le thème est défini via `settings.json` (champ `theme`: `"light"` ou `"dark"`).
Les couleurs sont injectées dynamiquement dans le CSS via `BaseLayout.astro`.

### Configuration dans settings.json

```json
{
  "theme": "dark",           // "light" ou "dark"
  "primaryColor": "#2563eb", // Optionnel: override la couleur accent
  "accentColor": "#f59e0b"   // Optionnel: couleur secondaire
}
```

---

## Palettes de Couleurs

### Light Mode

| Élément | Nom | Hex | Usage |
|---------|-----|-----|-------|
| Fond | Pearl White | `#F8F9FA` | Surface principale |
| Surface | Pure White | `#FFFFFF` | Cards et menus |
| Surface Input | Light Gray | `#E5E7EB` | Inputs, chips |
| Texte Principal | Deep Slate | `#1A202C` | Haute lisibilité |
| Texte Secondaire | Cool Grey | `#718096` | Sous-titres, icônes |
| Muted | Gray | `#9CA3AF` | Texte désactivé |
| Bordure | Black 5% | `rgba(0,0,0,0.05)` | Bordures subtiles |
| Bordure Light | Black 10% | `rgba(0,0,0,0.1)` | Bordures visibles |
| Accent | Thai Teal | `#008080` | Couleur par défaut |

### Dark Mode

| Élément | Nom | Hex | Usage |
|---------|-----|-----|-------|
| Fond | Midnight Ocean | `#0F172A` | Bleu très foncé |
| Surface | Deep Navy | `#1E293B` | Élévation des composants |
| Surface Input | Slate | `#334155` | Inputs, chips |
| Texte Principal | Cloud Grey | `#F1F5F9` | Doux pour les yeux |
| Texte Secondaire | Muted Blue | `#94A3B8` | Infos secondaires |
| Muted | Slate Gray | `#64748B` | Texte désactivé |
| Bordure | White 5% | `rgba(255,255,255,0.05)` | Bordures subtiles |
| Bordure Light | White 10% | `rgba(255,255,255,0.1)` | Bordures visibles |
| Accent | Bright Aqua | `#2DD4BF` | Version lumineuse |

### Variables CSS

| Variable | Light | Dark |
|----------|-------|------|
| `--color-bg` | `#F8F9FA` | `#0F172A` |
| `--color-surface` | `#FFFFFF` | `#1E293B` |
| `--color-surface-input` | `#E5E7EB` | `#334155` |
| `--color-text` | `#1A202C` | `#F1F5F9` |
| `--color-text-secondary` | `#718096` | `#94A3B8` |
| `--color-muted` | `#9CA3AF` | `#64748B` |
| `--color-border` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.05)` |
| `--color-border-light` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` |
| `--color-primary` | Thai Teal ou custom | Bright Aqua ou custom |

### Couleurs Sémantiques (fixes)

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--color-success` | `#22c55e` | États de succès |
| `--color-warning` | `#f59e0b` | Avertissements |
| `--color-error` | `#ef4444` | Erreurs, urgence |

### Typographie

**Font principale** : Plus Jakarta Sans (Google Fonts)

| Style | Weight | Size | Usage |
|-------|--------|------|-------|
| Display | 800 | 1.875rem (30px) | Titres hero |
| Heading 1 | 700 | 1.375rem (22px) | Titres de section |
| Heading 2 | 700 | 1.125rem (18px) | Titres de cards |
| Body | 400 | 1rem (16px) | Texte courant |
| Body Small | 400 | 0.875rem (14px) | Descriptions |
| Caption | 500 | 0.75rem (12px) | Labels, metadata |
| Micro | 700 | 0.625rem (10px) | Nav labels, badges |

### Icônes

**Material Symbols Outlined** (Google Fonts)

Configuration par défaut :
```css
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```

Icône filled (états actifs) :
```css
font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```

Icônes utilisées :
- Navigation : `home`, `explore`, `calendar_month`, `menu_book`
- Actions : `arrow_back`, `content_copy`, `directions`, `chat`
- Catégories : `restaurant`, `local_bar`, `hiking`, `local_laundry_service`, `directions_bus`
- Info : `wifi`, `schedule`, `lock`, `emergency`, `gavel`

### Spacing & Border Radius

| Variable | Valeur | Usage |
|----------|--------|-------|
| `--radius` | 0.5rem (8px) | Petits éléments |
| `--radius-lg` | 1rem (16px) | Buttons, inputs |
| `--radius-xl` | 1.5rem (24px) | Cards |
| `--radius-2xl` | 2rem (32px) | Large cards |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows & Effects

```css
/* Card shadow */
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);

/* Primary button glow */
box-shadow: 0 0 15px rgba(19, 200, 236, 0.3);

/* Backdrop blur (headers, nav) */
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

---

## Composants

### Buttons

```html
<!-- Primary -->
<button class="btn-primary">Label</button>

<!-- Secondary -->
<button class="btn-secondary">Label</button>

<!-- Ghost -->
<button class="btn-ghost">
  <span class="material-symbols-outlined">icon</span>
</button>
```

### Cards

```html
<!-- Standard card -->
<div class="card">Content</div>

<!-- Elevated card (with shadow) -->
<div class="card-elevated">Content</div>
```

### Badges

Types de badges :
- **Default** : `bg-primary/10 text-primary`
- **Success** : `bg-green-500/20 text-green-300`
- **Warning** : `bg-orange-500/20 text-orange-300`
- **Info** : `bg-blue-500/20 text-blue-300`
- **Purple** : `bg-purple-500/20 text-purple-300`

```html
<span class="rounded-md bg-green-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300">
  Label
</span>
```

### Filter Chips

```html
<!-- Active -->
<button class="flex h-9 items-center rounded-xl bg-primary px-5 shadow-[0_0_10px_rgba(19,200,236,0.3)]">
  <span class="text-[--color-bg] text-sm font-bold">All</span>
</button>

<!-- Inactive -->
<button class="flex h-9 items-center rounded-xl bg-surface-input px-5">
  <span class="text-white text-sm font-medium">Label</span>
</button>
```

---

## Conventions de nommage

### Fichiers

| Type | Convention | Exemple |
|------|------------|---------|
| Composants Astro | PascalCase | `SpotCard.astro`, `WiFiCard.astro` |
| Composants UI | PascalCase dans `/ui` | `ui/Icon.astro`, `ui/Button.astro` |
| Pages | kebab-case | `index.astro`, `spot/[id].astro` |
| Utilitaires TS | camelCase | `content.ts`, `deeplinks.ts` |
| JSON content | kebab-case | `settings.json`, `house-rules.md` |
| Images | kebab-case | `pad-thai-heaven.jpg` |

### Code

| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `const spotData = ...` |
| Constantes | UPPER_SNAKE | `const MAX_SPOTS = 50` |
| Types/Interfaces | PascalCase | `interface Spot { }` |
| Fonctions | camelCase | `function getSpots()` |
| CSS classes | kebab-case | `.spot-card`, `.action-btn` |
| CSS variables | --kebab-case | `--color-primary` |
| JSON keys | camelCase | `{ "hostelName": "..." }` |

---

## Structure des fichiers

### Composant Astro typique

```astro
---
// 1. Imports
import BaseLayout from '../layouts/BaseLayout.astro';
import type { Spot } from '../lib/types';

// 2. Props interface
interface Props {
  spot: Spot;
  showBadge?: boolean;
}

// 3. Destructure props
const { spot, showBadge = false } = Astro.props;

// 4. Data fetching / logic
const formattedPrice = formatPrice(spot.priceRange);
---

<!-- 5. Template -->
<article class="card">
  <h2 class="text-lg font-bold">{spot.name}</h2>
  {showBadge && <span class="badge">{spot.cuisineType}</span>}
</article>

<!-- 6. Styles (scoped) -->
<style>
  /* Scoped styles */
</style>

<!-- 7. Scripts (si nécessaire) -->
<script>
  // Client-side JS minimal
</script>
```

---

## TypeScript

### Règles

- **Strict mode** activé (`"strict": true`)
- **Pas de `any`** — utiliser `unknown` si type inconnu
- **Interfaces pour objets** — `interface Spot { }` pas `type Spot = { }`
- **Types explicites** pour fonctions publiques
- **Optionnel avec `?`** — pas `| undefined`

---

## Accessibilité

### Règles minimales

1. **Contraste AA** — ratio 4.5:1 pour texte normal
2. **Alt text** — sur toutes les images informatives
3. **Labels** — sur tous les éléments de formulaire
4. **Focus visible** — ne pas supprimer les outlines
5. **Sémantique** — utiliser les bonnes balises HTML

### Touch targets

```css
/* Minimum 44x44px pour les éléments interactifs */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

---

## Performance

### Guidelines

1. **Images** — Utiliser `loading="lazy"` sur images below-the-fold
2. **JS minimal** — Astro par défaut n'envoie pas de JS
3. **Fonts** — Preconnect aux Google Fonts
4. **Icons** — Material Symbols avec subset si possible

### Objectifs Lighthouse

| Métrique | Cible |
|----------|-------|
| Performance | > 90 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 90 |

---

## Commits

### Format Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring (pas de nouvelle feature ni fix) |
| `chore` | Maintenance, dépendances, config |

### Scope suggérés

- `home` — Page d'accueil
- `spots` — Système de spots (cards, detail)
- `events` — Calendrier et événements
- `ui` — Composants UI réutilisables
- `layout` — Layout et navigation
- `theme` — Theming et styles
