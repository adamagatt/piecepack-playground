import type { Suit } from "../../domain/piecepack";

type Props = {
  suit: Suit;
};

export function PawnArt({ suit }: Props) {
  void suit;
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      <path
        fill="currentColor"
        stroke="var(--border)"
        strokeWidth="0.6"
        d="M12 4.5 C14 4.5 15.5 6 15.5 8 C15.5 9.8 14.3 11.3 12.6 11.7 L14 19 H10 L11.4 11.7 C9.7 11.3 8.5 9.8 8.5 8 C8.5 6 10 4.5 12 4.5 Z"
      />
      <ellipse cx="12" cy="19.5" rx="5" ry="1.6" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
