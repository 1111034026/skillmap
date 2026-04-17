"use client";

import { Card } from "@/data/chapter1";

interface Props {
  card: Card;
  isWrong: boolean;
  onDragStart: (id: string) => void;
  onClick?: () => void;
}

const ORANGE = "#00AAFF";
const ORANGE_DIM = "rgba(0,170,255,0.18)";

export default function DragCard({ card, isWrong, onDragStart, onClick }: Props) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-5 py-4 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: isWrong ? "rgba(220,38,38,0.18)" : ORANGE_DIM,
        border: `2px solid ${isWrong ? "#FF3333" : ORANGE}`,
        boxShadow: isWrong
          ? "3px 3px 0px #7f1d1d"
          : `3px 3px 0px ${ORANGE}88`,
        animation: isWrong ? "shake 0.4s ease" : undefined,
        minWidth: 120,
        position: "relative",
      }}
    >
      {/* Corner dots */}
      <span style={{ position: "absolute", top: 3, left: 4, fontSize: 6, color: isWrong ? "#FF3333" : ORANGE, lineHeight: 1 }}>■</span>
      <span style={{ position: "absolute", top: 3, right: 4, fontSize: 6, color: isWrong ? "#FF3333" : ORANGE, lineHeight: 1 }}>■</span>

      <span className="text-sm font-semibold text-center leading-tight"
        style={{ color: isWrong ? "#FF6666" : "#FFD0A0" }}>
        {card.label}
      </span>
      {isWrong && (
        <span className="text-xs font-bold" style={{ color: "#FF3333" }}>[ ERR ]</span>
      )}
    </div>
  );
}
