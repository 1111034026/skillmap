"use client";

import { useState, useEffect } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { TEST_ITEMS } from "@/data/chapter4";
import { MiaPortrait } from "./MiaPortrait";

const GREEN  = "#22c55e";
const BG     = "#041208";

const INTRO_LINES = [
  "好了，現在我們再讓它試一次。",
  "看看多學了香蕉之後，它有沒有變得更會分。",
];

type Phase = "intro" | "reveal" | "feedback";

export default function Screen5Test2({ onDone }: { onDone: () => void }) {
  const [phase,      setPhase]      = useState<Phase>("intro");
  const [introIdx,   setIntroIdx]   = useState(0);
  const [itemIdx,    setItemIdx]    = useState(0);
  const [scanning,   setScanning]   = useState(false);
  const [showResult, setShowResult] = useState(false);

  const item   = TEST_ITEMS[itemIdx];
  const isLast = itemIdx === TEST_ITEMS.length - 1;

  useEffect(() => {
    if (phase !== "reveal" || !scanning) return;
    setShowResult(false);
    const t = setTimeout(() => setShowResult(true), 2000);
    return () => clearTimeout(t);
  }, [phase, itemIdx, scanning]);

  useEffect(() => {
    if (phase !== "reveal" || !showResult) return;
    const t = setTimeout(() => setPhase("feedback"), 1200);
    return () => clearTimeout(t);
  }, [phase, showResult]);

  const startScan = () => { setScanning(true); };

  const { ready } = useDialogReady(
    `${phase}-${introIdx}-${itemIdx}`,
    phase === "intro" || phase === "feedback",
  );

  const advance = () => {
    if (!ready) return;
    if (phase === "intro") {
      if (introIdx < INTRO_LINES.length - 1) { setIntroIdx(introIdx + 1); return; }
      setPhase("reveal"); setScanning(false); setShowResult(false); return;
    }
    if (phase === "feedback") {
      if (!isLast) { setItemIdx(prev => prev + 1); setPhase("reveal"); setScanning(false); setShowResult(false); return; }
      onDone();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "e" || e.key === "E") advance(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const guessLabel = (g: "apple" | "banana") => g === "apple" ? "蘋果 🍎" : "香蕉 🍌";

  return (
    <div className="flex flex-col h-svh relative" style={{ background: BG, color: "#dcfce7" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #4ade8044}50%{box-shadow:0 0 24px #4ade80aa}}
        @keyframes scanLine{0%{top:-6px;opacity:1}80%{opacity:1}100%{top:calc(100% + 6px);opacity:0}}
        @keyframes scanPulse{0%,100%{opacity:0.15}50%{opacity:0.35}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: GREEN }}>▶ SMART ZOO // 任務 4：重新測試</span>
        {phase !== "intro" && (
          <span className="text-xs font-bold px-3 py-1"
            style={{ color: GREEN, border: `1px solid ${GREEN}`, background: `${GREEN}11`, letterSpacing: "0.15em" }}>
            {itemIdx + 1} / {TEST_ITEMS.length}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        {phase !== "intro" && (
          <>
            <p className="text-sm tracking-wide" style={{ color: `${GREEN}88` }}>
              {phase === "reveal" && scanning && !showResult ? "食物分類機正在重新判斷⋯⋯" : phase === "reveal" && !scanning ? "準備分析食物" : "分類完成"}
            </p>
            <div style={{ padding: "8px 24px", border: `1px solid ${GREEN}44`,
                          background: `${GREEN}08`, color: "#4ade80", fontSize: "0.75rem", letterSpacing: "0.15em" }}>
              {phase === "reveal" && !scanning ? "待機中" : scanning && !showResult ? "正在判斷…" : "判斷完成"}
            </div>

            <div className="flex flex-col items-center gap-4">
              <div key={item.food.id} style={{
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8, padding: "20px 40px",
                background: `${GREEN}08`,
                border: `2px solid ${scanning && !showResult ? GREEN : GREEN + "44"}`,
                boxShadow: scanning && !showResult ? `0 0 16px ${GREEN}44` : "none",
                transition: "box-shadow 0.3s",
              }}>
                {scanning && !showResult && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${GREEN}08 3px, ${GREEN}08 4px)`,
                    animation: "scanPulse 1.2s ease-in-out infinite",
                  }} />
                )}
                {scanning && !showResult && (
                  <div style={{
                    position: "absolute", left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, transparent, ${GREEN}cc, ${GREEN}, ${GREEN}cc, transparent)`,
                    boxShadow: `0 0 8px ${GREEN}`,
                    animation: "scanLine 0.9s linear infinite",
                    pointerEvents: "none",
                  }} />
                )}
                <img src={item.food.img} alt={item.food.name} draggable={false}
                  style={{ width: 80, height: 80, objectFit: "contain", imageRendering: "pixelated", position: "relative" }} />
                <span className="font-bold text-lg" style={{ color: "#86efac", position: "relative" }}>{item.food.name}</span>
              </div>

              {phase === "reveal" && !scanning && (
                <button onClick={startScan}
                  className="px-8 py-3 font-bold text-sm tracking-widest"
                  style={{ background: `${GREEN}18`, border: `2px solid ${GREEN}`,
                           color: GREEN, cursor: "pointer", letterSpacing: "0.2em",
                           boxShadow: `0 0 12px ${GREEN}44`, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${GREEN}33`; e.currentTarget.style.boxShadow = `0 0 20px ${GREEN}88`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${GREEN}18`; e.currentTarget.style.boxShadow = `0 0 12px ${GREEN}44`; }}>
                  ▶ 開始分析
                </button>
              )}

              <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: GREEN,
                            animation: scanning && !showResult ? "blink 0.8s step-end infinite" : "none",
                            opacity: scanning && !showResult ? 1 : 0 }}>
                SCANNING…
              </div>

              {(showResult || phase === "feedback") && (
                <div style={{
                  animation: "glow 2s ease-in-out infinite",
                  padding: "12px 40px", fontWeight: "bold", letterSpacing: "0.1em",
                  border: "2px solid #4ade80", background: "rgba(74,222,128,0.12)", color: "#4ade80",
                }}>
                  ✓ 分析結果：{guessLabel(item.round2Guess)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {(phase === "intro" || phase === "feedback") && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advance}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <MiaPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(4,18,8,0.97)", borderTop: `3px solid ${GREEN}`, minHeight: 150 }}>
              <p key={`${phase}-${introIdx}-${itemIdx}`}
                className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line"
                style={{ animation: "fadeUp 0.2s ease" }}>
                {phase === "intro" ? INTRO_LINES[introIdx] : item.mia2}
              </p>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {isLast && phase === "feedback" ? "點擊或按 E 繼續 ▶" : "點擊或按 E 下一個 ▶"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
