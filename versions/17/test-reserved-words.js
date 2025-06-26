const { parseSync, loadModule } = require('./wasm/index.cjs');

async function runTests() {
    await loadModule();
    
    console.log('Testing reserved vs non-reserved words\n');
    
    // Test with reserved words vs non-reserved
    const queries = [
        'SELECT * FROM table',      // 'table' is reserved
        'SELECT * FROM users',      // 'users' is not reserved
        'SELECT * FROM "table"',    // quoted reserved word should work
        'SELECT * FROM mytable',    // not reserved
        'SELECT * FROM user',       // 'user' is reserved
        'SELECT * FROM "user"',     // quoted reserved
        'SELECT * FROM customer',   // not reserved
        'SELECT * FROM order',      // 'order' is reserved
        'SELECT * FROM orders',     // not reserved
    ];
    
    console.log('Reserved word tests:');
    console.log('===================\n');
    
    queries.forEach(query => {
        try {
            const result = parseSync(query);
            console.log(`✓ OK: ${query}`);
        } catch (error) {
            const pos = error.sqlDetails?.cursorPosition ?? -1;
            console.log(`✗ ERROR: ${query}`);
            console.log(`  Position: ${pos}, Message: ${error.message}`);
            if (pos >= 0) {
                console.log(`  ${query}`);
                console.log(`  ${' '.repeat(pos)}^`);
            }
        }
    });
    
    // Now test actual syntax errors
    console.log('\n\nActual syntax error tests:');
    console.log('=========================\n');
    
    const errorQueries = [
        { query: 'SELECT * FROM users WHERE id = @', desc: 'Invalid @ character' },
        { query: 'SELECT * FROM users WHERE id = "unclosed', desc: 'Unclosed string' },
        { query: 'SELECT * FROM users WHERE id = \'unclosed', desc: 'Unclosed single quote' },
        { query: 'SELECT * FROM users WHERE id ==', desc: 'Double equals' },
        { query: 'SELECT * FROM users WHERE id = 1 AND', desc: 'Incomplete AND' },
        { query: 'SELECT * FROM users WHERE id = 1a', desc: 'Invalid number' },
        { query: 'SELECT * FROM users WHERE id = 1 2', desc: 'Two numbers' },
        { query: 'SELECT * FROM users WHERE id = $', desc: 'Invalid $ alone' },
        { query: 'SELECT * FROM users WHERE id = ?', desc: 'Question mark' },
    ];
    
    errorQueries.forEach(({ query, desc }) => {
        try {
            const result = parseSync(query);
            console.log(`✓ UNEXPECTED OK: ${desc}`);
            console.log(`  Query: ${query}`);
        } catch (error) {
            const pos = error.sqlDetails?.cursorPosition ?? -1;
            console.log(`✗ ${desc}`);
            console.log(`  Query: ${query}`);
            console.log(`  Error: ${error.message}`);
            if (pos >= 0) {
                console.log(`  Position: ${pos}`);
                console.log(`  ${query}`);
                console.log(`  ${' '.repeat(pos)}^`);
            }
        }
    });
}

runTests().catch(console.error);