#include <napi.h>
#include <string>
#include "sync.h"  // NOLINT(build/include)
#include "helpers.h"  // NOLINT(build/include)

Napi::String ParseQuerySync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  PgQueryParseResult result = pg_query_parse(query.c_str());

  return QueryParseResult(info.Env(), result);
}

Napi::String DeparseQuerySync(const Napi::CallbackInfo& info) {
  std::string ast = info[0].As<Napi::String>();
  auto protobufResult = json_to_protobuf_parse_result(ast);
  PgQueryDeparseResult result;

  if (protobufResult.error) {
    result.query = (char*)malloc(0);
    result.error = protobufResult.error;
  } else {
    result = pg_query_deparse_protobuf(protobufResult.protobuf);
  }

  return QueryDeparseResult(info.Env(), result);
}

Napi::String ParsePlPgSQLSync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  PgQueryPlpgsqlParseResult result = pg_query_parse_plpgsql(query.c_str());

  return PlPgSQLParseResult(info.Env(), result);
}

Napi::String FingerprintSync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  PgQueryFingerprintResult result = pg_query_fingerprint(query.c_str());

  return FingerprintResult(info.Env(), result);
}
