/**
 * DO NOT MODIFY MANUALLY — this is generated from the templates dir
 * 
 * To make changes, edit the files in the templates/ directory and run:
 * npm run copy:templates
 */

#include <emscripten.h>
#include <pg_query.h>
#include <stdlib.h>
#include <string.h>

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
void wasm_free_string(char* str) {
    free(str);
}

// Raw struct access functions for parse
EMSCRIPTEN_KEEPALIVE
PgQueryParseResult* wasm_parse_query_raw(const char* input) {
    if (!input) {
        return NULL;
    }
    
    PgQueryParseResult* result = (PgQueryParseResult*)safe_malloc(sizeof(PgQueryParseResult));
    if (!result) {
        return NULL;
    }
    
    *result = pg_query_parse(input);
    return result;
}

EMSCRIPTEN_KEEPALIVE
void wasm_free_parse_result(PgQueryParseResult* result) {
    if (result) {
        pg_query_free_parse_result(*result);
        free(result);
    }
}