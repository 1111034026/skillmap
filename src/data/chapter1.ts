export interface Card {
  id: string;
  label: string;
  icon: string;
  zone: "usable" | "review" | "unsuitable";
  wrongHint: string;
}

export interface Question {
  id: string;
  situation: string;
  npcHint: string;
  correctMsg: string;
  wrongMsg: string;
  cards: Card[];
}

export const TUTORIAL_QUESTION: Question = {
  id: "tutorial",
  situation: "現在下雨了，我要去哪裡等船？",
  npcHint: "下雨天先想安全",
  correctMsg: "很好，這個地方現在比較安全",
  wrongMsg: "再想一想，這裡真的適合下雨天嗎",
  cards: [
    { id: "indoor", label: "室內等候區\n現在有開",   icon: "", zone: "usable",     wrongHint: "" },
    { id: "shed",   label: "港口休息棚\n上面有屋頂", icon: "", zone: "review",     wrongHint: "有屋頂，但還要再看看是否夠安全。" },
    { id: "dock",   label: "戶外碼頭邊\n離船最近",   icon: "", zone: "unsuitable", wrongHint: "下雨天站在戶外碼頭邊不安全。" },
  ],
};

export const QUESTIONS: Question[] = [
  TUTORIAL_QUESTION,
  {
    id: "q2",
    situation: "我想找安靜的地方看書。",
    npcHint: "想看書，要先想會不會太吵",
    correctMsg: "對，這題重點是安不安靜",
    wrongMsg: "再看看，這裡真的適合安靜看書嗎",
    cards: [
      { id: "q2_library", label: "圖書館\n很安靜",         icon: "", zone: "usable",     wrongHint: "" },
      { id: "q2_sea",     label: "看海區\n人不多但有風聲",  icon: "", zone: "review",     wrongHint: "人不多，但要看看風聲大不大，需要再判斷。" },
      { id: "q2_plaza",   label: "表演廣場\n現在很熱鬧",    icon: "", zone: "unsuitable", wrongHint: "表演廣場現在很熱鬧，不適合看書。" },
    ],
  },
  {
    id: "q4",
    situation: "我要買雨傘。",
    npcHint: "先看這個地方有沒有你要的東西",
    correctMsg: "沒錯，這個建議最符合現在的需要",
    wrongMsg: "再看看，這裡真的買得到雨具嗎",
    cards: [
      { id: "q4_umbrella", label: "雨具店\n有各式雨傘",  icon: "", zone: "usable",     wrongHint: "" },
      { id: "q4_store",    label: "便利商店\n可能有雨傘", icon: "", zone: "review",     wrongHint: "可能有，但不確定，要再判斷。" },
      { id: "q4_toy",      label: "玩具店\n賣玩具",       icon: "", zone: "unsuitable", wrongHint: "玩具店通常不賣雨傘。" },
    ],
  },
  {
    id: "q5",
    situation: "我想看清楚海鷗。",
    npcHint: "看風景也要先想安全",
    correctMsg: "對，安全比靠近更重要",
    wrongMsg: "再看看，這裡真的能安心站著嗎",
    cards: [
      { id: "q5_tower",  label: "觀景台\n看得清楚又安全", icon: "", zone: "usable",     wrongHint: "" },
      { id: "q5_rail",   label: "欄杆旁\n可以看但要小心", icon: "", zone: "review",     wrongHint: "看得到，但有一點風險，需要再判斷。" },
      { id: "q5_danger", label: "禁止進入區\n有危險",      icon: "", zone: "unsuitable", wrongHint: "禁止進入的地方不能去。" },
    ],
  },
];
