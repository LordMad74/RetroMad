# RetroMad Portal

Portail de Retrogaming pour Windows et Arcade.

## Installation
1.  `npm install` (Déjà fait)

## Lancement
- **Développement** : `npm run electron:dev`
    - Lance le serveur Vite et la fenêtre Electron.
    - Recharge automatique lors des modifications.

- **Build** : `npm run build`
    - Compile l'application pour la production.

## Structure
- `src/` : Code source de l'interface (React).
- `electron/` : Code du processus principal (Window management).
- `dist/` : Fichiers compilés.

## Fonctionnalités
- Onglet **ARCADE** : Sélection des consoles et jeux.
- Onglet **WEBPLAY** : Jeu en réseau (à venir).
- Onglet **ADMIN** : Gestion du système.
