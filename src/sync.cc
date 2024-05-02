#include <napi.h>
#include <string>
#include "sync.h"  // NOLINT(build/include)
#include "helpers.h"  // NOLINT(build/include)

Napi::String ParseQuerySync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  PgQueryParseResult result = pg_query_parse(query.c_str());

  return QueryParseResult(info.Env(), result);
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

Napi::String DeparseSync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Check input arguments
  if (info.Length() < 1 || !info[0].IsBuffer()) {
    Napi::TypeError::New(env, "Expected a buffer").ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
  PgQueryProtobuf parse_tree;
  parse_tree.data = reinterpret_cast<char*>(buffer.Data());
  parse_tree.len = buffer.Length();

  // Perform the deparsing
  PgQueryDeparseResult result = pg_query_deparse_protobuf(parse_tree);

  // Check for errors and return result or throw an exception
  if (result.error) {
    std::string error_message = "Deparsing error: " + std::string(result.error->message);
    pg_query_free_deparse_result(result); // Corrected to use the specific free function for deparse results
    Napi::Error::New(env, error_message).ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  } else {
    Napi::String deparsedQuery = Napi::String::New(env, result.query);
    pg_query_free_deparse_result(result); // Ensure to free the entire structure, not just the query
    return deparsedQuery;
  }
}

