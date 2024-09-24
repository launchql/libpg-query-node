#include "helpers.h"  // NOLINT(build/include)
#include "async.h"  // NOLINT(build/include)
#include "pg_query.h"
#include <napi.h>

class QueryWorker : public Napi::AsyncWorker {
 public:
  QueryWorker(Napi::Function& callback, const std::string& query)
    : Napi::AsyncWorker(callback), query(query) {}
  ~QueryWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access JS engine data structure
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    result = pg_query_parse(query.c_str());
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use JS engine data again
  void OnOK() {
    Napi::HandleScope scope(Env());
    try {
      Callback().Call({Env().Undefined(), QueryParseResult(Env(), result) });
    } catch (const Napi::Error& e) {
      Callback().Call({ e.Value(), Env().Undefined() });
    }
  }

 private:
  std::string query;
  PgQueryParseResult result;
};

class DeparseWorker : public Napi::AsyncWorker {
 public:
  DeparseWorker(Napi::Function& callback, PgQueryProtobuf parseTree)
    : Napi::AsyncWorker(callback), parseTree(parseTree) {}
  ~DeparseWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access JS engine data structure
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
  	result = pg_query_deparse_protobuf(parseTree);
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use JS engine data again
  void OnOK() {
    Napi::HandleScope scope(Env());
    try {
      Callback().Call({Env().Undefined(), DeparseResult(Env(), result) });
    } catch (const Napi::Error& e) {
      Callback().Call({ e.Value(), Env().Undefined() });
    }
  }

 private:
  PgQueryProtobuf parseTree;
  PgQueryDeparseResult result;
};

class PgPlQSLWorker : public Napi::AsyncWorker {
 public:
  PgPlQSLWorker(Napi::Function& callback, const std::string& query)
    : Napi::AsyncWorker(callback), query(query) {}
  ~PgPlQSLWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access JS engine data structure
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    result = pg_query_parse_plpgsql(query.c_str());
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use JS engine data again
  void OnOK() {
    Napi::HandleScope scope(Env());
    try {
      Callback().Call({Env().Undefined(), PlPgSQLParseResult(Env(), result) });
    } catch (const Napi::Error& e) {
      Callback().Call({ e.Value(), Env().Undefined() });
    }
  }

 private:
  std::string query;
  PgQueryPlpgsqlParseResult result;
};


class FingeprintWorker : public Napi::AsyncWorker {
public:
  FingeprintWorker(Napi::Function& callback, const std::string& query)
  : Napi::AsyncWorker(callback), query(query) {}
  ~FingeprintWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access JS engine data structure
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    result = pg_query_fingerprint(query.c_str());
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use JS engine data again
  void OnOK() {
    Napi::HandleScope scope(Env());
    try {
      Callback().Call({Env().Undefined(), FingerprintResult(Env(), result) });
    } catch (const Napi::Error& e) {
      Callback().Call({ e.Value(), Env().Undefined() });
    }
  }

private:
  std::string query;
  PgQueryFingerprintResult result;
};

Napi::Value ParseQueryAsync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  Napi::Function callback = info[1].As<Napi::Function>();
  QueryWorker* worker = new QueryWorker(callback, query);
  worker->Queue();
  return info.Env().Undefined();
}

Napi::Value DeparseAsync(const Napi::CallbackInfo& info) {
  if (info.Length() < 2 || !(info[0].IsBuffer() || info[0].IsTypedArray()) || !info[1].IsFunction()) {
    Napi::TypeError::New(info.Env(), "Invalid arguments").ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }
  Napi::Buffer<char> data = info[0].As<Napi::Buffer<char>>();
  Napi::Function callback = info[1].As<Napi::Function>();
  PgQueryProtobuf parseTree = {
      static_cast<unsigned int>(data.Length()),
      data.Data()
  };
  DeparseWorker* worker = new DeparseWorker(callback, parseTree);
  worker->Queue();
  return info.Env().Undefined();
}

Napi::Value ParsePlPgSQLAsync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  Napi::Function callback = info[1].As<Napi::Function>();
  PgPlQSLWorker* worker = new PgPlQSLWorker(callback, query);
  worker->Queue();
  return info.Env().Undefined();
}

Napi::Value FingerprintAsync(const Napi::CallbackInfo& info) {
  std::string query = info[0].As<Napi::String>();
  Napi::Function callback = info[1].As<Napi::Function>();
  FingeprintWorker* worker = new FingeprintWorker(callback, query);
  worker->Queue();
  return info.Env().Undefined();
}
