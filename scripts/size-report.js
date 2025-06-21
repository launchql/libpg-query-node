const fs = require('fs');
const path = require('path');

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateSizeReport() {
    const wasmDir = path.join(__dirname, '../wasm');
    const files = [
        'libpg-query.wasm',
        'libpg-query.js',
        'index.js',
        'index.cjs'
    ];
    
    console.log('=== WASM Bundle Size Report ===');
    console.log('Generated:', new Date().toISOString());
    console.log('');
    
    let totalSize = 0;
    files.forEach(file => {
        const filePath = path.join(wasmDir, file);
        const size = getFileSize(filePath);
        totalSize += size;
        console.log(`${file.padEnd(20)} ${formatBytes(size).padStart(10)} (${size} bytes)`);
    });
    
    console.log(''.padEnd(32, '-'));
    console.log(`${'Total Bundle Size'.padEnd(20)} ${formatBytes(totalSize).padStart(10)} (${totalSize} bytes)`);
    console.log('');
    
    return { totalSize, files: files.map(f => ({ name: f, size: getFileSize(path.join(wasmDir, f)) })) };
}

if (require.main === module) {
    generateSizeReport();
}

module.exports = { generateSizeReport, formatBytes };
