"use client";
import { navigate } from "@/lib/navigate";

import { useState, useEffect } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { MiaPortrait } from "./MiaPortrait";

const GREEN  = "#22c55e";
const BRIGHT = "#4ade80";

const MIA_OUTRO = [
  "你做得很好。",
  "今天你不是在修一台機器，你是在教它怎麼學。",
  "你先教它認得蘋果，後來又教它認得香蕉。",
  "所以它慢慢學會了，哪些食物該送去豬那邊，哪些食物該送去猴子那邊。",
  "記住喔，機器不是自己懂。你怎麼教，它就怎麼學。",
];

interface Props { onDone: () => void; }

export default function Screen6Complete({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [dialogDone, setDialogDone] = useState(false);

  const { ready } = useDialogReady(idx, !dialogDone);

  const advance = () => {
    if (dialogDone || !ready) return;
    if (idx < MIA_OUTRO.length - 1) { setIdx(idx + 1); return; }
    setDialogDone(true);
  };

  useEffect(() => {
    if (dialogDone) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "e" || e.key === "E") advance(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
      style={{ color: "#dcfce7" }}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: GREEN }}>▶ SMART ZOO // 完成</span>
        <span className="text-xs" style={{ color: BRIGHT }}>任務完成</span>
      </div>

      <div className="w-24 h-24 flex items-center justify-center text-5xl mt-8"
        style={{ background: "rgba(74,222,128,0.1)", border: `3px solid ${BRIGHT}`,
                 boxShadow: `4px 4px 0px rgba(74,222,128,0.4)`, animation: "popIn 0.4s ease", color: BRIGHT }}>
        ✓
      </div>

      <div className="text-center w-full max-w-md px-4 py-4"
        style={{ border: `2px solid ${BRIGHT}`, background: "rgba(74,222,128,0.06)",
                 boxShadow: `4px 4px 0px rgba(74,222,128,0.4)` }}>
        <p className="text-sm font-bold tracking-widest mb-1" style={{ color: BRIGHT }}>[ 任務完成 ]</p>
        <p className="text-xs" style={{ color: "rgba(220,252,231,0.6)" }}>
          智能動物園 · 獲得 <span style={{ color: BRIGHT, fontWeight: "bold" }}>智慧樹徽章</span>
        </p>
      </div>

      {dialogDone && (
        <>
          <button onClick={onDone}
            className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
            style={{ background: `rgba(34,197,94,0.12)`, border: `2px solid ${GREEN}`,
                     boxShadow: `4px 4px 0px rgba(34,197,94,0.4)`, color: GREEN,
                     animation: "fadeUp 0.3s ease" }}>
            ▶ 回到智能動物園
          </button>
          <button onClick={() => navigate("/")}
            className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
            style={{ background: `rgba(34,197,94,0.06)`, border: `2px solid ${GREEN}55`,
                     color: `${GREEN}99`, animation: "fadeUp 0.3s ease" }}>
            返回地圖
          </button>
        </>
      )}

      {/* Mia dialog */}
      {!dialogDone && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advance}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <MiaPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(4,18,8,0.97)", borderTop: `3px solid ${GREEN}`,
                       boxShadow: "0 -4px 0px #052e16", minHeight: 150 }}>
              <p key={idx} className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line"
                style={{ animation: "fadeUp 0.2s ease" }}>
                {MIA_OUTRO[idx]}
              </p>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: ready ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {idx < MIA_OUTRO.length - 1 ? "點擊或按 E 繼續 ▶" : "點擊或按 E 完成 ▶"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
