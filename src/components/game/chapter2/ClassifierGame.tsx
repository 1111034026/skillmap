"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLASSIFIER_QUESTIONS } from "@/data/classifier";
import { img } from "@/lib/imgPath";

type Screen = "game" | "correct" | "wrong" | "complete";

const BLUE = "#00AAFF";
const GREEN = "#00FF88";
const RED = "#FF3333";
const YELLOW = "#FFB800";

const NPC = () => (
  <div style={{ position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <img src={img("/img/Maintenance workerhalf.png")} alt="阿修"
      style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom", imageRendering: "pixelated", display: "block" }} />
    <div className="w-full text-center px-4 py-1 text-xs font-bold"
      style={{ background: "#1e3a8a", border: "2px solid #3b82f6", color: "#93c5fd" }}>
      🔧 阿修
    </div>
  </div>
);

export default function ClassifierGame() {
  const router = useRouter();
  const [qIndex, setQIndex] = useState(0);
  const [screen, setScreen] = useState<Screen>("game");

  const total = CLASSIFIER_QUESTIONS.length;
  const q = CLASSIFIER_QUESTIONS[qIndex];
  const isLast = qIndex + 1 >= total;

  const handleSelect = (i: number) => {
    if (i === q.correctIndex) {
      setScreen("correct");
    } else {
      setScreen("wrong");
    }
  };

  const handleNext = () => {
    if (isLast) {
      setScreen("complete");
    } else {
      setQIndex((n) => n + 1);
      setScreen("game");
    }
  };

  const handleRetry = () => setScreen("game");

  /* ── Correct screen ── */
  if (screen === "correct") {
    return (
      <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
        style={{ color: "#D0EEFF" }}>
        <style>{ANIM}</style>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `2px solid ${BLUE}`, background: "rgba(0,0,0,0.6)" }}>
          <span className="text-xs tracking-widest" style={{ color: BLUE }}>▶ 分類機任務 // 結果</span>
          <span className="text-xs" style={{ color: GREEN }}>狀態：答對</span>
        </div>

        <div className="w-24 h-24 flex items-center justify-center text-5xl font-bold mt-8"
          style={{ background: "rgba(0,255,136,0.1)", border: `3px solid ${GREEN}`, boxShadow: `4px 4px 0px rgba(0,255,136,0.4)`, color: GREEN, animation: "popIn 0.3s ease" }}>
          ✓
        </div>

        <div className="text-center px-4 py-3 w-full max-w-md"
          style={{ border: `1px solid rgba(0,255,136,0.4)`, background: "rgba(0,255,136,0.05)" }}>
          <p className="text-sm font-bold tracking-widest" style={{ color: GREEN }}>[ 答對了 ]</p>
        </div>

        <button onClick={handleNext} className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
          style={{ background: "rgba(0,255,136,0.1)", border: `2px solid ${GREEN}`, boxShadow: `4px 4px 0px rgba(0,255,136,0.4)`, color: GREEN }}>
          {isLast ? "▶ 完成任務" : "▶ 下一題"}
        </button>

        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
          <div className="relative max-w-6xl mx-auto">
            <NPC />
            <div className="w-full px-8 py-6 dialog-panel"
              style={{ background: "rgba(8,20,50,0.97)", borderTop: "3px solid #3b82f6", boxShadow: "0 -4px 0px #1e3a8a", minHeight: 130 }}>
              <p className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line">{q.correctFeedback}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Wrong screen ── */
  if (screen === "wrong") {
    return (
      <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
        style={{ color: "#D0EEFF" }}>
        <style>{ANIM}</style>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `2px solid ${BLUE}`, background: "rgba(0,0,0,0.6)" }}>
          <span className="text-xs tracking-widest" style={{ color: BLUE }}>▶ 分類機任務 // 結果</span>
          <span className="text-xs" style={{ color: RED }}>狀態：答錯</span>
        </div>

        <div className="w-20 h-20 flex items-center justify-center text-4xl font-bold mt-8"
          style={{ background: "rgba(255,51,51,0.1)", border: `3px solid ${RED}`, boxShadow: `4px 4px 0px rgba(255,51,51,0.4)`, color: RED, animation: "popIn 0.3s ease" }}>
          ✗
        </div>

        <div className="text-center px-4 py-3 w-full max-w-md"
          style={{ border: `1px solid rgba(255,51,51,0.4)`, background: "rgba(255,51,51,0.05)" }}>
          <p className="text-sm font-bold tracking-widest" style={{ color: RED }}>[ 再想想 ]</p>
        </div>

        <button onClick={handleRetry} className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
          style={{ background: "rgba(0,170,255,0.12)", border: `2px solid ${BLUE}`, boxShadow: `4px 4px 0px rgba(0,170,255,0.4)`, color: BLUE }}>
          ▶ 重新作答
        </button>

        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
          <div className="relative max-w-6xl mx-auto">
            <NPC />
            <div className="w-full px-8 py-6 dialog-panel"
              style={{ background: "rgba(8,20,50,0.97)", borderTop: "3px solid #3b82f6", boxShadow: "0 -4px 0px #1e3a8a", minHeight: 130 }}>
              <p className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line">{q.wrongFeedback}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Complete screen ── */
  if (screen === "complete") {
    return (
      <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
        style={{ color: "#D0EEFF" }}>
        <style>{ANIM}</style>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `2px solid ${BLUE}`, background: "rgba(0,0,0,0.6)" }}>
          <span className="text-xs tracking-widest" style={{ color: BLUE }}>▶ 分類機任務 // 完成</span>
          <span className="text-xs" style={{ color: GREEN }}>任務完成</span>
        </div>

        <div className="w-24 h-24 flex items-center justify-center text-5xl mt-8"
          style={{ background: "rgba(0,255,136,0.1)", border: `3px solid ${GREEN}`, boxShadow: `4px 4px 0px rgba(0,255,136,0.4)`, animation: "popIn 0.4s ease" }}>
          ✓
        </div>

        <div className="text-center w-full max-w-md px-4 py-4"
          style={{ border: `2px solid ${GREEN}`, background: "rgba(0,255,136,0.06)", boxShadow: `4px 4px 0px rgba(0,255,136,0.4)` }}>
          <p className="text-sm font-bold tracking-widest mb-1" style={{ color: GREEN }}>[ 分類機任務完成 ]</p>
          <p className="text-xs" style={{ color: "rgba(208,238,255,0.6)" }}>回聲港 · {total} 題全部完成</p>
        </div>

        <button onClick={() => {
            localStorage.setItem("classifier_complete", "1");
            router.push("/level/chapter-1");
          }}
          className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
          style={{ background: "rgba(0,170,255,0.12)", border: `2px solid ${BLUE}`, boxShadow: `4px 4px 0px rgba(0,170,255,0.4)`, color: BLUE }}>
          ▶ 回到回聲港
        </button>

        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
          <div className="relative max-w-6xl mx-auto">
            <NPC />
            <div className="w-full px-8 py-6 dialog-panel"
              style={{ background: "rgba(8,20,50,0.97)", borderTop: "3px solid #3b82f6", boxShadow: "0 -4px 0px #1e3a8a", minHeight: 130 }}>
              <p className="text-white text-lg leading-relaxed dialog-text">
                你搞懂了。AI 並不是真的「懂」這些地方，它只是從過去學到的資料裡，找出最像的線索來做決定。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Game screen ── */
  return (
    <div className="terminal-bg scanlines flex flex-col h-svh relative" style={{ color: "#D0EEFF" }}>
      <style>{ANIM}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${BLUE}`, background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs tracking-widest" style={{ color: BLUE }}>▶ 分類機任務 //</span>
          <span className="text-xs" style={{ color: "rgba(0,170,255,0.6)" }}>CLASSIFIER MODE</span>
        </div>
        <span className="text-xs font-bold tracking-widest"
          style={{ color: BLUE, border: `1px solid rgba(0,170,255,0.3)`, padding: "2px 8px" }}>
          {String(qIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 gap-5 overflow-auto" style={{ paddingTop: 40, paddingBottom: 20 }}>

        {/* 3 info panels */}
        <div className="w-full max-w-3xl flex flex-col gap-3">
          {/* Row 1: AI training data */}
          {[{ label: "AI 以前學過的資料", body: q.training, color: "rgba(0,170,255,0.6)" }].map(({ label, body, color }) => (
            <div key={label}
              style={{ border: `2px solid ${color}44`, background: "rgba(0,170,255,0.04)", display: "flex", flexDirection: "column" }}>
              <div className="px-3 py-1.5 text-xs font-bold tracking-widest"
                style={{ borderBottom: `1px solid ${color}44`, background: `${color}11`, color }}>
                {label}
              </div>
              <div className="px-4 py-4 text-sm leading-relaxed" style={{ color: "#D0EEFF" }}>
                {body}
              </div>
            </div>
          ))}
          {/* Row 2: new location + AI result */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "新地點",    body: q.newLocation, color: YELLOW },
              { label: "AI 分出的結果", body: q.aiResult,    color: RED },
            ].map(({ label, body, color }) => (
              <div key={label}
                style={{ border: `2px solid ${color}44`, background: "rgba(0,170,255,0.04)", display: "flex", flexDirection: "column" }}>
                <div className="px-3 py-1.5 text-xs font-bold tracking-widest"
                  style={{ borderBottom: `1px solid ${color}44`, background: `${color}11`, color }}>
                  {label}
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed flex-1 flex items-center" style={{ color: "#D0EEFF" }}>
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="w-full max-w-3xl px-5 py-4 text-center"
          style={{ border: `2px solid ${BLUE}`, background: "rgba(0,170,255,0.06)", boxShadow: `4px 4px 0px rgba(0,170,255,0.3)` }}>
          <p className="text-base font-bold" style={{ color: BLUE }}>{q.question}</p>
        </div>

        {/* Options */}
        <div className="w-full max-w-3xl flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <button key={i}
              onClick={() => handleSelect(i)}
              className="w-full px-5 py-4 text-left text-sm font-medium tracking-wide transition-all hover:brightness-125"
              style={{
                border: `2px solid rgba(0,170,255,0.35)`,
                background: "rgba(0,170,255,0.04)",
                color: "#D0EEFF",
                cursor: "pointer",
              }}>
              {String.fromCharCode(65 + i)}．{opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const ANIM = `
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
`;
