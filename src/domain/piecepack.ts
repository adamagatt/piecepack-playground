/** Standard Piece Pack — https://piecepack.org/piecepack_article.html */

export const SPEC_URL = "https://piecepack.org/piecepack_article.html" as const;

export const MANIFEST_VERSION = "1.0.0" as const;

export const SUITS = ["suns", "moons", "crowns", "arms"] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ["null", "ace", "2", "3", "4", "5"] as const;
export type Rank = (typeof RANKS)[number];

export type PieceKind = "tile" | "coin" | "die" | "pawn";

/** Canonical die face order used in manifests and the Anatomy diagram set (null–5). */
export const DIE_FACES: readonly Rank[] = ["null", "ace", "2", "3", "4", "5"];

/** Human-readable suit name (e.g. `"Suns"`). */
export function suitLabel(suit: Suit): string {
  switch (suit) {
    case "suns":
      return "Suns";
    case "moons":
      return "Moons";
    case "crowns":
      return "Crowns";
    case "arms":
      return "Arms";
  }
}

/** Human-readable rank name (e.g. `"Null"`, `"Ace"`, `"3"`). */
export function rankLabel(rank: Rank): string {
  switch (rank) {
    case "null":
      return "Null";
    case "ace":
      return "Ace";
    default:
      return rank;
  }
}

/** Compact rank glyph for SVG faces (e.g. `"∅"`, `"A"`, `"3"`). */
export function rankShort(rank: Rank): string {
  switch (rank) {
    case "null":
      return "∅";
    case "ace":
      return "A";
    default:
      return rank;
  }
}

/** Stable catalog id for a tile (`tile:{suit}:{rank}`). */
export function tileId(suit: Suit, rank: Rank): string {
  return `tile:${suit}:${rank}`;
}

/** Stable catalog id for a coin (`coin:{suit}:{rank}`). */
export function coinId(suit: Suit, rank: Rank): string {
  return `coin:${suit}:${rank}`;
}

/** Stable catalog id for a die (`die:{suit}`). */
export function dieId(suit: Suit): string {
  return `die:${suit}`;
}

/** Stable catalog id for a pawn (`pawn:{suit}`). */
export function pawnId(suit: Suit): string {
  return `pawn:${suit}`;
}

export type TileRecord = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type CoinRecord = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type DieRecord = {
  id: string;
  suit: Suit;
  faces: Rank[];
};

export type PawnRecord = {
  id: string;
  suit: Suit;
};

export type PiecePackManifest = {
  manifestVersion: typeof MANIFEST_VERSION;
  spec: typeof SPEC_URL;
  generatedAt: string;
  tiles: TileRecord[];
  coins: CoinRecord[];
  dice: DieRecord[];
  pawns: PawnRecord[];
};

export type TileEntry = {
  kind: "tile";
  id: string;
  suit: Suit;
  rank: Rank;
  label: string;
};

export type CoinEntry = {
  kind: "coin";
  id: string;
  suit: Suit;
  rank: Rank;
  label: string;
};

export type DieEntry = {
  kind: "die";
  id: string;
  suit: Suit;
  faces: Rank[];
  label: string;
};

export type PawnEntry = {
  kind: "pawn";
  id: string;
  suit: Suit;
  label: string;
};

export type CatalogEntry = TileEntry | CoinEntry | DieEntry | PawnEntry;

/** Full standard-set catalog entries for UI browse/filter (labels included). */
export function buildCatalog(): CatalogEntry[] {
  const tiles: TileEntry[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      kind: "tile" as const,
      id: tileId(suit, rank),
      suit,
      rank,
      label: `${suitLabel(suit)} tile — ${rankLabel(rank)}`,
    })),
  );

  const coins: CoinEntry[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      kind: "coin" as const,
      id: coinId(suit, rank),
      suit,
      rank,
      label: `${suitLabel(suit)} coin — ${rankLabel(rank)}`,
    })),
  );

  const dice: DieEntry[] = SUITS.map((suit) => ({
    kind: "die",
    id: dieId(suit),
    suit,
    faces: [...DIE_FACES],
    label: `${suitLabel(suit)} die`,
  }));

  const pawns: PawnEntry[] = SUITS.map((suit) => ({
    kind: "pawn",
    id: pawnId(suit),
    suit,
    label: `${suitLabel(suit)} pawn`,
  }));

  return [...tiles, ...coins, ...dice, ...pawns];
}

/**
 * JSON manifest for the complete standard set, conforming to `schemas/piecepack-manifest.schema.json`.
 * @param now - Timestamp used for `generatedAt` (defaults to current time).
 */
export function buildFullManifest(now = new Date()): PiecePackManifest {
  const tiles: TileRecord[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({ id: tileId(suit, rank), suit, rank })),
  );
  const coins: CoinRecord[] = SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({ id: coinId(suit, rank), suit, rank })),
  );
  const dice: DieRecord[] = SUITS.map((suit) => ({
    id: dieId(suit),
    suit,
    faces: [...DIE_FACES],
  }));
  const pawns: PawnRecord[] = SUITS.map((suit) => ({
    id: pawnId(suit),
    suit,
  }));

  return {
    manifestVersion: MANIFEST_VERSION,
    spec: SPEC_URL,
    generatedAt: now.toISOString(),
    tiles,
    coins,
    dice,
    pawns,
  };
}

/**
 * Trigger a browser download of a manifest as formatted JSON.
 * @param manifest - Manifest payload to serialize.
 * @param filename - Suggested download filename.
 */
export function downloadManifestJson(manifest: PiecePackManifest, filename = "piecepack-manifest.json"): void {
  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
