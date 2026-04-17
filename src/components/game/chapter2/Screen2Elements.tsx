"use client";

import { useState, useEffect, useRef } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { C2Element, C2Theme } from "@/data/chapter2";

type ElementType = "background" | "character" | "prop";

type Phase =
  | "task-intro"      // Lumi 4 lines (first round only)
  | "machine-intro"   // AI machine 3 lines (first round only)
  | "round-intro"     // Lumi 2 lines
  | "machine-give"    // AI machine 1 line
  | "show"            // element + buttons
  | "lumi-keep"       // Lumi 2 lines after keep
  | "machine-keep"    // AI machine 1 line after keep
  | "lumi-swap"       // Lumi lines after swap
  | "machine-swap"    // AI machine 2 lines after swap
  | "complete";       // Lumi 3 lines (last round only)

const GREEN = "#16a34a";
const BRIGHT = "#4ade80";

const STEP: Record<ElementType, string> = {
  background: "STEP 2A / 3",
  character:  "STEP 2B / 3",
  prop:       "STEP 2C / 3",
};

const TASK_INTRO = [
  "現在 AI 設計機會開始幫我們想點子。",
  "可是記住喔，不是它給什麼，我們就全部照用。",
  "你要自己看一看，這個點子是不是適合你的主題。",
  "如果喜歡，就留下。如果不太適合，就換掉。",
];

const MACHINE_INTRO = [
  "AI 設計機：正在產生新點子",
  "AI 設計機：分析主題完成",
  "AI 設計機：開始提供設計元素",
];

const ROUND_INTRO: Record<ElementType, string[]> = {
  background: ["先來選背景。背景會決定整個舞台的感覺。", "看一看，這個背景和你的主題搭不搭。"],
  character:  ["背景選好了，接下來選角色。", "角色會讓舞台更有故事感。想想看，誰最適合出現在你的舞台上。"],
  prop:       ["最後來選道具。", "小道具看起來好像不大，可是常常會讓作品更完整。"],
};

const MACHINE_GIVE: Record<ElementType, string[]> = {
  background: ["背景提案已生成。", "這是新的背景點子。"],
  character:  ["角色提案已生成。", "這是新的角色點子。"],
  prop:       ["道具提案已生成。", "這是新的道具點子。"],
};

const LUMI_KEEP: Record<ElementType, string[]> = {
  background: ["這個很適合你的主題。", "很好，你知道自己想要什麼感覺。"],
  character:  ["這個角色很有感覺。", "很好，這個角色和你的主題很搭。"],
  prop:       ["很好，這個可以讓舞台更完整。", "你挑得很仔細，這樣作品會更有感覺。"],
};

const MACHINE_KEEP: Record<ElementType, string> = {
  background: "背景已保留。",
  character:  "角色已保留。",
  prop:       "道具已保留。",
};

const LUMI_SWAP: Record<ElementType, string[]> = {
  background: ["沒關係，我們再換一個看看。", "不是每個點子都一定要用。"],
  character:  ["如果你覺得不太搭，我們就換一個。", "你不用勉強收下每個點子。"],
  prop:       ["再換一個看看，也許會更適合。"],
};

const MACHINE_SWAP: Record<ElementType, string[]> = {
  background: ["正在重新產生背景", "新背景已更新"],
  character:  ["正在重新產生角色", "新角色已更新"],
  prop:       ["正在重新產生道具", "新道具已更新"],
};

const COMPLETE_LINES = [
  "很好，你已經挑好要用的材料了。",
  "剛剛不是 AI 設計機自己決定要留什麼，是你自己選出來的。",
  "接下來，我們把這些材料拼成真正的作品吧。",
];

function getPool(theme: C2Theme, type: ElementType): C2Element[] {
  if (type === "background") return theme.backgrounds;
  if (type === "character")  return theme.characters;
  return theme.props;
}

function drawOne(pool: C2Element[], exclude: Set<string>): C2Element | null {
  const avail = pool.filter((e) => !exclude.has(e.id));
  if (!avail.length) return null;
  return avail[Math.floor(Math.random() * avail.length)];
}

interface Props {
  theme: C2Theme;
  elementType: ElementType;
  showTaskIntro: boolean;
  isLastRound: boolean;
  onDone: (element: C2Element) => void;
}

export default function Screen2Elements({ theme, elementType, showTaskIntro, isLastRound, onDone }: Props) {
  const pool = getPool(theme, elementType);
  const themeColor = theme.color;

  const [phase,    setPhase]   = useState<Phase>(showTaskIntro ? "task-intro" : "round-intro");
  const [idx,      setIdx]     = useState(0);
  const [current,  setCurrent] = useState<C2Element | null>(null);
  const [usedIds,  setUsedIds] = useState<Set<string>>(new Set());
  const [kept,     setKept]    = useState<C2Element | null>(null);

  // Phases before Lumi: skip straight through without animation
  useEffect(() => {
    if (phase === "machine-intro") go("round-intro");
    if (phase === "machine-keep")  confirmKeep();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Draw element when entering machine-give
  useEffect(() => {
    if (phase !== "machine-give") return;
    if (current !== null) return; // already have one (re-entering after swap draws separately)
    const el = drawOne(pool, usedIds);
    if (el) {
      setUsedIds((prev) => { const s = new Set(prev); s.add(el.id); return s; });
      setCurrent(el);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const go = (next: Phase) => { setPhase(next); setIdx(0); };

  // ── Advance dialog helpers ────────────────────────────────────────────────
  const advanceLines = (lines: string[], onEnd: () => void) => {
    if (idx < lines.length - 1) setIdx(idx + 1);
    else onEnd();
  };

  const handleKeep = () => { setKept(current); go("lumi-keep"); };
  const handleSwap = () => go("lumi-swap");

  const confirmKeep = () => {
    if (isLastRound) go("complete");
    else onDone(kept!);
  };

  const confirmComplete = () => {
    if (idx < COMPLETE_LINES.length - 1) setIdx(idx + 1);
    else onDone(kept!);
  };

  // machine-* phases are handled by MachineOverlay (auto-advance)
  const handleDialogAdvance = () => {
    if (!ready) return;
    if (phase === "task-intro")  advanceLines(TASK_INTRO,               () => go("machine-intro"));
    if (phase === "round-intro") advanceLines(ROUND_INTRO[elementType], () => go("machine-give"));
    if (phase === "lumi-keep")   advanceLines(LUMI_KEEP[elementType],   () => go("machine-keep"));
    if (phase === "lumi-swap")   advanceLines(LUMI_SWAP[elementType],   () => go("machine-swap"));
    if (phase === "complete")    confirmComplete();
  };

  const machineOnDoneRef = useRef<() => void>(() => {});
  machineOnDoneRef.current = () => {
    if (phase === "machine-intro") go("round-intro");
    else if (phase === "machine-give") go("show");
    else if (phase === "machine-keep") confirmKeep();
    else if (phase === "machine-swap") afterMachineSwap();
  };

  const afterMachineSwap = () => {
    const el = drawOne(pool, usedIds);
    if (!el) { onDone(current!); return; }
    setUsedIds((prev) => { const s = new Set(prev); s.add(el.id); return s; });
    setCurrent(el);
    go("show");
  };

  // E key advances Lumi dialogs; MachineOverlay handles its own E key
  const isMachinePhase = phase === "machine-give" || phase === "machine-swap";
  const { ready } = useDialogReady(`${phase}-${idx}`, !isMachinePhase && phase !== "show");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (phase !== "show" && !isMachinePhase) handleDialogAdvance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const lines = {
    "task-intro":    TASK_INTRO,
    "machine-intro": MACHINE_INTRO,
    "round-intro":   ROUND_INTRO[elementType],
    "machine-give":  MACHINE_GIVE[elementType],
    "lumi-keep":     LUMI_KEEP[elementType],
    "machine-keep":  [MACHINE_KEEP[elementType]],
    "lumi-swap":     LUMI_SWAP[elementType],
    "machine-swap":  MACHINE_SWAP[elementType],
    "complete":      COMPLETE_LINES,
    "show":          [],
  }[phase] ?? [];

  return (
    <div className="flex flex-col h-svh relative" style={{ background: "#0a150a", color: "#d1fae5" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sparkle { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.3); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      `}</style>

      {/* Background text — only during dialog phases before selection */}
      {(phase === "task-intro" || phase === "round-intro") && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }}>
        <div style={{ textAlign: "center", fontWeight: 900, color: "rgba(22,163,74,0.07)",
                      letterSpacing: "0.1em", fontSize: "clamp(60px, 10vw, 120px)" }}>
          挑選適合你的點子！
        </div>
      </div>}

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.4)" }}>
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-widest font-bold" style={{ color: GREEN }}>
            ▶ INSPIRATION FOREST // 選{{ background:"背景", character:"角色", prop:"道具" }[elementType]}
          </span>
          <span className="text-xs px-2 py-0.5" style={{ border: `1px solid ${themeColor}`, color: themeColor }}>
            {theme.emoji} {theme.name}
          </span>
        </div>
        <span className="text-xs" style={{ color: "rgba(74,222,128,0.5)" }}>{STEP[elementType]}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {phase === "show" && current && (
          <>
            <div className="text-center">
              <p className="text-base" style={{ color: "#86efac" }}>AI 設計機給你這個</p>
            </div>
            <div className="flex flex-col items-center gap-4 py-10 px-12"
              style={{
                background: `${themeColor}20`,
                border: `3px solid ${themeColor}`,
                boxShadow: `6px 6px 0px ${themeColor}44`,
                animation: "fadeUp 0.35s ease",
                minWidth: 200,
              }}>
              {current.img
                ? <img src={current.img} alt={current.name}
                    style={{ width: 120, height: 120, objectFit: "contain", imageRendering: "pixelated" }} />
                : <span style={{ fontSize: 80 }}>{current.emoji}</span>
              }
              <span className="text-xl font-bold" style={{ color: "#d1fae5" }}>{current.name}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={handleKeep}
                className="px-8 py-3 font-bold text-sm tracking-widest"
                style={{ background: `${GREEN}22`, border: `2px solid ${GREEN}`, color: BRIGHT, boxShadow: `3px 3px 0px ${GREEN}44` }}>
                ✓ 留下
              </button>
              <button onClick={handleSwap}
                className="px-8 py-3 font-bold text-sm tracking-widest"
                style={{ background: "rgba(255,170,0,0.1)", border: "2px solid #FFB800", color: "#FFB800", boxShadow: "3px 3px 0px #FFB80044" }}>
                ↻ 換掉
              </button>
            </div>
          </>
        )}

        {/* Keep chosen element visible during lumi-keep / complete phases */}
        {(phase === "lumi-keep" || phase === "complete") && kept && (
          <div className="flex flex-col items-center gap-4 py-10 px-12"
            style={{
              background: `${themeColor}20`,
              border: `3px solid ${themeColor}`,
              boxShadow: `6px 6px 0px ${themeColor}44`,
              animation: "fadeUp 0.3s ease",
              minWidth: 200,
            }}>
            {kept.img
              ? <img src={kept.img} alt={kept.name}
                  style={{ width: 120, height: 120, objectFit: "contain", imageRendering: "pixelated" }} />
              : <span style={{ fontSize: 80 }}>{kept.emoji}</span>
            }
            <span className="text-xl font-bold" style={{ color: "#d1fae5" }}>{kept.name}</span>
          </div>
        )}

        {/* Keep current element visible during lumi-swap phase */}
        {phase === "lumi-swap" && current && (
          <div className="flex flex-col items-center gap-4 py-10 px-12"
            style={{
              background: "rgba(255,170,0,0.08)",
              border: "2px solid #FFB80066",
              boxShadow: "4px 4px 0px #FFB80022",
              animation: "fadeUp 0.3s ease",
              minWidth: 200,
              opacity: 0.6,
            }}>
            {current.img
              ? <img src={current.img} alt={current.name}
                  style={{ width: 120, height: 120, objectFit: "contain", imageRendering: "pixelated" }} />
              : <span style={{ fontSize: 80 }}>{current.emoji}</span>
            }
            <span className="text-xl font-bold" style={{ color: "#d1fae5" }}>{current.name}</span>
          </div>
        )}
      </div>

      {/* ── Lumi dialog ── */}
      {(phase === "task-intro" || phase === "round-intro" || phase === "lumi-keep" || phase === "lumi-swap" || phase === "complete") && (
        <LumiDialog
          text={lines[idx] ?? ""}
          onNext={handleDialogAdvance}
          isLast={idx === lines.length - 1}
          dots={lines.length > 1 ? { lines, idx } : undefined}
          ready={ready}
        />
      )}

      {/* ── AI Machine overlay ── */}
      {isMachinePhase && (
        <MachineOverlay
          key={phase}
          lines={lines}
          onDone={() => machineOnDoneRef.current()}
        />
      )}
    </div>
  );
}

// ── Shared dialog components ─────────────────────────────────────────────────

function LumiDialog({ text, onNext, isLast, dots, ready = true }: {
  text: string; onNext: () => void; isLast: boolean;
  dots?: { lines: string[]; idx: number }; ready?: boolean;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={ready ? onNext : undefined}>
      <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
        <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
                      pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src="/img/Lumihalf.png" alt="露米"
            style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                     imageRendering: "pixelated", display: "block" }} />
          <div className="w-full text-center px-4 py-1 text-xs font-bold"
            style={{ background: "#052010", border: `2px solid ${GREEN}`, color: BRIGHT }}>
            🌿 發明家露米
          </div>
        </div>
        <div className="w-full px-8 py-6 relative dialog-panel"
          style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`,
                   boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
          <p className="text-white text-lg leading-relaxed dialog-text">{text}</p>
          {dots && (
            <div className="absolute bottom-3 left-8 flex gap-1">
              {dots.lines.map((_, i) => (
                <span key={i} className="w-2 h-2"
                  style={{ background: i === dots.idx ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
              ))}
            </div>
          )}
          <span className="text-xs absolute bottom-3 right-4"
            style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
            {isLast ? "點擊或按 E 關閉" : "點擊或按 E 繼續 ▶"}
          </span>
        </div>
      </div>
    </div>
  );
}

const MACHINE_BOOT = [
  "初始化設計引擎...",
  "載入主題參數...",
  "分析風格資料庫...",
];

function MachineOverlay({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const allLines = [...MACHINE_BOOT, ...lines];
  const LINE_MS  = 650;
  const TOTAL_MS = 500 + allLines.length * LINE_MS + 800;

  const [visible,  setVisible]  = useState(0);
  const [progress, setProgress] = useState(0);
  const calledRef  = useRef(false);
  const onDoneRef  = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    allLines.forEach((_, i) =>
      t.push(setTimeout(() => setVisible(i + 1), 500 + i * LINE_MS))
    );
    const STEPS = 80;
    for (let i = 1; i <= STEPS; i++)
      t.push(setTimeout(() => setProgress(Math.round((i / STEPS) * 100)), (TOTAL_MS / STEPS) * i));
    t.push(setTimeout(() => {
      if (!calledRef.current) { calledRef.current = true; onDoneRef.current(); }
    }, TOTAL_MS));
    return () => t.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 30, background: "rgba(0,4,0,0.88)" }}>
      <div style={{
        fontFamily: "monospace", width: 500, padding: "28px 32px",
        background: "rgba(2,10,4,0.98)",
        border: `1px solid ${BRIGHT}66`,
        boxShadow: `0 0 60px ${BRIGHT}14`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8,
                      marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${BRIGHT}22` }}>
          <span style={{ color: BRIGHT, fontSize: 11, letterSpacing: 4, fontWeight: "bold" }}>◈ AI 設計機</span>
          <span style={{ flex: 1 }} />
          <span style={{ color: `${BRIGHT}44`, fontSize: 10 }}>DESIGN MACHINE v2.0</span>
        </div>

        {/* Lines */}
        <div style={{ minHeight: 120, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {allLines.map((line, i) => {
            if (i >= visible) return null;
            const isBoot = i < MACHINE_BOOT.length;
            const isLast = i === visible - 1;
            return (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ color: isBoot ? `${BRIGHT}44` : `${BRIGHT}aa`,
                               fontSize: 10, letterSpacing: 2, flexShrink: 0 }}>
                  {isBoot ? "SYS" : " AI"}
                </span>
                <span style={{ color: isBoot ? `${BRIGHT}66` : BRIGHT, fontSize: 14, letterSpacing: 0.5 }}>
                  &gt; {line}
                  {isLast && <span style={{ animation: "blink 1s step-end infinite", marginLeft: 4 }}>█</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ background: `${BRIGHT}18`, height: 4, marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: BRIGHT,
                        boxShadow: `0 0 8px ${BRIGHT}`, transition: "width 0.08s linear" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: `${BRIGHT}55`, fontSize: 10, letterSpacing: 2 }}>
            PROCESSING... {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
