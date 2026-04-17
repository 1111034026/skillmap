"use client";

import { useRouter } from "next/navigation";
import { Skill, SkillState } from "@/types";
import { img } from "@/lib/imgPath";

const LEVEL_ROUTES: Record<string, string> = {
  "chapter-1": "/level/chapter-1",
  "chapter-2": "/level/chapter-2",
  "chapter-3": "/level/chapter-3",
  "chapter-4": "/level/chapter-4",
};

interface Props {
  skill: Skill | null;
  state: SkillState | null;
  onComplete: (id: string) => void;
}

export default function InfoPanel({ skill, state, onComplete }: Props) {
  const router = useRouter();

  if (!skill || !state) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 h-full font-mono"
        style={{ borderTop: "2px solid #e8550033" }}
      >
        <span className="text-2xl" style={{ opacity: 0.3 }}>▷</span>
        <p className="text-sm tracking-widest" style={{ color: "#e8550055" }}>
          點選關卡節點以查看詳情
        </p>
      </div>
    );
  }

  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const orange = "#e85500";

  const bgImg = skill.id === "chapter-4" ? img("/img/BK4.png")
              : skill.id === "chapter-3" ? img("/img/BK3.png")
              : skill.id === "chapter-2" ? img("/img/BK2.png")
              : img("/img/BK1.png");

  return (
    <div className="h-full font-mono relative overflow-hidden" style={{ borderTop: `2px solid ${orange}55` }}>
      {/* 背景圖 */}
      <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: "pixelated", opacity: 0.18 }} />
      {/* 內容疊在背景上 */}
      <div className="relative h-full flex flex-col px-10 py-5 gap-4"
        style={{ border: `2px solid ${orange}44`, borderTop: "none" }}>
        {/* Header */}
        <div>
          <div className="text-sm tracking-widest mb-0.5" style={{ color: `${orange}66` }}>
            關卡資訊 ////
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold tracking-widest" style={{ color: orange, textShadow: `0 0 8px ${orange}` }}>
              {skill.title}
            </div>
            {(isCompleted || isLocked) && (
              <span
                className="text-sm tracking-widest px-2 py-0.5"
                style={{
                  border: `1px solid ${isCompleted ? "#22c55e" : orange + "44"}`,
                  color: isCompleted ? "#22c55e" : `${orange}55`,
                  background: isCompleted ? "#0a1a0a" : "#0e0800",
                }}
              >
                {isCompleted ? "已完成" : "尚未解鎖"}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <p className="text-sm tracking-wide leading-relaxed" style={{ color: "#ffffff" }}>
            {skill.description}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#cccccc", whiteSpace: "pre-line" }}>
            {skill.detail}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto">
          <button
            disabled={isLocked}
            onClick={() => {
              const route = LEVEL_ROUTES[skill.id];
              if (route) router.push(route);
            }}
            className="px-6 py-2 text-sm font-bold tracking-widest transition-all hover:brightness-125 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isLocked ? "#1a0800" : orange,
              border: `2px solid ${isLocked ? orange + "33" : orange}`,
              color: isLocked ? `${orange}55` : "#000",
              boxShadow: isLocked ? "none" : `0 0 12px ${orange}88`,
            }}
          >
            {isLocked ? "尚未解鎖" : "進入關卡 →"}
          </button>

          {!isCompleted && !isLocked && (
            <button
              onClick={() => onComplete(skill.id)}
              className="px-4 py-2 text-sm tracking-widest transition-all hover:brightness-125 active:scale-95"
              style={{
                background: "#0e0a06",
                border: `1px solid ${orange}55`,
                color: `${orange}88`,
              }}
            >
              標記完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
