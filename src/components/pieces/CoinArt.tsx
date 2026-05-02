import type { Rank, Suit } from "../../domain/piecepack";
import { suitCssVar } from "./suitColors";
import { SuitGlyph } from "./SuitGlyph";
import { RankFace } from "./RankFace";

type Props = {
  suit: Suit;
  rank: Rank;
  face: "value" | "suit";
};

function Tick({ rotation = 0 }: { rotation?: number }) {
  return (
    <polygon
      points="12,3 13.3,6 10.7,6"
      fill="currentColor"
      transform={`rotate(${rotation} 12 12)`}
    />
  );
}

export function CoinArt({ suit, rank, face }: Props) {
  const suitColor = suitCssVar(suit);
  if (face === "value") {
    return (
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
        <circle cx="12" cy="12" r="10.2" fill="var(--surface)" stroke="var(--border)" strokeWidth="0.9" />
        <g style={{ color: "var(--coin-value-ink)" }}>
          <Tick />
          <RankFace suit={suit} rank={rank} size="lg" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <circle cx="12" cy="12" r="10.2" fill="var(--surface)" stroke={suitColor} strokeWidth="1.2" />
      <g style={{ color: suitColor }}>
        <Tick />
        <g transform="translate(12 12) scale(1.15) translate(-12 -12)">
          <SuitGlyph suit={suit} />
        </g>
      </g>
    </svg>
  );
}
