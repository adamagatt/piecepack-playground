import type { ComponentPropsWithoutRef } from "react";
import type { Suit } from "../../domain/piecepack";
import SunsGlyph from "../../assets/pieces/suits/suns.svg?react";
import MoonsGlyph from "../../assets/pieces/suits/moons.svg?react";
import CrownsGlyph from "../../assets/pieces/suits/crowns.svg?react";
import ArmsGlyph from "../../assets/pieces/suits/arms.svg?react";

type GlyphProps = Omit<ComponentPropsWithoutRef<typeof SunsGlyph>, "children">;

type Props = GlyphProps & {
  suit: Suit;
};

type GlyphComponent = typeof SunsGlyph;

const GLYPHS: Record<Suit, GlyphComponent> = {
  suns: SunsGlyph,
  moons: MoonsGlyph,
  crowns: CrownsGlyph,
  arms: ArmsGlyph,
};

/**
 * Suit icon component for the given suit (minimal originals; not traced from vendor sets).
 * Forwards SVG props to the underlying glyph.
 */
export function SuitGlyph({ suit, ...rest }: Props) {
  const Cmp = GLYPHS[suit];
  return <Cmp {...rest} aria-hidden />;
}
