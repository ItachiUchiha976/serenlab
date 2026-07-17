# SérénLab — Système de design (référence)

> **À LIRE AVANT TOUTE ÉDITION du site `serenlabboutique.fr`** (repo `ItachiUchiha976/serenlab`).
> Ce document décrit le design RÉEL du site, extrait de `styles.css`, `bos-modern.css`, `bos-promo.js`, `bos-reveal.js`, `bos-retractation.js` et des pages HTML (17/07/2026). Tout futur agent / Claude Code doit s'y conformer : ne rien inventer, étendre dans ce langage visuel.

**Identité** : SérénLab = boutique bien-être **sommeil & détente**, sœur de la chaîne YouTube **Havre Sonore** (sons d'ambiance). Ambiance : douceur, calme, nuit apaisée (ZZZ, lune, halos, vagues sonores). Mobile-first. 100 % français.

---

## 1. Palette (source : `styles.css :root` — utiliser les variables, jamais de hex en dur)

| Variable | Hex | Rôle |
|---|---|---|
| `--bleu` | `#4a86a8` | Couleur principale : CTA, liens actifs, logo, prix panier, barre de progression quiz |
| `--bleu-clair` | `#6ba3be` | Hover des CTA, accents, wave bars, bordure encart description |
| `--bleu-pale` | `#e6f2f8` | Fonds doux : badges héro, icônes, options quiz sélectionnées, tags |
| `--vert` | `#7a9d7b` | Secondaire « confiance » : livraison offerte, checks de réassurance, succès formulaires |
| `--vert-pale` | `#e7f0e7` | Fond icônes vertes, encarts succès |
| `--beige` | `#c8996a` | Badge produit vedette (`.product-badge-hero`), callout box, checkout stub |
| `--beige-pale` | `#f7f0e6` | Fond sections crème, dégradés héro |
| `--creme` | `#fafaf8` | **Fond du body** |
| `--bg-light` | `#f0f5f8` | Sections claires, fonds d'images produit, tableaux |
| `--text-dark` | `#2a3440` | Titres, texte fort, fond footer et sections sombres |
| `--text-med` | `#546070` | Paragraphes (`p` par défaut) |
| `--text-light` | `#8a9caa` | Métadonnées, notes, catégories produit |
| `--border` | `#dce8ed` | Toutes les bordures 1-2px |
| `--danger` | `#e05555` | Suppression panier |
| `--success` | `#4caf50` | États de succès |

Couleurs ponctuelles hors variables (existantes, ne pas généraliser au-delà de leur usage) :
- `#EEF6FB` — bleu très pâle de l'encart description produit (`.product-subtitle`, `bos-modern.css`).
- Dégradé bloc Havre Sonore (section sombre) : `#18293a → #253f55 → #18303f`.
- Étoiles d'avis : `#f59e0b`.
- Reflet animé du titre héro (`.hero-title em`) : `#3a6d8a / #6ba3be / #a8d4e8`.
- Overlays JS mutualisés 5 boutiques (barre promo, modale rétractation) : violet `#6366f1 → #8b5cf6 → #a855f7` + `rgba(30,27,75,.82)`. **C'est voulu** (composants standard cross-boutiques) — ne pas les « corriger » aux couleurs SérénLab.

## 2. Typographies (rôles réels)

| Famille | Chargement | Rôle |
|---|---|---|
| **Playfair Display** (600, 700) | Google Fonts, toutes pages | `--f-title` : h1-h4, logo, prix (`.price-main`, `.price-current`), numéros d'étapes, stats. Serif élégante = côté « laboratoire du sommeil » premium. |
| **Poppins** (400, 500, 600) | Google Fonts, toutes pages | `--f-body` : corps, boutons, formulaires, nav. Fallback `'Segoe UI', system-ui, sans-serif`. |
| **Nunito** (400, 600) | Google Fonts, **fiches produit uniquement** | **Typo distinctive des descriptions produit (ajoutée 17/07/2026)** : `.product-subtitle` = encart doux fond `#EEF6FB`, `border-left: 3px solid var(--bleu-clair)`, `border-radius: 14px`, `padding: 1rem 1.25rem`, `::first-line` en 600. Police arrondie = âme « douceur / sommeil ». Si tu crées une fiche produit, charge Nunito dans le `<head>` et garde cet encart. |
| System stack (`-apple-system…`) | inline JS | Overlays mutualisés uniquement (promo, rétractation). |

Échelle : `h1 clamp(1.8rem,5vw,3rem)` · `h2 clamp(1.45rem,4vw,2.25rem)` · `h3 clamp(1.1rem,3vw,1.45rem)` · corps `line-height 1.6-1.75`.

## 3. Espacements, rayons, ombres, breakpoints

- **Tokens** : `--r: 12px` (boutons, inputs, cartes simples) · `--r2: 24px` (grandes cartes, cartes produit, CTA `--lg`) · `--t: .25s ease` (transition standard) · `--max-w: 1200px`.
- **Ombres** : `--shadow: 0 2px 20px rgba(42,100,140,.09)` (repos) · `--shadow2: 0 6px 40px rgba(42,100,140,.16)` (hover). Teinte bleutée, jamais de noir pur.
- **Rythme vertical** : `.section { padding: 4rem 0 }` (5.5rem ≥1024px) ; `.container { padding: 0 1.25rem }` ; gaps de grilles 1.15–1.75rem.
- **Breakpoints (mobile-first)** : `640px` (grilles ×2, formulaire email en ligne) · `768px` (héro/fiche produit 2 colonnes, footer 4 colonnes, la barre ATC sticky disparaît) · `1024px` (nav desktop, produits ×4, promesses ×3).

## 4. Composants récurrents

- **Boutons `.btn`** : `.btn--primary` (fond `--bleu`, hover `--bleu-clair` + `translateY(-1px)` + ombre bleue ; reflet blanc qui balaie au hover via `::after` dans `bos-modern.css`) · `.btn--secondary` (contour bleu 2px, hover fond `--bleu-pale`) · `.btn--green` (vert livraison) · modificateurs `--lg` (radius `--r2`) et `--full`. BEM **double tiret** (`.btn--primary`, PAS `.btn-primary`).
- **Carte produit `.product-card`** : radius `--r2`, bordure `--border`, image sur fond `--bg-light` h.200px ; hover = `translateY(-8px)` + double ombre + voile dégradé bas d'image. Badge vedette `.product-badge-hero` (pill beige, uppercase).
- **Badges / pills** : `.hero-badge` et `.tag` = pill `--bleu-pale`/`--bleu`, 50px, uppercase, letter-spacing .5px.
- **Topbar** : bandeau `--bleu` texte blanc — annonce HONNÊTE (« Livraison offerte en France — 12 à 20 jours ouvrés »).
- **Barre promo −10 % permanente** (`bos-promo.js`) : sticky top, dégradé violet, texte « −10 % sur le produit le plus cher… appliquée automatiquement, sans code ». Source de vérité **unique** du calcul : `window.BOS_PROMO.discount(cart)` (affichage panier = montant facturé PayPal/Stripe). Aucun chrono, aucune expiration.
- **Pastille rétractation** (`bos-retractation.js`) : lien fixe bas-gauche `#bos-retract-link` (obligation légale) + modale de confirmation. Quand la barre ATC mobile est ouverte, elle remonte (`body.bos-atc-open #bos-retract-link { bottom: 88px }`).
- **Barre d'achat sticky mobile** `.bos-sticky-atc` : construite par `bos-reveal.js` à partir du 1er `.add-to-cart-btn` (proxy du vrai bouton, zéro logique dupliquée), visible <768px seulement quand le CTA principal est hors écran.
- **Header** : sticky, fond `rgba(250,250,248,.95)` + blur, auto-masquant au scroll (classe `bos-nav-hidden`, jamais quand le menu mobile est ouvert).
- **Menu mobile** : plein écran `translateX`, `z-index: 2000` (> header 1000), `overflow-y: auto`, liens en Playfair 1.5rem.
- **Divers** : FAQ accordéon (`+` qui pivote 45°), toast sombre bas-centré, wave bars animées (bloc Havre Sonore), quiz sommeil (progress bar bleue, options pill), tableaux specs à lignes alternées `--bg-light`.
- **Hiérarchie z-index existante** (respecter) : header 1000 · sticky-cta 1500 · menu mobile 2000 · sticky ATC 900 · retract 9998 · promo/toast 9999 · modale rétractation 10050.

## 5. Animation (principes)

1. **Reveal au scroll** (`bos-reveal.js` + `[data-reveal]`) : fade-up 26px, `.7s cubic-bezier(.2,.7,.2,1)`, cascade `.08/.16/.24s` dans les grilles. Triple filet anti-contenu-invisible : (a) les éléments déjà visibles sont révélés AVANT le premier repaint, (b) passe de sécurité au scroll, (c) **backstop dur à 5 s** qui révèle tout, (d) `catch` fail-safe. Toute nouvelle section animée doit passer par ce système, jamais un `opacity:0` orphelin.
2. **Héro vivant** (`bos-modern.css`) : halo radial bleu `bosGlow` 6s + flottement du visuel `bosFloat` 7s + reflet `bosShine` 6.5s sur le mot-clé en `em`. Héro CLAIR (pas d'étoiles — réservées aux boutiques à héro sombre).
3. **Animations SVG produit** (`styles.css` fin de fichier) : pastille `.bos-anim-produit` 72px (92px ≥640) en haut-droite de `.product-visual`, SVG inline + keyframes CSS uniquement (zéro lib). 7 thèmes existants : ZZZ qui montent + lune (masque Bluetooth), LED pulse 3 couleurs, vagues chaud/froid, gua sha qui glisse + scintille, ampoule qui respire, ondes sonores concentriques, respiration + flocon. Un nouveau produit = une nouvelle animation dans cet esprit (douce, lente 2.4-6s, thématique).
4. **`prefers-reduced-motion: reduce`** : TOUTES les animations coupées et `[data-reveal]` forcé visible. Toute nouvelle animation DOIT être neutralisée dans ce media query.
5. Micro-interactions : transitions `--t` (.25s), hovers translateY(-1 à -8px) + ombre — jamais d'animation brutale ou clignotante.

## 6. Ton de voix (FR)

- **Univers** : sommeil, détente, rituel du soir, douceur. Vocabulaire : s'endormir, apaiser, noir total, sons d'ambiance, halo, respiration. La marque est liée à la chaîne **Havre Sonore** (cross-sell assumé : « Endors-toi avec tes sons Havre Sonore »).
- **Registre** : accroches émotionnelles au **tutoiement** (« Endors-toi avec tes sons »), texte informatif et réassurance au **vouvoiement** (« Diffuse vos sons d'ambiance préférés »). Pages légales : vouvoiement strict.
- **Honnêteté systématique** : la livraison réelle (12 à 20 jours ouvrés depuis nos entrepôts partenaires) est affichée topbar + héro + fiches. Jamais de promesse invérifiable.
- **Typo française correcte** : accents, apostrophes, espaces insécables avant `€` et signes doubles. Prix format FR (« 39 € », « 49,90 € »).

## 7. ⛔ INTERDITS (bloquants — à vérifier avant tout commit)

1. **Jamais de compte à rebours, de fausse urgence ni de prix barré fictif** (DGCCRF, pratique trompeuse art. L121-2 C. conso). La remise −10 % est permanente et annoncée comme telle. Ne JAMAIS réintroduire de chrono dans `bos-promo.js` ni de « offre expire dans X min » où que ce soit.
2. **Jamais de lien `github.io` brut en public** : tout lien affiché/canonique/sitemap pointe vers `https://serenlabboutique.fr` (ou le domaine officiel du site cible). Ne pas toucher au fichier `CNAME`.
3. **Contraste AA minimum** (WCAG 2.1) : texte sur fond clair ≥ 4.5:1 — utiliser `--text-dark`/`--text-med`, jamais `--text-light` pour du texte porteur de sens sur fond pâle.
4. **Accents français corrects partout** (é è à ç œ…). Attention aux pipelines PowerShell/JSON qui détruisent les accents : relire le rendu final. Un texte sans accents est inacceptable.
5. **Ne jamais casser la chaîne de paiement** : ne pas renommer/supprimer `bos-stripe.js`, `bos-paypal.js`, `bos-paypal-cart.js`, ni les attributs `data-bos-cb`, `data-bos-key`, `data-bos-price`, ni les boutons `.add-to-cart-btn` avec leurs `data-name`/`data-price` (utilisés par le panier, la barre ATC sticky et la détection de la barre promo). Les prix côté client sont revalidés côté VPS — un `data-bos-key` faux = paiement cassé.
6. **Ne pas dupliquer le calcul de remise** : tout affichage de total passe par `window.BOS_PROMO.discount(cart)` (l'arrondi au centime y est fait une seule fois — sinon affichage ≠ facturé).
7. **Respecter `prefers-reduced-motion`** pour toute nouvelle animation, et le système reveal existant (jamais d'élément laissé en `opacity:0` sans les filets de `bos-reveal.js`).
8. **100 % français** dans tout contenu et visuel public (aucun texte étranger), images produit = vraies photos du SKU réellement expédié (jamais d'image IA générique d'un autre produit).
9. **Respecter la hiérarchie z-index** du §4 (un nouveau composant ne doit masquer ni le menu mobile, ni la pastille rétractation, ni la barre promo).
10. **CSS additif d'abord** : les modernisations vont dans `bos-modern.css` (couche additive), pas en réécriture de `styles.css` — et ne jamais committer un sous-dossier contenant son propre `.git/` (GitHub Pages le traiterait en submodule et ne le déploierait pas).

---
*Document créé le 17/07/2026 (recommandation Analyse_jmjgljCC-O4_design.md). Le mettre à jour à chaque évolution réelle du design — il ne doit jamais mentir.*
