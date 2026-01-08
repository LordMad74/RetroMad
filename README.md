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

## Nouveautés (Version 0.7.5 - Mise à jour depuis v0.7.0)
- **Émulation Locale Intégrée (WASM)** : Plus besoin d'application tierce ! Lancez vos ROMs directement dans le navigateur du téléphone grâce au moteur Nostalgist/RetroArch.
- **Manette Mobile 2.0** :
    - **Ergonomie optimisée** : Boutons recentrés (offset 80px) pour éviter de trop étirer les mains.
    - **Vibrations (Haptic Feedback)** : Retour de force léger à chaque pression pour de meilleures sensations.
    - **Ancrage fixe** : La manette reste en place peu importe la taille de l'écran.
- **Protection Anti-Crashes** : Système de verrouillage des entrées pour éviter les boucles infinies et les plantages sur mobile.
- **Support Manette Matérielle** : Connectez vos manettes Bluetooth (PS4, Xbox, etc.) directement à votre mobile pour piloter le portail.
- **Stabilité Réseau** : Correction de l'erreur "Service name in use" avec des noms de serveur uniques.
- **Logs Distants** : Nouveau système de diagnostic accessible via `/api/logs`.

## Utilisation Mobile
1. Lancez **RetroMad** sur votre PC.
2. Scannez le QR Code dans l'onglet **WebPlay**.
3. Accédez à votre bibliothèque et choisissez **"Lancer localement"** pour utiliser la puissance de votre téléphone.
4. Pour une meilleure expérience, ajoutez le site à votre écran d'accueil (PWA).

## Build de Test
Le build portable actuel est : **`RetroMad_Build_V0.7.5.7z`**
