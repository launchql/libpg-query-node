WASM_OUT_DIR := wasm
WASM_OUT_NAME := libpg-query
WASM_MODULE_NAME := PgQueryModule
LIBPG_QUERY_REPO := https://github.com/pganalyze/libpg_query.git
LIBPG_QUERY_TAG := 17-6.1.0

CACHE_DIR := .cache

OS ?= $(shell uname -s)
ARCH ?= $(shell uname -m)

ifdef EMSCRIPTEN
PLATFORM := emscripten
else ifeq ($(OS),Darwin)
PLATFORM := darwin
else ifeq ($(OS),Linux)
PLATFORM := linux
else
$(error Unsupported platform: $(OS))
endif

ifdef EMSCRIPTEN
ARCH := wasm
endif

PLATFORM_ARCH := $(PLATFORM)-$(ARCH)
SRC_FILES := $(wildcard src/*.cc)
LIBPG_QUERY_DIR := $(CACHE_DIR)/$(PLATFORM_ARCH)/libpg_query/$(LIBPG_QUERY_TAG)
LIBPG_QUERY_ARCHIVE := $(LIBPG_QUERY_DIR)/libpg_query.a
LIBPG_QUERY_HEADER := $(LIBPG_QUERY_DIR)/pg_query.h
CXXFLAGS := -O3

ifdef EMSCRIPTEN
OUT_FILES := $(foreach EXT,.js .wasm,$(WASM_OUT_DIR)/$(WASM_OUT_NAME)$(EXT))
else
OUT_FILES := build/Release/queryparser.node $(wildcard build/*)
endif

# Clone libpg_query source (lives in CACHE_DIR) 
$(LIBPG_QUERY_DIR):
	mkdir -p $(CACHE_DIR)
	git clone -b $(LIBPG_QUERY_TAG) --single-branch $(LIBPG_QUERY_REPO) $(LIBPG_QUERY_DIR)
	
$(LIBPG_QUERY_HEADER): $(LIBPG_QUERY_DIR)

# Build libpg_query
$(LIBPG_QUERY_ARCHIVE): $(LIBPG_QUERY_DIR)
	cd $(LIBPG_QUERY_DIR); $(MAKE) build

# Build libpg-query-node (based on platform)
$(OUT_FILES): $(LIBPG_QUERY_ARCHIVE) $(LIBPG_QUERY_HEADER) $(SRC_FILES)
ifdef EMSCRIPTEN
	@ $(CXX) \
		$(CXXFLAGS) \
		-DNAPI_HAS_THREADS \
		-I$(LIBPG_QUERY_DIR) \
		-I./node_modules/emnapi/include \
		-I./node_modules/node-addon-api \
		-L./node_modules/emnapi/lib/wasm32-emscripten \
		-L$(LIBPG_QUERY_DIR) \
		--js-library=./node_modules/emnapi/dist/library_napi.js \
		-sEXPORTED_FUNCTIONS="['_malloc','_free','_napi_register_wasm_v1','_node_api_module_get_api_version_v1']" \
		-sEXPORT_NAME="$(WASM_MODULE_NAME)" \
		-sENVIRONMENT="web" \
		-sMODULARIZE=1 \
		-sEXPORT_ES6=1 \
		-fexceptions \
		-lpg_query \
		-lemnapi-basic \
		-o $@ \
		$(SRC_FILES)
else
# if not wasm, defer to node-gyp
	yarn rebuild
endif

# Commands
build: $(OUT_FILES)

build-cache: $(LIBPG_QUERY_ARCHIVE) $(LIBPG_QUERY_HEADER)

rebuild: clean build

rebuild-cache: clean-cache build-cache

clean:
	-@ rm -r $(OUT_FILES) > /dev/null 2>&1

clean-cache:
	-@ rm -rf $(LIBPG_QUERY_DIR)

.PHONY: build build-cache rebuild rebuild-cache clean clean-cache
