# V.F 設計 Brief:機器人視覺化答題介面(給模組設計 agent)

## 目標
為你負責的模組新增 **版本 F**:參考 ActiveAI 既有 Lottie/機器人素材重新設計答題介面。
- **每一頁都要有視覺錨點**(lottie 動畫、機器人 SVG、或生成圖),以機器人為主角
- 文字極簡(Duolingo 原則:一行指令、選項短)
- **分類題改成二選一大卡模式**(sort2 的 buckets 帶 img/svg/lottie 就會自動變成兩張大視覺卡)
- 學習目標與 7 步結構不變(可改編自 A/C/E 版最好的內容,但介面全面視覺化)
- 長度:每個學習任務 4–5 個活動、測驗任務 4–5 個;hook/big idea 對話每則 ≤3 句

## 素材
- `proto/bot/` 有 9 個 lottie + 30 個機器人 SVG,**先讀 `proto/bot/CATALOG.md`**(含每個素材的描述與建議用途、Top10 推薦)
- 資料欄位:`lottie:"searching.json"`、`svg:"learnbot.svg"`(引擎自動加 bot/ 前綴)、`img:"xxx.webp"`(proto/img/)
- 支援媒體欄位的位置:mcq(act 層級)、imgpick 選項、sort2 的 item 與 bucket、stamp 的 out/ev、info、oxrush 卡片、dressup 顧客
- **注意**:答對/答錯的 correct/incorrect lottie 由引擎的「機器人 dock」自動播,不要在內容裡重複使用
- task step 可加 `bot:"searching.json"` 改變該任務 dock 的待機動畫(預設 idle.json)
- 內嵌點陣圖的大檔(lightbulb/mascot_lightbulb/mascot_bolt/mascot_painter_clean_w_lightbulb)避免使用

## 缺素材時:生成機器人主題參考圖
最多 4 張,存 `proto/img/f-<你的模組id>-<名稱>.webp`。腳本模式(在 scratchpad 建 .mjs 跑):
- 讀 `/Users/ben/ActiveAI/ActiveAI-FE/.env.local` 的 LITELLM_API_URL/LITELLM_API_KEY/IMAGE_MODEL
- POST `${URL}/v1/images/generations`,body `{model, prompt, size:"1024x1024", n:1}`,取 `data[0].b64_json`
- 用 ActiveAI-FE 的 sharp(createRequire("/Users/ben/ActiveAI/ActiveAI-FE/package.json"))轉 640 webp q82
- 風格詞尾:`Cute children's storybook illustration, soft colors, rounded friendly shapes, absolutely no text.`
- 機器人外觀要呼應 ActiveAI 吉祥物:方形螢幕臉、藍色眼睛微笑、白/淡紫身體(參考 CATALOG 的角色描述)

## 活動 schema 速查(全部答錯自動重試到對、首次計分,不用自己處理)
- `mcq {q, scenario?, img/svg/lottie/art?, opts:[{label, icon?, ok?, fb?}], hint?}`
- `imgpick {q, opts:[{img/svg/lottie/icon, label?, ok?, fb?}]}` ← 圖像二選一/四選一主力
- `sort2 {q?, buckets:[{id,label,icon?,img/svg/lottie?}], items:[{label, desc?, icon/img/svg/lottie?, bucket, fb?}]}` ← 二選一大卡
- `multi {q, note?, need, opts:[{id,icon,label,ok?}], outcomes:[{when:"pass"|"default"|has:[ids], pass, title?, msg, acc?, resultImg?}]}`
- `chat {persona, turns:[{prompt, opts:[{label, ok?, reply?, replyImg?, replyArt?, fb?}]}]}`(選項不寫 ok = 中性探索)
- `info {title?, img/svg/lottie/art?, body, acc?}`
- `pairs {q, style?:"board", pairs:[[甲,乙],...]}`
- `tokens {q, parts:["字","{答案}",...], distractors:[...], hint?}`
- `oxrush {q, btns?:[{v,icon,label}×2], cards:[{text, icon/svg/lottie?, yes, fb?}]}`
- `stamp {q, stamps?:[{id,icon,label}×3], out:{label,text?,img/svg/lottie?}, ev:{...}|null, answer:"accept|fix|reject", hint?}`
- `spot {q, img, spots:[{x,y,r}], hint?, dark?}`(x/y/r 為 % 座標,要先看圖再定)
- `balloons {q, items:[{text, pop, fb?}]}` / `cauldron`(同 multi+鍋)/ `canvas {q,img,stickers,min}`
- `conveyor {q, stations:[{id,icon,label}], balls:[{icon,label,station,fb}]}`
- `chips {q, lines:[{icon,label,desc?,chip:"rule|learn",fb,explode?}]}` / `seq {q,answer,pool,hint}`
- `feed {q, need, baby:{eyes,say}, opts, outcomes(可帶 baby:{eyes,say}), explore?}` / `dressup {q, customers, tray}`
- 對話步:`{t:"dialog", who:"npc", lines:[...(可混 {who:"ai",text}...)], choices?:[{label,reply}]}`
- 任務步:`{t:"task", comp:"<子素養代碼>", kind:"learn"|"quiz", title, bot?, acts:[...]}`

## 交付方式(嚴格遵守)
1. 只改你自己的 `proto/data-<module>.js`:把 `F: {...}` 版本用 python 插在檔尾 `  },\n};` 之前(參考檔內既有版本的插入痕跡);`desc` 以「🤖 機器人視覺版:」開頭
2. 不准動 engine.js、index.html、其他模組的 data 檔、bot/ 目錄
3. 完成後跑 `node -e "new Function(require('fs').readFileSync('proto/data-<module>.js','utf8'))"` 確認語法
4. 回報:F 版的設計重點(每個活動用了什麼素材/機制)、生成了哪些圖
