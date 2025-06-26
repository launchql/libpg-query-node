const { parseSync, loadModule, formatSqlError, hasSqlDetails } = require('./wasm/index.cjs');

async function runTests() {
    await loadModule();
    
    console.log('Testing native SQL error formatting helper\n');
    console.log('='.repeat(60));
    
    const testCases = [
        {
            query: "SELECT * FROM users WHERE id = 'unclosed",
            desc: 'Unclosed string literal'
        },
        {
            query: 'SELECT * FROM users WHERE id = @ AND name = "test"',
            desc: 'Invalid @ character'
        },
        {
            query: 'SELECT * FROM users WHERE id IN (1, 2, @, 4)',
            desc: 'Invalid @ in IN list'
        },
        {
            query: 'CREATE TABLE test_table (id INTEGER, name @)',
            desc: 'Invalid @ in CREATE TABLE'
        },
        {
            query: 'SELECT * FROM users WHERE created_at > NOW() AND status = @ ORDER BY id',
            desc: 'Long query with error'
        }
    ];
    
    // Test basic formatting
    console.log('\n1. Basic Error Formatting (default options)');
    console.log('-'.repeat(60));
    
    testCases.forEach((testCase, index) => {
        try {
            parseSync(testCase.query);
        } catch (error) {
            if (hasSqlDetails(error)) {
                console.log(`\nExample ${index + 1}: ${testCase.desc}`);
                console.log(formatSqlError(error, testCase.query));
                console.log();
            }
        }
    });
    
    // Test with colors
    console.log('\n2. Error Formatting with Colors');
    console.log('-'.repeat(60));
    
    try {
        parseSync("SELECT * FROM users WHERE id = 'unclosed");
    } catch (error) {
        if (hasSqlDetails(error)) {
            console.log(formatSqlError(error, "SELECT * FROM users WHERE id = 'unclosed", { color: true }));
        }
    }
    
    // Test without position marker
    console.log('\n\n3. Error Formatting without Position Marker');
    console.log('-'.repeat(60));
    
    try {
        parseSync('SELECT * FROM users WHERE id = @');
    } catch (error) {
        if (hasSqlDetails(error)) {
            console.log(formatSqlError(error, 'SELECT * FROM users WHERE id = @', { 
                showPosition: false 
            }));
        }
    }
    
    // Test without query
    console.log('\n\n4. Error Formatting without Query');
    console.log('-'.repeat(60));
    
    try {
        parseSync('SELECT * FROM users WHERE id = @');
    } catch (error) {
        if (hasSqlDetails(error)) {
            console.log(formatSqlError(error, 'SELECT * FROM users WHERE id = @', { 
                showQuery: false 
            }));
        }
    }
    
    // Test with truncation
    console.log('\n\n5. Error Formatting with Query Truncation');
    console.log('-'.repeat(60));
    
    const longQuery = 'SELECT id, name, email, phone, address, city, state, zip, country FROM users WHERE status = "active" AND created_at > NOW() - INTERVAL 30 DAY AND email LIKE "%@example.com" AND id = @ ORDER BY created_at DESC LIMIT 100';
    
    try {
        parseSync(longQuery);
    } catch (error) {
        if (hasSqlDetails(error)) {
            console.log('Full query length:', longQuery.length);
            console.log('\nWith maxQueryLength=80:');
            console.log(formatSqlError(error, longQuery, { maxQueryLength: 80 }));
        }
    }
    
    // Test hasSqlDetails type guard
    console.log('\n\n6. Type Guard Function');
    console.log('-'.repeat(60));
    
    try {
        parseSync('SELECT * FROM users WHERE id = @');
    } catch (error) {
        console.log('hasSqlDetails(error):', hasSqlDetails(error));
        console.log('error instanceof Error:', error instanceof Error);
        console.log('Has sqlDetails property:', 'sqlDetails' in error);
    }
    
    // Regular error without SQL details
    try {
        throw new Error('Regular error without SQL details');
    } catch (error) {
        console.log('\nRegular error:');
        console.log('hasSqlDetails(error):', hasSqlDetails(error));
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('Summary: The formatSqlError() helper is now part of the library!');
    console.log('It provides consistent, customizable error formatting with:');
    console.log('- Visual position indicators');
    console.log('- Optional ANSI colors');
    console.log('- Query truncation for long queries');
    console.log('- Flexible display options');
}

runTests().catch(console.error);