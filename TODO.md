TODO

- [ ] update the @pgsql/types for each
- [ ] publish setup with name proxy

### Workaround Ideas for Your `dist-tag` Use Case:

If your goal is to do something **cool with `dist-tags`**, like publishing multiple versions under the same package name (e.g., `libpg-query`) with different tags (`latest`, `next`, `legacy`, etc.), here's how you can manage it cleanly:

#### ✅ Recommended Setup:

1. **Keep one package name per workspace** (e.g., `libpg-query/`)
2. Structure your versions like:

   ```
   libpg-query/
     └── versions/
           ├── v15/
           ├── v16/
           └── v17/
   ```
3. In your build scripts:

   * Dynamically generate a `package.json` with the appropriate version and `dist-tag` for each build.
   * Use `pnpm pack` to build tarballs.
   * Use `pnpm publish --tag <dist-tag>` to publish each version manually with its `dist-tag`.

#### Example:

```bash
cd versions/v17
pnpm build
pnpm publish --tag v17
```

You can then `npm install libpg-query@v17`, `@v16`, etc., via tags, while keeping only one name.