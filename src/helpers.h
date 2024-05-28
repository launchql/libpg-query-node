#include "pg_query.h"
#include <napi.h>

Napi::Error CreateError(Napi::Env env, const PgQueryError& err);
Napi::String QueryParseResult(Napi::Env env, const PgQueryParseResult& result);
Napi::String QueryDeparseResult(Napi::Env env, const PgQueryDeparseResult& result);
Napi::String PlPgSQLParseResult(Napi::Env env, const PgQueryPlpgsqlParseResult& result);
Napi::String FingerprintResult(Napi::Env env, const PgQueryFingerprintResult & result);

typedef struct {
  PgQueryProtobuf protobuf;
  PgQueryError* error;
} JsonToProtobufResult;

JsonToProtobufResult json_to_protobuf_parse_result(const std::string& json);
