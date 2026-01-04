const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

/**
 * Enregistre les schémas personnalisés pour l'application.
 * 'media://' permet d'accéder aux fichiers locaux (images/vidéos) en contournant les restrictions de sécurité standard.
 */
protocol.registerSchemesAsPrivileged([
    { scheme: 'media', privileges: { secure: true, standard: true, supportFetchAPI: true, stream: true } }
]);

function createWindow() {
    /**
     * Gestionnaire du protocole 'media'.
     * Résout les URLs de type media://path en chemins absolus vers le dossier 'Content'.
     */
    protocol.registerFileProtocol('media', (request, callback) => {
        const url = request.url.replace(/^media:\/\//, '');
        try {
            const decodedPath = decodeURIComponent(url);
            const contentPath = getDataPath();
            let finalPath = decodedPath;

            if (!path.isAbsolute(decodedPath)) {
                finalPath = path.join(contentPath, decodedPath);
            }

            callback({ path: path.normalize(finalPath) });
        } catch (e) {
            console.error('Failed to handle media protocol', e);
        }
    });

    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
            webSecurity: false
        },
        backgroundColor: '#0f0f13'
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        const indexPath = path.resolve(__dirname, '../dist/index.html');
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
            mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURI(`
                <body style="background:#0a0a0f;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                    <h1>Erreur de Chargement</h1>
                    <p>Fichier production introuvable : ${indexPath}</p>
                    <p>Vérifiez que vous avez bien lancé le build avant (ou utilisez le lanceur PS1).</p>
                </body>
            `));
        });
    }
}

/**
 * Récupère le chemin racine des données utilisateur (le dossier 'Content').
 * S'adapte dynamiquement si l'application est en développement ou packagée.
 * @returns {string} Chemin absolu vers le dossier Content.
 */
const getDataPath = () => {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        return path.resolve(path.join(__dirname, '../../Content'));
    } else {
        return path.join(path.dirname(process.execPath), 'Content');
    }
};

/**
 * Initialise la structure des dossiers de l'application au premier démarrage.
 * Crée les répertoires pour les ROMs, les émulateurs, les sauvegardes et les médias.
 * Génère également un fichier config.json par défaut s'il est absent.
 */
const initializeDirectories = () => {
    const contentPath = getDataPath();
    const dirs = [
        contentPath,
        path.join(contentPath, 'Roms'),
        path.join(contentPath, 'Emulators'),
        path.join(contentPath, 'Saves'),
        path.join(contentPath, 'media'),
        path.join(contentPath, 'media', 'sounds'),
        path.join(contentPath, 'media', 'videos'),
        path.join(contentPath, 'media', 'images'),
        path.join(contentPath, 'media', 'manufacturers')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Create default sound config maybe? Or just leave directories empty.
    // Ensure config.json exists
    const configPath = path.join(contentPath, 'config.json');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({
            theme: "origin",
            kiosk: { enabled: false, theme: "neon_arcade" }
        }, null, 2));
    }
};

// IPC
const emulatorManager = require('./emulators.cjs');
const databaseManager = require('./database.cjs');

ipcMain.handle('db-scan', async (event, system) => {
    return await databaseManager.scanSystem(system);
});

ipcMain.handle('db-get-games', async (event, system) => {
    return databaseManager.getGames(system);
});

ipcMain.handle('db-delete-game', async (event, id) => {
    return databaseManager.deleteGame(id);
});

ipcMain.handle('db-reset-system', async (event, system) => {
    return databaseManager.resetSystem(system);
});

ipcMain.handle('emu-status', async () => {
    return await emulatorManager.getStatus();
});

ipcMain.handle('emu-uninstall-retroarch', async () => {
    return await emulatorManager.uninstallRetroArch();
});

ipcMain.on('emu-install-retroarch', (event, version) => {
    emulatorManager.installRetroArch(event.sender, version);
});

ipcMain.handle('emu-install-core', async (event, system) => {
    return await emulatorManager.installCore(event.sender, system);
});

ipcMain.handle('emu-install-all-cores', async (event) => {
    return await emulatorManager.installAllCores(event.sender);
});

ipcMain.handle('emu-delete-system', async (event, systemId) => {
    return await emulatorManager.deleteSystem(systemId);
});

const scraperManager = require('./scraper.cjs');
const webServer = require('./webserver.cjs');
const configManager = require('./config.cjs');
const wikiScraper = require('./wiki.cjs');
const pexels = require('./pexels.cjs');
const saveManager = require('./saves.cjs');
const manufacturerManager = require('./manufacturers.cjs');

const currentConfig = configManager.get();
if (currentConfig.pexelsKey) {
    pexels.initClient(currentConfig.pexelsKey);
}

// Config IPC
ipcMain.handle('get-config', () => {
    return configManager.get();
});

ipcMain.handle('set-config', (event, { key, value }) => {
    const r = configManager.set(key, value);
    if (key === 'pexelsKey') {
        pexels.initClient(value);
    }
    return r;
});

// Wiki IPC
ipcMain.handle('wiki-get-info', async (event, systemId) => {
    return await wikiScraper.getSystemInfo(systemId);
});

// Pexels IPC
ipcMain.handle('pexels-search-image', async (event, query) => {
    return await pexels.searchImage(query);
});

ipcMain.handle('pexels-search-video', async (event, query) => {
    return await pexels.searchVideo(query);
});

// Manufacturer IPC
ipcMain.handle('get-manufacturers', () => {
    return manufacturerManager.getAll();
});

ipcMain.handle('add-manufacturer', (event, { name, logo }) => {
    return manufacturerManager.add(name, logo);
});

ipcMain.handle('delete-manufacturer', (event, id) => {
    return manufacturerManager.delete(id);
});

// Backup Handler
ipcMain.handle('backup-saves', async () => {
    return await saveManager.backupSaves();
});

// Start web server (after all definitions)
webServer.start();

ipcMain.handle('webserver-status', () => {
    return webServer.getStatus();
});

ipcMain.handle('scraper-start', async (event, system, options) => {
    return await scraperManager.scrape(event.sender, system, options);
});

ipcMain.handle('db-import-xml', async (event, system) => {
    return await databaseManager.importGamelist(system);
});

ipcMain.handle('emu-scan-systems', async () => {
    return await emulatorManager.getConfiguredSystems();
});

ipcMain.handle('emu-create-system', async (event, { id, name, core, image, logo, manufacturer, extensions }) => { // Added extensions here
    return await emulatorManager.createSystem(id, name, core, image, logo, manufacturer, extensions);
});

ipcMain.handle('emu-get-cores', async () => {
    return await emulatorManager.getAvailableCores();
});

ipcMain.handle('game-list', async (event, system) => {
    return await emulatorManager.listGames(system);
});

ipcMain.handle('game-launch', async (event, { system, game }) => {
    return await emulatorManager.launchGame(system, game);
});

ipcMain.handle('get-launch-options', async (event, system) => {
    return await emulatorManager.getLaunchOptions(system);
});

ipcMain.handle('set-launch-options', async (event, { system, options }) => {
    return await emulatorManager.setLaunchOptions(system, options);
});

// --- NEW RETROARCH CONFIG HANDLERS ---
ipcMain.handle('get-retroarch-config', async () => {
    return await emulatorManager.readRetroArchConfig();
});

ipcMain.handle('set-retroarch-config', async (event, options) => {
    return await emulatorManager.setRetroArchConfig(options);
});

const romCleaner = require('./rom_cleaner.cjs');

// --- CLEANER HANDLER (REWRITTEN IN NODE.JS) ---
ipcMain.on('clean-roms', async (event, { systemId, execute }) => {
    const contentPath = getDataPath();
    const romsPath = path.join(contentPath, 'Roms');
    let targetPath = romsPath;

    if (systemId && systemId !== 'all') {
        targetPath = path.join(romsPath, systemId);
    }

    event.sender.send('clean-log', `🚀 Démarrage du nettoyage : ${targetPath}`);
    await romCleaner.processDirectory(targetPath, execute, event.sender);
});

app.whenReady().then(() => {
    initializeDirectories(); // Create content folders
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
