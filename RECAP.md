# RECAP — Mise en place de l'app TOSA Desktop

Transformation du fichier `tosa-desktop-quiz.html` en application distribuable :
**PWA** (GitHub Pages, hors-ligne) + **APK Android** (Capacitor, build par GitHub Actions).

## URLs

- **PWA (Pages)** : https://shjnaki.github.io/tosa_quiz/
- **Releases (APK)** : https://github.com/ShjnAki/tosa_quiz/releases (tag `latest`, `app-debug.apk`)
- **Repo** : https://github.com/ShjnAki/tosa_quiz

## Ce qui a été fait, par phase

**Phase 1 — Init**
- `git init`, `.gitignore` (Node + Android + keystores + `mydatabase.db` local).
- `npm init` → `name: tosa_quiz`, `version: 1.0.0`.
- Capacitor installé (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`).
- Dossier web `www/` (webDir Capacitor).

**Phase 2 — Couche web (PWA, hors-ligne)**
- `tosa-desktop-quiz.html` → `www/index.html`.
- Scores : `getBest`/`setBest` réécrits en **`localStorage` synchrone**, `await`
  retirés et `finish()` redevenue non-async.
- Google Fonts supprimé. Polices **auto-hébergées** dans `www/fonts/` (Space Grotesk
  et Inter, fichiers *variable* latin, un woff2 par famille) + `@font-face` locaux
  `font-display:swap`. Fallback `sans-serif` conservé.
- `www/manifest.webmanifest` (name/short_name, start_url & scope `./`, standalone,
  couleurs `#0e1525`, icônes 192/512 + maskable).
- `www/sw.js` : service worker **cache-first** sur l'app shell, cache versionné
  (`tosa-v1`), nettoyage des anciens caches, repli hors-ligne. Enregistré depuis
  `index.html` en **chemin relatif**, sous garde `'serviceWorker' in navigator` + try/catch.
- `<head>` : lien manifeste, `theme-color`, balises `apple-mobile-web-app-*`, icône.

**Phase 3 — Capacitor + Android**
- `capacitor.config.json` (`appId: fr.shjnaki.tosaquiz`, `appName: TOSA Quiz`, `webDir: www`).
- `npx cap add android`.
- Icône source `assets/icon.png` (1024²) + `assets/splash.png` (2732²) : badge « TOSA »
  ambre encadré sur fond `#0e1525`. Toutes les tailles Android générées via
  `@capacitor/assets`. Icônes PWA 192/512/maskable dans `www/icons/`.
- `npx cap sync android`.

**Phase 4 — GitHub Actions** (`.github/workflows/`)
- `deploy-pages.yml` : déploie `www/` sur Pages à chaque push `main`
  (`configure-pages` / `upload-pages-artifact path: www` / `deploy-pages`).
- `build-apk.yml` : JDK 21 Temurin + Node 22, `npm ci`, `npx cap sync android`,
  `./gradlew assembleDebug`, upload artifact **et** release `latest` (prerelease)
  avec l'APK joint (`softprops/action-gh-release`).

**Phase 5 — README** orienté utilisateur final (Option A : lien Pages ; Option B :
APK depuis Releases ; section dev avec structure et commandes).

**Phase 6 — Commits & push** : commits atomiques par phase, repo distant créé via `gh`.

## Commandes de build (local)

```bash
npm ci
npx cap sync android
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

## Vérifications effectuées

- Aucune référence réseau externe dans `www/index.html` (polices auto-hébergées).
- Toutes les ressources de l'app shell servies en `200` (serveur statique local).
- JS de l'app et `sw.js` : syntaxe valide (`node --check`) ; manifeste et
  `capacitor.config.json` : JSON valides.
- Logique `localStorage` des meilleurs scores testée (null → écriture → mise à jour).
- Icône source rendue et vérifiée visuellement.

## Évolutions post-livraison

- **Banque Excel étendue à 35 questions** (15 → 35) pour permettre un quiz mono-module
  de longueur « certification ». Word/PPT/Outlook restent à ~11-12 (à compléter au besoin).
- **Rotation des questions entre sessions** : `pickQuestions()` privilégie les questions
  pas encore vues (mémorisées par module dans `localStorage`, clé `seen:<module>`) et ne
  recycle qu'une fois tout le stock parcouru. Les options restent mélangées à chaque tirage.
- Note : les questions sont des QCM **originaux** alignés sur le périmètre du référentiel
  TOSA — ce ne sont pas les questions officielles (confidentielles, examen adaptatif).

## Points en suspens / à faire côté utilisateur

1. **Activer GitHub Pages** : *Settings ▸ Pages ▸ Source : GitHub Actions* (à faire
   une fois après le 1er push si non automatique).
2. **Signature de release** (keystore) : non implémentée volontairement. L'APK est en
   *debug* (clé de test), installable en sideload. À ajouter plus tard pour une vraie
   distribution.
3. **Police de l'icône** : le monogramme « TOSA » de l'icône/splash utilise *DejaVu
   Sans Bold* (Space Grotesk n'était pas disponible en TTF statique sur la machine de
   build). L'app elle-même utilise bien Space Grotesk. Pour aligner l'icône, fournir
   une TTF Space Grotesk et relancer `npx @capacitor/assets generate --android`.
4. **Vérification navigateur** (Lighthouse PWA, rendu) : non exécutée localement
   (Chromium indisponible dans l'environnement de build) — à confirmer une fois Pages
   en ligne.

---

# Module « Gestionnaire de Paie » (ajout)

Ajout d'un module **Gestionnaire de Paie**, pensé comme **la continuité du module Excel**
(Excel appliqué à la paie + connaissances métier préparant au **Titre Professionnel
Gestionnaire de paie, RNCP 37948**, niveau 5). Word / PowerPoint / Outlook ont été
**supprimés** (choix assumé) : l'app ne contient plus que **Excel** + **Paie**.

## Banque `BANK.paie` — 71 questions

| Niveau | Nombre |
|--------|--------|
| F (courant) | 13 |
| M (avancé)  | 33 |
| A (expert)  | 25 |

- **37 questions « Excel appliqué à la paie »** (continuité directe d'Excel) : brut/net,
  cotisations (`=A2*(1-B2)`), 151,67 h, taux horaire, heures sup 25 %/50 %, congés, prorata,
  13e mois, masse salariale (`SOMME`, `SOMME.SI.ENS`), `RECHERCHEV`/`SIERREUR` de barème,
  `ARRONDI`, TCD, MFC, validation des données, format `[h]:mm`…
- **34 questions « connaissances métier »** ajoutées :
  - **BC01 — Bulletin & cotisations (14)** : bulletin clarifié, mentions interdites, URSSAF,
    Agirc-Arrco, salariales vs patronales, CSG déductible/non déductible, assiette plafonnée/PMSS,
    Montant Net Social, réduction générale (ex-Fillon), frais professionnels, allègement des
    heures sup, heures complémentaires (temps partiel), avantages en nature, taux neutre du PAS.
  - **BC02 — Vie du contrat & DSN (20)** : période d'essai (2/3/4 mois), CDD (18 mois max,
    2 renouvellements, motif interdit), arrêt maladie (carence 3 j), accident du travail (sans
    carence), subrogation, DSN (définition, remplacement de déclarations, échéances 5/15,
    signalements d'événements), documents de fin de contrat, indemnité légale de licenciement
    (1/4 puis 1/3 de mois/an), rupture conventionnelle (rétractation 15 j, homologation DREETS),
    démission, saisie sur salaire, indemnité compensatrice de CP, maintien vs règle du 1/10.

## Intégration UI

- Carte « Gestionnaire de Paie » générée automatiquement (avant le Mix), couleur dédiée
  `--paie:#e07c44`. En-tête et couleur via `MODULES[q.mod]` (aucun code spécifique).
- **Examen blanc (Mix)** : tire désormais dans **toute la banque** (Excel + Paie).
- Sous-titre « Excel · Gestionnaire de Paie » ; mention RNCP 37948 dans le pied d'accueil.

## Non modifié

Scoring /1000, chrono, réglages, rotation `localStorage` (`seen`), service worker, manifeste PWA,
et les 400 questions Excel (hors une explication F7 qui citait des logiciels retirés).

## Points d'attention (à revérifier chaque année)

Montants/règles susceptibles d'évoluer : SMIC, **PMSS/PASS**, plafonds d'exonération des heures
sup, seuil de la réduction générale (1,6 SMIC), CSG/CRDS, barème de l'indemnité de licenciement,
échéances DSN. Les explications restent volontairement qualitatives (pas de taux chiffrés figés)
pour limiter l'obsolescence. Base : législation française **2025-2026**.
