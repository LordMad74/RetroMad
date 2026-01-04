C'est fait ! L'organisation des fichiers a été mise à jour.

## Nouvelle Structure
*   **`D:\RetroMad\Engine\`** : Le "Moteur". C'est ici que se trouve tout le code source, ce dossier ne doit pas être modifié par le client final.
*   **`D:\RetroMad\Content\`** : Le dossier pour le client/utilisateur. C'est ici que l'utilisateur dépose :
    *   `Roms/` : Pour les fichiers de jeux.
    *   `Emulators/` : Pour les émulateurs portables.
    *   `Themes/` : Pour personnaliser l'apparence.
    *   `Media/` : Pour les images et vidéos.

L'application est configurée pour s'adapter :
*   En développement, elle cherche le dossier `Content` à côté du dossier `Engine`.
*   En version finale (compilée), elle cherchera le dossier `Content` à côté de l'exécutable (`.exe`).

Vous pouvez maintenant reprendre le développement ou tester l'application avec `npm run electron:dev` depuis le dossier `Engine`.
