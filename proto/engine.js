/* ============================================================
   國小 AILF 模組教學設計原型引擎 v2
   - 跨模組規則:答錯必須「再試一次」直到答對才能前進
     (首次作答仍計分,用於正確率與 learning gain)
   - 答對:✅ 動畫後自動前進;答錯:❌ 搖晃 + 一行提示 + 再試一次
   - 機制:mcq / imgpick / sort2 / dragsort / multi / chat / info
           pairs / tokens / oxrush / stamp / spot
   ============================================================ */

const IMG = p => "../public/img/" + encodeURI(p);
const PIMG = p => "img/" + p; // proto 生圖素材
const $ = s => document.querySelector(s);

const DOMAIN_COLORS = { engage:"#2E7CF6", create:"#15A86B", manage:"#F59E0B", shape:"#8B5CF6" };
const MODULES = [ENGAGE_MODULE, CREATE_MODULE, MANAGE_MODULE, SHAPE_MODULE];

/* ── TTS ── */
let ttsOn = true;
function speak(text){
  if (!ttsOn || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const clean = String(text).replace(/<[^>]+>/g, "").replace(/[🔊▼✅✏️🚫🎉⭐️📌👍👎⚖️🕊️]/g, "");
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "zh-TW";
  const v = speechSynthesis.getVoices().find(v => /zh[-_]TW/i.test(v.lang));
  if (v) u.voice = v;
  u.rate = 1.02;
  speechSynthesis.speak(u);
}
window.speechSynthesis?.getVoices();

/* ── 全域狀態 ── */
let MOD = null, VER = null, steps = [], stepIdx = 0;
let lineIdx = 0, choiceMode = false;
let results = {};

/* ── Lottie 系統(V.F 機器人答題介面)──
   素材放 proto/bot/(由 ActiveAI 既有 lottie/svg 搬運)。
   - 活動資料可在支援 img 的地方改用 lottie:"idle.json" 或 svg:"learnbot.svg"
   - 機器人反應 dock:任務中待機 idle,答對播 correct、答錯播 incorrect */
const BOT = p => "bot/" + encodeURI(p);
const LOTTIE_CACHE = {};
function lottieData(file){
  return LOTTIE_CACHE[file] || (LOTTIE_CACHE[file] = fetch(BOT(file)).then(r => r.json()).catch(() => null));
}
function lottieInto(elm, file, loop = true, onDone){
  if (!window.lottie){ elm.hidden = true; return; }
  const token = (elm._tok = (elm._tok || 0) + 1);
  lottieData(file).then(data => {
    if (!data || elm._tok !== token || !elm.isConnected) return;
    elm._anim?.destroy();
    elm._anim = lottie.loadAnimation({ container: elm, renderer: "svg", loop, autoplay: true, animationData: data });
    if (!loop && onDone) elm._anim.addEventListener("complete", onDone);
  });
}
function mountLotties(root){
  root.querySelectorAll("[data-lottie]").forEach(d => {
    if (d._mountedLot) return;
    d._mountedLot = true;
    lottieInto(d, d.dataset.lottie, d.dataset.loop !== "0");
  });
}
/* 媒體欄位:{lottie} > {img} > {svg} > {icon/art} */
function mediaHTML(o, kind){
  if (!o) return "";
  if (o.lottie) return `<div class="lot ${kind === "small" ? "small" : ""}" data-lottie="${o.lottie}"></div>`;
  if (o.img) return `<img class="${kind === "card" ? "" : "sc-img"}" src="${PIMG(o.img)}" alt="">`;
  if (o.svg) return `<img class="${kind === "card" ? "isvg" : "sc-svg"}" src="${BOT(o.svg)}" alt="">`;
  if (o.art) return `<div class="art">${o.art}</div>`;
  if (o.icon) return `<div class="art">${o.icon}</div>`;
  return "";
}
/* 機器人反應 dock */
const BOT_FILES = { idle: "idle.json", ok: "correct.json", no: "incorrect.json" };
let botBusy = false;
function botDockShow(file, loop, onDone){
  const dock = $("#bot-dock");
  dock.hidden = false;
  lottieInto(dock, file, loop, onDone);
}
function botIdle(){
  const st = steps[stepIdx];
  botBusy = false;
  botDockShow((st && st.bot) || BOT_FILES.idle, true);
}
function botReact(kind){
  if (!window.lottie) return;
  botBusy = true;
  botDockShow(BOT_FILES[kind], false, () => { if (botBusy) botIdle(); });
}
function botHide(){ const d = $("#bot-dock"); d.hidden = true; d._anim?.destroy(); d._anim = null; }

/* ── 選單 ── */
function renderMenu(){
  const grid = $("#mod-grid");
  grid.innerHTML = "";
  MODULES.forEach(m => {
    const col = DOMAIN_COLORS[m.domain];
    const card = document.createElement("div");
    card.className = "mod-card";
    const compsTxt = Object.values(m.compMeta).map(c => `${c.label}・${c.name}`).join("<br>");
    const vers = Object.entries(m.versions).map(([k, v]) =>
      `<button type="button" class="ver-btn" data-v="${k}"><b>版本 ${k}</b><span>${v.desc}</span></button>`).join("");
    card.innerHTML = `
      <div class="mod-bg" style="background-image:url('${IMG(m.bg)}')">
        <span class="tag" style="background:${col}">${m.tag}</span>
        <h2>${m.scene}</h2>
      </div>
      <div class="mod-body">
        <p class="comps">${compsTxt}</p>
        <div class="ver-row">${vers}</div>
      </div>`;
    card.querySelectorAll(".ver-btn").forEach(b =>
      b.addEventListener("click", () => startModule(m, b.dataset.v)));
    grid.appendChild(card);
  });
}

/* ── 模組流程 ── */
function startModule(mod, verKey){
  MOD = mod; VER = verKey;
  steps = mod.versions[verKey].steps;
  stepIdx = 0; results = {};
  Object.keys(mod.compMeta).forEach(c => results[c] = { learn:{c:0,t:0}, quiz:{c:0,t:0} });
  $("#menu").style.display = "none";
  $("#stage").style.display = "block";
  $("#scene").style.backgroundImage = `url('${IMG(mod.bg)}')`;
  $("#npc-standee").src = IMG(mod.npc.standee);
  $("#player-standee").src = IMG("Tucker.png");
  $("#hud-where").textContent = `${mod.tag}・${mod.scene}(${verKey} 版)`;
  renderTrail();
  runStep();
}
function quitToMenu(){
  speechSynthesis?.cancel();
  botHide();
  ["#stage", "#dialog", "#task", "#summary"].forEach(s => $(s).style.display = "none");
  $("#menu").style.display = "block";
}
function renderTrail(){
  $("#hud-trail").innerHTML = steps.map((s, i) =>
    `<span class="step-dot ${i < stepIdx ? "done" : i === stepIdx ? "now" : ""}"></span>`).join("");
}
function runStep(){
  renderTrail();
  if (stepIdx >= steps.length){ showSummary(); return; }
  const st = steps[stepIdx];
  if (st.t === "dialog") openDialog(st);
  else openTask(st);
}
function nextStep(){ stepIdx++; runStep(); }

/* ── 對話 ── */
const SPEAKERS = () => ({
  npc:    { name: MOD.npc.name, img: MOD.npc.img },
  player: { name: "塔克(你)", img: "Tuckerhalf.png" },
  ai:     { name: MOD.aiName || "AI 小幫手", img: "AIrobot.png" },
});
function lineOf(st, i){
  const l = st.lines[i];
  return typeof l === "string" ? { who: st.who || "npc", text: l } : l;
}
function openDialog(st){
  lineIdx = 0; choiceMode = false;
  $("#dialog").style.display = "block";
  $("#task").style.display = "none";
  showLine(st);
}
function showLine(st){
  const { who, text } = lineOf(st, lineIdx);
  const sp = SPEAKERS()[who] || SPEAKERS().npc;
  $("#dlg-port").src = IMG(sp.img);
  $("#dlg-name").textContent = sp.name;
  $("#dlg-text").textContent = text;
  $("#dlg-choices").innerHTML = "";
  $("#dlg-next").style.display = "inline";
  speak(text);
}
function advanceDialog(){
  if (choiceMode) return;
  const st = steps[stepIdx];
  if (lineIdx < st.lines.length - 1){ lineIdx++; showLine(st); return; }
  if (st.choices && !st._answered){ showChoices(st); return; }
  $("#dialog").style.display = "none";
  speechSynthesis?.cancel();
  nextStep();
}
function showChoices(st){
  choiceMode = true;
  $("#dlg-next").style.display = "none";
  const box = $("#dlg-choices");
  box.innerHTML = "";
  st.choices.forEach(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.label;
    b.addEventListener("click", () => {
      st._answered = true;
      choiceMode = false;
      st.lines = [...st.lines, { who: st.who || "npc", text: c.reply }];
      lineIdx = st.lines.length - 1;
      showLine(st);
    });
    box.appendChild(b);
  });
}

/* ── 任務框架 ── */
let actIdx = 0;
function openTask(st){
  actIdx = 0;
  $("#dialog").style.display = "none";
  $("#task").style.display = "block";
  botIdle();
  const col = DOMAIN_COLORS[MOD.domain];
  const meta = MOD.compMeta[st.comp];
  $("#t-ctag").textContent = meta.label;
  $("#t-ctag").style.background = col;
  const k = $("#t-ktag");
  k.textContent = st.kind === "quiz" ? "測驗任務" : "學習任務";
  k.className = "ktag" + (st.kind === "quiz" ? " quiz" : "");
  $("#t-title").textContent = st.title;
  renderAct(st);
}
function record(st, ok){
  const r = results[st.comp][st.kind];
  r.t++; if (ok) r.c++;
}
function taskNext(st){
  actIdx++;
  if (actIdx >= st.acts.length){
    $("#task").style.display = "none";
    botHide();
    nextStep();
  } else renderAct(st);
}
function setProg(st){
  const total = st.acts.length;
  $("#t-prog").textContent = `${Math.min(actIdx + 1, total)} / ${total}`;
  const bar = $("#t-bar-i");
  if (bar) bar.style.width = (actIdx / total * 100) + "%";
}

/* ── 對/錯共用 UI ── */
function panel(){ return document.querySelector(".task-panel"); }
function flashOK(then){
  botReact("ok");
  const o = document.createElement("div");
  o.className = "flash-ok";
  o.innerHTML = "<span>✅</span>";
  panel().appendChild(o);
  const bar = $("#t-bar-i");
  if (bar) bar.style.width = "100%";
  setTimeout(() => { o.remove(); then(); }, 850);
}
function failUI(f, actions, hint, onRetry){
  botReact("no");
  panel().classList.remove("shake"); void panel().offsetWidth;
  panel().classList.add("shake");
  f.className = "feedback bad";
  f.innerHTML = `<span class="fico">❌</span>${hint || "再試一次!"}`;
  f.style.display = "flex";
  speak(hint || "再試一次");
  actions.innerHTML = "";
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn-main btn-retry"; b.textContent = "再試一次";
  b.addEventListener("click", onRetry);
  actions.appendChild(b);
}
function mainBtn(label, fn, disabled){
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn-main"; b.textContent = label;
  if (disabled) b.disabled = true;
  b.addEventListener("click", fn);
  return b;
}
function fbEl(){ const f = document.createElement("div"); f.className = "feedback"; return f; }
function el(cls, html, tag = "div"){
  const d = document.createElement(tag); d.className = cls;
  if (html != null) d.innerHTML = html;
  return d;
}

function renderAct(st){
  setProg(st);
  const body = $("#t-body");
  body.innerHTML = "";
  const act = st.acts[actIdx];
  ({ mcq: renderMcq, imgpick: renderImgpick, sort2: renderSort2, dragsort: renderDragsort,
     multi: renderMulti, chat: renderChat, info: renderInfo, pairs: renderPairs,
     tokens: renderTokens, oxrush: renderOxrush, stamp: renderStamp, spot: renderSpot,
     balloons: renderBalloons, cauldron: renderCauldron, canvas: renderCanvas,
     conveyor: renderConveyor, chips: renderChips, seq: renderSeq,
     feed: renderFeed, dressup: renderDressup, trainlab: renderTrainlab,
   }[act.type])(st, act, body);
  mountLotties(body);
}

/* ── mcq(答錯→再試一次直到對)── */
function renderMcq(st, act, body){
  if (act.scenario || act.art || act.img || act.svg || act.lottie){
    const sc = el("scenario", mediaHTML(act) + (act.scenario || ""));
    body.appendChild(sc);
  }
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const wrap = el("opts" + (act.opts.every(o => (o.label || "").length <= 12) ? " grid2" : ""));
  const f = fbEl();
  const actions = el("task-actions");
  let first = true;
  const buttons = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    buttons.forEach(b => { b.disabled = false; b.classList.remove("picked-bad"); });
  }
  act.opts.forEach(o => {
    const b = el("opt",
      (o.icon ? `<span class="oicon">${o.icon}</span>` : "") + `<span>${o.label}</span>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      if (o.ok){
        if (first) record(st, true);
        b.classList.add("picked-good");
        buttons.forEach(x => x.disabled = true);
        flashOK(() => taskNext(st));
      } else {
        if (first){ record(st, false); first = false; }
        b.classList.add("picked-bad");
        buttons.forEach(x => x.disabled = true);
        failUI(f, actions, o.fb || act.hint || "", reset);
      }
    });
    buttons.push(b); wrap.appendChild(b);
  });
  body.appendChild(wrap); body.appendChild(f); body.appendChild(actions);
}

/* ── imgpick:圖像大卡選擇 ── */
function renderImgpick(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const wrap = el("ipgrid" + (act.opts.length === 2 ? " two" : ""));
  const f = fbEl();
  const actions = el("task-actions");
  let first = true;
  const cards = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    cards.forEach(c => { c.disabled = false; c.classList.remove("bad"); });
  }
  act.opts.forEach(o => {
    const media = o.img ? `<img src="${PIMG(o.img)}" alt="">` :
      o.svg ? `<img class="isvg" src="${BOT(o.svg)}" alt="">` :
      o.lottie ? `<div class="lot" data-lottie="${o.lottie}"></div>` :
      `<div class="ipemoji">${o.icon || "❓"}</div>`;
    const c = el("ipcard", media + (o.label ? `<span>${o.label}</span>` : ""), "button");
    c.type = "button";
    c.addEventListener("click", () => {
      if (o.ok){
        if (first) record(st, true);
        c.classList.add("good");
        cards.forEach(x => x.disabled = true);
        flashOK(() => taskNext(st));
      } else {
        if (first){ record(st, false); first = false; }
        c.classList.add("bad");
        cards.forEach(x => x.disabled = true);
        failUI(f, actions, o.fb || act.hint || "", reset);
      }
    });
    cards.push(c); wrap.appendChild(c);
  });
  body.appendChild(wrap); body.appendChild(f); body.appendChild(actions);
}

/* ── sort2:逐卡二分(點選籃子)── */
function renderSort2(st, act, body){
  act._i = act._i ?? 0;
  const item = act.items[act._i];
  if (act.q) body.appendChild(el("q-text", act.q, "p"));
  const sc = el("scenario",
    (mediaHTML(item) || `<div class="art">❓</div>`) +
    `<div style="text-align:center;font-weight:900;font-size:16px">${item.label}</div>` +
    (item.desc ? `<div style="text-align:center;color:var(--ink-2);font-size:13.5px;margin-top:2px">${item.desc}</div>` : ""));
  body.appendChild(sc);
  speak(item.label + (item.desc ? "。" + item.desc : ""));
  const visualBuckets = act.buckets.some(b => b.img || b.svg || b.lottie);
  const wrap = el("opts grid2" + (visualBuckets ? " bucket-cards" : ""));
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const firstKey = act._i;
  const bs = [];
  function nextItem(){
    act._i++;
    if (act._i >= act.items.length){ act._i = 0; taskNext(st); }
    else renderAct(st);
  }
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    bs.forEach(b => { b.disabled = false; b.classList.remove("picked-bad"); });
  }
  act.buckets.forEach(bk => {
    const bkMedia = bk.img ? `<img class="bimg" src="${PIMG(bk.img)}" alt="">` :
      bk.svg ? `<img class="bimg" src="${BOT(bk.svg)}" alt="">` :
      bk.lottie ? `<div class="lot" data-lottie="${bk.lottie}"></div>` : "";
    const b = el("opt",
      (visualBuckets ? bkMedia : `<span class="oicon">${bk.icon || ""}</span>`) +
      `<span>${(visualBuckets && bk.icon ? bk.icon + " " : "") + bk.label}</span>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      const ok = item.bucket === bk.id;
      if (ok){
        if (act._first[firstKey] === undefined){ act._first[firstKey] = true; record(st, true); }
        b.classList.add("picked-good");
        bs.forEach(x => x.disabled = true);
        (act._placed = act._placed || {})[bk.id] = [...(act._placed?.[bk.id] || []), item.label.split("\n")[0]];
        flashOK(nextItem);
      } else {
        if (act._first[firstKey] === undefined){ act._first[firstKey] = false; record(st, false); }
        b.classList.add("picked-bad");
        bs.forEach(x => x.disabled = true);
        failUI(f, actions, item.fb || "", reset);
      }
    });
    bs.push(b); wrap.appendChild(b);
  });
  body.appendChild(wrap);
  const bkts = el("buckets");
  act.buckets.forEach(bk => {
    const chips = (act._placed?.[bk.id] || []).map(l => `<span class="chip">${l}</span>`).join("");
    bkts.appendChild(el("bucket", `<h5>${bk.icon || ""} ${bk.label}</h5><div class="chips">${chips}</div>`));
  });
  body.appendChild(bkts); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="margin-top:10px;font-size:12.5px;color:var(--ink-2);text-align:right">卡片 ${act._i + 1} / ${act.items.length}</p>`));
}

/* ── dragsort:拖拉判決(桌機拖曳,亦可點選)── */
function renderDragsort(st, act, body){
  act._i = act._i ?? 0;
  const item = act.items[act._i];
  if (act.q) body.appendChild(el("q-text", act.q, "p"));
  const card = el("drag-item",
    (item.img ? `<img src="${PIMG(item.img)}" alt="">` : item.icon ? `<div class="art">${item.icon}</div>` : "") +
    `<div class="dlabel">${item.label}</div>`);
  card.draggable = true;
  card.id = "drag-current";
  body.appendChild(card);
  speak(item.label);
  const zones = el("drop-zones");
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const firstKey = act._i;
  function nextItem(){
    act._i++;
    if (act._i >= act.items.length){ act._i = 0; taskNext(st); }
    else renderAct(st);
  }
  function judge(zoneId, zEl){
    const ok = item.zone === zoneId;
    if (ok){
      if (act._first[firstKey] === undefined){ act._first[firstKey] = true; record(st, true); }
      zEl.classList.add("zgood");
      card.classList.add("dropped");
      zEl.querySelector(".zcount").textContent =
        (act._done = (act._done || 0) + 0, ((act._counts = act._counts || {})[zoneId] = (act._counts[zoneId] || 0) + 1));
      flashOK(nextItem);
    } else {
      if (act._first[firstKey] === undefined){ act._first[firstKey] = false; record(st, false); }
      zEl.classList.add("zbad");
      panel().classList.remove("shake"); void panel().offsetWidth; panel().classList.add("shake");
      f.className = "feedback bad";
      f.innerHTML = `<span class="fico">❌</span>${item.fb || "再想一想,拖到另一邊試試"}`;
      f.style.display = "flex";
      speak(item.fb || "再想一想");
      setTimeout(() => { zEl.classList.remove("zbad"); }, 700);
    }
  }
  card.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", "x"));
  act.zones.forEach(z => {
    const zEl = el("dzone", `<div class="zicon">${z.icon}</div><div class="zlabel">${z.label}</div><span class="zcount">${(act._counts?.[z.id]) || ""}</span>`);
    zEl.addEventListener("dragover", e => { e.preventDefault(); zEl.classList.add("zhover"); });
    zEl.addEventListener("dragleave", () => zEl.classList.remove("zhover"));
    zEl.addEventListener("drop", e => { e.preventDefault(); zEl.classList.remove("zhover"); judge(z.id, zEl); });
    zEl.addEventListener("click", () => judge(z.id, zEl));
    zones.appendChild(zEl);
  });
  body.appendChild(zones); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="margin-top:8px;font-size:12.5px;color:var(--ink-2);text-align:center">把卡片拖到(或點選)你的判決 ・ ${act._i + 1} / ${act.items.length}</p>`));
}

/* ── multi:選 N 送出;錯→再試一次 ── */
function renderMulti(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  if (act.note) body.appendChild(el("", `<p style="font-size:13.5px;color:var(--ink-2);margin:-8px 0 12px">${act.note}</p>`));
  const grid = el("multi-grid");
  const selOrder = [];
  const btnOf = {};
  const f = fbEl();
  const actions = el("task-actions");
  const submit = mainBtn("送出", onSubmit, true);
  let first = true, done = false;
  act.opts.forEach(o => {
    const b = el("mopt",
      (o.img ? `<img src="${PIMG(o.img)}" alt="">` : `<span class="micon">${o.icon || ""}</span>`) + o.label, "button");
    b.type = "button"; btnOf[o.id] = b;
    b.addEventListener("click", () => {
      if (done) return;
      const i = selOrder.indexOf(o.id);
      if (i >= 0){ selOrder.splice(i, 1); b.classList.remove("sel"); }
      else {
        if (selOrder.length >= act.need){
          const oldId = selOrder.shift();
          btnOf[oldId]?.classList.remove("sel");
        }
        selOrder.push(o.id); b.classList.add("sel");
      }
      submit.disabled = selOrder.length !== act.need;
    });
    grid.appendChild(b);
  });
  function onSubmit(){
    const chosen = [...selOrder];
    const okIds = act.opts.filter(o => o.ok).map(o => o.id);
    const allOk = chosen.every(id => okIds.includes(id));
    let out = (act.outcomes || []).find(oc =>
      oc.when === "pass" ? allOk : oc.has ? oc.has.every(id => chosen.includes(id)) : false);
    if (!out) out = (act.outcomes || []).find(oc => oc.when === "default") ||
      { pass: allOk, msg: allOk ? "" : "有些選擇再想一想。" };
    const pass = out.pass ?? allOk;
    if (first){ record(st, pass); first = false; }
    grid.querySelectorAll(".mopt").forEach((b, j) => {
      const o = act.opts[j];
      if (chosen.includes(o.id)) b.classList.add(o.ok ? "good" : "bad");
    });
    const acc = out.acc != null ?
      `<div class="acc-meter"><i style="width:${out.acc}%"></i><span>AI 準確率 ${out.acc}%</span></div>` : "";
    if (pass){
      done = true;
      f.className = "feedback good";
      f.innerHTML = `<span class="fico">✅</span><div><b>${out.title || "太好了!"}</b>${out.msg || ""}${acc}</div>`;
      f.style.display = "flex";
      speak((out.title || "太好了") + "。" + (out.msg || ""));
      actions.innerHTML = "";
      actions.appendChild(mainBtn("繼續 →", () => taskNext(st)));
      if (out.resultImg){
        f.innerHTML += `<img class="result-img" src="${PIMG(out.resultImg)}" alt="">`;
      }
    } else {
      panel().classList.remove("shake"); void panel().offsetWidth; panel().classList.add("shake");
      f.className = "feedback bad";
      f.innerHTML = `<span class="fico">❌</span><div><b>${out.title || "再試一次"}</b>${out.msg || ""}${acc}</div>`;
      f.style.display = "flex";
      speak((out.title || "") + "。" + (out.msg || ""));
      actions.innerHTML = "";
      actions.appendChild(mainBtn("再試一次", () => {
        grid.querySelectorAll(".mopt").forEach(b => b.classList.remove("good", "bad"));
        f.style.display = "none";
        actions.innerHTML = ""; actions.appendChild(submit);
        submit.disabled = selOrder.length !== act.need;
      }));
    }
  }
  actions.appendChild(submit);
  body.appendChild(grid); body.appendChild(f); body.appendChild(actions);
}

/* ── chat:模擬 AI 往返;答錯→再試一次;ok 未標=中性探索 ── */
function renderChat(st, act, body){
  act._turn = act._turn ?? 0;
  const win = el("chatwin");
  (act._log = act._log || []).forEach(m => win.appendChild(bubble(m)));
  body.appendChild(win);
  const f = fbEl();
  const optsWrap = el("opts");
  const actions = el("task-actions");
  function bubble(m){
    return el("bub " + m.side,
      `<span class="who">${m.who}</span>${m.text}` +
      (m.img ? `<img class="bub-img" src="${PIMG(m.img)}" alt="">` : "") +
      (m.art ? `<div class="out-art">${m.art}</div>` : ""));
  }
  function push(m){ act._log.push(m); win.appendChild(bubble(m)); win.scrollTop = win.scrollHeight; }
  function runTurn(){
    optsWrap.innerHTML = ""; f.style.display = "none"; actions.innerHTML = "";
    const turn = act.turns[act._turn];
    if (!turn){
      actions.appendChild(mainBtn("完成 →", () => { act._turn = 0; act._log = []; taskNext(st); }));
      return;
    }
    if (turn.prompt && !turn._prompted){
      push({ side:"ai", who: act.persona || "AI", text: turn.prompt });
      speak(turn.prompt);
      turn._prompted = true;
    }
    const btns = [];
    turn.opts.forEach(o => {
      const b = el("opt", `<span>${o.label}</span>`, "button");
      b.type = "button";
      b.addEventListener("click", () => {
        const scored = "ok" in o;
        if (scored && turn._first === undefined){ turn._first = !!o.ok; record(st, !!o.ok); }
        if (scored && !o.ok){
          b.classList.add("picked-bad");
          btns.forEach(x => x.disabled = true);
          failUI(f, actions, o.fb || "", () => {
            f.style.display = "none"; actions.innerHTML = "";
            btns.forEach(x => { x.disabled = false; x.classList.remove("picked-bad"); });
          });
          return;
        }
        push({ side:"me", who:"你", text: o.label });
        if (o.reply) push({ side:"ai", who: act.persona || "AI", text: o.reply, art: o.replyArt, img: o.replyImg });
        if (o.fb){
          f.className = "feedback good";
          f.innerHTML = `<span class="fico">✅</span>${o.fb}`;
          f.style.display = "flex";
        }
        optsWrap.innerHTML = "";
        act._turn++;
        actions.appendChild(mainBtn(act.turns[act._turn] ? "繼續 →" : "完成 →", () => {
          if (act.turns[act._turn]) runTurn();
          else { act._turn = 0; act._log = []; taskNext(st); }
        }));
      });
      btns.push(b); optsWrap.appendChild(b);
    });
  }
  body.appendChild(optsWrap); body.appendChild(f); body.appendChild(actions);
  runTurn();
}

/* ── info ── */
function renderInfo(st, act, body){
  if (act.title) body.appendChild(el("q-text", act.title, "p"));
  if (act.img) body.appendChild(el("", `<img class="info-img" src="${PIMG(act.img)}" alt="">`));
  if (act.svg) body.appendChild(el("", `<img class="info-svg" src="${BOT(act.svg)}" alt="">`));
  if (act.lottie) body.appendChild(el("", `<div class="lot" data-lottie="${act.lottie}"></div>`));
  if (act.art) body.appendChild(el("info-art", act.art));
  if (act.body) body.appendChild(el("info-body", act.body));
  if (act.acc != null)
    body.appendChild(el("acc-meter", `<i style="width:${act.acc}%"></i><span>AI 準確率 ${act.acc}%</span>`));
  speak((act.title || "") + "。" + (act.body || "").replace(/<[^>]+>/g, ""));
  const actions = el("task-actions");
  actions.appendChild(mainBtn("繼續 →", () => taskNext(st)));
  body.appendChild(actions);
}

/* ── pairs:翻牌配對 ── */
function renderPairs(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const cards = [];
  act.pairs.forEach((p, i) => {
    p.forEach(txt => cards.push({ txt, pair: i }));
  });
  if (!act._order){
    act._order = cards.map((_, i) => i).sort(() => Math.random() - 0.5);
  }
  const grid = el("pairgrid" + (act.style === "board" ? " board" : ""));
  const f = fbEl();
  let sel = null, misses = 0, matched = 0, locked = false;
  const elCards = [];
  act._order.forEach(ci => {
    const c = cards[ci];
    const b = el("paircard", `<span>${c.txt}</span>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      if (locked || b.classList.contains("matched") || b === sel?.el) return;
      b.classList.add("psel");
      if (!sel){ sel = { el: b, pair: c.pair }; return; }
      locked = true;
      if (sel.pair === c.pair){
        const a = sel.el;
        setTimeout(() => {
          a.classList.add("matched"); b.classList.add("matched");
          a.classList.remove("psel"); b.classList.remove("psel");
          matched++; sel = null; locked = false;
          if (matched === act.pairs.length){
            record(st, misses === 0);
            flashOK(() => taskNext(st));
          }
        }, 260);
      } else {
        misses++;
        const a = sel.el;
        a.classList.add("pbad"); b.classList.add("pbad");
        setTimeout(() => {
          a.classList.remove("psel", "pbad"); b.classList.remove("psel", "pbad");
          sel = null; locked = false;
        }, 550);
      }
    });
    elCards.push(b); grid.appendChild(b);
  });
  body.appendChild(grid); body.appendChild(f);
}

/* ── tokens:句子拼裝 ── */
function renderTokens(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const slotAnswers = act.parts.filter(p => p.startsWith("{")).map(p => p.slice(1, -1));
  const sent = el("tok-sentence");
  const slotEls = [];
  act.parts.forEach(p => {
    if (p.startsWith("{")){
      const s = el("tok-slot", "");
      slotEls.push(s); sent.appendChild(s);
    } else sent.appendChild(el("tok-word", p, "span"));
  });
  body.appendChild(sent);
  const chipsWrap = el("tok-chips");
  const allTokens = [...slotAnswers, ...(act.distractors || [])];
  if (!act._tokOrder) act._tokOrder = allTokens.map((_, i) => i).sort(() => Math.random() - 0.5);
  const filled = [];
  const f = fbEl();
  const actions = el("task-actions");
  let first = act._tokFirst === undefined;
  const chipEls = [];
  function check(){
    const ok = filled.every((t, i) => t.txt === slotAnswers[i]);
    if (first){ act._tokFirst = ok; record(st, ok); first = false; }
    if (ok){
      slotEls.forEach(s => s.classList.add("tok-good"));
      flashOK(() => { act._tokOrder = null; act._tokFirst = undefined; taskNext(st); });
    } else {
      failUI(f, actions, act.hint || "順序或字塊不對,再拼一次", () => {
        filled.splice(0).forEach(t => { t.chip.classList.remove("used"); });
        slotEls.forEach(s => { s.textContent = ""; s.classList.remove("tok-bad"); });
        f.style.display = "none"; actions.innerHTML = "";
      });
      slotEls.forEach(s => s.classList.add("tok-bad"));
    }
  }
  act._tokOrder.forEach(i => {
    const t = allTokens[i];
    const chip = el("tok-chip", t, "button");
    chip.type = "button";
    chip.addEventListener("click", () => {
      if (chip.classList.contains("used")) return;
      if (filled.length >= slotEls.length) return;
      chip.classList.add("used");
      const slot = slotEls[filled.length];
      slot.textContent = t;
      filled.push({ txt: t, chip });
      if (filled.length === slotEls.length) check();
    });
    chipEls.push(chip); chipsWrap.appendChild(chip);
  });
  // 點擊已填的槽可取回
  slotEls.forEach((s, i) => s.addEventListener("click", () => {
    if (i >= filled.length || f.style.display === "flex") return;
    const t = filled[i];
    filled.splice(i, 1);
    t.chip.classList.remove("used");
    slotEls.forEach((se, j) => se.textContent = filled[j]?.txt || "");
  }));
  body.appendChild(chipsWrap); body.appendChild(f); body.appendChild(actions);
}

/* ── oxrush:👍/👎 快問快答 ── */
function renderOxrush(st, act, body){
  act._i = act._i ?? 0;
  const c = act.cards[act._i];
  body.appendChild(el("q-text", act.q || "這個說法對嗎?", "p"));
  const card = el("oxcard", mediaHTML(c) + `<p>${c.text}</p>`);
  body.appendChild(card);
  speak(c.text);
  const btns = el("oxbtns");
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const key = act._i;
  const bEls = [];
  function nextCard(){
    act._i++;
    if (act._i >= act.cards.length){ act._i = 0; taskNext(st); }
    else renderAct(st);
  }
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    bEls.forEach(b => { b.disabled = false; b.classList.remove("oxbad"); });
  }
  (act.btns || [{ v:true, icon:"👍", label:"說得對" }, { v:false, icon:"👎", label:"怪怪的" }]).forEach(o => {
    const b = el("oxbtn", `<span>${o.icon}</span><small>${o.label}</small>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      const ok = o.v === !!c.yes;
      if (ok){
        if (act._first[key] === undefined){ act._first[key] = true; record(st, true); }
        b.classList.add("oxgood");
        bEls.forEach(x => x.disabled = true);
        flashOK(nextCard);
      } else {
        if (act._first[key] === undefined){ act._first[key] = false; record(st, false); }
        b.classList.add("oxbad");
        bEls.forEach(x => x.disabled = true);
        failUI(f, actions, c.fb || "", reset);
      }
    });
    bEls.push(b); btns.appendChild(b);
  });
  body.appendChild(btns); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="font-size:12.5px;color:var(--ink-2);text-align:right">${act._i + 1} / ${act.cards.length}</p>`));
}

/* ── stamp:生成式 AI 輸出三印章(✅✏️🚫)── */
function renderStamp(st, act, body){
  if (act.q) body.appendChild(el("q-text", act.q, "p"));
  const wrap = el("stamp-wrap" + (act.ev ? "" : " single"));
  const outPanel = el("stamp-panel out",
    `<h5>${act.out.label || "AI 的輸出"}</h5>` +
    mediaHTML({ img: act.out.img, svg: act.out.svg, lottie: act.out.lottie }, "card") +
    (act.out.text ? `<div class="stamp-text">${act.out.text}</div>` : ""));
  wrap.appendChild(outPanel);
  if (act.ev){
    wrap.appendChild(el("stamp-panel ev",
      `<h5>${act.ev.label || "證據"}</h5>` +
      mediaHTML({ img: act.ev.img, svg: act.ev.svg, lottie: act.ev.lottie }, "card") +
      (act.ev.text ? `<div class="stamp-text">${act.ev.text}</div>` : "")));
  }
  body.appendChild(wrap);
  speak((act.q || "") + "。" + (act.out.text || "").replace(/<[^>]+>/g, ""));
  const btns = el("stampbtns");
  const f = fbEl();
  const actions = el("task-actions");
  let first = true;
  const bEls = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    bEls.forEach(b => { b.disabled = false; b.classList.remove("oxbad"); });
  }
  (act.stamps || [{ id:"accept", icon:"✅", label:"接受" }, { id:"fix", icon:"✏️", label:"修正" }, { id:"reject", icon:"🚫", label:"退回" }]).forEach(o => {
    const b = el("stampbtn", `<span>${o.icon}</span><small>${o.label}</small>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      if (o.id === act.answer){
        if (first) record(st, true);
        bEls.forEach(x => x.disabled = true);
        const mark = el("stamp-mark", o.icon);
        outPanel.appendChild(mark);
        flashOK(() => taskNext(st));
      } else {
        if (first){ record(st, false); first = false; }
        b.classList.add("oxbad");
        bEls.forEach(x => x.disabled = true);
        failUI(f, actions, act.hint || "再比對一次左右兩邊", reset);
      }
    });
    bEls.push(b); btns.appendChild(b);
  });
  body.appendChild(btns); body.appendChild(f); body.appendChild(actions);
}

/* ── spot:圖片找碴(點出目標;dark=手電筒模式)── */
function renderSpot(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const wrap = el("spot-wrap");
  wrap.innerHTML = `<img src="${PIMG(act.img)}" alt="">`;
  if (act.dark){
    const mask = el("spot-dark");
    wrap.appendChild(mask);
    wrap.addEventListener("pointermove", e => {
      const r = wrap.getBoundingClientRect();
      mask.style.setProperty("--fx", ((e.clientX - r.left) / r.width * 100) + "%");
      mask.style.setProperty("--fy", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  }
  const found = new Set();
  let misses = 0, first = true;
  const counter = el("spot-counter", `找到 0 / ${act.spots.length}`);
  wrap.addEventListener("click", e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 100;
    const y = (e.clientY - r.top) / r.height * 100;
    let hit = null;
    act.spots.forEach((s, i) => {
      if (!found.has(i) && Math.hypot(x - s.x, y - s.y) <= (s.r || 12)) hit = i;
    });
    if (hit !== null){
      found.add(hit);
      const s = act.spots[hit];
      wrap.appendChild(el("spot-hit", "⭕", "div")).style.cssText =
        `left:${s.x}%;top:${s.y}%`;
      counter.textContent = `找到 ${found.size} / ${act.spots.length}`;
      if (found.size === act.spots.length){
        if (first){ record(st, misses === 0); first = false; }
        flashOK(() => taskNext(st));
      }
    } else {
      misses++;
      const rip = el("spot-miss", "✗");
      rip.style.cssText = `left:${x}%;top:${y}%`;
      wrap.appendChild(rip);
      setTimeout(() => rip.remove(), 600);
    }
  });
  body.appendChild(wrap);
  body.appendChild(counter);
  if (act.hint) body.appendChild(el("", `<p style="font-size:13px;color:var(--ink-2);text-align:center;margin-top:6px">${act.hint}</p>`));
}

/* ── balloons:謠言氣球——戳破謠言,放過真相(pop:true=該戳)── */
function renderBalloons(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const sky = el("balloon-sky");
  const f = fbEl();
  let popped = 0, misses = 0, done = false;
  const popCount = act.items.filter(i => i.pop).length;
  act.items.forEach((it, i) => {
    const b = el("balloon", `<span class="bball">🎈</span><span class="btxt">${it.text}</span>`, "button");
    b.type = "button";
    b.style.setProperty("--d", (i * 0.9) + "s");
    b.style.left = (3 + i * (78 / Math.max(act.items.length - 1, 1))) + "%";
    b.addEventListener("click", () => {
      if (done || b.classList.contains("popped")) return;
      if (it.pop){
        b.classList.add("popped");
        popped++;
        if (popped === popCount){
          done = true;
          record(st, misses === 0);
          flashOK(() => taskNext(st));
        }
      } else {
        misses++;
        b.classList.add("bwrong");
        f.className = "feedback bad";
        f.innerHTML = `<span class="fico">❌</span>${it.fb || "這句是真相,不能戳!"}`;
        f.style.display = "flex";
        speak(it.fb || "這句是真相,不能戳");
        setTimeout(() => { b.classList.remove("bwrong"); f.style.display = "none"; }, 1400);
      }
    });
    sky.appendChild(b);
  });
  body.appendChild(sky);
  body.appendChild(el("", `<p style="font-size:13px;color:var(--ink-2);text-align:center;margin-top:8px">${act.hint || "戳破所有謠言氣球,放過說得對的!"}</p>`));
  body.appendChild(f);
}

/* ── cauldron:提示魔藥大鍋——選材料熬煮,配方決定輸出 ── */
function renderCauldron(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const pot = el("pot", `<div class="pot-bowl">🍯</div><div class="pot-sel"></div>`);
  body.appendChild(pot);
  const potSel = pot.querySelector(".pot-sel");
  const grid = el("multi-grid cauldron-grid");
  const selOrder = [];
  const btnOf = {};
  const f = fbEl();
  const actions = el("task-actions");
  const brew = mainBtn("🔥 開始熬煮!", onBrew, true);
  let first = true, done = false;
  function refreshPot(){
    potSel.innerHTML = selOrder.map(id => {
      const o = act.opts.find(x => x.id === id);
      return `<span class="pot-ing">${o.icon || "❔"}</span>`;
    }).join("");
  }
  act.opts.forEach(o => {
    const b = el("mopt", `<span class="micon">${o.icon || ""}</span>${o.label}`, "button");
    b.type = "button"; btnOf[o.id] = b;
    b.addEventListener("click", () => {
      if (done) return;
      const i = selOrder.indexOf(o.id);
      if (i >= 0){ selOrder.splice(i, 1); b.classList.remove("sel"); }
      else {
        if (selOrder.length >= act.need){
          const old = selOrder.shift();
          btnOf[old]?.classList.remove("sel");
        }
        selOrder.push(o.id); b.classList.add("sel");
      }
      refreshPot();
      brew.disabled = selOrder.length !== act.need;
    });
    grid.appendChild(b);
  });
  function onBrew(){
    const chosen = [...selOrder];
    const okIds = act.opts.filter(o => o.ok).map(o => o.id);
    const allOk = chosen.every(id => okIds.includes(id));
    let out = (act.outcomes || []).find(oc =>
      oc.when === "pass" ? allOk : oc.has ? oc.has.every(id => chosen.includes(id)) : false);
    if (!out) out = (act.outcomes || []).find(oc => oc.when === "default") ||
      { pass: allOk, msg: "" };
    const pass = out.pass ?? allOk;
    if (first){ record(st, pass); first = false; }
    pot.classList.add("brewing");
    actions.innerHTML = "";
    setTimeout(() => {
      pot.classList.remove("brewing");
      if (pass){
        done = true;
        f.className = "feedback good";
        f.innerHTML = `<span class="fico">✨</span><div><b>${out.title || "熬煮成功!"}</b>${out.msg || ""}</div>` +
          (out.resultImg ? `<img class="result-img" src="${PIMG(out.resultImg)}" alt="">` : "");
        f.style.display = "flex";
        speak((out.title || "熬煮成功") + "。" + (out.msg || ""));
        actions.appendChild(mainBtn("繼續 →", () => taskNext(st)));
      } else {
        panel().classList.remove("shake"); void panel().offsetWidth; panel().classList.add("shake");
        f.className = "feedback bad";
        f.innerHTML = `<span class="fico">💥</span><div><b>${out.title || "鍋子怪怪的…"}</b>${out.msg || ""}</div>` +
          (out.resultImg ? `<img class="result-img" src="${PIMG(out.resultImg)}" alt="">` : "");
        f.style.display = "flex";
        speak((out.title || "") + "。" + (out.msg || ""));
        actions.appendChild(mainBtn("再試一次", () => {
          f.style.display = "none";
          actions.innerHTML = ""; actions.appendChild(brew);
          brew.disabled = selOrder.length !== act.need;
        }));
      }
    }, 900);
  }
  actions.appendChild(brew);
  body.appendChild(grid); body.appendChild(f); body.appendChild(actions);
}

/* ── canvas:自由拼裝——把貼紙放上舞台(創作型,不計分)── */
function renderCanvas(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const wrap = el("canvas-wrap");
  wrap.innerHTML = `<img src="${PIMG(act.img)}" alt="">`;
  const tray = el("canvas-tray");
  const actions = el("task-actions");
  const doneBtn = mainBtn("完成佈置 →", () => taskNext(st), true);
  let current = null, placed = 0;
  (act.stickers || []).forEach(s => {
    const b = el("tray-sticker", s, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      tray.querySelectorAll(".tray-sticker").forEach(x => x.classList.remove("sel"));
      if (current === b){ current = null; return; }
      current = b; b.classList.add("sel");
    });
    tray.appendChild(b);
  });
  wrap.addEventListener("click", e => {
    if (!current) return;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 100;
    const y = (e.clientY - r.top) / r.height * 100;
    const s = el("placed-sticker", current.textContent, "button");
    s.type = "button";
    s.style.cssText = `left:${x}%;top:${y}%`;
    s.addEventListener("click", ev => { ev.stopPropagation(); s.remove(); placed--; update(); });
    wrap.appendChild(s);
    placed++;
    current.classList.remove("sel"); current = null;
    update();
  });
  function update(){ doneBtn.disabled = placed < (act.min || 3); }
  body.appendChild(wrap);
  body.appendChild(tray);
  body.appendChild(el("", `<p style="font-size:13px;color:var(--ink-2);text-align:center;margin-top:6px">${act.hint || `點貼紙,再點舞台上想放的位置(至少 ${act.min || 3} 個;點放好的貼紙可移除)`}</p>`));
  actions.appendChild(doneBtn);
  body.appendChild(actions);
}

/* ── baby avatar:AI 寶寶(表情/配件/台詞隨狀態變)── */
function babyAvatar(state){
  const b = el("baby");
  b.innerHTML = `
    <img src="${PIMG("baby-bot.webp")}" alt="AI 寶寶">
    <span class="b-eye l"></span><span class="b-eye r"></span>
    <span class="b-mouth"></span>
    <span class="b-acc head"></span><span class="b-acc face"></span>
    <span class="b-acc left"></span><span class="b-acc right"></span>
    <div class="b-say" hidden></div>`;
  b._set = s => {
    s = s || {};
    b.querySelectorAll(".b-eye").forEach(e => e.textContent = s.eyes || "✦");
    b.querySelector(".b-mouth").textContent = s.mouth || "‿";
    const worn = s.worn || {};
    ["head", "face", "left", "right"].forEach(slot => {
      b.querySelector(".b-acc." + slot).textContent = worn[slot] || "";
    });
    const say = b.querySelector(".b-say");
    if (s.say){ say.hidden = false; say.textContent = s.say; speak(s.say); }
    else say.hidden = true;
    if (s.bounce){ b.classList.remove("b-bounce"); void b.offsetWidth; b.classList.add("b-bounce"); }
  };
  b._set(state || {});
  return b;
}

/* ── feed:餵資料養成(選滿→開飯→寶寶長成資料的樣子)── */
function renderFeed(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  act._worn = act._worn || {};
  const baby = babyAvatar({ ...(act.baby || {}), worn: act._worn });
  body.appendChild(baby);
  if (act.note) body.appendChild(el("", `<p style="font-size:13.5px;color:var(--ink-2);text-align:center;margin:-4px 0 10px">${act.note}</p>`));
  const grid = el("multi-grid");
  const selOrder = [];
  const btnOf = {};
  const f = fbEl();
  const actions = el("task-actions");
  const feedBtn = mainBtn("🍼 開飯!", onFeed, true);
  let first = true, done = false;
  act.opts.forEach(o => {
    const b = el("mopt", `<span class="micon">${o.icon || ""}</span>${o.label}`, "button");
    b.type = "button"; btnOf[o.id] = b;
    b.addEventListener("click", () => {
      if (done) return;
      const i = selOrder.indexOf(o.id);
      if (i >= 0){ selOrder.splice(i, 1); b.classList.remove("sel"); }
      else {
        if (selOrder.length >= act.need){
          const old = selOrder.shift();
          btnOf[old]?.classList.remove("sel");
        }
        selOrder.push(o.id); b.classList.add("sel");
      }
      feedBtn.disabled = selOrder.length !== act.need;
    });
    grid.appendChild(b);
  });
  function onFeed(){
    const chosen = [...selOrder];
    const okIds = act.opts.filter(o => o.ok).map(o => o.id);
    const allOk = chosen.every(id => okIds.includes(id));
    let out = (act.outcomes || []).find(oc =>
      oc.when === "pass" ? allOk : oc.has ? oc.has.every(id => chosen.includes(id)) : false);
    if (!out) out = (act.outcomes || []).find(oc => oc.when === "default") || { pass: allOk, msg: "" };
    const pass = out.pass ?? allOk;
    if (first && !act.explore){ record(st, pass); first = false; }
    baby._set({ ...(out.baby || {}), worn: act._worn, bounce: true });
    const acc = out.acc != null ?
      `<div class="acc-meter"><i style="width:${out.acc}%"></i><span>寶寶答對率 ${out.acc}%</span></div>` : "";
    actions.innerHTML = "";
    setTimeout(() => {
      if (pass){
        done = true;
        f.className = "feedback good";
        f.innerHTML = `<span class="fico">💚</span><div><b>${out.title || "吃飽飽!"}</b>${out.msg || ""}${acc}</div>`;
        f.style.display = "flex";
        actions.appendChild(mainBtn("繼續 →", () => taskNext(st)));
      } else {
        panel().classList.remove("shake"); void panel().offsetWidth; panel().classList.add("shake");
        f.className = "feedback bad";
        f.innerHTML = `<span class="fico">😵</span><div><b>${out.title || "好像吃壞了…"}</b>${out.msg || ""}${acc}</div>`;
        f.style.display = "flex";
        actions.appendChild(mainBtn("重新配餐", () => {
          f.style.display = "none";
          baby._set({ ...(act.baby || {}), worn: act._worn });
          actions.innerHTML = ""; actions.appendChild(feedBtn);
          feedBtn.disabled = selOrder.length !== act.need;
        }));
      }
    }, 700);
  }
  actions.appendChild(feedBtn);
  body.appendChild(grid); body.appendChild(f); body.appendChild(actions);
}

/* ── dressup:顧客心聲→幫寶寶裝備配件(配件會一直戴著)── */
function renderDressup(st, act, body){
  act._i = act._i ?? 0;
  act._worn = act._worn || {};
  const cust = act.customers[act._i];
  body.appendChild(el("q-text", act.q, "p"));
  const row = el("dress-row");
  const custCard = el("dress-cust",
    (mediaHTML(cust, "card") || `<div class="art">🙂</div>`) +
    `<p>「${cust.quote}」</p>`);
  row.appendChild(custCard);
  const baby = babyAvatar({ eyes: "✦", worn: act._worn });
  row.appendChild(baby);
  body.appendChild(row);
  speak(cust.quote);
  const tray = el("opts grid2");
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const key = act._i;
  const btns = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    btns.forEach(b => { b.disabled = false; b.classList.remove("picked-bad"); });
  }
  act.tray.forEach(t => {
    const b = el("opt", `<span class="oicon">${t.icon}</span><span>${t.label}</span>`, "button");
    b.type = "button";
    if (Object.values(act._worn).includes(t.icon)){ b.disabled = true; b.style.opacity = .35; }
    b.addEventListener("click", () => {
      if (t.id === cust.acc){
        if (act._first[key] === undefined){ act._first[key] = true; record(st, true); }
        act._worn[t.slot] = t.icon;
        baby._set({ eyes: "✨", worn: act._worn, bounce: true, say: cust.thanks || "交給我!" });
        custCard.classList.add("cust-happy");
        btns.forEach(x => x.disabled = true);
        flashOK(() => {
          act._i++;
          if (act._i >= act.customers.length){ act._i = 0; taskNext(st); }
          else renderAct(st);
        });
      } else {
        if (act._first[key] === undefined){ act._first[key] = false; record(st, false); }
        b.classList.add("picked-bad");
        btns.forEach(x => x.disabled = true);
        failUI(f, actions, t.fb || cust.fb || "想想這位顧客需要什麼?", reset);
      }
    });
    btns.push(b); tray.appendChild(b);
  });
  body.appendChild(tray); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="font-size:12.5px;color:var(--ink-2);text-align:right">顧客 ${act._i + 1} / ${act.customers.length}</p>`));
}

/* ── conveyor:輸送帶分流(任務球→選工作站)── */
function renderConveyor(st, act, body){
  act._i = act._i ?? 0;
  const ball = act.balls[act._i];
  body.appendChild(el("q-text", act.q, "p"));
  const belt = el("belt");
  const ballEl = el("belt-ball", `<span class="ball-icon">${ball.icon}</span><span class="ball-label">${ball.label}</span>`);
  belt.appendChild(ballEl);
  body.appendChild(belt);
  speak(ball.label);
  const row = el("stations");
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const key = act._i;
  const btns = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    btns.forEach(b => { b.disabled = false; b.classList.remove("st-bad"); });
  }
  act.stations.forEach(s => {
    const b = el("station", `<span class="st-icon">${s.icon}</span><small>${s.label}</small>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      if (s.id === ball.station){
        if (act._first[key] === undefined){ act._first[key] = true; record(st, true); }
        b.classList.add("st-good");
        ballEl.classList.add("ball-out");
        btns.forEach(x => x.disabled = true);
        flashOK(() => {
          act._i++;
          if (act._i >= act.balls.length){ act._i = 0; taskNext(st); }
          else renderAct(st);
        });
      } else {
        if (act._first[key] === undefined){ act._first[key] = false; record(st, false); }
        b.classList.add("st-bad");
        btns.forEach(x => x.disabled = true);
        failUI(f, actions, ball.fb || "送錯站啦!再想想這任務需要什麼能力", reset);
      }
    });
    btns.push(b); row.appendChild(b);
  });
  body.appendChild(row); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="font-size:12.5px;color:var(--ink-2);text-align:right">訂單 ${act._i + 1} / ${act.balls.length}</p>`));
}

/* ── chips:產線裝晶片(規則📏 vs 學習🧠;裝錯有災難動畫)── */
function renderChips(st, act, body){
  act._i = act._i ?? 0;
  const line = act.lines[act._i];
  body.appendChild(el("q-text", act.q, "p"));
  const card = el("line-card",
    `<div class="art">${line.icon}</div><div class="line-label">${line.label}</div>` +
    (line.desc ? `<div class="line-desc">${line.desc}</div>` : ""));
  body.appendChild(card);
  speak(line.label);
  const row = el("opts grid2");
  const f = fbEl();
  const actions = el("task-actions");
  act._first = act._first ?? {};
  const key = act._i;
  const btns = [];
  function reset(){
    f.style.display = "none"; actions.innerHTML = "";
    btns.forEach(b => { b.disabled = false; b.classList.remove("picked-bad") });
    card.querySelector(".rule-explosion")?.remove();
  }
  [{ id: "rule", icon: "📏", label: "規則晶片" }, { id: "learn", icon: "🧠", label: "學習晶片" }].forEach(c => {
    const b = el("opt", `<span class="oicon">${c.icon}</span><span>${c.label}</span>`, "button");
    b.type = "button";
    b.addEventListener("click", () => {
      if (c.id === line.chip){
        if (act._first[key] === undefined){ act._first[key] = true; record(st, true); }
        b.classList.add("picked-good");
        card.classList.add("line-run");
        btns.forEach(x => x.disabled = true);
        flashOK(() => {
          act._i++;
          if (act._i >= act.lines.length){ act._i = 0; taskNext(st); }
          else renderAct(st);
        });
      } else {
        if (act._first[key] === undefined){ act._first[key] = false; record(st, false); }
        b.classList.add("picked-bad");
        btns.forEach(x => x.disabled = true);
        if (c.id === "rule" && line.explode){
          const ex = el("rule-explosion",
            "<div>" + ["缺角算壞…", "太扁算壞…", "裂開算壞…", "彎的算壞…", "顏色淡算壞…", "第 47 條…", "第 128 條…", "第 999 條…!!"].join("<br>") + "</div>");
          card.appendChild(ex);
        }
        setTimeout(() => failUI(f, actions, line.fb || "", reset), line.explode && c.id === "rule" ? 1200 : 0);
      }
    });
    btns.push(b); row.appendChild(b);
  });
  body.appendChild(row); body.appendChild(f); body.appendChild(actions);
  body.appendChild(el("", `<p style="font-size:12.5px;color:var(--ink-2);text-align:right">產線 ${act._i + 1} / ${act.lines.length}</p>`));
}

/* ── seq:流水線排序(照正確順序點選步驟)── */
function renderSeq(st, act, body){
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const slotRow = el("seq-slots");
  const slotEls = act.answer.map((_, i) => {
    const s = el("seq-slot", `<small>${i + 1}</small><span></span>`);
    slotRow.appendChild(s);
    if (i < act.answer.length - 1) slotRow.appendChild(el("seq-arrow", "→", "span"));
    return s;
  });
  body.appendChild(slotRow);
  const pool = el("tok-chips");
  const filled = [];
  const f = fbEl();
  const actions = el("task-actions");
  let first = act._seqFirst === undefined;
  if (!act._seqOrder) act._seqOrder = act.pool.map((_, i) => i).sort(() => Math.random() - 0.5);
  function check(){
    const ok = filled.every((t, i) => t.txt === act.answer[i]);
    if (first){ act._seqFirst = ok; record(st, ok); first = false; }
    if (ok){
      slotEls.forEach(s => s.classList.add("tok-good"));
      flashOK(() => { act._seqOrder = null; act._seqFirst = undefined; taskNext(st); });
    } else {
      slotEls.forEach(s => s.classList.add("tok-bad"));
      failUI(f, actions, act.hint || "順序不對,想想哪一步要先做?", () => {
        filled.splice(0).forEach(t => t.chip.classList.remove("used"));
        slotEls.forEach(s => { s.querySelector("span").textContent = ""; s.classList.remove("tok-bad"); });
        f.style.display = "none"; actions.innerHTML = "";
      });
    }
  }
  act._seqOrder.forEach(i => {
    const p = act.pool[i];
    const chip = el("tok-chip", `${p.icon || ""} ${p.label}`, "button");
    chip.type = "button";
    chip.addEventListener("click", () => {
      if (chip.classList.contains("used") || filled.length >= slotEls.length) return;
      chip.classList.add("used");
      slotEls[filled.length].querySelector("span").textContent = `${p.icon || ""} ${p.label}`;
      filled.push({ txt: p.label, chip });
      if (filled.length === slotEls.length) check();
    });
    pool.appendChild(chip);
  });
  body.appendChild(pool); body.appendChild(f); body.appendChild(actions);
}

/* ── trainlab:訓練資料標注 → 訓練模型 → 模擬測試 ──
   {type:"trainlab", q, classes:[{id,label,icon?}],
    pool:[{id,img|icon,label,cls}],          // 待標注資料(點卡→點類別;可拖曳)
    locked:[{img|icon,cls}],                 // 既有模型資料(不可動,較小)
    tests:[{img|icon,label,expect}],          // 訓練後模擬分類展示
    trainLabel?, hint?}
   全對→跑測試動畫→繼續;有標錯→模型學亂,再試一次(保留已放置可修改) */
function renderTrainlab(st, act, body){
  act._assign = act._assign || {};
  body.appendChild(el("q-text", act.q, "p"));
  speak(act.q);
  const wrap = el("tl-wrap");
  const poolPanel = el("tl-pool", `<h5>📁 資料照片</h5><div class="tl-cards"></div><p class="tl-left"></p>`);
  const binsCol = el("tl-bins");
  wrap.appendChild(poolPanel); wrap.appendChild(binsCol);
  body.appendChild(wrap);
  const cardsBox = poolPanel.querySelector(".tl-cards");
  const leftNote = poolPanel.querySelector(".tl-left");
  const f = fbEl();
  const actions = el("task-actions");
  const testArea = el("tl-tests");
  const trainBtn = mainBtn(act.trainLabel || "🚀 訓練模型!", onTrain, true);
  let selected = null, first = act._tlFirst === undefined, done = false;
  const binBoxes = {};
  function itemMedia(o, cls){
    return o.img ? `<img class="${cls}" src="${PIMG(o.img)}" alt="">` :
      `<span class="${cls} tl-emoji">${o.icon || "❔"}</span>`;
  }
  act.classes.forEach(c => {
    const bin = el("tl-bin", `<h5>Class:<b>${c.icon || ""} ${c.label}</b><span class="tl-count"></span></h5><div class="tl-binrow"></div>`);
    const row = bin.querySelector(".tl-binrow");
    (act.locked || []).filter(l => l.cls === c.id).forEach(l => {
      row.appendChild(el("tl-thumb locked", itemMedia(l, "") + `<span class="lockmark">🔒</span>`));
    });
    bin.addEventListener("dragover", e => { e.preventDefault(); bin.classList.add("tl-hover"); });
    bin.addEventListener("dragleave", () => bin.classList.remove("tl-hover"));
    bin.addEventListener("drop", e => { e.preventDefault(); bin.classList.remove("tl-hover"); if (selected) place(selected, c.id); });
    bin.addEventListener("click", () => { if (selected) place(selected, c.id); });
    binBoxes[c.id] = bin;
    binsCol.appendChild(bin);
  });
  const cardEls = {};
  act.pool.forEach(it => {
    const card = el("tl-card", itemMedia(it, "") + `<span>${it.label}</span>`, "button");
    card.type = "button"; card.draggable = true;
    card.addEventListener("dragstart", () => { selectCard(it, card); });
    card.addEventListener("click", () => { selectCard(it, card); });
    cardEls[it.id] = card;
    cardsBox.appendChild(card);
  });
  function selectCard(it, card){
    if (done) return;
    Object.values(cardEls).forEach(x => x.classList.remove("tl-sel"));
    selected = it;
    card.classList.add("tl-sel");
  }
  function place(it, clsId){
    if (done) return;
    act._assign[it.id] = clsId;
    const card = cardEls[it.id];
    card.classList.add("hidden-card");
    card.classList.remove("tl-sel");
    const thumb = el("tl-thumb", itemMedia(it, ""), "button");
    thumb.type = "button";
    thumb.title = it.label + "(點擊取回)";
    thumb.addEventListener("click", e => {
      if (done) return;
      e.stopPropagation();
      delete act._assign[it.id];
      thumb.remove();
      card.classList.remove("hidden-card");
      refresh();
    });
    binBoxes[clsId].querySelector(".tl-binrow").appendChild(thumb);
    selected = null;
    refresh();
  }
  function refresh(){
    const remaining = act.pool.filter(it => !act._assign[it.id]).length;
    leftNote.textContent = remaining ? `還剩 ${remaining} 張` : "全部放好了!";
    act.classes.forEach(c => {
      const n = (act.locked || []).filter(l => l.cls === c.id).length +
        act.pool.filter(it => act._assign[it.id] === c.id).length;
      binBoxes[c.id].querySelector(".tl-count").textContent = n;
    });
    trainBtn.disabled = remaining > 0;
  }
  function onTrain(){
    const wrongN = act.pool.filter(it => act._assign[it.id] !== it.cls).length;
    if (first){ act._tlFirst = wrongN === 0; record(st, wrongN === 0); first = false; }
    trainBtn.disabled = true;
    panel().classList.add("tl-training");
    setTimeout(() => {
      panel().classList.remove("tl-training");
      if (wrongN > 0){
        failUI(f, actions, `有 ${wrongN} 張資料標錯,模型學亂了!點縮圖取回,放到對的類別`, () => {
          f.style.display = "none";
          actions.innerHTML = ""; actions.appendChild(trainBtn);
          refresh();
        });
        return;
      }
      done = true;
      testArea.innerHTML = `<h5>🔬 訓練完成!模擬測試中──</h5>`;
      body.insertBefore(testArea, f);
      act.tests.forEach((t, i) => {
        setTimeout(() => {
          const cls = act.classes.find(c => c.id === t.expect);
          testArea.appendChild(el("tl-test",
            itemMedia(t, "") + `<span>${t.label}</span><span class="tl-arrow">→</span>` +
            `<b>${cls.icon || ""} ${cls.label}</b><span class="tl-ok">✓</span>`));
          speak(t.label + ",分到" + cls.label);
          if (i === act.tests.length - 1){
            setTimeout(() => {
              actions.innerHTML = "";
              actions.appendChild(mainBtn("繼續 →", () => taskNext(st)));
              botReact("ok");
            }, 700);
          }
        }, 800 * (i + 1));
      });
    }, 1100);
  }
  refresh();
  body.appendChild(f); body.appendChild(actions);
  actions.appendChild(trainBtn);
  body.appendChild(el("", `<p style="font-size:12.5px;color:var(--ink-2);text-align:center;margin-top:8px">${act.hint || "點一張照片,再點右邊的類別(也可以拖過去);放錯了點縮圖取回"}</p>`));
}

/* ── 總結 ── */
function pct(r){ return r.t ? Math.round(r.c / r.t * 100) : 0; }
function showSummary(){
  $("#dialog").style.display = "none";
  $("#summary").style.display = "block";
  const col = DOMAIN_COLORS[MOD.domain];
  const rows = Object.entries(MOD.compMeta).map(([code, meta]) => {
    const r = results[code];
    const lp = pct(r.learn), qp = pct(r.quiz);
    const gain = qp - lp;
    const pass = qp > 60;
    return `
      <div class="comp-row">
        <div class="top">
          <span class="ctag" style="background:${col}">${meta.label}</span>
          <b>${meta.name}</b>
          <span class="badge ${pass ? "pass" : "nopass"}">${pass ? "✓ 已掌握" : "再練習一次"}</span>
        </div>
        <div class="nums">
          <span>學習任務 <b>${lp}%</b>(${r.learn.c}/${r.learn.t})</span>
          <span>測驗任務 <b>${qp}%</b>(${r.quiz.c}/${r.quiz.t})</span>
          <span>Learning gain <b>${gain >= 0 ? "+" : ""}${gain}%</b></span>
        </div>
      </div>`;
  }).join("");
  $("#sum-panel").innerHTML = `
    <h2>🎉 ${MOD.scene}任務完成!</h2>
    <p class="sub">${MOD.tag}(${VER} 版)・首次作答計分・測驗 &gt;60% 即掌握・gain = 測驗 − 學習</p>
    ${rows}
    <div class="sum-actions">
      <button type="button" class="btn-sub" id="sum-menu2">回選單</button>
      <button type="button" class="btn-main" id="sum-menu">完成</button>
    </div>`;
  $("#sum-menu").addEventListener("click", quitToMenu);
  $("#sum-menu2").addEventListener("click", quitToMenu);
}

/* ── 綁定 ── */
$("#dlg-box").addEventListener("click", advanceDialog);
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && $("#dialog").style.display === "block") advanceDialog();
});
$("#quit-btn").addEventListener("click", quitToMenu);
$("#tts-btn").addEventListener("click", () => {
  ttsOn = !ttsOn;
  if (!ttsOn) speechSynthesis?.cancel();
  $("#tts-btn").classList.toggle("tts-off", !ttsOn);
});
renderMenu();
