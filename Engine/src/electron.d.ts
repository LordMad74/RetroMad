export interface ElectronAPI {
    // Emulator Status & Management
    getEmuStatus: () => Promise<{ retroarch: boolean }>;
    installRetroArch: (version: string) => void;
    uninstallRetroArch: () => Promise<{ success: boolean }>;
    installCore: (system: string) => Promise<{ success: boolean; error?: string }>;
    installAllCores: () => Promise<{ success: boolean; errors: string[] }>;
    getAvailableCores: () => Promise<any>;

    // Game Management
    listGames: (system: string) => Promise<any[]>;
    launchGame: (system: string, game: any) => Promise<{ success: boolean; error?: string }>;
    getLaunchOptions: (system: string) => Promise<any>;
    setLaunchOptions: (system: string, options: any) => Promise<{ success: boolean }>;

    // RetroArch Config
    getRetroArchConfig: () => Promise<any>;
    setRetroArchConfig: (options: any) => Promise<{ success: boolean }>;

    // Database
    scanSystem: (system: string) => Promise<any>;
    getDbGames: (system: string) => Promise<any[]>;
    importGamelist: (system: string) => Promise<any>;
    deleteGame: (id: string) => Promise<any>;
    resetSystem: (system: string) => Promise<any>;
    getWebServerStatus: () => Promise<{ running: boolean; port: number; ip: string; hostname: string; url: string; fallbackUrl: string }>;

    // Scraper
    startScraper: (system: string, options: any) => Promise<any>;
    onScraperStatus: (callback: (data: any) => void) => () => void;

    // Systems
    getConfiguredSystems: () => Promise<any[]>;
    createSystem: (id: string, name: string, core: string, image: string, logo: string, manufacturer: string, extensions: string[]) => Promise<{ success: boolean }>;
    deleteSystem: (id: string) => Promise<{ success: boolean }>;

    // Installation Events
    onInstallStatus: (callback: (data: { step: string; progress: number; message: string }) => void) => () => void;
    onInstallError: (callback: (data: string) => void) => () => void;

    // App Config
    getConfig: () => Promise<any>;
    setConfig: (key: string, value: any) => Promise<any>;

    // External Services
    searchPexelsImage: (query: string) => Promise<any>;
    searchPexelsVideo: (query: string) => Promise<any>;
    getWikiInfo: (id: string) => Promise<any>;

    // Manufacturers
    getManufacturers: () => Promise<any[]>;
    addManufacturer: (name: string, logo: string) => Promise<any>;
    deleteManufacturer: (id: string) => Promise<any>;

    // Backups
    backupSaves: () => Promise<{ success: boolean; path?: string; message: string; name?: string; error?: string }>;
    listBackups: () => Promise<Array<{ name: string; size: string; date: string; path: string }>>;
    deleteBackup: (name: string) => Promise<{ success: boolean }>;
    restoreBackup: (name: string) => Promise<{ success: boolean; message: string; error?: string }>;

    // Tools
    cleanRoms: (systemId: string, execute: boolean, callback: (msg: string) => void) => Promise<any>;

    // Updates
    checkUpdates: () => Promise<{
        current: string;
        latest: string;
        url: string;
        updateAvailable: boolean;
        notes?: string;
        error?: string;
    }>;

    // Remote Actions
    onRemoteAction: (callback: (data: { type: string, value?: any, key?: string }) => void) => () => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
