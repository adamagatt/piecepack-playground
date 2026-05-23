import type { Rank, Suit } from "../../domain/piecepack";
import { suitCssVar } from "./suitColors";
import { RankFace } from "./RankFace";

type Props = {
  suit: Suit;
  rank: Rank;
};

/** Single die face (one rank) for the play table. */
export function DieFaceArt({ suit, rank }: Props) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
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
      <g style={{ color: suitCssVar(suit) }}>
        <RankFace suit={suit} rank={rank} size="lg" />
      </g>
    </svg>
  );
}
