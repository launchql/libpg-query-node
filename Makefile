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
SRC_FILES := src/wasm_wrapper.c
LIBPG_QUERY_DIR := $(CACHE_DIR)/$(PLATFORM_ARCH)/libpg_query/$(LIBPG_QUERY_TAG)
LIBPG_QUERY_ARCHIVE := $(LIBPG_QUERY_DIR)/libpg_query.a
LIBPG_QUERY_HEADER := $(LIBPG_QUERY_DIR)/pg_query.h
CXXFLAGS := -O3
CXXFLAGS_OPTIMIZED := -Oz
LDFLAGS_OPTIMIZED := -Wl,--gc-sections,--strip-all --closure 1
EXPORTED_FUNCTIONS := ['_malloc','_free','_wasm_parse_query','_wasm_parse_query_protobuf','_wasm_get_protobuf_len','_wasm_deparse_protobuf','_wasm_parse_plpgsql','_wasm_fingerprint','_wasm_normalize_query','_wasm_scan','_wasm_parse_query_detailed','_wasm_free_detailed_result','_wasm_free_string']
EXPORTED_FUNCTIONS_PARSE_ONLY := ['_malloc','_free','_wasm_parse_query','_wasm_free_string']

ifdef EMSCRIPTEN
OUT_FILES := $(foreach EXT,.js .wasm,$(WASM_OUT_DIR)/$(WASM_OUT_NAME)$(EXT))
else
$(error Native builds are no longer supported. Use EMSCRIPTEN=1 for WASM builds only.)
endif

# Clone libpg_query source (lives in CACHE_DIR) 
$(LIBPG_QUERY_DIR):
	mkdir -p $(CACHE_DIR)
	git clone -b $(LIBPG_QUERY_TAG) --single-branch $(LIBPG_QUERY_REPO) $(LIBPG_QUERY_DIR)
	
$(LIBPG_QUERY_HEADER): $(LIBPG_QUERY_DIR)

# Build libpg_query
$(LIBPG_QUERY_ARCHIVE): $(LIBPG_QUERY_DIR)
	cd $(LIBPG_QUERY_DIR); $(MAKE) build

# Build libpg-query-node WASM module
$(OUT_FILES): $(LIBPG_QUERY_ARCHIVE) $(LIBPG_QUERY_HEADER) $(SRC_FILES)
ifdef EMSCRIPTEN
	$(CC) \
		-v \
		$(CXXFLAGS) \
		$(LDFLAGS) \
		-I$(LIBPG_QUERY_DIR) \
		-I$(LIBPG_QUERY_DIR)/vendor \
		-L$(LIBPG_QUERY_DIR) \
		-sEXPORTED_FUNCTIONS="$(EXPORTED_FUNCTIONS)" \
		-sEXPORTED_RUNTIME_METHODS="['lengthBytesUTF8','stringToUTF8','UTF8ToString','HEAPU8','HEAPU32']" \
		-sEXPORT_NAME="$(WASM_MODULE_NAME)" \
		-sENVIRONMENT="web,node" \
		-sMODULARIZE=1 \
		-sEXPORT_ES6=0 \
		-sALLOW_MEMORY_GROWTH=1 \
		-lpg_query \
		-o $@ \
		$(SRC_FILES)
else
$(error Native builds are no longer supported. Use EMSCRIPTEN=1 for WASM builds only.)
endif

# Commands
build: $(OUT_FILES)

build-optimized: CXXFLAGS := $(CXXFLAGS_OPTIMIZED)
build-optimized: LDFLAGS += $(LDFLAGS_OPTIMIZED)
build-optimized: $(OUT_FILES)

build-optimized-no-fs: CXXFLAGS := $(CXXFLAGS_OPTIMIZED)
build-optimized-no-fs: LDFLAGS += $(LDFLAGS_OPTIMIZED) -sFILESYSTEM=0
build-optimized-no-fs: $(OUT_FILES)

build-parse-only: CXXFLAGS := $(CXXFLAGS_OPTIMIZED)
build-parse-only: LDFLAGS += $(LDFLAGS_OPTIMIZED) -sFILESYSTEM=0
build-parse-only: WASM_OUT_NAME := libpg-query-parse-only
build-parse-only: SRC_FILES := src/wasm_wrapper_parse_only.c
build-parse-only: EXPORTED_FUNCTIONS := $(EXPORTED_FUNCTIONS_PARSE_ONLY)
build-parse-only: OUT_FILES := $(foreach EXT,.js .wasm,$(WASM_OUT_DIR)/$(WASM_OUT_NAME)$(EXT))
build-parse-only: $(OUT_FILES)



build-cache: $(LIBPG_QUERY_ARCHIVE) $(LIBPG_QUERY_HEADER)

rebuild: clean build

rebuild-optimized: clean build-optimized

rebuild-optimized-no-fs: clean build-optimized-no-fs

rebuild-parse-only: clean build-parse-only



rebuild-cache: clean-cache build-cache

clean:
	-@ rm -r $(OUT_FILES) > /dev/null 2>&1

clean-cache:
	-@ rm -rf $(LIBPG_QUERY_DIR)

.PHONY: build build-optimized build-optimized-no-fs build-parse-only build-cache rebuild rebuild-optimized rebuild-optimized-no-fs rebuild-parse-only rebuild-cache clean clean-cache
