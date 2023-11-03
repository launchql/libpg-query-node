OUT_DIR := wasm
OUT_NAME := libpg-query

JS_OUT := $(OUT_DIR)/$(OUT_NAME).js
WASM_OUT := $(OUT_DIR)/$(OUT_NAME).wasm
SRC_FILES := $(wildcard src/*.cc)
LIBPG_QUERY_DIR := $(shell mktemp -d)

CXXFLAGS := -O3 

build: build-source $(JS_OUT)
	@echo $(LIBPG_QUERY_DIR)

clean:
	-@ rm $(JS_OUT) $(WASM_OUT)

build-source:
	git clone -b fix/ar-command-in-makefile --single-branch https://github.com/gregnr/libpg_query.git $(LIBPG_QUERY_DIR)
	cd $(LIBPG_QUERY_DIR); emmake make build

$(JS_OUT): $(SRC_FILES)
	@$(CXX) \
		$(CXXFLAGS) \
		-DNAPI_DISABLE_CPP_EXCEPTIONS \
		-DNODE_ADDON_API_ENABLE_MAYBE \
		-DNAPI_HAS_THREADS \
		-I$(LIBPG_QUERY_DIR) \
		-I./node_modules/emnapi/include \
		-I./node_modules/node-addon-api \
		-L./node_modules/emnapi/lib/wasm32-emscripten \
		-L$(LIBPG_QUERY_DIR) \
		--js-library=./node_modules/emnapi/dist/library_napi.js \
		-sEXPORTED_FUNCTIONS="['_malloc','_free','_napi_register_wasm_v1','_node_api_module_get_api_version_v1']" \
		-sEXPORT_NAME="PgQueryModule" \
		-sENVIRONMENT="web" \
		-sSINGLE_FILE=1 \
		-sMODULARIZE=1 \
		-lpg_query \
		-lemnapi-basic \
		-o $@ \
		$(SRC_FILES)

.PHONY: build build-source clean
