import { DIE_FACES, RANKS, SUITS, type Rank, type Suit } from "./piecepack";

export const TILE_W = 68;
export const TILE_H = 68;
export const COIN_D = 58;
export const DIE_SZ = 58;
export const MERGE_DIST = 50;
export const PLAY_W = 1000;
export const PLAY_H = 560;

export type FaceCard = { suit: Suit; rank: Rank; faceUp: boolean };

export type LooseTile = FaceCard & { id: string; x: number; y: number };
export type LooseCoin = FaceCard & { id: string; x: number; y: number };
export type TileStack = { id: string; x: number; y: number; tiles: FaceCard[] };
export type CoinStack = { id: string; x: number; y: number; coins: FaceCard[] };
export type DiePiece = { id: string; suit: Suit; faceIndex: number; x: number; y: number };

export type TableModel = {
  looseTiles: LooseTile[];
  looseCoins: LooseCoin[];
  tileStacks: TileStack[];
  coinStacks: CoinStack[];
  dice: DiePiece[];
};

export type DragKind = "tile" | "coin" | "tileStack" | "coinStack" | "die";

export type DragState = {
  kind: DragKind;
  id: string;
  grabDx: number;
  grabDy: number;
};

export function uid(): string {
  return `pp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function initialTable(): TableModel {
  const looseTiles: LooseTile[] = [];
  let tx = 24;
  let ty = 160;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      looseTiles.push({ id: uid(), suit, rank, faceUp: true, x: tx, y: ty });
      tx += TILE_W + 6;
      if (tx > PLAY_W - TILE_W - 24) {
        tx = 24;
        ty += TILE_H + 8;
      }
    }
  }

  const looseCoins: LooseCoin[] = [];
  let cx = 24;
  let cy = 320;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      looseCoins.push({ id: uid(), suit, rank, faceUp: true, x: cx, y: cy });
      cx += COIN_D + 8;
      if (cx > PLAY_W / 2) {
        cx = 24;
        cy += COIN_D + 10;
      }
    }
  }

  const dice: DiePiece[] = SUITS.map((suit, i) => ({
    id: uid(),
    suit,
    faceIndex: Math.floor(Math.random() * DIE_FACES.length),
    x: 120 + i * (DIE_SZ + 16),
    y: 40,
  }));

  return { looseTiles, looseCoins, tileStacks: [], coinStacks: [], dice };
}

function centerLooseTile(t: LooseTile): { cx: number; cy: number } {
  return { cx: t.x + TILE_W / 2, cy: t.y + TILE_H / 2 };
}
function centerLooseCoin(c: LooseCoin): { cx: number; cy: number } {
  return { cx: c.x + COIN_D / 2, cy: c.y + COIN_D / 2 };
}
function centerTileStack(s: TileStack): { cx: number; cy: number } {
  return { cx: s.x + TILE_W / 2, cy: s.y + TILE_H / 2 };
}
function centerCoinStack(s: CoinStack): { cx: number; cy: number } {
  return { cx: s.x + COIN_D / 2, cy: s.y + COIN_D / 2 };
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Apply stack-merge rules when a drag ends at (px, py) in play-area coordinates. */
export function mergeOnDrop(m: TableModel, drag: DragState, px: number, py: number): TableModel {
  if (drag.kind === "tile") {
    const tile = m.looseTiles.find((t) => t.id === drag.id);
    if (!tile) return m;

    let best: { d: number; hit: { type: "lt"; id: string } | { type: "ts"; id: string } } | null = null;
    for (const t of m.looseTiles) {
      if (t.id === drag.id) continue;
      const c = centerLooseTile(t);
      const d0 = dist(px, py, c.cx, c.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "lt", id: t.id } };
    }
    for (const s of m.tileStacks) {
      const c = centerTileStack(s);
      const d0 = dist(px, py, c.cx, c.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "ts", id: s.id } };
    }

    if (best) {
      const face: FaceCard = { suit: tile.suit, rank: tile.rank, faceUp: tile.faceUp };
      if (best.hit.type === "lt") {
        const other = m.looseTiles.find((t) => t.id === best.hit.id)!;
        return {
          ...m,
          looseTiles: m.looseTiles.filter((t) => t.id !== tile.id && t.id !== other.id),
          tileStacks: [
            ...m.tileStacks,
            {
              id: uid(),
              x: other.x,
              y: other.y,
              tiles: [
                { suit: other.suit, rank: other.rank, faceUp: other.faceUp },
                face,
              ],
            },
          ],
        };
      }
      const ts = m.tileStacks.find((s) => s.id === best.hit.id)!;
      return {
        ...m,
        looseTiles: m.looseTiles.filter((t) => t.id !== tile.id),
        tileStacks: m.tileStacks.map((s) =>
          s.id === ts.id ? { ...s, tiles: [...s.tiles, face] } : s,
        ),
      };
    }
  }

  if (drag.kind === "tileStack") {
    const stack = m.tileStacks.find((s) => s.id === drag.id);
    if (!stack) return m;
    let best: { d: number; hit: { type: "lt"; id: string } | { type: "ts"; id: string } } | null = null;
    for (const t of m.looseTiles) {
      const c = centerLooseTile(t);
      const d0 = dist(px, py, c.cx, c.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "lt", id: t.id } };
    }
    for (const s of m.tileStacks) {
      if (s.id === drag.id) continue;
      const c = centerTileStack(s);
      const d0 = dist(px, py, c.cx, c.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "ts", id: s.id } };
    }
    if (best) {
      const next: TableModel = {
        looseTiles: m.looseTiles.filter((t) => t.id !== (best.hit.type === "lt" ? best.hit.id : "")),
        looseCoins: [...m.looseCoins],
        tileStacks: m.tileStacks.filter((s) => s.id !== stack.id),
        coinStacks: [...m.coinStacks],
        dice: [...m.dice],
      };
      if (best.hit.type === "lt") {
        const other = m.looseTiles.find((t) => t.id === best.hit.id)!;
        next.looseTiles = next.looseTiles.filter((t) => t.id !== other.id);
        next.tileStacks.push({
          id: uid(),
          x: other.x,
          y: other.y,
          tiles: [{ suit: other.suit, rank: other.rank, faceUp: other.faceUp }, ...stack.tiles],
        });
      } else {
        const target = m.tileStacks.find((s) => s.id === best.hit.id)!;
        next.tileStacks = next.tileStacks
          .filter((s) => s.id !== target.id)
          .concat({
            id: uid(),
            x: target.x,
            y: target.y,
            tiles: [...target.tiles, ...stack.tiles],
          });
      }
      return next;
    }
  }

  if (drag.kind === "coin") {
    const coin = m.looseCoins.find((c) => c.id === drag.id);
    if (!coin) return m;
    const face: FaceCard = { suit: coin.suit, rank: coin.rank, faceUp: coin.faceUp };
    let best: { d: number; hit: { type: "lc"; id: string } | { type: "cs"; id: string } } | null = null;
    for (const c of m.looseCoins) {
      if (c.id === drag.id) continue;
      const cen = centerLooseCoin(c);
      const d0 = dist(px, py, cen.cx, cen.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "lc", id: c.id } };
    }
    for (const s of m.coinStacks) {
      const cen = centerCoinStack(s);
      const d0 = dist(px, py, cen.cx, cen.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "cs", id: s.id } };
    }
    if (best) {
      if (best.hit.type === "lc") {
        const other = m.looseCoins.find((c) => c.id === best.hit.id)!;
        return {
          ...m,
          looseCoins: m.looseCoins.filter((c) => c.id !== coin.id && c.id !== other.id),
          coinStacks: [
            ...m.coinStacks,
            {
              id: uid(),
              x: other.x,
              y: other.y,
              coins: [
                { suit: other.suit, rank: other.rank, faceUp: other.faceUp },
                face,
              ],
            },
          ],
        };
      }
      const cs = m.coinStacks.find((s) => s.id === best.hit.id)!;
      return {
        ...m,
        looseCoins: m.looseCoins.filter((c) => c.id !== coin.id),
        coinStacks: m.coinStacks.map((s) =>
          s.id === cs.id ? { ...s, coins: [...s.coins, face] } : s,
        ),
      };
    }
  }

  if (drag.kind === "coinStack") {
    const stack = m.coinStacks.find((s) => s.id === drag.id);
    if (!stack) return m;
    let best: { d: number; hit: { type: "lc"; id: string } | { type: "cs"; id: string } } | null = null;
    for (const c of m.looseCoins) {
      const cen = centerLooseCoin(c);
      const d0 = dist(px, py, cen.cx, cen.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "lc", id: c.id } };
    }
    for (const s of m.coinStacks) {
      if (s.id === drag.id) continue;
      const cen = centerCoinStack(s);
      const d0 = dist(px, py, cen.cx, cen.cy);
      if (d0 < MERGE_DIST && (!best || d0 < best.d)) best = { d: d0, hit: { type: "cs", id: s.id } };
    }
    if (best) {
      const next: TableModel = {
        looseTiles: [...m.looseTiles],
        looseCoins: m.looseCoins.filter((c) => c.id !== (best.hit.type === "lc" ? best.hit.id : "")),
        tileStacks: [...m.tileStacks],
        coinStacks: m.coinStacks.filter((s) => s.id !== stack.id),
        dice: [...m.dice],
      };
      if (best.hit.type === "lc") {
        const other = m.looseCoins.find((c) => c.id === best.hit.id)!;
        next.looseCoins = next.looseCoins.filter((c) => c.id !== other.id);
        next.coinStacks.push({
          id: uid(),
          x: other.x,
          y: other.y,
          coins: [{ suit: other.suit, rank: other.rank, faceUp: other.faceUp }, ...stack.coins],
        });
      } else {
        const target = m.coinStacks.find((s) => s.id === best.hit.id)!;
        next.coinStacks = next.coinStacks
          .filter((s) => s.id !== target.id)
          .concat({
            id: uid(),
            x: target.x,
            y: target.y,
            coins: [...target.coins, ...stack.coins],
          });
      }
      return next;
    }
  }

  return m;
}

export function moveDraggedPiece(m: TableModel, drag: DragState, px: number, py: number): TableModel {
  const next = {
    ...m,
    looseTiles: [...m.looseTiles],
    looseCoins: [...m.looseCoins],
    tileStacks: [...m.tileStacks],
    coinStacks: [...m.coinStacks],
    dice: [...m.dice],
  };

  if (drag.kind === "tile") {
    const i = next.looseTiles.findIndex((t) => t.id === drag.id);
    if (i >= 0) {
      next.looseTiles[i] = {
        ...next.looseTiles[i],
        x: clamp(px - drag.grabDx, 0, PLAY_W - TILE_W),
        y: clamp(py - drag.grabDy, 0, PLAY_H - TILE_H),
      };
    }
  } else if (drag.kind === "coin") {
    const i = next.looseCoins.findIndex((c) => c.id === drag.id);
    if (i >= 0) {
      next.looseCoins[i] = {
        ...next.looseCoins[i],
        x: clamp(px - drag.grabDx, 0, PLAY_W - COIN_D),
        y: clamp(py - drag.grabDy, 0, PLAY_H - COIN_D),
      };
    }
  } else if (drag.kind === "tileStack") {
    const i = next.tileStacks.findIndex((s) => s.id === drag.id);
    if (i >= 0) {
      next.tileStacks[i] = {
        ...next.tileStacks[i],
        x: clamp(px - drag.grabDx, 0, PLAY_W - TILE_W),
        y: clamp(py - drag.grabDy, 0, PLAY_H - TILE_H),
      };
    }
  } else if (drag.kind === "coinStack") {
    const i = next.coinStacks.findIndex((s) => s.id === drag.id);
    if (i >= 0) {
      next.coinStacks[i] = {
        ...next.coinStacks[i],
        x: clamp(px - drag.grabDx, 0, PLAY_W - COIN_D),
        y: clamp(py - drag.grabDy, 0, PLAY_H - COIN_D),
      };
    }
  } else if (drag.kind === "die") {
    const i = next.dice.findIndex((d) => d.id === drag.id);
    if (i >= 0) {
      next.dice[i] = {
        ...next.dice[i],
        x: clamp(px - drag.grabDx, 0, PLAY_W - DIE_SZ),
        y: clamp(py - drag.grabDy, 0, PLAY_H - DIE_SZ),
      };
    }
  }

  return next;
}
