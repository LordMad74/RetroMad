# Journal des Modifications (Antigravity)

## [2026-01-05] - v0.6.7
### Ajouté
- **Mode Local (WASM)** : Intégration de `Nostalgist.js` pour jouer directement sur le GSM.
- **Route `/rom/:id`** : Nouvelle méthode de chargement des jeux ultra-fiable par identifiant unique.
- **Support Manettes Bluetooth** : Détection automatique des manettes physiques (Xbox, PS4, etc.) sur le portail mobile.
- **Système de Logs Serveur** : Création de `Content/server.log` pour tracer les erreurs de chargement.
- **Route `/api/logs`** : Permet de voir les logs du serveur directement dans le navigateur.

### Corrigé
- **Bibliothèque vide** : Restauration de la route `/api/games` accidentellement supprimée.
- **Erreur "Failed to load response"** : Résolution des problèmes de chemins de fichiers et ajout des headers COOP/COEP pour l'émulation locale.
- **Miroir infini** : Le mode "Local" évite l'effet miroir du streaming.

### Amélioré
- **Interface Mobile** : Le flux vidéo du streaming occupe désormais tout l'écran sans bandes noires inutiles.
- **Instructions WebPlay** : Clarification de l'accès via n'importe quel appareil (TV, Tablette, PC).
