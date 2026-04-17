"use client";
import { navigate } from "@/lib/navigate";

import { C2Element, C2Theme, StageResult } from "@/data/chapter2";

const GREEN = "#16a34a";
const BRIGHT = "#4ade80";

interface Props {
  theme: C2Theme;
  background: C2Element;
  character: C2Element;
  prop: C2Element;
  stageResult: StageResult;
}

const PREVIEW_W = 672; // max-w-2xl in px
const PREVIEW_H = 320;

export default function Screen4Complete({ theme, background, character, prop, stageResult }: Props) {
  const { items: stageItems, stageW, stageH } = stageResult;
  const scaleX = PREVIEW_W / stageW;
  const scaleY = PREVIEW_H / stageH;
  const scale  = Math.min(scaleX, scaleY);

  return (
    <div className="flex flex-col h-svh items-center justify-center gap-8 px-6 relative"
      style={{ background: "#0a150a", color: "#d1fae5" }}>
      <style>{`
        @keyframes popIn { 0% { transform:scale(0); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.4)" }}>
        <span className="text-sm tracking-widest font-bold" style={{ color: GREEN }}>▶ INSPIRATION FOREST // 作品完成</span>
        <span className="text-xs" style={{ color: BRIGHT }}>完成！</span>
      </div>

      {/* Work title */}
      <div className="text-center" style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
        <p className="text-xs tracking-widest mb-2" style={{ color: "rgba(74,222,128,0.5)" }}>你的舞台佈景</p>
        <p className="text-2xl font-bold" style={{ color: "#86efac" }}>
          {theme.emoji} {background.name}裡的{character.name}
        </p>
      </div>

      {/* Stage preview — actual user composition */}
      <div className="relative w-full max-w-2xl overflow-hidden"
        style={{
          border: `3px solid ${theme.color}`,
          boxShadow: `6px 6px 0px ${theme.color}44, 0 0 40px ${BRIGHT}22`,
          height: 320,
          animation: "fadeUp 0.4s ease 0.3s both",
          background: "rgba(5,20,5,0.6)",
        }}>
        {stageItems.map((item) => {
          const isBg = item.el.id === background.id;
          if (isBg) return (
            <div key={item.id} className="absolute inset-0" style={{ zIndex: 1 }}>
              {item.el.img
                ? <img src={item.el.img} alt={item.el.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                                 justifyContent: "center", fontSize: 180, opacity: 0.3 }}>{item.el.emoji}</span>
              }
            </div>
          );
          const sx = item.x * scaleX;
          const sy = item.y * scaleY;
          const ss = item.size * scale;
          return (
            <div key={item.id} style={{
              position: "absolute", left: sx, top: sy, zIndex: 5,
              transform: `rotate(${item.rotate}deg)`, transformOrigin: "center center",
            }}>
              {item.el.img
                ? <img src={item.el.img} alt={item.el.name}
                    style={{ width: ss, height: ss, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
                : <span style={{ fontSize: ss * 0.7, display: "block", lineHeight: 1 }}>{item.el.emoji}</span>
              }
            </div>
          );
        })}
      </div>

      {/* Element summary */}
      <div className="flex gap-3" style={{ animation: "fadeUp 0.4s ease 0.4s both" }}>
        {[
          { label: "背景", el: background },
          { label: "角色", el: character },
          { label: "道具", el: prop },
        ].map(({ label, el }) => (
          <div key={el.id} className="flex flex-col items-center gap-1 px-4 py-2 text-center"
            style={{ border: `1px solid ${GREEN}44`, background: `${GREEN}0a`, minWidth: 90 }}>
            {el.img
              ? <img src={el.img} alt={el.name} style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }} />
              : <span style={{ fontSize: 28 }}>{el.emoji}</span>
            }
            <span className="text-xs" style={{ color: "#86efac" }}>{label}</span>
            <span className="text-xs font-semibold" style={{ color: "#d1fae5" }}>{el.name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          localStorage.setItem("chapter2_complete", "1");
          localStorage.setItem("chapter2_artwork", JSON.stringify({
            items: stageResult.items.map(item => ({
              id: item.id, x: item.x, y: item.y, size: item.size, rotate: item.rotate,
              el: { id: item.el.id, img: item.el.img ?? null, emoji: item.el.emoji, name: item.el.name },
            })),
            stageW: stageResult.stageW,
            stageH: stageResult.stageH,
            backgroundId: background.id,
          }));
          navigate("/level/chapter-2");
        }}
        className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
        style={{ background: `${GREEN}20`, border: `2px solid ${GREEN}`, boxShadow: `4px 4px 0px ${GREEN}44`, color: BRIGHT }}>
        ▶ 回到靈感森林
      </button>
    </div>
  );
}
