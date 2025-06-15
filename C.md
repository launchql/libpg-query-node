# libpg_query C Functions Analysis and WASM Wrapper Improvements

## Overview

This document analyzes the available C functions in libpg_query and provides suggestions for improving the current WASM wrapper implementation to reduce JavaScript dependencies and improve memory management.

## Current WASM Wrapper Analysis

### Current Implementation (`src/wasm_wrapper.c`)

The current wrapper only exposes 5 basic functions:
- `wasm_parse_query()` - wraps `pg_query_parse()`
- `wasm_deparse_protobuf()` - wraps `pg_query_deparse_protobuf()`
- `wasm_parse_plpgsql()` - wraps `pg_query_parse_plpgsql()`
- `wasm_fingerprint()` - wraps `pg_query_fingerprint()`
- `wasm_free_string()` - memory cleanup

### Current JavaScript Dependencies (`wasm/index.js`)

The current implementation has these issues:
1. **proto.js dependency**: The `deparse()` function uses `pg_query.ParseResult.fromObject()` and `pg_query.ParseResult.encode()` from proto.js (5.4MB file)
2. **Manual memory management**: JavaScript code manually manages WASM memory with `_malloc()`, `_free()`, and pointer operations
3. **Limited error handling**: Basic string-based error detection

## Available libpg_query C Functions

### Core Parsing Functions
```c
// Basic parsing (returns JSON strings)
PgQueryParseResult pg_query_parse(const char* input);
PgQueryParseResult pg_query_parse_opts(const char* input, int parser_options);

// Protobuf parsing (returns binary protobuf data)
PgQueryProtobufParseResult pg_query_parse_protobuf(const char* input);
PgQueryProtobufParseResult pg_query_parse_protobuf_opts(const char* input, int parser_options);

// PL/pgSQL parsing
PgQueryPlpgsqlParseResult pg_query_parse_plpgsql(const char* input);
```

### Query Processing Functions
```c
// Normalization
PgQueryNormalizeResult pg_query_normalize(const char* input);
PgQueryNormalizeResult pg_query_normalize_utility(const char* input);

// Scanning/Tokenization
PgQueryScanResult pg_query_scan(const char* input);

// Statement splitting
PgQuerySplitResult pg_query_split_with_scanner(const char *input);
PgQuerySplitResult pg_query_split_with_parser(const char *input);

// Fingerprinting
PgQueryFingerprintResult pg_query_fingerprint(const char* input);
PgQueryFingerprintResult pg_query_fingerprint_opts(const char* input, int parser_options);

// Deparsing
PgQueryDeparseResult pg_query_deparse_protobuf(PgQueryProtobuf parse_tree);
```

### Memory Management Functions
```c
void pg_query_free_normalize_result(PgQueryNormalizeResult result);
void pg_query_free_scan_result(PgQueryScanResult result);
void pg_query_free_parse_result(PgQueryParseResult result);
void pg_query_free_split_result(PgQuerySplitResult result);
void pg_query_free_deparse_result(PgQueryDeparseResult result);
void pg_query_free_protobuf_parse_result(PgQueryProtobufParseResult result);
void pg_query_free_plpgsql_parse_result(PgQueryPlpgsqlParseResult result);
void pg_query_free_fingerprint_result(PgQueryFingerprintResult result);
void pg_query_exit(void);
```

## Key Improvement Opportunities

### 1. Eliminate proto.js Dependency

**Current Problem**: The `deparse()` function in `wasm/index.js` uses proto.js to encode JavaScript objects to protobuf:
```javascript
const msg = pg_query.ParseResult.fromObject(parseTree);
const data = pg_query.ParseResult.encode(msg).finish();
```

**Solution**: Use `pg_query_parse_protobuf()` instead of `pg_query_parse()` to get protobuf data directly from C, eliminating the need for JavaScript protobuf encoding.

**Implementation**:
```c
// New wrapper function
EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query_protobuf(const char* input) {
    PgQueryProtobufParseResult result = pg_query_parse_protobuf(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_protobuf_parse_result(result);
        return error_msg;
    }
    
    // Return base64-encoded protobuf data or raw bytes
    char* protobuf_data = malloc(result.parse_tree.len);
    memcpy(protobuf_data, result.parse_tree.data, result.parse_tree.len);
    pg_query_free_protobuf_parse_result(result);
    return protobuf_data;
}
```

### 2. Improved Memory Management

**Current Problem**: JavaScript manually manages WASM memory with complex pointer operations.

**Solution**: Handle all memory management in C wrapper functions.

**Implementation**:
```c
// Unified result structure for better memory management
typedef struct {
    char* data;
    size_t len;
    int is_error;
} WasmResult;

EMSCRIPTEN_KEEPALIVE
WasmResult* wasm_parse_query_managed(const char* input) {
    WasmResult* result = malloc(sizeof(WasmResult));
    PgQueryParseResult parse_result = pg_query_parse(input);
    
    if (parse_result.error) {
        result->data = strdup(parse_result.error->message);
        result->len = strlen(result->data);
        result->is_error = 1;
    } else {
        result->data = strdup(parse_result.parse_tree);
        result->len = strlen(result->data);
        result->is_error = 0;
    }
    
    pg_query_free_parse_result(parse_result);
    return result;
}

EMSCRIPTEN_KEEPALIVE
void wasm_free_result(WasmResult* result) {
    if (result) {
        free(result->data);
        free(result);
    }
}
```

### 3. Additional Useful Functions to Expose

**Query Normalization**:
```c
EMSCRIPTEN_KEEPALIVE
char* wasm_normalize_query(const char* input) {
    PgQueryNormalizeResult result = pg_query_normalize(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_normalize_result(result);
        return error_msg;
    }
    
    char* normalized = strdup(result.normalized_query);
    pg_query_free_normalize_result(result);
    return normalized;
}
```



### 4. Enhanced Error Handling

**Current Problem**: Basic string-based error detection in JavaScript.

**Solution**: Structured error handling in C with detailed error information.

**Implementation**:
```c
typedef struct {
    int has_error;
    char* message;
    char* funcname;
    char* filename;
    int lineno;
    int cursorpos;
    char* context;
    char* data;
    size_t data_len;
} WasmDetailedResult;

EMSCRIPTEN_KEEPALIVE
WasmDetailedResult* wasm_parse_query_detailed(const char* input) {
    WasmDetailedResult* result = malloc(sizeof(WasmDetailedResult));
    memset(result, 0, sizeof(WasmDetailedResult));
    
    PgQueryParseResult parse_result = pg_query_parse(input);
    
    if (parse_result.error) {
        result->has_error = 1;
        result->message = strdup(parse_result.error->message);
        result->funcname = parse_result.error->funcname ? strdup(parse_result.error->funcname) : NULL;
        result->filename = parse_result.error->filename ? strdup(parse_result.error->filename) : NULL;
        result->lineno = parse_result.error->lineno;
        result->cursorpos = parse_result.error->cursorpos;
        result->context = parse_result.error->context ? strdup(parse_result.error->context) : NULL;
    } else {
        result->data = strdup(parse_result.parse_tree);
        result->data_len = strlen(result->data);
    }
    
    pg_query_free_parse_result(parse_result);
    return result;
}
```

## Recommended Implementation Plan

### Phase 1: Eliminate proto.js Dependency
1. Add `wasm_parse_query_protobuf()` function to get protobuf data directly from C
2. Modify JavaScript `deparse()` function to use protobuf data from C instead of encoding in JS
3. Remove proto.js import from `wasm/index.js`

### Phase 2: Improve Memory Management
1. Implement unified result structures in C
2. Move all memory allocation/deallocation to C wrapper functions
3. Simplify JavaScript code to just call C functions and handle results

### Phase 3: Expand API Surface
1. Add normalization, scanning, and splitting functions
2. Implement enhanced error handling with detailed error information
3. Add parser options support for advanced use cases

### Phase 4: Performance Optimizations
1. Implement result caching in C for repeated operations
2. Add batch processing functions for multiple queries
3. Optimize memory usage patterns

## Benefits of Proposed Changes

1. **Reduced Bundle Size**: Eliminating 5.4MB proto.js dependency
2. **Better Memory Management**: All memory operations handled in C, reducing leaks and complexity
3. **Enhanced Functionality**: Access to full libpg_query feature set
4. **Improved Error Handling**: Detailed error information with source locations
5. **Better Performance**: Reduced JavaScript/WASM boundary crossings
6. **Simplified JavaScript Code**: Less complex memory management and protobuf handling

## Compatibility Considerations

- Maintain backward compatibility for existing API functions
- Add new functions as additional exports rather than replacing existing ones
- Provide migration guide for users wanting to adopt new APIs
- Consider versioning strategy for major API changes
