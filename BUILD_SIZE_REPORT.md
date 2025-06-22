# Build Size Analysis Report

Generated on: 2025-06-22T06:22:35.227Z

## Summary

| Package | Total Size | Total Gzipped | Reduction |
|---------|------------|---------------|-----------|
| libpg-query (Original) | 2.07 MB | 428.77 KB | Baseline |
| @libpg-query/v17 | 2.05 MB | 427.95 KB | 0.7% |

## Detailed Breakdown

### libpg-query (Original)

| File | Size | Gzipped | Gzip Ratio |
|------|------|---------|------------|
| WASM Binary | 1.99 MB | 409.96 KB | 79.9% |
| WASM Loader | 58.66 KB | 16.24 KB | 72.3% |
| ES Module | 9.48 KB | 1.07 KB | 88.8% |
| CommonJS | 10.75 KB | 1.5 KB | 86.1% |

### @libpg-query/v17

| File | Size | Gzipped | Gzip Ratio |
|------|------|---------|------------|
| WASM Binary | 1.99 MB | 409.96 KB | 79.9% |
| WASM Loader | 58.66 KB | 16.24 KB | 72.3% |
| ES Module | 2.29 KB | 694 Bytes | 70.4% |
| CommonJS | 3.29 KB | 1.06 KB | 67.7% |

## Size Comparison

### WASM Binary Comparison

| Package | WASM Size | Difference |
|---------|-----------|------------|
| libpg-query (Original) | 1.99 MB | Baseline |
| @libpg-query/v17 | 1.99 MB | 0.0 KB (0.0%) |

### JavaScript Bundle Comparison

| Package | ES Module | CommonJS | Combined |
|---------|-----------|----------|----------|
| libpg-query (Original) | 9.48 KB | 10.75 KB | 20.23 KB |
| @libpg-query/v17 | 2.29 KB | 3.29 KB | 5.57 KB |

## Notes

- Gzipped sizes represent the approximate size when served with compression
- The WASM binary is the largest component and is shared across all API methods
- JavaScript wrapper size varies based on the number of exported functions
- @libpg-query/v17 only exports parse/parseSync, reducing JavaScript bundle size
