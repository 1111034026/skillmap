"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { img } from "@/lib/imgPath";

type Direction = "front" | "back" | "left" | "right";

// White screen area within the 800px-wide stage image
const SCREEN_LEFT = 175;
const SCREEN_TOP  = 100;
const SCREEN_W    = 445;
const SCREEN_H    = 248;

interface SavedItem {
  id: string; x: number; y: number; size: number; rotate: number;
  el: { id: string; img: string | null; emoji: string; name: string };
}
interface ArtworkData {
  items: SavedItem[]; stageW: number; stageH: number; backgroundId: string;
}

const SPEED = 4;
const CHAR_SIZE_PCT = 210 / 810;
const NPC_SIZE_PCT  = 330 / 810;
const INTERACT_DIST_PCT = 240 / 810;
const WALK_BOUNDS = { minX: 0, minY: 300 / 810, maxY: 580 / 810 };
const DM_POS = { x: 250 / 1440, y: 300 / 810, width: 260 / 1440 }; // design machine

const GREEN  = "#16a34a";
const BRIGHT = "#4ade80";

const LUMI = {
  x: 650 / 1440, y: 400 / 810,
  dialog: [
    "歡迎來到靈感森林。",
    "森林慶典快開始了，可是舞台還沒有設計好。",
    "我請 AI 設計機幫忙想點子，結果它一下子給了好多東西。",
    "有些點子很棒，有些點子卻不太適合。",
    "請幫我整理這些點子，把舞台設計完成。",
  ],
  dialogAfter: [
    "你完成了屬於自己的舞台佈景！",
    "AI 給了你很多點子，但是最後的作品是你自己選出來的。",
    "記住：AI 可以幫你想，但創作的決定在你手上。",
  ],
};

export default function CharacterGame2() {
  // Container dimensions (percentage-based positioning)
  const cwRef = useRef(1440);
  const chRef = useRef(810);
  const [cw, setCw] = useState(1440);
  const [ch, setCh] = useState(810);

  const [pos,    setPos]    = useState({ x: 160 / 1440, y: 530 / 810 });
  const [dir,    setDir]    = useState<Direction>("front");
  const [moving, setMoving] = useState(false);
  const posRef = useRef({ x: 160 / 1440, y: 530 / 810 });

  const [lumiDialogDone, setLumiDialogDone] = useState(false);
  const [ch2Complete,    setCh2Complete]    = useState(false);
  const [lumiAfterDone,  setLumiAfterDone]  = useState(false);
  const lumiDialogDoneRef = useRef(false);
  const ch2CompleteRef    = useRef(false);
  const lumiAfterDoneRef  = useRef(false);

  const [activeDialog,  setActiveDialog]  = useState(false);
  const [dialogIndex,   setDialogIndex]   = useState(0);
  const activeDialogRef = useRef(false);
  const dialogIndexRef  = useRef(0);

  const [artworkData,  setArtworkData]  = useState<ArtworkData | null>(null);
  const [missionReady, setMissionReady] = useState(false);
  const [nearLumi,     setNearLumi]     = useState(false);
  const [nearDM,       setNearDM]       = useState(false);
  const [finalOverlay, setFinalOverlay] = useState(false);
  const nearLumiRef = useRef(false);
  const nearDMRef   = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef      = useRef<Set<string>>(new Set());
  const rafRef       = useRef<number>(0);

  const getSprite = (d: Direction) => `/img/${d}_sprite.png`;

  const currentLines = ch2CompleteRef.current && !lumiAfterDoneRef.current
    ? LUMI.dialogAfter
    : LUMI.dialog;

  const { ready, readyRef } = useDialogReady(dialogIndex, activeDialog);

  const advanceDialog = useCallback(() => {
    if (!readyRef.current) return;
    if (!activeDialogRef.current) return;
    const lines = ch2CompleteRef.current && !lumiAfterDoneRef.current
      ? LUMI.dialogAfter : LUMI.dialog;
    const next = dialogIndexRef.current + 1;
    if (next < lines.length) {
      dialogIndexRef.current = next;
      setDialogIndex(next);
    } else {
      activeDialogRef.current = false;
      dialogIndexRef.current = 0;
      setActiveDialog(false);
      setDialogIndex(0);
      if (ch2CompleteRef.current && !lumiAfterDoneRef.current) {
        lumiAfterDoneRef.current = true;
        setLumiAfterDone(true);
        localStorage.setItem("lumi_after_done", "1");
        setFinalOverlay(true);
      } else if (!lumiDialogDoneRef.current) {
        lumiDialogDoneRef.current = true;
        setLumiDialogDone(true);
        localStorage.setItem("lumi_dialog_done", "1");
      }
    }
  }, []);

  const openLumiDialog = useCallback(() => {
    const canTalk = !lumiDialogDoneRef.current ||
      (ch2CompleteRef.current && !lumiAfterDoneRef.current);
    if (!canTalk || activeDialogRef.current) return;
    activeDialogRef.current = true;
    dialogIndexRef.current = 0;
    setActiveDialog(true);
    setDialogIndex(0);
  }, []);

  const gameLoop = useCallback(() => {
    const keys = keysRef.current;
    let dx = 0, dy = 0;
    if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) dy -= SPEED;
    if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) dy += SPEED;
    if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) dx -= SPEED;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += SPEED;

    const isMoving = dx !== 0 || dy !== 0;
    setMoving(isMoving);
    if (isMoving) {
      if      (dy < 0) setDir("back");
      else if (dy > 0) setDir("front");
      else if (dx < 0) setDir("left");
      else             setDir("right");
      const _cw = cwRef.current;
      const _ch = chRef.current;
      const dxPct = dx / _cw;
      const dyPct = dy / _ch;
      const charPx = CHAR_SIZE_PCT * _ch;
      posRef.current = {
        x: Math.max(WALK_BOUNDS.minX, Math.min(1 - charPx / _cw, posRef.current.x + dxPct)),
        y: Math.max(WALK_BOUNDS.minY, Math.min(WALK_BOUNDS.maxY, posRef.current.y + dyPct)),
      };
      setPos({ ...posRef.current });
    }

    const cw = cwRef.current;
    const ch = chRef.current;
    const charPx = CHAR_SIZE_PCT * ch;
    const cx = posRef.current.x * cw + charPx / 2;
    const cy = posRef.current.y * ch + charPx / 2;
    const dist = (xPct: number, yPct: number) => Math.hypot(cx - xPct * cw, cy - yPct * ch);
    const lumiNear = dist(LUMI.x + NPC_SIZE_PCT / 2, LUMI.y + NPC_SIZE_PCT / 2) < INTERACT_DIST_PCT * ch;
    nearLumiRef.current = lumiNear; setNearLumi(lumiNear);
    const dmNear = dist(DM_POS.x + DM_POS.width / 2, DM_POS.y + 150 / 810) < INTERACT_DIST_PCT * ch;
    nearDMRef.current = dmNear; setNearDM(dmNear);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("lumi_dialog_done") === "1") {
      lumiDialogDoneRef.current = true; setLumiDialogDone(true);
    }
    if (localStorage.getItem("chapter2_complete") === "1") {
      ch2CompleteRef.current = true; setCh2Complete(true);
      posRef.current = { x: 480 / 1440, y: 380 / 810 }; setPos({ x: 480 / 1440, y: 380 / 810 });
    }
    if (localStorage.getItem("lumi_after_done") === "1") {
      lumiAfterDoneRef.current = true; setLumiAfterDone(true);
      setFinalOverlay(true);
    }
    const raw = localStorage.getItem("chapter2_artwork");
    if (raw) { try { setArtworkData(JSON.parse(raw)); } catch {} }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      cwRef.current = el.clientWidth;
      chRef.current = el.clientHeight;
      setCw(el.clientWidth);
      setCh(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "e" || e.key === "E") {
        if (activeDialogRef.current) { advanceDialog(); return; }
        if (nearDMRef.current && lumiDialogDoneRef.current && !ch2CompleteRef.current) {
          setMissionReady(true); return;
        }
        if (nearLumiRef.current) { openLumiDialog(); return; }
        return;
      }
      if (!e.altKey && !e.ctrlKey && !e.metaKey) keysRef.current.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (e.key === "Alt")
        ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].forEach(k => keysRef.current.delete(k));
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop, advanceDialog, openLumiDialog]);

  const startMove = (key: string) => keysRef.current.add(key);
  const stopMove  = (key: string) => keysRef.current.delete(key);

  const questGuide = lumiAfterDone  ? "任務完成！"
    : ch2Complete                   ? "回去找露米說話"
    : lumiDialogDone                ? "前往 AI 設計機開始任務"
    :                                 "去找發明家露米說話";

  const dialogLines = ch2Complete && !lumiAfterDone ? LUMI.dialogAfter : LUMI.dialog;

  return (
    <div className="flex flex-col h-svh" style={{ background: "#0a1a0a" }}>
      <style>{`
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes popIn { 0% { transform:scale(0); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← 返回地圖</a>
        <span className="text-gray-600">|</span>
        <span className="text-white font-bold">🌿 靈感森林</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ color: "#4ade80" }}>▶</span>
          <span className="text-gray-300">{questGuide}</span>
        </div>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{
        backgroundImage: "url('/img/BK2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "default",
      }}>
        {/* Stage artwork — overlaid on stage.png screen area */}
        {artworkData && <StageArtwork data={artworkData} cw={cw} ch={ch} />}

        {/* Stage */}
        <img src={img("/img/stage.png")} alt="舞台" draggable={false}
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: (50 / 810) * ch, width: (500 / 1440) * cw, height: "auto",
                   imageRendering: "pixelated", zIndex: 4 }} />

        {/* Design Machine */}
        <div className="absolute" style={{ left: DM_POS.x * cw, top: DM_POS.y * ch, width: DM_POS.width * cw, zIndex: 4 }}
          onClick={() => { if (nearDMRef.current && lumiDialogDoneRef.current && !ch2CompleteRef.current) setMissionReady(true); }}>
          <img src={img("/img/design machine.png")} alt="AI設計機" draggable={false}
            style={{ width: DM_POS.width * cw, height: "auto", imageRendering: "pixelated", display: "block" }} />
          {lumiDialogDone && !ch2Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: GREEN, textShadow: `0 0 12px ${GREEN}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearDM && lumiDialogDone && !ch2Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(5,32,16,0.9)", border: `2px solid ${GREEN}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 開始任務
            </div>
          )}
        </div>

        {/* Lumi NPC */}
        <div className="absolute" style={{ left: LUMI.x * cw, top: LUMI.y * ch, width: NPC_SIZE_PCT * ch, zIndex: 5, cursor: "pointer" }}
          onClick={() => {
            if (activeDialogRef.current) { advanceDialog(); return; }
            openLumiDialog();
          }}>
          <img src={img("/img/Lumi..png")} alt="露米" draggable={false}
            style={{ width: NPC_SIZE_PCT * ch, height: "auto", imageRendering: "pixelated",
                     filter: nearLumi ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {(!lumiDialogDone || (ch2Complete && !lumiAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: GREEN, textShadow: `0 0 12px ${GREEN}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearLumi && !activeDialog && (!lumiDialogDone || (ch2Complete && !lumiAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(5,32,16,0.9)", border: `2px solid ${GREEN}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 互動
            </div>
          )}
        </div>

        {/* Player */}
        <img src={getSprite(dir)} alt="character" draggable={false}
          style={{ position: "absolute", left: pos.x * cw, top: pos.y * ch, width: "auto", height: CHAR_SIZE_PCT * ch,
                   imageRendering: "pixelated", zIndex: 10,
                   filter: moving ? "brightness(1.1)" : "brightness(1)", transition: "filter 0.1s" }} />

        {/* Mission ready overlay */}
        {missionReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4"
            style={{ background: "rgba(0,0,0,0.55)", zIndex: 30 }}>
            <div className="w-full max-w-sm p-5 flex flex-col gap-3"
              style={{ background: "rgba(5,32,16,0.98)", border: `3px solid ${GREEN}`, boxShadow: `4px 4px 0px ${GREEN}44` }}>
              <button onClick={() => { window.location.href = "/level/chapter-2/game"; }}
                className="w-full py-3 font-bold text-sm"
                style={{ background: `${GREEN}22`, border: `3px solid ${GREEN}`, color: BRIGHT, boxShadow: "4px 4px 0px #000" }}>
                開始任務 →
              </button>
              <button onClick={() => setMissionReady(false)}
                className="w-full py-2 text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.4)", color: "#9ca3af", boxShadow: "2px 2px 0px #000" }}>
                取消
              </button>
            </div>
          </div>
        )}

        {/* Final completion overlay */}
        {finalOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{ background: "rgba(0,0,0,0.7)", zIndex: 40 }}>
            <div className="flex flex-col items-center gap-5 w-full max-w-sm px-4 py-8"
              style={{ background: "rgba(5,32,16,0.98)", border: `3px solid ${GREEN}`, boxShadow: `6px 6px 0px ${GREEN}44` }}>
              <p className="text-sm font-bold tracking-widest" style={{ color: GREEN }}>[ 任務完成 ]</p>
              <button onClick={() => { window.location.href = "/"; }}
                className="w-full py-3 font-bold text-sm tracking-widest"
                style={{ background: `${GREEN}20`, border: `2px solid ${GREEN}`, color: BRIGHT }}>
                返回地圖
              </button>
            </div>
          </div>
        )}

        {/* Dialog box */}
        {activeDialog && (
          <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}
            onClick={advanceDialog}>
            <div className="relative max-w-6xl mx-auto">
              {/* Portrait */}
              <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                            pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={img("/img/Lumihalf.png")} alt="露米"
                  style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                           imageRendering: "pixelated", display: "block" }} />
                <div className="w-full text-center px-4 py-1 text-xs font-bold"
                  style={{ background: "#052010", border: `2px solid ${GREEN}`, color: BRIGHT }}>
                  🌿發明家露米
                </div>
              </div>
              {/* Text panel */}
              <div className="w-full px-8 py-6 relative dialog-panel"
                style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`,
                         boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
                <p className="text-white text-lg leading-relaxed dialog-text">
                  {dialogLines[dialogIndex]}
                </p>
                <div className="absolute bottom-3 left-8 flex gap-1">
                  {dialogLines.map((_, i) => (
                    <span key={i} className="w-2 h-2"
                      style={{ background: i === dialogIndex ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
                  ))}
                </div>
                <span className="text-xs absolute bottom-3 right-4"
                  style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                  {dialogIndex < dialogLines.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 關閉"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center py-2 text-xs text-gray-600"
        style={{ background: "rgba(5,5,20,0.9)" }}>
        WASD / 方向鍵移動　　靠近 NPC 按 E 互動
      </div>

      {/* Mobile D-pad */}
      <div className="flex-shrink-0 flex items-center justify-center py-4 sm:hidden"
        style={{ background: "rgba(5,20,5,0.9)" }}>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(3, 48px)" }}>
          {[
            { label: "↑", key: "ArrowUp",    col: 2, row: 1 },
            { label: "←", key: "ArrowLeft",  col: 1, row: 2 },
            { label: "↓", key: "ArrowDown",  col: 2, row: 3 },
            { label: "→", key: "ArrowRight", col: 3, row: 2 },
          ].map(({ label, key, col, row }) => (
            <button key={key}
              onPointerDown={() => startMove(key)} onPointerUp={() => stopMove(key)} onPointerLeave={() => stopMove(key)}
              className="flex items-center justify-center font-bold text-lg select-none"
              style={{ gridColumn: col, gridRow: row, background: "rgba(22,163,74,0.15)", border: `1px solid ${GREEN}55`, color: BRIGHT, borderRadius: 4 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// stage.png natural size: 626×368
// Screen area within stage at 800px rendering: left=175 top=100 w=445 h=248
// Convert to fractions so we can scale with actual rendered stage size
const STAGE_IMG_W = 626;
const STAGE_IMG_H = 368;
const REF_RENDER_W = 800;
const REF_RENDER_H = REF_RENDER_W * (STAGE_IMG_H / STAGE_IMG_W);
const SL_FRAC = SCREEN_LEFT / REF_RENDER_W;
const ST_FRAC = SCREEN_TOP  / REF_RENDER_H;
const SW_FRAC = SCREEN_W    / REF_RENDER_W;
const SH_FRAC = SCREEN_H    / REF_RENDER_H;

function StageArtwork({ data, cw, ch }: { data: ArtworkData; cw: number; ch: number }) {
  const stageW   = (500 / 1440) * cw;
  const stageH   = stageW * (STAGE_IMG_H / STAGE_IMG_W);
  const stageLeft = (cw - stageW) / 2;
  const stageTop  = (50 / 810) * ch;

  const screenLeft   = stageLeft + SL_FRAC * stageW;
  const screenTop    = stageTop  + ST_FRAC * stageH;
  const screenWidth  = SW_FRAC   * stageW;
  const screenHeight = SH_FRAC   * stageH;

  const scaleX = screenWidth  / data.stageW;
  const scaleY = screenHeight / data.stageH;
  const scale  = Math.min(scaleX, scaleY);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
      <div style={{ position: "absolute", left: screenLeft, top: screenTop,
                    width: screenWidth, height: screenHeight, overflow: "hidden" }}>
        {data.items.map(item => {
          const isBg = item.el.id === data.backgroundId;
          if (isBg) return (
            <div key={item.id} style={{ position: "absolute", inset: 0 }}>
              {item.el.img
                ? <img src={item.el.img} alt={item.el.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                                 justifyContent: "center", fontSize: 120, opacity: 0.4 }}>{item.el.emoji}</span>
              }
            </div>
          );
          const ss = item.size * scale;
          return (
            <div key={item.id} style={{ position: "absolute", left: item.x * scaleX, top: item.y * scaleY,
                                        zIndex: 5, transform: `rotate(${item.rotate}deg)`, transformOrigin: "center center" }}>
              {item.el.img
                ? <img src={item.el.img} alt={item.el.name}
                    style={{ width: ss, height: ss, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
                : <span style={{ fontSize: ss * 0.7, display: "block", lineHeight: 1 }}>{item.el.emoji}</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
