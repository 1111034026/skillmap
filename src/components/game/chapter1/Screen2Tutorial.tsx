"use client";

import { useState, useEffect } from "react";
import { TUTORIAL_QUESTION } from "@/data/chapter1";
import DragCard from "./DragCard";
import DropZone from "./DropZone";
import { img } from "@/lib/imgPath";

type Zone = "hand" | "usable" | "review" | "unsuitable";

interface Props {
  onDone: () => void;
}

const ORANGE = "#00AAFF";

export default function Screen2Tutorial({ onDone }: Props) {
  const [placements, setPlacements] = useState<Record<string, Zone>>(
    Object.fromEntries(TUTORIAL_QUESTION.cards.map((c) => [c.id, "hand"]))
  );
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [wrongCards, setWrongCards] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [allCorrect, setAllCorrect] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setShowCursor((v) => !v), 600);
    return () => clearInterval(t);
  }, []);

  const allPlaced = TUTORIAL_QUESTION.cards.every((c) => placements[c.id] !== "hand");

  const handleDrop = (zone: Zone) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragCard) return;
    setPlacements((prev) => ({ ...prev, [dragCard]: zone }));
    setWrongCards((prev) => { const s = new Set(prev); s.delete(dragCard!); return s; });
    setChecked(false);
    setDragCard(null);
  };

  const handleCheck = () => {
    const wrong = new Set(
      TUTORIAL_QUESTION.cards
        .filter((c) => placements[c.id] !== "hand" && placements[c.id] !== c.zone)
        .map((c) => c.id)
    );
    setWrongCards(wrong);
    setChecked(true);
    if (wrong.size === 0 && allPlaced) setAllCorrect(true);
  };

  const returnCard = (id: string) => {
    setPlacements((prev) => ({ ...prev, [id]: "hand" }));
    setWrongCards((prev) => { const s = new Set(prev); s.delete(id); return s; });
    setChecked(false);
  };

  const inHand = TUTORIAL_QUESTION.cards.filter((c) => placements[c.id] === "hand");
  const usable = TUTORIAL_QUESTION.cards.filter((c) => placements[c.id] === "usable");
  const review = TUTORIAL_QUESTION.cards.filter((c) => placements[c.id] === "review");
  const unsuit = TUTORIAL_QUESTION.cards.filter((c) => placements[c.id] === "unsuitable");

  return (
    <div className="terminal-bg scanlines flex flex-col h-svh relative" style={{ color: "#D0EEFF" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest" style={{ color: ORANGE }}>▶ 示範教學</span>
          <span className="text-xs" style={{ color: "rgba(0,170,255,0.5)" }}>回聲港</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(0,170,255,0.4)" }}>
          系統啟動{showCursor ? "▮" : " "}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-4 overflow-auto">

        {/* Step indicators */}
        <div className="flex gap-3 w-full max-w-2xl">
          {[["01", "讀取需求", "看情境"], ["02", "比對建議", "比對選項"], ["03", "分類輸出", "拖曳分類"]].map(([num, label, sub]) => (
            <div key={num} className="flex-1 px-3 py-2 text-center"
              style={{ border: `1px solid rgba(0,170,255,0.3)`, background: "rgba(0,170,255,0.05)" }}>
              <p className="text-xs font-bold" style={{ color: ORANGE }}>{num}.</p>
              <p className="text-xs" style={{ color: "#D0EEFF" }}>{label}</p>
              <p className="text-xs" style={{ color: "rgba(0,170,255,0.4)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Situation */}
        <div className="w-full max-w-2xl relative"
          style={{ border: `2px solid ${ORANGE}`, background: "rgba(0,170,255,0.06)", boxShadow: `4px 4px 0px rgba(0,170,255,0.3)` }}>
          <span style={{ position: "absolute", top: -2, left: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", bottom: -2, left: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
          <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
          <div className="px-4 py-1" style={{ borderBottom: `1px solid rgba(0,170,255,0.3)`, background: "rgba(0,170,255,0.1)" }}>
            <span className="text-xs tracking-widest" style={{ color: ORANGE }}>遊客提問</span>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-sm leading-relaxed" style={{ color: "#D0EEFF" }}>{TUTORIAL_QUESTION.situation}</p>
          </div>
        </div>

        {/* Drag hint */}
        <div className="flex items-center gap-2 px-4 py-2"
          style={{ border: `1px dashed rgba(0,170,255,0.3)`, background: "rgba(0,170,255,0.04)" }}>
          <span style={{ color: ORANGE }}>▷</span>
          <p className="text-xs" style={{ color: "rgba(208,238,255,0.7)" }}>把每張建議卡片拖曳到正確的分類欄位</p>
        </div>

        {/* Hand */}
        <div className="w-full max-w-2xl"
          style={{ border: `2px dashed rgba(0,170,255,0.35)`, background: "rgba(0,170,255,0.03)" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop("hand")}
        >
          <div className="px-3 py-1" style={{ borderBottom: `1px solid rgba(0,170,255,0.2)` }}>
            <span className="text-xs tracking-widest" style={{ color: "#00AAFF" }}>AI 推薦</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-4 min-h-[90px]">
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

        {allPlaced && !allCorrect && (
          <button onClick={handleCheck}
            className="px-10 py-3 font-bold text-sm tracking-widest"
            style={{ background: "rgba(0,170,255,0.12)", border: `2px solid ${ORANGE}`, boxShadow: `4px 4px 0px rgba(0,170,255,0.4)`, color: ORANGE }}>
            ▶ 確認答案
          </button>
        )}

        {checked && wrongCards.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2"
            style={{ border: "1px solid #FF3333", background: "rgba(255,51,51,0.08)" }}>
            <span style={{ color: "#FF3333" }}>✗</span>
            <p className="text-xs" style={{ color: "#FF6666" }}>有些放錯了，點卡片可拿回重放。</p>
          </div>
        )}

        {allCorrect && (
          <div className="w-full max-w-2xl relative"
            style={{ border: `2px solid ${ORANGE}`, background: "rgba(0,170,255,0.08)", boxShadow: `4px 4px 0px rgba(0,170,255,0.4)` }}>
            <span style={{ position: "absolute", top: -2, left: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
            <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderTop: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
            <span style={{ position: "absolute", bottom: -2, left: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderLeft: `3px solid ${ORANGE}` }} />
            <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderBottom: `3px solid ${ORANGE}`, borderRight: `3px solid ${ORANGE}` }} />
            <div className="px-4 py-1 flex items-center gap-2" style={{ borderBottom: `1px solid rgba(0,170,255,0.3)`, background: "rgba(0,170,255,0.12)" }}>
              <img src={img("/img/NPC1.png")} alt="阿波" className="w-5 h-5 object-contain" style={{ imageRendering: "pixelated" }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: ORANGE }}>⚓ 船長阿波</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#D0EEFF" }}>
                <span style={{ color: ORANGE }}>▷ </span>先不要急著選。<br />
                <span style={{ color: ORANGE }}>▷ </span>先看看你現在需要什麼，再看這個建議適不適合。
              </p>
              <button onClick={onDone}
                className="w-full py-3 font-bold text-sm tracking-widest"
                style={{ background: "rgba(0,255,136,0.1)", border: "2px solid #00FF88", boxShadow: "4px 4px 0px rgba(0,255,136,0.4)", color: "#00FF88" }}>
                ▶ 我懂了，開始作答
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
