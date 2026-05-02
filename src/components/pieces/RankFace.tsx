import type { Rank, Suit } from "../../domain/piecepack";
import { rankShort } from "../../domain/piecepack";
import { SuitGlyph } from "./SuitGlyph";

type Props = {
  suit: Suit;
  rank: Rank;
  /** Tile/die/coin sizing inside viewBox units */
  size?: "sm" | "md" | "lg";
  /** Only applies when rank is ace; multiplies the centered suit glyph scale. */
  aceGlyphScaleMul?: number;
};

export function RankFace({ suit, rank, size = "md", aceGlyphScaleMul = 1 }: Props) {
  const fontSize = size === "lg" ? 14 : size === "md" ? 11 : 8;
  if (rank === "null") {
    return (
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        fontSize={fontSize}
        fontFamily="system-ui, sans-serif"
      >
        ∅
      </text>
    );
  }
  if (rank === "ace") {
    const base = size === "lg" ? 0.8 : size === "md" ? 0.6 : 0.4;
    const gScale = base * aceGlyphScaleMul;
    return (
      <g transform={`translate(12 12) scale(${gScale}) translate(-12 -12)`}>
        <SuitGlyph suit={suit} />
      </g>
    );
  }
  return (
    <text
      x="12"
      y="13"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="currentColor"
      fontSize={fontSize - 1}
      fontWeight="600"
      fontFamily="system-ui, sans-serif"
    >
      {rankShort(rank)}
    </text>
  );
}
