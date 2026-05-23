import type { Suit } from "../../domain/piecepack";

/** CSS `var(...)` token for a suit's theme color. */
export function suitCssVar(suit: Suit): string {
  switch (suit) {
    case "suns":
      return "var(--suit-suns)";
    case "moons":
      return "var(--suit-moons)";
    case "crowns":
      return "var(--suit-crowns)";
    case "arms":
      return "var(--suit-arms)";
  }
}
