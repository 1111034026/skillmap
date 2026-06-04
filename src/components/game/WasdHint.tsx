"use client";

import { useState, useEffect } from "react";

export default function WasdHint() {
  const [visible, setVisible] = useState(true);
  const [fading,  setFading]  = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 400);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 3000);
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey, { once: true });
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 60, pointerEvents: "auto", cursor: "pointer",
        opacity: fading ? 0 : 1, transition: "opacity 0.4s ease",
      }}
    >
      <div style={{
        background: "rgba(0,0,0,0.82)",
        border: "2px solid rgba(255,255,255,0.25)",
        padding: "24px 40px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        animation: "wasdFadeIn 0.35s ease",
      }}>
        <style>{`
          @keyframes wasdFadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        `}</style>

        {/* Key grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 38px)", gridTemplateRows: "repeat(2, 38px)", gap: 4 }}>
          {[
            { label: "W",  col: 2, row: 1 },
            { label: "A",  col: 1, row: 2 },
            { label: "S",  col: 2, row: 2 },
            { label: "D",  col: 3, row: 2 },
          ].map(({ label, col, row }) => (
            <div key={label} style={{
              gridColumn: col, gridRow: row,
              width: 38, height: 38,
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: "bold", fontSize: 14,
              boxShadow: "0 3px 0 rgba(0,0,0,0.5)",
            }}>
              {label}
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", letterSpacing: "0.05em", margin: 0 }}>
          WASD / 方向鍵 移動
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", margin: 0 }}>
          點擊或按任意鍵關閉
        </p>
      </div>
    </div>
  );
}
