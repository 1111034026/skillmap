import { Skill } from "@/types";

// 畫布大小：1400 x 850 px
// 調整 x, y 來移動節點位置

// 虛擬座標空間（節點 x/y 以此為基準）
export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 320;

export const skills: Skill[] = [
  {
    id: "chapter-1",
    title: "回聲港",
    description: "Engaging with AI",
    detail:
      "核心學習：AI 給的結果不一定都對，要先看一看、想一想，再判斷能不能用。",
    x: 160,
    y: 160,
    prerequisites: [],
    icon: "◎",
  },
  {
    id: "chapter-2",
    title: "靈感森林",
    description: "Creating with AI",
    detail:
      "核心學習：AI 可以幫你想點子，但最後怎麼做，還是要由你自己決定。",
    x: 510,
    y: 80,
    prerequisites: ["chapter-1"],
    icon: "◆",
  },
  {
    id: "chapter-3",
    title: "任務工坊",
    description: "Managing with AI",
    detail:
      "核心學習：不是每件事都要交給 AI，要先想一想哪些事適合 AI 幫忙。",
    x: 890,
    y: 240,
    prerequisites: ["chapter-2"],
    icon: "◉",
  },
  {
    id: "chapter-4",
    title: "智能動物園",
    description: "Designing with AI",
    detail:
      "核心學習：AI 不是自己懂，是照你給它看的例子來學的。",
    x: 1240,
    y: 120,
    prerequisites: ["chapter-3"],
    icon: "◇",
  },
];
