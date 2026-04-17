"use client";

import { useState, useEffect, useRef } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { C2_THEMES, C2Theme } from "@/data/chapter2";
import { img } from "@/lib/imgPath";

const GREEN = "#16a34a";
const BRIGHT = "#4ade80";

const INTRO_LINES = [
  "開始做作品前，要先想好你想做什麼。",
  "如果你自己都還沒決定方向，AI 設計機就很容易跑出一大堆亂亂的點子。",
  "你先選一個主題。等你有了方向，AI 設計機才比較知道要往哪裡幫你想。",
];

const AFTER_LINES = [
  "很好，我們現在有方向了。",
  "先有自己的想法，再請 AI 設計機幫忙，作品才不會亂掉。",
  "接下來，讓 AI 設計機幫我們長出一些點子吧。",
];

const THEME_LINE: Record<string, string> = {
  "space-jungle":      "哇，太空叢林。這會是一個神祕又特別的舞台。",
  "underwater-castle": "海底城堡呀。感覺會有很多泡泡、珊瑚和閃亮亮的東西。",
  "singing-garden":    "音樂花園，真適合森林慶典。感覺整個舞台都會一起唱歌呢。",
};

const IDLE_LINE = "不用急，先選一個你最有感覺的主題就可以了。";

type Phase = "intro" | "select" | "after";

interface Props {
  onSelect: (theme: C2Theme) => void;
}

export default function Screen1Theme({ onSelect }: Props) {
  const [phase,     setPhase]    = useState<Phase>("intro");
  const [introIdx,  setIntroIdx] = useState(0);
  const [afterIdx,  setAfterIdx] = useState(0);
  const [chosen,    setChosen]   = useState<C2Theme | null>(null);
  const [showIdle,  setShowIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // E key advances dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "e" && e.key !== "E") return;
      if (phase === "intro") advanceIntro();
      if (phase === "after") advanceAfter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Start idle timer when entering select phase
  useEffect(() => {
    if (phase !== "select") return;
    idleTimer.current = setTimeout(() => setShowIdle(true), 8000);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [phase]);

  const { ready: introReady } = useDialogReady(introIdx, phase === "intro");
  const { ready: afterReady } = useDialogReady(afterIdx, phase === "after");

  const advanceIntro = () => {
    if (!introReady) return;
    if (introIdx < INTRO_LINES.length - 1) setIntroIdx(introIdx + 1);
    else setPhase("select");
  };

  const handleSelect = (theme: C2Theme) => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setShowIdle(false);
    setChosen(theme);
    setAfterIdx(0);
    setPhase("after");
  };

  // after lines = AFTER_LINES + theme-specific line
  const afterLines = chosen
    ? [THEME_LINE[chosen.id] ?? "", ...AFTER_LINES]
    : AFTER_LINES;

  const advanceAfter = () => {
    if (!afterReady) return;
    if (afterIdx < afterLines.length - 1) setAfterIdx(afterIdx + 1);
    else onSelect(chosen!);
  };

  return (
    <div className="flex flex-col h-svh" style={{ background: "#0a150a", color: "#d1fae5", position: "relative" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Background text — only during intro */}
      {phase === "intro" && <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }}>
        <div style={{ textAlign: "center", fontWeight: 900, color: "rgba(22,163,74,0.07)", letterSpacing: "0.1em",
                      fontSize: "clamp(60px, 10vw, 120px)" }}>
          找到你的創作方向！
        </div>
      </div>}

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.4)" }}>
        <span className="text-sm tracking-widest font-bold" style={{ color: GREEN }}>▶ INSPIRATION FOREST // 選主題</span>
        <span className="text-xs" style={{ color: "rgba(74,222,128,0.5)" }}>STEP 1 / 3</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {phase === "select" && (
          <>
            <p className="text-lg font-bold" style={{ color: "#86efac", animation: "fadeUp 0.3s ease" }}>
              你想把舞台做成哪一種感覺呢？
            </p>
            <div className="grid grid-cols-3 gap-5 w-full max-w-3xl">
              {C2_THEMES.map((theme, i) => (
                <button key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className="flex flex-col items-center gap-4 py-8 px-4 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `${theme.color}18`,
                    border: `3px solid ${theme.color}`,
                    boxShadow: `4px 4px 0px ${theme.color}44`,
                    animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
                  }}>
                  <span style={{ fontSize: 56 }}>{theme.emoji}</span>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "#d1fae5" }}>{theme.name}</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(209,250,229,0.55)" }}>{theme.tagline}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Idle hint bubble */}
            {showIdle && (
              <div className="px-5 py-3 text-sm" onClick={() => setShowIdle(false)}
                style={{ background: "rgba(5,32,16,0.9)", border: `2px solid ${GREEN}`, color: "#d1fae5",
                         cursor: "pointer", animation: "fadeUp 0.3s ease", maxWidth: 360, textAlign: "center" }}>
                💬 {IDLE_LINE}
              </div>
            )}
          </>
        )}

        {/* After selection: show chosen theme card */}
        {phase === "after" && chosen && (
          <div className="flex flex-col items-center gap-4 py-8 px-4"
            style={{
              background: `${chosen.color}18`,
              border: `3px solid ${chosen.color}`,
              boxShadow: `4px 4px 0px ${chosen.color}44`,
              animation: "fadeUp 0.3s ease",
              minWidth: 200,
            }}>
            <span style={{ fontSize: 56 }}>{chosen.emoji}</span>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#d1fae5" }}>{chosen.name}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(209,250,229,0.55)" }}>{chosen.tagline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lumi intro dialog */}
      {phase === "intro" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advanceIntro}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <LumiPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`, boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
              <p className="text-white text-lg leading-relaxed dialog-text">{INTRO_LINES[introIdx]}</p>
              <Dots lines={INTRO_LINES} idx={introIdx} />
              <Hint last={introIdx === INTRO_LINES.length - 1} ready={introReady} />
            </div>
          </div>
        </div>
      )}

      {/* Lumi after-select dialog */}
      {phase === "after" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advanceAfter}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <LumiPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(5,32,16,0.97)", borderTop: `3px solid ${GREEN}`, boxShadow: `0 -4px 0px #052010`, minHeight: 150 }}>
              <p className="text-white text-lg leading-relaxed dialog-text">{afterLines[afterIdx]}</p>
              <Dots lines={afterLines} idx={afterIdx} />
              <Hint last={afterIdx === afterLines.length - 1} ready={afterReady} />
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

function Dots({ lines, idx }: { lines: string[]; idx: number }) {
  return (
    <div className="absolute bottom-3 left-8 flex gap-1">
      {lines.map((_, i) => (
        <span key={i} className="w-2 h-2"
          style={{ background: i === idx ? BRIGHT : "rgba(255,255,255,0.2)", display: "inline-block" }} />
      ))}
    </div>
  );
}

function Hint({ last, ready }: { last: boolean; ready: boolean }) {
  return (
    <span className="text-xs absolute bottom-3 right-4"
      style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
      {last ? "點擊或按 E 關閉" : "點擊或按 E 繼續 ▶"}
    </span>
  );
}
