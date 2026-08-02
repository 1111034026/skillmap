# Bot 素材目錄（proto/bot/）

蒐集自 `design-system/assets/`（mascot SVG 與素材描述）與 `ActiveAI-FE/`（Lottie 原始 JSON、public/ 下各模組 SVG）。
同名檔案經 md5 比對全部 byte-identical，已去重扁平存放。共 **39 個素材檔**：9 個 Lottie JSON + 30 個 SVG。

角色統一配色（取自 Lottie 圖層）：機殼 `#EBEBF3`、機殼陰影 `#C5C7DD`、螢幕 `#272A49`、眼睛/表情 `#10DDFF`、主體藍 `#246CAE`（= logo 藍）、強調粉 `#FF69A6`。角色是一台復古 CRT 螢幕機器人。

## 反應動畫三件組（答題介面核心）

- **idle.json** — 預設待機。機器人（圖層名 "Agent"）站姿輕微律動、眨眼，4 秒無限循環，是出現頻率最高的動畫。學生尚未動作時一直播。
- **correct.json** — 答對慶祝。同一隻機器人的開心/歡呼狀態，2 秒循環；產品中與 `correct.mp3` 音效同時觸發，也用於完課慶祝畫面。
- **incorrect.json** — 答錯反應。機器人露出困惑/沮喪表情（內部圖層名 "State=Thinking"），2 秒循環。**刻意做得不責備**（design-system 明確要求保留此特質）。

播放器規格（沿用產品）：SVG renderer、autoplay、預設無限循環、容器 200×200px；畫布 240×240 會被縮至 83%（searching 是唯一的 200×200）。全部 100fps、未壓縮。

## Lottie 動畫（9）

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| idle.json | 待機站姿，輕微律動＋眨眼；240×240 · 4.0s · 無限循環 | 答題介面預設狀態（未作答時） |
| correct.json | 開心慶祝動作；240×240 · 2.0s · 循環 | 答對慶祝（配 correct.mp3）、完課/慶祝頁 |
| incorrect.json | 困惑沮喪但不責備的表情；240×240 · 2.0s · 循環 | 答錯反應（配 incorrect.mp3） |
| positive.json | 肯定/點頭反應，手比 True；240×240 · 1.0s · 播一次不循環 | 二選一題 hover 左選項的即時預覽反應 |
| negative.json | 否定/搖頭懷疑反應，手比 False；240×240 · 1.0s · 播一次不循環 | 二選一題 hover 右選項的即時預覽反應 |
| high_temperature.json | 機器人發熱冒汗（高溫狀態）；240×240 · 1.0s | 溫度主題二選一的 hover 變體；「隨機/有創意」隱喻 |
| low_temperature.json | 機器人發冷結凍（低溫狀態）；240×240 · 1.0s | 溫度主題二選一的 hover 變體；「保守/可預測」隱喻 |
| searching.json | 思考/查詢中（螢幕跑動畫）；200×200 · 3.2s · 循環 | 等待 AI 回應的 loading 狀態（產品中使用最廣，10+ 處） |
| painting.json | 拿畫筆作畫；240×240 · 6.0s · 前段播一次＋4.2–5.8s 中段循環 | 生成圖片等待狀態 |

## SVG 靜態圖（30）

### 核心角色狀態

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| mascot_idle.svg | 待機站姿（Lottie idle 的靜態版）；200×200 | 答題機器人的 reduced-motion / 載入前替代圖、出題者立繪 |
| mascot_thinking.svg | 思考表情；200×200 | 思考中/出題中狀態、提示框插圖 |
| mascot_confused.svg | 困惑表情；552×457（尺寸最大） | 答錯輔助插圖、「不確定」情境 |
| mascot_confusing.svg | 困惑變體；200×200（module4 AI 準確性模組用） | 「AI 也會出錯」主題頁、答錯反應 |
| mascot_finish.svg | 完成/衝線慶祝姿勢；192×167（各縣市模組完課頁用） | 完課/結算畫面 |
| mascot_still.svg | 80×80 小尺寸頭像（含黃色元素；教師儀表板學生列表用） | 小型頭像、計分列、列表 icon |
| mascot_standing.svg | 站立姿勢；200×200（module4 標題 icon 用） | 標題列小圖、出題者 |
| mascot_mag.svg | 拿放大鏡；200×200（地圖「探索點」用） | 觀察/找線索題型、搜尋主題卡 |
| mascot_use_computer.svg | 操作電腦；260×220 | 「AI 工作中」情境、操作教學頁 |

### 回饋姿勢（拿對/錯符號）

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| mascot_hold_green_circle.svg | 雙手舉「綠色圈圈（O）」牌；214×200 | 答對回饋、「正確」選項標示、O/X 題 O 方 |
| mascot_hold_cross_circle.svg | 雙手舉「紅色叉叉（X）」牌；214×200（產品中也當系統忙碌遮罩） | 答錯回饋、O/X 題 X 方 |

### 主題化身（依教學情境）

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| mascot_painter.svg | 畫家裝扮拿畫具；200×200（生圖模組） | 圖像生成主題卡 |
| mascot_painter_clean.svg | 畫家乾淨版（無顏料痕）；200×200 | 生圖主題頁面主視覺 |
| mascot_painter_clean_w_lightbulb.svg | 畫家＋頭上亮燈泡；239×200 ⚠188KB 內嵌點陣圖 | 「有靈感了」提示、prompt 發想頁 |
| mascot_lightbulb.svg | 拿燈泡（有點子）；223×200 ⚠188KB 內嵌點陣圖（llm-next-word 模組用） | 提示/靈感框、教學重點頁 |
| mascot_bolt.svg | 拿閃電；223×200 ⚠188KB 內嵌點陣圖（能源模組） | 能源/耗電主題卡 |
| mascot_temperature.svg | 溫度主題（冷熱對比）；200×200 | LLM temperature 教學、溫度主題入口 |
| mascot_holding_thermometer.svg | 拿溫度計；278×224 | 溫度題型的出題者 |
| mascot_summer.svg | 夏天裝扮（熱）；210×200 | 高溫/夏天分類卡、二選一主題左卡 |
| mascot_winter.svg | 冬天裝扮（冷）；200×200 | 低溫/冬天分類卡、二選一主題右卡 |
| lightbulb.svg | 燈泡道具（單一物件，非機器人）；41×61 ⚠184KB 內嵌點陣圖 | 提示 icon（建議改用輕量版） |

### module3 系列 bot（聊天機器人學習模組）

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| idlebot.svg | module3 版待機機器人；200×200（AI agent 除錯頁、create-with-ai hook 頁用） | 待機/入場立繪 |
| bookbot.svg | 機器人＋書本（78 個 path，畫風較細緻，含藍/橘書本）；266×176（「聊天機器人幫你學習」title 頁） | 學習/閱讀主題卡、模組封面 |
| learnbot.svg | 學習中機器人；260×220（「大腦如何學習」頁） | 學習歷程頁、知識點插圖 |
| teamupbot.svg | 機器人與人類擊掌/合作（含膚色手部元素）；400×553 直式（「何時與 AI 組隊」title 頁） | 人機協作主題卡、直式版面主視覺 |
| checkpromptbot.svg | 檢查提示詞的機器人；200×200（llm-next-word「下一個字預測」token 頁用） | prompt 檢查/文字接龍題型的出題者 |

### 分類模型角色（第二角色系統，代表「被訓練的模型」）

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| classification_model_default.svg | 分類模型機器人預設站姿（灰藍配色帶橘紅點綴）；200×233（vision-lab header 用） | 分類/訓練題型的「模型」角色 |
| classification_model_jump.svg | 模型開心跳起；216×233（vision-lab 判斷正確時用） | 分類答對反應 |
| classification_model_confused.svg | 模型困惑；200×233（vision-lab 判斷錯誤/預覽用） | 分類答錯反應 |

注意：design-system 明確提醒「幫你的機器人」（主吉祥物）與「被訓練的模型」（classification_model_*）是兩個不同角色，設計時勿混用。

### 小型 icon

| 檔名 | 內容描述 | 建議用途 |
|---|---|---|
| chatbot-photo.svg | 32×32 圓形機器人聊天頭像（深藍底＋機殼色機器人臉） | 對話式答題介面的 AI 訊息頭像 |

## 已知素材健康問題（沿自 design-system 盤點）

- `lightbulb.svg`、`mascot_lightbulb.svg`、`mascot_bolt.svg`、`mascot_painter_clean_w_lightbulb.svg` 內嵌點陣圖，各 184–188KB，偏肥。
- 無統一 artboard（41×61 到 552×457）、三套命名並存（`mascot_*` / `*bot` / `classification_model_*`）。
- Lottie 全部 100fps 未壓縮，共約 1.06MB；idle 需無縫循環。
