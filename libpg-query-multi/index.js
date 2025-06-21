export class Parser {
    constructor(options = {}) {
        this.version = options.version || 17;
        this._parser = null;
    }
    
    async _getParser() {
        if (!this._parser) {
            switch(this.version) {
                case 15:
                    this._parser = await import('./pg15/index.js');
                    break;
                case 16:
                    this._parser = await import('./pg16/index.js');
                    break;
                case 17:
                    this._parser = await import('./pg17/index.js');
                    break;
                default:
                    throw new Error(`Unsupported PostgreSQL version: ${this.version}. Supported versions: 15, 16, 17`);
            }
        }
        return this._parser;
    }
    
    async parse(query) {
        const parser = await this._getParser();
        return parser.parse(query);
    }
    
    parseSync(query) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call parse() first or use async methods.');
        }
        return this._parser.parseSync(query);
    }
    
    async parsePlPgSQL(query) {
        const parser = await this._getParser();
        return parser.parsePlPgSQL(query);
    }
    
    parsePlPgSQLSync(query) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call parsePlPgSQL() first or use async methods.');
        }
        return this._parser.parsePlPgSQLSync(query);
    }
    
    async fingerprint(query) {
        const parser = await this._getParser();
        return parser.fingerprint(query);
    }
    
    fingerprintSync(query) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call fingerprint() first or use async methods.');
        }
        return this._parser.fingerprintSync(query);
    }
    
    async normalize(query) {
        const parser = await this._getParser();
        return parser.normalize(query);
    }
    
    normalizeSync(query) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call normalize() first or use async methods.');
        }
        return this._parser.normalizeSync(query);
    }
    
    async deparse(tree) {
        const parser = await this._getParser();
        if (!parser.deparse) {
            throw new Error(`Deparse functionality not available for PostgreSQL ${this.version}. Available in versions 16 and 17.`);
        }
        return parser.deparse(tree);
    }
    
    deparseSync(tree) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call deparse() first or use async methods.');
        }
        if (!this._parser.deparseSync) {
            throw new Error(`Deparse functionality not available for PostgreSQL ${this.version}. Available in versions 16 and 17.`);
        }
        return this._parser.deparseSync(tree);
    }
    
    async scan(query) {
        const parser = await this._getParser();
        if (!parser.scan) {
            throw new Error(`Scan functionality not available for PostgreSQL ${this.version}. Available in version 17 only.`);
        }
        return parser.scan(query);
    }
    
    scanSync(query) {
        if (!this._parser) {
            throw new Error('Parser not initialized. Call scan() first or use async methods.');
        }
        if (!this._parser.scanSync) {
            throw new Error(`Scan functionality not available for PostgreSQL ${this.version}. Available in version 17 only.`);
        }
        return this._parser.scanSync(query);
    }
}

export { parse as parse15, fingerprint as fingerprint15, normalize as normalize15, parsePlPgSQL as parsePlPgSQL15 } from './pg15/index.js';
export { parse as parse16, fingerprint as fingerprint16, normalize as normalize16, parsePlPgSQL as parsePlPgSQL16, deparse as deparse16 } from './pg16/index.js';
export { parse as parse17, fingerprint as fingerprint17, normalize as normalize17, parsePlPgSQL as parsePlPgSQL17, deparse as deparse17, scan as scan17 } from './pg17/index.js';

export { parse, fingerprint, normalize, parsePlPgSQL, deparse, scan } from './pg17/index.js';
