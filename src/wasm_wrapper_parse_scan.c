#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "pg_query.h"
#include "protobuf/pg_query.pb-c.h"

static char* safe_strdup(const char* str) {
    if (!str) return NULL;
    char* result = strdup(str);
    return result;
}

static void* safe_malloc(size_t size) {
    void* ptr = malloc(size);
    return ptr;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_parse_query(const char* input) {
    if (!input || strlen(input) == 0) {
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

static const char* get_token_name(PgQuery__Token token_type) {
    switch(token_type) {
        case 258: return "IDENT";
        case 261: return "SCONST"; 
        case 266: return "ICONST";
        case 260: return "FCONST";
        case 267: return "PARAM";
        case 40: return "ASCII_40";
        case 41: return "ASCII_41";
        case 42: return "ASCII_42";
        case 44: return "ASCII_44";
        case 59: return "ASCII_59";
        case 61: return "ASCII_61";
        case 268: return "TYPECAST";
        case 272: return "LESS_EQUALS";
        case 273: return "GREATER_EQUALS";
        case 274: return "NOT_EQUALS";
        case 275: return "SQL_COMMENT";
        case 276: return "C_COMMENT";
        default: return "UNKNOWN";
    }
}

static const char* get_keyword_name(PgQuery__KeywordKind keyword_kind) {
    switch(keyword_kind) {
        case 0: return "NO_KEYWORD";
        case 1: return "UNRESERVED_KEYWORD";
        case 2: return "COL_NAME_KEYWORD";
        case 3: return "TYPE_FUNC_NAME_KEYWORD";
        case 4: return "RESERVED_KEYWORD";
        default: return "UNKNOWN_KEYWORD";
    }
}

static char* build_scan_json(PgQuery__ScanResult *scan_result, const char* original_sql) {
    if (!scan_result || !original_sql) {
        return safe_strdup("{\"version\":0,\"tokens\":[]}");
    }
    
    size_t estimated_size = 1024 + (scan_result->n_tokens * 200);
    char* json = safe_malloc(estimated_size);
    if (!json) {
        return safe_strdup("{\"version\":0,\"tokens\":[]}");
    }
    
    int pos = snprintf(json, estimated_size, "{\"version\":%d,\"tokens\":[", scan_result->version);
    
    for (size_t i = 0; i < scan_result->n_tokens; i++) {
        PgQuery__ScanToken *token = scan_result->tokens[i];
        
        int token_length = token->end - token->start;
        if (token_length < 0) token_length = 0;
        
        char* token_text = safe_malloc(token_length + 1);
        if (!token_text) continue;
        
        if (token_length > 0) {
            strncpy(token_text, &original_sql[token->start], token_length);
        }
        token_text[token_length] = '\0';
        
        char* escaped_text = safe_malloc(token_length * 2 + 1);
        if (!escaped_text) {
            free(token_text);
            continue;
        }
        
        int escaped_pos = 0;
        for (int j = 0; j < token_length; j++) {
            char c = token_text[j];
            if (c == '"' || c == '\\') {
                escaped_text[escaped_pos++] = '\\';
            }
            escaped_text[escaped_pos++] = c;
        }
        escaped_text[escaped_pos] = '\0';
        
        const char* token_name = get_token_name(token->token);
        const char* keyword_name = get_keyword_name(token->keyword_kind);
        
        if (i > 0) {
            pos += snprintf(json + pos, estimated_size - pos, ",");
        }
        
        pos += snprintf(json + pos, estimated_size - pos,
            "{\"start\":%d,\"end\":%d,\"text\":\"%s\",\"tokenType\":%d,\"tokenName\":\"%s\",\"keywordKind\":%d,\"keywordName\":\"%s\"}",
            token->start, token->end, escaped_text, token->token, token_name, token->keyword_kind, keyword_name);
        
        free(token_text);
        free(escaped_text);
        
        if (pos >= estimated_size - 200) {
            char* new_json = realloc(json, estimated_size * 2);
            if (!new_json) break;
            json = new_json;
            estimated_size *= 2;
        }
    }
    
    snprintf(json + pos, estimated_size - pos, "]}");
    return json;
}

EMSCRIPTEN_KEEPALIVE
char* wasm_scan(const char* input) {
    if (!input || strlen(input) == 0) {
        return safe_strdup("Invalid input: query cannot be null or empty");
    }
    
    PgQueryScanResult result = pg_query_scan(input);
    
    if (result.error) {
        char* error_msg = safe_strdup(result.error->message);
        pg_query_free_scan_result(result);
        return error_msg ? error_msg : safe_strdup("Memory allocation failed");
    }
    
    PgQuery__ScanResult *scan_result = pg_query__scan_result__unpack(
        NULL, result.pbuf.len, (void *) result.pbuf.data);
    
    if (!scan_result) {
        pg_query_free_scan_result(result);
        return safe_strdup("Failed to unpack scan result");
    }
    
    char* json_result = build_scan_json(scan_result, input);
    
    pg_query__scan_result__free_unpacked(scan_result, NULL);
    pg_query_free_scan_result(result);
    
    return json_result ? json_result : safe_strdup("{\"version\":0,\"tokens\":[]}");
}

EMSCRIPTEN_KEEPALIVE
void wasm_free_string(char* ptr) {
    if (ptr) {
        free(ptr);
    }
}
