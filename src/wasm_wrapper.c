#include "pg_query.h"
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query(const char* input) {
    PgQueryParseResult result = pg_query_parse(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_parse_result(result);
        return error_msg;
    }
    
    char* parse_tree = strdup(result.parse_tree);
    pg_query_free_parse_result(result);
    return parse_tree;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_deparse_protobuf(const char* protobuf_data, size_t data_len) {
    PgQueryProtobuf pbuf;
    pbuf.data = (char*)protobuf_data;
    pbuf.len = data_len;
    
    PgQueryDeparseResult result = pg_query_deparse_protobuf(pbuf);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_deparse_result(result);
        return error_msg;
    }
    
    char* query = strdup(result.query);
    pg_query_free_deparse_result(result);
    return query;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_plpgsql(const char* input) {
    PgQueryPlpgsqlParseResult result = pg_query_parse_plpgsql(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_plpgsql_parse_result(result);
        return error_msg;
    }
    
    char* plpgsql_funcs = strdup(result.plpgsql_funcs);
    pg_query_free_plpgsql_parse_result(result);
    return plpgsql_funcs;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_fingerprint(const char* input) {
    PgQueryFingerprintResult result = pg_query_fingerprint(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_fingerprint_result(result);
        return error_msg;
    }
    
    char* fingerprint_str = strdup(result.fingerprint_str);
    pg_query_free_fingerprint_result(result);
    return fingerprint_str;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query_protobuf(const char* input, int* out_len) {
    PgQueryProtobufParseResult result = pg_query_parse_protobuf(input);
    
    if (result.error) {
        *out_len = 0;
        char* error_msg = strdup(result.error->message);
        pg_query_free_protobuf_parse_result(result);
        return error_msg;
    }
    
    char* protobuf_data = malloc(result.parse_tree.len);
    memcpy(protobuf_data, result.parse_tree.data, result.parse_tree.len);
    *out_len = (int)result.parse_tree.len;
    
    pg_query_free_protobuf_parse_result(result);
    return protobuf_data;
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_protobuf_len(const char* input) {
    PgQueryProtobufParseResult result = pg_query_parse_protobuf(input);
    
    if (result.error) {
        pg_query_free_protobuf_parse_result(result);
        return 0;
    }
    
    int len = (int)result.parse_tree.len;
    pg_query_free_protobuf_parse_result(result);
    return len;
}

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

EMSCRIPTEN_KEEPALIVE
char* wasm_scan_query(const char* input) {
    PgQueryScanResult result = pg_query_scan(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_scan_result(result);
        return error_msg;
    }
    
    char* scan_result = strdup(result.pbuf.data);
    pg_query_free_scan_result(result);
    return scan_result;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_split_statements(const char* input) {
    PgQuerySplitResult result = pg_query_split_with_parser(input);
    
    if (result.error) {
        char* error_msg = strdup(result.error->message);
        pg_query_free_split_result(result);
        return error_msg;
    }
    
    char* split_result = strdup(result.pbuf.data);
    pg_query_free_split_result(result);
    return split_result;
}

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

EMSCRIPTEN_KEEPALIVE
void wasm_free_detailed_result(WasmDetailedResult* result) {
    if (result) {
        free(result->message);
        free(result->funcname);
        free(result->filename);
        free(result->context);
        free(result->data);
        free(result);
    }
}

EMSCRIPTEN_KEEPALIVE
void wasm_free_string(char* str) {
    free(str);
}
