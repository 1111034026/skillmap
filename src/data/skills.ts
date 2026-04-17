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
      "回聲港的 AI 公告板最近常出現怪怪的結果。玩家要先幫阿波判斷哪些結果可以接受，哪些還要再判斷，哪些要先拒絕；接著再去找阿修，了解 AI 為什麼會這樣分。\n\n核心學習：AI 給的結果不一定每次都對，要先看一看、想一想，再決定能不能接受。",
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
      "森林慶典快開始了，但舞台還沒完成。露米請玩家和 AI 設計機一起設計舞台。玩家先選主題，再挑選 AI 給的元素，最後把留下來的背景、角色、道具拼成自己的作品。\n\n核心學習：AI 可以幫忙想點子，但作品不是 AI 說了算，要自己選、改、組合。",
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
      "任務工坊裡每天都有很多事情要處理。工坊隊長托克需要玩家幫忙分派工作，判斷哪些任務適合交給 AI 助手，哪些任務應該由人來做。玩家要把輸送帶送來的任務卡分到正確的位置，像是整理、統計、檢查這類工作可以請 AI 幫忙；安慰別人、做公平判斷、表達真心感謝這類事情則比較適合由人來做。\n\n核心學習：不是每件事都要交給 AI。整理、重複、規則清楚的工作適合 AI 幫忙；需要關心、判斷與責任的事情，還是要由人來做。",
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
      "智能動物園裡開始使用一台新的食物分類機，想幫忙把食物送到不同動物的區域。豬吃蘋果，猴子吃香蕉，但機器一開始只學過蘋果，所以常常把香蕉也猜成蘋果。玩家要先教它認得蘋果，再發現它分錯；接著補進香蕉的例子，讓機器慢慢學會分辨不同食物。\n\n核心學習：AI 不是自己懂，而是照人給的例子來學。只看過一種例子時，容易分錯；補更多不同的例子後，才會分得比較準。",
    x: 1240,
    y: 120,
    prerequisites: ["chapter-3"],
    icon: "◇",
  },
];
