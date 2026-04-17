"use client";

const GREEN = "#22c55e";

export function MiaPortrait() {
  return (
    <div style={{
      position: "absolute", bottom: "100%", right: "clamp(8px, 2.5vw, 40px)", zIndex: 2,
      pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <img src={img("/img/Miahalf.png")} alt="米亞"
        style={{ width: "clamp(80px, min(13vw, 18vh), 220px)", height: "clamp(80px, min(13vw, 18vh), 220px)", objectFit: "contain", objectPosition: "bottom",
                 imageRendering: "pixelated", display: "block" }} />
      <div className="w-full text-center px-4 py-1 text-xs font-bold"
        style={{ background: "#052e16", border: `2px solid ${GREEN}`, color: "#86efac" }}>
        🦁 動物管理員米亞
      </div>
    </div>
  );
}
