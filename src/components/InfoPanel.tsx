"use client";
import { navigate } from "@/lib/navigate";
import { useRef, useEffect } from "react";

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
  const enterAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (enterAudioRef.current) {
        enterAudioRef.current.pause();
        enterAudioRef.current = null;
      }
    };
  }, []);

  if (!skill || !state) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 h-full"
      >
        <span className="text-3xl" style={{ opacity: 0.5 }}>🧭</span>
        <p className="text-sm" style={{ color: "#4a3826" }}>
          點選地圖上的節點查看關卡介紹
        </p>
      </div>
    );
  }

  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const gold = "#f4b942";
  const green = "#8bc78e";

  const bgImg = skill.id === "chapter-4" ? img("/img/BK4.png")
              : skill.id === "chapter-3" ? img("/img/BK3.png")
              : skill.id === "chapter-2" ? img("/img/BK2.png")
              : img("/img/BK1.png");

  return (
    <div className="h-full relative overflow-hidden" style={{ background: "#eaf6fb" }}>
      {/* 背景圖 */}
      <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "rgba(255,250,240,0.6)" }} />
      <div className="relative h-full flex flex-col px-10 py-3 gap-2">
        {/* Header */}
        <div>
          <div className="text-base font-bold mb-0.5" style={{ color: "#4a3826" }}>
            關卡介紹
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold" style={{ color: "#5b4632" }}>
              {skill.title}
            </div>
            {(isCompleted || isLocked) && (
              <span
                className="text-base font-bold px-3 py-0.5 rounded-full"
                style={{
                  border: `1px solid ${isCompleted ? green : "#d8cdbb"}`,
                  color: isCompleted ? "#3f7a43" : "#4a3826",
                  background: isCompleted ? "#eaf6e9" : "#f1ece1",
                }}
              >
                {isCompleted ? "已完成" : "尚未解鎖"}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <p className="text-lg leading-snug font-bold" style={{ color: "#5b4632" }}>
            {skill.description}
          </p>
          <p className="text-lg leading-snug font-bold" style={{ color: "#4a3826", whiteSpace: "pre-line" }}>
            {skill.detail}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-auto">
          <button
            disabled={isLocked}
            onPointerDown={() => {
              const a = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/enter.mp3`);
              a.playbackRate = 1.5;
              enterAudioRef.current = a;
              a.play().catch(() => {});
            }}
            onClick={() => {
              const route = LEVEL_ROUTES[skill.id];
              if (!route) return;
              const a = enterAudioRef.current;
              if (a && !a.ended) {
                a.onended = () => navigate(route);
              } else {
                navigate(route);
              }
            }}
            className="px-6 py-2.5 text-lg font-bold rounded-full transition-all hover:brightness-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isLocked ? "#f1ece1" : gold,
              border: "3px solid #fff",
              color: isLocked ? "#4a3826" : "#5b4632",
              boxShadow: isLocked ? "0 0 0 2px #d8cdbb" : "0 0 0 2px #f08a3c, 0 3px 8px rgba(244,185,66,0.5)",
            }}
          >
            {isLocked ? "尚未解鎖" : "進入關卡 →"}
          </button>

        </div>
      </div>
    </div>
  );
}
