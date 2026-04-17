"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { img } from "@/lib/imgPath";

type Direction = "front" | "back" | "left" | "right";

const GREEN  = "#22c55e";
const BRIGHT = "#4ade80";

const MIA_POS       = { x: 380 / 1440, y: 330 / 810 };
const MACHINE_POS   = { x: 840 / 1440, y: 300 / 810, width: 340 / 1440 };
const NPC_SIZE_PCT  = 300 / 810;
const CHAR_SIZE_PCT = 210 / 810;
const WALK_BOUNDS   = { minX: 0, minY: 320 / 810, maxY: 510 / 810 };
const SPEED         = 4;
const INTERACT_DIST = 280 / 810;

const MIA_DIALOG: string[] = [
  "歡迎來到智能動物園。",
  "這裡有一台新的食物分類機器人。我們本來想請它幫忙分析食物，這樣就可以更快把食物送給不同動物。",
  "可是現在它還認不得蘋果和香蕉，常常把食物析成同一種。",
  "請你幫我訓練它",
];

const MIA_DIALOG_AFTER: string[] = [
  "做得很好。",
  "你先教它認得蘋果，後來又教它認得香蕉。",
  "記住喔，機器不是自己懂。你怎麼教，它就怎麼學。",
];

export default function CharacterGame4() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cwRef = useRef(1440);
  const chRef = useRef(810);
  const [cw, setCw] = useState(1440);
  const [ch, setCh] = useState(810);

  const [pos, setPos]     = useState({ x: 150 / 1440, y: 410 / 810 });
  const [dir, setDir]     = useState<Direction>("front");
  const [moving, setMoving] = useState(false);
  const posRef  = useRef({ x: 150 / 1440, y: 410 / 810 });
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef  = useRef<number>(0);

  const [ch4Complete,    setCh4Complete]    = useState(false);
  const [miaDialogDone,  setMiaDialogDone]  = useState(false);
  const [miaAfterDone,   setMiaAfterDone]   = useState(false);
  const ch4CompleteRef   = useRef(false);
  const miaDialogDoneRef = useRef(false);
  const miaAfterDoneRef  = useRef(false);

  const [activeDialog,  setActiveDialog]  = useState(false);
  const [dialogIndex,   setDialogIndex]   = useState(0);
  const activeDialogRef = useRef(false);
  const dialogIndexRef  = useRef(0);

  const [missionReady, setMissionReady] = useState(false);
  const [finalOverlay, setFinalOverlay] = useState(false);
  const [nearMia,      setNearMia]      = useState(false);
  const [nearMachine,  setNearMachine]  = useState(false);
  const nearMiaRef     = useRef(false);
  const nearMachineRef = useRef(false);

  const getSprite = (d: Direction) => img(`/img/${d}_sprite.png`);

  const currentLines = ch4CompleteRef.current && !miaAfterDoneRef.current
    ? MIA_DIALOG_AFTER : MIA_DIALOG;

  useEffect(() => {
    if (localStorage.getItem("chapter4_complete") === "1") {
      ch4CompleteRef.current = true; setCh4Complete(true);
      posRef.current = { x: 680 / 1440, y: 410 / 810 };
      setPos({ x: 680 / 1440, y: 410 / 810 });
    }
    if (localStorage.getItem("ch4_mia_dialog") === "1") {
      miaDialogDoneRef.current = true; setMiaDialogDone(true);
    }
    if (localStorage.getItem("ch4_mia_after") === "1") {
      miaAfterDoneRef.current = true; setMiaAfterDone(true);
      setFinalOverlay(true);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const update = () => { cwRef.current = el.clientWidth; chRef.current = el.clientHeight; setCw(el.clientWidth); setCh(el.clientHeight); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { ready, readyRef } = useDialogReady(dialogIndex, activeDialog);

  const advanceDialog = useCallback(() => {
    if (!readyRef.current) return;
    if (!activeDialogRef.current) return;
    const lines = ch4CompleteRef.current && !miaAfterDoneRef.current ? MIA_DIALOG_AFTER : MIA_DIALOG;
    const next = dialogIndexRef.current + 1;
    if (next < lines.length) {
      dialogIndexRef.current = next; setDialogIndex(next);
    } else {
      activeDialogRef.current = false; dialogIndexRef.current = 0;
      setActiveDialog(false); setDialogIndex(0);
      if (!ch4CompleteRef.current) {
        miaDialogDoneRef.current = true; setMiaDialogDone(true);
        localStorage.setItem("ch4_mia_dialog", "1");
      } else if (!miaAfterDoneRef.current) {
        miaAfterDoneRef.current = true; setMiaAfterDone(true);
        localStorage.setItem("ch4_mia_after", "1");
        setFinalOverlay(true);
      }
    }
  }, []);

  const openMiaDialog = useCallback(() => {
    const canTalk = !miaDialogDoneRef.current ||
      (ch4CompleteRef.current && !miaAfterDoneRef.current);
    if (!canTalk || activeDialogRef.current) return;
    activeDialogRef.current = true; dialogIndexRef.current = 0;
    setActiveDialog(true); setDialogIndex(0);
  }, []);

  const gameLoop = useCallback(() => {
    const keys = keysRef.current;
    let dx = 0, dy = 0;
    if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) dx -= SPEED;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += SPEED;
    if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) dy -= SPEED;
    if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) dy += SPEED;

    const isMoving = dx !== 0 || dy !== 0;
    setMoving(isMoving);
    if (isMoving) {
      if      (dy < 0) setDir("back");
      else if (dy > 0) setDir("front");
      else if (dx < 0) setDir("left");
      else             setDir("right");
      const _cw = cwRef.current, _ch = chRef.current;
      const dxPct = dx / _cw, dyPct = dy / _ch;
      posRef.current = {
        x: Math.max(WALK_BOUNDS.minX, Math.min(1, posRef.current.x + dxPct)),
        y: Math.max(WALK_BOUNDS.minY, Math.min(WALK_BOUNDS.maxY, posRef.current.y + dyPct)),
      };
      setPos({ ...posRef.current });
    }

    const _cw = cwRef.current, _ch = chRef.current;
    const px = posRef.current.x * _cw, py = posRef.current.y * _ch;
    const dist = INTERACT_DIST * _ch;
    const nm  = Math.hypot(px - MIA_POS.x * _cw, py - MIA_POS.y * _ch) < dist;
    const nmm = Math.hypot(px - (MACHINE_POS.x + MACHINE_POS.width / 2) * _cw, py - MACHINE_POS.y * _ch) < dist;
    if (nm  !== nearMiaRef.current)     { nearMiaRef.current = nm;   setNearMia(nm); }
    if (nmm !== nearMachineRef.current) { nearMachineRef.current = nmm; setNearMachine(nmm); }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "e" || e.key === "E") {
        if (activeDialogRef.current) { advanceDialog(); return; }
        if (nearMachineRef.current && miaDialogDoneRef.current && !ch4CompleteRef.current) {
          setMissionReady(true); return;
        }
        if (nearMiaRef.current) { openMiaDialog(); return; }
        return;
      }
      if (!e.altKey && !e.ctrlKey && !e.metaKey) keysRef.current.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (e.key === "Alt")        ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].forEach(k => keysRef.current.delete(k));
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop, advanceDialog, openMiaDialog]);

  const startMove = (key: string) => keysRef.current.add(key);
  const stopMove  = (key: string) => keysRef.current.delete(key);

  const questGuide = miaAfterDone
    ? "任務完成！"
    : ch4Complete
                    ? "回來找米亞互動"
    : miaDialogDone
                    ? "走到食物分類機開始訓練"
    :                 "找米亞說話";

  const dialogLines = ch4Complete && !miaAfterDone ? MIA_DIALOG_AFTER : MIA_DIALOG;

  return (
    <div className="flex flex-col h-svh" style={{ background: "#041208", color: "#dcfce7" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← 返回地圖</a>
        <span className="text-gray-600">|</span>
        <span className="text-white font-bold">🦁 智能動物園</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ color: GREEN }}>▶</span>
          <span className="text-gray-300">{questGuide}</span>
        </div>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden"
        style={{ backgroundImage: "url('/img/BK4.png')", backgroundSize: "cover", backgroundPosition: "center" }}>

        {/* Food classification machine */}
        <div className="absolute"
          style={{ left: MACHINE_POS.x * cw, top: MACHINE_POS.y * ch, width: MACHINE_POS.width * cw, zIndex: 4,
                   cursor: miaDialogDone && !ch4Complete ? "pointer" : "default" }}
          onClick={() => { if (nearMachineRef.current && miaDialogDoneRef.current && !ch4CompleteRef.current) setMissionReady(true); }}>
          <img src={img("/img/Classification robot.png")} alt="食物分類機" draggable={false}
            style={{ width: "100%", height: "auto", imageRendering: "pixelated",
                     filter: nearMachine ? "brightness(1.2)" : "brightness(1)", transition: "filter 0.3s" }} />
          {miaDialogDone && !ch4Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: GREEN, textShadow: `0 0 12px ${GREEN}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearMachine && miaDialogDone && !ch4Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(4,18,8,0.95)", border: `2px solid ${GREEN}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 開始訓練
            </div>
          )}
        </div>

        {/* Mia NPC */}
        <div className="absolute"
          style={{ left: MIA_POS.x * cw, top: MIA_POS.y * ch, width: NPC_SIZE_PCT * ch, zIndex: 5, cursor: "pointer" }}
          onClick={() => { if (activeDialogRef.current) { advanceDialog(); return; } openMiaDialog(); }}>
          <img src={img("/img/Mia.png")} alt="米亞" draggable={false}
            style={{ width: NPC_SIZE_PCT * ch, height: "auto", imageRendering: "pixelated",
                     filter: nearMia ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {(!miaDialogDone || (ch4Complete && !miaAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: GREEN, textShadow: `0 0 12px ${GREEN}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearMia && !activeDialog && (!miaDialogDone || (ch4Complete && !miaAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(4,18,8,0.95)", border: `2px solid ${GREEN}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 互動
            </div>
          )}
        </div>

        {/* Player */}
        <img src={getSprite(dir)} alt="character" draggable={false}
          style={{ position: "absolute", left: pos.x * cw, top: pos.y * ch,
                   width: "auto", height: CHAR_SIZE_PCT * ch, imageRendering: "pixelated", zIndex: 10,
                   filter: moving ? "brightness(1.1)" : "brightness(1)", transition: "filter 0.1s" }} />

        {/* Mission ready overlay */}
        {missionReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4"
            style={{ background: "rgba(0,0,0,0.55)", zIndex: 30 }}>
            <div className="w-full max-w-sm p-5 flex flex-col gap-3"
              style={{ background: "rgba(4,18,8,0.98)", border: `3px solid ${GREEN}`, boxShadow: `4px 4px 0px ${GREEN}44` }}>
              <button onClick={() => { window.location.href = "/level/chapter-4/game"; }}
                className="w-full py-3 font-bold text-sm"
                style={{ background: `${GREEN}22`, border: `3px solid ${GREEN}`, color: BRIGHT, boxShadow: "4px 4px 0px #000" }}>
                開始訓練 →
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
          <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advanceDialog}>
            <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
              <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                            pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={img("/img/Miahalf.png")} alt="米亞"
                  style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                           imageRendering: "pixelated", display: "block" }} />
                <div className="w-full text-center px-4 py-1 text-xs font-bold"
                  style={{ background: "#052e16", border: `2px solid ${GREEN}`, color: "#86efac" }}>
                  🦁 動物管理員米亞
                </div>
              </div>
              <div className="w-full px-8 py-6 relative dialog-panel"
                style={{ background: "rgba(4,18,8,0.97)", borderTop: `3px solid ${GREEN}`,
                         boxShadow: "0 -4px 0px #052e16", minHeight: 150 }}>
                <p className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line">
                  {currentLines[dialogIndex]}
                </p>
                <div className="absolute bottom-3 left-8 flex gap-1">
                  {currentLines.map((_, i) => (
                    <span key={i} className="w-2 h-2"
                      style={{ background: i === dialogIndex ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
                  ))}
                </div>
                <span className="text-xs absolute bottom-3 right-4"
                  style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                  {dialogIndex < currentLines.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 關閉"}
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
        style={{ background: "rgba(4,18,8,0.9)" }}>
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
              style={{ gridColumn: col, gridRow: row, background: `${GREEN}18`, border: `1px solid ${GREEN}55`, color: BRIGHT, borderRadius: 4 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
