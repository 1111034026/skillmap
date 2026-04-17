"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { img } from "@/lib/imgPath";

type Direction = "front" | "back" | "left" | "right";

const SPEED = 4;
const CHAR_SIZE_PCT = 210 / 810;
const NPC_SIZE_PCT  = 365 / 810;
const INTERACT_DIST_PCT = 320 / 810;
const WALK_BOUNDS = { minX: 0, minY: 350 / 810, maxY: 500/ 810 };

const ORANGE = "#f97316";
const BRIGHT  = "#fb923c";

// Task board (輸送帶) position
const BOARD_POS = { x: 800 / 1440, y: 500 / 810, width: 500 / 1440 };

// Tok NPC position
const TOK = {
  x: 300 / 1440, y: 400 / 810,
  dialog: [
    "你好，我是任務工坊的隊長托克。",
    "任務工坊今天很忙，好多事情都在等著處理。",
    "有些工作可以請 AI 機器人幫忙，有些工作還是要人來做。",
    "如果什麼都丟給 AI 機器人，有些地方就會出問題。",
    "等等輸送帶會送來任務卡，我需要你幫我一起分派工作。",
    "一起分派工作前先想想看，這件事比較需要 AI 機器人整理，還是比較需要人來關心和判斷。",
  ],
  dialogAfter: [
    "今天你幫了大忙。",
    "你不是只把工作分出去而已，你還學會了怎麼想：什麼事情適合請 AI 幫忙，什麼事情要留給人來做。",
    "有些事 AI 很拿手，像是整理、統計、檢查。但有些事，像是關心別人、做公平判斷、決定真正重要的內容，還是要靠人類來做。",
    "記住喔，會不會用 AI 很重要，但更重要的是知道什麼不能全交給 AI。",
  ],
};

export default function CharacterGame3() {
  const cwRef = useRef(1440);
  const chRef = useRef(810);
  const [cw, setCw] = useState(1440);
  const [ch, setCh] = useState(810);

  const [pos,    setPos]    = useState({ x: 180 / 1440, y: 420 / 810 });
  const [dir,    setDir]    = useState<Direction>("front");
  const [moving, setMoving] = useState(false);
  const posRef = useRef({ x: 180 / 1440, y: 420 / 810 });

  const [tokDialogDone,  setTokDialogDone]  = useState(false);
  const [ch3Complete,    setCh3Complete]    = useState(false);
  const [tokAfterDone,   setTokAfterDone]   = useState(false);
  const tokDialogDoneRef = useRef(false);
  const ch3CompleteRef   = useRef(false);
  const tokAfterDoneRef  = useRef(false);

  const [activeDialog,  setActiveDialog]  = useState(false);
  const [dialogIndex,   setDialogIndex]   = useState(0);
  const activeDialogRef = useRef(false);
  const dialogIndexRef  = useRef(0);

  const [missionReady, setMissionReady] = useState(false);
  const [nearTok,      setNearTok]      = useState(false);
  const [nearBoard,    setNearBoard]    = useState(false);
  const [finalOverlay, setFinalOverlay] = useState(false);
  const nearTokRef   = useRef(false);
  const nearBoardRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef      = useRef<Set<string>>(new Set());
  const rafRef       = useRef<number>(0);

  const getSprite = (d: Direction) => `/img/${d}_sprite.png`;

  const dialogLines = ch3CompleteRef.current && !tokAfterDoneRef.current
    ? TOK.dialogAfter : TOK.dialog;

  const { ready, readyRef } = useDialogReady(dialogIndex, activeDialog);

  const advanceDialog = useCallback(() => {
    if (!readyRef.current) return;
    if (!activeDialogRef.current) return;
    const lines = ch3CompleteRef.current && !tokAfterDoneRef.current
      ? TOK.dialogAfter : TOK.dialog;
    const next = dialogIndexRef.current + 1;
    if (next < lines.length) {
      dialogIndexRef.current = next;
      setDialogIndex(next);
    } else {
      activeDialogRef.current = false;
      dialogIndexRef.current = 0;
      setActiveDialog(false);
      setDialogIndex(0);
      if (ch3CompleteRef.current && !tokAfterDoneRef.current) {
        tokAfterDoneRef.current = true;
        setTokAfterDone(true);
        localStorage.setItem("tok_after_done", "1");
        setFinalOverlay(true);
      } else if (!tokDialogDoneRef.current) {
        tokDialogDoneRef.current = true;
        setTokDialogDone(true);
        localStorage.setItem("tok_dialog_done", "1");
      }
    }
  }, []);

  const openTokDialog = useCallback(() => {
    const canTalk = !tokDialogDoneRef.current ||
      (ch3CompleteRef.current && !tokAfterDoneRef.current);
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

    const tokNear = dist(TOK.x + NPC_SIZE_PCT / 2, TOK.y + NPC_SIZE_PCT / 2) < INTERACT_DIST_PCT * ch;
    nearTokRef.current = tokNear; setNearTok(tokNear);

    const boardNear = dist(BOARD_POS.x + BOARD_POS.width / 2, BOARD_POS.y + 120 / 810) < INTERACT_DIST_PCT * ch;
    nearBoardRef.current = boardNear; setNearBoard(boardNear);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("tok_dialog_done") === "1") {
      tokDialogDoneRef.current = true; setTokDialogDone(true);
    }
    if (localStorage.getItem("chapter3_complete") === "1") {
      ch3CompleteRef.current = true; setCh3Complete(true);
      posRef.current = { x: 750 / 1440, y: 420 / 810 }; setPos({ x: 750 / 1440, y: 420 / 810 });
    }
    if (localStorage.getItem("tok_after_done") === "1") {
      tokAfterDoneRef.current = true; setTokAfterDone(true);
      setFinalOverlay(true);
    }
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
        if (nearBoardRef.current && tokDialogDoneRef.current && !ch3CompleteRef.current) {
          setMissionReady(true); return;
        }
        if (nearTokRef.current) { openTokDialog(); return; }
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
  }, [gameLoop, advanceDialog, openTokDialog]);

  const startMove = (key: string) => keysRef.current.add(key);
  const stopMove  = (key: string) => keysRef.current.delete(key);

  const questGuide = tokAfterDone
    ? "任務完成！"
    : ch3Complete
                   ? "回去找托克說話"
    : tokDialogDone
                   ? "前往任務板開始任務"
    :                "去找工坊隊長托克說話";

  return (
    <div className="flex flex-col h-svh" style={{ background: "#0c0f1a" }}>
      <style>{`
        @keyframes gear  { from { transform:rotate(0deg); }    to { transform:rotate(360deg); } }
        @keyframes gearR { from { transform:rotate(0deg); }    to { transform:rotate(-360deg); } }
        @keyframes bob   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes convey { 0% { background-position: 0 0; } 100% { background-position: -40px 0; } }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← 返回地圖</a>
        <span className="text-gray-600">|</span>
        <span className="text-white font-bold">⚙ 任務工坊</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ color: ORANGE }}>▶</span>
          <span className="text-gray-300">{questGuide}</span>
        </div>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden"
        style={{ backgroundImage: "url('/img/BK3.png')", backgroundSize: "cover", backgroundPosition: "center", cursor: "default" }}>

        {/* Background gears (decorative) */}
        <div style={{ position: "absolute", top: 40, left: 40, fontSize: 180, opacity: 0.04,
                      animation: "gear 20s linear infinite", pointerEvents: "none" }}>⚙</div>
        <div style={{ position: "absolute", top: 80, left: 190, fontSize: 100, opacity: 0.03,
                      animation: "gearR 14s linear infinite", pointerEvents: "none" }}>⚙</div>
        <div style={{ position: "absolute", top: 30, right: 80, fontSize: 150, opacity: 0.04,
                      animation: "gearR 18s linear infinite", pointerEvents: "none" }}>⚙</div>
        <div style={{ position: "absolute", top: 100, right: 220, fontSize: 80, opacity: 0.03,
                      animation: "gear 11s linear infinite", pointerEvents: "none" }}>⚙</div>

        {/* Floor / ground */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
                      background: "linear-gradient(0deg, #1c1c2e 0%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 190, left: 0, right: 0, height: 2,
                      background: `${ORANGE}22`, pointerEvents: "none" }} />

        {/* Conveyor belt / Task board */}
        <div className="absolute"
          style={{ left: BOARD_POS.x * cw, top: BOARD_POS.y * ch, width: BOARD_POS.width * cw, zIndex: 4,
                   cursor: tokDialogDone && !ch3Complete ? "pointer" : "default" }}
          onClick={() => { if (nearBoardRef.current && tokDialogDoneRef.current && !ch3CompleteRef.current) setMissionReady(true); }}>
          <img src={img("/img/conveyor.png")} alt="輸送帶" draggable={false}
            style={{ width: "100%", height: "auto", imageRendering: "pixelated",
                     filter: nearBoard ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {tokDialogDone && !ch3Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: ORANGE, textShadow: `0 0 12px ${ORANGE}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearBoard && tokDialogDone && !ch3Complete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(15,12,5,0.95)", border: `2px solid ${ORANGE}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 開始任務
            </div>
          )}
        </div>

        {/* AIrobot near conveyor */}
        <img src={img("/img/AIrobot.png")} alt="AI機器人" draggable={false}
          style={{ position: "absolute", left: (BOARD_POS.x - 0.015) * cw, top: (BOARD_POS.y - 0.15) * ch,
                   width: "auto", height: CHAR_SIZE_PCT * ch, imageRendering: "pixelated", zIndex: 3, pointerEvents: "none" }} />

        {/* Worker near conveyor */}
        <img src={img("/img/Worker.png")} alt="機械工坊工人" draggable={false}
          style={{ position: "absolute", left: (BOARD_POS.x + BOARD_POS.width - 0.23) * cw, top: (BOARD_POS.y - 0.15) * ch,
                   width: "auto", height: CHAR_SIZE_PCT * ch, imageRendering: "pixelated", zIndex: 3, pointerEvents: "none" }} />

        {/* Tok NPC */}
        <div className="absolute"
          style={{ left: TOK.x * cw, top: TOK.y * ch, width: NPC_SIZE_PCT * ch, zIndex: 5, cursor: "pointer" }}
          onClick={() => {
            if (activeDialogRef.current) { advanceDialog(); return; }
            openTokDialog();
          }}>
          <img src={img("/img/Tucker.png")} alt="托克" draggable={false}
            style={{ width: NPC_SIZE_PCT * ch, height: "auto", imageRendering: "pixelated",
                     filter: nearTok ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {(!tokDialogDone || (ch3Complete && !tokAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: ORANGE, textShadow: `0 0 12px ${ORANGE}`, pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearTok && !activeDialog && (!tokDialogDone || (ch3Complete && !tokAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(15,12,5,0.95)", border: `2px solid ${ORANGE}`, whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
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
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 30 }}>
            <div className="w-full max-w-sm p-5 flex flex-col gap-3"
              style={{ background: "rgba(12,15,26,0.98)", border: `3px solid ${ORANGE}`, boxShadow: `4px 4px 0px ${ORANGE}44` }}>
              <button onClick={() => { window.location.href = "/level/chapter-3/game"; }}
                className="w-full py-3 font-bold text-sm tracking-widest"
                style={{ background: `${ORANGE}22`, border: `3px solid ${ORANGE}`, color: BRIGHT, boxShadow: "4px 4px 0px #000" }}>
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

        {/* Final overlay */}
        {finalOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{ background: "rgba(0,0,0,0.75)", zIndex: 40 }}>
            <div className="flex flex-col items-center gap-5 w-full max-w-sm px-4 py-8"
              style={{ background: "rgba(12,15,26,0.98)", border: `3px solid ${ORANGE}`, boxShadow: `6px 6px 0px ${ORANGE}44` }}>
              <p className="text-sm font-bold tracking-widest" style={{ color: ORANGE }}>[ 任務完成 ]</p>
              <button onClick={() => { window.location.href = "/"; }}
                className="w-full py-3 font-bold text-sm tracking-widest"
                style={{ background: `${ORANGE}20`, border: `2px solid ${ORANGE}`, color: BRIGHT }}>
                返回地圖
              </button>
            </div>
          </div>
        )}

        {/* Dialog box */}
        {activeDialog && (
          <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advanceDialog}>
            <div className="relative max-w-6xl mx-auto">
              {/* Portrait */}
              <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                            pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={img("/img/Tuckerhalf.png")} alt="托克"
                  style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                           imageRendering: "pixelated", display: "block" }} />
                <div className="w-full text-center px-4 py-1 text-xs font-bold"
                  style={{ background: "#0a0c14", border: `2px solid ${ORANGE}`, color: BRIGHT }}>
                  ⚙ 工坊隊長托克
                </div>
              </div>
              {/* Text panel */}
              <div className="w-full px-8 py-6 relative dialog-panel"
                style={{ background: "rgba(10,12,20,0.97)", borderTop: `3px solid ${ORANGE}`,
                         boxShadow: `0 -4px 0px #050708`, minHeight: 150 }}>
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
        style={{ background: "rgba(10,12,26,0.9)" }}>
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
              style={{ gridColumn: col, gridRow: row, background: `${ORANGE}18`, border: `1px solid ${ORANGE}44`, color: BRIGHT, borderRadius: 4 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
