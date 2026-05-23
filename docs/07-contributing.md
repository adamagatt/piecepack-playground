# 07 — Contributing guide

Practical guidance for common changes. Pair with [02-architecture.md](./02-architecture.md) and the domain/UI docs as needed.

## Before you code

1. Clone, `npm install`, run `npm run dev`.
2. Skim [01-overview.md](./01-overview.md) and open the [Piece Pack spec](https://piecepack.org/piecepack_article.html) for rules you are modeling.
3. Decide which **mode** you are extending: catalog, play table, manifest, or shell.

## Change recipes

### Add or rename a rank/suit (spec change — rare)

1. Update `SUITS` / `RANKS` in `piecepack.ts`.
2. Update `schemas/piecepack-manifest.schema.json` enums and ID regexes.
3. Bump `MANIFEST_VERSION` if export shape changes.
4. Regenerate-dependent UI: catalog filters, `buildCatalog`, `buildFullManifest`, `initialTable` loops.
5. Update artwork if new combinations need glyphs.
6. Refresh docs 03 and 06.

### Add a catalog-only field (e.g. tooltip text)

1. Extend the relevant `*Entry` type in `piecepack.ts`.
2. Populate in `buildCatalog()`.
3. Render in `CatalogScreen` / `DetailPanel`.
4. Do **not** add to manifest unless tooling needs it (schema is strict).

### Add play-table interaction (e.g. rotate tile)

1. Extend `FaceCard` or piece types in `playTable.ts` if new state is needed.
2. Implement pure update functions (keeps logic testable).
3. Wire pointer or toolbar handlers in `PlayTableScreen.tsx`.
4. Update play CSS if layout changes.

### Add pawns to the play table

1. Extend `TableModel` with `pawns: PawnPiece[]` (or similar).
2. Add `DragKind`, sizing constants, clamp logic in `moveDraggedPiece`.
3. Render `PawnArt` in play surface loop.
4. Seed in `initialTable()`.
5. Document in [04-ui-and-screens.md](./04-ui-and-screens.md).

### New SVG artwork

Follow [05-rendering-and-assets.md](./05-rendering-and-assets.md). Touch `PieceThumbnail`, `DetailPanel`, and play face wrappers as appropriate.

### Tauri native feature (file picker, etc.)

1. Register command in `src-tauri/src/lib.rs`.
2. Allow capability in `src-tauri/capabilities/default.json`.
3. Call from React via `@tauri-apps/api`.
4. Guard for `npm run dev` in browser (feature detect or stub).

Currently the Rust side is a **stub** — most features can ship web-only first.

## Code style (as practiced in-repo)

- **TypeScript** strict types for domain; discriminated unions for `CatalogEntry` and `DragKind`.
- **No barrel files** — import from concrete paths.
- **JSDoc** on exported domain functions and non-obvious components.
- **React** — functional components, hooks; no class components.
- **State** — prefer `useMemo` for derived lists; keep drag listeners in `useEffect` with cleanup (see play table).
- **Comments** — only for non-obvious rules (merge distance, ace tile layout), not narration.

## Pitfalls

| Pitfall | Why it hurts | What to do |
|---------|----------------|------------|
| Hard-coding suit strings in components | Drift from `SUITS` | Import `Suit` and constants from `piecepack.ts` |
| Using catalog IDs on play instances | Table uses `uid()` | Map by suit/rank only when bridging systems |
| Mismatched tile/coin sizes | Drag clamp vs CSS | Sync `playTable.ts` and `tokens.css` |
| Extra manifest fields | Schema rejects | Version bump or keep UI-only |
| Importing React in `domain/` | Couples layers | Keep domain pure |
| Forgetting dark mode | Broken contrast | Edit both `:root` blocks in `tokens.css` |

## Testing today

There is no automated test package in the repository. Manual checklist:

- [ ] Catalog: filters, selection, detail faces, export downloads valid JSON
- [ ] Play: drag, stack merge, flip, shuffle, pick top, roll die, reset
- [ ] `npm run build` passes (`tsc` + Vite)
- [ ] Optional: `npm run tauri dev` smoke test

Consider adding unit tests for `mergeOnDrop` and `buildFullManifest` + schema validation when the project grows.

## Documentation

When you add a user-visible mode or contract change, update:

- Relevant doc in `docs/`
- Root `README.md` project layout section if file paths shift

## Getting help

- Domain questions → spec URL + `piecepack.ts`
- UX patterns → existing screen you are extending
- Tauri → [Tauri v2 docs](https://v2.tauri.app/)
