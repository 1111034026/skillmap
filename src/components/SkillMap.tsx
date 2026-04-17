"use client";

import { useState, useRef, useEffect } from "react";
import { skills, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/data/skills";
import { useProgress } from "@/hooks/useProgress";
import SkillNode from "@/components/SkillNode";
import SkillPath from "@/components/SkillPath";
import InfoPanel from "@/components/InfoPanel";
import { Skill } from "@/types";
import { ALL_GAME_KEYS } from "@/data/storageKeys";

export default function SkillMap() {
  const { getSkillState, markCompleted, resetProgress, completedCount, totalCount } =
    useProgress();
  const [selected, setSelected] = useState<Skill | null>(null);

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el) return;
    const update = () => {
      setScale(Math.min(
        el.clientWidth  / CANVAS_WIDTH,
        el.clientHeight / CANVAS_HEIGHT,
      ));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // h-svh flex-col：整體佔滿視窗，header/footer 自然高，中間內容填滿剩餘
    <div className="flex flex-col h-svh font-mono" style={{ background: "#080808", color: "#e85500" }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "2px solid #e85500", boxShadow: "0 2px 12px #e8550044", background: "#0a0808" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-9 h-9 text-base"
            style={{ border: "2px solid #e85500", boxShadow: "0 0 8px #e8550066", background: "#1a0a00" }}>
            ◈
          </div>
          <div>
            <div className="text-lg font-bold tracking-widest" style={{ color: "#e85500", letterSpacing: "0.15em" }}>
              AI 探險學院
            </div>
            <div className="text-sm tracking-wider" style={{ color: "#e8550088" }}>SKILL MAP // ACTIVE</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm tracking-widest" style={{ color: "#e8550099" }}>PROGRESS</span>
            <div className="w-28 h-2" style={{ background: "#1a0800", border: "1px solid #e8550055" }}>
              <div className="h-full" style={{
                width: `${(completedCount / totalCount) * 100}%`,
                background: "#e85500", boxShadow: "0 0 6px #e85500",
              }} />
            </div>
            <span className="text-sm" style={{ color: "#e85500" }}>{completedCount}/{totalCount}</span>
          </div>
          <button
            onClick={() => {
              if (confirm("確定要重置所有進度嗎？")) {
                resetProgress();
                ALL_GAME_KEYS.forEach(k => localStorage.removeItem(k));
              }
            }}
            className="text-xs tracking-widest px-3 py-1 transition-all hover:brightness-125"
            style={{ border: "1px solid #e8550055", color: "#e8550077" }}
          >
            <span className="text-sm">重置</span>
          </button>
        </div>
      </header>

      {/* ── 中間內容區：flex-1 min-h-0，永遠填滿 header 和 footer 之間的空間 ── */}
      <div className="flex-1 min-h-0 flex flex-col">

        {/* 地圖區：aspect-ratio 讓高度由寬度決定，寬度直接驅動 scale */}
        <div className="flex-shrink-0" style={{ padding: "1.5vh 0" }}>
          {/* aspect-ratio 確保比例固定，maxHeight 防止過高 */}
          <div ref={mapWrapRef} style={{
            position: "relative", width: "100%", overflow: "hidden",
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            maxHeight: "40vh",
          }}>
            {/* 固定邏輯尺寸的地圖內容，用 transform scale 等比縮放 */}
            <div style={{
              position: "absolute", top: 0, left: "50%",
              width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
              transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center",
            }}>
              <div className="absolute inset-0" style={{
                background: "#0c0a08", border: "2px solid #e85500",
                boxShadow: "0 0 24px #e8550033, inset 0 0 40px #0a0400",
              }} />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage:
                  "linear-gradient(#e8550022 1px, transparent 1px), linear-gradient(90deg, #e8550022 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }} />
              <SkillPath getSkillState={getSkillState} />
              {skills.map(skill => (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  state={getSkillState(skill.id)}
                  onClick={() => setSelected(selected?.id === skill.id ? null : skill)}
                  isSelected={selected?.id === skill.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* InfoPanel：佔剩餘 55%，min-h-0 防止 flex overflow */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: "#080808" }}>
          <InfoPanel
            skill={selected}
            state={selected ? getSkillState(selected.id) : null}
            onComplete={markCompleted}
          />
        </div>

      </div>

      {/* ── Footer ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-1.5 text-xs tracking-widest"
        style={{ borderTop: "1px solid #e8550044", background: "#0a0808", color: "#e8550066" }}
      >
        <span className="text-sm">AI ACADEMY // v1.0</span>
        <span className="text-sm">{completedCount} COMPLETED // {totalCount - completedCount} REMAINING</span>
        <span className="text-sm">CLICK NODE TO SELECT</span>
      </div>

    </div>
  );
}
