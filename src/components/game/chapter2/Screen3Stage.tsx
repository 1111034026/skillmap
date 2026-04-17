"use client";

import { useState, useRef, useEffect } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { C2Element, C2Theme, StageItem, StageResult } from "@/data/chapter2";
import { img } from "@/lib/imgPath";

const GREEN = "#16a34a";
const BRIGHT = "#4ade80";

const INTRO_LINES = [
  "現在輪到你來做最後的決定了。",
  "剛剛是挑材料，現在是把它們組成作品。",
  "AI 設計機幫你想了點子，可是舞台最後長什麼樣，還是要靠你自己選位置、自己組起來。",
];

const COMPLETE_LUMI = [
  "完成了。",
  "這是 AI 設計機幫你想的點子，也是你自己做出的作品。",
];

interface PlacedEl {
  id: string;
  el: C2Element;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

interface Props {
  theme: C2Theme;
  background: C2Element;
  character: C2Element;
  prop: C2Element;
  onDone: (result: StageResult) => void;
}

export default function Screen3Stage({ theme, background, character, prop, onDone }: Props) {
  const [hand,    setHand]    = useState<C2Element[]>([background, character, prop]);
  const [placed,  setPlaced]  = useState<PlacedEl[]>([]);
  const [introIdx,    setIntroIdx]    = useState(0);
  const [introDone,   setIntroDone]   = useState(false);
  const [donePhase,   setDonePhase]   = useState<"hidden" | "lumi">("hidden");
  const [doneLumiIdx, setDoneLumiIdx] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);

  const allPlaced = hand.length === 0;
  const placedCount = placed.length;

  // Resize / rotate handle drag
  const resizingRef = useRef<{ id: string; startDist: number; startSize: number; cx: number; cy: number } | null>(null);
  const rotatingRef = useRef<{ id: string; cx: number; cy: number; startAngle: number; startRotate: number } | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (resizingRef.current) {
        const { id, startDist, startSize, cx, cy } = resizingRef.current;
        const currDist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const newSize = Math.max(40, Math.min(1000, startSize * (currDist / startDist)));
        setPlaced(prev => prev.map(p => p.id === id
          ? { ...p, size: newSize, x: cx - (stageRef.current?.getBoundingClientRect().left ?? 0) - newSize / 2,
                                   y: cy - (stageRef.current?.getBoundingClientRect().top  ?? 0) - newSize / 2 }
          : p));
      }
      if (rotatingRef.current) {
        const { id, cx, cy, startAngle, startRotate } = rotatingRef.current;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        const newRotate = ((startRotate + angle - startAngle) % 360 + 360) % 360;
        setPlaced(prev => prev.map(p => p.id === id ? { ...p, rotate: newRotate } : p));
      }
    };
    const onMouseUp = () => { resizingRef.current = null; rotatingRef.current = null; };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => { document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); };
  }, []);

  const onCornerMouseDown = (e: React.MouseEvent, item: PlacedEl) => {
    e.stopPropagation(); e.preventDefault();
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = rect.left + item.x + item.size / 2;
    const cy = rect.top  + item.y + item.size / 2;
    resizingRef.current = { id: item.id, startDist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1, startSize: item.size, cx, cy };
  };

  const onRotateHandleMouseDown = (e: React.MouseEvent, item: PlacedEl) => {
    e.stopPropagation(); e.preventDefault();
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = rect.left + item.x + item.size / 2;
    const cy = rect.top  + item.y + item.size / 2;
    rotatingRef.current = { id: item.id, cx, cy, startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI), startRotate: item.rotate };
  };

  // What's being dragged
  const draggingFrom = useRef<"hand" | "stage">("hand");
  const draggingEl   = useRef<C2Element | null>(null);
  const draggingId   = useRef<string | null>(null); // for stage→stage
  const dragOffset   = useRef({ x: 0, y: 0 });

  // ── Intro dialog ──────────────────────────────────────────────────────────
  const { ready: introReady }  = useDialogReady(introIdx, !introDone);
  const { ready: lumiReady }   = useDialogReady(doneLumiIdx, donePhase === "lumi");

  const advanceIntro = () => {
    if (!introReady) return;
    if (introIdx < INTRO_LINES.length - 1) setIntroIdx(introIdx + 1);
    else setIntroDone(true);
  };

  const advanceDoneLumi = () => {
    if (!lumiReady) return;
    if (doneLumiIdx < COMPLETE_LUMI.length - 1) setDoneLumiIdx(doneLumiIdx + 1);
    else onDone({
      items: placed,
      stageW: stageRef.current?.clientWidth ?? 600,
      stageH: stageRef.current?.clientHeight ?? 400,
    });
  };

  // E key advances active dialogs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (!introDone) { advanceIntro(); return; }
      if (donePhase === "lumi") { advanceDoneLumi(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Drag from hand ────────────────────────────────────────────────────────
  const onHandDragStart = (e: React.DragEvent, el: C2Element) => {
    draggingFrom.current = "hand";
    draggingEl.current = el;
    draggingId.current = null;
    dragOffset.current = { x: 0, y: 0 };
    e.dataTransfer.effectAllowed = "move";
  };

  // ── Drag from stage ───────────────────────────────────────────────────────
  const onStageDragStart = (e: React.DragEvent, item: PlacedEl) => {
    draggingFrom.current = "stage";
    draggingEl.current = item.el;
    draggingId.current = item.id;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
  };

  // ── Drop on stage ─────────────────────────────────────────────────────────
  const onStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const el   = draggingEl.current;
    const from = draggingFrom.current;
    const sid  = draggingId.current;
    const offset = { ...dragOffset.current };
    if (!el || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - offset.x);
    const y = Math.max(0, e.clientY - rect.top  - offset.y);

    if (from === "hand") {
      setHand((prev) => prev.filter((h) => h.id !== el.id));
      setPlaced((prev) => [...prev, { id: `${el.id}-${Date.now()}`, el, x, y, size: 220, rotate: 0 }]);
    } else if (from === "stage" && sid) {
      setPlaced((prev) => prev.map((p) => p.id === sid ? { ...p, x, y } : p));
    }
    draggingEl.current = null;
  };

  // ── Drop back to hand ─────────────────────────────────────────────────────
  const onHandDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const el  = draggingEl.current;
    const sid = draggingId.current;
    if (!el || draggingFrom.current !== "stage") return;
    setPlaced((prev) => prev.filter((p) => p.id !== sid));
    setHand((prev) => [...prev, el]);
    draggingEl.current = null;
  };

  return (
    <div className="flex flex-col h-svh relative" style={{ background: "#0a150a", color: "#d1fae5" }}>
      {/* Background text — during intro or before elements are placed */}
      {(!introDone || placed.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }}>
          <div style={{ textAlign: "center", fontWeight: 900, color: "rgba(22,163,74,0.07)",
                        letterSpacing: "0.1em", fontSize: "clamp(60px, 10vw, 120px)" }}>
            把點子變成你的作品！
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.4)" }}>
        <span className="text-sm tracking-widest font-bold" style={{ color: GREEN }}>▶ INSPIRATION FOREST // 拼舞台</span>
        <div className="flex items-center gap-3">
          {/* Light ball progress */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-full"
                style={{
                  width: 14, height: 14,
                  background: i < placedCount ? BRIGHT : "rgba(74,222,128,0.15)",
                  boxShadow: i < placedCount ? `0 0 8px ${BRIGHT}` : "none",
                  border: `2px solid ${i < placedCount ? BRIGHT : GREEN + "44"}`,
                  transition: "all 0.4s ease",
                  animation: i < placedCount ? "pulse 1.5s ease-in-out infinite" : "none",
                }} />
            ))}
            <span className="text-xs ml-1" style={{ color: BRIGHT }}>創意光球</span>
          </div>
          <span className="text-xs" style={{ color: "rgba(74,222,128,0.5)" }}>STEP 3 / 3</span>
        </div>
      </div>

      {introDone && <div className="flex-1 flex gap-6 px-6 py-6 overflow-hidden">

        {/* Left: hand — hidden when done dialog is showing */}
        <div className="flex flex-col gap-4 w-52 flex-shrink-0" style={{ display: donePhase !== "hidden" ? "none" : "flex" }}>
          <p className="text-sm font-bold tracking-widest" style={{ color: "#86efac" }}>你的元素</p>
          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-auto"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onHandDrop}>
            {hand.map((el) => (
              <div key={el.id}
                draggable
                onDragStart={(e) => onHandDragStart(e, el)}
                className="flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing select-none"
                style={{
                  background: `${theme.color}18`,
                  border: `2px solid ${theme.color}`,
                  boxShadow: `3px 3px 0px ${theme.color}44`,
                  animation: "fadeUp 0.3s ease",
                }}>
                {el.img
                  ? <img src={el.img} alt={el.name}
                      style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                  : <span style={{ fontSize: 28 }}>{el.emoji}</span>
                }
                <span className="text-sm font-semibold" style={{ color: "#d1fae5" }}>{el.name}</span>
              </div>
            ))}
            {hand.length === 0 && (
              <p className="text-xs text-center mt-4" style={{ color: "rgba(209,250,229,0.3)" }}>所有元素都放上舞台了！</p>
            )}
          </div>
        </div>

        {/* Right: stage */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Stage canvas */}
          <div ref={stageRef}
            className="flex-1 relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onStageDrop}
            style={{
              border: `3px solid ${allPlaced ? BRIGHT : GREEN}`,
              background: "rgba(22,163,74,0.04)",
              boxShadow: allPlaced
                ? `0 0 40px ${BRIGHT}44, 0 0 80px ${BRIGHT}22`
                : `0 0 30px ${GREEN}22`,
              transition: "box-shadow 0.6s ease, border-color 0.4s ease",
              minHeight: 300,
              cursor: "crosshair",
            }}>
            {donePhase !== "hidden" && (
              <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "all" }} />
            )}


            {placed.map((item) => {
              const isBg = item.el.id === background.id;
              if (isBg) return (
                <div key={item.id} className="absolute inset-0" style={{ zIndex: 1 }}>
                  {item.el.img
                    ? <img src={item.el.img} alt={item.el.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", display: "block" }} />
                    : <span style={{ fontSize: 200, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>{item.el.emoji}</span>
                  }
                  {/* Remove button */}
                  <button
                    onClick={() => { setPlaced((prev) => prev.filter((p) => p.id !== item.id)); setHand((prev) => [...prev, item.el]); }}
                    style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: `1px solid ${GREEN}`, color: BRIGHT, borderRadius: 2, padding: "2px 6px", fontSize: 11, cursor: "pointer", zIndex: 10 }}>
                    ✕ 移除
                  </button>
                </div>
              );
              return (
                <div key={item.id}
                  style={{ position: "absolute", left: item.x, top: item.y, userSelect: "none", zIndex: 5 }}>
                  {/* Rotation handle — hidden after done */}
                  {donePhase === "hidden" && <>
                    <div onMouseDown={(e) => onRotateHandleMouseDown(e, item)}
                      style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)",
                               width: 16, height: 16, background: "#FFB800", border: "2px solid #000",
                               borderRadius: "50%", cursor: "crosshair", zIndex: 10 }} />
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                                  width: 2, height: 12, background: "#FFB80088", pointerEvents: "none" }} />
                  </>}

                  {/* Image + corner handles (all rotate together) */}
                  <div style={{ transform: `rotate(${item.rotate}deg)`, transformOrigin: "center center",
                                position: "relative", display: "inline-block" }}>
                    <div draggable onDragStart={(e) => onStageDragStart(e, item)} style={{ cursor: "grab" }}>
                      {item.el.img
                        ? <img src={item.el.img} alt={item.el.name}
                            style={{ width: item.size, height: item.size, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
                        : <span style={{ fontSize: item.size * 0.7, display: "block", lineHeight: 1 }}>{item.el.emoji}</span>
                      }
                    </div>
                    {/* Corner resize handles — hidden after done */}
                    {donePhase === "hidden" && [
                      { top: -6, left: -6,  cursor: "nwse-resize" },
                      { top: -6, right: -6, cursor: "nesw-resize" },
                      { bottom: -6, left: -6,  cursor: "nesw-resize" },
                      { bottom: -6, right: -6, cursor: "nwse-resize" },
                    ].map((s, i) => (
                      <div key={i} onMouseDown={(e) => onCornerMouseDown(e, item)}
                        style={{ position: "absolute", ...s, width: 12, height: 12,
                                 background: BRIGHT, border: "2px solid #052010", borderRadius: 2 }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm button — hidden after done */}
          {donePhase === "hidden" && (
            <button
              onClick={() => { if (allPlaced) { setDonePhase("lumi"); setDoneLumiIdx(0); } }}
              disabled={!allPlaced}
              className="w-full py-4 font-bold text-base tracking-widest"
              style={{
                background: allPlaced ? `${GREEN}22` : "rgba(255,255,255,0.03)",
                border: `2px solid ${allPlaced ? GREEN : "rgba(22,163,74,0.2)"}`,
                boxShadow: allPlaced ? `4px 4px 0px ${GREEN}44` : "none",
                color: allPlaced ? BRIGHT : "rgba(74,222,128,0.2)",
                cursor: allPlaced ? "pointer" : "not-allowed",
              }}>
              {allPlaced ? "▶ 完成作品！" : "— 請把所有元素拖到舞台上 —"}
            </button>
          )}
        </div>
      </div>}

      {/* Lumi intro dialog */}
      {!introDone && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advanceIntro}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <LumiPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`,
                       boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
              <p className="text-white text-lg leading-relaxed dialog-text">{INTRO_LINES[introIdx]}</p>
              <div className="absolute bottom-3 left-8 flex gap-1">
                {INTRO_LINES.map((_, i) => (
                  <span key={i} className="w-2 h-2"
                    style={{ background: i === introIdx ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
                ))}
              </div>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: introReady ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {introIdx < INTRO_LINES.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 關閉"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Done: Lumi dialog */}
      {donePhase === "lumi" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}
          onClick={advanceDoneLumi}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <LumiPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`,
                       boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
              <p className="text-white text-lg leading-relaxed dialog-text">{COMPLETE_LUMI[doneLumiIdx]}</p>
              <div className="absolute bottom-3 left-8 flex gap-1">
                {COMPLETE_LUMI.map((_, i) => (
                  <span key={i} className="w-2 h-2"
                    style={{ background: i === doneLumiIdx ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
                ))}
              </div>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: lumiReady ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {doneLumiIdx < COMPLETE_LUMI.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 關閉"}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function LumiPortrait() {
  return (
    <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                  pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img src={img("/img/Lumihalf.png")} alt="露米"
        style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                 imageRendering: "pixelated", display: "block" }} />
      <div className="w-full text-center px-4 py-1 text-xs font-bold"
        style={{ background: "#052010", border: `2px solid ${GREEN}`, color: BRIGHT }}>
        🌿 發明家露米
      </div>
    </div>
  );
}

