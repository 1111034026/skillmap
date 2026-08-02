# SkillMap × ActiveAI 國小遊戲化模組 — 專案交接文件
> 最後更新:2026-07-30。目的:讓新 session / 其他 agent 能無縫接手。
> 讀完本文件 + `PLAN-games-E.zh-TW.md` 即擁有全部 context。

---

## 1. 專案總目標(PO = Ben 的原始 brief)

以 **skillmap repo 的模式**為基礎修改,整合進 ActiveAI 主站,做出 **Basic 難度、地圖式的國小(3–6 年級)遊戲化 AI 素養模組**,並比照國中模組記錄學習數據與成效。

**最終產品線需求(之後才做,目前不在範圍)**:
- 遊戲頁面 URL,綁定與 Hour of AI 相同的登入邏輯(可自動創建訪客帳號)
- 記錄每帳號每模組完成狀態,顯示於學生端
- 記錄每學習活動的 learner input 與正確率
- 世界地圖 UI 顯示所有模組(關卡)與完成進度
- 保留:**中文語音**、**角色可在畫面移動、與 NPC 對話完成任務**

**教學設計規格(已定,全部原型遵守)**:
- 一個模組 = **2 個 AILF 子素養**,難度 Basic
- 七步結構:子素養① Hook 對話 → 學習任務(對話+feedback 鷹架)→ 測驗任務 → 子素養② 同流程 → 素養面向 Big Idea 總結對話
- 測驗**首次作答**正確率 >60% = 掌握;learning gain = 測驗 − 學習
- 任務是**場景上的 overlay**,作答完回場景繼續對話
- 模擬學生與 AI 互動,但**生成式 AI 不真接 API**(全部 canned)
- 目前為**探索原型**:場景移動/NPC 靠近先不做,對話依序推進

**四模組 × 目標子素養(PO 以 AILF 框架截圖指定,Basic 描述為錨)**:
| 模組 | 場景 | NPC | 子素養 |
|---|---|---|---|
| 問 Engage | 智慧港口 | 港務員阿浪(NPC1) | **E2** 說明 AI 如何完成任務/破解迷思・**E3** 判斷 AI 輸出:接受/修正/退回 |
| 用 Create | 靈感森林 | 森林精靈露米(Lumi) | **C2** 用 AI 工具視覺化/做出想法・**C4** 真實性與智財 |
| 管 Manage | 合作工廠 | 奇奇廠長(Maintenance worker) | **M1** 認識 AI 系統與擅長任務・**M2** 規則式 vs 資料學習式 |
| 造 Shape | 未來超市 | 店長米亞(Mia) | **S3** 資料選擇→行為・**S4** 改良 AI 促進福祉 |

---

## 2. 環境與位置

- **原型所在**:`/Users/ben/ActiveAI/skillmap/proto/`(skillmap repo 的 clone;repo = Next.js 16 + Tailwind 4,GH Pages,但**原型是獨立靜態頁**,不動 Next 程式碼)
- **啟動預覽**:`cd /Users/ben/ActiveAI/skillmap && python3 -m http.server 4190` → `http://localhost:4190/proto/index.html`(必須用 server,`file://` 會擋 fetch)
- **skillmap repo 模式**(整合時要沿用):資料驅動 chapter(`src/data/chapterN.ts`)、Screen 序列 overlay、**中文語音=預錄 MP3**,路徑 `public/Voice/<dir>/<整句台詞>.mp3`(檔名即台詞,`encodeURIComponent` 播放);角色素材在 `public/img/`(Tucker=玩家、NPC1、Lumi、Mia、Maintenance worker、AIrobot、BK1–4 場景背景)
- **生圖管線**(產原型視覺素材用):ActiveAI-FE `.env.local` 的 `LITELLM_API_URL`(https://api.active-ai.io/litellm)+ `LITELLM_API_KEY` + `IMAGE_MODEL`(gemini-2.5-flash-image);POST `/v1/images/generations`,sharp 轉 webp。腳本模式見 scratchpad `proto-gen.mjs`(session 專屬,遺失可照 `proto/img/` 現有檔名重寫)。角色一致性可用 gemini-3.1-flash-image 參考圖模式(chat/completions + image_url)
- **測試**:Playwright 在 `/Users/ben/ActiveAI/ActiveAI-FE/node_modules/.pnpm/playwright-core@1.59.1/...`;驗證方式=「懂正解的 auto-player」(讀 `steps[stepIdx].acts[actIdx]` 資料按正解操作,每型一個 solver),8+ 流程全部走到 summary、pageerror=0 才算過
- **相關但獨立**:Hour of AI 國中 landing 改版(V2 mockup,ActiveAI-FE PR #51,`docs/design/hour-of-ai-redesign/`)— 與本專案無直接依賴

## 3. 原型架構(proto/)

```
proto/
  index.html      — 選單 + 場景/對話框/任務 overlay/總結 的殼 + 全部 CSS
  engine.js       — 引擎 v2(見下)
  data-engage.js  — 問AI 內容(版本 A, C)
  data-create.js  — 用AI 內容(A, B, C, D)
  data-manage.js  — 管AI 內容(A, B, C, D)
  data-shape.js   — 造AI 內容(A, B, C, D)
  img/            — 24 張 AI 生成 webp(童書風,無文字)
  PLAN-engage-C.zh-TW.md — 問C 企劃(已實作)
  PLAN-games-E.zh-TW.md  — V.E 遊戲化企劃(待 PO review,**下一步**)
  HANDOFF.zh-TW.md       — 本文件
```

**引擎 v2 規則(跨模組,PO 指定)**:
- **答錯必須「再試一次」直到答對**才能前進(❌ 搖晃+一行提示+再試一次鈕);答對 ✅ 大勾動畫後 0.8s 自動下一題;**首次作答仍計分**
- 任務頂部進度條;學習/測驗唯一差別=計分桶
- 對話語音:瀏覽器 TTS zh-TW 代替(右上可關);**正式版換預錄 MP3**(repo 模式)
- 12 種活動型:`mcq / imgpick / sort2 / dragsort / multi / chat / info / pairs / tokens / oxrush / stamp / spot`(schema 見 engine.js 各 render 函式;chat 的選項無 `ok` 欄=中性探索不計分)

**資料 schema 快覽**:模組={id, domain, tag, scene, bg, npc{name,img,standee}, compMeta{code:{label,name}}, versions{X:{desc, steps[]}}};step=`{t:"dialog", who, lines[], choices?}` 或 `{t:"task", comp, kind:"learn"|"quiz", title, acts[]}`。

## 4. 版本演進與 PO 回饋紀錄(重要——設計決策的 why)

- **A 版**(全模組):第一輪設計,傳統選擇題為主 → PO:閱讀量太大、太無聊
- **問 B 版**:已刪除(PO:離港口情境太遠、牽強)
- **PO 回饋 #1(問/用)**:圖像化、Duolingo 式、少文字、對/錯/修正用圖示;E3 加重**生成式 AI**(LLM+生圖,老師最在意);C2 要有真正「創作感」不能只是選擇;法庭改**拖拉判決**(有罪/無罪);**貓頭鷹爺爺情緒線要保留**(人類價值);視覺素材用生圖 API 不限 emoji;跨模組加「再試一次」規則 → 產出:**問C**(小海檢查台:蓋章/找碴/幻覺)、**用C**(月光派對創作坊+森林法庭)、**用D**(繪本工作室+原創雷達)
- **PO 回饋 #2(管/造)**:每個子素養要用**最符合其本質**的互動,參考 AILF Basic「In the Classroom」直翻;Shape 適合拖拉訓練資料 → 產出:**管C**(工具販賣機+「你來當機器人」規則體驗)、**管D**(廠長行事曆+機器人擂台預測)、**造C**(回收站訓練營:標資料→訓練→測試翻車→補資料+顧客心聲訪問)、**造D**(AI 讀心預測秀+受益者聚光燈)
- **PO 回饋 #3**:當 world-class game designer,每模組設計一款**類型完全不同的遊戲**(V.E)→ 已寫企劃 `PLAN-games-E.zh-TW.md`:問=偵探推理《真相偵探社》、用=創作嘉年華《螢光音樂祭》、管=分流管理《瘋狂訂單日》、造=養成《AI 寶寶養成記》+ 10 條設計準則 + 工程策略(七成換皮、三成新系統:avatar 狀態機/畫布拖放/輸送帶/場景進度)

## 5. 目前狀態與下一步

**狀態**:A–E 版全部實作完成並驗證。**V.E 四款遊戲齊全**:問《真相偵探社》(手電筒蒐證/證據板/審問室/謠言氣球)、用《螢光音樂祭》(魔藥大鍋/舞台拼裝/鑑定師)、管《瘋狂訂單日》(輸送帶分流/晶片安裝+規則爆炸動畫/超級訂單排序)、造《AI 寶寶養成記》(餵資料→寶寶表情台詞反映資料偏差/配件工坊 dress-up/畢業典禮)。引擎 v4 共 20 種活動型(新增 conveyor/chips/seq/feed/dressup;babyAvatar 狀態機:baby-bot.webp 空白臉+emoji 疊加眼睛/嘴/四個配件槽/對話泡泡)。
**下一步(等 PO 圈選後執行)** — `PLAN-games-E.zh-TW.md` 末尾 5 個 review 問題:
1. 四個遊戲類型方向 OK?
2. 直立切片先做哪款?(建議《AI 寶寶養成記》)
3. 快節奏元素預設開/關?
4. 美術統一童書風 or 各遊戲自風格?
5. E 版完成後 A–D 保留幾版當對照?

**接手時的注意事項**:
- 不要動 skillmap 的 `src/`(Next 16 有 breaking changes,見 repo AGENTS.md);原型只住在 `proto/`
- 改內容=改 `data-*.js`(一句台詞一行);改互動=改 `engine.js`+`index.html` CSS
- 新增版本用 python 截尾插入的方式(見 git history),保持 A 版等舊版原樣
- 驗證一律跑 auto-player 全流程,別只看畫面
- 尚未 git commit——proto/ 全部是 untracked 檔案,要不要 commit/推分支由 PO 決定
