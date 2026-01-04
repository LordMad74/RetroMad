const fs = require('fs');
const path = require('path');

/**
 * Nettoie le nom de fichier d'une ROM.
 * Supprime les tags (USA), [!], versions, etc.
 */
function cleanFilename(filename) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);

    const patterns = [
        /\s*\(.*?\)/gi,          // (USA), (En,Fr,De)
        /\s*\[.*?\]/gi,          // [!]
        /\s*v\d+(\.\d+)*/gi,     // v1.0
        /\s*Rev\s*\w+/gi,        // Rev A
        /\s*Beta\s*\d*/gi,       // Beta
        /\s*Proto\s*\d*/gi,      // Proto
        /\s*Demo/gi,             // Demo
        /\s*Sample/gi            // Sample
    ];

    let cleanName = name;
    patterns.forEach(pattern => {
        cleanName = cleanName.replace(pattern, '');
    });

    cleanName = cleanName.trim().replace(/\s+/g, ' ');
    return cleanName + ext;
}

/**
 * Parcourt récursivement un dossier pour renommer les ROMs.
 */
async function processDirectory(directory, execute = false, eventSender = null) {
    if (!fs.existsSync(directory)) {
        if (eventSender) eventSender.send('clean-log', `❌ Dossier introuvable : ${directory}`);
        return;
    }

    let changesCount = 0;

    function walkSync(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                walkSync(filePath);
            } else {
                const originalName = file;
                const newName = cleanFilename(originalName);

                if (newName !== originalName) {
                    const newPath = path.join(dir, newName);

                    if (fs.existsSync(newPath)) {
                        if (eventSender) eventSender.send('clean-log', `⚠️ Conflit ignoré : ${originalName} -> ${newName} (déjà présent)`);
                    } else {
                        const prefix = execute ? '✅ [RENOMMÉ]' : '📝 [SIMULATION]';
                        const logMsg = `${prefix} ${originalName}  -->  ${newName}`;

                        if (eventSender) eventSender.send('clean-log', logMsg);
                        console.log(logMsg);

                        if (execute) {
                            try {
                                fs.renameSync(filePath, newPath);
                                changesCount++;
                            } catch (e) {
                                if (eventSender) eventSender.send('clean-log', `❌ Erreur : ${e.message}`);
                            }
                        } else {
                            changesCount++;
                        }
                    }
                }
            }
        });
    }

    walkSync(directory);

    const resultMsg = changesCount === 0
        ? "✨ Aucun fichier à nettoyer trouvé."
        : `--- Bilan : ${changesCount} fichiers ${execute ? 'renommés' : 'identifiés'} ---`;

    if (eventSender) {
        eventSender.send('clean-log', resultMsg);
        eventSender.send('clean-log', `--- Process terminé ---`);
    }
}

module.exports = { processDirectory };
