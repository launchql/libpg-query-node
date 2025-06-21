LIBPG_QUERY_TAG := 16-5.2.0

UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)

ifeq ($(UNAME_S),Linux)
	PLATFORM := linux
endif
ifeq ($(UNAME_S),Darwin)
	PLATFORM := darwin
endif

ifeq ($(UNAME_M),x86_64)
	ARCH := x64
endif
ifeq ($(UNAME_M),arm64)
	ARCH := arm64
endif

LIBPG_QUERY_DIR := libpg_query
LIBPG_QUERY_LIB := $(LIBPG_QUERY_DIR)/libpg_query.a

WASM_DIR := wasm
WASM_FILE := $(WASM_DIR)/libpg-query.wasm
WASM_JS_FILE := $(WASM_DIR)/libpg-query.js

.PHONY: build clean clean-cache

build: $(WASM_FILE)

$(WASM_FILE): $(LIBPG_QUERY_LIB) src/wasm_wrapper_light.c
	@echo "Building WASM module for PostgreSQL 16..."
	emcc -O3 \
		-I$(LIBPG_QUERY_DIR) \
		-I$(LIBPG_QUERY_DIR)/src/postgres/include \
		src/wasm_wrapper_light.c \
		$(LIBPG_QUERY_LIB) \
		-o $(WASM_FILE) \
		-sEXPORTED_FUNCTIONS="['_malloc','_free','_wasm_parse_query','_wasm_parse_plpgsql','_wasm_fingerprint','_wasm_normalize_query','_wasm_parse_query_detailed','_wasm_free_detailed_result','_wasm_free_string']" \
		-sEXPORTED_RUNTIME_METHODS="['UTF8ToString','stringToUTF8','lengthBytesUTF8']" \
		-sMODULARIZE=1 \
		-sEXPORT_NAME="PgQueryModule" \
		-sENVIRONMENT=web,node \
		-sALLOW_MEMORY_GROWTH=1 \
		-sINITIAL_MEMORY=16777216 \
		-sSTACK_SIZE=1048576 \
		-sNO_FILESYSTEM=1 \
		-sNO_EXIT_RUNTIME=1

$(LIBPG_QUERY_LIB):
	@echo "Cloning and building libpg_query $(LIBPG_QUERY_TAG)..."
	rm -rf $(LIBPG_QUERY_DIR)
	git clone --depth 1 --branch $(LIBPG_QUERY_TAG) https://github.com/pganalyze/libpg_query.git $(LIBPG_QUERY_DIR)
	cd $(LIBPG_QUERY_DIR) && make build

clean:
	rm -rf $(WASM_DIR)/*.wasm $(WASM_DIR)/*.js $(WASM_DIR)/*.wast

clean-cache:
	rm -rf $(LIBPG_QUERY_DIR)
