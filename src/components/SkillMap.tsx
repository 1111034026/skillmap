"use client";

import { useState, useRef, useEffect } from "react";
import { skills, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/data/skills";
import { useProgress } from "@/hooks/useProgress";
import SkillNode from "@/components/SkillNode";
import SkillPath from "@/components/SkillPath";
import InfoPanel from "@/components/InfoPanel";
import { Skill } from "@/types";
import { ALL_GAME_KEYS } from "@/data/storageKeys";
import { img } from "@/lib/imgPath";

const PANEL_BG  = "#e6dcc0";
const SKY_DEEP  = "#4fa8d8";
const SKY_SOFT  = "#bfe3f0";
const MEADOW    = "#dcf0d8";
const GOLD      = "#f4b942";
const BROWN     = "#8a7560";

export default function SkillMap() {
  const { getSkillState, markCompleted, resetProgress, completedCount, totalCount } =
    useProgress();
  const [selected, setSelected] = useState<Skill | null>(null);
  const [charPos, setCharPos] = useState({ x: skills[0].x + 100, y: skills[0].y });

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
    <div className="skillmap-ui flex flex-col h-svh" style={{ background: `linear-gradient(180deg, ${SKY_DEEP} 0%, ${SKY_SOFT} 35%, ${MEADOW} 100%)`, color: "#5b4632" }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 mx-4 mt-3 rounded-2xl"
        style={{ border: `3px solid ${GOLD}`, background: PANEL_BG, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <img src={img("/img/logo2.png")} alt="" draggable={false} className="h-10 w-auto" />
          <img src={img("/img/logo.png")} alt="AI 探險學院" draggable={false} className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-3 rounded-full px-4 py-2"
          style={{ background: "#fff3da", border: `1px solid ${GOLD}` }}>
          <div className="hidden sm:flex items-center gap-2">
            <span>⭐</span>
            <span className="text-sm" style={{ color: BROWN }}>進度</span>
            <span className="text-sm font-bold" style={{ color: "#5b4632" }}>{completedCount}/{totalCount}</span>
          </div>
          <div className="hidden sm:block w-px h-5" style={{ background: "#e8d5b8" }} />
          <button
            onClick={() => {
              if (confirm("確定要重置所有進度嗎？")) {
                resetProgress();
                ALL_GAME_KEYS.forEach(k => localStorage.removeItem(k));
              }
            }}
            className="text-sm font-bold px-3 py-1 rounded-full transition-all hover:brightness-95 active:scale-95"
            style={{ background: GOLD, color: "#fff" }}
          >
            重置
          </button>
        </div>
      </header>

      {/* ── 中間內容區：flex-1 min-h-0，永遠填滿 header 和 footer 之間的空間 ── */}
      <div className="flex-1 min-h-0 flex flex-col">

        {/* 地圖區：佔上半部 50vh */}
        <div className="flex-shrink-0 mx-4 mt-3" style={{ height: "50vh" }}>
          <div ref={mapWrapRef} className="rounded-2xl" style={{
            position: "relative", width: "100%", height: "100%", overflow: "hidden",
            border: `2px solid ${GOLD}`, boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            {/* 固定邏輯尺寸的地圖內容，用 transform scale 等比縮放 */}
            <div style={{
              position: "absolute", top: 0, left: "50%",
              width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
              transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center",
            }}>
              <img src={img("/img/mapBK.png")} alt="" draggable={false}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover", pointerEvents: "none" }} />
              <SkillPath getSkillState={getSkillState} />
              {skills.map(skill => (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  state={getSkillState(skill.id)}
                  onClick={() => {
                    setSelected(selected?.id === skill.id ? null : skill);
                    setCharPos({ x: skill.x + 100, y: skill.y });
                  }}
                  isSelected={selected?.id === skill.id}
                />
              ))}
              <img
                src={img("/img/front_sprite.png")}
                alt=""
                draggable={false}
                className="absolute"
                style={{
                  left: charPos.x, top: charPos.y,
                  width: 70, height: "auto",
                  transform: "translate(-50%, -50%)",
                  transition: "left 0.6s ease, top 0.6s ease",
                  zIndex: 12, imageRendering: "auto", pointerEvents: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* InfoPanel：佔剩餘 55%，min-h-0 防止 flex overflow */}
        <div className="flex-1 min-h-0 overflow-hidden mx-4 mt-3 mb-3 rounded-2xl"
          style={{ background: PANEL_BG, border: `2px solid ${GOLD}`, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <InfoPanel
            skill={selected}
            state={selected ? getSkillState(selected.id) : null}
            onComplete={markCompleted}
          />
        </div>

      </div>

    </div>
  );
}
