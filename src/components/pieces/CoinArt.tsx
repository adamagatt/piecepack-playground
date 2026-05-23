import type { Rank, Suit } from "../../domain/piecepack";
import { suitCssVar } from "./suitColors";
import { SuitGlyph } from "./SuitGlyph";
import { RankFace } from "./RankFace";

type Props = {
  suit: Suit;
  rank: Rank;
  face: "value" | "suit";
};

/** Orientation tick mark at the top of a coin face. */
function Tick({ rotation = 0 }: { rotation?: number }) {
  return (
    <polygon
      points="12,3 13.3,6 10.7,6"
      fill="currentColor"
      transform={`rotate(${rotation} 12 12)`}
    />
  );
}

/**
 * SVG coin face: value (black rank) or suit (colored glyph).
 * @param face - `"value"` shows rank ink; `"suit"` shows the scaled suit glyph.
 */
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

  // Suit face: scale suit glyph (~24²) around (12,12). Single matrix avoids parse-order quirks with chained translate/scale.
  const suitScale = 0.8;
  const gx = 12 * (1 - suitScale);

  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <circle cx="12" cy="12" r="10.2" fill="var(--surface)" stroke={suitColor} strokeWidth="1.2" />
      <g style={{ color: suitColor }}>
        <Tick />
        <SuitGlyph
          suit={suit}
          transform={`matrix(${suitScale} 0 0 ${suitScale} ${gx} ${gx})`}
        />
      </g>
    </svg>
  );
}
