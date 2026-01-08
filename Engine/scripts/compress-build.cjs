const path = require('path');
const { execSync } = require('child_process');
const sevenBin = require('7zip-bin');

const BUILD_DIR = path.resolve(__dirname, '../dist-win/retromad-portal-win32-x64');
const OUTPUT_FILE = path.resolve(__dirname, '../../RetroMad_Build_V0.7.5.7z');

console.log(`📦 Compressing Build...`);
console.log(`Src: ${BUILD_DIR}`);
console.log(`Dest: ${OUTPUT_FILE}`);

// Max compression parameters: LZMA2, 128MB dictionary, Ultra mode
const cmd = `"${sevenBin.path7za}" a -t7z -m0=lzma2 -mx=9 -md=128m -ms=on -mmt=on "${OUTPUT_FILE}" "${BUILD_DIR}"`;

try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✅ Compression Successful!`);
    console.log(`File created at: ${OUTPUT_FILE}`);
} catch (e) {
    console.error(`❌ Compression Failed:`, e);
    process.exit(1);
}
