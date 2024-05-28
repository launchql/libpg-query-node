#include "helpers.h"  // NOLINT(build/include)
#include "pg_query.h"
#include "protobuf/pg_query.pb.h"
#include <napi.h>
#include <google/protobuf/util/json_util.h>

Napi::Error CreateError(Napi::Env env, const PgQueryError& err)
{
    auto error = Napi::Error::New(env, err.message);
    error.Set("fileName", err.filename);
    error.Set("functionName", err.funcname);
    error.Set("lineNumber", Napi::Value::From(env, err.lineno));
    error.Set("cursorPosition", Napi::Value::From(env, err.cursorpos));
    error.Set("context", err.context ? Napi::Value::From(env, err.context) : env.Null());
    return error;
}

Napi::String QueryParseResult(Napi::Env env, const PgQueryParseResult& result)
{
    if (result.error) {
        auto throwVal = CreateError(env, *result.error);
        pg_query_free_parse_result(result);
        throw throwVal;
    }

    auto returnVal = Napi::String::New(env, result.parse_tree);
    pg_query_free_parse_result(result);
    return returnVal;
}

Napi::String QueryDeparseResult(Napi::Env env, const PgQueryDeparseResult& result)
{
    if (result.error) {
        auto throwVal = CreateError(env, *result.error);
        pg_query_free_deparse_result(result);
        throw throwVal;
    }

    auto returnVal = Napi::String::New(env, result.query);
    pg_query_free_deparse_result(result);
    return returnVal;
}

Napi::String PlPgSQLParseResult(Napi::Env env, const PgQueryPlpgsqlParseResult& result)
{
    if (result.error) {
        auto throwVal = CreateError(env, *result.error);
        pg_query_free_plpgsql_parse_result(result);
        throw throwVal;
    }

    auto returnVal = Napi::String::New(env, result.plpgsql_funcs);
    pg_query_free_plpgsql_parse_result(result);
    return returnVal;
}


Napi::String FingerprintResult(Napi::Env env, const PgQueryFingerprintResult & result)
{
  if (result.error) {
    auto throwVal = CreateError(env, *result.error);
    pg_query_free_fingerprint_result(result);
    throw throwVal;
  }

  auto returnVal = Napi::String::New(env, result.fingerprint_str);
  pg_query_free_fingerprint_result(result);
  return returnVal;
}

JsonToProtobufResult json_to_protobuf_parse_result(const std::string& json) {
  JsonToProtobufResult result;

  pg_query::ParseResult parse_result;
  google::protobuf::util::JsonParseOptions options; 

  auto status = google::protobuf::util::JsonStringToMessage(json, &parse_result, options);

  if (!status.ok()) {
		auto error = (PgQueryError *)malloc(sizeof(PgQueryError));
    error->message = strdup("Input AST did not match expected format");
    error->filename = strdup("");
    error->funcname = strdup("");
		result.error = error;

    return result;
  }

  std::string output;
  parse_result.SerializeToString(&output);

  PgQueryProtobuf protobuf;

  protobuf.data = (char*) calloc(output.size(), sizeof(char));
  memcpy(protobuf.data, output.data(), output.size());
  protobuf.len = output.size();

  result.protobuf = protobuf;
  result.error = NULL;

  return result;
}