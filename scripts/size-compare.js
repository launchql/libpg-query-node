const { generateSizeReport, formatBytes } = require('./size-report');
const fs = require('fs');
const path = require('path');

function saveSizeBaseline() {
    const report = generateSizeReport();
    const baselinePath = path.join(__dirname, '../size-baseline.json');
    fs.writeFileSync(baselinePath, JSON.stringify(report, null, 2));
    console.log('Size baseline saved to size-baseline.json');
}

function compareSizes() {
    const baselinePath = path.join(__dirname, '../size-baseline.json');
    if (!fs.existsSync(baselinePath)) {
        console.log('No baseline found. Run with --save-baseline first.');
        return;
    }
    
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const current = generateSizeReport();
    
    console.log('=== Size Comparison ===');
    console.log('');
    
    const totalDiff = current.totalSize - baseline.totalSize;
    const totalPercent = ((totalDiff / baseline.totalSize) * 100).toFixed(2);
    
    console.log(`Total Size Change: ${formatBytes(Math.abs(totalDiff))} ${totalDiff >= 0 ? 'increase' : 'reduction'} (${totalPercent}%)`);
    console.log(`Before: ${formatBytes(baseline.totalSize)}`);
    console.log(`After:  ${formatBytes(current.totalSize)}`);
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--save-baseline')) {
        saveSizeBaseline();
    } else {
        compareSizes();
    }
}
