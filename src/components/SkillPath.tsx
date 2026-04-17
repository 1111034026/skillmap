"use client";

import { Skill, SkillState } from "@/types";
import { skills, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/data/skills";

interface Props {
  getSkillState: (id: string) => SkillState;
}

export default function SkillPath({ getSkillState }: Props) {
  const lines: React.ReactNode[] = [];

  skills.forEach((skill) => {
    skill.prerequisites.forEach((prereqId) => {
      const from = skills.find((s) => s.id === prereqId);
      if (!from) return;

      const fromState = getSkillState(prereqId);
      const toState   = getSkillState(skill.id);
      const isActive    = fromState === "completed";
      const isAvailable = toState !== "locked";

      const mx = (from.x + skill.x) / 2;
      const my = (from.y + skill.y) / 2;
      const dx = skill.x - from.x;
      const dy = skill.y - from.y;
      const offsetX = -dy * 0.25;
      const offsetY =  dx * 0.25;
      const d = `M ${from.x} ${from.y} Q ${mx + offsetX} ${my + offsetY} ${skill.x} ${skill.y}`;

      lines.push(
        <g key={`${prereqId}-${skill.id}`}>
          {/* Inactive track */}
          <path d={d} fill="none" stroke="#e8550022" strokeWidth={6} strokeLinecap="round" />
          {/* Active (completed) */}
          {isActive && (
            <path d={d} fill="none" stroke="#e85500" strokeWidth={4} strokeLinecap="round"
              opacity={0.9} style={{ filter: "drop-shadow(0 0 4px #e85500)" }} />
          )}
          {/* Available (dashed) */}
          {!isActive && isAvailable && (
            <path d={d} fill="none" stroke="#e8550066" strokeWidth={3}
              strokeLinecap="round" strokeDasharray="12 8" />
          )}
        </g>
      );
    });
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%" height="100%"
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="none"
    >
      {lines}
    </svg>
  );
}
