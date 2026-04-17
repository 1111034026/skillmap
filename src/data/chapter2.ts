export interface StageItem {
  id: string;
  el: C2Element;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

export interface StageResult {
  items: StageItem[];
  stageW: number;
  stageH: number;
}

export interface C2Element {
  id: string;
  name: string;
  emoji: string;
  img?: string;
}

export interface C2Theme {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  backgrounds: C2Element[];
  characters: C2Element[];
  props: C2Element[];
}

const BG = "/img/chapter2background";
const CH = "/img/chapter2character";
const PR = "/img/chapter2prop";

export const C2_THEMES: C2Theme[] = [
  {
    id: "space-jungle",
    name: "太空叢林",
    emoji: "🌿",
    tagline: "星空下的神秘叢林",
    color: "#059669",
    backgrounds: [
      { id: "sj-bg1", name: "星光藤蔓森林", emoji: "🌿", img: `${BG}/太空叢林星光藤蔓森林.png` },
      { id: "sj-bg2", name: "漂浮岩石叢林", emoji: "🪨", img: `${BG}/太空叢林漂浮岩石叢林.png` },
      { id: "sj-bg3", name: "紫色夜空樹海", emoji: "🌌", img: `${BG}/太空叢林紫色夜空樹海.png` },
    ],
    characters: [
      { id: "sj-ch1", name: "外星人",   emoji: "👾", img: `${CH}/太空叢林外星人.png` },
      { id: "sj-ch2", name: "太空猴",   emoji: "🐒", img: `${CH}/太空叢林太空猴.png` },
      { id: "sj-ch3", name: "機器人",   emoji: "🤖", img: `${CH}/太空叢林機器人.png` },
    ],
    props: [
      { id: "sj-p1", name: "太空寶箱", emoji: "💰", img: `${PR}/太空叢林太空寶箱.png` },
      { id: "sj-p2", name: "星星",     emoji: "⭐", img: `${PR}/太空叢林星星.png` },
      { id: "sj-p3", name: "火箭",     emoji: "🚀", img: `${PR}/太空叢林火箭.png` },
    ],
  },
  {
    id: "underwater-castle",
    name: "海底城堡",
    emoji: "🏰",
    tagline: "深海中的神秘王國",
    color: "#0369a1",
    backgrounds: [
      { id: "uc-bg1", name: "水晶海底宮殿", emoji: "💎", img: `${BG}/海底城水晶海底宮殿.png` },
      { id: "uc-bg2", name: "海草拱門",     emoji: "🌊", img: `${BG}/海底城海草拱門.png` },
      { id: "uc-bg3", name: "珊瑚城牆",     emoji: "🪸", img: `${BG}/海底城珊瑚城牆.png` },
    ],
    characters: [
      { id: "uc-ch1", name: "海馬騎士",   emoji: "🐴", img: `${CH}/海底城海馬騎士.png` },
      { id: "uc-ch2", name: "章魚管家",   emoji: "🐙", img: `${CH}/海底城章魚管家.png` },
      { id: "uc-ch3", name: "美人魚公主", emoji: "🧜", img: `${CH}/海底城美人魚公主.png` },
    ],
    props: [
      { id: "uc-p1", name: "泡泡月亮", emoji: "🫧", img: `${PR}/海底城泡泡月亮.png` },
      { id: "uc-p2", name: "海星旗幟", emoji: "⭐", img: `${PR}/海底城海星旗幟.png` },
      { id: "uc-p3", name: "珍珠寶箱", emoji: "💰", img: `${PR}/海底城珍珠寶箱.png` },
    ],
  },
  {
    id: "singing-garden",
    name: "會唱歌的花園",
    emoji: "🌸",
    tagline: "音符在花叢中飛舞",
    color: "#be185d",
    backgrounds: [
      { id: "sg-bg1", name: "彩虹花棚", emoji: "🌈", img: `${BG}/音樂花園彩虹花棚.png` },
      { id: "sg-bg2", name: "發光草地", emoji: "🌿", img: `${BG}/音樂花園發光草地.png` },
      { id: "sg-bg3", name: "音符花叢", emoji: "🎵", img: `${BG}/音樂花園音符花叢.png` },
    ],
    characters: [
      { id: "sg-ch1", name: "小精靈",       emoji: "🧚", img: `${CH}/音樂花園小精靈.png` },
      { id: "sg-ch2", name: "會唱歌的兔子", emoji: "🐰", img: `${CH}/音樂花園會唱歌的兔子.png` },
      { id: "sg-ch3", name: "蜜蜂指揮家",   emoji: "🐝", img: `${CH}/音樂花園蜜蜂指揮家.png` },
    ],
    props: [
      { id: "sg-p1", name: "星星燈串",   emoji: "✨", img: `${PR}/音樂花園星星燈串.png` },
      { id: "sg-p2", name: "花朵麥克風", emoji: "🎤", img: `${PR}/音樂花園花朵麥克風.png` },
      { id: "sg-p3", name: "音符氣球",   emoji: "🎵", img: `${PR}/音樂花園音符氣球.png` },
    ],
  },
];
