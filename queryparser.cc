#include <node.h>
#include <uv.h>
#include "pg_query.h"
#include <string>

using namespace v8;

void Method(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();

    String::Utf8Value query(args[0]->ToString());

    PgQueryParseResult result = pg_query_parse(*query);
    
    Local<Object> obj = Object::New(isolate);

    if (result.error) {
        Local<Object> error = Object::New(isolate);

        v8::Local<v8::String> message = String::NewFromUtf8(isolate, result.error->message);
        v8::Local<v8::String> fileName = String::NewFromUtf8(isolate, result.error->filename);
        v8::Local<v8::String> functionName = String::NewFromUtf8(isolate, result.error->funcname);
        v8::Local<v8::Integer> lineNumber = Integer::New(isolate, result.error->lineno);
        v8::Local<v8::Integer> cursorPosition = Integer::New(isolate, result.error->cursorpos);

        error->Set(String::NewFromUtf8(isolate, "message"), message);
        error->Set(String::NewFromUtf8(isolate, "fileName"), fileName);
        error->Set(String::NewFromUtf8(isolate, "functionName"), functionName);
        error->Set(String::NewFromUtf8(isolate, "lineNumber"), lineNumber);
        error->Set(String::NewFromUtf8(isolate, "cursorPosition"), cursorPosition);

        if (result.error->context) {
            error->Set(String::NewFromUtf8(isolate, "context"), String::NewFromUtf8(isolate, result.error->context));
        }
        else {
            error->Set(String::NewFromUtf8(isolate, "context"), Null(isolate));
        }

        obj->Set(String::NewFromUtf8(isolate, "error"), error);
    }

    if (result.parse_tree) {
        obj->Set(String::NewFromUtf8(isolate, "query"), String::NewFromUtf8(isolate, result.parse_tree));
    }

    if (result.stderr_buffer) {
        obj->Set(String::NewFromUtf8(isolate, "stderr"), String::NewFromUtf8(isolate, result.stderr_buffer));
    }

    pg_query_free_parse_result(result);

    args.GetReturnValue().Set(obj);
}

struct Work {
  uv_work_t  request;
  Persistent<Function> callback;
  std::string ss;
  PgQueryParseResult result;
  
  //std::shared_ptr<String::Utf8Value> queryPP;
};

// called by libuv worker in separate thread
static void WorkAsync(uv_work_t *req)
{
    Work *work = static_cast<Work *>(req->data);
    
    //work->result = pg_query_parse(*(*(work->queryPP)));

    work->result = pg_query_parse(work->ss.data());
}

// called by libuv in event loop when async function completes
static void WorkAsyncComplete(uv_work_t *req,int status)
{
    Isolate * isolate = Isolate::GetCurrent();

    // Fix for Node 4.x - thanks to https://github.com/nwjs/blink/commit/ecda32d117aca108c44f38c8eb2cb2d0810dfdeb
    v8::HandleScope handleScope(isolate);
    
    Handle<Value> argv[2];

    Local<Object> result = Object::New(isolate);
    Work *work = static_cast<Work *>(req->data);

    if (work->result.error) {
        Local<Object> error = Object::New(isolate);

        v8::Local<v8::String> message = String::NewFromUtf8(isolate, work->result.error->message);
        v8::Local<v8::String> fileName = String::NewFromUtf8(isolate, work->result.error->filename);
        v8::Local<v8::String> functionName = String::NewFromUtf8(isolate, work->result.error->funcname);
        v8::Local<v8::Integer> lineNumber = Integer::New(isolate, work->result.error->lineno);
        v8::Local<v8::Integer> cursorPosition = Integer::New(isolate, work->result.error->cursorpos);

        error->Set(String::NewFromUtf8(isolate, "message"), message);
        error->Set(String::NewFromUtf8(isolate, "fileName"), fileName);
        error->Set(String::NewFromUtf8(isolate, "functionName"), functionName);
        error->Set(String::NewFromUtf8(isolate, "lineNumber"), lineNumber);
        error->Set(String::NewFromUtf8(isolate, "cursorPosition"), cursorPosition);

        if (work->result.error->context) {
            error->Set(String::NewFromUtf8(isolate, "context"), String::NewFromUtf8(isolate, work->result.error->context));
        }
        else {
            error->Set(String::NewFromUtf8(isolate, "context"), Null(isolate));
        }

        argv[0] = error;
    } else {
        argv[0] = Null(isolate);
    }

    if (work->result.parse_tree) {
        result->Set(String::NewFromUtf8(isolate, "query"), String::NewFromUtf8(isolate, work->result.parse_tree));
    }

    if (work->result.stderr_buffer) {
        result->Set(String::NewFromUtf8(isolate, "query"), String::NewFromUtf8(isolate, work->result.parse_tree));
    }

    // set up return arguments
    
    argv[1] = result;

    // execute the callback
    // https://stackoverflow.com/questions/13826803/calling-javascript-function-from-a-c-callback-in-v8/28554065#28554065
    Local<Function>::New(isolate, work->callback)->Call(isolate->GetCurrentContext()->Global(), 2, argv);

    // Free up the persistent function callback
    work->callback.Reset();
    
    pg_query_free_parse_result(work->result);
    delete work;
}

void MethodAsync(const v8::FunctionCallbackInfo<v8::Value>&args) {
    Isolate* isolate = args.GetIsolate();

    Work * work = new Work();
    work->request.data = work;

    String::Utf8Value query(args[0]->ToString());
    work->ss.assign(*query);
    
    //work->queryPP = std::make_shared<String::Utf8Value>(args[0]->ToString());

    // store the callback from JS in the work package so we can
    // invoke it later
    Local<Function> callback = Local<Function>::Cast(args[1]);
    work->callback.Reset(isolate, callback);

    // kick of the worker thread
    uv_queue_work(uv_default_loop(),&work->request,WorkAsync,WorkAsyncComplete);

    args.GetReturnValue().Set(Undefined(isolate));
}

void init(Handle <Object> exports, Handle<Object> module) {
  NODE_SET_METHOD(exports, "parseQuery", Method);
  NODE_SET_METHOD(exports, "parseQueryAsync", MethodAsync); 
}

NODE_MODULE(addon, init)
