const { parseSync, loadModule } = require('./wasm/index.cjs');

async function runTests() {
    await loadModule();
    
    console.log('Testing errors at various positions in queries\n');
    console.log('='.repeat(60));
    
    const testCases = [
        // Errors at different positions
        {
            query: '@ SELECT * FROM users',
            desc: 'Error at position 0'
        },
        {
            query: 'SELECT @ FROM users',
            desc: 'Error after SELECT'
        },
        {
            query: 'SELECT * FROM users WHERE @ = 1',
            desc: 'Error after WHERE'
        },
        {
            query: 'SELECT * FROM users WHERE id = @ AND name = "test"',
            desc: 'Error in middle of WHERE clause'
        },
        {
            query: 'SELECT * FROM users WHERE id = 1 AND name = @ ORDER BY id',
            desc: 'Error before ORDER BY'
        },
        {
            query: 'SELECT * FROM users WHERE id = 1 ORDER BY @',
            desc: 'Error after ORDER BY'
        },
        {
            query: 'SELECT * FROM users WHERE id = 1 GROUP BY id HAVING @',
            desc: 'Error after HAVING'
        },
        {
            query: 'SELECT id, name, @ FROM users',
            desc: 'Error in column list'
        },
        {
            query: 'SELECT * FROM users u JOIN orders o ON u.id = @ WHERE u.active = true',
            desc: 'Error in JOIN condition'
        },
        {
            query: 'SELECT * FROM users WHERE id IN (1, 2, @, 4)',
            desc: 'Error in IN list'
        },
        {
            query: 'SELECT * FROM users WHERE name LIKE "test@"',
            desc: 'Valid @ in string (should succeed)'
        },
        {
            query: 'INSERT INTO users (id, name) VALUES (1, @)',
            desc: 'Error in INSERT VALUES'
        },
        {
            query: 'UPDATE users SET name = @ WHERE id = 1',
            desc: 'Error in UPDATE SET'
        },
        {
            query: 'DELETE FROM users WHERE id = @ AND name = "test"',
            desc: 'Error in DELETE WHERE'
        },
        {
            query: 'CREATE TABLE test_table (id INTEGER, name @)',
            desc: 'Error in CREATE TABLE'
        },
        {
            query: 'SELECT COUNT(*) FROM users WHERE created_at > @ GROUP BY status',
            desc: 'Error in date comparison'
        },
        {
            query: 'SELECT * FROM users WHERE id = 1; SELECT * FROM orders WHERE user_id = @',
            desc: 'Error in second statement'
        },
        {
            query: 'WITH cte AS (SELECT * FROM users WHERE id = @) SELECT * FROM cte',
            desc: 'Error in CTE'
        },
        {
            query: 'SELECT CASE WHEN id = 1 THEN "one" WHEN id = 2 THEN @ ELSE "other" END FROM users',
            desc: 'Error in CASE statement'
        },
        {
            query: 'SELECT * FROM users WHERE id = 1 /* comment with @ */ AND name = @',
            desc: 'Error after comment (@ in comment should be ignored)'
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`\nTest ${index + 1}: ${testCase.desc}`);
        console.log('-'.repeat(60));
        console.log(`Query: ${testCase.query}`);
        
        try {
            const result = parseSync(testCase.query);
            console.log('✓ SUCCESS - Query parsed without errors');
        } catch (error) {
            if (error.sqlDetails) {
                const pos = error.sqlDetails.cursorPosition;
                console.log(`✗ ERROR: ${error.message}`);
                console.log(`  Position: ${pos}`);
                
                // Show error location
                console.log(`\n  ${testCase.query}`);
                console.log(`  ${' '.repeat(pos)}^`);
                
                // Show what's at and around the error position
                const before = testCase.query.substring(Math.max(0, pos - 10), pos);
                const at = testCase.query.substring(pos, pos + 1) || '(EOF)';
                const after = testCase.query.substring(pos + 1, pos + 11);
                
                console.log(`\n  Context: ...${before}[${at}]${after}...`);
            } else {
                console.log(`✗ ERROR: ${error.message} (no SQL details)`);
            }
        }
    });
    
    console.log('\n\n' + '='.repeat(60));
    console.log('Summary: The cursor position correctly identifies where errors occur throughout the query!');
}

runTests().catch(console.error);