const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist-win', 'retromad-portal-win32-x64');

const SKYSCRAPER_SRC = path.join(PROJECT_ROOT, 'Skyscraper');
const SKYSCRAPER_DEST = path.join(DIST_DIR, 'Skyscraper');
const CONTENT_DEST = path.join(DIST_DIR, 'Content');

console.log('🚀 Starting Packaging Only (Production Optimized)...');

// 1. Run Electron Packager directly
console.log('\n📦 Packaging Application...');
try {
    // Direct call to electron-packager executable in code
    // Or simpler: execSync with npx or node_modules path
    const packagerCmd = `npx electron-packager . --out=dist-win --platform=win32 --arch=x64 --overwrite --ignore="^/(\\.cache|dist-win|Content|Skyscraper|RetroMad_Portable.*|RetroMad_Lite.*|src|scripts|\\.git|\\.vscode|tsconfig.*|vite\\.config.*|node_modules_backup|node_modules/7zip-bin/(mac|linux))"`;

    execSync(packagerCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
} catch (e) {
    console.error('❌ Packaging failed.', e);
    process.exit(1);
}

// 2. Helper for copying directories
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`⚠️ Source directory not found: ${src}`);
        return;
    }
    fs.mkdirSync(dest, { recursive: true });

    try {
        fs.cpSync(src, dest, { recursive: true });
        console.log(`✅ Copied: ${path.basename(src)} -> ${dest}`);
    } catch (e) {
        try {
            execSync(`xcopy "${src}" "${dest}" /E /I /Y`, { stdio: 'ignore' });
            console.log(`✅ Copied (xcopy): ${path.basename(src)}`);
        } catch (ex) {
            console.error(`❌ Failed to copy ${src}:`, ex.message);
        }
    }
}

// 3. Copy Assets
console.log('\n📂 Copying External Assets...');

if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Dist directory not found at ${DIST_DIR}.`);
    process.exit(1);
}

console.log(`Copying Skyscraper from ${SKYSCRAPER_SRC}...`);
copyDir(SKYSCRAPER_SRC, SKYSCRAPER_DEST);

console.log('Creating clean Content structure (Lite)...');
if (!fs.existsSync(CONTENT_DEST)) fs.mkdirSync(CONTENT_DEST);

['Roms', 'Emulators', 'Media', 'videos'].forEach(sub => {
    const p = path.join(CONTENT_DEST, sub);
    if (!fs.existsSync(p)) fs.mkdirSync(p);
});

const configDest = path.join(CONTENT_DEST, 'config.json');
const defaultConfig = {
    kiosk: { enabled: false, theme: 'neon_arcade' },
    global: { fullscreen: true },
    systems: {}
};
fs.writeFileSync(configDest, JSON.stringify(defaultConfig, null, 2));

console.log('\n✨ Optimized Build Complete!');
