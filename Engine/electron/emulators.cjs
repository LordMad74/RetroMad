const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { app } = require('electron');
const { spawn } = require('child_process');
const sevenBin = require('7zip-bin');
const { extractFull } = require('node-7z');

// Helper to get Content path
const getEmulatorsPath = () => {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        return path.resolve(path.join(__dirname, '../../Content/Emulators'));
    } else {
        return path.join(path.dirname(process.execPath), 'Content/Emulators');
    }
};

const getRomsPath = () => {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        return path.resolve(path.join(__dirname, '../../Content/Roms'));
    } else {
        return path.join(path.dirname(process.execPath), 'Content/Roms');
    }
}

// URLs
const URLS = {
    stable: "https://buildbot.libretro.com/stable/1.19.1/windows/x86_64/RetroArch.7z",
    nightly: "https://buildbot.libretro.com/nightly/windows/x86_64/RetroArch.7z"
};

const CORES = {
    // --- NINTENDO ---
    'nes': [
        { id: 'fceumm', name: 'FCEUmm', lib: 'fceumm_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/fceumm_libretro.dll.zip" },
        { id: 'nestopia', name: 'Nestopia', lib: 'nestopia_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/nestopia_libretro.dll.zip" },
        { id: 'mesen', name: 'Mesen', lib: 'mesen_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mesen_libretro.dll.zip" }
    ],
    'snes': [
        { id: 'snes9x', name: 'Snes9x (Current)', lib: 'snes9x_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/snes9x_libretro.dll.zip" },
        { id: 'bsnes', name: 'bsnes', lib: 'bsnes_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/bsnes_libretro.dll.zip" },
        { id: 'mesen-s', name: 'Mesen-S', lib: 'mesen-s_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mesen-s_libretro.dll.zip" }
    ],
    'n64': [
        { id: 'mupen64plus_next', name: 'Mupen64Plus-Next', lib: 'mupen64plus_next_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mupen64plus_next_libretro.dll.zip" },
        { id: 'parallel_n64', name: 'ParaLLEl N64', lib: 'parallel_n64_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/parallel_n64_libretro.dll.zip" }
    ],
    'gb': [
        { id: 'gambatte', name: 'Gambatte', lib: 'gambatte_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/gambatte_libretro.dll.zip" },
        { id: 'mgba', name: 'mGBA', lib: 'mgba_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mgba_libretro.dll.zip" },
        { id: 'sameboy', name: 'SameBoy', lib: 'sameboy_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/sameboy_libretro.dll.zip" }
    ],
    'gbc': [
        { id: 'gambatte', name: 'Gambatte', lib: 'gambatte_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/gambatte_libretro.dll.zip" },
        { id: 'mgba', name: 'mGBA', lib: 'mgba_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mgba_libretro.dll.zip" }
    ],
    'gba': [
        { id: 'mgba', name: 'mGBA', lib: 'mgba_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mgba_libretro.dll.zip" },
        { id: 'vba_m', name: 'VBA-M', lib: 'vba_m_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/vba_m_libretro.dll.zip" },
        { id: 'gpsp', name: 'gpSP', lib: 'gpsp_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/gpsp_libretro.dll.zip" }
    ],
    'nds': [
        { id: 'melonds', name: 'melonDS', lib: 'melonds_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/melonds_libretro.dll.zip" },
        { id: 'desmume', name: 'DeSmuME', lib: 'desmume_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/desmume_libretro.dll.zip" }
    ],
    'gc': [
        { id: 'dolphin', name: 'Dolphin', lib: 'dolphin_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/dolphin_libretro.dll.zip" }
    ],
    'wii': [
        { id: 'dolphin', name: 'Dolphin', lib: 'dolphin_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/dolphin_libretro.dll.zip" }
    ],
    '3ds': [
        { id: 'citra', name: 'Citra', lib: 'citra_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/citra_libretro.dll.zip" }
    ],

    // --- SEGA ---
    'megadrive': [
        { id: 'genesis_plus_gx', name: 'Genesis Plus GX', lib: 'genesis_plus_gx_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/genesis_plus_gx_libretro.dll.zip" },
        { id: 'picodrive', name: 'PicoDrive', lib: 'picodrive_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/picodrive_libretro.dll.zip" }
    ],
    'mastersystem': [
        { id: 'genesis_plus_gx', name: 'Genesis Plus GX', lib: 'genesis_plus_gx_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/genesis_plus_gx_libretro.dll.zip" },
        { id: 'picodrive', name: 'PicoDrive', lib: 'picodrive_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/picodrive_libretro.dll.zip" }
    ],
    'saturn': [
        { id: 'yabause', name: 'Yabause', lib: 'yabause_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/yabause_libretro.dll.zip" },
        { id: 'mednafen_saturn', name: 'Beetle Saturn', lib: 'mednafen_saturn_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mednafen_saturn_libretro.dll.zip" }
    ],
    'dreamcast': [
        { id: 'flycast', name: 'Flycast', lib: 'flycast_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/flycast_libretro.dll.zip" }
    ],

    // --- SONY ---
    'psx': [
        { id: 'mednafen_psx_hw', name: 'Beetle PSX HW', lib: 'mednafen_psx_hw_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mednafen_psx_hw_libretro.dll.zip" },
        { id: 'pcsx_rearmed', name: 'PCSX ReARMed', lib: 'pcsx_rearmed_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/pcsx_rearmed_libretro.dll.zip" },
        { id: 'duckstation', name: 'DuckStation', lib: 'duckstation_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/duckstation_libretro.dll.zip" }
    ],
    'psp': [
        { id: 'ppsspp', name: 'PPSSPP', lib: 'ppsspp_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/ppsspp_libretro.dll.zip" }
    ],
    'ps2': [
        { id: 'pcsx2', name: 'PCSX2 (LRPS2)', lib: 'pcsx2_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/pcsx2_libretro.dll.zip" }
    ],

    // --- ARCADE ---
    'arcade': [
        { id: 'fbneo', name: 'FinalBurn Neo', lib: 'fbneo_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/fbneo_libretro.dll.zip" },
        { id: 'mame2003', name: 'MAME 2003', lib: 'mame2003_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mame2003_libretro.dll.zip" },
        { id: 'mame', name: 'MAME (Current)', lib: 'mame_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mame_libretro.dll.zip" }
    ],

    // --- ATARI ---
    'atari2600': [
        { id: 'stella', name: 'Stella', lib: 'stella_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/stella_libretro.dll.zip" }
    ],
    'atari7800': [
        { id: 'prosystem', name: 'ProSystem', lib: 'prosystem_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/prosystem_libretro.dll.zip" }
    ],
    'atarilynx': [
        { id: 'handy', name: 'Handy', lib: 'handy_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/handy_libretro.dll.zip" }
    ],
    'atarijaguar': [
        { id: 'virtualjaguar', name: 'Virtual Jaguar', lib: 'virtualjaguar_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/virtualjaguar_libretro.dll.zip" }
    ],

    // --- COMPUTERS & OTHERS ---
    'dos': [
        { id: 'dosbox_pure', name: 'DOSBox Pure', lib: 'dosbox_pure_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/dosbox_pure_libretro.dll.zip" },
        { id: 'dosbox_svn', name: 'DOSBox-SVN', lib: 'dosbox_svn_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/dosbox_svn_libretro.dll.zip" }
    ],
    'amiga': [
        { id: 'puae', name: 'PUAE', lib: 'puae_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/puae_libretro.dll.zip" }
    ],
    'c64': [
        { id: 'vice_x64', name: 'VICE x64', lib: 'vice_x64_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/vice_x64_libretro.dll.zip" }
    ],
    'msx': [
        { id: 'bluemsx', name: 'blueMSX', lib: 'bluemsx_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/bluemsx_libretro.dll.zip" }
    ],
    'pcengine': [
        { id: 'mednafen_pce_fast', name: 'Beetle PCE Fast', lib: 'mednafen_pce_fast_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mednafen_pce_fast_libretro.dll.zip" }
    ],
    '3do': [
        { id: 'opera', name: 'Opera', lib: 'opera_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/opera_libretro.dll.zip" }
    ],
    'neogeo': [
        { id: 'fbneo', name: 'FinalBurn Neo', lib: 'fbneo_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/fbneo_libretro.dll.zip" }
    ],
    'wonderswan': [
        { id: 'beetle_wswan', name: 'Beetle WonderSwan', lib: 'mednafen_wswan_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/mednafen_wswan_libretro.dll.zip" }
    ],
    'colecovision': [
        { id: 'gearcoleco', name: 'Gearcoleco', lib: 'gearcoleco_libretro.dll', url: "https://buildbot.libretro.com/nightly/windows/x86_64/latest/gearcoleco_libretro.dll.zip" }
    ]
};

const EXTENSIONS = {
    'nes': ['.nes', '.unf', '.zip', '.7z'],
    'snes': ['.sfc', '.smc', '.zip', '.7z'],
    'megadrive': ['.md', '.gen', '.bin', '.zip', '.7z'],
    'mastersystem': ['.sms', '.zip', '.7z'],
    'psx': ['.cue', '.m3u', '.ccd', '.iso', '.chd', '.pbp'],
    'arcade': ['.zip', '.7z', '.chd'],
    'gb': ['.gb', '.zip', '.7z'],
    'gbc': ['.gbc', '.zip', '.7z'],
    'gba': ['.gba', '.zip', '.7z'],
    'n64': ['.n64', '.z64', '.zip', '.7z'],
    'nds': ['.nds', '.zip', '.7z'],
    'gc': ['.iso', '.rvz', '.gcm'],
    'wii': ['.iso', '.wbfs', '.rvz'],
    'switch': ['.nsp', '.xci'],
    'psp': ['.iso', '.cso', '.pbp'],
    '3ds': ['.3ds', '.cia'],
    'ps2': ['.iso', '.bin', '.chd', '.gz'],
    'xbox': ['.iso', '.xbe'],
    'dreamcast': ['.cdi', '.gdi', '.chd'],
    'saturn': ['.cue', '.iso', '.ccd', '.mds', '.chd'],
    'pcengine': ['.pce', '.cue', '.zip', '.7z'],
    'dos': ['.exe', '.com', '.bat', '.zip'],
    'amiga': ['.adf', '.ipf', '.lha', '.zip'],
    'c64': ['.d64', '.t64', '.tap', '.prg', '.zip'],
    'atari2600': ['.a26', '.bin', '.zip'],
    'atari7800': ['.a78', '.bin', '.zip'],
    'atarilynx': ['.lnx', '.zip'],
    'atarijaguar': ['.j64', '.jag', '.zip'],
    'msx': ['.mx1', '.mx2', '.rom', '.zip'],
    '3do': ['.iso', '.cue', '.bin'],
    'neogeo': ['.zip', '.7z'],
    'wonderswan': ['.ws', '.wsc', '.zip'],
    'colecovision': ['.col', '.rom', '.zip'],
    'default': ['.zip', '.7z', '.iso', '.bin', '.cue', '.nes', '.sfc', '.smc', '.md', '.gba', '.gbc', '.gb', '.n64', '.z64']
};

class EmulatorManager {
    constructor() {
        this.basePath = getEmulatorsPath();
        this.romsPath = getRomsPath();
    }

    getAllowedExtensions(system) {
        const config = this.loadConfig();
        const sysConfig = config.systems[system] || {};

        // User override
        if (sysConfig.extensions && Array.isArray(sysConfig.extensions) && sysConfig.extensions.length > 0) {
            return sysConfig.extensions;
        }

        return EXTENSIONS[system.toLowerCase()] || EXTENSIONS['default'];
    }

    // --- CONFIGURATION ---
    getConfigPath() {
        return path.join(path.dirname(this.basePath), 'settings.json');
    }

    loadConfig() {
        const p = this.getConfigPath();
        if (fs.existsSync(p)) {
            try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
            catch (e) { console.error('Config parse error', e); }
        }
        return { global: { fullscreen: true }, systems: {} };
    }

    saveConfig(config) {
        fs.writeFileSync(this.getConfigPath(), JSON.stringify(config, null, 2));
    }

    // --- SYSTEM MANAGEMENT ---
    async getConfiguredSystems() {
        const config = this.loadConfig();
        const systems = [];

        if (fs.existsSync(this.romsPath)) {
            const dirs = fs.readdirSync(this.romsPath).filter(f => {
                return fs.statSync(path.join(this.romsPath, f)).isDirectory() && !f.startsWith('.') && !f.startsWith('_DELETED_');
            });

            dirs.forEach(dir => {
                const sysConfig = config.systems[dir] || {};
                let img = sysConfig.image || null;
                let logo = sysConfig.logo || null;
                const sysPath = path.join(this.romsPath, dir);

                if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                    img = `http://localhost:3000/media/Roms/${dir}/${img}`.replace(/\\/g, '/');
                }
                if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
                    logo = `http://localhost:3000/media/Roms/${dir}/${logo}`.replace(/\\/g, '/');
                }

                systems.push({
                    id: dir,
                    name: sysConfig.name || dir,
                    manufacturer: sysConfig.manufacturer || '',
                    core: sysConfig.core || null,
                    extensions: sysConfig.extensions || null, // EXPOSE EXTENSIONS TO FRONTEND
                    image: img,
                    logo: logo,
                    path: sysPath
                });
            });
        }
        return systems;
    }

    async createSystem(id, name, coreId, image = null, logo = null, manufacturer = null, extensions = null) {
        const sysPath = path.join(this.romsPath, id);
        if (!fs.existsSync(sysPath)) {
            fs.mkdirSync(sysPath, { recursive: true });
        }

        let storedImage = image;
        let storedLogo = logo;

        const isExternal = (url) => url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('localhost:3000');

        if (isExternal(image)) {
            try {
                const response = await axios({ url: image, method: 'GET', responseType: 'arraybuffer' });
                const ext = path.extname(image).split('?')[0] || '.jpg';
                const fileName = `background${ext}`;
                const destPath = path.join(sysPath, fileName);
                fs.writeFileSync(destPath, response.data);
                storedImage = fileName;
            } catch (e) {
                console.error("Failed to download system image", e);
            }
        } else if (image && image.includes('localhost:3000')) {
            const basename = path.basename(image);
            if (basename) storedImage = basename;
        }

        if (isExternal(logo)) {
            try {
                const response = await axios({ url: logo, method: 'GET', responseType: 'arraybuffer' });
                const ext = path.extname(logo).split('?')[0] || '.png';
                const fileName = `logo${ext}`;
                const destPath = path.join(sysPath, fileName);
                fs.writeFileSync(destPath, response.data);
                storedLogo = fileName;
            } catch (e) {
                console.error("Failed to download system logo", e);
            }
        } else if (logo && logo.includes('localhost:3000')) {
            const basename = path.basename(logo);
            if (basename) storedLogo = basename;
        }

        const config = this.loadConfig();
        if (!config.systems) config.systems = {};

        const current = config.systems[id] || {};

        config.systems[id] = {
            ...current,
            name: name,
            core: coreId
        };
        if (storedImage !== null) config.systems[id].image = storedImage;
        if (storedLogo !== null) config.systems[id].logo = storedLogo;
        if (manufacturer !== null) config.systems[id].manufacturer = manufacturer;

        // Save Extensions if provided
        if (extensions) {
            config.systems[id].extensions = extensions;
        }

        this.saveConfig(config);
        return { success: true };
    }

    async deleteSystem(id) {
        const sysPath = path.join(this.romsPath, id);
        if (fs.existsSync(sysPath)) {
            // Safe delete: rename folder with timestamp to avoid accidental data loss
            const newPath = path.join(this.romsPath, `_DELETED_${id}_${Date.now()}`);
            fs.renameSync(sysPath, newPath);
        }

        const config = this.loadConfig();
        if (config.systems && config.systems[id]) {
            delete config.systems[id];
            this.saveConfig(config);
        }
        return { success: true };
    }

    async getAvailableCores() {
        const raPath = path.join(this.basePath, 'RetroArch');
        const coresDir = path.join(raPath, 'cores');
        let installedFiles = [];
        try {
            if (fs.existsSync(coresDir)) {
                installedFiles = fs.readdirSync(coresDir);
            }
        } catch (e) {
            console.error("Error reading cores dir:", e);
        }

        const coresWithStatus = JSON.parse(JSON.stringify(CORES));

        for (const sys in coresWithStatus) {
            coresWithStatus[sys].forEach(core => {
                core.installed = installedFiles.includes(core.lib);
            });
        }
        return coresWithStatus;
    }

    // --- EMULATOR OPERATIONS ---

    async getStatus() {
        const raPath = path.join(this.basePath, 'RetroArch');
        return { retroarch: fs.existsSync(path.join(raPath, 'retroarch.exe')) };
    }

    async uninstallRetroArch() {
        const raPath = path.join(this.basePath, 'RetroArch');
        const oldRaPath = path.join(this.basePath, 'RetroArch-Win64');
        let deleted = false;
        if (fs.existsSync(raPath)) { fs.rmSync(raPath, { recursive: true, force: true }); deleted = true; }
        if (fs.existsSync(oldRaPath)) { fs.rmSync(oldRaPath, { recursive: true, force: true }); deleted = true; }
        return { success: deleted };
    }

    async installRetroArch(eventSender, version = 'stable') {
        const downloadUrl = URLS[version] || URLS.stable;
        const archiveName = 'RetroArch.7z';
        const archivePath = path.join(this.basePath, archiveName);
        try {
            if (!fs.existsSync(this.basePath)) { fs.mkdirSync(this.basePath, { recursive: true }); }
            eventSender.send('install-status', { step: 'download', progress: 0, message: `Downloading RetroArch (${version})...` });
            const writer = fs.createWriteStream(archivePath);
            const response = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });
            const totalLength = parseInt(response.headers['content-length'], 10);
            let downloadedLength = 0;
            response.data.on('data', (chunk) => {
                downloadedLength += chunk.length;
                const progress = totalLength ? Math.round((downloadedLength / totalLength) * 100) : 0;
                eventSender.send('install-status', { step: 'download', progress, message: `Downloading: ${progress}%` });
            });
            response.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
            eventSender.send('install-status', { step: 'extract', progress: 0, message: 'Extracting...' });
            await new Promise((resolve, reject) => {
                const extraction = extractFull(archivePath, this.basePath, { $bin: sevenBin.path7za, $progress: true });
                extraction.on('end', () => resolve());
                extraction.on('error', (err) => reject(err));
            });
            try { fs.unlinkSync(archivePath); } catch (e) { }
            const extractedPath = path.join(this.basePath, 'RetroArch-Win64');
            const targetPath = path.join(this.basePath, 'RetroArch');
            if (fs.existsSync(extractedPath)) {
                if (fs.existsSync(targetPath)) { fs.rmSync(targetPath, { recursive: true, force: true }); }
                fs.renameSync(extractedPath, targetPath);
            }
            eventSender.send('install-status', { step: 'complete', progress: 100, message: 'Installation Terminée!' });
            return { success: true };
        } catch (error) {
            eventSender.send('install-error', error.message);
            return { success: false, error: error.message };
        }
    }

    async installCore(eventSender, coreId) {
        let coreDef = null;
        for (const sys in CORES) {
            const found = CORES[sys].find(c => c.id === coreId);
            if (found) { coreDef = found; break; }
        }
        const normalizedId = coreId.toLowerCase();
        if (!coreDef && CORES[normalizedId]) {
            coreDef = CORES[normalizedId][0];
        }

        if (!coreDef) return { success: false, error: 'Unknown core or system' };

        const raPath = path.join(this.basePath, 'RetroArch');
        const coresPath = path.join(raPath, 'cores');
        const tempPath = path.join(coresPath, 'temp_install'); // Use a temp folder for extraction

        if (!fs.existsSync(coresPath)) fs.mkdirSync(coresPath, { recursive: true });
        if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });
        fs.mkdirSync(tempPath);

        const zipPath = path.join(tempPath, 'core.zip');

        try {
            if (eventSender) eventSender.send('install-status', { step: 'download_core', progress: 0, message: `Downloading Core: ${coreDef.name}...` });

            const response = await axios({ url: coreDef.url, method: 'GET', responseType: 'stream' });
            const writer = fs.createWriteStream(zipPath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });

            await new Promise((resolve, reject) => {
                const extraction = extractFull(zipPath, tempPath, { $bin: sevenBin.path7za });
                extraction.on('end', () => resolve());
                extraction.on('error', (err) => reject(err));
            });

            // Find the DLL in temp folder
            const files = fs.readdirSync(tempPath);
            const dllFile = files.find(f => f.endsWith('.dll'));

            if (dllFile) {
                const source = path.join(tempPath, dllFile);
                const dest = path.join(coresPath, coreDef.lib); // RENAME TO MATCH EXPECTED LIB

                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                fs.renameSync(source, dest);

                console.log(`Core installed: ${dllFile} -> ${dest}`);
            } else {
                throw new Error("No DLL found in core archive");
            }

            // Cleanup
            try { fs.rmSync(tempPath, { recursive: true, force: true }); } catch (e) { }

            return { success: true };
        } catch (e) {
            console.error("Install core error:", e);
            try { fs.rmSync(tempPath, { recursive: true, force: true }); } catch (e2) { }
            return { success: false, error: e.message };
        }
    }

    async installAllCores(eventSender) {
        const uniqueCores = [];
        for (const sys in CORES) {
            CORES[sys].forEach(core => {
                if (!uniqueCores.find(c => c.id === core.id)) {
                    uniqueCores.push(core);
                }
            });
        }

        const total = uniqueCores.length;
        let successCount = 0;
        let errors = [];

        for (let i = 0; i < total; i++) {
            const core = uniqueCores[i];
            const progress = Math.round(((i) / total) * 100);
            if (eventSender) eventSender.send('install-status', { step: 'batch', progress: progress, message: `Installation (${i + 1}/${total}): ${core.name}` });

            const res = await this.installCore(null, core.id);
            if (res.success) successCount++;
            else errors.push(`${core.name}: ${res.error}`);
        }

        if (eventSender) eventSender.send('install-status', { step: 'complete', progress: 100, message: `Terminé ! ${successCount} installés.` });
        return { success: true, errors: errors };
    }

    async listGames(system) {
        const sysPath = path.join(this.romsPath, system);
        if (!fs.existsSync(sysPath)) return [];
        const files = fs.readdirSync(sysPath);
        return files.filter(f => !f.startsWith('.')).map(f => ({
            filename: f,
            path: path.join(sysPath, f),
            name: path.parse(f).name
        }));
    }

    async setLaunchOptions(system, options) {
        const config = this.loadConfig();
        if (system === 'global') {
            config.global = { ...config.global, ...options };
        } else {
            config.systems[system] = { ...(config.systems[system] || {}), ...options };
        }
        this.saveConfig(config);
        return { success: true };
    }

    async getLaunchOptions(system) {
        const config = this.loadConfig();
        if (system === 'global') return config.global;
        return config.systems[system] || {};
    }

    async launchGame(system, gameReturn) {
        const config = this.loadConfig();
        const globalOpts = config.global || {};
        const sysOpts = config.systems[system] || {};
        const fullscreen = sysOpts.fullscreen !== undefined ? sysOpts.fullscreen : (globalOpts.fullscreen !== undefined ? globalOpts.fullscreen : true);

        // Resolve Core
        let coreLib = null;
        let coreId = sysOpts.core;

        // Try to find by ID first
        if (coreId) {
            for (const sys in CORES) {
                const found = CORES[sys].find(c => c.id === coreId);
                if (found) { coreLib = found.lib; break; }
            }
        }

        // Fallback to default core for system
        if (!coreLib && CORES[system.toLowerCase()]) {
            const defaultCore = CORES[system.toLowerCase()][0];
            coreLib = defaultCore.lib;
            coreId = defaultCore.id; // Correctly set ID for installation
        }

        if (!coreLib) return { success: false, error: 'NO_CORE_CONFIGURED' };

        const raPath = path.join(this.basePath, 'RetroArch');
        const exe = path.join(raPath, 'retroarch.exe');
        const corePath = path.join(raPath, 'cores', coreLib);

        // AUTO-INSTALL IF MISSING
        if (!fs.existsSync(corePath)) {
            console.log(`Core missing: ${coreLib}. Attempting auto-install of ${coreId}...`);
            const installRes = await this.installCore(null, coreId);
            if (!installRes.success) {
                return { success: false, error: 'MISSING_CORE_AND_INSTALL_FAILED', coreId: coreId };
            }
        }

        // Check again
        if (!fs.existsSync(corePath)) {
            return { success: false, error: 'MISSING_CORE', coreId: coreId };
        }

        const args = ['-L', corePath, gameReturn.path];
        if (fullscreen) args.push('-f');

        console.log("Launching:", exe, args);
        try {
            const subprocess = spawn(exe, args, { cwd: raPath, detached: true, stdio: 'ignore' });
            subprocess.unref();
            return { success: true };
        } catch (e) {
            return { success: false, error: 'SPAWN_FAILED: ' + e.message };
        }
    }

    // --- RETROARCH CFG MANIPULATION ---

    getRetroArchCfgPath() {
        return path.join(this.basePath, 'RetroArch', 'retroarch.cfg');
    }

    async readRetroArchConfig() {
        const cfgPath = this.getRetroArchCfgPath();
        if (!fs.existsSync(cfgPath)) return {};

        const content = fs.readFileSync(cfgPath, 'utf8');
        const config = {};

        // Basic parser for key = value or key = "value"
        content.split('\n').forEach(line => {
            const match = line.match(/^([a-z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
            if (match) {
                let val = match[2];
                if (val === "true") val = true;
                else if (val === "false") val = false;
                config[match[1]] = val;
            }
        });

        return config;
    }

    async setRetroArchConfig(options) {
        const cfgPath = this.getRetroArchCfgPath();
        if (!fs.existsSync(cfgPath)) return { success: false, error: 'RetroArch not configured yet' };

        let content = fs.readFileSync(cfgPath, 'utf8');

        for (const [key, value] of Object.entries(options)) {
            const strValue = typeof value === 'boolean' ? (value ? "true" : "false") : `"${value}"`;
            const regex = new RegExp(`^${key}\\s*=.*$`, 'm');

            if (regex.test(content)) {
                content = content.replace(regex, `${key} = ${strValue}`);
            } else {
                content += `\n${key} = ${strValue}`;
            }
        }

        fs.writeFileSync(cfgPath, content, 'utf8');
        return { success: true };
    }
}

module.exports = new EmulatorManager();
