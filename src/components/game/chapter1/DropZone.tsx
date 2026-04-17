"use client";

import { Card } from "@/data/chapter1";
import DragCard from "./DragCard";

interface Props {
  label: string;
  color: string;
  termLabel: string;
  cards: Card[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (id: string) => void;
  onCardClick: (id: string) => void;
  wrongCards: Set<string>;
}

export default function DropZone({ label, color, termLabel, cards, onDragOver, onDrop, onDragStart, onCardClick, wrongCards }: Props) {
  return (
    <div
      className="p-4 min-h-[160px] flex flex-col gap-2"
      style={{
        background: `${color}0d`,
        border: `2px dashed ${color}`,
        boxShadow: `4px 4px 0px ${color}44`,
        position: "relative",
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Corner brackets */}
      <span style={{ position: "absolute", top: -1, left: -1, width: 10, height: 10, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}` }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderTop: `3px solid ${color}`, borderRight: `3px solid ${color}` }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: 10, height: 10, borderBottom: `3px solid ${color}`, borderLeft: `3px solid ${color}` }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderBottom: `3px solid ${color}`, borderRight: `3px solid ${color}` }} />

      <p className="text-sm font-bold text-center tracking-widest uppercase" style={{ color }}>{termLabel}</p>
      <p className="text-sm text-center -mt-1" style={{ color: `${color}99` }}>{label}</p>

      {cards.map((card) => (
        <DragCard
          key={card.id}
          card={card}
          isWrong={wrongCards.has(card.id)}
          onDragStart={onDragStart}
          onClick={() => onCardClick(card.id)}
        />
      ))}
      {cards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm tracking-widest" style={{ color: `${color}44` }}>拖曳到這裡</p>
        </div>
      )}
    </div>
  );
}
