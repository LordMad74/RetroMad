# 🕹️ RetroMad - Ultimate Retro Gaming Engine

**RetroMad** est une interface de gestion et de lancement de jeux rétro moderne, portable et ultra-rapide. Conçue avec **Electron**, **React** et **Node.js**, elle offre une expérience premium pour gérer votre collection de roms, scraper les médias et jouer dans un environnement immersif.

![RetroMad Banner](https://via.placeholder.com/1200x400?text=RetroMad+Engine)

## ✨ Fonctionnalités Principales

- **🎨 Interface Glassmorphism** : Un design moderne, fluide et animé pour une navigation agréable.
- **🚀 Mode Kiosk (Arcade)** : Une interface plein écran dédiée pour les bornes d'arcade, avec thèmes personnalisables (Neon, Classic, Future).
- **🛠️ Panneau d'Administration** :
  - Gestion des Émulateurs (Installation/Désinstallation de RetroArch et cœurs).
  - Configuration des Systèmes et Chemins.
  - Gestion des Constructeurs (Logos, Infos).
  - Réglages fins de RetroArch (FPS, Fullscreen, Drivers) sans toucher aux fichiers textes.
- **🖼️ Scraper Intégré (Skyscraper)** : Téléchargement automatique des pochettes, roues, vidéos et métadonnées via [Skyscraper](https://github.com/muldjord/skyscraper).
- **💾 Portable** : Conçu pour fonctionner depuis un disque dur externe ou une clé USB. Tout est contenu dans le dossier `Engine`.
- **🌐 Serveur Web Local** : Permet de jouer via navigateur (Web Play) pour certaines plateformes supportées.

## 📦 Installation et Démarrage

### Prérequis
- **Node.js** (v16 ou supérieur)
- Une connexion Internet (pour l'installation initiale et le scraping)

### Installation (Développement / Source)

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/LordMad74/RetroMad.git
   cd RetroMad/Engine
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer l'environnement (Optionnel) :**
   Copiez `config.example.json` en `config.json` si vous souhaitez définir des clés API (ex: Pexels pour les fonds d'écran animés).

4. **Lancer en mode Dev :**
   ```bash
   npm run dev:all
   ```
   *Cela lance à la fois le serveur Vite (Frontend) et Electron (Backend).*

### Utilisation Portable (Build)

Pour créer une version exécutable (distribuable) :
```bash
npm run build
```
L'application compilée se trouvera dans le dossier `dist`.

## 📂 Structure du Projet

- **`electron/`** : Code Backend (Main process, gestion fichiers, scraper, émulateurs).
- **`src/`** : Code Frontend (React, Components, AdminPanel, KioskMode).
- **`Skyscraper/`** : Binaire et ressources pour le scraper (non inclus par défaut dans le git, à ajouter pour la version portable).
- **`Content/`** : Dossier de stockage des Roms, Émulateurs et Médias (ignoré par Git pour la légèreté).

## 🛠️ Technologies

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/) (Animations)
- [Skyscraper](https://github.com/muldjord/skyscraper) (Scraping engine)
- [RetroArch](https://www.retroarch.com/) (Emulation backend)

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---
*Développé avec passion pour la communauté rétro-gaming.*
