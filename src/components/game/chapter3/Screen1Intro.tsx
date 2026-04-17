"use client";

import { useState, useEffect } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { img } from "@/lib/imgPath";

const ORANGE = "#f97316";
const BRIGHT = "#fb923c";
const BG = "#0c0f1a";

const TOK_LINES = [
  "你來得正好。",
  "學校的歡樂日快到了，工坊裡一下子多了很多工作。",
  "有些事情可以請 AI 幫忙，有些事情還是要人來做。",
  "如果什麼都丟給 AI，有些地方就會出問題。",
  "你願意幫我一起分派工作嗎？",
];

interface Props { onDone: () => void; }

export default function Screen1Intro({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const { ready } = useDialogReady(idx);

  const advance = () => {
    if (!ready) return;
    if (idx < TOK_LINES.length - 1) setIdx(idx + 1);
    else onDone();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col h-svh relative" style={{ background: BG, color: "#e2e8f0" }}>
      <style>{`
        @keyframes gear { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes gearR { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Background decorative */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                      fontSize: "clamp(60px,9vw,110px)", fontWeight: 900,
                      color: "rgba(249,115,22,0.04)", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
          TASK WORKSHOP
        </div>
        <div style={{ position: "absolute", top: 80, left: 80, fontSize: 120, opacity: 0.05,
                      animation: "gear 12s linear infinite" }}>⚙</div>
        <div style={{ position: "absolute", top: 120, left: 180, fontSize: 70, opacity: 0.04,
                      animation: "gearR 8s linear infinite" }}>⚙</div>
        <div style={{ position: "absolute", top: 100, right: 120, fontSize: 100, opacity: 0.05,
                      animation: "gearR 10s linear infinite" }}>⚙</div>
        <div style={{ position: "absolute", bottom: 160, right: 80, fontSize: 80, opacity: 0.04,
                      animation: "gear 15s linear infinite" }}>⚙</div>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.5)", zIndex: 1 }}>
        <span className="text-sm tracking-widest font-bold" style={{ color: ORANGE }}>▶ TASK WORKSHOP // 任務工坊</span>
        <span className="text-xs" style={{ color: `${ORANGE}66` }}>CHAPTER 3</span>
      </div>

      {/* Scene */}
      <div className="flex-1 relative" style={{ zIndex: 1 }}>
        {/* Conveyor belt decoration */}
        <div className="absolute bottom-32 left-0 right-0" style={{ height: 6, background: `${ORANGE}22`, borderTop: `1px solid ${ORANGE}33`, borderBottom: `1px solid ${ORANGE}33` }} />
        {/* Task boxes on conveyor */}
        {[80, 240, 420, 620, 820].map((x, i) => (
          <div key={i} className="absolute" style={{ bottom: 44, left: x, width: 60, height: 50,
            background: `${ORANGE}11`, border: `2px solid ${ORANGE}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, opacity: 0.3 }}>📋</span>
          </div>
        ))}
        {/* Tok NPC */}
        <div className="absolute" style={{ right: 160, bottom: 100 }}>
          <TokSprite size={160} />
        </div>
      </div>

      {/* Tok dialog */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advance}>
        <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
          <TokPortrait />
          <div className="w-full px-8 py-6 relative dialog-panel"
            style={{ background: "rgba(10,12,20,0.97)", borderTop: `3px solid ${ORANGE}`,
                     boxShadow: `0 -4px 0px #050708`, minHeight: 150 }}>
            <p className="text-white text-lg leading-relaxed dialog-text" style={{ animation: "fadeUp 0.25s ease" }} key={idx}>
              {TOK_LINES[idx]}
            </p>
            <div className="absolute bottom-3 left-8 flex gap-1">
              {TOK_LINES.map((_, i) => (
                <span key={i} className="w-2 h-2"
                  style={{ background: i === idx ? BRIGHT : "rgba(255,255,255,0.15)", display: "inline-block" }} />
              ))}
            </div>
            <span className="text-xs absolute bottom-3 right-4"
              style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
              {idx < TOK_LINES.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 開始任務"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TokPortrait() {
  return (
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
  );
}

export function TokSprite({ size }: { size: number }) {
  return (
    <img src={img("/img/Tucker.png")} alt="托克"
      style={{ width: size, height: size, objectFit: "contain", objectPosition: "bottom",
               imageRendering: "pixelated", display: "block" }} />
  );
}
