import type { CatalogEntry } from "../domain/piecepack";
import { suitCssVar } from "./pieces/suitColors";
import { TileArt } from "./pieces/TileArt";
import { CoinArt } from "./pieces/CoinArt";
import { DieArt } from "./pieces/DieArt";
import { PawnArt } from "./pieces/PawnArt";

type Props = {
  entry: CatalogEntry;
};

/** Compact SVG preview used on catalog grid cards. */
export function PieceThumbnail({ entry }: Props) {
  const color = suitCssVar(entry.suit);

  switch (entry.kind) {
    case "tile":
      return (
        <div style={{ color, width: "100%", height: "100%" }}>
          <TileArt suit={entry.suit} rank={entry.rank} variant="obverse" />
        </div>
      );
    case "coin":
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <CoinArt suit={entry.suit} rank={entry.rank} face="value" />
        </div>
      );
    case "die":
      return (
        <div style={{ width: "100%", height: "100%", color }}>
          <DieArt suit={entry.suit} layout="grid" />
        </div>
      );
    case "pawn":
      return (
        <div style={{ color, width: "100%", height: "100%" }}>
          <PawnArt suit={entry.suit} />
        </div>
      );
  }
}
