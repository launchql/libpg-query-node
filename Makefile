.PHONY: install build clean test pg17-full pg17

# Default target
all: install build

# Install dependencies in both packages
install:
	cd pg17-full && yarn install
	cd pg17 && yarn install

# Build both packages
build:
	cd pg17-full && yarn build
	cd pg17 && yarn build

# Clean both packages
clean:
	cd pg17-full && yarn clean || true
	cd pg17 && yarn clean || true

# Test both packages
test:
	cd pg17-full && yarn test
	cd pg17 && yarn test

# Individual package targets
pg17-full:
	cd pg17-full && yarn && yarn build

pg17:
	cd pg17 && yarn && yarn build
