export interface FoodCard {
  id: string;
  name: string;
  img: string;
  type: "apple" | "banana";
}

export const APPLE_CARDS: FoodCard[] = [
  { id: "red_apple",   name: "紅蘋果", img: "/img/chapter4taskfruit/apple1.png", type: "apple" },
  { id: "green_apple", name: "青蘋果", img: "/img/chapter4taskfruit/apple2.png", type: "apple" },
  { id: "small_apple", name: "小蘋果", img: "/img/chapter4taskfruit/apple3.png", type: "apple" },
];

export const BANANA_CARDS: FoodCard[] = [
  { id: "banana",        name: "香蕉",   img: "/img/chapter4taskfruit/banana1.png", type: "banana" },
  { id: "small_banana",  name: "小香蕉", img: "/img/chapter4taskfruit/banana2.png", type: "banana" },
  { id: "curved_banana", name: "彎香蕉", img: "/img/chapter4taskfruit/banana3.png", type: "banana" },
];

export type MachineGuess = "apple" | "banana";

export interface TestItem {
  food: FoodCard;
  round1Guess: MachineGuess;
  round2Guess: MachineGuess;
  round1Correct: boolean;
  round2Correct: boolean;
  mia1: string;
  mia2: string;
}

export const TEST_ITEMS: TestItem[] = [
  {
    food: { id: "test_apple",  name: "蘋果", img: "/img/chapter4taskfruit/apple1.png", type: "apple" },
    round1Guess: "apple", round1Correct: true,
    round2Guess: "apple", round2Correct: true,
    mia1: "這次分對了。因為它剛剛真的有學過蘋果。",
    mia2: "很好，蘋果分對了。",
  },
  {
    food: { id: "test_banana", name: "香蕉", img: "/img/chapter4taskfruit/banana1.png", type: "banana" },
    round1Guess: "apple", round1Correct: false,
    round2Guess: "banana", round2Correct: true,
    mia1: "你看，它把香蕉也分析成蘋果了。不是它故意亂猜，而是它目前只學過蘋果。如果你只給它看一種，它就只會一直往那一種去想。",
    mia2: "你看，它這次也把香蕉分對了。因為你教了它蘋果和香蕉，它就不會再把所有東西都分析成蘋果。",
  },
];
