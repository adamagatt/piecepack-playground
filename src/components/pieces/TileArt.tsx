import type { Rank, Suit } from "../../domain/piecepack";
import { SuitGlyph } from "./SuitGlyph";
import { RankFace } from "./RankFace";

type Props = {
  suit: Suit;
  rank: Rank;
  variant: "obverse" | "reverse";
};

export function TileArt({ suit, rank, variant }: Props) {
  if (variant === "reverse") {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <rect
          x="1"
          y="1"
          width="22"
          height="22"
          rx="2"
          fill="var(--tile-grid)"
          stroke="var(--border)"
          strokeWidth="0.8"
        />
        <line x1="12" y1="2" x2="12" y2="22" stroke="var(--border)" strokeWidth="0.7" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="var(--border)" strokeWidth="0.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="2"
        fill="var(--tile-face)"
        stroke="var(--border)"
        strokeWidth="0.9"
      />
      {rank !== "ace" && (
        <g
          transform="translate(23.5 0.50) scale(0.38) translate(-24 0)"
          style={{ color: "currentColor" }}
        >
          <SuitGlyph suit={suit} />
        </g>
      )}
      <g style={{ color: "currentColor" }}>
        <RankFace suit={suit} rank={rank} size="lg" aceGlyphScaleMul={1.00} />
      </g>
    </svg>
  );
}
