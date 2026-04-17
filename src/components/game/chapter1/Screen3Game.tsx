"use client";

import { useState } from "react";
import { Question } from "@/data/chapter1";
import DragCard from "./DragCard";
import DropZone from "./DropZone";

type Zone = "hand" | "usable" | "review" | "unsuitable";

interface Props {
  question: Question;
  questionIndex: number;
  total: number;
  onCorrect: () => void;
  onWrong: (wrongHints: string[]) => void;
}

const ORANGE = "#00AAFF";

export default function Screen3Game({ question, questionIndex, total, onCorrect, onWrong }: Props) {
  const [placements, setPlacements] = useState<Record<string, Zone>>(
    Object.fromEntries(question.cards.map((c) => [c.id, "hand"]))
  );
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [wrongCards, setWrongCards] = useState<Set<string>>(new Set());

  const allPlaced = question.cards.every((c) => placements[c.id] !== "hand");

  const handleDrop = (zone: Zone) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragCard) return;
    setPlacements((prev) => ({ ...prev, [dragCard]: zone }));
    setWrongCards((prev) => { const s = new Set(prev); s.delete(dragCard!); return s; });
    setDragCard(null);
  };

  const returnCard = (id: string) => {
    setPlacements((prev) => ({ ...prev, [id]: "hand" }));
    setWrongCards((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleCheck = () => {
    const wrong = question.cards.filter(
      (c) => placements[c.id] !== "hand" && placements[c.id] !== c.zone
    );
    if (wrong.length === 0) {
      onCorrect();
    } else {
      setWrongCards(new Set(wrong.map((c) => c.id)));
      onWrong(wrong.map((c) => c.wrongHint).filter(Boolean));
    }
  };

  const inHand    = question.cards.filter((c) => placements[c.id] === "hand");
  const usable    = question.cards.filter((c) => placements[c.id] === "usable");
  const review    = question.cards.filter((c) => placements[c.id] === "review");
  const unsuit    = question.cards.filter((c) => placements[c.id] === "unsuitable");

  return (
    <div className="terminal-bg scanlines flex flex-col h-svh relative" style={{ color: "#D0EEFF" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest" style={{ color: ORANGE }}>▶ ECHO PORT //</span>
          <span className="text-xs" style={{ color: "rgba(0,170,255,0.6)" }}>ANALYSIS MODE</span>
          <span style={{ animation: "blink 1s steps(1) infinite", color: ORANGE }}>⚓</span>
        </div>
        <span className="text-xs font-bold tracking-widest"
          style={{ color: ORANGE, border: `1px solid rgba(0,170,255,0.3)`, padding: "2px 8px" }}>
          {String(questionIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-4 overflow-auto">

        {/* Situation panel */}
        <div className="w-full max-w-3xl relative"
          style={{ border: `2px solid ${ORANGE}`, background: "rgba(0,170,255,0.06)", boxShadow: `4px 4px 0px rgba(0,170,255,0.3)` }}>
          <span style={{ position: "absolute", top: -2, left: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", bottom: -2, left: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
          <div className="px-4 py-1 flex items-center gap-2" style={{ borderBottom: `1px solid rgba(0,170,255,0.3)`, background: "rgba(0,170,255,0.1)" }}>
            <span className="text-xs tracking-widest" style={{ color: ORANGE }}>遊客提問</span>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-base leading-relaxed" style={{ color: "#D0EEFF" }}>{question.situation}</p>
          </div>
        </div>

        {/* Hand */}
        <div className="w-full max-w-3xl"
          style={{ border: `2px dashed rgba(0,170,255,0.4)`, background: "rgba(0,170,255,0.03)" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop("hand")}
        >
          <div className="px-3 py-1" style={{ borderBottom: `1px solid rgba(0,170,255,0.2)` }}>
            <span className="text-sm tracking-widest" style={{ color: "#00AAFF" }}>AI 推薦地點</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-5 min-h-[110px]">
            {inHand.length === 0
              ? <p className="text-xs tracking-widest" style={{ color: "rgba(0,170,255,0.2)" }}>所有卡片已分類</p>
              : inHand.map((c) => (
                <DragCard key={c.id} card={c} isWrong={false} onDragStart={setDragCard} />
              ))}
          </div>
        </div>

        {/* Drop zones — 3 columns */}
        <div className="w-full max-w-2xl grid grid-cols-3 gap-3">
          <DropZone label="可以接受" termLabel="[ 接受 ]" color="#00FF88" cards={usable}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop("usable")}
            onDragStart={setDragCard} onCardClick={returnCard} wrongCards={wrongCards} />
          <DropZone label="需要再判斷" termLabel="[ 判斷 ]" color="#FFB800" cards={review}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop("review")}
            onDragStart={setDragCard} onCardClick={returnCard} wrongCards={wrongCards} />
          <DropZone label="先拒絕" termLabel="[ 拒絕 ]" color="#FF3333" cards={unsuit}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop("unsuitable")}
            onDragStart={setDragCard} onCardClick={returnCard} wrongCards={wrongCards} />
        </div>

        {/* NPC hint + confirm button — follow drop zones */}
        <div className="w-full max-w-2xl flex flex-col gap-3 pb-6" style={{ paddingTop: 48 }}>
          {/* NPC hint */}
          <div className="relative" style={{ paddingRight: 150 }}>
            <div style={{
              position: "absolute", right: 0, bottom: 0,
              display: "flex", flexDirection: "column", alignItems: "center",
              pointerEvents: "none", zIndex: 2,
            }}>
              <img src="/img/NPC1half.png" alt="阿波"
                style={{ width: 90, height: 90, objectFit: "contain", objectPosition: "bottom", imageRendering: "pixelated", display: "block" }} />
              <div className="w-full text-center px-2 py-0.5 text-sm font-bold"
                style={{ background: "#1e3a8a", border: `2px solid ${ORANGE}`, color: "#93c5fd" }}>
                ⚓ 船長阿波
              </div>
            </div>
            <div className="px-5 py-4 relative"
              style={{ background: "rgba(8,20,50,0.97)", border: `2px solid ${ORANGE}`, boxShadow: `3px 3px 0px rgba(0,170,255,0.4)`, minHeight: 50 }}>
              <p className="text-base leading-relaxed" style={{ color: "#D0EEFF" }}>
                {question.npcHint}
              </p>
            </div>
          </div>
          {/* Confirm button */}
          <button
            onClick={handleCheck}
            disabled={!allPlaced}
            className="w-full py-4 font-bold text-base tracking-widest"
            style={{
              background: allPlaced ? "rgba(0,170,255,0.12)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${allPlaced ? ORANGE : "rgba(0,170,255,0.2)"}`,
              boxShadow: allPlaced ? `4px 4px 0px rgba(0,170,255,0.4)` : "none",
              color: allPlaced ? ORANGE : "rgba(0,170,255,0.2)",
              cursor: allPlaced ? "pointer" : "not-allowed",
            }}
          >
            {allPlaced ? "▶ 確認答案" : "— 請先將所有卡片分類 —"}
          </button>
        </div>

      </div>
    </div>
  );
}
