"use client";

import { useState, useEffect } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { MiaPortrait } from "./MiaPortrait";

const GREEN = "#22c55e";
const BG    = "#041208";

const LINES_A = [
  "歡迎來到智能動物園。",
  "這裡有一台新的食物分類機。以後我們想請它幫忙分食物。",
  "豬吃蘋果，猴子吃香蕉。",
  "可是現在它還不太會分，常常把食物都猜成同一種。",
  "你願意和我一起教它嗎？",
];

const LINES_B = [
  "太好了。",
  "這一關最重要的，不是只看它有沒有答對。",
  "我們要看的是：你給它看了什麼，它又學到了什麼。",
];

interface Props { onDone: () => void; }

export default function Screen1Intro({ onDone }: Props) {
  const [phase, setPhase] = useState<"a" | "b">("a");
  const [idx,   setIdx]   = useState(0);

  const lines = phase === "a" ? LINES_A : LINES_B;
  const { ready } = useDialogReady(`${phase}-${idx}`);

  const advance = () => {
    if (!ready) return;
    if (idx < lines.length - 1) { setIdx(idx + 1); return; }
    if (phase === "a") { setPhase("b"); setIdx(0); return; }
    onDone();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "e" || e.key === "E") advance(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col h-svh relative" style={{ background: BG, color: "#dcfce7" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: GREEN }}>▶ SMART ZOO // 開場</span>
        <span className="text-xs" style={{ color: `${GREEN}66` }}>按 E 繼續</span>
      </div>

      <div className="flex-1" />

      {phase === "a" && idx === lines.length - 1 && (
        <div className="flex justify-center pb-8 gap-4">
          <button onClick={advance}
            className="px-8 py-3 font-bold tracking-widest text-sm"
            style={{ background: `${GREEN}22`, border: `2px solid ${GREEN}`, color: GREEN }}>
            好，一起教它
          </button>
        </div>
      )}

      <div className="relative" style={{ zIndex: 10 }} onClick={advance}>
        <div className="relative" style={{ cursor: "pointer" }}>
          <MiaPortrait />
          <div className="w-full px-8 py-6 flex flex-col gap-2 dialog-panel"
            style={{ background: "rgba(4,18,8,0.97)", borderTop: `3px solid ${GREEN}`,
                     boxShadow: "0 -4px 0px #052e16", minHeight: 150 }}>
            <p key={`${phase}-${idx}`} className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line"
              style={{ animation: "fadeUp 0.2s ease" }}>
              {lines[idx]}
            </p>
            <span className="text-xs absolute bottom-3 right-4"
              style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
              {idx < lines.length - 1 || phase === "a" ? "點擊或按 E 繼續 ▶" : "點擊或按 E 開始 ▶"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
