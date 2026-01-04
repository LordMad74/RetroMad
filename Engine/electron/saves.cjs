const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const AdmZip = require('adm-zip');

class SaveManager {
    constructor() {
        this.projectRoot = this.resolveProjectRoot();
    }

    resolveProjectRoot() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(__dirname, '../../');
        }
        return path.dirname(process.execPath);
    }

    getContentPath() {
        const devPath = path.join(this.projectRoot, 'Content');
        const prodPath = path.join(this.resolveProjectRoot(), 'Content');
        return fs.existsSync(devPath) ? devPath : prodPath;
    }

    async backupSaves() {
        const contentPath = this.getContentPath();
        const romsPath = path.join(contentPath, 'Roms');
        const backupDir = path.join(contentPath, 'Backups');

        if (!fs.existsSync(romsPath)) return { success: false, error: "Dossier Roms introuvable" };
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const zip = new AdmZip();
        let fileCount = 0;

        // Recursive search for save files
        const searchFiles = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    searchFiles(fullPath);
                } else {
                    if (file.endsWith('.srm') || file.endsWith('.state') || file.endsWith('.sav') || file.endsWith('.mcr')) {
                        // Keep internal folder structure relative to Roms
                        const relPath = path.relative(romsPath, fullPath);
                        // Add to zip (dirname of relative path is the folder structure)
                        zip.addLocalFile(fullPath, path.dirname(relPath));
                        fileCount++;
                    }
                }
            }
        };

        try {
            searchFiles(romsPath);

            if (fileCount === 0) return { success: true, message: "Aucune sauvegarde trouvée à backuper." };

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipName = `Saves_Backup_${timestamp}.zip`;
            const zipPath = path.join(backupDir, zipName);

            zip.writeZip(zipPath);
            return { success: true, message: `${fileCount} fichiers sauvegardés dans ${zipName}`, path: zipPath };
        } catch (e) {
            console.error(e);
            return { success: false, error: e.message };
        }
    }
}

module.exports = new SaveManager();
