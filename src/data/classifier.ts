export interface ClassifierQuestion {
  id: string;
  training: string;
  newLocation: string;
  aiResult: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  wrongFeedback: string;
}

export const CLASSIFIER_QUESTIONS: ClassifierQuestion[] = [
  {
    id: "cq1",
    training: "AI 以前學過的資料裡，很多「有屋頂的地方」都被分成「適合躲雨」。",
    newLocation: "有屋頂的碼頭邊，地上很滑。",
    aiResult: "適合躲雨",
    question: "AI 為什麼會這樣分？",
    options: [
      "因為它把有屋頂當成重要線索",
      "因為有屋頂的地方一定都安全",
      "因為它真的知道地上滑不滑",
    ],
    correctIndex: 0,
    correctFeedback: "對，它先記住了有屋頂，卻沒有注意地上很滑。",
    wrongFeedback: "再看看，這個地方是不是只有「有屋頂」很像，其他地方其實不太一樣。",
  },
  {
    id: "cq2",
    training: "AI 以前學過的資料裡，很多「人不多的地方」都被分成「安靜」。",
    newLocation: "看海區，人不多，但風聲很大。",
    aiResult: "安靜地點",
    question: "AI 最可能學到了什麼？",
    options: [
      "它把人少當成重點",
      "它真的聽見風聲很小",
      "人不多的地方一定都安靜",
    ],
    correctIndex: 0,
    correctFeedback: "沒錯。它先看見人少，卻沒看見這裡其實有很大的風聲。",
    wrongFeedback: "再想一想，AI 真正先看到的是什麼？是風聲，還是人多不多呢？",
  },
  {
    id: "cq3",
    training: "AI 以前學過的資料裡，很多「有賣生活用品的地方」都被分成「可買雨具」。",
    newLocation: "便利商店，賣很多東西，但不一定有雨傘。",
    aiResult: "可買雨具",
    question: "AI 為什麼會這樣分？",
    options: [
      "因為它把生活用品很多當成重要線索",
      "因為便利商店一定有雨傘",
      "因為它真的看見架上有雨傘",
    ],
    correctIndex: 0,
    correctFeedback: "對。它看見這裡常常有各種用品，就先猜可能買得到雨具。",
    wrongFeedback: "再看看，它是真的看見雨傘，還是只是先猜這裡可能會有呢？",
  },
  {
    id: "cq4",
    training: "AI 以前學過的資料裡，很多「看得到海的地方」都被分成「適合看海鷗」。",
    newLocation: "禁止進入區，很靠近海邊，但有危險。",
    aiResult: "適合看海鷗",
    question: "AI 學錯了什麼？",
    options: [
      "它把看得到海當成重點",
      "它真的知道那裡很安全",
      "靠近海的地方一定最好",
    ],
    correctIndex: 0,
    correctFeedback: "沒錯。它先學到「看得到海」，卻沒有學會先看危不危險。",
    wrongFeedback: "再想一想，這個地方是因為安全才被分進去，還是因為靠海很近才被分進去呢？",
  },
];
