"use client";

import { useState, useEffect } from "react";
import { img } from "@/lib/imgPath";

type Zone = "hand" | "usable" | "unsuitable";

const CARDS = [
  { id: "gym",     label: "室內體育館", icon: "🏃", correct: "usable"     as Zone },
  { id: "library", label: "圖書館",     icon: "📚", correct: "usable"     as Zone },
  { id: "slide",   label: "露天溜滑梯", icon: "🛝", correct: "unsuitable" as Zone },
];

export default function TutorialGame() {
  const [placements, setPlacements] = useState<Record<string, Zone>>({
    gym: "hand", library: "hand", slide: "hand",
  });
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [wrongCards, setWrongCards] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(true);
  const [checked, setChecked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Hide gesture hint after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const allPlaced = CARDS.every((c) => placements[c.id] !== "hand");
  const allCorrect = CARDS.every((c) => placements[c.id] === c.correct);

  const handleDragStart = (id: string) => setDragCard(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

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
      CARDS.filter((c) => placements[c.id] !== "hand" && placements[c.id] !== c.correct).map((c) => c.id)
    );
    setWrongCards(wrong);
    setChecked(true);
    if (wrong.size === 0 && allPlaced) {
      setTimeout(() => setShowDialog(true), 600);
    }
  };

  // Return card to hand on click if already placed
  const handleCardClick = (id: string) => {
    if (placements[id] !== "hand") {
      setPlacements((prev) => ({ ...prev, [id]: "hand" }));
      setWrongCards((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setChecked(false);
    }
  };

  const cardsInHand  = CARDS.filter((c) => placements[c.id] === "hand");
  const usableCards  = CARDS.filter((c) => placements[c.id] === "usable");
  const unsuitCards  = CARDS.filter((c) => placements[c.id] === "unsuitable");

  return (
    <div
      className="flex flex-col min-h-svh"
      style={{ background: "linear-gradient(160deg, #0c1a2e 0%, #0a1020 100%)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← 返回
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-white font-bold">📋 示範教學 · 回聲港</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-8 gap-6">

        {/* Question box */}
        <div
          className="w-full max-w-xl rounded-2xl px-6 py-4 text-center"
          style={{
            background: "rgba(30, 58, 100, 0.6)",
            border: "2px solid #3b82f666",
            boxShadow: "0 0 24px #3b82f622",
          }}
        >
          <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-widest">情境題</p>
          <p className="text-white text-lg font-bold">現在下雨了，要去哪裡比較好？</p>
        </div>

        {/* Instruction + gesture hint */}
        <div className="flex items-center gap-3">
          <p className="text-gray-300 text-sm">把每張建議拖到正確的位置。</p>
          {showHint && (
            <span
              className="text-xl animate-bounce"
              style={{ display: "inline-block", animation: "bounce 0.8s infinite, fadeOut 3.5s forwards" }}
            >
              👆
            </span>
          )}
        </div>

        {/* Cards in hand */}
        <div
          className="w-full max-w-xl min-h-[100px] rounded-2xl flex items-center justify-center gap-4 px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)" }}
          onDragOver={handleDragOver}
          onDrop={handleDrop("hand")}
        >
          {cardsInHand.length === 0 ? (
            <p className="text-gray-600 text-sm">（所有建議已分類）</p>
          ) : (
            cardsInHand.map((card) => (
              <DragCard key={card.id} card={card} onDragStart={handleDragStart} isWrong={false} />
            ))
          )}
        </div>

        {/* Drop zones */}
        <div className="w-full max-w-xl grid grid-cols-2 gap-4">
          {/* 可用 */}
          <DropZone
            label="✅ 可用"
            color="#16a34a"
            cards={usableCards}
            onDragOver={handleDragOver}
            onDrop={handleDrop("usable")}
            onCardClick={handleCardClick}
            wrongCards={wrongCards}
            onDragStart={handleDragStart}
          />
          {/* 不適合 */}
          <DropZone
            label="❌ 不適合"
            color="#dc2626"
            cards={unsuitCards}
            onDragOver={handleDragOver}
            onDrop={handleDrop("unsuitable")}
            onCardClick={handleCardClick}
            wrongCards={wrongCards}
            onDragStart={handleDragStart}
          />
        </div>

        {/* Check button */}
        {allPlaced && !showDialog && (
          <button
            onClick={handleCheck}
            className="px-8 py-3 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 4px 16px #2563eb44" }}
          >
            確認答案
          </button>
        )}

        {/* Wrong feedback */}
        {checked && wrongCards.size > 0 && (
          <p className="text-red-400 text-sm">有些建議放錯了，再想想看！點卡片可以拿回來重新分類。</p>
        )}

        {/* Correct feedback */}
        {checked && wrongCards.size === 0 && allPlaced && (
          <p className="text-green-400 text-sm font-semibold">✓ 全部正確！</p>
        )}
      </div>

      {/* NPC Dialog overlay */}
      {showDialog && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-end pb-8 px-4"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 50 }}
        >
          {/* Result summary */}
          <div
            className="w-full max-w-xl mb-4 rounded-2xl px-5 py-4 grid grid-cols-2 gap-3"
            style={{ background: "rgba(10,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {["usable", "unsuitable"].map((zone) => (
              <div key={zone}>
                <p className="text-xs font-bold mb-2" style={{ color: zone === "usable" ? "#4ade80" : "#f87171" }}>
                  {zone === "usable" ? "✅ 可用" : "❌ 不適合"}
                </p>
                {CARDS.filter((c) => c.correct === zone).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-white mb-1">
                    <span>{c.icon}</span><span>{c.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* NPC speech */}
          <div
            className="w-full max-w-xl rounded-2xl p-5"
            style={{
              background: "rgba(8,20,50,0.98)",
              border: "2px solid #3b82f688",
              boxShadow: "0 0 32px #3b82f633",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <img src={img("/img/NPC1.png")} alt="阿波" className="w-10 h-10 rounded-full object-cover" style={{ imageRendering: "pixelated" }} />
              <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>⚓ 船長阿波</p>
            </div>
            <p className="text-white text-sm leading-relaxed mb-4">
              不是所有公告板給的建議都能直接用。<br />
              我們要先想一想：這個建議和現在的需要有沒有真的對上。
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)", color: "#fff" }}
            >
              回到港口 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function DragCard({
  card,
  onDragStart,
  isWrong,
  onClick,
}: {
  card: (typeof CARDS)[0];
  onDragStart: (id: string) => void;
  isWrong: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all hover:brightness-110"
      style={{
        background: isWrong ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.08)",
        border: `2px solid ${isWrong ? "#dc2626aa" : "rgba(255,255,255,0.15)"}`,
        minWidth: 100,
      }}
    >
      <span className="text-2xl">{card.icon}</span>
      <span className="text-white text-xs font-semibold text-center">{card.label}</span>
      {isWrong && <span className="text-red-400 text-xs">✗</span>}
    </div>
  );
}

function DropZone({
  label, color, cards, onDragOver, onDrop, onCardClick, wrongCards, onDragStart,
}: {
  label: string;
  color: string;
  cards: (typeof CARDS);
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onCardClick: (id: string) => void;
  wrongCards: Set<string>;
  onDragStart: (id: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-3 min-h-[140px] flex flex-col gap-2 transition-all"
      style={{
        background: `${color}11`,
        border: `2px dashed ${color}66`,
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <p className="text-xs font-bold text-center" style={{ color }}>{label}</p>
      {cards.map((card) => (
        <DragCard
          key={card.id}
          card={card}
          onDragStart={onDragStart}
          isWrong={wrongCards.has(card.id)}
          onClick={() => onCardClick(card.id)}
        />
      ))}
      {cards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: `${color}55` }}>拖曳到這裡</p>
        </div>
      )}
    </div>
  );
}
