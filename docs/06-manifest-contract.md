# 06 — Manifest contract

The catalog’s **Export manifest JSON** button produces a file intended for **downstream tooling** — game engines, asset pipelines, regression fixtures, or documentation generators.

## Schema location

`schemas/piecepack-manifest.schema.json` (JSON Schema draft 2020-12)

TypeScript mirror: `PiecePackManifest` and record types in `src/domain/piecepack.ts`.

**Rule:** TypeScript builders and the JSON Schema must stay aligned. If they diverge, exports may fail validation in external CI.

## Top-level shape

```json
{
  "manifestVersion": "1.0.0",
  "spec": "https://piecepack.org/piecepack_article.html",
  "generatedAt": "2026-05-23T12:00:00.000Z",
  "tiles": [ /* 24 */ ],
  "coins": [ /* 24 */ ],
  "dice": [ /* 4 */ ],
  "pawns": [ /* 4 */ ]
}
```

- **`manifestVersion`** — Const `1.0.0`. Bump when making breaking schema changes.
- **`spec`** — Const URL to official Piece Pack article.
- **`generatedAt`** — ISO-8601 from `buildFullManifest(now)`; defaults to `new Date()`.

`additionalProperties: false` at root and on each record — unknown fields fail validation.

## Record shapes

### Tile / coin

```json
{ "id": "tile:suns:ace", "suit": "suns", "rank": "ace" }
```

ID regex (schema): `^tile:[a-z]+:(null|ace|[2-5])$` (and `coin:` prefix for coins).

### Die

```json
{
  "id": "die:arms",
  "suit": "arms",
  "faces": ["null", "ace", "2", "3", "4", "5"]
}
```

Exactly six faces; each must be a valid `rank` enum value. Order matches `DIE_FACES` in code.

### Pawn

```json
{ "id": "pawn:moons", "suit": "moons" }
```

## What the manifest does *not* include

- SVG paths or image URLs
- Pixel dimensions or print metadata
- Play-table positions or instance IDs
- User-facing labels (`buildCatalog()` labels are UI-only)

Consumers are expected to map `id` + `suit` + `rank` to their own assets or to this project’s art if embedded as a library later.

## Export implementation

```ts
buildFullManifest() → PiecePackManifest
downloadManifestJson(manifest, filename?)
```

`downloadManifestJson` uses the browser **Blob** + temporary anchor pattern. Works in:

- Vite dev server (browser tab)
- Tauri webview (save dialog behavior depends on platform)

There is **no import** path — loading a manifest back into the app is a possible future feature (would need validation against schema and UI for conflicts).

## Validating exports (recommended for contributors)

Example using [ajv](https://ajv.js.org/) (not wired in repo today):

1. `npm run build` or a small script imports `buildFullManifest` from compiled/bundled domain code.
2. Validate output against `schemas/piecepack-manifest.schema.json`.
3. Fail CI on mismatch.

When editing `piecepack.ts` counts or IDs, manually export once and run your validator.

## Versioning policy (suggested)

| Change | Action |
|--------|--------|
| Add optional field | Avoid — schema forbids extras; prefer new manifest version |
| Add required field | Bump `manifestVersion`, update schema const, document migration |
| Rename suit/rank enum | Breaking — new major manifest version |
| Fix typo in ID pattern | Breaking for strict consumers — bump version |

Document migrations in commit messages and, when version bumps, add a short note in this file.

## Relationship to catalog

| | Catalog | Manifest |
|---|---------|----------|
| Count | 56 flat entries | 4 arrays totaling 56 records |
| Labels | Yes | No |
| Die faces | On `DieEntry` | On each `DieRecord` |
| Use | UI | Export / APIs |

Both are generated from the same `SUITS` / `RANKS` loops — they should never disagree if code is correct.
