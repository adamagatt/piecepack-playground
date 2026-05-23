# 05 — Rendering and assets

Piece visuals are **inline React SVG components**, not raster sprites. This keeps the catalog and play table sharp at any zoom and makes suit colors easy to theme via CSS variables.

## Component map

| Component | File | Renders |
|-----------|------|---------|
| `SuitGlyph` | `SuitGlyph.tsx` | One of four suits (SVG import) |
| `RankFace` | `RankFace.tsx` | Rank text/glyph layout |
| `TileArt` | `TileArt.tsx` | Obverse or reverse grid |
| `CoinArt` | `CoinArt.tsx` | Value or suit face |
| `DieArt` | `DieArt.tsx` | All six faces (strip or grid) |
| `DieFaceArt` | `DieFaceArt.tsx` | Single die face (play table) |
| `PawnArt` | `PawnArt.tsx` | Pawn silhouette |
| `suitColors` | `suitColors.ts` | `suitCssVar()` → `var(--suit-*)` |

## Suit glyphs (assets)

Source files: `src/assets/pieces/suits/{suns,moons,crowns,arms}.svg`

Loaded through **SVGR** (`vite-plugin-svgr`) as React components in `SuitGlyph.tsx`. When replacing artwork:

1. Keep viewBox reasonable (glyphs scale via parent `width/height: 100%`).
2. Prefer `currentColor` fills so parent `color` / `style={{ color }}` controls tint.
3. Run `npm run dev` and check catalog + play table + dark mode.

## Color system

**Tokens** — `src/styles/tokens.css`

- Global UI: `--bg`, `--surface`, `--text`, `--accent`, …
- Per suit: `--suit-suns`, `--suit-moons`, `--suit-crowns`, `--suit-arms`
- Catalog piece faces: `--tile-face`, `--tile-grid`, `--coin-value-ink`
- Play table: `--play-surface-bg`, `--play-piece-face`, sizes `--play-tile-size`, etc.

**Usage in components**

- `suitCssVar(suit)` returns `var(--suit-suns)` etc. Wrap art in `<div style={{ color: suitCssVar(suit) }}>` for tinted suits.
- Tile obverse uses `currentColor` for suit corner; coin **value** face uses `--coin-value-ink` inside `CoinArt`.
- Moons suit is black in both light and dark themes by design.

Dark mode follows `prefers-color-scheme: dark` — no in-app theme toggle.

## Tile faces

`TileArt` variants:

- **`obverse`** — Corner suit glyph + rank (rank hidden styling for ace per component logic).
- **`reverse`** — 2×2 grid lines only (abstract “back” for layout games).

Play table maps `faceUp: true` → obverse, `false` → reverse.

## Coin faces

`CoinArt` `face` prop:

- **`value`** — Rank in neutral ink (`--coin-value-ink` / play equivalent).
- **`suit`** — Large suit glyph in suit color.

Play table: `faceUp: true` → value, `false` → suit.

## Dice

- **`DieArt`** — Reference layouts for catalog (`layout: "strip" | "grid"`).
- **`DieFaceArt`** — One face for 3D-styled cube on play table.

Face content order matches `DIE_FACES` in domain code. Rolling updates `faceIndex` in `DiePiece`, not the `faces` array (dice on table don’t store per-face permutations).

## Layout constants

Play geometry is duplicated conceptually in two places — keep them in sync:

| Constant | `playTable.ts` | CSS token |
|----------|----------------|-----------|
| Tile size | `TILE_W`, `TILE_H` (68) | `--play-tile-size` |
| Coin diameter | `COIN_D` (58) | `--play-coin-size` |
| Die size | `DIE_SZ` (58) | `--play-die-size` |

Clamp math in `moveDraggedPiece` uses TS constants; visual size uses CSS. If you change one, change both.

## Styling conventions

- BEM-like prefixes: `catalog-*`, `play-*`, `detail-*`, `piece-*`.
- Buttons: `.btn`, `.btn.primary`, `.btn.ghost`.
- Filter chips: `.chip`, `.chip.active`.
- No CSS modules — class names are global in `App.css`.

## Artwork licensing note

README states artwork is **minimal originals**, not traced from vendor piecepack sets. Preserve that separation when accepting external art contributions.

## Checklist: new visual feature

1. Add or extend SVG component under `pieces/`.
2. Wire into `PieceThumbnail` and/or `DetailPanel` if catalog-visible.
3. Wire into `PlayTableScreen` face wrappers if interactive.
4. Add tokens to `tokens.css` if new colors needed (light + dark blocks).
5. Spot-check contrast for moons (black) on dark play surface.
