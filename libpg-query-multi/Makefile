.PHONY: build clean test generate-types

build: generate-types
	@echo "Building libpg-query-multi package..."
	@echo "Copying PG15 lightweight version..."
	@mkdir -p pg15
	@cp -r ../libpg-query-15/wasm pg15/
	@cp ../libpg-query-15/package.json pg15/package.json.bak
	
	@echo "Copying PG16 lightweight version..."
	@mkdir -p pg16
	@cp -r ../libpg-query-16/wasm pg16/
	@cp ../libpg-query-16/package.json pg16/package.json.bak
	
	@echo "Copying PG17 full version..."
	@mkdir -p pg17
	@cp -r ../libpg-query-full/wasm pg17/
	@cp -r ../libpg-query-full/proto.js pg17/ 2>/dev/null || true
	@cp ../libpg-query-full/package.json pg17/package.json.bak
	
	@echo "libpg-query-multi package built successfully!"

generate-types:
	@echo "Generating version-specific TypeScript types..."
	@node scripts/generate-types.js

clean:
	@echo "Cleaning libpg-query-multi package..."
	@rm -rf pg15 pg16 pg17
	@echo "Cleaned!"

test:
	@echo "Running tests for libpg-query-multi..."
	@npm test
