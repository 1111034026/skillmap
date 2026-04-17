"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { img } from "@/lib/imgPath";

type Direction = "front" | "back" | "left" | "right";

const SPEED = 4;
const CHAR_SIZE_PCT = 210 / 810;
const NPC_SIZE_PCT  = 220 / 810;
const INTERACT_DIST_PCT = 240 / 810;

const WALK_BOUNDS = { minX: 0, minY: 300 / 810, maxY: 395 / 810 };

const BOARD = { x: 100 / 1440, y: 180 / 810, w: 360 / 1440, h: 315 / 810 };

// right-anchored CSS positions (fractions of container)
const MW_POS    = { right: 300 / 1440, top: 300 / 810, width: 250 / 1440 };
const CLS_POS   = { right: 30 / 1440,  top: 290 / 810, width: 200 / 1440 };

// Decorative scene assets (fractions of container)
const BOAT_POS    = { left: 250 / 1440, top: 0 / 810,  width: 500 / 1440 };
const SHOP_POS    = { left: 500 / 1440, top: 150 / 810, width: 500 / 1440 };
const FACTORY_POS = { right: 20 / 1440, top: 40 / 810,  width: 400 / 1440 };

const NPC = {
  x: 420 / 1440, y: 300 / 810,
  dialog: [
    "你來得正好！我是這座港口的船長，大家都叫我阿波。",
    "最近港口的「AI 地點推薦板」不知道出了什麼問題，一直給出奇奇怪怪的建議……",
    "上面貼的推薦地點有些根本不合理，害得大家都搞不清楚方向！！",
    "AI 的建議不是每條都能採用，要先看清楚需求，比較過後，再決定哪些可以接受、哪些要再想想、哪些能直接略過。",
    "可以幫我看看這些建議能不能用嗎？",
  ],
  dialogAfter: [
    "你做得很好。現在你已經會看 AI 給出的結果，哪些可以先接受，哪些還要再判斷，哪些要先拒絕。",
    "可是我還有一個問題。公告板為什麼會分出這些怪怪的結果呢？",
    "請你去找阿修。他或許能搞清楚狀況。",
  ],
};

const NPC_FINAL_DIALOG = [
  "你今天幫了回聲港很大的忙。",
  "你先學會看 AI 給出的結果，再去找出它為什麼會這樣分。",
  "現在你知道了，AI 很方便，但不是每次都對。要先看一看，再想一想。",
];

const MW_DIALOG_AFTER = [
  "機器修好了！原來公告板不是故意亂給結果，而是前面的地點分類學得不夠完整。",
  "現在你已經學會了 AI 並不是真的「懂」這些地方，它只是從過去學到的資料裡，找出最像的線索來做決定。",
  "只要前面一學錯，後面的結果就容易錯誤。",
  "去和船長阿波報告這件事吧！",
];

const MW_DIALOG = [
  "我是維修員阿修。",
  "你剛剛看到的是 AI 推薦板給出的結果。",
  "其實在它後面，還有一台 AI 地點分類機。",
  "它會先看地點的樣子和資料，把地點分成不同類別，再決定要顯示什麼結果。",
  "如果前面分錯了，後面就很容易一起錯。",
  "你來幫我看看，它到底學了什麼。",
];

// ─────────────────────────────────────────────────────────────────────────────

export default function CharacterGame() {
  // Container dimensions (percentage-based positioning)
  const cwRef = useRef(1440);
  const chRef = useRef(810);
  const [cw, setCw] = useState(1440);
  const [ch, setCh] = useState(810);

  // Movement
  const [pos, setPos]     = useState({ x: 150 / 1440, y: 370 / 810 });
  const [dir, setDir]     = useState<Direction>("front");
  const [moving, setMoving] = useState(false);
  const posRef = useRef({ x: 150 / 1440, y: 370 / 810 });

  // Quest state (state = render, ref = sync E-key access)
  const [npcDialogDone,  setNpcDialogDone]  = useState(false);
  const [missionComplete,setMissionComplete] = useState(false);
  const [npcAfterDone,   setNpcAfterDone]   = useState(false);
  const [mwDialogDone,   setMwDialogDone]   = useState(false);
  const [clsTaskDone,    setClsTaskDone]    = useState(false);
  const [clsAfterDone,   setClsAfterDone]   = useState(false);
  const [finalDone,      setFinalDone]      = useState(false);
  const npcDialogDoneRef  = useRef(false);
  const missionCompleteRef = useRef(false);
  const npcAfterDoneRef   = useRef(false);
  const mwDialogDoneRef   = useRef(false);
  const clsTaskDoneRef    = useRef(false);
  const clsAfterDoneRef   = useRef(false);
  const finalDoneRef      = useRef(false);

  // Active dialog: null | "npc" | "mw" | "mw_after"
  const [activeDialog, setActiveDialog] = useState<"npc" | "mw" | "mw_after" | null>(null);
  const [dialogIndex,  setDialogIndex]  = useState(0);
  const activeDialogRef = useRef<"npc" | "mw" | "mw_after" | null>(null);
  const dialogIndexRef  = useRef(0);

  // Overlays
  const [missionReady,    setMissionReady]    = useState(false);
  const [classifierReady, setClassifierReady] = useState(false);

  // Proximity (state = render, ref = sync E-key access)
  const [nearNpc,        setNearNpc]        = useState(false);
  const [nearBoard,      setNearBoard]      = useState(false);
  const [nearMW,         setNearMW]         = useState(false);
  const [nearClassifier, setNearClassifier] = useState(false);
  const nearNpcRef        = useRef(false);
  const nearBoardRef      = useRef(false);
  const nearMWRef         = useRef(false);
  const nearClassifierRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef      = useRef<Set<string>>(new Set());
  const rafRef       = useRef<number>(0);

  const getSprite = (d: Direction) => img(`/img/${d}_sprite.png`);

  // ── Dialog ready lock (1.5s after each new line) ─────────────────────────
  const { ready, readyRef } = useDialogReady(
    `${activeDialog ?? ""}-${dialogIndex}`,
    activeDialog !== null,
  );

  // ── Dialog advance (stable: only refs + stable setters) ───────────────────

  const advanceDialog = useCallback(() => {
    if (!readyRef.current) return;
    const who = activeDialogRef.current;
    if (!who) return;
    const lines = who === "npc"
      ? (clsAfterDoneRef.current && !finalDoneRef.current ? NPC_FINAL_DIALOG
         : missionCompleteRef.current ? NPC.dialogAfter
         : NPC.dialog)
      : who === "mw_after" ? MW_DIALOG_AFTER
      : MW_DIALOG;
    const next = dialogIndexRef.current + 1;
    if (next < lines.length) {
      dialogIndexRef.current = next;
      setDialogIndex(next);
    } else {
      // close dialog
      activeDialogRef.current = null;
      dialogIndexRef.current = 0;
      setActiveDialog(null);
      setDialogIndex(0);
      if (who === "npc") {
        if (clsAfterDoneRef.current && !finalDoneRef.current) {
          finalDoneRef.current = true;
          setFinalDone(true);
          localStorage.setItem("final_done", "1");
        } else if (missionCompleteRef.current) {
          npcDialogDoneRef.current = true; setNpcDialogDone(true);
          npcAfterDoneRef.current = true;
          setNpcAfterDone(true);
          localStorage.setItem("npc_after_done", "1");
        } else {
          npcDialogDoneRef.current = true;
          setNpcDialogDone(true);
        }
      } else if (who === "mw_after") {
        clsAfterDoneRef.current = true;
        setClsAfterDone(true);
        localStorage.setItem("cls_after_done", "1");
      } else {
        mwDialogDoneRef.current = true;
        setMwDialogDone(true);
        localStorage.setItem("mw_dialog_done", "1");
      }
    }
  }, []);

  // ── Open dialog helpers ───────────────────────────────────────────────────

  const openNpcDialog = useCallback(() => {
    const canTalk = !npcDialogDoneRef.current ||
      (missionCompleteRef.current && !npcAfterDoneRef.current) ||
      (clsAfterDoneRef.current && !finalDoneRef.current);
    if (!canTalk || activeDialogRef.current !== null) return;
    activeDialogRef.current = "npc";
    dialogIndexRef.current = 0;
    setActiveDialog("npc");
    setDialogIndex(0);
  }, []);

  const openMwDialog = useCallback(() => {
    if (!npcAfterDoneRef.current || mwDialogDoneRef.current) return;
    if (activeDialogRef.current !== null) return;
    activeDialogRef.current = "mw";
    dialogIndexRef.current = 0;
    setActiveDialog("mw");
    setDialogIndex(0);
  }, []);

  const openMwAfterDialog = useCallback(() => {
    if (!clsTaskDoneRef.current || clsAfterDoneRef.current) return;
    if (activeDialogRef.current !== null) return;
    activeDialogRef.current = "mw_after";
    dialogIndexRef.current = 0;
    setActiveDialog("mw_after");
    setDialogIndex(0);
  }, []);

  // ── Game loop ─────────────────────────────────────────────────────────────

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

    // Proximity — every frame, using posRef (always current)
    const cw = cwRef.current;
    const ch = chRef.current;
    const charPx = CHAR_SIZE_PCT * ch;
    const cx = posRef.current.x * cw + charPx / 2;
    const cy = posRef.current.y * ch + charPx / 2;
    const dist = (xPct: number, yPct: number) => Math.hypot(cx - xPct * cw, cy - yPct * ch);

    const npcNear = dist(NPC.x + NPC_SIZE_PCT / 2, NPC.y + NPC_SIZE_PCT / 2) < INTERACT_DIST_PCT * ch;
    nearNpcRef.current = npcNear; setNearNpc(npcNear);

    const boardNear = dist(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h / 2) < INTERACT_DIST_PCT * ch;
    nearBoardRef.current = boardNear; setNearBoard(boardNear);

    {
      const mwLeftPct  = 1 - MW_POS.right  - MW_POS.width;
      const clsLeftPct = 1 - CLS_POS.right - CLS_POS.width;

      const mwNear = dist(mwLeftPct + MW_POS.width / 2, MW_POS.top + MW_POS.width / 2) < INTERACT_DIST_PCT * ch;
      nearMWRef.current = mwNear; setNearMW(mwNear);

      const clsNear = dist(clsLeftPct + CLS_POS.width / 2, CLS_POS.top + 100 / 810) < INTERACT_DIST_PCT * ch;
      nearClassifierRef.current = clsNear; setNearClassifier(clsNear);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // ── Init: load saved progress ─────────────────────────────────────────────

  useEffect(() => {
    if (localStorage.getItem("chapter1_complete") === "1") {
      npcDialogDoneRef.current = true;  setNpcDialogDone(true);
      missionCompleteRef.current = true; setMissionComplete(true);
    }
    if (localStorage.getItem("npc_after_done") === "1") {
      npcAfterDoneRef.current = true; setNpcAfterDone(true);
    }
    if (localStorage.getItem("mw_dialog_done") === "1") {
      mwDialogDoneRef.current = true; setMwDialogDone(true);
    }
    if (localStorage.getItem("classifier_complete") === "1") {
      clsTaskDoneRef.current = true; setClsTaskDone(true);
      const spawnX = (1 - CLS_POS.right - CLS_POS.width - CHAR_SIZE_PCT * (810 / 1440) + 60 / 1440);
      posRef.current = { x: spawnX, y: 150 / 810 };
      setPos({ x: spawnX, y: 380 / 810 });
    }
    if (localStorage.getItem("cls_after_done") === "1") {
      clsAfterDoneRef.current = true; setClsAfterDone(true);
    }
    if (localStorage.getItem("final_done") === "1") {
      finalDoneRef.current = true; setFinalDone(true);
    }
  }, []);

  // ── ResizeObserver: track container dimensions ────────────────────────────

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

  // ── Key listeners + RAF ───────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        e.preventDefault();

      if (e.key === "e" || e.key === "E") {
        // Advance open dialog first
        if (activeDialogRef.current !== null) { advanceDialog(); return; }
        // Otherwise open the nearest active interactable
        if (nearClassifierRef.current && mwDialogDoneRef.current && !clsTaskDoneRef.current) {
          setClassifierReady(true); return;
        }
        if (nearMWRef.current && clsTaskDoneRef.current && !clsAfterDoneRef.current) {
          openMwAfterDialog(); return;
        }
        if (nearMWRef.current && npcAfterDoneRef.current && !mwDialogDoneRef.current) {
          openMwDialog(); return;
        }
        if (nearBoardRef.current && npcDialogDoneRef.current && !missionCompleteRef.current) {
          setMissionReady(true); return;
        }
        if (nearNpcRef.current) { openNpcDialog(); return; }
        return;
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey) keysRef.current.add(e.key);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (e.key === "Alt")
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].forEach(k => keysRef.current.delete(k));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop, advanceDialog, openNpcDialog, openMwDialog, openMwAfterDialog]);

  const startMove = (key: string) => keysRef.current.add(key);
  const stopMove  = (key: string) => keysRef.current.delete(key);

  // ── Quest guide text ──────────────────────────────────────────────────────

  const questGuide = finalDone       ? "全部完成！"
    : clsAfterDone                  ? "回去找船長阿波"
    : clsTaskDone                   ? "回去找阿修說話"
    : mwDialogDone                  ? "前往 AI 貨物分類機"
    : npcAfterDone                  ? "去找維修工阿修"
    : missionComplete               ? "回去找船長阿波"
    : npcDialogDone                 ? "前往地點推薦板開始任務"
    :                                 "去找船長阿波說話";

  // ── Dialog box renderer ───────────────────────────────────────────────────

  const currentLines = activeDialog === "npc"
    ? (clsAfterDone && !finalDone ? NPC_FINAL_DIALOG
       : missionComplete ? NPC.dialogAfter
       : NPC.dialog)
    : activeDialog === "mw_after" ? MW_DIALOG_AFTER
    : MW_DIALOG;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-svh" style={{ background: "#0a0a1a" }}>
      <style>{`
        @keyframes bob1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
        @keyframes bob2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
        @keyframes bob3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← 返回地圖</a>
        <span className="text-gray-600">|</span>
        <span className="text-white font-bold">🏙️ 回聲港</span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ color: "#fbbf24" }}>▶</span>
          <span className="text-gray-300">{questGuide}</span>
        </div>
      </div>

      {/* Game area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden"
        style={{ backgroundImage: `url(${img("/img/BK1.png")})`, backgroundSize: "cover", backgroundPosition: "center", cursor: "default" }}>

        {/* Classifier */}
        <div className="absolute"
          style={{ right: CLS_POS.right * cw, top: CLS_POS.top * ch, width: CLS_POS.width * cw, zIndex: 4,
                   cursor: mwDialogDone && !clsTaskDone ? "pointer" : "default" }}
          onClick={() => { if (mwDialogDone && !clsTaskDone) setClassifierReady(true); }}>
          <img src={img("/img/Classifier.png")} alt="分類器" draggable={false}
            style={{ width: "100%", height: "auto", imageRendering: "pixelated",
                     filter: nearClassifier && mwDialogDone && !clsTaskDone ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {mwDialogDone && !clsTaskDone && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: "#1d4ed8", textShadow: "0 0 12px #1d4ed8, 0 0 24px #1e3a8a", pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearClassifier && mwDialogDone && !clsTaskDone && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(30,58,138,0.95)", border: "2px solid #3b82f6", whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 開始任務
            </div>
          )}
        </div>

        {/* Boat */}
        <img src={img("/img/boat.png")} alt="船" draggable={false}
          style={{ position: "absolute", left: BOAT_POS.left * cw, top: BOAT_POS.top * ch, width: BOAT_POS.width * cw, height: "auto", imageRendering: "pixelated", zIndex: 2, animation: "bob1 3.2s ease-in-out infinite" }} />

        {/* Shop */}
        <img src={img("/img/shop.png")} alt="商店" draggable={false}
          style={{ position: "absolute", left: SHOP_POS.left * cw, top: SHOP_POS.top * ch, width: SHOP_POS.width * cw, height: "auto", imageRendering: "pixelated", zIndex: 3 }} />

        {/* Factory */}
        <img src={img("/img/factory.png")} alt="工廠" draggable={false}
          style={{ position: "absolute", right: FACTORY_POS.right * cw, top: FACTORY_POS.top * ch, width: FACTORY_POS.width * cw, height: "auto", imageRendering: "pixelated", zIndex: 3 }} />

        {/* Maintenance Worker */}
        <div className="absolute"
          style={{ right: MW_POS.right * cw, top: mwDialogDone ? (MW_POS.top + 30 / 810) * ch : MW_POS.top * ch, width: MW_POS.width * cw, zIndex: 5,
                   cursor: (npcAfterDone && !mwDialogDone) || (clsTaskDone && !clsAfterDone) ? "pointer" : "default" }}
          onClick={() => {
            if (activeDialogRef.current === "mw" || activeDialogRef.current === "mw_after") { advanceDialog(); return; }
            if (clsTaskDoneRef.current && !clsAfterDoneRef.current) { openMwAfterDialog(); return; }
            openMwDialog();
          }}>
          <img src={img("/img/Maintenance worker.png")} alt="維修工阿修" draggable={false}
            style={{ width: "100%", height: "auto", imageRendering: "pixelated",
                     filter: nearMW && ((npcAfterDone && !mwDialogDone) || (clsTaskDone && !clsAfterDone)) ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {((npcAfterDone && !mwDialogDone) || (clsTaskDone && !clsAfterDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: "#1d4ed8", textShadow: "0 0 12px #1d4ed8, 0 0 24px #1e3a8a", pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearMW && (npcAfterDone && !mwDialogDone) && activeDialog !== "mw" && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(30,60,120,0.9)", border: "2px solid #60a5fa", whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 互動
            </div>
          )}
          {nearMW && (clsTaskDone && !clsAfterDone) && activeDialog !== "mw_after" && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(30,60,120,0.9)", border: "2px solid #60a5fa", whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 互動
            </div>
          )}
        </div>

        {/* Bulletin Board */}
        <div className="absolute"
          style={{ left: BOARD.x * cw, top: BOARD.y * ch, width: BOARD.w * cw, height: BOARD.h * ch, zIndex: 5, cursor: "pointer" }}
          onClick={() => { if (npcDialogDone && !missionComplete) setMissionReady(true); }}>
          <img src={img("/img/bulletin_board.png")} alt="公告板" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated",
                     filter: nearBoard ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {npcDialogDone && !missionComplete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: "#1d4ed8", textShadow: "0 0 12px #1d4ed8, 0 0 24px #1e3a8a", pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearBoard && npcDialogDone && !missionComplete && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(30,58,138,0.95)", border: "2px solid #3b82f6", whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 開始任務
            </div>
          )}
        </div>

        {/* NPC */}
        <div className="absolute"
          style={{ left: NPC.x * cw, top: NPC.y * ch, width: NPC_SIZE_PCT * ch, height: NPC_SIZE_PCT * ch, zIndex: 5,
                   cursor: "pointer" }}
          onClick={() => { if (activeDialogRef.current === "npc") advanceDialog(); else openNpcDialog(); }}>
          <img src={img("/img/NPC1.png")} alt="NPC" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated",
                     filter: nearNpc ? "brightness(1.3)" : "brightness(1)", transition: "filter 0.3s" }} />
          {(!npcDialogDone || (missionComplete && !npcAfterDone) || (clsAfterDone && !finalDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 text-3xl font-black animate-bounce"
              style={{ color: "#1d4ed8", textShadow: "0 0 12px #1d4ed8, 0 0 24px #1e3a8a", pointerEvents: "none", lineHeight: 1 }}>！</div>
          )}
          {nearNpc && activeDialog !== "npc" && (!npcDialogDone || (missionComplete && !npcAfterDone) || (clsAfterDone && !finalDone)) && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-3 py-1 text-xs font-bold text-white animate-bounce"
              style={{ background: "rgba(30,60,120,0.9)", border: "2px solid #60a5fa", whiteSpace: "nowrap", boxShadow: "2px 2px 0px #000" }}>
              E 互動
            </div>
          )}
        </div>

        {/* Player */}
        <img src={getSprite(dir)} alt="character" draggable={false}
          style={{ position: "absolute", left: pos.x * cw, top: pos.y * ch, width: "auto", height: CHAR_SIZE_PCT * ch,
                   imageRendering: "pixelated", zIndex: 10,
                   filter: moving ? "brightness(1.1)" : "brightness(1)", transition: "filter 0.1s" }} />

        {/* Dialog box */}
        {activeDialog !== null && (
          <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}
            onClick={() => activeDialog === "npc"
              ? (activeDialogRef.current === "npc" ? advanceDialog() : openNpcDialog())
              : advanceDialog()}>
            <div className="relative max-w-6xl mx-auto">
              {/* Portrait */}
              <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                            pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img
                  src={activeDialog === "npc" ? img("/img/NPC1half.png") : img("/img/Maintenance workerhalf.png")}
                  alt={activeDialog === "npc" ? "阿波" : "阿修"}
                  style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                           imageRendering: "pixelated", display: "block" }} />
                <div className="w-full text-center px-4 py-1 text-xs font-bold"
                  style={{ background: "#1e3a8a", border: "2px solid #3b82f6", color: "#93c5fd" }}>
                  {activeDialog === "npc" ? "⚓ 船長阿波" : "🔧 維修工阿修"}
                </div>
              </div>
              {/* Text panel */}
              <div className="w-full px-8 py-6 relative dialog-panel"
                style={{ background: "rgba(8,20,50,0.97)", borderTop: "3px solid #3b82f6",
                         boxShadow: "0 -4px 0px #1e3a8a", minHeight: 150 }}>
                <p className="text-white text-lg leading-relaxed dialog-text">
                  {currentLines[dialogIndex]}
                </p>
                <div className="absolute bottom-3 left-8 flex gap-1">
                  {currentLines.map((_, i) => (
                    <span key={i} className="w-2 h-2"
                      style={{ background: i === dialogIndex ? "#60a5fa" : "rgba(255,255,255,0.2)", display: "inline-block" }} />
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

        {/* Mission start overlay */}
        {missionReady && !activeDialog && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4"
            style={{ background: "rgba(0,0,0,0.55)", zIndex: 30 }}>
            <div className="w-full max-w-sm p-5 flex flex-col gap-3"
              style={{ background: "rgba(8,20,50,0.98)", border: "3px solid #3b82f6", boxShadow: "4px 4px 0px #1e3a8a" }}>
              <button onClick={() => { window.location.href = "/level/chapter-1/play"; }}
                className="w-full py-3 font-bold text-white text-sm"
                style={{ background: "#2563eb", border: "3px solid #1e3a8a", boxShadow: "4px 4px 0px #000" }}>
                開始任務 →
              </button>
              <button onClick={() => { window.location.href = "/level/chapter-1"; }}
                className="w-full py-2 text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.4)", color: "#9ca3af", boxShadow: "2px 2px 0px #000" }}>
                返回
              </button>
            </div>
          </div>
        )}

        {/* Final completion overlay */}
        {finalDone && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{ background: "rgba(0,0,0,0.7)", zIndex: 40 }}>
            <div className="flex flex-col items-center gap-5 w-full max-w-sm px-4 py-8"
              style={{ background: "rgba(8,20,50,0.98)", border: "3px solid #60a5fa", boxShadow: "6px 6px 0px rgba(96,165,250,0.3)" }}>
              <p className="text-sm font-bold tracking-widest" style={{ color: "#60a5fa" }}>[ 任務完成 ]</p>
              <button
                onClick={() => { window.location.href = "/"; }}
                className="w-full py-3 font-bold text-sm tracking-widest"
                style={{ background: "rgba(96,165,250,0.15)", border: "2px solid #60a5fa", color: "#60a5fa" }}>
                返回地圖
              </button>
            </div>
          </div>
        )}

        {/* Classifier mission overlay */}
        {classifierReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4"
            style={{ background: "rgba(0,0,0,0.55)", zIndex: 30 }}>
            <div className="w-full max-w-sm p-5 flex flex-col gap-3"
              style={{ background: "rgba(8,20,50,0.98)", border: "3px solid #3b82f6", boxShadow: "4px 4px 0px #1e3a8a" }}>
              <button onClick={() => { window.location.href = "/level/chapter-2/play"; }}
                className="w-full py-3 font-bold text-white text-sm"
                style={{ background: "#2563eb", border: "3px solid #1e3a8a", boxShadow: "4px 4px 0px #000" }}>
                開始任務 →
              </button>
              <button onClick={() => setClassifierReady(false)}
                className="w-full py-2 text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.4)", color: "#9ca3af", boxShadow: "2px 2px 0px #000" }}>
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="flex-shrink-0 flex items-center justify-center py-4 sm:hidden"
        style={{ background: "rgba(5,5,20,0.9)" }}>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(3, 48px)" }}>
          {[
            { label: "↑", key: "ArrowUp",    col: 2, row: 1 },
            { label: "←", key: "ArrowLeft",  col: 1, row: 2 },
            { label: "↓", key: "ArrowDown",  col: 2, row: 3 },
            { label: "→", key: "ArrowRight", col: 3, row: 2 },
          ].map(({ label, key, col, row }) => (
            <button key={key}
              onPointerDown={() => startMove(key)} onPointerUp={() => stopMove(key)} onPointerLeave={() => stopMove(key)}
              className="flex items-center justify-center text-white font-bold text-lg select-none active:brightness-125"
              style={{ gridColumn: col, gridRow: row, background: "rgba(255,255,255,0.1)",
                       border: "2px solid rgba(255,255,255,0.4)", boxShadow: "2px 2px 0px #000" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center py-2 text-xs text-gray-600"
        style={{ background: "rgba(5,5,20,0.9)" }}>
        WASD / 方向鍵移動　　靠近 NPC 按 E 互動
      </div>
    </div>
  );
}
