import type { CatalogEntry } from "../domain/piecepack";
import { DIE_FACES, rankLabel, suitLabel } from "../domain/piecepack";
import { suitCssVar } from "./pieces/suitColors";
import { TileArt } from "./pieces/TileArt";
import { CoinArt } from "./pieces/CoinArt";
import { DieArt } from "./pieces/DieArt";
import { PawnArt } from "./pieces/PawnArt";

type Props = {
  entry: CatalogEntry | null;
  onClose: () => void;
};

export function DetailPanel({ entry, onClose }: Props) {
  if (!entry) {
    return (
      <aside className="detail-panel empty" aria-label="Piece details">
        <p className="detail-placeholder">Select a piece to see faces and notes.</p>
      </aside>
    );
  }

  const color = suitCssVar(entry.suit);
  const subtitle =
    entry.kind === "tile" || entry.kind === "coin"
      ? `${suitLabel(entry.suit)} · ${rankLabel(entry.rank)}`
      : suitLabel(entry.suit);

  return (
    <aside className="detail-panel" aria-label={`Details for ${entry.label}`}>
      <header className="detail-header">
        <div>
          <h2 className="detail-title">{entry.label}</h2>
          <p className="detail-meta">{subtitle}</p>
          <p className="detail-id">
            <code>{entry.id}</code>
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={onClose}>
          Clear
        </button>
      </header>

      {entry.kind === "tile" && (
        <section className="detail-section" aria-labelledby="tile-faces-heading">
          <h3 id="tile-faces-heading">Tile faces</h3>
          <p className="detail-hint">
            Obverse shows suit (corner) and value; reverse is a 2×2 grid for abstract layouts.
          </p>
          <div className="detail-grid two">
            <figure>
              <figcaption>Obverse</figcaption>
              <div className="detail-art sm" style={{ color }}>
                <TileArt suit={entry.suit} rank={entry.rank} variant="obverse" />
              </div>
            </figure>
            <figure>
              <figcaption>Reverse (grid)</figcaption>
              <div className="detail-art sm">
                <TileArt suit={entry.suit} rank={entry.rank} variant="reverse" />
              </div>
            </figure>
          </div>
        </section>
      )}

      {entry.kind === "coin" && (
        <section className="detail-section" aria-labelledby="coin-faces-heading">
          <h3 id="coin-faces-heading">Coin faces</h3>
          <p className="detail-hint">
            Value face uses black ink; suit face uses suit color. Tick marks can indicate facing when rules need it.
          </p>
          <div className="detail-grid two">
            <figure>
              <figcaption>Value</figcaption>
              <div className="detail-art sm">
                <CoinArt suit={entry.suit} rank={entry.rank} face="value" />
              </div>
            </figure>
            <figure>
              <figcaption>Suit</figcaption>
              <div className="detail-art sm">
                <CoinArt suit={entry.suit} rank={entry.rank} face="suit" />
              </div>
            </figure>
          </div>
        </section>
      )}

      {entry.kind === "die" && (
        <section className="detail-section" aria-labelledby="die-faces-heading">
          <h3 id="die-faces-heading">Die faces</h3>
          <p className="detail-hint">
            One die per suit; faces are colored in that suit.             Canonical order in manifests:{" "}
            {DIE_FACES.map((r) => rankLabel(r)).join(", ")}.
          </p>
          <figure>
            <figcaption>Strip</figcaption>
            <div className="detail-art wide">
              <DieArt suit={entry.suit} layout="strip" />
            </div>
          </figure>
          <figure>
            <figcaption>Grid</figcaption>
            <div className="detail-art die-grid">
              <DieArt suit={entry.suit} layout="grid" />
            </div>
          </figure>
        </section>
      )}

      {entry.kind === "pawn" && (
        <section className="detail-section" aria-labelledby="pawn-heading">
          <h3 id="pawn-heading">Pawn</h3>
          <p className="detail-hint">One pawn per suit, tinted to match that suit.</p>
          <div className="detail-art md" style={{ color }}>
            <PawnArt suit={entry.suit} />
          </div>
        </section>
      )}
    </aside>
  );
}
