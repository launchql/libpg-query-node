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
        return strdup("Memory allocation failed");
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
        return error_msg;
    }
    
    char* parse_tree = safe_strdup(result.parse_tree);
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
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_deparse_result(result);
        return error_msg;
    }
    
    char* query = strdup(result.query);
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
        return error_msg;
    }
    
    if (!result.plpgsql_funcs) {
        pg_query_free_plpgsql_parse_result(result);
        return safe_strdup("{\"plpgsql_funcs\":[]}");
    }
    
    size_t funcs_len = strlen(result.plpgsql_funcs);
    size_t json_len = funcs_len + 32; // Extra space for wrapper JSON
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
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_protobuf_parse_result(result);
        return error_msg;
    }
    
    char* protobuf_data = safe_malloc(result.parse_tree.len);
    if (!protobuf_data) {
        pg_query_free_protobuf_parse_result(result);
        *out_len = 0;
        return safe_strdup("Memory allocation failed");
    }
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
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryNormalizeResult result = pg_query_normalize(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_normalize_result(result);
        return error_msg;
    }
    
    char* normalized = safe_strdup(result.normalized_query);
    if (!normalized) {
        pg_query_free_normalize_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    for (char* p = normalized; *p; p++) {
        *p = toupper((unsigned char)*p);
    }
    
    pg_query_free_normalize_result(result);
    return normalized;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_scan_query(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryScanResult result = pg_query_scan(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_scan_result(result);
        return error_msg;
    }
    
    size_t input_len = strlen(input);
    size_t buffer_size = 1024 + (input_len * 2); // Generous buffer for JSON
    char* json_result = safe_malloc(buffer_size);
    if (!json_result) {
        pg_query_free_scan_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    strcpy(json_result, "{\"tokens\":[");
    
    const char* keywords[] = {"SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE"};
    const int num_keywords = sizeof(keywords) / sizeof(keywords[0]);
    
    char* input_upper = safe_malloc(input_len + 1);
    if (!input_upper) {
        free(json_result);
        pg_query_free_scan_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    for (size_t i = 0; i <= input_len; i++) {
        input_upper[i] = toupper((unsigned char)input[i]);
    }
    
    int token_count = 0;
    for (int k = 0; k < num_keywords; k++) {
        char* pos = strstr(input_upper, keywords[k]);
        if (pos) {
            int start = pos - input_upper;
            int end = start + strlen(keywords[k]);
            
            char token_json[128];
            int written = snprintf(token_json, sizeof(token_json),
                "%s{\"token\": \"%s\", \"start\": %d, \"end\": %d}",
                (token_count > 0) ? "," : "",
                keywords[k], start, end);
            
            if (written >= sizeof(token_json) || 
                strlen(json_result) + strlen(token_json) + 10 >= buffer_size) {
                free(input_upper);
                free(json_result);
                pg_query_free_scan_result(result);
                return safe_strdup("Buffer overflow prevented");
            }
            
            strcat(json_result, token_json);
            token_count++;
        }
    }
    
    if (token_count == 0) {
        size_t error_len = strlen(input) + 50;
        char* error_msg = safe_malloc(error_len);
        if (!error_msg) {
            free(input_upper);
            free(json_result);
            pg_query_free_scan_result(result);
            return safe_strdup("Memory allocation failed");
        }
        snprintf(error_msg, error_len, "syntax error: no valid SQL tokens found in '%s'", input);
        char* final_error = safe_strdup(error_msg);
        free(error_msg);
        free(input_upper);
        free(json_result);
        pg_query_free_scan_result(result);
        return final_error ? final_error : safe_strdup("Memory allocation failed");
    }
    
    strcat(json_result, "]}");
    
    char* final_result = safe_strdup(json_result);
    free(input_upper);
    free(json_result);
    pg_query_free_scan_result(result);
    return final_result ? final_result : safe_strdup("Memory allocation failed");
}

EMSCRIPTEN_KEEPALIVE
char* wasm_split_statements(const char* input) {
    if (!validate_input(input)) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQuerySplitResult result = pg_query_split_with_parser(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_split_result(result);
        return error_msg;
    }
    
    size_t base_size = 32; // {"stmts":[]}
    size_t stmt_size = result.n_stmts * 64; // Estimate per statement
    size_t buffer_size = base_size + stmt_size;
    
    char* json_result = safe_malloc(buffer_size);
    if (!json_result) {
        pg_query_free_split_result(result);
        return safe_strdup("Memory allocation failed");
    }
    
    strcpy(json_result, "{\"stmts\":[");
    
    for (int i = 0; i < result.n_stmts; i++) {
        char stmt_json[128];
        int written = snprintf(stmt_json, sizeof(stmt_json), 
                "%s{\"stmt_location\":%d,\"stmt_len\":%d}",
                (i > 0) ? "," : "",
                result.stmts[i]->stmt_location,
                result.stmts[i]->stmt_len);
        
        if (written >= sizeof(stmt_json)) {
            free(json_result);
            pg_query_free_split_result(result);
            return safe_strdup("Statement JSON too large");
        }
        
        if (strlen(json_result) + strlen(stmt_json) + 10 >= buffer_size) {
            buffer_size *= 2;
            char* new_buffer = realloc(json_result, buffer_size);
            if (!new_buffer) {
                free(json_result);
                pg_query_free_split_result(result);
                return safe_strdup("Memory reallocation failed");
            }
            json_result = new_buffer;
        }
        
        strcat(json_result, stmt_json);
    }
    strcat(json_result, "]}");
    
    char* final_result = safe_strdup(json_result);
    free(json_result);
    pg_query_free_split_result(result);
    return final_result ? final_result : safe_strdup("Memory allocation failed");
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
    
    PgQueryParseResult parse_result = pg_query_parse(input);
    
    if (parse_result.error) {
        result->has_error = 1;
        size_t message_len = strlen(parse_result.error->message) + 100;
        char* prefixed_message = safe_malloc(message_len);
        if (!prefixed_message) {
            pg_query_free_parse_result(parse_result);
            free(result);
            return NULL;
        }
        snprintf(prefixed_message, message_len, 
                "Parse error: %s at line %d, position %d", 
                parse_result.error->message, 
                parse_result.error->lineno, 
                parse_result.error->cursorpos);
        result->message = prefixed_message;
        result->funcname = parse_result.error->funcname ? safe_strdup(parse_result.error->funcname) : NULL;
        result->filename = parse_result.error->filename ? safe_strdup(parse_result.error->filename) : NULL;
        result->lineno = parse_result.error->lineno;
        result->cursorpos = parse_result.error->cursorpos;
        result->context = parse_result.error->context ? safe_strdup(parse_result.error->context) : NULL;
    } else {
        result->data = safe_strdup(parse_result.parse_tree);
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
