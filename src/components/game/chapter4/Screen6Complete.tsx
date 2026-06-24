"use client";
import { navigate } from "@/lib/navigate";
import { useEffect, useRef } from "react";

const GREEN  = "#22c55e";
const BRIGHT = "#4ade80";

interface Props { onDone: () => void; }

export default function Screen6Complete({ onDone }: Props) {
  const enterAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/finish.mp3`).play().catch(() => {});
  }, []);

  return (
    <div className="terminal-bg scanlines flex flex-col h-svh items-center justify-center px-4 gap-6 relative"
      style={{ color: "#dcfce7" }}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: GREEN }}>▶ SMART MART // 完成</span>
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
          訓練成功
        </p>
      </div>

      <button
        onPointerDown={() => {
          const a = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/enter.mp3`);
          a.playbackRate = 1.5;
          enterAudioRef.current = a;
          a.play().catch(() => {});
        }}
        onClick={() => {
          const a = enterAudioRef.current;
          if (a && !a.ended) { a.onended = () => onDone(); }
          else { onDone(); }
        }}
        className="w-full max-w-md py-3 font-bold text-sm tracking-widest"
        style={{ background: `rgba(34,197,94,0.12)`, border: `2px solid ${GREEN}`,
                 boxShadow: `4px 4px 0px rgba(34,197,94,0.4)`, color: GREEN }}>
        ▶ 回到智能超市
      </button>

    </div>
  );
}
