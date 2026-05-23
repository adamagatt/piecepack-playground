import type { Rank, Suit } from "../../domain/piecepack";
import { DIE_FACES } from "../../domain/piecepack";
import { suitCssVar } from "./suitColors";
import { RankFace } from "./RankFace";

type Props = {
  suit: Suit;
  layout?: "strip" | "grid";
};

/**
 * SVG die showing all six faces in canonical manifest order (null through 5).
 * @param layout - `"strip"` (horizontal) or `"grid"` (2×3).
 */
export function DieArt({ suit, layout = "strip" }: Props) {
  const color = suitCssVar(suit);
  const faces = DIE_FACES;

  /** Single die face cell positioned in strip or grid layout. */
  const cell = (rank: Rank, index: number, row: number, col: number) => (
    <svg
      key={`${rank}-${index}`}
      x={col * 13}
      y={row * 13}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="2"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="0.9"
      />
      <g style={{ color }}>
        <RankFace suit={suit} rank={rank} size="md" />
      </g>
    </svg>
  );

  if (layout === "strip") {
    return (
      <svg viewBox="0 0 78 13" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {faces.map((rank, i) => cell(rank, i, 0, i))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 39 26" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {faces.map((rank, i) => cell(rank, i, Math.floor(i / 3), i % 3))}
    </svg>
  );
}
