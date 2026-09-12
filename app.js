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

  /* 门类文化图背景（M8.11） */
  var CAT_IMG = {
    "戏曲": "assets/cats/cat-xiqu.jpg",
    "曲艺": "assets/cats/cat-quyi.jpg",
    "技艺": "assets/cats/cat-jiyi.jpg",
    "美术": "assets/cats/cat-meishu.jpg",
    "体育": "assets/cats/cat-tiyu.jpg",
    "民俗": "assets/cats/cat-minsu.jpg"
  };

  var itemById = {};
  byId.forEach(function (it) { itemById[it.id] = it; });

  /* ================= 路由 ================= */
  var routes = ["home", "hall", "item", "map", "region", "graph", "ask", "create", "immerse"];

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
      map: renderMap, region: function () { renderRegion(r.id); }, graph: renderGraph, ask: renderAsk,
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
    /* 性能决策（M8.2）：滚轮默认走浏览器原生硬件合成滚动。
       实测：Lenis JS 插值逐帧驱动 scrollTo 在复杂合成层页面上掉帧，
       而原生滚动（拖拽滚动条/触摸/滚轮）由合成器接管，丝滑稳定。
       保留 Lenis 接入位：如评审环境要求平滑滚动，将 RETURN_NOW 置 false
       即可一行启用（CDN 已引入，代码结构完整，答辩可讲此性能权衡）。 */
    var RETURN_NOW = true;
    if (RETURN_NOW) return;
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
    function clearParallax() {
      bg.style.transform = ""; inner.style.transform = "";
    }
    window.addEventListener("scroll", clearParallax, { passive: true });
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
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
        '<div class="hall-amb" aria-hidden="true"><i class="ha ha1"></i><i class="ha ha2"></i><i class="ha ha3"></i><i class="ha ha4"></i></div>' +
        '<div class="hall-hero rv">' +
          '<div class="hh-bg" aria-hidden="true"><i class="hh-l"></i><i class="hh-l"></i><i class="hh-l"></i><i class="hh-l"></i></div>' +
          '<div class="hh-veil" aria-hidden="true"></div>' +
          '<span class="hh-seal" aria-hidden="true"><b>珍</b><b>宝</b></span>' +
          '<div class="section-head">' +
            '<div class="kicker">01 · 展品总览</div>' +
            '<h2 class="section-title">十五件河南珍宝</h2>' +
            '<p class="section-sub">从一声梆子腔到一窑窑变的火，六大门类、十五项国家级非遗，每一件都值得停下来看三分钟。</p>' +
          '</div>' +
        '</div>' +
        '<div class="filter-bar rv" style="--d:.1s" id="filter-bar">' +
          '<button class="' + (hallFilter === "全部" ? "on" : "") + '" data-f="全部">全部 · 15</button>' +
          '<button class="' + (hallFilter === "fav" ? "on" : "") + '" data-f="fav">已收藏 · ' + favs.length + '</button>' +
          cats.map(function (c) {
            var n = byId.filter(function (i) { return i.category === c.id; }).length;
            return '<button class="f-cat ' + (hallFilter === c.id ? "on" : "") + '" style="--img:url(' + (CAT_IMG[c.id] || "") + ')" data-f="' + c.id + '" aria-label="筛选：' + c.label + '">' +
              '<span class="f-img" aria-hidden="true"></span>' +
              '<span class="f-cap">' + c.label + '<i>' + n + '</i></span>' +
              '</button>';
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

    var thm = (typeof ITEM_THEME === "object" && ITEM_THEME[it.id]) || ITEM_THEME.yuju;
    el.innerHTML =
      '<div class="item-bg" aria-hidden="true" style="background:' + thm.bg + '"><i class="im-mark" style="color:' + thm.tint + '">' + thm.mark + '</i></div>' +
      '<div class="item-veil" aria-hidden="true"></div>' +
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
    /* 真实坐标优先（HENAN_ITEM_LOC 经纬度投影），无则落城市质心 */
    var c = HENAN_ITEM_LOC[it.id] || HENAN_CITY_LABELS[it.region] || { x: 50, y: 50 };
    var arr = CITY_OFFSET[it.region] || (CITY_OFFSET[it.region] = []);
    var k = arr.length;
    arr.push(it.id);
    var offs = [[0, -3.6], [0, 0], [0, 3.6], [0, -6.6], [0, 6.6]];
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

  function regionItems(ck) {
    var short = ck.replace("市", "");
    return byId.filter(function (it) { return it.region === short; });
  }
  function renderRegion(id) {
    var el = $("#view-region");
    if (id) { try { id = decodeURIComponent(id); } catch (e) {} }
    if (!id || !REGION_DATA[id]) { renderRegionList(el); return; }
    renderRegionDetail(el, id);
    observeReveals(el);
  }
  function renderRegionList(el) {
    var cards = REGION_ORDER.map(function (ck, i) {
      var r = REGION_DATA[ck];
      var items = regionItems(ck);
      var badge = items.length ? '<span class="badge">非遗 ' + items.length + ' 项</span>' : "";
      var rim = REGION_IMG && REGION_IMG[ck] ? '<span class="region-pic" style="background-image:url(\'' + REGION_IMG[ck] + '\')"></span>' : "";
      return '<a class="region-card rv" style="--d:' + (i * 0.03 + 0.05) + 's" href="#/region/' + encodeURIComponent(ck) + '">' + rim +
        '<span class="no">' + String(i + 1).padStart(2, "0") + '</span>' + badge +
        '<h3>' + ck + '</h3>' +
        '<div class="tag">' + r.tag + '</div>' +
        '<p>' + r.intro + '</p>' +
        '</a>';
    }).join("");
    el.innerHTML =
      '<div class="region-bg" aria-hidden="true"><i class="rb-l"></i><i class="rb-l"></i><i class="rb-l"></i><i class="rb-l"></i></div>' +
      '<div class="region-veil" aria-hidden="true"></div>' +
      '<div class="section-wrap region-view">' +
        '<div class="section-head rv">' +
          '<div class="kicker">06 · 城市介绍</div>' +
          '<h2 class="section-title">一城一脉 · 中原十八城</h2>' +
          '<p class="section-sub">点击地市板块或卡片，走进每一座城的文化底色；带「非遗」角标的城市藏有招牌项目。</p>' +
        '</div>' +
        '<div class="region-grid">' + cards + '</div>' +
      '</div>';
    observeReveals(el);
  }
  function renderRegionDetail(el, ck) {
    var r = REGION_DATA[ck];
    var items = regionItems(ck);
    var itemHtml = items.length
      ? items.map(function (it) {
          return '<a class="region-item rv" href="#/item/' + it.id + '">' +
            '<span class="dot"></span>' +
            '<span class="nm"><b>' + it.name + '</b><span>' + it.place + '</span></span>' +
            '<span class="cat">' + it.category + '</span>' +
            '</a>';
        }).join("")
      : '<div class="region-empty">该市暂无招牌非遗点位，可从地图或展品总览探索其他城市的非遗。</div>' +
        '<div class="region-empty-acts"><a href="#/map">去非遗地图看看</a><a href="#/hall">去展品总览</a></div>';
    el.innerHTML =
      '<div class="region-bg" aria-hidden="true"><i class="rb-l"></i><i class="rb-l"></i><i class="rb-l"></i><i class="rb-l"></i></div>' +
      '<div class="region-veil" aria-hidden="true"></div>' +
      '<div class="section-wrap region-detail">' +
        '<a class="item-back rv" href="#/region">返回城市介绍</a>' +
        '<div class="region-hero">' +
          (REGION_IMG && REGION_IMG[ck]
            ? '<div class="region-hero-pic rv" style="background-image:url(\'' + REGION_IMG[ck] + '\')"></div>'
            : '') +
          '<div class="main rv">' +
            '<div class="kicker">' + ck.replace("市", "") + ' · 城市档案</div>' +
            '<h2>' + ck + '</h2>' +
            '<div class="tag">' + r.tag + '</div>' +
            '<p>' + r.intro + '</p>' +
            '<div class="spots">' + r.spots.map(function (s) { return '<span>' + s + '</span>'; }).join("") + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="region-items">' +
          '<h3>招牌非遗 <b>' + items.length + '</b> 项</h3>' + itemHtml +
        '</div>' +
      '</div>';
  }

  function renderMap() {
    var el = $("#view-map");
    var groups = cityItems();
    var cityKeys = Object.keys(groups);
    var catMap = {};
    byId.forEach(function (it) { catMap[it.category] = (catMap[it.category] || 0) + 1; });
    var catCounts = Object.keys(catMap).map(function (k) { return { name: k, n: catMap[k] }; })
      .sort(function (a, b) { return b.n - a.n; })
      .map(function (x) { x.pct = Math.round(x.n / byId.length * 100); return x; });
    el.innerHTML =
      '<div class="section-wrap map-view">' +
        '<div class="map-bg" aria-hidden="true"><i class="mb-l"></i><i class="mb-l"></i><i class="mb-l"></i><i class="mb-l"></i></div>' +
        '<div class="map-veil" aria-hidden="true"></div>' +
        '<div class="map-amb" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<div class="section-head rv">' +
          '<div class="kicker">02 · 非遗地图</div>' +
          '<h2 class="section-title">河南版图上的文化坐标</h2>' +
          '<p class="section-sub">十五项招牌非遗分布在中原大地的十个地市。悬停标点查看项目，点击进入详情。</p>' +
        '</div>' +
        '<div class="map-layout">' +
          '<div class="rv" style="--d:.1s">' +
            '<div class="map-zoom-wrap">' +
              '<div class="map-canvas" id="map-canvas"></div>' +
              '<button class="map-zoom-btn" type="button" id="map-zoom-btn" aria-label="放大地图交互查看" aria-haspopup="dialog">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/><path d="M10.5 8v5M8 10.5h5"/></svg>放大' +
              '</button>' +
            '</div>' +
            '<div class="map-legend">' +
              '<span><i style="background:#B03A2E"></i>国家级非遗项目</span>' +
              '<span><i style="background:#A67C2E"></i>悬停高亮</span>' +
              '<span>真实行政区划 · 坐标基于公开地理数据</span>' +
            '</div>' +
          '</div>' +
          '<div class="city-col">' +
          '<div class="city-list rv" style="--d:.18s" id="city-list">' +
            cityKeys.map(function (ck) {
              return '<div class="city-row" data-city="' + ck + '">' +
                '<b>' + ck + '</b><span>' + groups[ck].map(function (i) { return i.name; }).join(" · ") + '</span>' +
                '<span class="count">' + groups[ck].length + ' 项</span>' +
              '</div>';
            }).join("") +
          '</div>' +
          '<div class="map-stats rv" style="--d:.26s">' +
            '<div class="ms-head"><b>非遗速览</b><span>招牌数据</span></div>' +
            '<div class="ms-big">' +
              '<div><b>' + byId.length + '</b><span>项招牌</span></div>' +
              '<div><b>' + cityKeys.length + '</b><span>个地市</span></div>' +
              '<div><b>' + catCounts.length + '</b><span>大门类</span></div>' +
            '</div>' +
            '<div class="ms-bars">' +
              catCounts.map(function (cc) {
                return '<div class="ms-bar"><i style="width:' + cc.pct + '%"></i><b>' + cc.name + '</b><span>' + cc.n + '</span></div>';
              }).join("") +
            '</div>' +
          '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    drawMap();
    bindMapZoom();
    observeReveals(el);
  }
  function bindMapZoom() {
    var btn = $("#map-zoom-btn");
    if (!btn) return;
    btn.addEventListener("click", openMapZoom);
  }
  /* ===== 地图放大查看器：滚轮缩放（光标锚点）· 拖拽平移 · 原有点选保留 ===== */
  var zoomModal = null, zoomStage = null, zoomView = null;
  var zs = 1.7, ztx = 0, zty = 0;
  var drag = null;
  function openMapZoom() {
    if (zoomModal) { closeMapZoom(); return; }
    zoomModal = document.createElement("div");
    zoomModal.className = "map-zoom-modal";
    zoomModal.setAttribute("role", "dialog");
    zoomModal.setAttribute("aria-modal", "true");
    zoomModal.setAttribute("aria-label", "河南非遗地图放大查看");
    zoomModal.innerHTML =
      '<button class="zoom-close" type="button" aria-label="关闭放大地图"></button>' +
      '<div class="map-zoom-stage">' +
        '<div class="map-zoom-view">' + mapSvgHtml() + '</div>' +
        '<div class="map-label-card"></div>' +
        '<div class="zoom-ctrl">' +
          '<button type="button" class="zoom-in" aria-label="放大">+</button>' +
          '<button type="button" class="zoom-out" aria-label="缩小">−</button>' +
          '<button type="button" class="zoom-reset" aria-label="复位">复位</button>' +
        '</div>' +
        '<div class="zoom-hint">滚轮缩放 · 拖拽平移</div>' +
      '</div>';
    document.body.appendChild(zoomModal);
    zoomStage = zoomModal.querySelector(".map-zoom-stage");
    zoomView = zoomModal.querySelector(".map-zoom-view");
    bindMapInteractions(zoomStage);
    requestAnimationFrame(function () { zoomModal.classList.add("show"); });
    document.body.style.overflow = "hidden";
    var was = document.activeElement;
    zoomModal.querySelector(".zoom-close").focus();
    /* 关闭路径 */
    function close() { closeMapZoom(was); }
    zoomModal.querySelector(".zoom-close").addEventListener("click", close);
    zoomModal.addEventListener("click", function (ev) { if (ev.target === zoomModal) close(); });
    document.addEventListener("keydown", zoomEsc);
    /* 初始居中：scale 以左上为原点放大，translate 回补一半溢出量 */
    var rect = zoomStage.getBoundingClientRect();
    ztx = rect.width / 2 * (1 - zs);
    zty = rect.height / 2 * (1 - zs);
    applyZoom();
    /* 滚轮缩放：以光标为锚点 */
    zoomStage.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      var r = zoomStage.getBoundingClientRect();
      var cx = ev.clientX - r.left, cy = ev.clientY - r.top;
      var ns = Math.min(5, Math.max(1, zs * (ev.deltaY < 0 ? 1.18 : 1 / 1.18)));
      ztx = cx - (cx - ztx) * (ns / zs);
      zty = cy - (cy - zty) * (ns / zs);
      zs = ns;
      applyZoom();
    }, { passive: false });
    /* 拖拽平移 */
    zoomStage.addEventListener("pointerdown", function (ev) {
      drag = { sx: ev.clientX, sy: ev.clientY, tx: ztx, ty: zty };
      zoomStage.classList.add("dragging");
      zoomStage.setPointerCapture(ev.pointerId);
    });
    zoomStage.addEventListener("pointermove", function (ev) {
      if (!drag) return;
      ztx = drag.tx + (ev.clientX - drag.sx);
      zty = drag.ty + (ev.clientY - drag.sy);
      applyZoom();
    });
    zoomStage.addEventListener("pointerup", function () {
      drag = null; zoomStage.classList.remove("dragging");
    });
    zoomStage.addEventListener("pointercancel", function () {
      drag = null; zoomStage.classList.remove("dragging");
    });
    zoomModal.querySelector(".zoom-in").addEventListener("click", function () {
      var r = zoomStage.getBoundingClientRect();
      var cx = r.width / 2, cy = r.height / 2;
      var ns = Math.min(5, zs * 1.25);
      ztx = cx - (cx - ztx) * (ns / zs);
      zty = cy - (cy - zty) * (ns / zs);
      zs = ns; applyZoom();
    });
    zoomModal.querySelector(".zoom-out").addEventListener("click", function () {
      var r = zoomStage.getBoundingClientRect();
      var cx = r.width / 2, cy = r.height / 2;
      var ns = Math.max(1, zs / 1.25);
      ztx = cx - (cx - ztx) * (ns / zs);
      zty = cy - (cy - zty) * (ns / zs);
      zs = ns; applyZoom();
    });
    zoomModal.querySelector(".zoom-reset").addEventListener("click", function () {
      zs = 1.7;
      var r = zoomStage.getBoundingClientRect();
      ztx = r.width / 2 * (1 - zs);
      zty = r.height / 2 * (1 - zs);
      applyZoom();
    });
  }
  function zoomEsc(ev) {
    if (ev.key === "Escape") closeMapZoom();
  }
  function applyZoom() {
    if (!zoomView) return;
    zoomView.style.transform = "translate(" + ztx + "px," + zty + "px) scale(" + zs + ")";
  }
  function closeMapZoom(restoreFocus) {
    if (!zoomModal) return;
    document.removeEventListener("keydown", zoomEsc);
    document.body.style.overflow = "";
    zoomModal.classList.remove("show");
    var m = zoomModal;
    zoomModal = zoomStage = zoomView = null;
    drag = null; zs = 1.7; ztx = 0; zty = 0;
    setTimeout(function () {
      if (m.parentNode) m.parentNode.removeChild(m);
      if (restoreFocus && restoreFocus.focus) restoreFocus.focus();
      else { var b = $("#map-zoom-btn"); if (b) b.focus(); }
    }, 420);
  }


  function mapSvgHtml() {
    var cityG = Object.keys(HENAN_CITY_PATHS).map(function (ck) {
      var lb = HENAN_CITY_LABELS[ck];
      return '<g class="map-city" data-city="' + ck + '" tabindex="0" role="button" aria-label="' + ck + '">' +
        '<path d="' + HENAN_CITY_PATHS[ck] + '"></path>' +
        '<text x="' + lb.x + '" y="' + lb.y + '" text-anchor="middle">' + ck.replace("市", "") + '</text>' +
      '</g>';
    }).join("");
    var dots = byId.map(function (it) {
      var p = dotPos(it);
      return '<g class="map-dot" data-id="' + it.id + '" tabindex="0" role="button" aria-label="' + it.name + '，' + it.category + '，点击查看详情" transform="translate(' + p.x + ',' + p.y + ')">' +
        '<circle r="1.9"></circle><text y="-3.6" text-anchor="middle">' + it.name + '</text></g>';
    }).join("");
    return '<svg viewBox="0 0 ' + HENAN_VIEW.w + ' ' + HENAN_VIEW.h + '" role="img" aria-label="河南非遗分布地图（真实行政区划）">' +
        '<g class="map-cities">' + cityG + '</g>' +
        dots +
      '</svg>';
  }
  function drawMap() {
    var box = $("#map-canvas");
    if (!box) return;
    box.innerHTML = mapSvgHtml() + '<div class="map-label-card" id="map-label"></div>';
    bindMapInteractions(box);

  }

  function bindMapInteractions(box) {
    if (!box) return;
    var label = box.querySelector(".map-label-card");
    var dots = $$(".map-dot", box);
    var citiesG = $$(".map-city", box);
    function cityHot(region) {
      citiesG.forEach(function (g) {
        g.classList.toggle("hot", g.getAttribute("data-city") === region);
      });
    }
    function cityClear() { citiesG.forEach(function (g) { g.classList.remove("hot"); }); }
    function citySelect(ck, on) {
      citiesG.forEach(function (g) { g.classList.toggle("sel", on && g.getAttribute("data-city") === ck); });
      dots.forEach(function (d) {
        var it = itemById[d.getAttribute("data-id")];
        d.classList.toggle("hot", on && it.region === ck);
      });
      $$(".city-row").forEach(function (row) {
        row.classList.toggle("on", on && row.getAttribute("data-city") === ck);
      });
      cityHot(on ? ck : null);
    }
    citiesG.forEach(function (g) {
      g.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var ck = g.getAttribute("data-city");
        location.hash = "#/region/" + encodeURIComponent(ck);
      });
    });
    var svgEl = box.querySelector("svg");
    if (svgEl) svgEl.addEventListener("click", function () { citySelect(null, false); });
    dots.forEach(function (d) {
      var it = itemById[d.getAttribute("data-id")];
      function setFocus(active) {
        dots.forEach(function (x) {
          if (active) x.classList.toggle("dim", x !== active);
          else x.classList.remove("dim");
        });
      }
      d.addEventListener("mouseenter", function (ev) {
        dots.forEach(function (x) { x.classList.remove("hot"); });
        d.classList.add("hot");
        setFocus(d);
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
        cityHot(it.region);
      });
      d.addEventListener("mouseleave", function () {
        setFocus(null);
        d.classList.remove("hot");
        label.classList.remove("show");
        cityClear();
      });
      d.addEventListener("blur", function () { setFocus(null); });
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
        cityHot(ck);
      });
      row.addEventListener("click", function () {
        location.hash = "#/region/" + encodeURIComponent(row.getAttribute("data-city") + "市");
      });
      row.addEventListener("mouseleave", function () {
        dots.forEach(function (d) { d.classList.remove("hot"); });
        cityClear();
      });
    });
    citiesG.forEach(function (g) {
      var ck = g.getAttribute("data-city");
      g.addEventListener("mouseenter", function () {
        dots.forEach(function (d) {
          var it = itemById[d.getAttribute("data-id")];
          d.classList.toggle("hot", it.region === ck);
        });
        $$(".city-row").forEach(function (row) {
          row.classList.toggle("on", row.getAttribute("data-city") === ck);
        });
      });
      g.addEventListener("mouseleave", function () {
        dots.forEach(function (d) { d.classList.remove("hot"); });
        $$(".city-row").forEach(function (row) { row.classList.remove("on"); });
      });
      g.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); g.click(); }
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
    var W = 1000, H = 540, CX = W / 2, CY = H / 2;
    /* 门类扇区：6 类各占 60°，项目在所属扇区内均匀分布 */
    var catIdx = {};
    nodes.forEach(function (nd) { if (nd.type === "item" && !(nd.cat in catIdx)) catIdx[nd.cat] = 0; });
    var catKeys = Object.keys(catIdx), sec = 2 * Math.PI / Math.max(catKeys.length, 1);
    var cnt = {}, idx = {};
    nodes.forEach(function (nd) {
      if (nd.type === "item") { cnt[nd.cat] = (cnt[nd.cat] || 0) + 1; }
    });
    nodes.forEach(function (nd) {
      if (nd.type === "item") {
        var ci = catKeys.indexOf(nd.cat);
        var j = idx[nd.cat] = (idx[nd.cat] || 0);
        var half = Math.max(cnt[nd.cat] - 1, 1) / 2;
        var off = (j - half) * (sec * 0.62) / Math.max(cnt[nd.cat], 1);
        catIdx[nd.cat + "_" + nd.id] = ci * sec + off;
      }
    });
    var pos = nodes.map(function (nd, i) {
      var rr = nd.type === "city" ? 102 : nd.type === "cat" ? 76 : 54;
      var a;
      if (nd.type === "item") {
        a = catIdx[nd.cat + "_" + nd.id] !== undefined ? catIdx[nd.cat + "_" + nd.id] : (i / n * Math.PI * 2);
      } else {
        a = (i / n * Math.PI * 2) + 0.26;
      }
      return { x: CX + Math.cos(a) * rr, y: CY + Math.sin(a) * rr, vx: 0, vy: 0 };
    });
    function lab(nd) { return Math.max(nd.label.length * 1.8, 10); }
    function iter() {
      var i, j, dx, dy, d2, d, fx, fy;
      /* 斥力：按节点占用面积（圆 + 文字宽）计算，标签不重叠 */
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          dx = pos[j].x - pos[i].x; dy = pos[j].y - pos[i].y;
          d2 = Math.max(dx * dx + dy * dy, 1);
          var R = lab(nodes[i]) + lab(nodes[j]);
          var rep = R * R * 1.8 / d2;
          d = Math.sqrt(d2);
          fx = dx / d * rep; fy = dy / d * rep;
          pos[i].vx -= fx; pos[i].vy -= fy; pos[j].vx += fx; pos[j].vy += fy;
        }
      }
      /* 弹簧：亲缘短且强，门类/地域连线松弛 */
      edges.forEach(function (e) {
        var a = pos[e.a], b = pos[e.b];
        dx = b.x - a.x; dy = b.y - a.y;
        d = Math.max(Math.sqrt(dx * dx + dy * dy), .5);
        var rest = e.w >= 2 ? 9 : 15;
        var k = (d - rest) * 0.05 * e.w;
        fx = dx / d * k; fy = dy / d * k;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      });
      /* 中心引力 + 类型分环：项目内环 / 门类中环 / 地市外环 */
      for (i = 0; i < n; i++) {
        var nd = nodes[i], p = pos[i];
        var targetR = nd.type === "item" ? 54 : nd.type === "cat" ? 76 : 102;
        var ang = Math.atan2(p.y - CY, p.x - CX);
        var tx = CX + Math.cos(ang) * targetR, ty = CY + Math.sin(ang) * targetR;
        p.vx += (tx - p.x) * 0.016;
        p.vy += (ty - p.y) * 0.016;
        p.vx *= 0.7; p.vy *= 0.7;
        p.x += p.vx; p.y += p.vy;
      }
    }
    for (var t = 0; t < 420; t++) iter();
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
          '<div class="graph-legend">' +
            cats.map(function (c) { return '<span class="lg"><i style="background:' + CAT_COLOR[c.id] + '"></i>' + c.label + '</span>'; }).join("") +
            '<span class="lg sep"><span class="ln-k"></span>亲缘</span>' +
            '<span class="lg sep"><span class="ln-c"></span>地域·门类</span>' +
            '<span class="graph-meta">' + byId.length + ' 项招牌 · ' + cats.length + ' 大门类 · ' + Object.keys(cities).length + ' 地市 · ' + Object.keys(kin).length + ' 组亲缘</span>' +
          '</div>' +
          '<div class="graph-zoom" aria-label="图谱缩放">' +
            '<button class="gz-out" title="缩小">−</button>' +
            '<button class="gz-in" title="放大">+</button>' +
            '<button class="gz-r" title="复位">↻</button>' +
          '</div>' +
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
        /* 门类：双环徽章 + 内芯 */
        el += '<circle r="13.5" fill="none" stroke="' + nd.color + '" stroke-width="1.3"></circle>';
        el += '<circle r="10.4" fill="' + nd.color + '" opacity=".14"></circle>';
        el += '<circle r="4.4" fill="' + nd.color + '" stroke="#F4EDDF" stroke-width=".9"></circle>';
        el += '<text y="7.2" text-anchor="middle" font-size="7.8">' + esc(nd.label) + '</text>';
      } else if (nd.type === "city") {
        /* 地市：菱形方标 */
        el += '<rect x="-5.9" y="-5.9" width="11.8" height="11.8" transform="rotate(45)" fill="' + nd.color + '" stroke="#F4EDDF" stroke-width="1.2"></rect>';
        el += '<text y="11.2" text-anchor="middle" font-size="6.2">' + esc(nd.label) + '</text>';
      } else {
        /* 项目：外晕 + 实心 */
        el += '<circle r="10.5" fill="' + nd.color + '" opacity=".16"></circle>';
        el += '<circle r="6.4" fill="' + nd.color + '" stroke="#F4EDDF" stroke-width="1.2"></circle>';
        el += '<text y="14.6" text-anchor="middle" font-size="7">' + esc(nd.label) + '</text>';
      }
      el += '</g>';
      return el;
    }).join("");
    var edgeList = G.edges.map(function (e) {
      var a = pos[e.a], b = pos[e.b];
      var kin = e.w >= 2 ? ' g-link-kin' : '';
      return '<line class="g-link' + kin + '" data-a="' + e.a + '" data-b="' + e.b + '" x1="' + a.x.toFixed(2) + '" y1="' + a.y.toFixed(2) + '" x2="' + b.x.toFixed(2) + '" y2="' + b.y.toFixed(2) + '"></line>';
    }).join("");
    var W = 1000, H = 540;
    var _old = stage.querySelector('svg');
    if (_old) _old.parentNode.removeChild(_old);
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', '非遗知识图谱');
    svg.innerHTML = edgeList + nodeList;
    stage.appendChild(svg);

    /* 图谱缩放控件：窄屏可放大细读 */
    var zb = stage.querySelector('.graph-zoom');
    var svgEl = stage.querySelector('svg');
    if (zb && svgEl) {
      if (!zb._z) zb._z = 1;
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
      svgEl.style.transformOrigin = 'center center';
      function gzSet(v) {
        zb._z = Math.max(1, Math.min(3.2, Math.round(v * 10) / 10));
        svgEl.style.transform = 'scale(' + zb._z + ')';
      }
      zb.querySelector('.gz-in').onclick = function () { gzSet(zb._z * 1.25); };
      zb.querySelector('.gz-out').onclick = function () { gzSet(zb._z / 1.25); };
      zb.querySelector('.gz-r').onclick = function () { gzSet(1); };
      /* 滚轮缩放：以图谱框中心为轴（M8.37i） */
      stage.addEventListener('wheel', function (ev) {
        if (ev.target.closest && ev.target.closest('.graph-zoom')) return;
        ev.preventDefault();
        gzSet(zb._z * (ev.deltaY < 0 ? 1.12 : 0.89));
      }, { passive: false });
    }

    /* 入场动画：节点分批渐显 + 连线渐显（M8.10） */
    if (!REDUCED) {
      var _gn = stage.querySelectorAll(".g-node"), _gl = stage.querySelectorAll(".g-link");
      for (var _gi = 0; _gi < _gn.length; _gi++) _gn[_gi].style.opacity = "0";
      for (var _li = 0; _li < _gl.length; _li++) _gl[_li].style.opacity = "0";
      _gn.forEach(function (g, i) {
        var d = 120 + (i % 3) * 70 + Math.floor(i / 3) * 22;
        g.style.transition = "opacity .5s cubic-bezier(.22,1,.36,1) " + d + "ms";
        setTimeout(function () { g.style.opacity = "1"; }, 40);
      });
      _gl.forEach(function (l, i) {
        l.style.transition = "opacity .55s ease " + (180 + i * 10) + "ms";
        setTimeout(function () { l.style.opacity = "1"; }, 40);
      });
    }

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
    var askModeLabel = (typeof REMOTE_API === "object" && REMOTE_API.key)
      ? '<button class="mode-switch" id="ask-mode" type="button" aria-pressed="false" title="有 key 时点亮真·大模型回答">离线 ⇄ 在线</button>'
      : '';
    el.innerHTML =
      '<div class="ask-bg" aria-hidden="true"></div>' +
      '<div class="ask-veil" aria-hidden="true"></div>' +
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
              '<span class="status" id="ask-status"><i></i>内置知识库 · 离线模式</span>' + askModeLabel +
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
      var online = (typeof askOnline !== "undefined") && askOnline && REMOTE_API && REMOTE_API.url && REMOTE_API.key;
      if (!online) {
        var think = pushMsg("ai", null, null, false, true);
        setTimeout(function () {
          var ans = matchAnswer(text);
          askHistory.push({ q: text, a: ans.a });
          typeInto(think, ans.a, ans.src);
        }, REDUCED ? 0 : 480);
      } else {
        var think2 = pushMsg("ai", null, null, false, true);
        fetch(REMOTE_API.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + REMOTE_API.key },
          body: JSON.stringify({
            model: REMOTE_API.model || "doubao-seed-1-6-250615",
            messages: [{ role: "user", content: text }],
            stream: false
          })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (think2 && think2.parentNode) think2.parentNode.removeChild(think2);
          var txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
          askHistory.push({ q: text, a: txt || "" });
          typeInto(think2, txt || JSON.stringify(j) || "（无返回内容）", "在线大模型 · " + (REMOTE_API.model || ""));
        }).catch(function (e) {
          if (think2 && think2.parentNode) think2.parentNode.removeChild(think2);
          pushMsg("ai", "在线请求失败：" + e.message + "。file:// 直开会被浏览器拦截跨域，请本地起服务或部署到线上后使用（离线模式不受影响）。");
        });
      }
    }

    var askOnline = false;
    var modeBtn = $("#ask-mode");
    if (modeBtn) modeBtn.addEventListener("click", function () {
      askOnline = !askOnline;
      modeBtn.setAttribute("aria-pressed", String(askOnline));
      var st = $("#ask-status");
      if (st) {
        st.innerHTML = askOnline
          ? "<i></i>在线模式 · 大模型回答"
          : "<i></i>内置知识库 · 离线模式";
      }
      if (askOnline && (!REMOTE_API || !REMOTE_API.key)) {
        pushMsg("ai", "在线模式需要先在 app.js 顶部 REMOTE_API 填入 url 与 key（请勿提交到公开仓库）；当前仍由内置知识库回答。");
        askOnline = false;
        modeBtn.setAttribute("aria-pressed", "false");
        if (st) st.innerHTML = "<i></i>内置知识库 · 离线模式";
      }
    });
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

  /* 多轮上下文（M8.10）：记录上一主题，支持「它/这个/那」等指代追问 */
  var lastTopic = "";
  function resolveAsk(q) {
    var t = (q || "").trim();
    var m = t.match(/^(它|他|她|这个|那个|这些|那些|这|那|其)(.+)$/);
    if (lastTopic && m) return lastTopic + m[2];
    if (t.length <= 4 && lastTopic && !/^(什么是|哪些|河南|非遗|介绍|推荐)/.test(t)) return lastTopic + t;
    return t;
  }
  function matchAnswer(q) {
    var query = resolveAsk(q);
    var best = null, bestScore = 0;
    KB_ALL.forEach(function (k) {
      var score = 0;
      k.keywords.forEach(function (kw) {
        if (query.indexOf(kw) >= 0) score += kw.length >= 4 ? 3 : 2;
      });
      if (score > bestScore) { bestScore = score; best = k; }
    });
    if (best && bestScore >= 2) {
      lastTopic = best.itemName || best.title || "";
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
      '<div class="immerse-bg" aria-hidden="true"></div>' +
      '<div class="immerse-veil" aria-hidden="true"></div>' +
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
      '<div class="create-bg" aria-hidden="true"></div>' +
      '<div class="create-veil" aria-hidden="true"></div>' +
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
              '<button class="btn-share" id="btn-share" type="button">复制分享文案</button>' +
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

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast("分享文案已复制"); }, function () { fallbackCopy(t); });
    } else { fallbackCopy(t); }
  }
  function fallbackCopy(t) {
    var ta = document.createElement("textarea");
    ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("分享文案已复制"); } catch (e) { toast("复制失败，请手动复制"); }
    document.body.removeChild(ta);
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }
  function bindCreate() {
    var shareBtn = $("#btn-share");
    if (shareBtn) shareBtn.addEventListener("click", function () {
      var it = byId[createIdx] || byId[0];
      var st = CREATE_STYLES.filter(function (s) { return s.id === createStyle; })[0] || CREATE_STYLES[0];
      copyText("我在「非遗智汇 · 河南非遗 AI 数字展厅」用 AI 生成了一张「" + it.name + "」" + st.label +
        "文创海报——15 项河南招牌非遗、6 大门类、10 地市，纯本地 · 零上传 · 双击即开。一起来把非遗讲给你听！" +
        "（传智杯 AI 创新应用挑战赛 · B 组参赛作品）");
    });
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
      var hs = document.querySelector(".hero-scroll");
      if (hs) hs.classList.toggle("gone", window.scrollY > 60);
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
