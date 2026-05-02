import type { Suit } from "../../domain/piecepack";
import SunsGlyph from "../../assets/pieces/suits/suns.svg?react";
import MoonsGlyph from "../../assets/pieces/suits/moons.svg?react";
import CrownsGlyph from "../../assets/pieces/suits/crowns.svg?react";
import ArmsGlyph from "../../assets/pieces/suits/arms.svg?react";

type Props = {
  suit: Suit;
  className?: string;
};

type GlyphComponent = typeof SunsGlyph;

const GLYPHS: Record<Suit, GlyphComponent> = {
  suns: SunsGlyph,
  moons: MoonsGlyph,
  crowns: CrownsGlyph,
  arms: ArmsGlyph,
};

/** Minimal suit icons inspired by the public-domain Piece Pack semantics (not traced from vendor art). */
export function SuitGlyph({ suit, className }: Props) {
  const Cmp = GLYPHS[suit];
  return <Cmp className={className} aria-hidden />;
}
