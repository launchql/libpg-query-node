#include "functions.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(PgQuery) {
  Nan::Set(target, Nan::New("parse").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(parse)).ToLocalChecked());
}

NODE_MODULE(PgQuery, PgQuery)
