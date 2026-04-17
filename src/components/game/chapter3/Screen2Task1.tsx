"use client";

import { useState, useEffect, useRef } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { C3Task, TASK1_CARDS } from "@/data/chapter3";
import { TokPortrait } from "./Screen1Intro";

const ORANGE = "#f97316";
const BRIGHT = "#fb923c";
const BG = "#0c0f1a";

const TOK_DONE = "很好，你已經開始看懂哪些事情適合請 AI 幫忙了。";

type Phase = "card" | "feedback" | "alldone";

interface Props { onDone: () => void; }

export default function Screen2Task1({ onDone }: Props) {
  const [cardIdx, setCardIdx]   = useState(0);
  const [phase,   setPhase]     = useState<Phase>("card");
  const [dropped, setDropped]   = useState<"ai" | "human" | null>(null);
  const [hoverId, setHoverId]   = useState<string | null>(null);
  const draggingRef = useRef(false);

  const card     = TASK1_CARDS[cardIdx];
  const isCorrect = dropped === card?.answer;
  const isLast   = cardIdx === TASK1_CARDS.length - 1;
  const { ready } = useDialogReady(`${phase}-${cardIdx}`, phase !== "card");

  const handleDrop = (zone: "ai" | "human") => {
    if (phase !== "card") return;
    setDropped(zone);
    setPhase("feedback");
  };

  const advance = () => {
    if (!ready) return;
    if (phase === "alldone") { onDone(); return; }
    if (!isCorrect) {
      setDropped(null);
      setPhase("card");
      return;
    }
    if (isLast) {
      setPhase("alldone");
    } else {
      setCardIdx(prev => prev + 1);
      setDropped(null);
      setPhase("card");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && phase !== "card") advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const feedbackText = phase === "alldone"
    ? TOK_DONE
    : isCorrect
      ? card.tokCorrect
      : `${card.tokWrong}${card.tokHint ? ` 正確答案：${card.answer === "ai" ? "AI 機器人" : "機械工坊工人"}` : ""}`;

  return (
    <div className="flex flex-col h-svh relative" style={{ background: BG, color: "#e2e8f0" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translate(calc(-50% + 300px), -50%); } to { opacity:1; transform:translate(-50%, -50%); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.5)" }}>
        <span className="text-sm tracking-widest font-bold" style={{ color: ORANGE }}>▶ TASK WORKSHOP // ANALYSIS MODE</span>
        <div className="flex items-center gap-3"><span className="text-xs font-bold px-3 py-1"
            style={{ color: ORANGE, border: `1px solid ${ORANGE}`, background: `${ORANGE}11`, letterSpacing: "0.15em" }}>
            {String(cardIdx + 1).padStart(2, "0")} / 08
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 pb-8">

        {/* Conveyor belt with task card on top */}
        <div style={{ position: "relative", width: 820 }}>
          <img src="/img/chapter3task/conveyor top view.png" alt="輸送帶" draggable={false}
            style={{ width: "100%", imageRendering: "pixelated", pointerEvents: "none", display: "block" }} />

          {/* Task card sitting on conveyor */}
          <div key={card.id}
            draggable={phase === "card"}
            onDragStart={(e) => { draggingRef.current = true; e.dataTransfer.effectAllowed = "move"; }}
            onDragEnd={() => { draggingRef.current = false; }}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "slideIn 0.35s ease",
              cursor: phase === "card" ? "grab" : "default",
              width: "60%",
              userSelect: "none",
              zIndex: 2,
            }}>
            <img src="/img/chapter3task/card.png" alt="" draggable={false}
              style={{ width: "100%", display: "block", imageRendering: "pixelated", pointerEvents: "none",
                filter: phase === "feedback" ? (isCorrect ? "sepia(1) hue-rotate(80deg) saturate(2)" : "sepia(1) hue-rotate(300deg) saturate(3)") : "none",
                transition: "filter 0.3s" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 28px" }}>
              <p className="text-base font-bold text-center tracking-wide" style={{ color: "#3b2a1a" }}>
                {card.title}
              </p>
              {phase === "card" && (
                <p className="text-xs tracking-widest" style={{ color: "#7c5c3a" }}>拖曳到下方區域</p>
              )}
              {phase === "feedback" && (
                <span className="text-sm font-bold px-2 py-1" style={{
                  color: isCorrect ? "#14532d" : "#7f1d1d",
                }}>
                  {isCorrect ? "✓ 正確" : `✕ 正確答案：${card.answer === "ai" ? "AI 機器人" : "機械工坊工人"}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Drop zones */}
        <div className="flex gap-6 w-full max-w-2xl">
          <Zone id="ai" label="AI 機器人" img="/img/chapter3task/AIrobot top view.png" color="#1d4ed8"
            active={phase === "card"} dropped={dropped === "ai"}
            hoverId={hoverId} setHoverId={setHoverId}
            onDrop={() => handleDrop("ai")} />
          <Zone id="human" label="機械工坊工人" img="/img/chapter3task/Worker top view.png" color="#7c3aed"
            active={phase === "card"} dropped={dropped === "human"}
            hoverId={hoverId} setHoverId={setHoverId}
            onDrop={() => handleDrop("human")} />
        </div>
      </div>

      {/* Tok feedback */}
      {phase !== "card" && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advance}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <TokPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(10,12,20,0.97)", borderTop: `3px solid ${ORANGE}`, minHeight: 150 }}>
              <p className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line" style={{ animation: "fadeUp 0.25s ease" }}>
                {feedbackText}
              </p>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {phase === "alldone" ? "點擊或按 E 繼續 ▶" : isCorrect ? "點擊或按 E 下一個 ▶" : "點擊或按 E 再試一次 ▶"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Zone({ id, label, img, color, active, dropped, hoverId, setHoverId, onDrop }: {
  id: string; label: string; img: string; color: string;
  active: boolean; dropped: boolean;
  hoverId: string | null; setHoverId: (id: string | null) => void;
  onDrop: () => void;
}) {
  const hovering = hoverId === id && active;
  return (
    <div
      onDragOver={(e) => { if (active) { e.preventDefault(); setHoverId(id); } }}
      onDragLeave={() => setHoverId(null)}
      onDrop={(e) => { e.preventDefault(); setHoverId(null); if (active) onDrop(); }}
      style={{
        flex: 1, minHeight: 160, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
        border: `3px dashed ${hovering ? "#fff" : dropped ? color : color + "44"}`,
        background: hovering ? `${color}33` : dropped ? `${color}22` : `${color}0d`,
        transition: "all 0.2s ease",
        cursor: active ? "copy" : "default",
        transform: hovering ? "scale(1.02)" : "scale(1)",
      }}>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="text-sm font-bold tracking-wider mb-2" style={{ color: hovering || dropped ? color : color + "88" }}>
          {label}
        </span>
        <img src={img} alt={label} draggable={false}
          style={{ height: 160, width: "auto", imageRendering: "pixelated", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
