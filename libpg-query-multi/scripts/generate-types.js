const { PgProtoParser } = require('pg-proto-parser');
const fs = require('fs');
const path = require('path');

const versions = [
  { version: '15', tag: '15-4.2.4' },
  { version: '16', tag: '16-5.2.0' },
  { version: '17', tag: '17-6.1.0' }
];

async function generateTypes() {
  for (const { version, tag } of versions) {
    console.log(`Generating types for PostgreSQL ${version}...`);
    
    const protoUrl = `https://raw.githubusercontent.com/pganalyze/libpg_query/refs/tags/${tag}/protobuf/pg_query.proto`;
    const outDir = `./pg${version}/types`;
    
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    const options = {
      outDir,
      types: {
        enabled: true,
        wrappedNodeTypeExport: true,
        optionalFields: true,
        filename: 'types.d.ts',
        enumsSource: './enums.js',
      },
      enums: {
        enabled: true,
        enumsAsTypeUnion: true,
        filename: 'enums.d.ts',
      },
    };
    
    try {
      const parser = new PgProtoParser(protoUrl, options);
      await parser.write();
      console.log(`✓ Generated types for PostgreSQL ${version}`);
    } catch (error) {
      console.error(`✗ Failed to generate types for PostgreSQL ${version}:`, error.message);
    }
  }
  
  console.log('Type generation complete!');
}

generateTypes().catch(console.error);
