"use client";

import { Skill, SkillState } from "@/types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/data/skills";
import { img } from "@/lib/imgPath";

const NODE_SIZE = 250;

const CHAPTER_IMG: Record<string, string> = {
  "chapter-1": "1.png",
  "chapter-2": "2.png",
  "chapter-3": "3.png",
  "chapter-4": "4.png",
};

interface Props {
  skill: Skill;
  state: SkillState;
  isSelected: boolean;
  onClick: () => void;
}

export default function SkillNode({ skill, state, isSelected, onClick }: Props) {
  const isLocked = state === "locked";
  const isCompleted = state === "completed";

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${(skill.x / CANVAS_WIDTH) * 100}%`,
        top: `${(skill.y / CANVAS_HEIGHT) * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      }}
    >
      <button
        onPointerDown={isLocked ? undefined : () => { new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/select.mp3`).play().catch(() => {}); }}
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className="relative transition-all duration-150 select-none"
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          cursor: isLocked ? "not-allowed" : "pointer",
          transform: isSelected ? "scale(1.1)" : "scale(1)",
          filter: isSelected ? "drop-shadow(0 0 10px #ffaa44)" : "none",
        }}
        onMouseEnter={e => { if (!isLocked && !isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        <img
          src={img(`/img/${CHAPTER_IMG[skill.id]}`)}
          alt={skill.title}
          draggable={false}
          className="w-full h-full object-contain"
          style={{ filter: isLocked ? "grayscale(1) brightness(0.6)" : "none", imageRendering: "auto" }}
        />

        {/* Locked overlay */}
        {isLocked && (
          <span className="absolute inset-0 flex items-center justify-center text-3xl"
            style={{ textShadow: "0 0 6px #000" }}>
            🔒
          </span>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
            style={{ background: "#22c55e", color: "#fff", border: "2px solid #fff", boxShadow: "0 0 6px rgba(0,0,0,0.3)" }}>
            ✓
          </span>
        )}
      </button>
    </div>
  );
}
