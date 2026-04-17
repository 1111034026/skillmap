"use client";
import { navigate } from "@/lib/navigate";

import { img } from "@/lib/imgPath";

interface Props {
  onStart: () => void;
}

export default function Screen1Mission({ onStart }: Props) {

  return (
    <div className="flex flex-col h-svh relative" style={{ background: "#0c1a2e" }}>
      {/* Scene */}
      <div className="flex-1 relative overflow-hidden flex items-end justify-center pb-4">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Bulletin board */}
        <div className="absolute" style={{ left: "12%", top: "15%", width: 160, height: 140 }}>
          <img src={img("/img/bulletin_board.png")} alt="公告板" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
        </div>

        {/* NPC */}
        <div className="absolute" style={{ left: "40%", bottom: 80, width: 180, height: 180 }}>
          {/* ! indicator */}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center font-black text-lg animate-bounce"
            style={{ background: "#f59e0b", color: "#fff", border: "3px solid #92400e", boxShadow: "2px 2px 0px #000" }}
          >
            !
          </div>
          <img src={img("/img/NPC1.png")} alt="阿波" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
        </div>

        {/* Player */}
        <div className="absolute" style={{ right: "18%", bottom: 80, width: 150, height: 150 }}>
          <img src={img("/img/front_sprite.png")} alt="玩家" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
        </div>
      </div>

      {/* Dialog + buttons */}
      <div className="flex-shrink-0 px-4 pb-6 flex flex-col gap-3 max-w-xl mx-auto w-full">
        <div
          className="p-5"
          style={{
            background: "rgba(8,20,50,0.98)",
            border: "3px solid #3b82f6",
            boxShadow: "4px 4px 0px #1e3a8a",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <img src={img("/img/NPC1.png")} alt="阿波" className="w-10 h-10 object-contain"
              style={{ imageRendering: "pixelated" }} />
            <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>⚓ 船長阿波</p>
          </div>
          <p className="text-white text-sm leading-relaxed">
            歡迎來到回聲港。<br />
            智慧公告板最近怪怪的，常常亂推薦。<br />
            你願意幫我一起看看嗎？
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 font-bold text-white text-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: "#2563eb", border: "3px solid #1e3a8a", boxShadow: "4px 4px 0px #000" }}
        >
          開始任務
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 font-semibold text-sm transition-all hover:brightness-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.4)", color: "#9ca3af", boxShadow: "2px 2px 0px #000" }}
        >
          返回地圖
        </button>
      </div>
    </div>
  );
}
