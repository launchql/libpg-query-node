const { parseSync, loadModule } = require('./wasm/index.cjs');

async function runTests() {
    await loadModule();
    console.log('Detailed error analysis\n');

// Test cases with expected error positions
const testCases = [
    {
        query: 'SELECT * FROM table WHERE id = @',
        expectedError: '@',
        description: 'Invalid character @'
    },
    {
        query: 'SELECT * FROM WHERE id = 1',
        expectedError: 'WHERE',
        description: 'Missing table name'
    },
    {
        query: 'SELECT * FROM table WHERE id = "unclosed string',
        expectedError: '"unclosed string',
        description: 'Unclosed string'
    },
    {
        query: 'SELECT FROM users',
        expectedError: 'FROM',
        description: 'Missing column list'
    },
    {
        query: 'SELECT * FORM users',
        expectedError: 'FORM',
        description: 'Typo in FROM'
    },
    {
        query: 'SELECT * FROM users WHERE',
        expectedError: 'end of input',
        description: 'Incomplete WHERE clause'
    }
];

testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log('Query:', testCase.query);
    console.log('-'.repeat(60));
    
    try {
        const result = parseSync(testCase.query);
        console.log('✓ Unexpectedly succeeded!');
    } catch (error) {
        console.log('Error message:', error.message);
        
        if (error.sqlDetails) {
            const details = error.sqlDetails;
            console.log('\nSQL Details:');
            console.log('  Cursor Position:', details.cursorPosition);
            console.log('  File Name:', details.fileName);
            console.log('  Function Name:', details.functionName);
            console.log('  Line Number:', details.lineNumber);
            
            // Show the error position
            if (details.cursorPosition >= 0) {
                console.log('\nError location:');
                console.log('  ' + testCase.query);
                console.log('  ' + ' '.repeat(details.cursorPosition) + '^');
                
                // Extract what's at the error position
                const errorToken = testCase.query.substring(details.cursorPosition).split(/\s+/)[0];
                console.log('  Token at position:', errorToken || '(end of input)');
                
                // Check if it matches expected
                if (testCase.expectedError) {
                    const matches = error.message.includes(testCase.expectedError);
                    console.log('  Expected error at:', testCase.expectedError);
                    console.log('  Match:', matches ? '✓' : '✗');
                }
            }
        }
    }
});

// Additional test to understand the pattern
console.log('\n\nPattern Analysis:');
console.log('================');

const queries = [
    'SELECT',
    'SELECT *',
    'SELECT * FROM',
    'SELECT * FROM t',
    'SELECT * FROM table',
    'SELECT * FROM table WHERE',
    'SELECT * FROM table WHERE id',
    'SELECT * FROM table WHERE id =',
    'SELECT * FROM table WHERE id = 1'
];

queries.forEach(query => {
    try {
        parseSync(query);
        console.log(`✓ "${query}" - OK`);
    } catch (error) {
        const pos = error.sqlDetails?.cursorPosition ?? -1;
        const token = pos >= 0 ? query.substring(pos).split(/\s+/)[0] || '(EOF)' : '?';
        console.log(`✗ "${query}" - Error at pos ${pos}: "${token}"`);
    }
});
}

runTests().catch(console.error);