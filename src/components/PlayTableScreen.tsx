import { useCallback, useEffect, useRef, useState } from "react";
import { DIE_FACES } from "../domain/piecepack";
import {
  COIN_D,
  PLAY_H,
  PLAY_W,
  TILE_W,
  type DragKind,
  type DragState,
  type FaceCard,
  type TableModel,
  initialTable,
  mergeOnDrop,
  moveDraggedPiece,
  shuffleInPlace,
  uid,
} from "../domain/playTable";
import { CoinArt } from "./pieces/CoinArt";
import { DieFaceArt } from "./pieces/DieFaceArt";
import { TileArt } from "./pieces/TileArt";

type Props = {
  onOpenCatalog: () => void;
};

function TileFace({ fc }: { fc: FaceCard }) {
  return (
    <div className="play-tile-face" style={{ color: `var(--suit-${fc.suit})` }}>
      <TileArt suit={fc.suit} rank={fc.rank} variant={fc.faceUp ? "obverse" : "reverse"} />
    </div>
  );
}

function CoinFace({ fc }: { fc: FaceCard }) {
  return (
    <div className="play-coin-face">
      <CoinArt suit={fc.suit} rank={fc.rank} face={fc.faceUp ? "value" : "suit"} />
    </div>
  );
}

export function PlayTableScreen({ onOpenCatalog }: Props) {
  const [model, setModel] = useState<TableModel>(initialTable);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selected, setSelected] = useState<{ kind: DragKind; id: string } | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const clearDrag = useCallback(() => setDrag(null), []);

  const pointerCoords = useCallback((e: PointerEvent) => {
    const rect = tableRef.current?.getBoundingClientRect();
    return {
      px: e.clientX - (rect?.left ?? 0),
      py: e.clientY - (rect?.top ?? 0),
    };
  }, []);

  const startDrag = useCallback(
    (kind: DragKind, id: string, e: React.PointerEvent, originX: number, originY: number) => {
      e.stopPropagation();
      setSelected({ kind, id });
      const rect = tableRef.current?.getBoundingClientRect();
      setDrag({
        kind,
        id,
        grabDx: e.clientX - (rect?.left ?? 0) - originX,
        grabDy: e.clientY - (rect?.top ?? 0) - originY,
      });
    },
    [],
  );

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      if (!tableRef.current) return;
      const { px, py } = pointerCoords(e);
      setModel((m) => moveDraggedPiece(m, drag, px, py));
    };
    const onUp = (e: PointerEvent) => {
      const { px, py } = pointerCoords(e);
      setModel((m) => mergeOnDrop(m, drag, px, py));
      clearDrag();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, clearDrag, pointerCoords]);

  const resetLayout = () => setModel(initialTable());

  const flipSelected = () => {
    if (!selected) return;
    setModel((m) => {
      if (selected.kind === "tile") {
        return {
          ...m,
          looseTiles: m.looseTiles.map((t) =>
            t.id === selected.id ? { ...t, faceUp: !t.faceUp } : t,
          ),
        };
      }
      if (selected.kind === "coin") {
        return {
          ...m,
          looseCoins: m.looseCoins.map((c) =>
            c.id === selected.id ? { ...c, faceUp: !c.faceUp } : c,
          ),
        };
      }
      if (selected.kind === "tileStack") {
        return {
          ...m,
          tileStacks: m.tileStacks.map((s) => {
            if (s.id !== selected.id || s.tiles.length === 0) return s;
            const tiles = [...s.tiles];
            const top = tiles[tiles.length - 1];
            tiles[tiles.length - 1] = { ...top, faceUp: !top.faceUp };
            return { ...s, tiles };
          }),
        };
      }
      if (selected.kind === "coinStack") {
        return {
          ...m,
          coinStacks: m.coinStacks.map((s) => {
            if (s.id !== selected.id || s.coins.length === 0) return s;
            const coins = [...s.coins];
            const top = coins[coins.length - 1];
            coins[coins.length - 1] = { ...top, faceUp: !top.faceUp };
            return { ...s, coins };
          }),
        };
      }
      return m;
    });
  };

  const shuffleSelected = () => {
    if (!selected) return;
    if (selected.kind === "tileStack") {
      setModel((m) => ({
        ...m,
        tileStacks: m.tileStacks.map((s) => {
          if (s.id !== selected.id) return s;
          const tiles = [...s.tiles];
          shuffleInPlace(tiles);
          return { ...s, tiles };
        }),
      }));
    } else if (selected.kind === "coinStack") {
      setModel((m) => ({
        ...m,
        coinStacks: m.coinStacks.map((s) => {
          if (s.id !== selected.id) return s;
          const coins = [...s.coins];
          shuffleInPlace(coins);
          return { ...s, coins };
        }),
      }));
    }
  };

  const pickTop = () => {
    if (!selected) return;
    if (selected.kind === "tileStack") {
      setModel((m) => {
        const stack = m.tileStacks.find((s) => s.id === selected.id);
        if (!stack || stack.tiles.length === 0) return m;
        const tiles = [...stack.tiles];
        const top = tiles.pop()!;
        const restStacks = m.tileStacks.filter((s) => s.id !== selected.id);
        const looseTiles = [...m.looseTiles];
        if (tiles.length === 0) {
          looseTiles.push({ id: uid(), ...top, x: stack.x, y: stack.y });
          return { ...m, tileStacks: restStacks, looseTiles };
        }
        looseTiles.push({ id: uid(), ...top, x: stack.x + TILE_W + 8, y: stack.y });
        if (tiles.length === 1) {
          const last = tiles[0];
          looseTiles.push({ id: uid(), ...last, x: stack.x, y: stack.y });
          return { ...m, tileStacks: restStacks, looseTiles };
        }
        restStacks.push({ ...stack, tiles });
        return { ...m, tileStacks: restStacks, looseTiles };
      });
      setSelected(null);
    } else if (selected.kind === "coinStack") {
      setModel((m) => {
        const stack = m.coinStacks.find((s) => s.id === selected.id);
        if (!stack || stack.coins.length === 0) return m;
        const coins = [...stack.coins];
        const top = coins.pop()!;
        const restStacks = m.coinStacks.filter((s) => s.id !== selected.id);
        const looseCoins = [...m.looseCoins];
        if (coins.length === 0) {
          looseCoins.push({ id: uid(), ...top, x: stack.x, y: stack.y });
          return { ...m, coinStacks: restStacks, looseCoins };
        }
        looseCoins.push({ id: uid(), ...top, x: stack.x + COIN_D + 8, y: stack.y });
        if (coins.length === 1) {
          const last = coins[0];
          looseCoins.push({ id: uid(), ...last, x: stack.x, y: stack.y });
          return { ...m, coinStacks: restStacks, looseCoins };
        }
        restStacks.push({ ...stack, coins });
        return { ...m, coinStacks: restStacks, looseCoins };
      });
      setSelected(null);
    }
  };

  const rollSelectedDie = () => {
    if (!selected || selected.kind !== "die") return;
    setModel((m) => ({
      ...m,
      dice: m.dice.map((d) =>
        d.id === selected.id
          ? { ...d, faceIndex: Math.floor(Math.random() * DIE_FACES.length) }
          : d,
      ),
    }));
  };

  const dragging = drag !== null;
  const pieceClass = (selected: boolean) =>
    `play-piece-inner${selected ? " selected" : ""}${dragging ? " dragging" : ""}`;

  return (
    <div className="play-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Play table</h1>
          <p className="app-subtitle">
            Drag tiles, coins, and dice. Stack matching pieces, flip faces, shuffle stacks, and roll dice.
          </p>
        </div>
        <div className="play-header-actions">
          <button type="button" className="btn" onClick={onOpenCatalog}>
            Catalog
          </button>
        </div>
      </header>

      <div className="play-main">
        <div className="play-toolbar" role="toolbar" aria-label="Table actions">
          <button type="button" className="btn" onClick={resetLayout}>
            Reset layout
          </button>
          {selected && (
            <>
              <button type="button" className="btn ghost" onClick={flipSelected}>
                Flip
              </button>
              {(selected.kind === "tileStack" || selected.kind === "coinStack") && (
                <>
                  <button type="button" className="btn ghost" onClick={shuffleSelected}>
                    Shuffle stack
                  </button>
                  <button type="button" className="btn ghost" onClick={pickTop}>
                    Pick top
                  </button>
                </>
              )}
              {selected.kind === "die" && (
                <button type="button" className="btn primary" onClick={rollSelectedDie}>
                  Roll die
                </button>
              )}
            </>
          )}
        </div>

        <p className="play-hint">
          Double-click a tile or coin to flip. Select a stack to shuffle or take the top piece. Drop a piece on
          another of the same kind to stack.
        </p>

        <div className="play-surface-wrap">
          <div
            ref={tableRef}
            className="play-surface"
            style={{ width: PLAY_W, height: PLAY_H }}
            onPointerDown={() => {
              if (!drag) setSelected(null);
            }}
          >
            {model.looseTiles.map((t) => {
              const sel = selected?.kind === "tile" && selected.id === t.id;
              return (
                <div
                  key={t.id}
                  className="play-locator"
                  style={{ left: t.x, top: t.y, zIndex: drag?.id === t.id ? 50 : 1 }}
                  onPointerDown={(e) => startDrag("tile", t.id, e, t.x, t.y)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setModel((m) => ({
                      ...m,
                      looseTiles: m.looseTiles.map((x) =>
                        x.id === t.id ? { ...x, faceUp: !x.faceUp } : x,
                      ),
                    }));
                  }}
                >
                  <div className={`play-piece play-piece--tile ${pieceClass(sel)}`}>
                    <TileFace fc={t} />
                  </div>
                </div>
              );
            })}

            {model.looseCoins.map((c) => {
              const sel = selected?.kind === "coin" && selected.id === c.id;
              return (
                <div
                  key={c.id}
                  className="play-locator"
                  style={{ left: c.x, top: c.y, zIndex: drag?.id === c.id ? 50 : 2 }}
                  onPointerDown={(e) => startDrag("coin", c.id, e, c.x, c.y)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setModel((m) => ({
                      ...m,
                      looseCoins: m.looseCoins.map((x) =>
                        x.id === c.id ? { ...x, faceUp: !x.faceUp } : x,
                      ),
                    }));
                  }}
                >
                  <div className={`play-piece play-piece--coin ${pieceClass(sel)}`}>
                    <CoinFace fc={c} />
                  </div>
                </div>
              );
            })}

            {model.tileStacks.map((s) => {
              const sel = selected?.kind === "tileStack" && selected.id === s.id;
              return (
                <div
                  key={s.id}
                  className="play-locator play-stack"
                  style={{ left: s.x, top: s.y, zIndex: drag?.id === s.id ? 50 : 3 }}
                  onPointerDown={(e) => startDrag("tileStack", s.id, e, s.x, s.y)}
                >
                  {s.tiles.map((tile, idx) => {
                    const isTop = idx === s.tiles.length - 1;
                    return (
                      <div
                        key={`${s.id}-${idx}`}
                        className={`play-piece play-piece--tile ${pieceClass(sel && isTop)}`}
                        style={{
                          transform: `translate(${idx * 2}px, ${-idx * 3}px)`,
                          zIndex: idx,
                        }}
                        onDoubleClick={(e) => {
                          if (!isTop) return;
                          e.stopPropagation();
                          setModel((m) => ({
                            ...m,
                            tileStacks: m.tileStacks.map((ts) => {
                              if (ts.id !== s.id) return ts;
                              const tiles = [...ts.tiles];
                              const top = tiles[tiles.length - 1];
                              tiles[tiles.length - 1] = { ...top, faceUp: !top.faceUp };
                              return { ...ts, tiles };
                            }),
                          }));
                        }}
                      >
                        <TileFace fc={tile} />
                      </div>
                    );
                  })}
                  <span className="play-stack-count">{s.tiles.length} tiles</span>
                </div>
              );
            })}

            {model.coinStacks.map((s) => {
              const sel = selected?.kind === "coinStack" && selected.id === s.id;
              return (
                <div
                  key={s.id}
                  className="play-locator play-stack"
                  style={{ left: s.x, top: s.y, zIndex: drag?.id === s.id ? 50 : 4 }}
                  onPointerDown={(e) => startDrag("coinStack", s.id, e, s.x, s.y)}
                >
                  {s.coins.map((coin, idx) => {
                    const isTop = idx === s.coins.length - 1;
                    return (
                      <div
                        key={`${s.id}-${idx}`}
                        className={`play-piece play-piece--coin ${pieceClass(sel && isTop)}`}
                        style={{
                          transform: `translate(${idx * 2}px, ${-idx * 2}px)`,
                          zIndex: idx,
                        }}
                        onDoubleClick={(e) => {
                          if (!isTop) return;
                          e.stopPropagation();
                          setModel((m) => ({
                            ...m,
                            coinStacks: m.coinStacks.map((cs) => {
                              if (cs.id !== s.id) return cs;
                              const coins = [...cs.coins];
                              const top = coins[coins.length - 1];
                              coins[coins.length - 1] = { ...top, faceUp: !top.faceUp };
                              return { ...cs, coins };
                            }),
                          }));
                        }}
                      >
                        <CoinFace fc={coin} />
                      </div>
                    );
                  })}
                  <span className="play-stack-count">{s.coins.length} coins</span>
                </div>
              );
            })}

            {model.dice.map((d) => {
              const sel = selected?.kind === "die" && selected.id === d.id;
              const face = DIE_FACES[d.faceIndex] ?? "null";
              return (
                <div
                  key={d.id}
                  className="play-locator"
                  style={{ left: d.x, top: d.y, zIndex: drag?.id === d.id ? 50 : 5 }}
                  onPointerDown={(e) => startDrag("die", d.id, e, d.x, d.y)}
                >
                  <div className={`play-piece play-piece--die ${pieceClass(sel)}`}>
                    <DieFaceArt suit={d.suit} rank={face} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <a href="https://piecepack.org/piecepack_article.html" target="_blank" rel="noreferrer">
          Piece Pack specification
        </a>
        <span aria-hidden> · </span>
        <span>Play table · Tauri + React</span>
      </footer>
    </div>
  );
}
