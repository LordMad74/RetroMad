const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// translate system IDs to Skyscraper platforms
const PLATFORM_MAP = {
    'nes': 'nes',
    'snes': 'snes',
    'n64': 'n64',
    'gamecube': 'gamecube',
    'wii': 'wii',
    'gb': 'gb',
    'gbc': 'gbc',
    'gba': 'gba',
    'ds': 'nds',
    'megadrive': 'megadrive',
    'genesis': 'megadrive',
    'mastersystem': 'mastersystem',
    'psx': 'psx',
    'ps1': 'psx',
    'psp': 'psp',
    'atari2600': 'atari2600',
    'dreamcast': 'dreamcast'
};

class ScraperManager {
    constructor() {
        this.scrapingProcess = null;
    }

    getSkyscraperPath() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(path.join(__dirname, '../Skyscraper/Skyscraper.exe'));
        } else {
            // In production, expect Skyscraper folder next to the executable
            return path.join(path.dirname(process.execPath), 'Skyscraper', 'Skyscraper.exe');
        }
    }

    getRomsPath() {
        if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
            return path.resolve(path.join(__dirname, '../../Content/Roms'));
        }
        // In prod, dirname(process.execPath) is the folder containing .exe
        return path.join(path.dirname(process.execPath), 'Content/Roms');
    }

    scrape(eventSender, system, options = {}) {
        return new Promise(async (resolve, reject) => {
            const skyscraperExe = this.getSkyscraperPath();
            const skyscraperDir = path.dirname(skyscraperExe);

            if (!fs.existsSync(skyscraperExe)) {
                return reject("Skyscraper executable not found at " + skyscraperExe);
            }

            // Portable Data Path
            // In Dev: ../SkyscraperData
            // In Prod: Next to exe/SkyscraperData
            let dataDir;
            if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
                dataDir = path.resolve(path.join(__dirname, '../SkyscraperData'));
            } else {
                dataDir = path.join(path.dirname(process.execPath), 'SkyscraperData');
            }

            const configDir = path.join(dataDir, 'config');
            const cacheDir = path.join(dataDir, 'cache');

            // Ensure directories exist
            if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            // 1. COPY RESOURCES (peas.json)
            const peasSource = path.join(skyscraperDir, 'SK_Config_Source', 'peas.json');
            const peasDest = path.join(configDir, 'peas.json');
            // Check potential resource folders if user moved binaries
            const peasSourceAlt = path.join(skyscraperDir, 'Resources', 'peas.json');

            if (!fs.existsSync(peasDest)) {
                try {
                    if (fs.existsSync(peasSource)) fs.copyFileSync(peasSource, peasDest);
                    else if (fs.existsSync(peasSourceAlt)) fs.copyFileSync(peasSourceAlt, peasDest);
                } catch (e) { }
            }

            // 2. GENERATE CONFIG.INI 
            const iniPath = path.join(configDir, 'config.ini');
            let iniContent = "[main]\n";
            iniContent += `videos=${options.videos ? 'true' : 'false'}\n`;
            iniContent += `manuals=false\n`;
            iniContent += `covers=${options.covers ? 'true' : 'false'}\n`;
            iniContent += `wheels=${options.wheels ? 'true' : 'false'}\n`;
            iniContent += `marquees=true\n`;
            iniContent += `screenshots=${options.screenshots ? 'true' : 'false'}\n`;
            iniContent += `forcefilename=${options.forceFilename ? 'true' : 'false'}\n`;

            fs.writeFileSync(iniPath, iniContent, 'utf8');

            // 3. GENERATE ARTWORK.XML (Standard - Separate Files)
            const artPath = path.join(configDir, 'artwork.xml');
            const standardArt = `<?xml version="1.0" encoding="UTF-8"?>
<artwork>
  <output type="cover" width="400" height="530"><layer resource="cover" x="0" y="0" align="center" valign="middle" keepAspect="true"/></output>
  <output type="wheel" width="400" height="200"><layer resource="wheel" width="250" align="center" valign="middle" keepAspect="true"/></output>
  <output type="marquee" width="400" height="130"><layer resource="marquee" width="350" align="center" valign="middle" keepAspect="true"/></output>
  <output type="screenshot" width="640" height="480"><layer resource="screenshot" x="0" y="0" align="center" valign="middle" keepAspect="true"/></output>
  <output type="video"><layer resource="video" align="center" valign="middle"/></output>
</artwork>`;

            // Force write to ensure we use the requested format
            fs.writeFileSync(artPath, standardArt, 'utf8');

            // System Paths
            const romsPath = this.getRomsPath();
            const systemPath = path.join(romsPath, system);
            if (!fs.existsSync(systemPath)) return reject(`System directory not found: ${systemPath}`);

            const platform = PLATFORM_MAP[system.toLowerCase()] || system.toLowerCase();

            // 4. CLEANUP PREVIOUS GAMELIST
            const oldGamelist = path.join(systemPath, 'gamelist.xml');
            if (fs.existsSync(oldGamelist)) {
                try { fs.unlinkSync(oldGamelist); } catch (e) { }
            }

            // Shared Arguments
            const commonArgs = [
                '-p', platform,
                '-i', systemPath,
                '-c', configDir,
                '-d', cacheDir,
                '-a', artPath,
                '--verbosity', '3'
            ];

            // Region / Lang / Refresh
            if (options.region) commonArgs.push('--region', options.region);
            if (options.lang) commonArgs.push('--lang', options.lang);
            if (options.refresh) commonArgs.push('--refresh');

            // Credentials and Threads (Phase 1)
            if (options.user && options.pass) {
                commonArgs.push('-u', `${options.user}:${options.pass}`);
            }

            if (options.threads) {
                commonArgs.push('-t', String(options.threads));
            } else {
                commonArgs.push('-t', '1');
            }

            // --- PHASE 1: SCRAPING (Download) ---
            const scrapeArgs = [
                ...commonArgs,
                '-s', 'screenscraper'
            ];

            const scrapeFlags = [];
            if (options.videos) scrapeFlags.push('videos');

            if (scrapeFlags.length > 0) {
                scrapeArgs.push('--flags', scrapeFlags.join(','));
            }

            eventSender.send('scraper-status', { system, message: `[1/2] Téléchargement des médias (${platform})...`, running: true });

            try {
                await this.runSkyscraper(scrapeArgs, eventSender);

                // --- PHASE 2: GENERATION (XML) ---
                eventSender.send('scraper-status', { system, message: `[2/2] Génération de la liste de jeux (XML)...`, running: true });

                // Ensure media dir exists
                const mediaDir = path.join(systemPath, 'media');
                if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

                const genFlags = ['relative'];
                if (options.videos) genFlags.push('videos');

                const genArgs = [
                    ...commonArgs,
                    '-f', 'emulationstation',
                    '-g', systemPath,
                    '-o', mediaDir,
                    '--flags', genFlags.join(',')
                ];

                await this.runSkyscraper(genArgs, eventSender);

                eventSender.send('scraper-status', { system, message: 'Processus terminé avec succès.', running: false, success: true });
                resolve({ success: true });

            } catch (err) {
                eventSender.send('scraper-status', { system, message: `Erreur: ${err}`, running: false, success: false });
                reject(err);
            }
        });
    }

    // Helper to strip ANSI codes
    stripAnsi(str) {
        return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }

    // Helper to run command
    runSkyscraper(args, eventSender) {
        return new Promise((resolve, reject) => {
            const skyscraperExe = this.getSkyscraperPath();
            const skyscraperDir = path.dirname(skyscraperExe); // fix variable name if needed, but resolved above in method

            // Re-resolve in method if needed, but this.getSkyscraperPath() handles it
            const exePath = this.getSkyscraperPath();
            const cwd = path.dirname(exePath);

            console.log(`[Skyscraper] Launching: ${exePath} ${args.join(' ')}`);
            eventSender.send('scraper-status', { system: 'log', message: `CMD: ${path.basename(exePath)} ${args.join(' ')}`, running: true });

            const proc = spawn(exePath, args, {
                encoding: 'utf8',
                cwd: cwd,
                shell: false
            });

            proc.stdout.on('data', (data) => {
                const line = this.stripAnsi(data.toString()).trim();
                if (line) {
                    console.log(`[Sky] ${line}`);
                    eventSender.send('scraper-status', { system: 'log', message: line, running: true });
                }
            });

            proc.stderr.on('data', (data) => {
                const cleanErr = this.stripAnsi(data.toString()).trim();
                console.error(`[Sky Err] ${cleanErr}`);
                eventSender.send('scraper-status', { system: 'log', message: "INFO/ERR: " + cleanErr, running: true });
            });

            proc.on('close', (code) => {
                if (code === 0) resolve();
                else reject(`Exited with code ${code}. Check logs.`);
            });

            proc.on('error', (err) => reject(err));
        });
    }
}

module.exports = new ScraperManager();
