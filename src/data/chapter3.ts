export interface C3Task {
  id: string;
  title: string;
  answer: "ai" | "human" | "both";
  tokCorrect: string;
  tokWrong: string;
  tokHint?: string;
}

export const TASK1_CARDS: C3Task[] = [
  {
    id: "t1-1",
    title: "找出工具清單裡重複寫到的工具名稱",
    answer: "ai",
    tokCorrect: "沒錯，這種找重複的工作，AI 很適合。",
    tokWrong: "再想一想，這件事是不是很像在比對一樣的文字？",
  },
  {
    id: "t1-2",
    title: "數一數今天送來的工具",
    answer: "ai",
    tokCorrect: "對，數量整理得清楚，AI 很拿手。",
    tokWrong: "再看看，這件事是不是主要在數量和整理？",
  },
  {
    id: "t1-3",
    title: "把工具按照編號放進對應的抽屜",
    answer: "ai",
    tokCorrect: "很好，有規則、有位置的工作，AI 很適合。",
    tokWrong: "再想一想，這件事是不是照規則分類就能完成？",
  },
  {
    id: "t1-4",
    title: "檢查工作表，找出哪幾格還沒有填",
    answer: "ai",
    tokCorrect: "對，這種一格一格檢查的工作，AI 很方便。",
    tokWrong: "再看看，這件事是不是很像在找漏掉的地方？",
  },
  {
    id: "t1-5",
    title: "安慰做錯事的小幫手",
    answer: "human",
    tokCorrect: "沒錯，AI 雖然也能安慰，但它沒有真實的情緒。",
    tokWrong: "再想一想，機器能不能自己照顧別人的心情呢？",
  },
  {
    id: "t1-6",
    title: "判斷哪位小幫手需要先休息",
    answer: "human",
    tokCorrect: "對，這種事要靠人觀察和關心。",
    tokWrong: "再看看，這不是只看表面就知道的事。",
  },
  {
    id: "t1-7",
    title: "決定獎勵要怎麼分才公平",
    answer: "human",
    tokCorrect: "沒錯，公平這件事，還是要人來判斷。",
    tokWrong: "再想一想，這件事是不是不能只照表面規則決定？",
  },
  {
    id: "t1-8",
    title: "寫感謝卡給小幫手",
    answer: "human",
    tokCorrect: "對，真心感謝的話，還是要由人來決定。",
    tokWrong: "再想一想，這件事是不是需要真正的心意？",
  },
];

