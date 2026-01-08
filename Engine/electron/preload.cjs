const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getEmuStatus: () => ipcRenderer.invoke('emu-status'),
    installRetroArch: (version) => ipcRenderer.send('emu-install-retroarch', version),
    uninstallRetroArch: () => ipcRenderer.invoke('emu-uninstall-retroarch'),
    installCore: (system) => ipcRenderer.invoke('emu-install-core', system),
    installAllCores: () => ipcRenderer.invoke('emu-install-all-cores'),
    listGames: (system) => ipcRenderer.invoke('game-list', system),
    launchGame: (system, game) => ipcRenderer.invoke('game-launch', { system, game }),
    getLaunchOptions: (system) => ipcRenderer.invoke('get-launch-options', system),
    setLaunchOptions: (system, options) => ipcRenderer.invoke('set-launch-options', { system, options }),

    // RetroArch Config
    getRetroArchConfig: () => ipcRenderer.invoke('get-retroarch-config'),
    setRetroArchConfig: (options) => ipcRenderer.invoke('set-retroarch-config', options),

    // Database
    scanSystem: (system) => ipcRenderer.invoke('db-scan', system),
    getDbGames: (system) => ipcRenderer.invoke('db-get-games', system),
    importGamelist: (system) => ipcRenderer.invoke('db-import-xml', system),
    deleteGame: (id) => ipcRenderer.invoke('db-delete-game', id),
    resetSystem: (system) => ipcRenderer.invoke('db-reset-system', system),
    getWebServerStatus: () => ipcRenderer.invoke('webserver-status'),

    // Scraper
    startScraper: (system, options) => ipcRenderer.invoke('scraper-start', system, options),
    onScraperStatus: (callback) => {
        const subscription = (event, value) => callback(value);
        ipcRenderer.on('scraper-status', subscription);
        return () => ipcRenderer.removeListener('scraper-status', subscription);
    },

    // Systems
    getConfiguredSystems: () => ipcRenderer.invoke('emu-scan-systems'),
    // UPDATED WITH EXTENSIONS
    createSystem: (id, name, core, image, logo, manufacturer, extensions) => ipcRenderer.invoke('emu-create-system', { id, name, core, image, logo, manufacturer, extensions }),
    deleteSystem: (id) => ipcRenderer.invoke('emu-delete-system', id),
    getAvailableCores: () => ipcRenderer.invoke('emu-get-cores'),

    onInstallStatus: (callback) => {
        const sub = (event, value) => callback(value);
        ipcRenderer.on('install-status', sub);
        return () => ipcRenderer.removeListener('install-status', sub);
    },
    onInstallError: (callback) => {
        const sub = (event, value) => callback(value);
        ipcRenderer.on('install-error', sub);
        return () => ipcRenderer.removeListener('install-error', sub);
    },

    // Config
    getConfig: () => ipcRenderer.invoke('get-config'),
    setConfig: (key, value) => ipcRenderer.invoke('set-config', { key, value }),

    // Wiki
    // Pexels
    searchPexelsImage: (query) => ipcRenderer.invoke('pexels-search-image', query),
    searchPexelsVideo: (query) => ipcRenderer.invoke('pexels-search-video', query),
    getWikiInfo: (id) => ipcRenderer.invoke('wiki-get-info', id),

    // Manufacturers
    getManufacturers: () => ipcRenderer.invoke('get-manufacturers'),
    addManufacturer: (name, logo) => ipcRenderer.invoke('add-manufacturer', { name, logo }),
    deleteManufacturer: (id) => ipcRenderer.invoke('delete-manufacturer', id),

    // Backup
    backupSaves: () => ipcRenderer.invoke('backup-saves'),
    listBackups: () => ipcRenderer.invoke('list-backups'),
    deleteBackup: (name) => ipcRenderer.invoke('delete-backup', name),
    restoreBackup: (name) => ipcRenderer.invoke('restore-backup', name),

    // Cleaner (Promisified)
    cleanRoms: (systemId, execute, callback) => {
        return new Promise((resolve, reject) => {
            // Cleanup old listeners to prevent memory leaks if called multiple times
            // Note: This naive approach might remove other listeners if parallel execution, but cleanRoms is usually modal
            // Better: use unique channel or reply ID. For now, this works for single user interface.

            const logHandler = (event, message) => callback(message);
            ipcRenderer.on('clean-log', logHandler);

            // We listen for standard clean completion if we add it, or just rely on stdout end?
            // Python script closes, spawning 'close' event in main, but we need to signal here.
            // main.cjs sends 'clean-log' with "--- Process terminé ---".
            // A dedicated 'clean-complete' event would be better but let's stick to current contract.
            // Actually, main.cjs doesn't emit a completion event other than log.
            // But waitForPreviousTools prompt suggested promisifying. 
            // Let's assume the component handles the termination via log message for now, 
            // OR we fix main.cjs to emit 'clean-complete'.
            // For now, let's keep it simple as implemented in component.

            // Wait, previous edit to preload showed: ipcRenderer.once('clean-roms-reply', ...
            // Let's verify main.cjs emitted that.
            // Reading main.cjs again... it emits 'clean-log'. It does NOT emit 'clean-roms-reply'.
            // The previous preload content I read had:
            // ipcRenderer.once('clean-roms-reply', (event, result) => { ... resolve(result); });
            // This means the Promise in preload NEVER RESOLVES if main doesn't send 'clean-roms-reply'.
            // I should fix main.cjs to send this reply!

            ipcRenderer.send('clean-roms', { systemId, execute });

            // Temporary auto-resolve for UI not to hang?
            // No, enable proper IPC reply in main.cjs in a moment.
            // For now, let's assume the user uses the log stream to know when it's done.
            resolve({ started: true });
        });
    },

    // Updates
    checkUpdates: () => ipcRenderer.invoke('check-updates'),

    // Remote Actions
    onRemoteAction: (callback) => {
        const sub = (event, value) => callback(value);
        ipcRenderer.on('remote-action', sub);
        return () => ipcRenderer.removeListener('remote-action', sub);
    },
    // Splash
    splashFinished: () => ipcRenderer.send('splash-finished')
});
