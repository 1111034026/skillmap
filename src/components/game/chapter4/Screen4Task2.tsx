"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDialogReady } from "@/hooks/useDialogReady";
import { APPLE_CARDS, BANANA_CARDS, FoodCard } from "@/data/chapter4";
import { MiaPortrait } from "./MiaPortrait";
import { img } from "@/lib/imgPath";

const GREEN  = "#22c55e";
const BRIGHT = "#4ade80";
const BG     = "#041208";

const ALL_FRUITS = [...APPLE_CARDS, ...BANANA_CARDS];

const MIA_INTRO   = ["現在我們來教它認識香蕉。", "這樣它就知道，不是所有東西都是蘋果。"];
const MIA_PLACING = ["很好，它正在記住香蕉的樣子。", "再多給它看幾張，它會學得更穩。"];
const MIA_DONE    = "很好。現在它不只看過蘋果，也看過香蕉了。";
const MIA_WRONG   = "這是蘋果，不是香蕉。現在要讓機器學習香蕉，請放入香蕉圖片。";

interface Props { onDone: () => void; }

export default function Screen4Task2({ onDone }: Props) {
  const [phase,    setPhase]    = useState<"intro" | "train">("intro");
  const [introIdx, setIntroIdx] = useState(0);
  const [fruits,   setFruits]   = useState<FoodCard[]>(ALL_FRUITS);
  const [placed,   setPlaced]   = useState<FoodCard[]>([]);
  const [msg,      setMsg]      = useState<string | null>(null);
  const [isDone,   setIsDone]   = useState(false);
  const [hovering, setHovering] = useState(false);
  const dragging = useRef<FoodCard | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playVoice = useCallback((text: string) => {
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/chapter-4gamevoice/${encodeURIComponent(text)}.mp3`);
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  const handleDrop = () => {
    const food = dragging.current;
    dragging.current = null;
    if (!food || isDone) return;
    if (food.type !== "banana") {
      new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/error.mp3`).play().catch(() => {});
      setMsg(MIA_WRONG);
      return;
    }
    new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/put in.mp3`).play().catch(() => {});
    if (placed.some(p => p.id === food.id)) return;
    const next = [...placed, food];
    setPlaced(next);
    if (next.length < BANANA_CARDS.length) {
      setMsg(MIA_PLACING[next.length - 1] ?? MIA_PLACING[MIA_PLACING.length - 1]);
    } else {
      setIsDone(true);
      setMsg(MIA_DONE);
    }
  };

  const { ready: introReady } = useDialogReady(introIdx, phase === "intro");
  const { ready: trainReady } = useDialogReady(msg ?? "", phase === "train" && msg !== null);

  const advanceIntro = () => {
    if (!introReady) return;
    if (introIdx < MIA_INTRO.length - 1) { setIntroIdx(introIdx + 1); return; }
    setPhase("train");
  };

  const advance = () => {
    if (phase === "intro") { advanceIntro(); return; }
    if (msg !== null && !trainReady) return;
    if (!isDone) { setMsg(null); return; }
    onDone();
  };

  useEffect(() => {
    setFruits(f => [...f].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (phase === "intro") playVoice(MIA_INTRO[introIdx]);
    if (phase === "train") playVoice("把香蕉圖片放進機器，讓機器學習香蕉的樣子");
  }, [phase, introIdx, playVoice]);

  useEffect(() => {
    if (phase === "train" && msg !== null) playVoice(msg);
  }, [msg, playVoice]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "e" || e.key === "E") advance(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col h-svh relative" style={{ background: BG, color: "#dcfce7" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: `2px solid ${GREEN}`, background: "rgba(0,0,0,0.6)" }}>
        <span className="text-xs tracking-widest" style={{ color: GREEN }}>▶ SMART ZOO // 任務 3：教它認得香蕉</span>
        {phase === "train" && (
          <span className="text-xs font-bold px-3 py-1"
            style={{ color: GREEN, border: `1px solid ${GREEN}`, background: `${GREEN}11`, letterSpacing: "0.15em" }}>
            {placed.length} / {BANANA_CARDS.length}
          </span>
        )}
      </div>

      {phase === "train" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8" style={{ paddingBottom: "160px" }}>
          <p className="text-sm tracking-wide text-center" style={{ color: `${GREEN}88` }}>
            把香蕉圖片放進機器，讓機器學習香蕉的樣子
          </p>

          <div style={{ padding: "8px 24px", border: `1px solid ${GREEN}44`,
                        background: `${GREEN}08`, color: `${GREEN}88`, fontSize: "0.75rem", letterSpacing: "0.15em" }}>
            {placed.length === 0 ? "等待學習中…" :
             placed.length < BANANA_CARDS.length ? "正在學習…" : "已記住新例子 ✓"}
          </div>

          {/* All 6 fruits — 3x2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {fruits.map(food => {
              const isPlaced = placed.some(p => p.id === food.id);
              return (
                <div key={food.id} draggable={!isPlaced && !isDone}
                  onDragStart={() => { if (!isPlaced && !isDone) { dragging.current = food; new Audio(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Voice/sound effects/drag.mp3`).play().catch(() => {}); } }}
                  onDragEnd={() => { dragging.current = null; }}
                  style={{
                    cursor: isPlaced ? "default" : isDone ? "default" : "grab",
                    padding: "12px 16px",
                    background: isPlaced ? `${GREEN}22` : `${GREEN}0a`,
                    border: `2px solid ${isPlaced ? GREEN : GREEN + "44"}`,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    userSelect: "none", transition: "transform 0.15s, opacity 0.2s",
                    opacity: isPlaced ? 0.45 : 1,
                  }}
                  onMouseEnter={e => { if (!isPlaced && !isDone) e.currentTarget.style.transform = "scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                  <img src={food.img} alt={food.name} draggable={false}
                    style={{ width: 56, height: 56, objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
              );
            })}
          </div>

          {/* Placed items — horizontal row above robot */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 56 }}>
            <span style={{ fontSize: "0.65rem", color: `${GREEN}88`, letterSpacing: "0.1em", marginRight: 4 }}>已放入</span>
            {placed.map(food => (
              <div key={food.id} style={{
                width: 48, height: 48,
                border: `1px solid ${GREEN}66`,
                background: `${GREEN}11`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "fadeUp 0.2s ease",
              }}>
                <img src={food.img} alt={food.name} draggable={false}
                  style={{ width: 34, height: 34, objectFit: "contain", imageRendering: "pixelated" }} />
              </div>
            ))}
          </div>

          {/* Classification robot drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setHovering(true); }}
            onDragLeave={() => setHovering(false)}
            onDrop={e => { e.preventDefault(); setHovering(false); handleDrop(); }}
            style={{
              position: "relative", cursor: "default", transition: "all 0.2s",
              filter: hovering ? `brightness(1.3) drop-shadow(0 0 12px ${GREEN})` : isDone ? `drop-shadow(0 0 8px ${GREEN})` : "brightness(1)",
              transform: hovering ? "scale(1.05)" : "scale(1)",
            }}>
            <img src={img("/img/Classification robot.png")} alt="食物分類機" draggable={false}
              style={{ width: 280, height: "auto", imageRendering: "pixelated", display: "block" }} />
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="flex-1 flex items-center justify-center">
          <img src={img("/img/Classification robot.png")} alt="" draggable={false}
            style={{ width: 280, height: "auto", imageRendering: "pixelated" }} />
        </div>
      )}

      {(phase === "intro" || msg) && (
        <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }} onClick={advance}>
          <div className="relative max-w-6xl mx-auto" style={{ cursor: "pointer" }}>
            <MiaPortrait />
            <div className="w-full px-8 py-6 relative dialog-panel"
              style={{ background: "rgba(4,18,8,0.97)", borderTop: `3px solid ${GREEN}`, minHeight: 150 }}>
              <p key={phase === "intro" ? introIdx : msg}
                className="text-white text-lg leading-relaxed dialog-text whitespace-pre-line"
                style={{ animation: "fadeUp 0.2s ease" }}>
                {phase === "intro" ? MIA_INTRO[introIdx] : msg}
              </p>
              <span className="text-xs absolute bottom-3 right-4"
                style={{ color: (phase === "intro" ? introReady : trainReady) ? "#9ca3af" : "#1f2937", transition: "color 0.5s" }}>
                {isDone ? "點擊或按 E 繼續 ▶" : "點擊繼續"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
