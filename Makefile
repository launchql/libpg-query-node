OUT_DIR := wasm
OUT_NAME := libpg-query

JS_OUT := $(OUT_DIR)/$(OUT_NAME).js
WASM_OUT := $(OUT_DIR)/$(OUT_NAME).wasm
SRC_FILES := $(wildcard src/*.cc)
CACHE_DIR := .cache
LIBPG_QUERY_DIR := $(CACHE_DIR)/libpg_query

CXXFLAGS := -O3

build: $(JS_OUT)

rebuild: clean $(JS_OUT)

rebuild-cache: clean-cache $(LIBPG_QUERY_DIR)

clean:
	-@ rm $(JS_OUT) $(WASM_OUT)

clean-cache:
	-@ rm -rf $(CACHE_DIR)

$(LIBPG_QUERY_DIR):
	mkdir -p $(CACHE_DIR)
	git clone -b fix/ar-command-in-makefile --single-branch https://github.com/gregnr/libpg_query.git $(LIBPG_QUERY_DIR)
	cd $(LIBPG_QUERY_DIR); $(MAKE) build

$(JS_OUT): $(LIBPG_QUERY_DIR) $(SRC_FILES)
	@ $(CXX) \
		$(CXXFLAGS) \
		-D NAPI_DISABLE_CPP_EXCEPTIONS \
		-D NODE_ADDON_API_ENABLE_MAYBE \
		-D NAPI_HAS_THREADS \
		-I $(LIBPG_QUERY_DIR) \
		-I ./node_modules/emnapi/include \
		-I ./node_modules/node-addon-api \
		-L ./node_modules/emnapi/lib/wasm32-emscripten \
		-L $(LIBPG_QUERY_DIR) \
		--js-library=./node_modules/emnapi/dist/library_napi.js \
		-s EXPORTED_FUNCTIONS="['_malloc','_free','_napi_register_wasm_v1','_node_api_module_get_api_version_v1']" \
		-s EXPORT_NAME="PgQueryModule" \
		-s ENVIRONMENT="web" \
		-s MODULARIZE=1 \
		-s SINGLE_FILE=1 \
		-l pg_query \
		-l emnapi-basic \
		-o $@ \
		$(SRC_FILES)

.PHONY: build rebuild rebuild-cache clean clean-cache
