"use client";
import { img } from "@/lib/imgPath";

interface Props {
  message: string;
  onNext: () => void;
  isLast: boolean;
}

const ORANGE = "#00AAFF";
const GREEN = "#00FF88";

export default function Screen4Correct({ message, onNext, isLast }: Props) {
  return (
    <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
      style={{ color: "#D0EEFF" }}>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: ORANGE }}>▶ ECHO PORT // 結果</span>
        <span className="text-xs" style={{ color: GREEN }}>狀態：答對</span>
      </div>

      <div className="w-24 h-24 flex items-center justify-center text-5xl font-bold mt-8"
        style={{ background: "rgba(0,255,136,0.1)", border: `3px solid ${GREEN}`, boxShadow: `4px 4px 0px rgba(0,255,136,0.4)`, color: GREEN, animation: "popIn 0.3s ease" }}>
        ✓
      </div>

      <div className="text-center px-4 py-3 w-full max-w-md"
        style={{ border: `1px solid rgba(0,255,136,0.4)`, background: "rgba(0,255,136,0.05)" }}>
        <p className="text-sm font-bold tracking-widest mb-1" style={{ color: GREEN }}>[ 答對了 ]</p>
      </div>

      <button onClick={onNext} className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
        style={{ background: "rgba(0,255,136,0.1)", border: `2px solid ${GREEN}`, boxShadow: `4px 4px 0px rgba(0,255,136,0.4)`, color: GREEN }}>
        {isLast ? "▶ 完成關卡" : "▶ 下一題"}
      </button>

      {/* NPC dialog — fixed to bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="relative max-w-6xl mx-auto">
          <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={img("/img/NPC1half.png")} alt="阿波"
              style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom", imageRendering: "pixelated", display: "block" }} />
            <div className="w-full text-center px-4 py-1 text-xs font-bold"
              style={{ background: "#1e3a8a", border: "2px solid #3b82f6", color: "#93c5fd" }}>
              ⚓ 船長阿波
            </div>
          </div>
          <div className="w-full px-8 py-6 dialog-panel"
            style={{ background: "rgba(8,20,50,0.97)", borderTop: "3px solid #3b82f6", boxShadow: "0 -4px 0px #1e3a8a", minHeight: 130 }}>
            <p className="text-white text-lg leading-relaxed dialog-text">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
