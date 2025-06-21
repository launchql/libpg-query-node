#include "pg_query.h"
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ctype.h>

static int validate_input(const char* input) {
    return input != NULL && strlen(input) > 0;
}

static char* safe_strdup(const char* str) {
    if (!str) return NULL;
    char* result = strdup(str);
    if (!result) {
        return NULL;
    }
    return result;
}

static void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    if (!ptr && size > 0) {
        return NULL;
    }
    return ptr;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryParseResult result = pg_query_parse(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_parse_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    char* parse_tree = safe_strdup(result.parse_tree);
    pg_query_free_parse_result(result);
    return parse_tree;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_deparse_protobuf(const char* protobuf_data, size_t data_len) {
    if (!protobuf_data || data_len == 0) {
        return safe_strdup("Invalid input: protobuf data cannot be null or empty");
    }
    
    PgQueryDeparseResult result = pg_query_deparse_protobuf(protobuf_data, data_len);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_deparse_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    char* query = safe_strdup(result.query);
    pg_query_free_deparse_result(result);
    return query;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_plpgsql(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryPlpgsqlParseResult result = pg_query_parse_plpgsql(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_plpgsql_parse_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    if (!result.plpgsql_funcs) {
        pg_query_free_plpgsql_parse_result(result);
        return safe_strdup("{\"plpgsql_funcs\":[]}");
    }
    
    size_t funcs_len = strlen(result.plpgsql_funcs);
    size_t json_len = strlen("{\"plpgsql_funcs\":}") + funcs_len + 1;
    char* wrapped_result = safe_malloc(json_len);
    
    if (!wrapped_result) {
        pg_query_free_plpgsql_parse_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    int written = snprintf(wrapped_result, json_len, "{\"plpgsql_funcs\":%s}", result.plpgsql_funcs);
    
    if (written >= json_len) {
        free(wrapped_result);
        pg_query_free_plpgsql_parse_result(result);
        return safe_strdup("Buffer overflow prevented");
    }
    
    pg_query_free_plpgsql_parse_result(result);
    return wrapped_result;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_fingerprint(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryFingerprintResult result = pg_query_fingerprint(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_fingerprint_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    char* fingerprint_str = safe_strdup(result.fingerprint_str);
    pg_query_free_fingerprint_result(result);
    return fingerprint_str;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query_protobuf(const char* input, int* out_len) {
    if (!validate_input(input)) {
        *out_len = 0;
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryProtobufParseResult result = pg_query_parse_protobuf(input);
    
    if (result.error) {
        *out_len = 0;
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_protobuf_parse_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    *out_len = result.parse_tree_len;
    char* parse_tree = safe_malloc(result.parse_tree_len);
    if (!parse_tree) {
        *out_len = 0;
        pg_query_free_protobuf_parse_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    memcpy(parse_tree, result.parse_tree, result.parse_tree_len);
    pg_query_free_protobuf_parse_result(result);
    return parse_tree;
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_protobuf_len(const char* input) {
    if (!validate_input(input)) {
        return -1;
    }
    
    PgQueryProtobufParseResult result = pg_query_parse_protobuf(input);
    
    if (result.error) {
        pg_query_free_protobuf_parse_result(result);
        return -1;
    }
    
    int len = result.parse_tree_len;
    pg_query_free_protobuf_parse_result(result);
    return len;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_normalize_query(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryNormalizeResult result = pg_query_normalize(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_normalize_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    char* normalized = safe_strdup(result.normalized_query);
    pg_query_free_normalize_result(result);
    
    if (!normalized) {
        return safe_strdup("Memory allocation failed");
    }
    
    return normalized;
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
    WasmDetailedResult* result = safe_malloc(sizeof(WasmDetailedResult));
    if (!result) {
        return NULL;
    }
    memset(result, 0, sizeof(WasmDetailedResult));
    
    if (!validate_input(input)) {
        result->has_error = 1;
        result->message = safe_strdup("Invalid input: query cannot be null or empty");
        return result;
    }
    
    PgQueryParseResult parse_result = pg_query_parse(input);
    
    if (parse_result.error) {
        result->has_error = 1;
        size_t message_len = strlen("Parse error:  at line , position ") + strlen(parse_result.error->message) + 20;
        char* prefixed_message = safe_malloc(message_len);
        if (!prefixed_message) {
            result->has_error = 1;
            result->message = safe_strdup("Memory allocation failed");
            pg_query_free_parse_result(parse_result);
            return result;
        }
        snprintf(prefixed_message, message_len, 
                "Parse error: %s at line %d, position %d", 
                parse_result.error->message, 
                parse_result.error->lineno, 
                parse_result.error->cursorpos);
        result->message = prefixed_message;
        char* funcname_copy = parse_result.error->funcname ? safe_strdup(parse_result.error->funcname) : NULL;
        char* filename_copy = parse_result.error->filename ? safe_strdup(parse_result.error->filename) : NULL;
        char* context_copy = parse_result.error->context ? safe_strdup(parse_result.error->context) : NULL;
        
        result->funcname = funcname_copy;
        result->filename = filename_copy;
        result->lineno = parse_result.error->lineno;
        result->cursorpos = parse_result.error->cursorpos;
        result->context = context_copy;
    } else {
        result->data = safe_strdup(parse_result.parse_tree);
        if (result->data) {
            result->data_len = strlen(result->data);
        } else {
            result->has_error = 1;
            result->message = safe_strdup("Memory allocation failed");
        }
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

static char* create_scan_json(PgQueryScanResult scan_result) {
    if (!scan_result.tokens || scan_result.ntokens == 0) {
        return safe_strdup("{\"version\":0,\"tokens\":[]}");
    }
    
    size_t json_size = 1024;
    char* json = safe_malloc(json_size);
    if (!json) return NULL;
    
    size_t pos = 0;
    pos += snprintf(json + pos, json_size - pos, "{\"version\":%d,\"tokens\":[", scan_result.version);
    
    for (int i = 0; i < scan_result.ntokens; i++) {
        PgQueryToken token = scan_result.tokens[i];
        
        size_t needed = pos + 200;
        if (needed >= json_size) {
            json_size = needed * 2;
            char* new_json = realloc(json, json_size);
            if (!new_json) {
                free(json);
                return NULL;
            }
            json = new_json;
        }
        
        if (i > 0) {
            pos += snprintf(json + pos, json_size - pos, ",");
        }
        
        pos += snprintf(json + pos, json_size - pos,
            "{\"text\":\"%.*s\",\"start\":%d,\"end\":%d,\"tokenName\":\"%s\",\"keywordName\":\"%s\"}",
            token.end - token.start, token.start,
            token.start, token.end,
            token.token_name ? token.token_name : "UNKNOWN",
            token.keyword_name ? token.keyword_name : "NO_KEYWORD");
    }
    
    pos += snprintf(json + pos, json_size - pos, "]}");
    return json;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_scan(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryScanResult result = pg_query_scan(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_scan_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    char* json_result = create_scan_json(result);
    pg_query_free_scan_result(result);
    
    if (!json_result) {
        return safe_strdup("Memory allocation failed during JSON creation");
    }
    
    return json_result;
}
