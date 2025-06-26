const { parseSync, loadModule, formatSqlError } = require('./wasm/index.cjs');

async function main() {
    await loadModule();
    
    const query = "SELECT * FROM users WHERE id = 'unclosed";
    
    try {
        parseSync(query);
    } catch (error) {
        // Simple format matching your example
        console.log(`Query: ${query}`);
        console.log(formatSqlError(error, query));
    }
}

main().catch(console.error);