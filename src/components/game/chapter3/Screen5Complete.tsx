"use client";

import { useEffect } from "react";

const ORANGE = "#f97316";
const BRIGHT = "#fb923c";

interface Props { onDone: () => void; }

export default function Screen5Complete({ onDone }: Props) {
  useEffect(() => {
    try { localStorage.setItem("chapter3_complete", "1"); } catch { /* ignore */ }
  }, []);

  return (
    <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
      style={{ color: "#FFE8D0" }}>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `2px solid ${ORANGE}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: ORANGE }}>▶ TASK WORKSHOP // 完成</span>
        <span className="text-xs" style={{ color: BRIGHT }}>任務完成</span>
      </div>

      <div className="w-24 h-24 flex items-center justify-center text-5xl mt-8"
        style={{ background: "rgba(0,255,136,0.1)", border: "3px solid #00FF88", boxShadow: "4px 4px 0px rgba(0,255,136,0.4)", animation: "popIn 0.4s ease", color: "#00FF88" }}>
        ✓
      </div>

      <div className="text-center w-full max-w-md px-4 py-4"
        style={{ border: "2px solid #00FF88", background: "rgba(0,255,136,0.06)", boxShadow: "4px 4px 0px rgba(0,255,136,0.4)" }}>
        <p className="text-sm font-bold tracking-widest mb-1" style={{ color: "#00FF88" }}>[ 任務完成 ]</p>
        <p className="text-xs" style={{ color: "rgba(255,232,208,0.6)" }}>任務工坊 · 8 題全部完成</p>
      </div>

      <button
        onClick={onDone}
        className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
        style={{ background: `rgba(249,115,22,0.12)`, border: `2px solid ${ORANGE}`, boxShadow: `4px 4px 0px rgba(249,115,22,0.4)`, color: ORANGE }}>
        ▶ 回到地圖
      </button>
    </div>
  );
}
