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
        const savesPath = path.join(contentPath, 'Saves');
        const backupDir = path.join(contentPath, 'Backups');

        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const zip = new AdmZip();
        let fileCount = 0;

        const scanDir = (dir, label) => {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    scanDir(fullPath, label);
                } else {
                    const ext = path.extname(file).toLowerCase();
                    const saveExts = ['.srm', '.state', '.sav', '.mcr', '.vmp', '.flash', '.eep', '.st0', '.st1', '.st2'];
                    if (saveExts.includes(ext)) {
                        const relPath = path.relative(path.join(contentPath, label), fullPath);
                        zip.addLocalFile(fullPath, path.join(label, path.dirname(relPath)));
                        fileCount++;
                    }
                }
            }
        };

        try {
            scanDir(romsPath, 'Roms');
            scanDir(savesPath, 'Saves');

            if (fileCount === 0) return { success: true, message: "Aucune sauvegarde trouvée." };

            const timestamp = new Date().toLocaleString('fr-FR').replace(/[\/:]/g, '-').replace(/ /g, '_');
            const zipName = `RetroMad_Saves_${timestamp}.zip`;
            const zipPath = path.join(backupDir, zipName);

            zip.writeZip(zipPath);
            return { success: true, message: `${fileCount} fichiers archivés avec succès.`, path: zipPath, name: zipName };
        } catch (e) {
            console.error(e);
            return { success: false, error: e.message };
        }
    }

    async listBackups() {
        const backupDir = path.join(this.getContentPath(), 'Backups');
        if (!fs.existsSync(backupDir)) return [];

        try {
            const files = fs.readdirSync(backupDir);
            return files
                .filter(f => f.endsWith('.zip'))
                .map(f => {
                    const stats = fs.statSync(path.join(backupDir, f));
                    return {
                        name: f,
                        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                        date: stats.mtime.toLocaleString('fr-FR'),
                        path: path.join(backupDir, f)
                    };
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (e) {
            return [];
        }
    }

    async deleteBackup(name) {
        const backupDir = path.join(this.getContentPath(), 'Backups');
        const fullPath = path.join(backupDir, name);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return { success: true };
        }
        return { success: false };
    }

    async restoreBackup(name) {
        const contentPath = this.getContentPath();
        const backupDir = path.join(contentPath, 'Backups');
        const fullPath = path.join(backupDir, name);

        if (!fs.existsSync(fullPath)) {
            return { success: false, error: "Archive introuvable." };
        }

        try {
            const zip = new AdmZip(fullPath);
            zip.extractAllTo(contentPath, true); // true = overwrite
            return { success: true, message: "Sauvegarde restaurée avec succès." };
        } catch (e) {
            console.error(e);
            return { success: false, error: e.message };
        }
    }
}

module.exports = new SaveManager();
