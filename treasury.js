/* ================= 珍品馆 · 数字讲解员（真人口播 + 图文同步） =================
   照片级讲解员「文昭」驻场，真人真声逐件导览五件镇馆珍品；
   口唇随讲解音频自然开合、声波实时起伏，字幕与图文考据点按讲解进度同步高亮，
   可暂停、拖动进度、点段重听，并可调阅实物影像、六步工艺流程与工艺知识卡。
   纯离线：音频/人像/影像全部内联，无外部依赖。 */

/* 精简全局：仅承载当前展品，供 L2/L3 层（treasury-process.js）引用 */
var T3D = { cur: null, idx: 0 };

var TH = {
  idx: 0,
  segs: [],                 // 三件分段（字幕段，与 points 一一对应）
  audio: null,
  ac: null, analyser: null, freq: null, srcNode: null,
  level: 0,
  rafId: 0,
  muted: false,
  dragging: false,
  inited: false
};

var TH_SHORT = { junci: "钧瓷", ruci: "汝瓷", sancai: "唐三彩", nigugu: "泥咕咕", ninigou: "泥泥狗", yuju: "豫剧", quju: "曲剧", zhuizi: "坠子", majie: "书会", shuixi: "水席", bianxiu: "汴绣", zhuxian: "年画", shaolin: "少林", taiji: "太极", dahuatie: "打铁花" };

/* ---------- 工具 ---------- */
function $q(sel, root) {
  return (root || document).querySelector(sel);
}
function $qa(sel, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}
function fmtTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  var m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return (m < 10 ? "0" : "") + m + ":" + (ss < 10 ? "0" : "") + ss;
}

/* 将讲解词切为 3 段（与 3 个图文考据点一一对应）；句不足时按逗号补切 */
function split3(text) {
  var sents = [], buf = "";
  for (var i = 0; i < text.length; i++) {
    buf += text[i];
    var c = text[i];
    if (c === "。" || c === "！" || c === "？" || c === "；") { sents.push(buf); buf = ""; }
  }
  if (buf.trim()) sents.push(buf);
  var guard = 0;
  while (sents.length < 3 && guard++ < 12) {
    var k = 0;
    for (var j = 1; j < sents.length; j++) if (sents[j].length > sents[k].length) k = j;
    var str = sents[k], ci = str.indexOf("，");
    if (ci < 2 || ci > str.length - 4) break;
    sents.splice(k, 1, str.slice(0, ci + 1), str.slice(ci + 1));
  }
  /* 多于 3 段时，把尾段并入第 3 段 */
  while (sents.length > 3) {
    sents[2] = sents[2] + sents[3];
    sents.splice(3, 1);
  }
  return sents.map(function (s) { return s.trim(); }).filter(Boolean);
}

/* 按字数比例计算每段时间区间（中文朗读近似均匀） */
function segBounds(segs, dur) {
  var lens = segs.map(function (s) { return Array.from(s).length; });
  var total = lens.reduce(function (a, b) { return a + b; }, 0) || 1;
  var acc = 0, out = [];
  for (var i = 0; i < segs.length; i++) {
    var st = dur * acc / total;
    acc += lens[i];
    out.push([st, dur * acc / total]);
  }
  return out;
}

/* ---------- 视图 ---------- */
function thIconPlay() {
  return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.52.86l10.2-6.5a1 1 0 0 0 0-1.72L9.52 4.64A1 1 0 0 0 8 5.5z"/></svg>';
}
function thIconPause() {
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.1"/><rect x="14" y="5" width="4" height="14" rx="1.1"/></svg>';
}

function treasuryHTML() {
  var wave = "";
  for (var i = 0; i < 5; i++) wave += '<i></i>';
  return '' +
  '<div class="treasury-wrap" id="th-wrap">' +
    '<div class="th-head">' +
      '<div class="th-kicker">数字讲解员 · 珍品馆</div>' +
      '<h2 class="th-title">真人口播 · 珍宝十五讲</h2>' +
      '<p class="th-sub">数字讲解员「文昭」以真人真声逐件导览，口唇随音起伏，字幕与图文考据点同步呈现；可暂停、拖动进度、点段重听。</p>' +
    '</div>' +
    '<div class="th-main">' +
      '<div class="th-stage">' +
        '<button class="th-mute" id="th-mute" type="button" aria-label="讲解声音开关" title="讲解声音开关">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M11 5 6.5 9H3v6h3.5L11 19V5z"/><path class="mute-off" d="M15.5 9a4 4 0 0 1 0 6"/><path class="mute-off" d="M18 6.5a8 8 0 0 1 0 11"/><path class="mute-on" d="m16 9.5 5 5m0-5-5 5" style="display:none"/></svg>' +
        '</button>' +
        '<div class="th-docent" id="th-docent">' +
          '<img class="td-face td-close" id="td-close" src="assets/guide-close.jpg" alt="数字讲解员文昭（静）">' +
          '<img class="td-face td-talk" id="td-talk" src="assets/guide-talk.jpg" alt="数字讲解员文昭（讲解中）">' +
          '<div class="td-wave" id="td-wave">' + wave + '</div>' +
          '<div class="td-nameplate">数字讲解员 · 文昭</div>' +
        '</div>' +
        '<div class="th-showcase">' +
          '<div class="ts-halo"></div>' +
          '<div class="ts-case"><img id="ts-img" alt="当前讲解的实物影像"></div>' +
          '<div class="ts-plinth">' +
            '<div class="ts-name" id="ts-name"></div>' +
            '<div class="ts-meta" id="ts-meta"></div>' +
          '</div>' +
        '</div>' +
        '<div class="th-caption">' +
          '<div class="cap-segs" id="cap-segs"></div>' +
          '<div class="cap-text" id="cap-text">点击播放，听讲解员为您讲述……</div>' +
        '</div>' +
        '<div class="th-controls">' +
          '<button class="th-play" id="th-play" type="button" aria-label="播放讲解">' + thIconPlay() + '</button>' +
          '<span class="th-time" id="th-time">00:00 / 00:00</span>' +
          '<div class="th-bar" id="th-bar"><i class="th-bar-fill" id="th-fill"></i><span class="th-bar-ticks" id="th-ticks"></span></div>' +
          '<button class="th-step" id="th-prev" type="button">上一件</button>' +
          '<button class="th-step" id="th-next" type="button">下一件</button>' +
        '</div>' +
        '<audio id="th-audio" preload="metadata"></audio>' +
      '</div>' +
      '<aside class="th-panel">' +
        '<div class="th-art-row" id="th-arts"></div>' +
        '<div class="th-card" id="th-infocard">' +
          '<div class="tc-title">展品档案</div>' +
          '<div class="tc-body" id="tc-body"></div>' +
        '</div>' +
        '<div class="th-card">' +
          '<div class="tc-title">图文考据 · 随讲解同步点亮</div>' +
          '<div class="th-points" id="th-points"></div>' +
        '</div>' +
        '<div class="th-grid">' +
          '<button class="th-btn" id="th-real" type="button">实物影像</button>' +
          '<button class="th-btn" id="th-proc" type="button">工艺流程</button>' +
          '<button class="th-btn" id="th-know" type="button">工艺知识</button>' +
          '<button class="th-btn th-btn-3d" id="th-3d-bowl" type="button">3D 汝瓷展柜</button>' +
          '<button class="th-btn th-btn-3d" id="th-3d-mortise" type="button">榫卯拆解</button>' +
        '</div>' +
      '</aside>' +
    '</div>' +
  '</div>';
}

/* ---------- 渲染入口 ---------- */
function renderTreasury() {
  var root = $q("#view-treasury");
  if (!root) return;
  root.innerHTML = treasuryHTML();
  TH.audio = $q("#th-audio");
  TH.ac = null; TH.analyser = null; TH.freq = null; TH.srcNode = null;
  TH.level = 0;
  cancelAnimationFrame(TH.rafId);
  bindTreasuryUI();
  loadArtifact(TH.idx, false);
  thLoop();
}

/* ---------- 绑定 ---------- */
function bindTreasuryUI() {
  var root = $q("#view-treasury");
  $q("#th-play", root).addEventListener("click", function () {
    if (TH.audio.paused) playAudio();
    else { TH.audio.pause(); }
  });
  TH.audio.addEventListener("play", function () {
    $q("#th-play").innerHTML = thIconPause();
    $q("#th-docent").classList.add("speaking");
  });
  TH.audio.addEventListener("pause", function () {
    $q("#th-play").innerHTML = thIconPlay();
    $q("#th-docent").classList.remove("speaking");
    setTalk(0);
  });
  TH.audio.addEventListener("ended", function () {
    $q("#th-play").innerHTML = thIconPlay();
    $q("#th-docent").classList.remove("speaking");
    setTalk(0);
    $qa("#cap-segs .cap-seg").forEach(function (s) { s.classList.add("done"); s.classList.remove("on"); });
  });

  /* 上一件 / 下一件 */
  $q("#th-prev", root).addEventListener("click", function () {
    loadArtifact((TH.idx + TREASURY_ARTIFACTS.length - 1) % TREASURY_ARTIFACTS.length, true);
  });
  $q("#th-next", root).addEventListener("click", function () {
    loadArtifact((TH.idx + 1) % TREASURY_ARTIFACTS.length, true);
  });

  /* 五件切换 */
  $q("#th-arts", root).addEventListener("click", function (e) {
    var b = e.target.closest(".th-art");
    if (!b) return;
    loadArtifact(+b.getAttribute("data-i"), true);
  });

  /* 图文考据 / 字幕段：点击跳段重听 */
  $q("#th-points", root).addEventListener("click", function (e) {
    var p = e.target.closest(".tp-pt");
    if (!p) return;
    seekSegment(+p.getAttribute("data-i"));
  });
  $q("#cap-segs", root).addEventListener("click", function (e) {
    var s = e.target.closest(".cap-seg");
    if (!s) return;
    seekSegment(+s.getAttribute("data-i"));
  });

  /* 进度条：点击与拖动 seek */
  var bar = $q("#th-bar", root);
  function barSeek(e) {
    if (!TH.audio || !isFinite(TH.audio.duration)) return;
    var r = bar.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var ratio = Math.max(0, Math.min(1, x / r.width));
    TH.audio.currentTime = ratio * TH.audio.duration;
    updateClockUI();
  }
  bar.addEventListener("pointerdown", function (e) {
    TH.dragging = true;
    bar.setPointerCapture && bar.setPointerCapture(e.pointerId);
    barSeek(e);
  });
  bar.addEventListener("pointermove", function (e) { if (TH.dragging) barSeek(e); });
  bar.addEventListener("pointerup", function () { TH.dragging = false; });
  bar.addEventListener("pointercancel", function () { TH.dragging = false; });

  /* 静音开关 */
  try { TH.muted = localStorage.getItem("fy_th_muted") === "1"; } catch (e) { TH.muted = false; }
  applyMute();
  $q("#th-mute", root).addEventListener("click", function () {
    TH.muted = !TH.muted;
    try { localStorage.setItem("fy_th_muted", TH.muted ? "1" : "0"); } catch (e) {}
    applyMute();
  });

  /* 三个功能按钮 */
  $q("#th-real", root).addEventListener("click", openReal);
  $q("#th-proc", root).addEventListener("click", function () {
    if (typeof openProcess === "function") openProcess();
  });
  $q("#th-know", root).addEventListener("click", function () {
    if (typeof openKnow === "function") openKnow();
  });

  /* WebGL 3D 展柜（懒初始化，移动端隐藏） */
  var btnBowl = $q("#th-3d-bowl", root);
  var btnMortise = $q("#th-3d-mortise", root);
  if (FY3D.isMobile) {
    if (btnBowl) btnBowl.style.display = "none";
    if (btnMortise) btnMortise.style.display = "none";
  } else {
    if (btnBowl) btnBowl.addEventListener("click", function () { open3DShowcase("bowl"); });
    if (btnMortise) btnMortise.addEventListener("click", function () { open3DShowcase("mortise"); });
  }

  /* 离开珍品馆时暂停讲解（全局只绑一次） */
  if (!TH.inited) {
    TH.inited = true;
    window.addEventListener("hashchange", function () {
      var h = location.hash;
      if (h.indexOf("treasury") === -1 && TH.audio) {
        TH.audio.pause();
      }
    });
  }
}

function applyMute() {
  if (TH.audio) TH.audio.volume = TH.muted ? 0 : 1;
  var btn = $q("#th-mute");
  if (!btn) return;
  btn.classList.toggle("is-muted", TH.muted);
  var off = btn.querySelector(".mute-off"), on = btn.querySelector(".mute-on");
  if (off) off.style.display = TH.muted ? "none" : "";
  if (on) on.style.display = TH.muted ? "" : "none";
}

/* ---------- 播放与音频分析 ---------- */
function ensureAudioGraph() {
  if (!TH.ac) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    TH.ac = new AC();
    TH.srcNode = TH.ac.createMediaElementSource(TH.audio);
    TH.analyser = TH.ac.createAnalyser();
    TH.analyser.fftSize = 256;
    TH.analyser.smoothingTimeConstant = 0.55;
    TH.srcNode.connect(TH.analyser);
    TH.analyser.connect(TH.ac.destination);
    TH.freq = new Uint8Array(TH.analyser.frequencyBinCount);
  }
  if (TH.ac.state === "suspended") TH.ac.resume();
}

function playAudio() {
  ensureAudioGraph();
  applyMute();
  var pr = TH.audio.play();
  if (pr && pr.catch) pr.catch(function () {});
}

function seekSegment(i) {
  var a = TH.audio;
  if (!a || !isFinite(a.duration) || !TH.segs.bounds) return;
  var b = TH.segs.bounds[i];
  if (!b) return;
  a.currentTime = Math.max(0, b[0] + 0.02);
  updateClockUI();
  if (a.paused) playAudio();
}

/* ---------- 展品切换 ---------- */
function loadArtifact(i, autoplay) {
  var a = TREASURY_ARTIFACTS[i];
  if (!a) return;
  TH.idx = i;
  T3D.cur = a; T3D.idx = i;
  TH.segs = { text: split3(a.audio), bounds: [] };
  TH.level = 0;

  if (TH.audio) {
    TH.audio.pause();
    TH.audio.src = (typeof T3D_AUDIO !== "undefined" && T3D_AUDIO[a.id]) ? T3D_AUDIO[a.id] : "";
    TH.audio.load();
  }

  /* 展柜实物图与铭牌 */
  var real = (typeof TREASURY_REAL !== "undefined") ? TREASURY_REAL[a.id] : null;
  var img = $q("#ts-img");
  if (img) {
    img.src = real && real.src ? real.src : "assets/" + a.id + ".jpg";
    img.alt = a.name + " 实物影像";
  }
  var nameEl = $q("#ts-name");
  if (nameEl) nameEl.textContent = a.name;
  var metaEl = $q("#ts-meta");
  if (metaEl) metaEl.textContent = a.place + " · " + a.level + " · 通高约 " + a.heightCm + " cm";

  /* 展品档案卡 */
  var info = $q("#tc-body");
  if (info) {
    info.innerHTML =
      '<div class="ti-row"><span>名称</span><b>' + a.name + '</b></div>' +
      '<div class="ti-row"><span>产地</span><b>' + a.place + '</b></div>' +
      '<div class="ti-row"><span>级别</span><b>' + a.level + '</b></div>' +
      (a.heightCm && a.heightCm > 0 ? '<div class="ti-row"><span>通高</span><b>约 ' + a.heightCm + ' cm</b></div>' : '') +
      '<div class="ti-row"><span>门类</span><b>' + a.cat + ' 类</b></div>';
  }

  /* 五件切换 */
  $q("#th-arts").innerHTML = TREASURY_ARTIFACTS.map(function (x, k) {
    return '<button class="th-art' + (k === i ? " on" : "") + '" data-i="' + k + '" type="button">' +
      (TH_SHORT[x.id] || x.name) + '</button>';
  }).join("");

  /* 图文考据点 */
  $q("#th-points").innerHTML = a.points.map(function (p, k) {
    return '<button class="tp-pt" data-i="' + k + '" type="button">' +
      '<span class="pp-sn">' + ["壹", "贰", "叁"][k] + "</span>" +
      '<span class="pp-body"><b>' + p.name + '</b><i>' + p.text + '</i></span></button>';
  }).join("");

  /* 字幕段 */
  $q("#cap-segs").innerHTML = TH.segs.text.map(function (s, k) {
    return '<button class="cap-seg" data-i="' + k + '" type="button">' + (a.points[k] ? a.points[k].name : "第 " + (k + 1) + " 段") + '</button>';
  }).join("");
  $q("#cap-text").textContent = "点击播放，听讲解员为您讲述……";
  $q("#th-time").textContent = "00:00 / 00:00";
  $q("#th-fill").style.width = "0%";
  renderTicks();
  $q("#th-play").innerHTML = thIconPlay();

  /* 静音图标沿用 */
  applyMute();

  /* L2 工艺演示若开着，随展品切换 */
  if (typeof onArtifactProcess === "function") {
    try { onArtifactProcess(); } catch (e) {}
  }

  if (autoplay) playAudio();
}

/* 进度条分段刻度 */
function renderTicks() {
  var ticks = $q("#th-ticks");
  if (!ticks) return;
  var a = TREASURY_ARTIFACTS[TH.idx];
  var segs = TH.segs.text || [];
  var lens = segs.map(function (s) { return Array.from(s).length; });
  var total = lens.reduce(function (x, y) { return x + y; }, 0) || 1;
  var acc = 0, html = "";
  for (var i = 0; i < segs.length - 1; i++) {
    acc += lens[i];
    html += '<i style="left:' + (acc / total * 100) + '%"></i>';
  }
  ticks.innerHTML = html;
}

/* ---------- 主循环：口型 / 声波 / 时钟 ---------- */
function setTalk(v) {
  var talk = $q("#td-talk"), close = $q("#td-close");
  if (!talk || !close) return;
  talk.style.opacity = v.toFixed(3);
  close.style.opacity = (1 - v).toFixed(3);
}

function thLoop() {
  TH.rafId = requestAnimationFrame(thLoop);
  var a = TH.audio;
  if (!a) return;

  /* 口型与声波 */
  var waveEl = $q("#td-wave");
  var bars = waveEl ? waveEl.querySelectorAll("i") : [];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (TH.analyser && TH.freq && !a.paused && !reduced) {
    TH.analyser.getByteFrequencyData(TH.freq);
    var e = 0;
    for (var b = 2; b <= 10; b++) e += TH.freq[b];
    e /= 9;
    var target = Math.max(0, Math.min(1, (e - 24) / 60));
    TH.level += (target - TH.level) * 0.4;
    for (var k = 0; k < bars.length; k++) {
      var v = TH.freq[2 + k * 4] || 0;
      var sc = 0.14 + Math.pow(v / 255, 1.3) * 0.95;
      bars[k].style.transform = "scaleY(" + sc.toFixed(3) + ")";
    }
  } else {
    TH.level += (0 - TH.level) * 0.25;
    for (var k2 = 0; k2 < bars.length; k2++) bars[k2].style.transform = "scaleY(0.14)";
  }
  setTalk(TH.level);

  /* 时钟：进度 / 字幕 / 分段高亮 */
  if (isFinite(a.duration) && a.duration > 0) {
    if (!TH.segs.bounds || TH.segs.bounds.length !== TH.segs.text.length) {
      TH.segs.bounds = segBounds(TH.segs.text, a.duration);
    }
    updateClockUI();
  }
}

function updateClockUI() {
  var a = TH.audio;
  if (!a || !isFinite(a.duration)) return;
  var ratio = Math.max(0, Math.min(1, a.currentTime / a.duration));
  $q("#th-fill").style.width = (ratio * 100) + "%";
  $q("#th-time").textContent = fmtTime(a.currentTime) + " / " + fmtTime(a.duration);

  var cur = -1;
  for (var i = 0; i < TH.segs.bounds.length; i++) {
    if (a.currentTime >= TH.segs.bounds[i][0] && a.currentTime < TH.segs.bounds[i][1]) { cur = i; break; }
  }
  if (cur === -1 && a.ended) cur = TH.segs.bounds.length - 1;

  var segBtns = $qa("#cap-segs .cap-seg");
  segBtns.forEach(function (s, k) {
    s.classList.toggle("on", k === cur && !a.paused);
    s.classList.toggle("done", k < cur || a.ended);
  });
  var pts = $qa("#th-points .tp-pt");
  pts.forEach(function (p, k) { p.classList.toggle("on", k === cur && !a.paused); });
  if (cur >= 0 && TH.segs.text[cur]) $q("#cap-text").textContent = TH.segs.text[cur];
}

/* ---------- 实物影像弹窗（真实文物照片 · 离线内联） ---------- */
function openReal() {
  if (!T3D.cur) return;
  var a = T3D.cur;
  var real = (typeof TREASURY_REAL !== "undefined") ? TREASURY_REAL[a.id] : null;
  if (!real || !real.src) {
    var img = $q("#ts-img");
    if (img && img.src) { /* 退而求其次：展柜图已有 */ }
    else { alert("该器物的实物影像尚未收录"); return; }
  }
  if (!document.getElementById("tr-style")) {
    var st = document.createElement("style");
    st.id = "tr-style";
    st.textContent =
      "#t3d-real{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(10,8,6,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .28s}" +
      "#t3d-real.on{opacity:1}" +
      ".tr-case{position:relative;width:min(860px,92vw);max-height:90vh;background:linear-gradient(160deg,#221a12,#2e241a 55%,#1c1510);" +
      "border:1px solid rgba(208,178,112,.5);border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.55),inset 0 0 60px rgba(255,220,160,.05);" +
      "display:flex;flex-direction:column;overflow:hidden;transform:translateY(14px) scale(.985);transition:transform .28s}" +
      "#t3d-real.on .tr-case{transform:none}" +
      ".tr-head{display:flex;align-items:center;gap:12px;padding:16px 20px 10px}" +
      ".tr-seal{flex:none;width:34px;height:34px;border-radius:6px;background:linear-gradient(145deg,#c2341d,#8f1d10);" +
      "color:#f7ecd8;font:700 17px/34px 'Noto Serif SC',serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.4)}" +
      ".tr-name{font:700 clamp(17px,2.4vw,24px)/1.2 'Noto Serif SC',serif;color:#f2e6c8;letter-spacing:.05em}" +
      ".tr-x{margin-left:auto;flex:none;width:32px;height:32px;border-radius:50%;border:1px solid rgba(208,178,112,.4);" +
      "background:rgba(255,255,255,.05);color:#e8dcc0;font-size:18px;line-height:30px;cursor:pointer;transition:.2s}" +
      ".tr-x:hover{background:rgba(194,52,29,.75);border-color:transparent;color:#fff}" +
      ".tr-img{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:6px 20px}" +
      ".tr-img img{max-width:100%;max-height:58vh;border-radius:8px;box-shadow:0 10px 34px rgba(0,0,0,.5);border:1px solid rgba(255,235,200,.18)}" +
      ".tr-foot{padding:12px 20px 16px;border-top:1px solid rgba(208,178,112,.22)}" +
      ".tr-note{font:400 12.5px/1.7 'Noto Sans SC',sans-serif;color:#cfc3a4;letter-spacing:.02em}" +
      ".tr-note b{color:#e8d9b0;font-weight:600}" +
      ".tr-hint{display:block;margin-top:6px;font-size:11px;color:#94876a;letter-spacing:.06em}";
    document.head.appendChild(st);
  }
  var ov = document.getElementById("t3d-real");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "t3d-real";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "实物影像");
    ov.style.display = "flex";
    ov.innerHTML =
      '<div class="tr-case">' +
      '<div class="tr-head"><span class="tr-seal">真</span><span class="tr-name"></span>' +
      '<button class="tr-x" aria-label="关闭">&#10005;</button></div>' +
      '<div class="tr-img"><img alt="实物影像"></div>' +
      '<div class="tr-foot"><div class="tr-note"></div><span class="tr-hint">真实文物影像 · 与讲解员所述逐件对照 · 影像仅作展示与科普</span></div>' +
      "</div>";
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest(".tr-x")) closeReal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ov.classList.contains("on")) closeReal();
    });
  }
  ov.style.display = "flex";
  ov.querySelector(".tr-name").textContent = a.name;
  ov.querySelector(".tr-img img").src = real.src;
  var noteHtml = real.note
    ? "<b>" + real.note.split("｜")[0] + "</b>｜" + real.note.split("｜").slice(1).join("｜")
    : "综合公开馆藏影像与权威资料整理，为数字复原示意参考。";
  ov.querySelector(".tr-note").innerHTML = noteHtml +
    "<br>通高约 " + a.heightCm + " cm · " + a.place + " · " + a.level;
  setTimeout(function () { ov.classList.add("on"); }, 20);
}

function closeReal() {
  var ov = document.getElementById("t3d-real");
  if (!ov) return;
  ov.classList.remove("on");
  setTimeout(function () { if (!ov.classList.contains("on")) ov.style.display = "none"; }, 300);
}
