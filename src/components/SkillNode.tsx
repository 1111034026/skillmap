"use client";

import { Skill, SkillState } from "@/types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/data/skills";

const NODE_W = 90;
const NODE_H = 80;

interface Props {
  skill: Skill;
  state: SkillState;
  isSelected: boolean;
  onClick: () => void;
}

export default function SkillNode({ skill, state, isSelected, onClick }: Props) {
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const isAvailable = state === "available";

  const borderColor = isLocked ? "#e8550033" : isSelected ? "#ffaa44" : "#e85500";
  const glowColor   = isLocked ? "none"       : isSelected ? "0 0 16px #ffaa44, 0 0 4px #ffaa44" : "0 0 10px #e8550066";
  const textColor   = isLocked ? "#e8550044"  : isSelected ? "#ffaa44" : "#e85500";

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
        onClick={isLocked ? undefined : onClick}
        disabled={isLocked}
        className="relative flex flex-col items-center justify-center gap-1 transition-all duration-150 select-none font-mono"
        style={{
          width: NODE_W,
          height: NODE_H,
          background: isSelected ? "#1a0a00" : "#0e0a06",
          border: `2px solid ${borderColor}`,
          boxShadow: glowColor,
          cursor: isLocked ? "not-allowed" : "pointer",
          transform: isSelected ? "scale(1.08)" : "scale(1)",
        }}
        onMouseEnter={e => { if (!isLocked && !isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {/* Corner decorations */}
        <span style={{ position: "absolute", top: 3, left: 4, fontSize: 8, color: borderColor, lineHeight: 1 }}>◤</span>
        <span style={{ position: "absolute", top: 3, right: 4, fontSize: 8, color: borderColor, lineHeight: 1 }}>◥</span>

        {/* Icon */}
        <span
          className="text-2xl leading-none"
          style={{ filter: isLocked ? "grayscale(1) opacity(0.3)" : "none" }}
        >
          {isCompleted ? "✓" : isLocked ? "▣" : skill.icon}
        </span>

        {/* Status text */}
        <span className="text-xs tracking-widest" style={{ color: textColor, fontSize: 11 }}>
          {isCompleted ? "完成" : isLocked ? "鎖定" : "進入"}
        </span>

        {/* Available ping */}
        {isAvailable && !isSelected && (
          <span
            className="absolute inset-0 animate-ping"
            style={{ background: "#e8550011", animationDuration: "2.5s" }}
          />
        )}
      </button>

    </div>
  );
}
