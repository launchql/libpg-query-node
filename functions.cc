#include "functions.h"

static void initialize() {
  static bool initialized = false;
  if (!initialized) {
    pg_query_init();
    initialized = true;
  }
}

NAN_METHOD(parse) {
  initialize();

  if (info.Length() < 1) {
    return Nan::ThrowError("query parameter must be provided");
  }

  Nan::Utf8String query(info[0]);

  if (!*query) {
    return Nan::ThrowError("query parameter must be a string");
  }

  PgQueryParseResult result = pg_query_parse(*query);

  v8::Local<v8::Object> hash = Nan::New<v8::Object>();

  if (result.error) {
    v8::Local<v8::Object> error = Nan::New<v8::Object>();

    v8::Local<v8::String> message = Nan::New(result.error->message).ToLocalChecked();
    v8::Local<v8::String> fileName = Nan::New(result.error->filename).ToLocalChecked();
    v8::Local<v8::String> functionName = Nan::New(result.error->funcname).ToLocalChecked();
    v8::Local<v8::Number> lineNumber = Nan::New(result.error->lineno);
    v8::Local<v8::Number> cursorPosition = Nan::New(result.error->cursorpos);

    Nan::Set(error, Nan::New("message").ToLocalChecked(), message);
    Nan::Set(error, Nan::New("fileName").ToLocalChecked(), fileName);
    Nan::Set(error, Nan::New("functionName").ToLocalChecked(), functionName);
    Nan::Set(error, Nan::New("lineNumber").ToLocalChecked(), lineNumber);
    Nan::Set(error, Nan::New("cursorPosition").ToLocalChecked(), cursorPosition);

    if (result.error->context) {
      Nan::Set(error, Nan::New("context").ToLocalChecked(), Nan::New(result.error->context).ToLocalChecked());
    }
    else {
      Nan::Set(error, Nan::New("context").ToLocalChecked(), Nan::Null());
    }

    Nan::Set(hash, Nan::New("error").ToLocalChecked(), error);
  }

  if (result.parse_tree) {
    Nan::Set(hash, Nan::New("query").ToLocalChecked(),
                   Nan::New(result.parse_tree).ToLocalChecked());
  }

  if (result.stderr_buffer) {
    Nan::Set(hash, Nan::New("stderr").ToLocalChecked(),
                   Nan::New(result.stderr_buffer).ToLocalChecked());
  }

  pg_query_free_parse_result(result);

  info.GetReturnValue().Set(hash);
}
