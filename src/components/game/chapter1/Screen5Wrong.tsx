"use client";

const ORANGE = "#00AAFF";
const RED = "#FF3333";
const YELLOW = "#FFB800";

interface Props {
  message: string;
  hints: string[];
  onRetry: () => void;
}

export default function Screen5Wrong({ message, hints, onRetry }: Props) {
  return (
    <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
      style={{ color: "#D0EEFF" }}>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: ORANGE }}>▶ ECHO PORT // 結果</span>
        <span className="text-xs" style={{ color: RED }}>狀態：答錯</span>
      </div>

      <div className="w-20 h-20 flex items-center justify-center text-4xl font-bold mt-8"
        style={{ background: "rgba(255,51,51,0.1)", border: `3px solid ${RED}`, boxShadow: `4px 4px 0px rgba(255,51,51,0.4)`, color: RED, animation: "popIn 0.3s ease" }}>
        ✗
      </div>

      <div className="text-center px-4 py-3 w-full max-w-md"
        style={{ border: `1px solid rgba(255,51,51,0.4)`, background: "rgba(255,51,51,0.05)" }}>
        <p className="text-sm font-bold tracking-widest mb-1" style={{ color: RED }}>[ 再想想 ]</p>
      </div>

      {hints.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-2">
          <p className="text-xs tracking-widest" style={{ color: "rgba(0,170,255,0.5)" }}>// 提示：</p>
          {hints.map((hint, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3"
              style={{ background: "rgba(255,184,0,0.06)", border: `1px solid rgba(255,184,0,0.4)` }}>
              <span style={{ color: YELLOW, flexShrink: 0 }}>▷</span>
              <span className="text-xs leading-relaxed" style={{ color: "#D0EEFF" }}>{hint}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onRetry} className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
        style={{ background: "rgba(0,170,255,0.12)", border: `2px solid ${ORANGE}`, boxShadow: `4px 4px 0px rgba(0,170,255,0.4)`, color: ORANGE }}>
        ▶ 重新作答
      </button>

      {/* NPC dialog — fixed to bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="relative max-w-6xl mx-auto">
          <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/img/NPC1half.png" alt="阿波"
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
