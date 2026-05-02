# Piecepack Playground

Desktop catalog for the standard **Piece Pack** game system ([official specification](https://piecepack.org/piecepack_article.html)): browse tiles, coins, dice, and pawns; filter the set; preview SVG faces; export a **full-set JSON manifest** for downstream tooling.

Manifest exports conform to [schemas/piecepack-manifest.schema.json](schemas/piecepack-manifest.schema.json) (`manifestVersion` `1.0.0`).

## Prerequisites

- [Rust](https://www.rust-lang.org/) and Linux WebKitGTK packages per [Tauri Linux setup](https://v2.tauri.app/start/prerequisites/)
- Node.js + npm (for Vite / React)

## Commands

```sh
npm install
npm run dev          # web only
npm run tauri dev    # Tauri shell + hot reload
npm run build        # production frontend bundle
npm run tauri build  # desktop installers (requires system deps)
```

## Project layout

- `src/domain/piecepack.ts` — suits, ranks, catalog entries, manifest builder
- `src/components/pieces/` — SVG artwork (minimal originals; not traced from vendor sets)
- `schemas/` — JSON Schema for exported manifests

