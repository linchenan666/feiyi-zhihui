/* ============================================================
   非遗智汇 · 视图与交互层
   app.js —— 数据来自 data.js，本文件只负责渲染与逻辑
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     远程大模型接入位（双层架构）
     演示阶段 enabled=false，走内置知识库，保证离线可跑。
     接入豆包/千问时：enabled=true 并填写 url/key，
     然后实现 fetchRemoteAnswer() 内的请求即可点亮"真·大模型回答"。
     （注意：file:// 协议下 fetch 会被浏览器拦截，
      接入远程 API 时需本地起服务或部署到线上）
     ---------------------------------------------------------- */
  var REMOTE_API = {
    enabled: false,
    url: "",      // 例如 https://ark.cn-beijing.volces.com/api/v3/chat/completions
    key: "",      // API Key
    model: ""     // 例如 doubao-seed-1-6-250615
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var byId = FEIYI_DATA, cats = FEIYI_CATEGORIES, cities = HENAN_CITIES, kin = GRAPH_KIN;

  var CAT_COLOR = {
    "戏曲": "#B03A2E", "曲艺": "#A67C2E", "技艺": "#7A4E5E",
    "美术": "#5E7A78", "体育": "#4E5B4E", "民俗": "#C2702D"
  };

  var itemById = {};
  byId.forEach(function (it) { itemById[it.id] = it; });

  /* ================= 路由 ================= */
  var routes = ["home", "hall", "item", "map", "graph", "ask", "create", "immerse"];

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "") || "home";
    var parts = h.split("/");
    return { view: parts[0] || "home", id: parts[1] || "" };
  }

  function navigate() {
    var r = parseHash();
    if (routes.indexOf(r.view) < 0) r.view = "home";
    document.body.classList.toggle("vt-on", HAS_VT);
    transition(function () { showView(r); });
  }

  function showView(r) {
    /* 离开视图时停掉隐藏视图的常驻定时器（沉浸轮播 / AI 打字机） */
    clearInterval(immerseTimer);
    clearInterval(typingTimer);
    $$(".view").forEach(function (v) { v.classList.remove("active"); });
    var el = $("#view-" + r.view);
    if (!el) { el = $("#view-home"); r.view = "home"; }
    el.classList.add("active");
    el.scrollTop = 0;

    /* 导航态 */
    $$("#main-nav a").forEach(function (a) {
      var on = a.getAttribute("data-nav") === r.view ||
        (r.view === "item" && a.getAttribute("data-nav") === "hall") ||
        (r.view === "immerse" && a.getAttribute("data-nav") === "ask");
      a.classList.toggle("on", on);
    });
    $("#main-nav").classList.remove("open");
    $("#nav-burger").classList.remove("open");
    $("#nav-burger").setAttribute("aria-expanded", "false");

    /* 渲染当前视图 */
    var R = {
      home: renderHome, hall: renderHall, item: function () { renderItem(r.id); },
      map: renderMap, graph: renderGraph, ask: renderAsk,
      create: renderCreate, immerse: renderImmerse
    };
    if (R[r.view]) R[r.view]();
    else renderHome();
  }

  window.addEventListener("hashchange", navigate);

  /* ================= 动效引擎（世界级站点语言） ================= */
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE_POINTER = window.matchMedia("(pointer: fine)").matches;
  var HAS_VT = !!document.startViewTransition;

  function initLenis() {
    if (REDUCED || typeof Lenis === "undefined") return; /* 离线/降级回退原生滚动 */
    var lenis = new Lenis({ duration: 1.0, smoothWheel: true, wheelMultiplier: 1.0 });
    window.__lenis = lenis;
    var rafId = null;
    function loop(t) { lenis.raf(t); rafId = requestAnimationFrame(loop); }
    function resume() { if (rafId === null) rafId = requestAnimationFrame(loop); }
    function pause() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else resume();
    });
    resume();
  }

  function scrollTopNow() {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "auto" });
  }

  function initScrollProgress() {
    var bar = $("#scroll-progress");
    if (!bar) return;
    var ticking = false;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /* 滚动揭示：元素进入视口 → .rv.in（一次触发，克制） */
  var revealIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }) : null;
  function observeReveals(scope) {
    $$(".rv", scope).forEach(function (el) {
      if (el.classList.contains("in")) return;
      /* 已在视口内则立即显现，不依赖 IO/transition 时序（防闪烁与截图） */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("in");
        el.style.transition = "none";
        return;
      }
      if (revealIO) revealIO.observe(el);
    });
  }

  /* 指针动效统一处理器：磁性按钮 + 卡片 3D 倾斜。
     单监听 + rAF 节流（每帧至多一次布局读）；激活元素用快过渡、
     离开时清空并还原 CSS 过渡，避免与 .card:hover 的 transform 过渡打架导致滞后。 */
  function initPointerFX() {
    if (REDUCED || !FINE_POINTER) return;
    var tiltCard = null, pending = false, lx = 0, ly = 0, target = null;
    function release() {
      if (tiltCard) { tiltCard.style.transform = ""; tiltCard.style.transition = ""; tiltCard = null; }
      var m = target && target.closest ? target.closest(".mag") : null;
      if (m) { m.style.transform = ""; m.style.transition = ""; }
      target = null;
    }
    document.addEventListener("pointermove", function (e) {
      lx = e.clientX; ly = e.clientY; target = e.target;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        var t = target, r, dx, dy;
        /* 磁性按钮 */
        var m = t && t.closest ? t.closest(".mag") : null;
        if (m) {
          if (!m.style.transition) m.style.transition = "transform .16s ease-out";
          r = m.getBoundingClientRect();
          dx = (lx - (r.left + r.width / 2)) * 0.18;
          dy = (ly - (r.top + r.height / 2)) * 0.18;
          m.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
        }
        /* 卡片 3D 倾斜 */
        var c = t && t.closest ? t.closest(".card.tilt") : null;
        if (c) {
          if (c !== tiltCard) {
            if (tiltCard) { tiltCard.style.transform = ""; tiltCard.style.transition = ""; }
            tiltCard = c;
            c.style.transition = "transform .1s ease-out";
          }
          r = c.getBoundingClientRect();
          var px = (lx - r.left) / r.width - 0.5;
          var py = (ly - r.top) / r.height - 0.5;
          c.style.transform = "perspective(950px) rotateY(" + (px * 4.5).toFixed(2) + "deg) rotateX(" + (-py * 4.5).toFixed(2) + "deg) translateY(-4px)";
        } else if (tiltCard) {
          tiltCard.style.transform = ""; tiltCard.style.transition = "";
          tiltCard = null;
        }
      });
    }, { passive: true });
    document.addEventListener("pointerleave", release);
    document.addEventListener("scroll", release, { passive: true });
  }

  /* Hero 鼠标视差：背景与内容反方向轻移（视差作用于外层 zone，与 kenburns 动画分层不冲突） */
  function initHeroParallax() {
    var hero = $(".hero");
    if (!hero || REDUCED || !FINE_POINTER) return;
    var bg = $(".hero-bg-zone", hero), inner = $(".hero-inner", hero);
    if (!bg || !inner) return;
    var raf = null;
    hero.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        bg.style.transform = "translate(" + (nx * 18).toFixed(1) + "px," + (ny * 12).toFixed(1) + "px)";
        inner.style.transform = "translate(" + (nx * -9).toFixed(1) + "px," + (ny * -6).toFixed(1) + "px)";
        raf = null;
      });
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        bg.style.transform = ""; inner.style.transform = ""; raf = null;
      });
    });
  }

  /* 页面过渡：View Transitions 编排，不支持时直接切换 */
  function transition(fn) {
    if (document.startViewTransition) {
      var vt = document.startViewTransition(fn);
      if (vt && vt.finished) vt.finished.then(scrollTopNow);
    } else { fn(); scrollTopNow(); }
  }

  /* ================= 工具 ================= */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function defer(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

  /* ================= 收藏（localStorage 持久化 · M8） ================= */
  var favs = [];
  try { favs = JSON.parse(localStorage.getItem("fy_favs") || "[]"); } catch (e) { favs = []; }
  if (!(favs instanceof Array)) favs = [];
  function isFav(id) { return favs.indexOf(id) >= 0; }
  function toggleFav(id) {
    var i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    try { localStorage.setItem("fy_favs", JSON.stringify(favs)); } catch (e) {}
  }

  /* ================= 主题切换（宣纸 / 墨夜 · M8） ================= */
  function initTheme() {
    var btn = $("#theme-btn");
    if (!btn) return;
    var saved = "";
    try { saved = localStorage.getItem("fy_theme") || ""; } catch (e) {}
    if (saved === "night") document.documentElement.setAttribute("data-theme", "night");
    paintThemeIcon();
    btn.addEventListener("click", function () {
      var night = document.documentElement.getAttribute("data-theme") === "night";
      if (night) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", "night");
      try { localStorage.setItem("fy_theme", night ? "" : "night"); } catch (e) {}
      paintThemeIcon();
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", night ? "#F4EDDF" : "#191512");
    });
  }
  function paintThemeIcon() {
    var btn = $("#theme-btn");
    if (!btn) return;
    var night = document.documentElement.getAttribute("data-theme") === "night";
    btn.innerHTML = night
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4L19 19M19 5l-1.6 1.6M6.6 17.4L5 19"/></svg>';
  }

  /* ================= HOME ================= */
  function renderHome() {
    var el = $("#view-home");
    el.innerHTML =
      '<div class="hero">' +
        '<div class="hero-bg-zone"><div class="hero-bg" role="img" aria-label="河南非遗水墨长卷"></div></div>' +
        '<div class="hero-veil"></div>' +
        '<div class="hero-inner">' +
          '<span class="hero-tag">河南非遗 AI 数字展厅 · 2026</span>' +
          '<h1 class="hero-title">' +
            '<span class="row"><span>非遗智汇</span></span>' +
            '<span class="row"><span class="zh-hui">让非遗 · 开口说话</span></span>' +
          '</h1>' +
          '<p class="hero-sub">能看 · 能问 · 能关联 · 能生成 · 能沉浸——把河南非遗讲给你听，让大众看懂、有兴趣、愿意传承。</p>' +
          '<div class="hero-cta">' +
            '<a class="btn-enter" href="#/hall">步入展厅</a>' +
            '<a class="btn-ghost" href="#/ask">先问一个问题</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-metrics">' +
          '<div class="m"><b>15<i>项</i></b><span>招牌深挖</span></div>' +
          '<div class="m"><b>6<i>门类</i></b><span>全类覆盖</span></div>' +
          '<div class="m"><b>10<i>地市</i></b><span>河南版图</span></div>' +
          '<div class="m"><b>0<i>上传</i></b><span>纯本地运行</span></div>' +
        '</div>' +
        '<div class="hero-side">把非遗讲给你听 · HENAN ICH</div>' +
        '<div class="hero-scroll">向下</div>' +
      '</div>';
    initHeroParallax();
  }

  /* ================= HALL ================= */
  var hallFilter = "全部";
  function renderHall() {
    var el = $("#view-hall");
    el.innerHTML =
      '<div class="section-wrap hall">' +
        '<div class="section-head rv">' +
          '<div class="kicker">01 · 展品总览</div>' +
          '<h2 class="section-title">十五件河南珍宝</h2>' +
          '<p class="section-sub">从一声梆子腔到一窑窑变的火，六大门类、十五项国家级非遗，每一件都值得停下来看三分钟。</p>' +
        '</div>' +
        '<div class="filter-bar rv" style="--d:.1s" id="filter-bar">' +
          '<button class="' + (hallFilter === "全部" ? "on" : "") + '" data-f="全部">全部 · 15</button>' +
          '<button class="' + (hallFilter === "fav" ? "on" : "") + '" data-f="fav">已收藏 · ' + favs.length + '</button>' +
          cats.map(function (c) {
            var n = byId.filter(function (i) { return i.category === c.id; }).length;
            return '<button class="' + (hallFilter === c.id ? "on" : "") + '" data-f="' + c.id + '">' + c.label + ' · ' + n + '</button>';
          }).join("") +
        '</div>' +
        '<div class="grid" id="hall-grid"></div>' +
      '</div>';
    bindHallFilter();
    drawHallGrid();
    observeReveals(el);
  }

  function drawHallGrid() {
    var grid = $("#hall-grid");
    if (!grid) return;
    var list;
    if (hallFilter === "全部") list = byId;
    else if (hallFilter === "fav") list = byId.filter(function (i) { return isFav(i.id); });
    else list = byId.filter(function (i) { return i.category === hallFilter; });
    grid.innerHTML = list.map(function (it, k) {
      var g = byId.indexOf(it);
      return '<a class="card tilt rv" style="--d:' + (k * 0.06).toFixed(2) + 's" href="#/item/' + it.id + '" data-cat="' + it.category + '">' +
        '<div class="frame"><span class="num">' + pad(g + 1) + '</span>' +
        '<img src="' + it.img + '" alt="' + it.name + '" loading="lazy" decoding="async">' +
        '<span class="cat">' + it.category + '</span>' +
        '<span class="more">查看详情</span></div>' +
        '<div class="meta"><h3>' + it.name + '</h3>' +
        '<div class="en">' + esc(it.en) + '</div>' +
        '<p>' + esc(it.tagline.slice(0, 44)) + '…</p></div>' +
      '</a>';
    }).join("");
    observeReveals(grid);
  }

  function bindHallFilter() {
    var bar = $("#filter-bar");
    if (!bar) return;
    $$("button", bar).forEach(function (b) {
      b.addEventListener("click", function () {
        hallFilter = b.getAttribute("data-f");
        $$("button", bar).forEach(function (x) { x.classList.toggle("on", x === b); });
        drawHallGrid();
      });
    });
  }

  /* ================= ITEM ================= */
  function renderItem(id) {
    var it = itemById[id];
    var el = $("#view-item");
    if (!it) {
      el.innerHTML = '<div class="section-wrap" style="padding-top:120px"><p>未找到该展品。</p></div>';
      return;
    }
    var idx = byId.indexOf(it);
    var related = [];
    (it.rel.kin || []).forEach(function (kid) {
      var k = itemById[kid];
      if (k) related.push(k);
    });
    byId.forEach(function (x) {
      if (related.length >= 3) return;
      if (x.id !== it.id && x.category === it.category && related.indexOf(x) < 0) related.push(x);
    });
    if (related.length < 3) {
      byId.forEach(function (x) {
        if (related.length >= 3) return;
        if (x.id !== it.id && related.indexOf(x) < 0) related.push(x);
      });
    }

    el.innerHTML =
      '<div class="section-wrap item">' +
        '<a class="item-back rv" href="#/hall">返回展品总览</a>' +
        '<div class="item-layout">' +
          '<div class="item-figure rv"><div class="frame"><img src="' + it.img + '" alt="' + it.name + '" decoding="async">' +
            '<span class="seal">' + it.name.charAt(0) + '</span></div>' +
          '</div>' +
          '<div class="item-body">' +
            '<div class="kicker rv">' + pad(idx + 1) + ' · ' + it.category + '</div>' +
            '<h1 class="rv" style="--d:.08s">' + it.name + '</h1>' +
            '<div class="en-title rv" style="--d:.14s">' + esc(it.en) + ' · ' + esc(it.place) + '</div>' +
            '<div class="item-chips rv" style="--d:.2s">' +
              '<span class="chip hot">' + it.level + '</span>' +
              '<span class="chip">' + it.category + '</span>' +
              '<span class="chip">' + it.region + '</span>' +
            '</div>' +
            '<p class="item-tagline rv" style="--d:.26s">' + esc(it.tagline) + '</p>' +
            '<div class="item-section rv" style="--d:.32s"><h4>要点 · KEY POINTS</h4>' +
              '<ol class="points">' + it.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + '</ol>' +
            '</div>' +
            '<div class="item-section rv" style="--d:.38s"><h4>值得深挖 · GO DEEPER</h4>' +
              '<ul class="deep-list">' + it.deep.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + '</ul>' +
            '</div>' +
            '<div class="verify-box rv" style="--d:.44s"><h5>待核清单 · TO VERIFY</h5>' +
              it.verify.map(function (v) { return "<p>· " + esc(v) + "</p>"; }).join("") +
            '</div>' +
            '<div class="item-actions rv" style="--d:.5s">' +
              '<a class="act act-primary mag" href="#/ask">问 AI 讲解</a>' +
              '<button class="act act-line act-fav mag ' + (isFav(it.id) ? "on" : "") + '" id="btn-fav" type="button" aria-pressed="' + isFav(it.id) + '"><i class="heart">' + (isFav(it.id) ? "♥" : "♡") + '</i>' + (isFav(it.id) ? "已收藏" : "收藏") + '</button>' +
              '<a class="act act-line mag" href="#/immerse">沉浸演绎</a>' +
            '</div>' +
            '<p class="fav-tip rv" style="--d:.55s">收藏保存在本地浏览器，不联网、不上传。</p>' +
          '</div>' +
        '</div>' +
        (related.length ?
        '<div class="related rv" style="--d:.12s"><h3>关联展品</h3><div class="grid">' +
          related.map(function (r) {
            return '<a class="card tilt" href="#/item/' + r.id + '">' +
              '<div class="frame"><span class="num">' + pad(byId.indexOf(r) + 1) + '</span>' +
              '<img src="' + r.img + '" alt="' + r.name + '" loading="lazy" decoding="async">' +
              '<span class="cat">' + r.category + '</span>' +
              '<span class="more">查看详情</span></div>' +
              '<div class="meta"><h3>' + r.name + '</h3>' +
              '<div class="en">' + esc(r.en) + '</div></div>' +
            '</a>';
          }).join("") +
        '</div></div>' : "") +
      '</div>';
    bindItemFav(it.id);
    observeReveals(el);
  }

  function bindItemFav(id) {
    var btn = $("#btn-fav");
    if (!btn) return;
    btn.addEventListener("click", function () {
      toggleFav(id);
      var on = isFav(id);
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on);
      btn.innerHTML = '<i class="heart">' + (on ? "♥" : "♡") + '</i>' + (on ? "已收藏" : "收藏");
    });
  }

  /* ================= MAP ================= */
  var HENAN_LAND =
    'M 8 52 C 10 42 14 34 22 28 C 26 24 30 18 36 14 C 42 10 48 8 54 7 ' +
    'C 60 6 66 9 70 14 C 73 17 78 22 84 30 C 88 36 90 42 89 50 C 88 56 86 62 84 68 ' +
    'C 82 74 82 80 80 86 C 78 90 72 92 66 90 C 58 88 52 86 46 84 C 40 82 36 84 30 84 ' +
    'C 24 84 18 80 14 74 C 10 68 8 60 8 52 Z';

  var CITY_OFFSET = {};
  function dotPos(it) {
    var c = cities[it.region] || { x: 50, y: 50 };
    var arr = CITY_OFFSET[it.region] || (CITY_OFFSET[it.region] = []);
    var k = arr.length;
    arr.push(it.id);
    var offs = [[0, 0], [-3.2, -2.4], [3.2, 2.2], [0, 3.4], [-3.4, 1.6]];
    var o = offs[k % offs.length];
    return { x: c.x + o[0], y: c.y + o[1] };
  }

  function cityItems() {
    var m = {};
    byId.forEach(function (it) {
      (m[it.region] = m[it.region] || []).push(it);
    });
    return m;
  }

  function renderMap() {
    var el = $("#view-map");
    var groups = cityItems();
    var cityKeys = Object.keys(groups);
    el.innerHTML =
      '<div class="section-wrap map-view">' +
        '<div class="section-head rv">' +
          '<div class="kicker">02 · 非遗地图</div>' +
          '<h2 class="section-title">河南版图上的文化坐标</h2>' +
          '<p class="section-sub">十五项招牌非遗分布在中原大地的十个地市。悬停标点查看项目，点击进入详情。</p>' +
        '</div>' +
        '<div class="map-layout">' +
          '<div class="rv" style="--d:.1s">' +
            '<div class="map-canvas" id="map-canvas"></div>' +
            '<div class="map-legend">' +
              '<span><i style="background:#B03A2E"></i>国家级非遗项目</span>' +
              '<span><i style="background:#A67C2E"></i>悬停高亮</span>' +
              '<span>示意地图 · 坐标近似</span>' +
            '</div>' +
          '</div>' +
          '<div class="city-list rv" style="--d:.18s" id="city-list">' +
            cityKeys.map(function (ck) {
              return '<div class="city-row" data-city="' + ck + '">' +
                '<b>' + ck + '</b><span>' + groups[ck].map(function (i) { return i.name; }).join(" · ") + '</span>' +
                '<span class="count">' + groups[ck].length + ' 项</span>' +
              '</div>';
            }).join("") +
          '</div>' +
        '</div>' +
      '</div>';
    drawMap();
    bindMap();
    observeReveals(el);
  }

  function drawMap() {
    var box = $("#map-canvas");
    if (!box) return;
    var dots = byId.map(function (it) {
      var p = dotPos(it);
      return '<g class="map-dot" data-id="' + it.id + '" tabindex="0" role="button" aria-label="' + it.name + '，' + it.category + '，点击查看详情" transform="translate(' + p.x + ',' + p.y + ')">' +
        '<circle r="1.9"></circle><text y="-3.6" text-anchor="middle">' + it.name + '</text></g>';
    }).join("");
    box.innerHTML =
      '<svg viewBox="0 0 100 100" role="img" aria-label="河南非遗分布示意图">' +
        '<path class="henan-land" d="' + HENAN_LAND + '"></path>' +
        dots +
      '</svg>' +
      '<div class="map-label-card" id="map-label"></div>';
  }

  function bindMap() {
    var box = $("#map-canvas");
    if (!box) return;
    var label = $("#map-label");
    var dots = $$(".map-dot", box);
    dots.forEach(function (d) {
      var it = itemById[d.getAttribute("data-id")];
      d.addEventListener("mouseenter", function (ev) {
        dots.forEach(function (x) { x.classList.remove("hot"); });
        d.classList.add("hot");
        label.innerHTML = "<b>" + it.name + "</b><span>" + it.category + " · " + it.region + "</span>";
        label.classList.add("show");
        var p = d.getAttribute("transform").match(/translate\(([\d.-]+),([\d.-]+)\)/);
        var x = parseFloat(p[1]), y = parseFloat(p[2]);
        var r = box.getBoundingClientRect();
        label.style.left = (x / 100 * r.width + 14) + "px";
        label.style.top = (y / 100 * r.height - 14) + "px";
        $$(".city-row").forEach(function (row) {
          row.classList.toggle("on", row.getAttribute("data-city") === it.region);
        });
      });
      d.addEventListener("mouseleave", function () {
        d.classList.remove("hot");
        label.classList.remove("show");
      });
      d.addEventListener("click", function () { location.hash = "#/item/" + it.id; });
      d.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); location.hash = "#/item/" + it.id; }
      });
    });
    $$(".city-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        var ck = row.getAttribute("data-city");
        dots.forEach(function (d) {
          var it = itemById[d.getAttribute("data-id")];
          d.classList.toggle("hot", it.region === ck);
        });
      });
      row.addEventListener("mouseleave", function () {
        dots.forEach(function (d) { d.classList.remove("hot"); });
      });
    });
  }

  /* ================= GRAPH ================= */
  function buildGraph() {
    var nodes = [], edges = [], nodeMap = {};
    function addNode(id, label, type, color, r) {
      nodes.push({ id: id, label: label, type: type, color: color, r: r || 5 });
      nodeMap[id] = nodes.length - 1;
    }
    byId.forEach(function (it) {
      addNode(it.id, it.name, "item", CAT_COLOR[it.category] || "#B03A2E", 5);
    });
    cats.forEach(function (c) {
      addNode("cat:" + c.id, c.label, "cat", "#8A8272", 11);
    });
    Object.keys(cities).forEach(function (ck) {
      addNode("city:" + ck, ck, "city", "#A9A08C", 3.4);
    });
    function edge(a, b, w) { edges.push({ a: nodeMap[a], b: nodeMap[b], w: w || 1 }); }
    byId.forEach(function (it) {
      edge(it.id, "cat:" + it.category, 1.2);
      edge(it.id, "city:" + it.region, 1.2);
    });
    Object.keys(kin).forEach(function (a) {
      kin[a].forEach(function (b) { if (a < b) edge(a, b, 2); });
    });
    return { nodes: nodes, edges: edges };
  }

  function layoutGraph(nodes, edges) {
    var n = nodes.length;
    var pos = nodes.map(function (nd, i) {
      var a = i / n * Math.PI * 2;
      return { x: 50 + Math.cos(a) * 26, y: 46 + Math.sin(a) * 26, vx: 0, vy: 0 };
    });
    var map = {};
    nodes.forEach(function (nd, i) { map[nd.id] = i; });
    var byType = {};
    nodes.forEach(function (nd, i) { (byType[nd.type] = byType[nd.type] || []).push(i); });

    function iter() {
      var i, j, dx, dy, d2, f;
      /* 斥力 */
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          dx = pos[j].x - pos[i].x; dy = pos[j].y - pos[i].y;
          d2 = Math.max(dx * dx + dy * dy, 1);
          var rep = 220 / d2;
          var fx = dx / Math.sqrt(d2) * rep, fy = dy / Math.sqrt(d2) * rep;
          pos[i].vx -= fx; pos[i].vy -= fy; pos[j].vx += fx; pos[j].vy += fy;
        }
      }
      /* 弹簧 */
      edges.forEach(function (e) {
        var a = pos[e.a], b = pos[e.b];
        dx = b.x - a.x; dy = b.y - a.y;
        var d = Math.max(Math.sqrt(dx * dx + dy * dy), .5);
        var k = (d - 9) * 0.045 * e.w;
        var fx = dx / d * k, fy = dy / d * k;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      });
      /* 中心引力 + 类型分层 */
      for (i = 0; i < n; i++) {
        var nd = nodes[i], p = pos[i];
        var targetR = nd.type === "item" ? 26 : nd.type === "cat" ? 36 : 40;
        var ang = Math.atan2(p.y - 46, p.x - 50);
        var tx = 50 + Math.cos(ang) * targetR, ty = 46 + Math.sin(ang) * targetR;
        p.vx += (tx - p.x) * 0.012;
        p.vy += (ty - p.y) * 0.012;
        p.vx *= 0.72; p.vy *= 0.72;
        p.x += p.vx; p.y += p.vy;
      }
    }
    for (var t = 0; t < 320; t++) iter();
    return pos;
  }

  function renderGraph() {
    var el = $("#view-graph");
    el.innerHTML =
      '<div class="section-wrap graph-view">' +
        '<div class="section-head rv">' +
          '<div class="kicker">03 · 知识图谱</div>' +
          '<h2 class="section-title">一张网，看懂非遗的关联</h2>' +
          '<p class="section-sub">项目连着门类与地域，门类与地域之间又有亲缘——悬停任意节点，看它牵动谁；点击项目节点进入详情。</p>' +
        '</div>' +
        '<div class="graph-stage rv" style="--d:.1s" id="graph-stage">' +
          '<span class="hint">悬停节点 · 点亮关联 · 点击进入详情</span>' +
        '</div>' +
      '</div>';
    drawGraph();
    observeReveals(el);
  }

  function drawGraph() {
    var stage = $("#graph-stage");
    if (!stage) return;
    var G = buildGraph();
    var pos = layoutGraph(G.nodes, G.edges);
    var nodeList = G.nodes.map(function (nd, i) {
      var p = pos[i];
      var el = '<g class="g-node" data-i="' + i + '"' +
        (nd.type === "item" ? ' tabindex="0" role="button" aria-label="' + esc(nd.label) + '，点击查看详情"' : '') +
        ' transform="translate(' + p.x.toFixed(2) + ',' + p.y.toFixed(2) + ')">';
      if (nd.type === "cat") {
        el += '<circle r="' + nd.r + '" fill="none" stroke="' + nd.color + '" stroke-width="1"></circle>';
      } else {
        el += '<circle r="' + nd.r + '" fill="' + nd.color + '" stroke="#F4EDDF" stroke-width="1"></circle>';
      }
      el += '<text y="' + (nd.type === "cat" ? 3.4 : nd.type === "city" ? 3.2 : 2.6) + '" text-anchor="middle" font-size="' +
        (nd.type === "cat" ? 3 : 2.6) + '">' + esc(nd.label) + '</text></g>';
      return el;
    }).join("");
    var edgeList = G.edges.map(function (e) {
      var a = pos[e.a], b = pos[e.b];
      return '<line class="g-link" data-a="' + e.a + '" data-b="' + e.b + '" x1="' + a.x.toFixed(2) + '" y1="' + a.y.toFixed(2) + '" x2="' + b.x.toFixed(2) + '" y2="' + b.y.toFixed(2) + '"></line>';
    }).join("");
    var W = 800, H = 620;
    stage.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="非遗知识图谱">' + edgeList + nodeList + '</svg>';

    var nodes = $$(".g-node", stage), links = $$(".g-link", stage);
    nodes.forEach(function (g) {
      g.addEventListener("mouseenter", function () {
        var i = +g.getAttribute("data-i");
        var adj = {};
        G.edges.forEach(function (e) {
          if (e.a === i) adj[e.b] = 1;
          if (e.b === i) adj[e.a] = 1;
        });
        nodes.forEach(function (x) {
          var xi = +x.getAttribute("data-i");
          if (xi === i) { x.classList.add("hot"); x.classList.remove("dim"); }
          else if (adj[xi]) { x.classList.remove("dim"); x.classList.remove("hot"); }
          else x.classList.add("dim");
        });
        links.forEach(function (l) {
          var a = +l.getAttribute("data-a"), b = +l.getAttribute("data-b");
          if (a === i || b === i) { l.classList.add("hot"); l.classList.remove("dim"); }
          else { l.classList.add("dim"); l.classList.remove("hot"); }
        });
      });
      g.addEventListener("mouseleave", function () {
        nodes.forEach(function (x) { x.classList.remove("hot", "dim"); });
        links.forEach(function (l) { l.classList.remove("hot", "dim"); });
      });
      var nd = G.nodes[+g.getAttribute("data-i")];
      if (nd.type === "item") {
        g.addEventListener("click", function () { location.hash = "#/item/" + nd.id; });
        g.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); location.hash = "#/item/" + nd.id; }
        });
        g.style.cursor = "pointer";
      }
    });
  }

  /* ================= ASK ================= */
  var askHistory = [], typingTimer = null;

  function renderAsk() {
    var el = $("#view-ask");
    var hot = ["什么是非物质文化遗产", "河南有多少项国家级非遗", "第一次来，推荐先看什么", "钧瓷为什么每件都不一样", "打铁花是怎么打的", "太极拳是陈家沟发明的吗"];
    el.innerHTML =
      '<div class="section-wrap ask-view">' +
        '<div class="section-head rv">' +
          '<div class="kicker">04 · AI 智能讲解</div>' +
          '<h2 class="section-title">问它 · 河南非遗</h2>' +
          '<p class="section-sub">内置知识库离线作答，随问随答；接入豆包/千问 API 后自动升级为真·大模型回答（双层架构已预留）。</p>' +
        '</div>' +
        '<div class="ask-layout">' +
          '<div class="ask-panel rv" style="--d:.1s">' +
            '<div class="ask-head">' +
              '<span class="seal-sm">讲</span><b>非遗讲解员</b>' +
              '<span class="status"><i></i>内置知识库 · 离线模式</span>' +
            '</div>' +
            '<div class="ask-body" id="ask-body"></div>' +
            '<div class="ask-suggests" id="ask-suggests">' +
              hot.map(function (h) { return '<button type="button">' + h + '</button>'; }).join("") +
            '</div>' +
            '<div class="ask-input">' +
              '<input id="ask-input" type="text" placeholder="问一件非遗的事…" aria-label="输入问题" autocomplete="off">' +
              '<button id="ask-send" type="button">发送</button>' +
            '</div>' +
          '</div>' +
          '<aside class="ask-side rv" style="--d:.18s">' +
            '<div class="note">' +
              '<h4>双层架构 · 离线优先</h4>' +
              '<p>当前由内置知识库回答（<code>data.js</code> 中的 <code>KB_ALL</code>），演示永不掉线。接入豆包/千问时，仅需在 <code>app.js</code> 顶部 <code>REMOTE_API</code> 填写密钥并启用，回答即切换为大模型生成。</p>' +
              '<ul class="ask-hot">' +
                byId.slice(0, 8).map(function (it) {
                  return '<li data-q="' + esc(it.name + "有什么特点") + '">' + it.name + ' · 问一句</li>';
                }).join("") +
              '</ul>' +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</div>';
    bindAsk();
    observeReveals(el);
  }

  function bindAsk() {
    var body = $("#ask-body"), input = $("#ask-input"), send = $("#ask-send");
    if (!body) return;
    askHistory = [];
    body.innerHTML = "";
    pushMsg("ai", "你好，我是非遗讲解员。关于河南非遗，你可以问我：什么是非遗、第一次来先看什么，或者直接点名一件展品，比如「钧瓷有什么特点」。");

    function ask(q) {
      var text = (q || "").trim();
      if (!text) return;
      pushMsg("user", text);
      input.value = "";
      /* 思考状态可视化：先显示呼吸点，再流式作答 */
      var think = pushMsg("ai", null, null, false, true);
      setTimeout(function () {
        var ans = matchAnswer(text);
        typeInto(think, ans.a, ans.src);
      }, REDUCED ? 0 : 480);
    }

    send.addEventListener("click", function () { ask(input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") ask(input.value);
    });
    $$("#ask-suggests button").forEach(function (b) {
      b.addEventListener("click", function () { ask(b.textContent); });
    });
    $$(".ask-hot li").forEach(function (li) {
      li.addEventListener("click", function () { ask(li.getAttribute("data-q")); });
    });
    setTimeout(function () { input.focus(); }, 400);
  }

  function pushMsg(role, text, src, type, thinking) {
    var body = $("#ask-body");
    if (!body) return null;
    var d = document.createElement("div");
    d.className = "msg " + role;
    var who = role === "user" ? '<span class="who">你</span>' : '<span class="who">讲</span>';
    var inner = thinking
      ? '<span class="txt"><span class="think-dots"><i></i><i></i><i></i></span></span>'
      : '<span class="txt">' + (text == null ? "" : esc(String(text))) + "</span>";
    d.innerHTML = who + '<div class="bubble">' + inner + (src && !thinking ? '<div class="src">' + esc(src) + "</div>" : "") + "</div>";
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  /* 流式打字（AI 回答逐字显现，评审点名的流式体验） */
  function typeInto(msgEl, text, src) {
    if (!msgEl || !msgEl.parentNode) return;
    var body = $("#ask-body");
    var txtEl = $(".txt", msgEl);
    var srcEl = src ? '<div class="src">' + esc(src) + "</div>" : "";
    var srcWrap = $(".src", msgEl);
    if (srcWrap) srcWrap.outerHTML = srcEl;
    else if (srcEl) {
      var b = $(".bubble", msgEl);
      var div = document.createElement("div");
      div.innerHTML = srcEl;
      b.appendChild(div.firstChild);
    }
    if (!txtEl) return;
    if (REDUCED || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      txtEl.textContent = text;
      return;
    }
    var i = 0;
    clearInterval(typingTimer);
    typingTimer = setInterval(function () {
      txtEl.textContent = text.slice(0, i);
      i += 2;
      if (body) body.scrollTop = body.scrollHeight;
      if (i >= text.length) { clearInterval(typingTimer); txtEl.textContent = text; }
    }, 14);
  }

  function matchAnswer(q) {
    var best = null, bestScore = 0;
    KB_ALL.forEach(function (k) {
      var score = 0;
      k.keywords.forEach(function (kw) {
        if (q.indexOf(kw) >= 0) score += kw.length >= 4 ? 3 : 2;
      });
      if (score > bestScore) { bestScore = score; best = k; }
    });
    if (best && bestScore >= 2) {
      var src = "来自内置知识库" + (best.itemName ? " · " + best.itemName + "条目" : " · 总览条目");
      return { a: best.a, src: src };
    }
    return {
      a: "这个问题超出了我的内置知识库。你可以换个问法，或先试试「什么是非物质文化遗产」「推荐先看什么」。接入豆包/千问 API 后，这里将能回答任意问题。",
      src: "内置知识库未命中 · 已提示升级路径"
    };
  }

  /* ================= IMMERSE ================= */
  var immerseIdx = 0, immerseTimer = null, immersePaused = false, immerseLine = 0;

  function renderImmerse() {
    var el = $("#view-immerse");
    el.innerHTML =
      '<div class="section-wrap immerse">' +
        '<div class="section-head rv">' +
          '<div class="kicker">05 · 沉浸演绎</div>' +
          '<h2 class="section-title">走进一件非遗</h2>' +
          '<p class="section-sub">选择一项，光影与文字将带你走进它的世界。全屏建议。</p>' +
        '</div>' +
        '<div class="immerse-pick rv" style="--d:.1s" id="immerse-pick">' +
          byId.map(function (it, k) {
            return '<button data-i="' + k + '" class="' + (k === immerseIdx ? "on" : "") + '">' + it.name + '</button>';
          }).join("") +
        '</div>' +
        '<div class="immerse-stage rv" style="--d:.18s" id="immerse-stage"></div>' +
      '</div>';
    bindImmersePick();
    drawImmerse();
    observeReveals(el);
  }

  function drawImmerse() {
    var stage = $("#immerse-stage");
    if (!stage) return;
    var it = byId[immerseIdx];
    var lines = it.deep.slice(0, 3);
    stage.innerHTML =
      '<div class="stage-img" style="background-image:url(' + it.img + ')"></div>' +
      '<div class="stage-veil"></div>' +
      '<div class="stage-num">' + pad(immerseIdx + 1) + ' / ' + pad(byId.length) + '</div>' +
      '<div class="stage-title">' + it.name + '<small>' + esc(it.en) + ' · ' + it.category + '</small></div>' +
      '<div class="stage-line" id="stage-line">' + esc(lines[0]) + '</div>' +
      '<div class="stage-progress" id="stage-progress"></div>' +
      '<div class="stage-ctrl">' +
        '<button id="st-prev" aria-label="上一项">‹</button>' +
        '<button id="st-play" aria-label="播放或暂停">' + (immersePaused ? "▶" : "‖") + '</button>' +
        '<button id="st-next" aria-label="下一项">›</button>' +
      '</div>';
    immerseLine = 0;
    bindStageCtrl();
    startImmerseTimer();
  }

  function startImmerseTimer() {
    clearInterval(immerseTimer);
    var lineEl = $("#stage-line"), prog = $("#stage-progress");
    if (!lineEl) return;
    var t0 = performance.now();
    if (immersePaused && prog) { prog.style.width = "0%"; return; }
    immerseTimer = setInterval(function () {
      var it = byId[immerseIdx];
      var lines = it.deep.slice(0, 3);
      var el = 3000;
      var dt = performance.now() - t0;
      if (prog) prog.style.width = Math.min(100, dt / (el * lines.length) * 100) + "%";
      var ci = Math.floor(dt / el) % lines.length;
      if (ci !== immerseLine) {
        immerseLine = ci;
        if (lineEl) {
          lineEl.classList.add("fade");
          setTimeout(function () {
            lineEl.textContent = lines[ci];
            lineEl.classList.remove("fade");
          }, 750);
        }
      }
    }, 220);
  }

  function bindStageCtrl() {
    var prev = $("#st-prev"), next = $("#st-next"), play = $("#st-play");
    if (prev) prev.addEventListener("click", function () {
      immerseIdx = (immerseIdx - 1 + byId.length) % byId.length;
      updatePick(); drawImmerse();
    });
    if (next) next.addEventListener("click", function () {
      immerseIdx = (immerseIdx + 1) % byId.length;
      updatePick(); drawImmerse();
    });
    if (play) play.addEventListener("click", function () {
      immersePaused = !immersePaused;
      play.textContent = immersePaused ? "▶" : "‖";
      startImmerseTimer();
    });
  }

  function updatePick() {
    $$("#immerse-pick button").forEach(function (b) {
      b.classList.toggle("on", +b.getAttribute("data-i") === immerseIdx);
    });
  }

  function bindImmersePick() {
    var pick = $("#immerse-pick");
    if (!pick) return;
    $$("button", pick).forEach(function (b) {
      b.addEventListener("click", function () {
        immerseIdx = +b.getAttribute("data-i");
        updatePick(); drawImmerse();
      });
    });
  }

  /* ================= 文创生成（AI 文创工坊 · M7 本地合成，远程接口预留） ================= */
  var createIdx = 0, createStyle = "mogu", createSeed = Math.random();
  var CREATE_STYLES = [
    { id: "mogu", label: "水墨", veil: "rgba(33,29,24,.10)", frame: "#211D18" },
    { id: "zhusha", label: "朱砂", veil: "rgba(176,58,46,.20)", frame: "#B03A2E" },
    { id: "miaojin", label: "描金", veil: "rgba(166,124,46,.22)", frame: "#A67C2E" },
    { id: "tapian", label: "拓印", dark: true, veil: "rgba(27,23,20,.30)", frame: "#EDE3CE" }
  ];
  function createStyleObj() {
    for (var i = 0; i < CREATE_STYLES.length; i++) if (CREATE_STYLES[i].id === createStyle) return CREATE_STYLES[i];
    return CREATE_STYLES[0];
  }

  function renderCreate() {
    var el = $("#view-create");
    el.innerHTML =
      '<div class="section-wrap create-view">' +
        '<div class="section-head rv">' +
          '<div class="kicker">06 · AI 文创工坊</div>' +
          '<h2 class="section-title">生成一张非遗海报</h2>' +
          '<p class="section-sub">选一件珍宝、定一种风格，本地算法即时合成可下载的文创海报；接入图像生成 API 后可升级为真·AI 创作（接口已预留）。</p>' +
        '</div>' +
        '<div class="create-layout">' +
          '<div class="create-panel rv" style="--d:.1s">' +
            '<h3>创作台</h3>' +
            '<div class="create-field"><label>选择展品</label>' +
              '<div class="item-pick" id="create-items">' +
                byId.map(function (it, k) {
                  return '<button type="button" data-i="' + k + '" class="' + (k === createIdx ? "on" : "") + '">' + it.name + '</button>';
                }).join("") +
              '</div>' +
            '</div>' +
            '<div class="create-field"><label>选择风格</label>' +
              '<div class="style-pick" id="create-styles">' +
                CREATE_STYLES.map(function (s) {
                  return '<button type="button" data-s="' + s.id + '" class="' + (s.id === createStyle ? "on" : "") + '">' + s.label + '</button>';
                }).join("") +
              '</div>' +
            '</div>' +
            '<div class="create-actions">' +
              '<button class="btn-gen" id="btn-gen" type="button">生成</button>' +
              '<button class="btn-shuffle" id="btn-shuffle" type="button">换组灵感</button>' +
              '<button class="btn-save" id="btn-save" type="button">下载 PNG</button>' +
            '</div>' +
          '</div>' +
          '<div class="create-stage rv" style="--d:.16s">' +
            '<div class="poster-wrap"><canvas id="poster-canvas" width="900" height="1200" aria-label="文创海报预览"></canvas></div>' +
            '<div class="poster-caption"><span>本地合成 · <em>零上传</em></span><span>900 × 1200 · 3:4</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    bindCreate();
    drawPoster();
    observeReveals(el);
  }

  function bindCreate() {
    var items = $("#create-items"), styles = $("#create-styles");
    if (items) $$("button", items).forEach(function (b) {
      b.addEventListener("click", function () {
        createIdx = +b.getAttribute("data-i");
        $$("button", items).forEach(function (x) { x.classList.toggle("on", x === b); });
        drawPoster();
      });
    });
    if (styles) $$("button", styles).forEach(function (b) {
      b.addEventListener("click", function () {
        createStyle = b.getAttribute("data-s");
        $$("button", styles).forEach(function (x) { x.classList.toggle("on", x === b); });
        drawPoster();
      });
    });
    var gen = $("#btn-gen"), shuf = $("#btn-shuffle"), save = $("#btn-save");
    if (gen) gen.addEventListener("click", function () { drawPoster(); });
    if (shuf) shuf.addEventListener("click", function () {
      createSeed = Math.random();
      var ns = CREATE_STYLES[Math.floor(Math.random() * CREATE_STYLES.length)].id;
      createStyle = ns;
      var st = $("#create-styles");
      if (st) $$("button", st).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-s") === ns); });
      drawPoster();
    });
    if (save) save.addEventListener("click", function () {
      var cvs = $("#poster-canvas");
      if (!cvs) return;
      var a = document.createElement("a");
      a.download = "非遗智汇-" + byId[createIdx].name + "-" + createStyle + ".png";
      a.href = cvs.toDataURL("image/png");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  function drawPoster() {
    var cvs = $("#poster-canvas");
    if (!cvs) return;
    var it = byId[createIdx];
    var st = createStyleObj();
    var W = 900, H = 1200;
    var ctx = cvs.getContext("2d");
    var dark = !!st.dark;
    var ink = dark ? "#EDE3CE" : "#211D18";
    var sub = dark ? "#C9A95C" : "#A67C2E";

    /* 生成时轻量入场 */
    cvs.style.transition = "opacity .45s var(--ease, ease)";
    cvs.style.opacity = ".55";
    setTimeout(function () { cvs.style.opacity = "1"; }, 30);

    /* 背景 */
    ctx.fillStyle = dark ? "#1B1714" : "#F4EDDF";
    ctx.fillRect(0, 0, W, H);
    noiseOverlay(ctx, W, H, 0.05);

    /* 随机晕染（灵感种子驱动） */
    var ax = 0.12 + (createSeed * 7919) % 0.76, ay = 0.08 + (createSeed * 104729) % 0.84;
    var g = ctx.createRadialGradient(W * ax, H * ay, 0, W * ax, H * ay, Math.max(W, H) * 0.8);
    g.addColorStop(0, st.veil);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* 眉线 + 标题 */
    ctx.fillStyle = "#B03A2E";
    ctx.fillRect(76, 62, 36, 3);
    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "900 74px 'Noto Serif SC', 'Songti SC', serif";
    ctx.fillText(it.name, 76, 152);
    ctx.fillStyle = sub;
    ctx.font = "500 19px 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillText(String(it.en).toUpperCase(), 76, 190);

    /* 右侧竖排小字 */
    drawVertical(ctx, "中原遗珍", W - 54, 210, 21, sub);

    /* 图片区（cover 3:4 → 748 × 920） */
    var img = new Image();
    img.onload = function () {
      var iw = img.width || 1536, ih = img.height || 2048;
      var tw = 748, th = 920;
      var sc = Math.max(tw / iw, th / ih);
      var sw = tw / sc, sh = th / sc;
      var sx = (iw - sw) / 2, sy = (ih - sh) / 2;
      var dx = 76, dy = 228;
      if (st.id === "mogu" || st.id === "tapian") {
        drawGray(ctx, img, sx, sy, sw, sh, dx, dy, tw, th);
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, tw, th);
      }
      /* 风格叠色 */
      ctx.fillStyle = st.veil;
      ctx.fillRect(dx, dy, tw, th);
      /* 边框 */
      ctx.strokeStyle = st.frame;
      ctx.lineWidth = dark ? 1.5 : 1;
      ctx.strokeRect(dx - 1, dy - 1, tw + 2, th + 2);
      /* 印章 */
      drawSeal(ctx, W - 76 - 86, dy + th - 18, 86, dark ? "#C45342" : "#B03A2E", it.name.charAt(0), dark);
      /* 底部信息 */
      drawPosterFooter(ctx, it, st, W, H, dark, ink, sub);
    };
    img.src = it.img;
  }

  function drawPosterFooter(ctx, it, st, W, H, dark, ink, sub) {
    var y = H - 92;
    ctx.strokeStyle = dark ? "rgba(237,227,206,.28)" : "rgba(33,29,24,.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(76, y - 20);
    ctx.lineTo(W - 76, y - 20);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    ctx.font = "600 22px 'Noto Serif SC', serif";
    ctx.fillText("非遗智汇 · 河南非遗 AI 数字展厅", 76, y + 12);
    ctx.fillStyle = sub;
    ctx.font = "400 16px 'Noto Sans SC', sans-serif";
    ctx.fillText(it.category + " · " + it.region + " · " + it.level, 76, y + 42);
    ctx.textAlign = "right";
    ctx.fillText("HENAN ICH · 2026", W - 76, y + 42);
  }

  function drawSeal(ctx, x, y, size, color, text, dark) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.055);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = dark ? "#191512" : "#F4EDDF";
    ctx.font = "900 " + Math.round(size * 0.52) + "px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2 + size * 0.04);
    ctx.restore();
  }

  function drawVertical(ctx, text, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "500 " + size + "px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    for (var i = 0; i < text.length; i++) {
      ctx.fillText(text.charAt(i), x, y + i * (size + 12));
    }
    ctx.restore();
  }

  function drawGray(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var oc = document.createElement("canvas");
    oc.width = dw; oc.height = dh;
    var octx = oc.getContext("2d");
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
    try {
      var d = octx.getImageData(0, 0, dw, dh);
      for (var p = 0; p < d.data.length; p += 4) {
        var v = d.data[p] * 0.299 + d.data[p + 1] * 0.587 + d.data[p + 2] * 0.114;
        d.data[p] = d.data[p + 1] = d.data[p + 2] = v;
      }
      octx.putImageData(d, 0, 0);
    } catch (e) { /* 跨域不可读时退回直接绘制 */ }
    ctx.drawImage(oc, dx, dy);
  }

  function noiseOverlay(ctx, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    var n = Math.floor(w * h / 680);
    for (var i = 0; i < n; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(33,29,24,.55)" : "rgba(255,252,240,.55)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
    }
    ctx.restore();
  }

  /* ================= 全局交互 ================= */
  function bindGlobal() {
    var hd = $("#site-header");
    window.addEventListener("scroll", function () {
      hd.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });

    var burger = $("#nav-burger"), nav = $("#main-nav");
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        nav.classList.remove("open");
        burger.classList.remove("open");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLenis();
    initScrollProgress();
    initPointerFX();
    initTheme();
    bindGlobal();
    navigate();
  });
})();
