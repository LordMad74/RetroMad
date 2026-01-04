const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');
const emulatorManager = require('./emulators.cjs'); // Import Emulator Manager for extensions

// Helper for paths (duplicated from emulators.cjs, could be sharedutils later)
const getContentPath = () => {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        return path.resolve(path.join(__dirname, '../../Content'));
    } else {
        return path.join(path.dirname(process.execPath), 'Content');
    }
};

class DatabaseManager {
    constructor() {
        this.contentPath = getContentPath();
        this.dbPath = path.join(this.contentPath, 'gamelist.json');
        this.db = { games: [] };
        this.load();
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try {
                this.db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
            } catch (e) {
                console.error("Failed to load DB", e);
                this.db = { games: [] };
            }
        }
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
    }

    // Generate a unique ID for a game based on path
    generateId(filePath) {
        return crypto.createHash('md5').update(filePath).digest('hex');
    }

    async scanSystem(system) {
        const romsPath = path.join(this.contentPath, 'Roms', system);
        if (!fs.existsSync(romsPath)) return { added: 0, total: 0 };

        // Get allowed extensions for this system (Allowlist approach)
        const allowedExtensions = emulatorManager.getAllowedExtensions(system);

        const recursiveScan = (dir) => {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat && stat.isDirectory()) {
                    const lowerDir = file.toLowerCase();
                    const ignoredDirs = ['media', 'downloaded_images', 'downloaded_videos', 'images', 'videos', 'marquees', 'wheels'];
                    if (!ignoredDirs.includes(lowerDir)) {
                        results = results.concat(recursiveScan(fullPath));
                    }
                } else {
                    const lowerFile = file.toLowerCase();

                    // STRICT ALLOWLIST FILTERING
                    const isValidExtension = allowedExtensions.some(ext => lowerFile.endsWith(ext));
                    const isIgnoredFile = file.startsWith('.') || file.toLowerCase() === 'gamelist.xml';

                    if (isValidExtension && !isIgnoredFile) {
                        results.push(fullPath);
                    }
                }
            });
            return results;
        };

        const files = recursiveScan(romsPath);
        let addedCount = 0;

        files.forEach(file => {
            const id = this.generateId(file);

            // Check if exists
            let existing = this.db.games.find(g => g.id === id);

            // Auto-detect media during scan
            const baseExt = path.extname(file);
            const baseName = path.basename(file, baseExt);
            const romsPath = path.dirname(file); // For recursive scans, it might be in a subfolder

            const mediaPaths = {
                image: 'media/screenshots',
                thumbnail: 'media/covers',
                video: 'media/videos',
                marquee: 'media/marquees',
                wheel: 'media/wheels',
                fanart: 'media/fanart',
                fanarts: 'media/fanarts'
            };

            const gameData = {
                id,
                system,
                path: file,
                filename: path.basename(file),
                name: path.parse(file).name,
                addedAt: Date.now()
            };

            // Detect media
            for (const [key, subDir] of Object.entries(mediaPaths)) {
                const extensions = (key === 'video') ? ['.mp4', '.avi', '.mkv'] : ['.png', '.jpg', '.jpeg'];
                for (const ext of extensions) {
                    const mPath = path.join(romsPath, subDir, `${baseName}${ext}`);
                    if (fs.existsSync(mPath)) {
                        gameData[key] = path.relative(this.contentPath, mPath).replace(/\\/g, '/');
                        break;
                    }
                }
            }

            if (!existing) {
                this.db.games.push(gameData);
                addedCount++;
            } else {
                // Merge media if missing or updated
                Object.keys(mediaPaths).forEach(key => {
                    const dbKey = (key === 'fanarts') ? 'fanart' : key;
                    if (gameData[key]) existing[dbKey] = gameData[key];
                });
            }
        });

        this.save();
        return { added: addedCount, total: files.length };
    }

    async importGamelist(system) {
        const { XMLParser } = require('fast-xml-parser');
        const romsPath = path.join(this.contentPath, 'Roms', system);
        const xmlPath = path.join(romsPath, 'gamelist.xml');

        if (!fs.existsSync(xmlPath)) {
            console.log("No gamelist.xml found for", system);
            return { success: false, error: 'No gamelist.xml' };
        }

        try {
            const data = fs.readFileSync(xmlPath, 'utf8');
            const parser = new XMLParser();
            const result = parser.parse(data);

            if (!result.gameList || !result.gameList.game) {
                return { success: false, error: 'Invalid XML structure' };
            }

            const gamesXml = Array.isArray(result.gameList.game) ? result.gameList.game : [result.gameList.game];
            let updatedCount = 0;

            gamesXml.forEach(xmlGame => {
                const xmlPathRaw = xmlGame.path;
                let filename = path.basename(xmlPathRaw);
                const dbGame = this.db.games.find(g => g.system === system && g.filename === filename);

                if (dbGame) {
                    const getText = (node) => {
                        if (!node) return undefined;
                        if (typeof node === 'object' && node['#text']) return node['#text'];
                        if (typeof node === 'string') return node;
                        return String(node);
                    };

                    if (xmlGame.name) dbGame.name = getText(xmlGame.name);
                    if (xmlGame.desc) dbGame.description = getText(xmlGame.desc);
                    if (xmlGame.developer) dbGame.developer = getText(xmlGame.developer);
                    if (xmlGame.publisher) dbGame.publisher = getText(xmlGame.publisher);
                    if (xmlGame.releasedate) dbGame.releaseDate = getText(xmlGame.releasedate);
                    if (xmlGame.genre) dbGame.genre = getText(xmlGame.genre);
                    if (xmlGame.players) dbGame.players = getText(xmlGame.players);
                    if (xmlGame.rating) dbGame.rating = getText(xmlGame.rating);

                    const resolveMedia = (xmlPath) => {
                        if (!xmlPath) return undefined;
                        const rel = xmlPath.replace(/^\.\//, '').replace(/^\.\\/, '');
                        const full = path.join(romsPath, rel);
                        return path.relative(this.contentPath, full).replace(/\\/g, '/');
                    };

                    if (xmlGame.image) dbGame.image = resolveMedia(xmlGame.image);
                    if (xmlGame.thumbnail) dbGame.thumbnail = resolveMedia(xmlGame.thumbnail);
                    if (xmlGame.marquee) dbGame.marquee = resolveMedia(xmlGame.marquee);
                    if (xmlGame.video) dbGame.video = resolveMedia(xmlGame.video);
                    if (xmlGame.wheel) dbGame.wheel = resolveMedia(xmlGame.wheel);
                    if (xmlGame.fanart) dbGame.fanart = resolveMedia(xmlGame.fanart);
                    if (xmlGame.fanarts) dbGame.fanart = resolveMedia(xmlGame.fanarts);

                    const romExt = path.extname(filename);
                    const romBase = path.basename(filename, romExt);
                    const wheelFolder = path.join(romsPath, 'media/wheels');
                    const possibleWheels = [`${romBase}.png`, `${romBase}.jpg`, `${romBase}.jpeg`];

                    for (const wFile of possibleWheels) {
                        const fullWPath = path.join(wheelFolder, wFile);
                        if (fs.existsSync(fullWPath)) {
                            dbGame.wheel = path.relative(this.contentPath, fullWPath).replace(/\\/g, '/');
                            break;
                        }
                    }

                    updatedCount++;
                }
            });

            this.save();
            return { success: true, updated: updatedCount };

        } catch (e) {
            console.error("XML Parse error", e);
            return { success: false, error: e.message };
        }
    }

    getGames(system) {
        return this.db.games.filter(g => g.system === system);
    }

    deleteGame(id) {
        this.db.games = this.db.games.filter(g => g.id !== id);
        this.save();
        return { success: true };
    }

    resetSystem(system) {
        this.db.games = this.db.games.filter(g => g.system !== system);
        this.save();
        return { success: true };
    }
}

module.exports = new DatabaseManager();
