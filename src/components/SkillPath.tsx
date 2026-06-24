"use client";

import { SkillState } from "@/types";
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
      const cx = mx + offsetX, cy = my + offsetY;
      const d = `M ${from.x} ${from.y} Q ${cx} ${cy} ${skill.x} ${skill.y}`;

      lines.push(
        <g key={`${prereqId}-${skill.id}`}>
          {/* Track */}
          <path d={d} fill="none" stroke="#e8d5b8" strokeWidth={10} strokeLinecap="round" />
          {/* Active (completed) */}
          {isActive && (
            <path d={d} fill="none" stroke="#f4b942" strokeWidth={7} strokeLinecap="round"
              opacity={0.95} strokeDasharray="2 16" />
          )}
          {/* Available (dashed) */}
          {!isActive && isAvailable && (
            <path d={d} fill="none" stroke="#8bc78e" strokeWidth={6}
              strokeLinecap="round" strokeDasharray="2 16" />
          )}
          {/* Star marker at the path's midpoint */}
          <circle cx={cx} cy={cy} r={16} fill="#fffaf0" stroke="#f4b942" strokeWidth={3} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={18}>⭐</text>
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
