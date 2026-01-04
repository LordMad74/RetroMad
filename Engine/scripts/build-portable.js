const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist-win', 'retromad-portal-win32-x64');

// External Assets (Relative to Engine/)
// Assuming Engine/ is the CWD
const SKYSCRAPER_SRC = path.join(PROJECT_ROOT, 'Skyscraper');
// Content is usually one level up from Engine (D:/RetroMad/Content) but user said to include it.
// Let's look for Content in sibling directories if not in Engine.
// Actually, based on previous exploration, Content is a sibling of Engine. (D:/RetroMad/Content)
// But wait, the user works in D:/RetroMad/Engine.
// Let's assume Content is at D:/RetroMad/Content (../Content from Engine)
const CONTENT_SRC = path.resolve(PROJECT_ROOT, '../Content');

const SKYSCRAPER_DEST = path.join(DIST_DIR, 'Skyscraper');
const CONTENT_DEST = path.join(DIST_DIR, 'Content');

console.log('🚀 Starting Full Portable Build...');

// 1. Run Clean Build
console.log('\n📦 building Application...');
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

    // Using simple recursive copy for Node 16+
    try {
        fs.cpSync(src, dest, { recursive: true });
        console.log(`✅ Copied: ${path.basename(src)} -> ${dest}`);
    } catch (e) {
        // Fallback for older Node versions or permission issues
        console.log(`ℹ️ Node copy failed, attempting robocopy/xcopy...`);
        try {
            // Windows specific
            execSync(`xcopy "${src}" "${dest}" /E /I /Y`, { stdio: 'ignore' });
            console.log(`✅ Copied (xcopy): ${path.basename(src)}`);
        } catch (ex) {
            console.error(`❌ Failed to copy ${src}:`, ex.message);
        }
    }
}

// 3. Copy Assets
console.log('\n📂 Copying External Assets...');

// Check if DIST exists
if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Dist directory not found at ${DIST_DIR}. Build might have failed silently.`);
    process.exit(1);
}

console.log(`Copying Skyscraper from ${SKYSCRAPER_SRC}...`);
copyDir(SKYSCRAPER_SRC, SKYSCRAPER_DEST);

console.log(`Copying Content from ${CONTENT_SRC}... (This may take a while)`);
copyDir(CONTENT_SRC, CONTENT_DEST);

console.log('\n✨ Full Portable Build Complete!');
console.log(`👉 Export located at: ${DIST_DIR}`);
