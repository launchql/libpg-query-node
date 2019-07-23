#include <node.h>
#include <uv.h>
#include "pg_query.h"
#include <string>

using namespace v8;

Local<Object> CreateError(Isolate* isolate, const PgQueryError& err)
{
    v8::EscapableHandleScope handleScope(isolate);
    Local<Object> error = Object::New(isolate);

    error->Set(String::NewFromUtf8(isolate, "message"), String::NewFromUtf8(isolate, err.message));
    error->Set(String::NewFromUtf8(isolate, "fileName"), String::NewFromUtf8(isolate, err.filename));
    error->Set(String::NewFromUtf8(isolate, "functionName"), String::NewFromUtf8(isolate, err.funcname));
    error->Set(String::NewFromUtf8(isolate, "lineNumber"), Integer::New(isolate, err.lineno));
    error->Set(String::NewFromUtf8(isolate, "cursorPosition"), Integer::New(isolate, err.cursorpos));

    if (err.context) {
        error->Set(String::NewFromUtf8(isolate, "context"), String::NewFromUtf8(isolate, err.context));
    }
    else {
        error->Set(String::NewFromUtf8(isolate, "context"), Null(isolate));
    }

    return handleScope.Escape(error);
}

Local<Object> QueryParseResponse(Isolate* isolate, const PgQueryParseResult& result)
{
    v8::EscapableHandleScope handleScope(isolate);
    Local<Object> obj = Object::New(isolate);

    if (result.error) {
        obj->Set(
            String::NewFromUtf8(isolate, "error"),
            CreateError(isolate, *result.error)
        );
    }

    if (result.parse_tree) {
        Local<Value> parseResult;
        bool parseSucceeded = JSON::Parse(
            isolate,
            String::NewFromUtf8(isolate, result.parse_tree)
        ).ToLocal(&parseResult);

        if(parseSucceeded == true)
            obj->Set(String::NewFromUtf8(isolate, "query"),parseResult);
    }

    if (result.stderr_buffer) {
        obj->Set(
            String::NewFromUtf8(isolate, "stderr"),
            String::NewFromUtf8(isolate, result.stderr_buffer)
        );
    }

    pg_query_free_parse_result(result);
    return handleScope.Escape(obj);
}

Local<Object> PlPgSQLParseResponse(Isolate* isolate, const PgQueryPlpgsqlParseResult& result)
{
    v8::EscapableHandleScope handleScope(isolate);
    Local<Object> obj = Object::New(isolate);

    if (result.error) {
        obj->Set(
            String::NewFromUtf8(isolate, "error"),
            CreateError(isolate, *result.error)
        );
    }

    if (result.plpgsql_funcs) {
        Local<Value> parseResult;
        bool parseSucceeded = JSON::Parse(
            isolate,
            String::NewFromUtf8(isolate, result.plpgsql_funcs)
        ).ToLocal(&parseResult);

        if(parseSucceeded == true)
            obj->Set(String::NewFromUtf8(isolate, "functions"),parseResult);
    }

    pg_query_free_plpgsql_parse_result(result);
    return handleScope.Escape(obj);
}

void Method(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    String::Utf8Value query(args[0]->ToString());
    PgQueryParseResult result = pg_query_parse(*query);
    args.GetReturnValue().Set(QueryParseResponse(isolate, result));
}

void MethodPlPgSQL(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    String::Utf8Value query(args[0]->ToString());
    PgQueryPlpgsqlParseResult result = pg_query_parse_plpgsql(*query);
    args.GetReturnValue().Set(PlPgSQLParseResponse(isolate, result));
}

struct Work {
  uv_work_t request;
  Persistent<Function> callback;
  std::string ss;
  PgQueryParseResult result;
};

struct WorkPlPgSQL {
  uv_work_t request;
  Persistent<Function> callback;
  std::string ss;
  PgQueryPlpgsqlParseResult result;
};

// called by libuv worker in separate thread
static void WorkAsync(uv_work_t* req)
{
    Work* work = static_cast<Work*>(req->data);
    work->result = pg_query_parse(work->ss.data());
}

static void WorkPlPgSQLAsync(uv_work_t* req)
{
    WorkPlPgSQL* work = static_cast<WorkPlPgSQL*>(req->data);
    work->result = pg_query_parse_plpgsql(work->ss.data());
}

// called by libuv in event loop when async function completes
static void WorkAsyncComplete(uv_work_t *req, int status)
{
    Isolate* isolate = Isolate::GetCurrent();
    Work* work = static_cast<Work*>(req->data);

    // Set up return arguments.
    // Rather than calling back to node with an error if the parse failed,
    // as would be more correct, we just call back object that may have an
    // error property; caller can deal with it.
    v8::HandleScope handleScope(isolate);
    Handle<Value> argv[1] = {
        QueryParseResponse(isolate, work->result)
    };

    // execute the callback
    // https://stackoverflow.com/questions/13826803/calling-javascript-function-from-a-c-callback-in-v8/28554065#28554065
    Local<Function>::New(isolate, work->callback)->Call(
        isolate->GetEnteredOrMicrotaskContext()->Global(),
        1,
        argv
    );

    // Free up the persistent function callback
    work->callback.Reset();
    delete work;
}

static void WorkPlPgSQLAsyncComplete(uv_work_t *req, int status)
{
    Isolate* isolate = Isolate::GetCurrent();
    WorkPlPgSQL* work = static_cast<WorkPlPgSQL*>(req->data);

    // Set up return arguments.
    // Rather than calling back to node with an error if the parse failed,
    // as would be more correct, we just call back object that may have an
    // error property; caller can deal with it.
    v8::HandleScope handleScope(isolate);
    Handle<Value> argv[1] = {
        PlPgSQLParseResponse(isolate, work->result)
    };

    // execute the callback
    Local<Function>::New(isolate, work->callback)->Call(
        isolate->GetEnteredOrMicrotaskContext()->Global(),
        1,
        argv
    );

    // Free up the persistent function callback
    work->callback.Reset();
    delete work;
}

void MethodAsync(const v8::FunctionCallbackInfo<v8::Value>& args) {
    Isolate* isolate = args.GetIsolate();
    v8::EscapableHandleScope handleScope(isolate);

    // Set up the work object on the heap so that we can do our calculations
    // in WorkAsync, and put our callback there too for use in WorkAsynComplete.
    Work* work = new Work();
    work->request.data = work;

    String::Utf8Value query(args[0]->ToString());
    work->ss.assign(*query);

    // TODO: should check that this is actually a function.
    Local<Function> callback = Local<Function>::Cast(args[1]);
    work->callback.Reset(isolate, callback);

    // kick of the worker thread
    uv_queue_work(uv_default_loop(),&work->request,WorkAsync,WorkAsyncComplete);

    args.GetReturnValue().Set(handleScope.Escape(Undefined(isolate)));
}

void MethodPlPgSQLAsync(const v8::FunctionCallbackInfo<v8::Value>& args) {
    Isolate* isolate = args.GetIsolate();

    WorkPlPgSQL* work = new WorkPlPgSQL();
    work->request.data = work;

    String::Utf8Value query(args[0]->ToString());
    work->ss.assign(*query);

    // store the callback from JS in the work package so we can invoke it later
    // TODO: should check that this is actually a function.
    Local<Function> callback = Local<Function>::Cast(args[1]);
    work->callback.Reset(isolate, callback);

    // kick of the worker thread
    uv_queue_work(uv_default_loop(),&work->request,WorkPlPgSQLAsync,WorkPlPgSQLAsyncComplete);

    args.GetReturnValue().Set(Undefined(isolate));
}


void init(Handle<Object> exports, Handle<Object> module) {
  NODE_SET_METHOD(exports, "parseQuery", Method);
  NODE_SET_METHOD(exports, "parseQueryAsync", MethodAsync);
  NODE_SET_METHOD(exports, "parsePlPgSQL", MethodPlPgSQL);
  NODE_SET_METHOD(exports, "parsePlPgSQLAsync", MethodPlPgSQLAsync);
}

NODE_MODULE(addon, init)
