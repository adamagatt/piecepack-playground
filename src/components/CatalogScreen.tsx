import { useMemo, useState } from "react";
import {
  type CatalogEntry,
  type PieceKind,
  type Rank,
  type Suit,
  RANKS,
  SUITS,
  buildCatalog,
  buildFullManifest,
  downloadManifestJson,
  rankLabel,
  suitLabel,
} from "../domain/piecepack";
import { DetailPanel } from "./DetailPanel";
import { PieceThumbnail } from "./PieceThumbnail";

const KINDS: PieceKind[] = ["tile", "coin", "die", "pawn"];

/** Plural UI label for a piece kind filter chip (e.g. `"Tiles"`). */
function kindLabel(k: PieceKind): string {
  switch (k) {
    case "tile":
      return "Tiles";
    case "coin":
      return "Coins";
    case "die":
      return "Dice";
    case "pawn":
      return "Pawns";
  }
}

type Props = {
  onOpenPlay: () => void;
};

/** Main catalog view: filters, grid, detail panel, and manifest export. */
export function CatalogScreen({ onOpenPlay }: Props) {
  const catalog = useMemo(() => buildCatalog(), []);

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<PieceKind | "all">("all");
  const [suitFilter, setSuitFilter] = useState<Suit | "all">("all");
  const [rankFilter, setRankFilter] = useState<Rank | "all">("all");
  const [selected, setSelected] = useState<CatalogEntry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((entry) => {
      if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
      if (suitFilter !== "all" && entry.suit !== suitFilter) return false;
      if (rankFilter !== "all") {
        if (entry.kind === "die" || entry.kind === "pawn") return false;
        if (entry.rank !== rankFilter) return false;
      }
      if (!q) return true;
      return (
        entry.id.toLowerCase().includes(q) ||
        entry.label.toLowerCase().includes(q) ||
        entry.suit.toLowerCase().includes(q)
      );
    });
  }, [catalog, query, kindFilter, suitFilter, rankFilter]);

  /** Build the full standard-set manifest and download it as JSON. */
  function exportManifest() {
    downloadManifestJson(buildFullManifest());
  }

  const rankFilterDisabled = kindFilter === "die" || kindFilter === "pawn";

  return (
    <div className="catalog-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Piecepack Playground</h1>
          <p className="app-subtitle">
            Standard set reference — browse components and export a JSON manifest for tooling.
          </p>
        </div>
        <div className="catalog-header-actions">
          <button type="button" className="btn" onClick={onOpenPlay}>
            Play table
          </button>
          <button type="button" className="btn primary" onClick={exportManifest}>
            Export manifest JSON
          </button>
        </div>
      </header>

      <div className="catalog-body">
        <section className="filters-panel" aria-label="Filters">
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Filter by id, label, or suit…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <fieldset className="field-row">
            <legend>Kind</legend>
            <div className="chips">
              <button
                type="button"
                className={`chip ${kindFilter === "all" ? "active" : ""}`}
                onClick={() => setKindFilter("all")}
              >
                All
              </button>
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`chip ${kindFilter === k ? "active" : ""}`}
                  onClick={() => setKindFilter(k)}
                >
                  {kindLabel(k)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field-row">
            <legend>Suit</legend>
            <div className="chips">
              <button
                type="button"
                className={`chip ${suitFilter === "all" ? "active" : ""}`}
                onClick={() => setSuitFilter("all")}
              >
                All
              </button>
              {SUITS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${suitFilter === s ? "active" : ""}`}
                  onClick={() => setSuitFilter(s)}
                >
                  {suitLabel(s)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field-row">
            <legend>Value</legend>
            <div className="chips">
              <button
                type="button"
                className={`chip ${rankFilter === "all" ? "active" : ""}`}
                onClick={() => setRankFilter("all")}
                disabled={rankFilterDisabled}
              >
                All
              </button>
              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`chip ${rankFilter === r ? "active" : ""}`}
                  onClick={() => setRankFilter(r)}
                  disabled={rankFilterDisabled}
                >
                  {rankLabel(r)}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="results-count" role="status">
            Showing {filtered.length} of {catalog.length} entries
          </p>
        </section>

        <main className="grid-main">
          <ul className="piece-grid" aria-label="Piece catalog">
            {filtered.map((entry) => {
              const active = selected?.id === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`piece-card ${active ? "active" : ""}`}
                    onClick={() => setSelected(entry)}
                    aria-pressed={active}
                  >
                    <div className="piece-thumb" aria-hidden>
                      <PieceThumbnail entry={entry} />
                    </div>
                    <span className="piece-kind">{kindLabel(entry.kind).slice(0, -1)}</span>
                    <span className="piece-label">{entry.label}</span>
                    <code className="piece-id">{entry.id}</code>
                  </button>
                </li>
              );
            })}
          </ul>
        </main>

        <DetailPanel entry={selected} onClose={() => setSelected(null)} />
      </div>

      <footer className="app-footer">
        <a href="https://piecepack.org/piecepack_article.html" target="_blank" rel="noreferrer">
          Piece Pack specification
        </a>
        <span aria-hidden> · </span>
        <span>Piece Pack catalog · Tauri + React</span>
      </footer>
    </div>
  );
}
