const fs = require('fs').promises;
const path = require('path');

/**
 * Service de scan de fichiers haute performance.
 * Utilise les API asynchrones de Node.js pour ne pas bloquer le Main Thread.
 */
class FileScanner {
    constructor() {
        this.excludedExtensions = ['.bin', '.cue', '.xml', '.txt', '.dat']; // Ext à ignorer si besoin
    }

    /**
     * Scanne récursivement un dossier pour trouver des fichiers.
     * @param {string} directory - Chemin absolu du dossier
     * @param {string[]} extensions - Liste des extensions acceptées (ex: ['.iso', '.rom'])
     * @returns {Promise<string[]>} Liste des chemins complets
     */
    async scanDirectory(directory, extensions = []) {
        let results = [];

        try {
            // Lecture du dossier
            const list = await fs.readdir(directory, { withFileTypes: true });

            // Traitement parallèle des entrées
            const processes = list.map(async (entry) => {
                const fullPath = path.join(directory, entry.name);

                if (entry.isDirectory()) {
                    // Récursion : on attend le résultat du sous-dossier
                    const subResults = await this.scanDirectory(fullPath, extensions);
                    results = results.concat(subResults);
                } else {
                    // Vérification de l'extension
                    const ext = path.extname(entry.name).toLowerCase();

                    const isValidExtension = extensions.length === 0 || extensions.includes(ext);
                    const isNotExcluded = !this.excludedExtensions.includes(ext);

                    if (isValidExtension && isNotExcluded) {
                        results.push(fullPath);
                    }
                }
            });

            // Attente de la fin de toutes les lectures parallèles
            await Promise.all(processes);
        } catch (err) {
            console.error(`Erreur scan dossier ${directory}:`, err.message);
            // On ne throw pas pour permettre au scan de continuer sur les autres dossiers
        }

        return results;
    }

    /**
     * Récupère les métadonnées de base d'un fichier (taille, date).
     * @param {string} filePath 
     */
    async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (e) {
            return null;
        }
    }
}

module.exports = new FileScanner();
