const { parse } = require('./wasm/index.cjs');

async function testErrorHandling() {
    console.log('Testing enhanced error handling with SqlErrorDetails\n');

    // Test cases
    const testQueries = [
        // Syntax error (lexer)
        'SELECT * FROM table WHERE id = @',
        
        // Semantic error (parser)
        'SELECT * FROM WHERE id = 1',
        
        // Another syntax error
        'SELECT * FROM table WHERE id = "unclosed string',
        
        // Empty query
        '',
        
        // Null query
        null,
        
        // Valid query (should succeed)
        'SELECT * FROM users WHERE id = 1'
    ];

    for (let index = 0; index < testQueries.length; index++) {
        const query = testQueries[index];
        console.log(`\nTest ${index + 1}: ${query === null ? 'null' : query === '' ? '(empty string)' : query}`);
        console.log('-'.repeat(60));
        
        try {
            const result = await parse(query);
            console.log('✓ Success: Query parsed successfully');
            console.log('  Result type:', result.stmts[0].stmt.constructor.name);
        } catch (error) {
            console.log('✗ Error:', error.message);
            
            // Check if error has sqlDetails
            if (error.sqlDetails) {
                console.log('\n  SQL Error Details:');
                console.log('    Message:', error.sqlDetails.message);
                console.log('    Cursor Position:', error.sqlDetails.cursorPosition);
                console.log('    File Name:', error.sqlDetails.fileName || '(not available)');
                console.log('    Function Name:', error.sqlDetails.functionName || '(not available)');
                console.log('    Line Number:', error.sqlDetails.lineNumber || '(not available)');
                console.log('    Context:', error.sqlDetails.context || '(not available)');
                
                // Show error position in query if available
                if (typeof query === 'string' && error.sqlDetails.cursorPosition >= 0) {
                    console.log('\n  Error location:');
                    console.log('    ' + query);
                    console.log('    ' + ' '.repeat(error.sqlDetails.cursorPosition) + '^');
                }
            }
        }
    }

    console.log('\n\nDemonstration complete!');
    console.log('\nKey features:');
    console.log('- Enhanced error details via error.sqlDetails property');
    console.log('- Cursor position (0-based) for precise error location');
    console.log('- Source file information (scan.l for lexer, gram.y for parser)');
    console.log('- Pre-validation for null/empty queries');
    console.log('- Backward compatible - existing code continues to work');
}

// Run the async test function
testErrorHandling().catch(console.error);