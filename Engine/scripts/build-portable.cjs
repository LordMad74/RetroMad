const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist-win', 'retromad-portal-win32-x64');

// External Assets (Relative to Engine/)
const SKYSCRAPER_SRC = path.join(PROJECT_ROOT, 'Skyscraper');
// const CONTENT_SRC = path.resolve(PROJECT_ROOT, '../Content'); // Not used in Lite build

const SKYSCRAPER_DEST = path.join(DIST_DIR, 'Skyscraper');
const CONTENT_DEST = path.join(DIST_DIR, 'Content');

console.log('🚀 Starting Full Autonomous Build (100% Standalone)...');

// 1. Run Clean Build
console.log('\n📦 Packaging Application...');
try {
    execSync('npm run build', { stdio: 'inherit', cwd: PROJECT_ROOT });
} catch (e) {
    console.error('❌ Build failed.');
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
        console.log(`ℹ️ Node copy failed, attempting robocopy/xcopy...`);
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
    console.error(`❌ Dist directory not found at ${DIST_DIR}. Build might have failed silently.`);
    process.exit(1);
}

// Copy Skyscraper (Keep this, it's essential tool)
console.log(`Copying Skyscraper from ${SKYSCRAPER_SRC}...`);
copyDir(SKYSCRAPER_SRC, SKYSCRAPER_DEST);

// 4. Create Clean Structure for Content
console.log('Creating clean Content structure...');
if (!fs.existsSync(CONTENT_DEST)) fs.mkdirSync(CONTENT_DEST);

const CONTENT_SRC = path.resolve(PROJECT_ROOT, '../Content');

['Roms', 'Emulators', 'media', 'Saves'].forEach(sub => {
    const p = path.join(CONTENT_DEST, sub);
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
        console.log(`✅ Created empty dir: Content/${sub}`);
    }
});

// Copy Essential Media (Themes, Logos)
console.log('📂 Copying Essential Media assets...');
const essentialMedia = [
    'media/images/themes',
    'media/manufacturers'
];

essentialMedia.forEach(subPath => {
    const src = path.join(CONTENT_SRC, subPath);
    const dest = path.join(CONTENT_DEST, subPath);
    if (fs.existsSync(src)) {
        copyDir(src, dest);
    }
});

// Create default config file if needed
const configDest = path.join(CONTENT_DEST, 'config.json');
const defaultConfig = {
    kiosk: { enabled: false, theme: 'neon_arcade' },
    global: { fullscreen: true },
    systems: {}
};
fs.writeFileSync(configDest, JSON.stringify(defaultConfig, null, 2));
// Copy Launcher Script
const launcherSrc = path.resolve(PROJECT_ROOT, '../Lancer_RetroMad.ps1');
const launcherDest = path.join(DIST_DIR, 'Lancer_RetroMad.ps1');
if (fs.existsSync(launcherSrc)) {
    fs.copyFileSync(launcherSrc, launcherDest);
    console.log('✅ Copied Lancer_RetroMad.ps1');
}

// 5. Cleanup Locales (SAVE SPACE)
console.log('\n🧹 Cleaning up unnecessary locales...');
const localesDir = path.join(DIST_DIR, 'locales');
if (fs.existsSync(localesDir)) {
    const keptLocales = ['en-US.pak', 'fr.pak', 'en-GB.pak'];
    fs.readdirSync(localesDir).forEach(file => {
        if (!keptLocales.includes(file)) {
            fs.unlinkSync(path.join(localesDir, file));
        }
    });
    console.log('✅ Cleaned up locales (kept en/fr)');
}


console.log('\n✨ Full Portable Build (Lite) Complete!');
console.log(`👉 Export located at: ${DIST_DIR}`);
