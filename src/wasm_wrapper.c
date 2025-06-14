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
void wasm_free_string(char* str) {
    free(str);
}
