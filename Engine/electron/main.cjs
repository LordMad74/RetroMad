const { app, BrowserWindow, protocol, ipcMain, Menu } = require('electron');
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

let splashWindow;
let mainWin;
let isMainWinReady = false;


function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        transparent: false, // Changed to false for better video compatibility
        frame: false,
        alwaysOnTop: true,
        fullscreen: true,
        backgroundColor: '#0a0a0f',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'), // Reuse preload
            webSecurity: false
        }
    });


    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
    splashWindow.on('closed', () => (splashWindow = null));
}


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

    mainWin = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: true,
        frame: false,
        show: false, // Don't show immediately
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
            webSecurity: false
        },
        backgroundColor: '#0f0f13'
    });


    // Enlever le menu complètement
    Menu.setApplicationMenu(null);

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';

    if (process.env.NODE_ENV === 'development') {
        mainWin.loadURL('http://localhost:5173');
        // In dev, we might want tools open
        // mainWin.webContents.openDevTools();
    } else {
        const indexPath = path.resolve(__dirname, '../dist/index.html');
        mainWin.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
        });
    }

    // SPLASH LOGIC: Main window is ready but we wait for splash signaling
    mainWin.once('ready-to-show', () => {
        isMainWinReady = true;
        if (process.env.NODE_ENV === 'development') {
            mainWin.webContents.openDevTools();
        }
    });
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

// Backup Handlers
ipcMain.handle('backup-saves', async () => {
    return await saveManager.backupSaves();
});

ipcMain.handle('list-backups', async () => {
    return await saveManager.listBackups();
});

ipcMain.handle('delete-backup', async (event, name) => {
    return await saveManager.deleteBackup(name);
});

ipcMain.handle('restore-backup', async (event, name) => {
    return await saveManager.restoreBackup(name);
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

ipcMain.handle('db-generate-ai-description', async (event, { gameName, system }) => {
    // Simulated AI generation - In a real app, call OpenAI/Gemini here
    const adverbs = ["Totalement", "Incroyablement", "Vraiment", "Purement"];
    const adjectives = ["épique", "légendaire", "captivant", "révolutionnaire", "culte", "inoubliable"];
    const actions = ["explore un monde", "défie les lois de", "propose une aventure", "redéfinit le genre"];
    const genres = {
        'NES': '8-bit', 'SNES': '16-bit', 'PSX': '32-bit / 3D', 'MEGADRIVE': 'Sega', 'ARCADE': 'Arcade'
    };

    const desc = `${gameName} est un jeu ${adjectives[Math.floor(Math.random() * adjectives.length)]} sur ${genres[system] || system}. 
    Le joueur ${actions[Math.floor(Math.random() * actions.length)]} dans une expérience ${adverbs[Math.floor(Math.random() * adverbs.length)]} ${adjectives[Math.floor(Math.random() * adjectives.length)]}. 
    Un titre indispensable pour tous les fans de RetroMad.`;

    return { description: desc };
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
    event.sender.send('clean-log', `✅ Nettoyage terminé.`);
    event.sender.send('clean-roms-reply', { success: true });
});

ipcMain.on('app-quit', () => {
    if (psBridge) {
        try { psBridge.kill(); } catch (e) { }
    }
    app.exit(0);
});


ipcMain.on('splash-finished', () => {
    const showApp = () => {
        if (splashWindow) splashWindow.close();
        if (mainWin) {
            mainWin.show();
            mainWin.focus();
        }
    };

    if (isMainWinReady) {
        showApp();
    } else {
        // Wait for it to be ready
        if (mainWin) mainWin.once('ready-to-show', showApp);
    }
});



/**
 * Vérifie si une nouvelle version est disponible sur le dépôt GitHub.
 * Utilise l'API GitHub publique pour comparer le tag local avec le dernier tag distant.
 */
ipcMain.handle('check-updates', async () => {
    const currentVersion = 'v0.6.5';
    const https = require('https');

    return new Promise((resolve) => {
        const options = {
            hostname: 'api.github.com',
            path: '/repos/LordMad74/RetroMad/releases/latest',
            headers: { 'User-Agent': 'RetroMad-App' }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const release = JSON.parse(data);
                    const latestVersion = release.tag_name;
                    resolve({
                        current: currentVersion,
                        latest: latestVersion,
                        url: release.html_url,
                        updateAvailable: latestVersion !== currentVersion,
                        notes: release.body
                    });
                } catch (e) {
                    resolve({ current: currentVersion, error: 'Failed to parse update data' });
                }
            });
        }).on('error', (err) => {
            resolve({ current: currentVersion, error: err.message });
        });
    });
});

// --- REMOTE CONTROL LISTENER ---
app.on('remote-command', async ({ action, payload }) => {
    switch (action) {
        case 'launch':
            if (payload.system && payload.game) {
                // Signal frontend to stop BGM if playing
                if (mainWin) mainWin.webContents.send('remote-action', { type: 'launch-start' });

                const games = await databaseManager.getGames(payload.system);
                const game = games.find(g => g.id === payload.game);
                if (game) {
                    emulatorManager.launchGame(payload.system, game);
                }
            }
            break;

        case 'volume':
            // Logic to change OS volume or send command to frontend
            if (mainWin) mainWin.webContents.send('remote-action', { type: 'volume', value: payload.value });
            break;

        case 'nav':
            // Forward navigation to frontend (Up, Down, Left, Right, Select, Back)
            if (mainWin) mainWin.webContents.send('remote-action', { type: 'nav', key: payload.key });
            break;

        case 'quit-game':
            // Close the running emulator
            emulatorManager.stopCurrentGame(); // Assuming this exists or we add it
            break;

        case 'restart-app':
            app.relaunch();
            app.exit();
            break;

        case 'gamepad-down':
        case 'gamepad-up':
            handleGamepadKey(action, payload.key);
            break;
    }
});

// --- HIGH-PERFORMANCE INPUT BRIDGE ---
let psBridge = null;
let lastFocusTime = 0;

function ensurePsBridge() {
    if (psBridge && !psBridge.killed) return;

    // Bypass ExecutionPolicy to avoid permission issues
    psBridge = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '-'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true
    });

    // Advanced C# bridge for ScanCodes (Critical for DirectX/RetroArch) & Focus Control
    const setup = `
        $AddType = @"
        using System;
        using System.Runtime.InteropServices;
        public class Win32 {
            [DllImport("user32.dll")]
            public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, uint dwExtraInfo);
            [DllImport("user32.dll")]
            public static extern uint MapVirtualKey(uint uCode, uint uMapType);
            [DllImport("user32.dll")]
            public static extern bool SetForegroundWindow(IntPtr hWnd);
            [DllImport("user32.dll")]
            public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
            [DllImport("user32.dll")]
            public static extern IntPtr GetForegroundWindow();
        }
"@
        Add-Type -TypeDefinition $AddType
        
        function Send-Key {
            param($vk, $up)
            $scan = [Win32]::MapVirtualKey($vk, 0)
            
            # Extended keys (Arrows, etc) need the 0x1 flag
            $extended = ($vk -in 37,38,39,40,33,34,35,36,45,46)
            
            $flags = 0
            if ($extended) { $flags += 1 }
            if ($up) { $flags += 2 }
            
            [Win32]::keybd_event($vk, $scan, $flags, 0)
        }

        function Ensure-Focus {
            param($procName)
            $p = Get-Process -Name $procName -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($p) {
                [Win32]::ShowWindow($p.MainWindowHandle, 9) # Restore if minimized
                [Win32]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
            }
        }
    \n`;

    psBridge.stdin.write(setup);

    psBridge.on('error', (err) => {
        console.error('Input Bridge Error:', err);
        psBridge = null;
    });

    psBridge.on('exit', () => { psBridge = null; });
}

/**
 * Simule l'appui ou le relâchement d'une touche sur Windows via API Win32 Native.
 * Utilise MapVirtualKey pour générer les ScanCodes (Requis pour RetroArch).
 */
function handleGamepadKey(action, key) {
    ensurePsBridge();
    const isUp = action === 'gamepad-up';

    const vkMap = {
        'Up': 38, 'Down': 40, 'Left': 37, 'Right': 39,
        'A': 88, 'B': 90, 'X': 83, 'Y': 65,    // x, z, s, a
        'Start': 13, 'Select': 161,             // Enter, RShift
        'L1': 81, 'R1': 87, 'L2': 49, 'R2': 50  // q, w, 1, 2
    };

    const vk = vkMap[key];
    if (!vk) return;

    // Aggressive Focus Check (Every 5s to avoid spam)
    const now = Date.now();
    if (now - lastFocusTime > 5000) {
        psBridge.stdin.write(`Ensure-Focus 'retroarch'\n`);
        lastFocusTime = now;
    }

    psBridge.stdin.write(`Send-Key ${vk} ${isUp ? '$true' : '$false'}\n`);
}

app.whenReady().then(() => {
    initializeDirectories();
    ensurePsBridge(); // Pre-warm the input bridge!
    createSplashWindow(); // Show splash first
    createWindow();

    app.on('activate', () => {
        if (!mainWin || mainWin.isDestroyed()) {
            createWindow();
        }
    });

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
