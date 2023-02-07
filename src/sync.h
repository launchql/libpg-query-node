#include <napi.h>

Napi::String DeparseQuerySync(const Napi::CallbackInfo& info);
Napi::String ParseQuerySync(const Napi::CallbackInfo& info);
Napi::String ParsePlPgSQLSync(const Napi::CallbackInfo& info);
Napi::String FingerprintSync(const Napi::CallbackInfo& info);
