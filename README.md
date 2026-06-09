# TOSA Desktop — Entraînement

Un petit quiz pour s'entraîner à la certification **TOSA Desktop** (Excel, Word,
PowerPoint, Outlook). Questions à choix unique, score sur 1000 et niveau indicatif
calqués sur le barème TOSA. Tout fonctionne **hors connexion** une fois ouvert.

---

## Comment l'utiliser

### Option A — le plus simple (recommandé)

1. Ouvrez ce lien sur votre téléphone ou votre ordinateur :
   **https://shjnaki.github.io/tosa_quiz/**
2. (Facultatif, pour l'avoir comme une vraie app) :
   - **Android / Chrome** : menu ⋮ ▸ *Ajouter à l'écran d'accueil*.
   - **iPhone / Safari** : bouton *Partager* ▸ *Sur l'écran d'accueil*.
3. C'est tout. Après la première ouverture, l'application **fonctionne sans
   Internet**.

### Option B — installer l'application Android (APK)

Pour qui préfère une vraie application installée :

1. Allez sur la page **[Releases](https://github.com/ShjnAki/tosa_quiz/releases)**
   du projet et téléchargez le fichier **`app-debug.apk`** de la version *latest*.
2. Ouvrez le fichier sur votre téléphone. Android demandera l'autorisation
   d'installer depuis cette source : acceptez *« Autoriser depuis cette source »*.
3. Installez, puis ouvrez **TOSA Quiz**.

> L'APK est signé avec une clé de test (build *debug*). C'est normal qu'Android
> prévienne avant l'installation — l'application ne contient aucune publicité ni
> collecte de données, et tout reste sur votre appareil.

---

## Ce que fait l'application

- 4 modules (Excel, Word, PowerPoint, Outlook) + un **examen blanc** mélangé.
- Réglages : nombre de questions, correction immédiate ou à la fin, chrono optionnel.
- Score /1000, niveau (Initial → Expert), revue des erreurs, **meilleur score
  conservé** sur l'appareil.

---

## Pour les développeurs

Projet **vanilla** (HTML/CSS/JS dans `www/index.html`, aucun framework) emballé en
app Android via **Capacitor**.

### Structure

```
www/                  ← l'application web (PWA)
  index.html          ← tout le quiz (HTML + CSS + JS)
  manifest.webmanifest
  sw.js               ← service worker (hors-ligne, cache-first)
  fonts/              ← polices auto-hébergées (Space Grotesk, Inter)
  icons/              ← icônes PWA (192, 512, maskable)
assets/               ← icône/splash source pour la génération Android
android/              ← projet Android natif (généré par Capacitor)
capacitor.config.json
.github/workflows/    ← déploiement Pages + build APK
```

### Prérequis

- Node 22+, JDK 21 (pour le build Android), le SDK Android.
  *(Capacitor 8 exige Node ≥ 22 et Java 21.)*

### Commandes

```bash
npm ci                       # installer les dépendances
npx cap sync android         # copier www/ dans le projet Android
cd android && ./gradlew assembleDebug   # produit app/build/outputs/apk/debug/app-debug.apk
```

Pour tester la PWA en local, servez le dossier `www/` avec n'importe quel serveur
statique (le service worker exige `http://localhost` ou HTTPS), par exemple :

```bash
npx serve www
```

### Déploiement

À chaque `push` sur `main`, GitHub Actions :

- **déploie `www/`** sur GitHub Pages (`deploy-pages.yml`) ;
- **build l'APK debug** et l'attache à la release `latest` (`build-apk.yml`).
