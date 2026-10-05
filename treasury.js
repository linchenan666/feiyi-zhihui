/* ================= 3D 珍品馆 · 引擎（Three.js 程序化建模，纯离线） ================= */
/* 独立脚本助手：不依赖 app.js 闭包内的 $ / $$ */
function $q(s, r) { return (r || document).querySelector(s); }
function $qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
var _TIT = {};
if (typeof byId !== "undefined") byId.forEach(function (it) { _TIT[it.id] = it; });

var T3D = {
  built: false, stage: null, canvas: null,
  renderer: null, scene: null, camera: null, raycaster: null,
  group: null, parts: [], labelSpheres: [], cur: null,
  idx: 0, expl: 0, varg: 0.5, cut: false, rot: true,
  showScale: false, showLabel: true,
  tex: { crackle: true, glaze: true, streak: true },
  light: "museum", dragging: false, moved: false,
  lastX: 0, lastY: 0, pinchDist: 0, animId: 0, running: false,
  lights: {}, scaleEl: null, cardEl: null, fallbackEl: null,
  segButtons: []
};

function renderTreasury() {
  var root = $q("#view-treasury");
  if (!root) return;
  if (!T3D.built) {
    root.innerHTML = treasuryHTML();
    T3D.stage = $q("#t3d-stage");
    T3D.cardEl = $q("#t3d-card");
    T3D.fallbackEl = $q("#t3d-fallback");
    bindTreasuryUI();
    initT3DScene();
    T3D.built = true;
  }
  loadTreasuryArtifact(T3D.idx);
  startT3DLoop();
}

function treasuryHTML() {
  var arts = TREASURY_3D.map(function (a, i) {
    return '<button class="th-art' + (i === 0 ? " on" : "") + '" data-i="' + i + '"><i></i><span>' + a.name + "</span></button>";
  }).join("");
  return (
    '<div class="treasury-wrap">' +
    '<header class="th-head">' +
    '<div class="th-kicker">3D · 数字珍品馆</div>' +
    '<h2 class="th-title">3D 珍品馆</h2>' +
    '<p class="th-sub">指尖拆解千年窑火 · 每一道釉色都能近观细察</p>' +
    "</header>" +
    '<div class="th-main">' +
    '<div class="th-stage" id="t3d-stage">' +
    '<div class="th-fallback" id="t3d-fallback" style="display:none"></div>' +
    '<div class="th-hint" id="t3d-hint">拖拽旋转 · 滚轮缩放 · 点击部件与标注查看考据</div>' +
    '<div class="th-card" id="t3d-card"></div>' +
    '<div class="th-scale" id="t3d-scale" style="display:none">' +
    '<span class="ts-line"></span><span class="ts-tag">170cm 参照</span>' +
    '<svg viewBox="0 0 60 120" aria-hidden="true"><path d="M30 118 L30 78 Q30 62 20 58 L12 52 Q9 50 10 47 L18 49 Q26 51 30 56 L30 44 L26 30 Q25 26 27 24 L29 30 L31 22 Q33 20 34 22 L33 32 L34 44 L38 56 Q42 52 48 49 L54 47 Q55 50 52 52 L44 58 Q34 62 34 78 L34 118 Z" fill="rgba(232,224,200,0.5)"/></svg>' +
    "</div>" +
    "</div>" +
    '<aside class="th-panel">' +
    '<div class="th-art-row" id="t3d-artrow">' + arts + "</div>" +
    '<div class="th-group">' +
    '<div class="th-label"><span>爆炸拆解</span><em id="t3d-explv">0%</em></div>' +
    '<input type="range" id="t3d-expl" min="0" max="100" value="0">' +
    "</div>" +
    '<div class="th-group">' +
    '<div class="th-label"><span>窑变釉色 · 彩蛋</span><em id="t3d-vargv">中</em></div>' +
    '<input type="range" id="t3d-varg" min="0" max="100" value="50">' +
    "</div>" +
    '<div class="th-grid">' +
    '<button class="th-btn on" data-t="real">实物影像</button>' +
    '<button class="th-btn" data-t="process">工艺演示</button>' +
    '<button class="th-btn" data-t="know">工艺知识</button>' +
    '<button class="th-btn" data-t="cut">半剖观胎</button>' +
    '<button class="th-btn on" data-t="rot">自动旋转</button>' +
    '<button class="th-btn" data-t="scale">比例尺</button>' +
    '<button class="th-btn on" data-t="label">年代标注</button>' +
    '<button class="th-btn" data-t="audio">语音讲解</button>' +
    '<button class="th-btn" data-t="shot">截图存档</button>' +
    "</div>" +
    '<div class="th-seg" id="t3d-light">' +
    '<button data-l="museum" class="on">博物馆灯</button><button data-l="kiln">窑火</button><button data-l="day">日光</button>' +
    "</div>" +
    '<div class="th-seg" id="t3d-tex">' +
    '<button data-x="crackle" class="on">开片纹</button><button data-x="glaze">釉面清漆</button><button data-x="streak">流釉·彩绘</button>' +
    "</div>" +
    '<div class="th-art-info"><div class="th-ai-name" id="t3d-name"></div><div class="th-ai-meta" id="t3d-meta"></div></div>' +
    "</aside>" +
    "</div>" +
    "</div>"
  );
}

/* ---------- UI 绑定 ---------- */
function bindTreasuryUI() {
  $q("#t3d-artrow").addEventListener("click", function (e) {
    var b = e.target.closest(".th-art");
    if (!b) return;
    $qa("#t3d-artrow .th-art").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    loadTreasuryArtifact(+b.getAttribute("data-i"));
  });

  var ex = $q("#t3d-expl");
  ex.addEventListener("input", function () {
    T3D.expl = +ex.value / 100;
    $q("#t3d-explv").textContent = ex.value + "%";
    applyExplode();
  });

  var vg = $q("#t3d-varg");
  vg.addEventListener("input", function () {
    T3D.varg = +vg.value / 100;
    var t = T3D.varg < 0.35 ? "冷" : T3D.varg > 0.7 ? "暖" : "中";
    $q("#t3d-vargv").textContent = t;
    rebuildBodyTexture();
  });

  $qa(".th-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-t");
      if (t === "cut") { T3D.cut = !T3D.cut; b.classList.toggle("on", T3D.cut); applyCut(); }
      else if (t === "rot") { T3D.rot = !T3D.rot; b.classList.toggle("on", T3D.rot); }
      else if (t === "scale") { T3D.showScale = !T3D.showScale; b.classList.toggle("on", T3D.showScale); T3D.scaleEl.style.display = T3D.showScale ? "block" : "none"; }
      else if (t === "label") { T3D.showLabel = !T3D.showLabel; b.classList.toggle("on", T3D.showLabel); applyLabels(); }
      else if (t === "process") { openProcess(); }
      else if (t === "know") { openKnow(); }
      else if (t === "real") { openT3DReal(); }
      else if (t === "audio") { speakTreasury(); }
      else if (t === "shot") { shotTreasury(); }
    });
  });

  $qa("#t3d-light button").forEach(function (b) {
    b.addEventListener("click", function () {
      T3D.light = b.getAttribute("data-l");
      $qa("#t3d-light button").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      applyLight();
    });
  });

  $qa("#t3d-tex button").forEach(function (b) {
    b.addEventListener("click", function () {
      var x = b.getAttribute("data-x");
      T3D.tex[x] = !T3D.tex[x];
      b.classList.toggle("on", T3D.tex[x]);
      if (x === "glaze") applyGlaze(); else rebuildBodyTexture();
    });
  });
}

/* ---------- 场景 ---------- */
/* 低配档探测：集显笔记本 / 低内存设备 / 窄屏触屏 → 关闭抗锯齿与阴影、降几何段数，保 30FPS */
function detectLowPerf() {
  try {
    var cores = navigator.hardwareConcurrency || 8;
    var mem = navigator.deviceMemory || 8;
    if (cores <= 2 || mem <= 2) return true;
    if (cores <= 4 && mem <= 4) return true;
  } catch (e) {}
  if (window.innerWidth <= 480) return true;
  return false;
}
function segN(n) {
  return T3D.lowPerf ? Math.max(6, Math.round(n * 0.4)) : n;
}
function initT3DScene() {
  T3D.scaleEl = $q("#t3d-scale");
  T3D.lowPerf = detectLowPerf();
  var ok = false;
  try {
    T3D.renderer = new THREE.WebGLRenderer({ antialias: !T3D.lowPerf, alpha: true, preserveDrawingBuffer: true });
    ok = true;
  } catch (e) { ok = false; }
  if (!ok) {
    $q("#t3d-hint").textContent = "";
    T3D.fallbackEl.style.display = "flex";
    T3D.fallbackEl.innerHTML = '<div class="tf-badge">当前设备不支持 WebGL</div><img alt="展品图" src="' + $q("#view-treasury").getAttribute("data-fb") + '">';
    return;
  }
  T3D.renderer.setPixelRatio(T3D.lowPerf ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  T3D.renderer.setClearColor(0x000000, 0);
  if (T3D.lowPerf) {
    T3D.renderer.shadowMap.enabled = false;
  } else {
    T3D.renderer.shadowMap.enabled = true;
    T3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  T3D.stage.appendChild(T3D.renderer.domElement);
  T3D.canvas = T3D.renderer.domElement;
  T3D.canvas.className = "th-canvas";
  T3D.scene = new THREE.Scene();
  /* 展厅环境反射（程序化六面，供釉面反光） */
  if (typeof T3DM !== "undefined" && T3DM.makeEnvCube) {
    T3D.scene.environment = T3DM.makeEnvCube();
  }
  T3D.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 600);
  T3D.raycaster = new THREE.Raycaster();

  /* 灯光组：博物馆射灯（暖主光左上 45° + 冷补光 + 天光 + 背后冷色轮廓光） */
  var ls = T3D.lights = {
    amb: new THREE.AmbientLight(0xffffff, 0.42),
    dir: new THREE.DirectionalLight(0xfff2e0, 0.85),
    point: new THREE.PointLight(0xffe8c8, 0.5, 80, 2),
    spot: new THREE.SpotLight(0xffe0c0, 1.35, 0, 0.52, 0.62, 1.4),
    fill: new THREE.DirectionalLight(0x9ab0ff, 0.22),
    rim: new THREE.DirectionalLight(0x8aa4e8, 0.55)
  };
  ls.dir.position.set(9, 18, 11); ls.dir.target.position.set(0, 4, 0);
  ls.dir.castShadow = !T3D.lowPerf;
  ls.dir.shadow.mapSize.width = 1024;
  ls.dir.shadow.mapSize.height = 1024;
  ls.dir.shadow.camera.near = 1;
  ls.dir.shadow.camera.far = 120;
  ls.dir.shadow.camera.left = -20; ls.dir.shadow.camera.right = 20;
  ls.dir.shadow.camera.top = 20; ls.dir.shadow.camera.bottom = -20;
  ls.spot.position.set(-7, 22, 6); ls.spot.target.position.set(0, 3, 0);
  ls.fill.position.set(-10, 6, -12);
  ls.rim.position.set(0, 8, -18);
  T3D.scene.add(ls.amb, ls.dir, ls.point, ls.spot, ls.fill, ls.rim);
  T3D.scene.add(ls.dir.target, ls.spot.target);

  /* 地面光晕（扩大承接展台） */
  var g = document.createElement("canvas"); g.width = g.height = 512;
  var gx = g.getContext("2d");
  var rg = gx.createRadialGradient(256, 256, 20, 256, 256, 252);
  rg.addColorStop(0, "rgba(8,6,5,0.62)"); rg.addColorStop(0.45, "rgba(8,6,5,0.30)"); rg.addColorStop(1, "rgba(8,6,5,0)");
  gx.fillStyle = rg; gx.fillRect(0, 0, 512, 512);
  var gt = new THREE.CanvasTexture(g);
  var ground = new THREE.Mesh(
    new THREE.CircleGeometry(70, 64),
    new THREE.MeshBasicMaterial({ map: gt, transparent: true, depthWrite: false, opacity: 0.92 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  ground.name = "ground";
  T3D.scene.add(ground);

  bindT3DInput();
  window.addEventListener("resize", resizeT3D);

  /* WebGL 上下文丢失自恢复：切窗口 / 长时间演示不黑屏 */
  var cvDom = T3D.renderer.domElement;
  cvDom.addEventListener("webglcontextlost", function (ev) {
    ev.preventDefault();
    if (T3D.running) { cancelAnimationFrame(T3D.animId); T3D.running = false; }
    var h = $q("#t3d-hint"); if (h) h.textContent = "3D 画面暂不可用，正在恢复…";
  }, false);
  cvDom.addEventListener("webglcontextrestored", function () {
    if (T3D.renderer && !T3D.running) startT3DLoop();
    var h = $q("#t3d-hint"); if (h) h.textContent = "";
  }, false);
}

function resizeT3D() {
  if (!T3D.renderer || !T3D.stage) return;
  var w = T3D.stage.clientWidth, h = T3D.stage.clientHeight;
  if (!w || !h) return;
  var pr = T3D.lowPerf ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  T3D.renderer.setPixelRatio(pr);
  T3D.renderer.setSize(w, h);
  T3D.camera.aspect = w / h;
  T3D.camera.updateProjectionMatrix();
}

/* 每帧尺寸自愈：视图过渡期布局变化后保证缓冲与舞台一致 */
function selfHealT3D() {
  if (!T3D.stage || !T3D.renderer) return;
  var w = T3D.stage.clientWidth, h = T3D.stage.clientHeight;
  if (!w || !h) return;
  var pr = T3D.lowPerf ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  var tw = Math.round(w * pr), th = Math.round(h * pr);
  if (T3D.renderer.domElement.width !== tw || T3D.renderer.domElement.height !== th) resizeT3D();
}

/* ---------- 文物加载 ---------- */
function loadTreasuryArtifact(i) {
  if (!T3D.renderer) {
    var a0 = TREASURY_3D[i];
    var fb = $q("#view-treasury");
    var it = _TIT[a0.id];
    fb.setAttribute("data-fb", it ? it.img : "");
    T3D.fallbackEl.innerHTML = '<div class="tf-badge">当前设备不支持 WebGL</div><img alt="' + a0.name + '" src="' + (it ? it.img : "") + '">';
    return;
  }
  T3D.idx = i;
  disposeGroup();
  var a = TREASURY_3D[i];
  T3D.cur = a;
  var it = _TIT[a.id];

  T3D.group = new THREE.Group();
  T3D.scene.add(T3D.group);
  T3D.parts = [];
  T3D.labelSpheres = [];

  /* 分段部件 */
  /* 异形陶塑（泥咕咕/泥泥狗）：侧影挤出 + 附件拆解件 */
  if (a.side) {
    buildSideArtifact(a);
  } else {
    /* 旋转成型件：剖面点列（Catmull-Rom 样条平滑）逐部件构建 */
    a.parts.forEach(function (p, pi) {
      var pts = [];
      a.profile.forEach(function (pt) {
        var y = pt[1];
        if (y >= p.y[0] - 0.001 && y <= p.y[1] + 0.001) {
          pts.push(new THREE.Vector2(pt[0] * a.radiusCm, pt[1] * a.heightCm));
        }
      });
      if (pts.length < 2) return;
      var prof = pts.map(function (p2) { return [p2.x, p2.y]; });
      var geo = new THREE.LatheGeometry(catmull2D(prof, 4).map(function (p2) { return new THREE.Vector2(p2[0], p2[1]); }), segN(256));
      var mat = bodyMat(a);
      var mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.userData = { part: p, pkey: p.key, pi: pi, base: new THREE.Vector3(0, 0, 0) };
      T3D.group.add(mesh);
      T3D.parts.push(mesh);

    /* 端面封口（露胎断面） */
    var y0 = p.y[0] * a.heightCm, y1 = p.y[1] * a.heightCm;
    var r0 = radiusAt(a, p.y[0]), r1 = radiusAt(a, p.y[1]);
    if (r0 > 0.0001) { var c0 = endCap(a, r0 * a.radiusCm); c0.position.y = y0; c0.userData.baseY = y0; c0.userData.partRef = mesh; T3D.group.add(c0); mesh.userData.caps = mesh.userData.caps || []; mesh.userData.caps.push(c0); }
    if (r1 > 0.0001) { var c1 = endCap(a, r1 * a.radiusCm); c1.position.y = y1; c1.userData.baseY = y1; c1.userData.partRef = mesh; T3D.group.add(c1); mesh.userData.caps = mesh.userData.caps || []; mesh.userData.caps.push(c1); }
    });
  }

  /* 附件：贯耳/系耳、弦纹、吹嘴、双耳 */
  if (a.handles) addHandles(a);
  if (a.rings) addRings(a);
  if (a.mouthGeo) addMouth(a);
  if (a.earsGeo) addEarsGeo(a);
  if (a.feet) addFeet(a);
  addPedestal(a);

  /* 标注点 */
  (a.labels || []).forEach(function (lb, li) {
    var r = lb.r * a.radiusCm, y = lb.y * a.heightCm;
    var s = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.06, a.radiusCm * 0.055), segN(16), segN(12)),
      new THREE.MeshStandardMaterial({ color: 0xd8b45a, emissive: 0x8a6a2a, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.35 })
    );
    if (a.side) s.position.set((lb.r * 2 - 1) * a.radiusCm, lb.y * a.heightCm, 0);
    else s.position.set(r * 1.04, y, 0);
    s.userData = { label: lb, li: li };
    T3D.group.add(s);
    T3D.labelSpheres.push(s);
  });

  /* 视角 */
  var h = a.heightCm;
  T3D.camH = h;
  T3D.camera.position.set(0, h * 1.05, h * 2.3);
  T3D.camera.lookAt(0, h * 0.42, 0);
  T3D.zoom = 1;
  applyLight();
  applyExplode();
  applyCut();
  applyLabels();
  applyGlaze();
  rebuildBodyTexture(false);

  /* 信息 */
  $q("#t3d-name").textContent = a.name;
  $q("#t3d-meta").textContent = a.place + " · " + a.level + " · " + (a.heightCm >= 20 ? "高 " + a.heightCm + " cm" : "通高 " + a.heightCm + " cm");
  hideT3DCard();
  /* 工艺演示/知识层同步 */
  if (typeof onArtifactProcess === "function") onArtifactProcess();
  if (typeof closeKnow === "function") closeKnow();
}

function radiusAt(a, y) {
  var pts = a.profile, lo = pts[0], hi = pts[pts.length - 1];
  for (var i = 0; i < pts.length - 1; i++) {
    if (pts[i][1] <= y && pts[i + 1][1] >= y) { lo = pts[i]; hi = pts[i + 1]; break; }
  }
  var t = hi[1] === lo[1] ? 0 : (y - lo[1]) / (hi[1] - lo[1]);
  return lo[0] + (hi[0] - lo[0]) * t;
}

function bodyMat(a) {
  var t = getBodyTex(a);
  var m = new THREE.MeshPhysicalMaterial({
    map: t.map,
    normalMap: t.normalMap,
    bumpMap: t.bumpMap || null,
    bumpScale: a.bumpS || 0.055,
    clearcoatNormalMap: t.clearcoatNormalMap || null,
    roughnessMap: t.roughnessMap,
    metalness: a.body.metal,
    roughness: a.body.rough,
    clearcoat: T3D.tex.glaze ? a.body.cc : 0,
    clearcoatRoughness: a.body.ccR || 0.25,
    envMapIntensity: a.body.env || 0.7,
    side: THREE.DoubleSide,
    emissive: 0x000000
  });
  return m;
}

function endCap(a, r) {
  var g = new THREE.CircleGeometry(Math.max(0.001, r), 48);
  var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    color: a.tire.color, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide
  }));
  m.rotation.x = Math.PI / 2;
  return m;
}

function addFeet(a) {
  for (var i = 0; i < a.feet; i++) {
    var ang = (i / a.feet) * Math.PI * 2 + Math.PI / 6;
    var foot = new THREE.Group();
    if (a.footKind === "ru") {
      /* 乳钉足：矮半球钉贴底（汝窑三足洗） */
      var nail = new THREE.Mesh(
        new THREE.SphereGeometry(a.radiusCm * 0.052, segN(20), segN(14), 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: a.tire.color, roughness: 0.55, metalness: 0.0 })
      );
      nail.position.y = a.heightCm * 0.010;
      foot.add(nail);
      foot.position.set(Math.cos(ang) * a.radiusCm * 0.55, a.heightCm * 0.014, Math.sin(ang) * a.radiusCm * 0.55);
    } else {
      /* 兽足：上宽下收的柱 + 蹄端（唐三彩三足罐等） */
      var k = a.footKind === "beast" ? 1.35 : 1;   /* 兽足加粗 */
      var shank = new THREE.Mesh(
        new THREE.CylinderGeometry(a.radiusCm * 0.055 * k, a.radiusCm * 0.085 * k, a.heightCm * 0.075 * k, segN(16)),
        new THREE.MeshStandardMaterial({ color: a.tire.color, roughness: 0.85, metalness: 0.0 })
      );
      shank.position.y = a.heightCm * 0.045 * k;
      var hoof = new THREE.Mesh(
        new THREE.SphereGeometry(a.radiusCm * 0.085 * k, segN(16), segN(12), 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: a.tire.color, roughness: 0.9, metalness: 0.0 })
      );
      hoof.position.y = a.heightCm * 0.008 * k;
      foot.add(shank, hoof);
      foot.position.set(Math.cos(ang) * a.radiusCm * 0.44, a.heightCm * 0.012, Math.sin(ang) * a.radiusCm * 0.44);
      foot.rotation.z = Math.cos(ang) * 0.16; foot.rotation.x = Math.sin(ang) * 0.16;
    }
    foot.traverse(function (o) { if (o.isMesh) { o.castShadow = true; } });
    foot.userData = { part: a.parts[2], pkey: "foot", pi: 2, base: new THREE.Vector3(0, 0, 0) };
    T3D.group.add(foot);
    T3D.parts.push(foot);
  }
}

/* ========== 附件构建 ========== */

/* 双贯耳（钧瓷）：方形圆角耳，立于束颈两侧 */
function addHandles(a) {
  if (a.handles === "guan") {
    var w = a.radiusCm * 0.16, d = a.radiusCm * 0.10, hh = a.heightCm * 0.14;
    var earGeo = new THREE.BoxGeometry(w, hh, d);
    earGeo.translate(0, hh / 2 - a.heightCm * 0.10, 0);
    /* 圆角（用 BevelBox 替代复杂几何） */
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(earGeo, bodyMat(a));
      ear.position.set(s * a.radiusCm * 0.30, a.heightCm * 0.80, 0);
      ear.castShadow = true;
      ear.userData = { part: a.parts[0], pkey: "lip", pi: 0, base: new THREE.Vector3(s * a.radiusCm * 0.30, a.heightCm * 0.80, 0) };
      T3D.group.add(ear);
      T3D.parts.push(ear);
    });
  } else if (a.handles === "xi") {
    /* 三彩系耳：椭圆截面环形耳（陶泥盘条捏塑感，更接近真实器型） */
    var R = a.radiusCm * 0.12, tubeR = a.radiusCm * 0.038;
    var earPts = [];
    for (var a2 = 0; a2 <= 22; a2++) {
      var th = a2 / 22 * Math.PI * 1.4;
      earPts.push(new THREE.Vector3(Math.cos(th) * R, Math.sin(th) * R * 0.82, 0));
    }
    var earCurve = new THREE.CatmullRomCurve3(earPts);
    var earGeo = new THREE.TubeGeometry(earCurve, 22, tubeR, 12, false);
    earGeo.scale(1, 1, 1.25); /* 截面压扁成椭圆，模拟盘条耳 */
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(earGeo, bodyMat(a));
      ear.position.set(s * a.radiusCm * 0.52, a.heightCm * 0.70, 0);
      ear.rotation.z = s * 0.45;
      ear.castShadow = true;
      ear.userData = { part: a.parts[1], pkey: "belly", pi: 1, base: new THREE.Vector3(s * a.radiusCm * 0.52, a.heightCm * 0.70, 0) };
      T3D.group.add(ear);
      T3D.parts.push(ear);
    });
  } else if (a.handles === "spout") {
    /* 花浇：细长流口斜出上翘（末端花口喇叭）+ 环形执柄连颈及腹 */
    var hC2 = a.heightCm, rC2 = a.radiusCm;
    var spout = new THREE.Mesh(
      new THREE.CylinderGeometry(rC2 * 0.052, rC2 * 0.058, hC2 * 0.34, segN(14)),
      bodyMat(a)
    );
    spout.position.set(rC2 * 0.70, hC2 * 0.70, 0);
    spout.rotation.z = -0.58;
    spout.castShadow = true;
    spout.userData = { part: a.parts[3], pkey: "spout", pi: 3, base: spout.position.clone() };
    T3D.group.add(spout); T3D.parts.push(spout);
    var tip = new THREE.Mesh(
      new THREE.CylinderGeometry(rC2 * 0.070, rC2 * 0.052, hC2 * 0.055, segN(14), 1, true),
      bodyMat(a)
    );
    tip.position.set(rC2 * 0.98, hC2 * 0.90, 0);
    tip.rotation.z = -0.58;
    tip.castShadow = true;
    tip.userData = { part: a.parts[3], pkey: "spout", pi: 3, base: tip.position.clone() };
    T3D.group.add(tip); T3D.parts.push(tip);
    /* 环形执柄 */
    var hp = [];
    for (var hx = 0; hx <= 16; hx++) {
      var ht = Math.PI * (0.55 + hx / 16 * 0.95);
      hp.push(new THREE.Vector3(Math.cos(ht) * rC2 * 0.17, Math.sin(ht) * rC2 * 0.17 * 1.3, 0));
    }
    var hCurve = new THREE.CatmullRomCurve3(hp);
    var hGeo = new THREE.TubeGeometry(hCurve, 18, rC2 * 0.032, 10, false);
    hGeo.scale(1, 1, 1.18);
    var hnd = new THREE.Mesh(hGeo, bodyMat(a));
    hnd.position.set(-rC2 * 0.56, hC2 * 0.60, 0);
    hnd.rotation.z = 0.3;
    hnd.castShadow = true;
    hnd.userData = { part: a.parts[4], pkey: "handle", pi: 4, base: hnd.position.clone() };
    T3D.group.add(hnd); T3D.parts.push(hnd);
  }
}

/* 弦纹环：颈部/口下凸起环棱 */
function addRings(a) {
  (a.rings || []).forEach(function (ry) {
    var rr = radiusAt(a, ry) * a.radiusCm * 1.06;
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(rr, a.radiusCm * 0.022, segN(12), segN(64)),
      bodyMat(a)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ry * a.heightCm;
    ring.castShadow = true;
    ring.userData = { part: a.parts[0], pkey: "lip", pi: 0, base: new THREE.Vector3(0, ry * a.heightCm, 0) };
    T3D.group.add(ring);
    T3D.parts.push(ring);
  });
}

/* 泥咕咕吹嘴：头顶小圆柱（独立拆解件） */
function addMouth(a) {
  var m = a.mouthGeo;
  var tube = new THREE.Mesh(
    new THREE.CylinderGeometry(m.r * a.radiusCm, m.r * a.radiusCm, m.h * a.heightCm, segN(14)),
    new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 0.9, metalness: 0.0 })
  );
  tube.position.set(m.x * 2 * a.radiusCm - a.radiusCm, m.y * a.heightCm + m.h * a.heightCm / 2, 0);
  /* 吹孔凹陷 */
  var hole = new THREE.Mesh(
    new THREE.CircleGeometry(m.r * a.radiusCm * 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x0d0906, roughness: 1 })
  );
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.01;
  tube.add(hole);
  tube.castShadow = true;
  tube.userData = { part: a.parts[0], pkey: "head", pi: 0, base: tube.position.clone() };
  T3D.group.add(tube);
  T3D.parts.push(tube);
}

/* 泥泥狗双耳：圆锥耳（独立拆解件，沿厚度方向两侧对称） */
function addEarsGeo(a) {
  var e = a.earsGeo;
  var earGeo = new THREE.ConeGeometry(e.r * a.radiusCm, e.h * a.heightCm, 10);
  earGeo.translate(0, e.h * a.heightCm / 2, 0);
  [-1, 1].forEach(function (s) {
    var ear = new THREE.Mesh(earGeo, bodyMat(a));
    ear.position.set(e.x0 * 2 * a.radiusCm - a.radiusCm, e.y * a.heightCm, s * e.gap * a.radiusCm);
    ear.rotation.x = -s * 0.22;
    ear.castShadow = true;
    ear.userData = { part: a.parts[0], pkey: "head", pi: 0, base: ear.position.clone() };
    T3D.group.add(ear);
    T3D.parts.push(ear);
  });
}

/* ========== 异形陶塑（侧影挤出 + 拆解件） ========== */
function buildSideArtifact(a) {
  var S = new THREE.Shape();
  a.side.forEach(function (p, i) {
    if (i === 0) S.moveTo(p[0], p[1]); else S.lineTo(p[0], p[1]);
  });
  S.closePath();
  var depth = 1, bevel = 0.012;
  var geo = new THREE.ExtrudeGeometry(S, {
    depth: depth, bevelEnabled: true,
    bevelThickness: bevel, bevelSize: bevel, bevelSegments: segN(3), steps: 2
  });
  /* 归一化坐标 → 物理尺寸（UV 保持 0-1，贴图与侧影对齐） */
  var w = a.radiusCm * 2, h = a.heightCm;
  geo.scale(w, h, a.thickCm);
  geo.translate(-w / 2, 0, -a.thickCm / 2);

  var mat = bodyMat(a);
  mat.clearcoat = 0; mat.envMapIntensity = 0.25;
  var body = new THREE.Mesh(geo, mat);
  body.castShadow = true;
  body.userData = { part: a.parts[1], pkey: "body", pi: 1, base: new THREE.Vector3(0, 0, 0) };
  T3D.group.add(body);
  T3D.parts.push(body);
}

/* 展台：木质圆台，承接文物（不参与爆炸），增强展品真实感 */
function addPedestal(a) {
  var r = a.radiusCm * 1.35, h = a.heightCm * 0.16;
  var pm = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.05, r * 1.18, h, segN(64), 1),
    new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.55, metalness: 0.12 })
  );
  pm.position.y = -h * 0.5;
  pm.receiveShadow = true;
  pm.castShadow = false;
  pm.name = "pedestal";
  T3D.group.add(pm);
  /* 台面金属圈 */
  var ring = new THREE.Mesh(
    new THREE.RingGeometry(r * 0.82, r, 64),
    new THREE.MeshStandardMaterial({ color: 0xc8a24a, roughness: 0.35, metalness: 0.75, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.001;
  ring.receiveShadow = true;
  T3D.group.add(ring);
}

function disposeGroup() {
  if (!T3D.group) return;
  T3D.group.traverse(function (o) {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (o.material.map) o.material.map.dispose();
      o.material.dispose();
    }
  });
  T3D.scene.remove(T3D.group);
  T3D.group = null;
}

/* ---------- 纹理生成（Canvas 程序化，离线） ---------- */
function makeBodyTexture(a) {
  var S = 512, c = document.createElement("canvas"); c.width = c.height = S;
  var x = c.getContext("2d");

  /* 底色：釉色渐变 / 彩绘黑底 / 流釉乳白 */
  if (a.paint && a.paint.on) {
    x.fillStyle = a.paint.base; x.fillRect(0, 0, S, S);
  } else if (a.streaky && a.streaky.on) {
    var bg = x.createLinearGradient(0, 0, 0, S);
    bg.addColorStop(0, "#f2ecd8"); bg.addColorStop(0.55, "#efe6d0"); bg.addColorStop(1, "#e4d8bc");
    x.fillStyle = bg; x.fillRect(0, 0, S, S);
  } else if (a.grad) {
    var gg = x.createLinearGradient(0, 0, 0, S);
    var vg = T3D.varg;
    a.grad.forEach(function (st, si) {
      var p = st[0];
      if (vg !== 0.5) {
        p = 0.5 + (p - 0.5) * (1 + (vg - 0.5) * 1.6);
        p = Math.max(0, Math.min(1, p));
      }
      gg.addColorStop(p, st[1]);
    });
    x.fillStyle = gg; x.fillRect(0, 0, S, S);
  } else {
    x.fillStyle = "#e8e0cc"; x.fillRect(0, 0, S, S);
  }

  /* 流釉竖纹 */
  if (a.streaky && a.streaky.on && T3D.tex.streak) {
    var cols = a.streaky.stops || [];
    for (var k = 0; k < 26; k++) {
      var cw = 6 + Math.random() * 16;
      var cc = cols[k % cols.length];
      var cg = x.createLinearGradient(0, 0, 0, S);
      cg.addColorStop(0, hexA(cc, 0.85)); cg.addColorStop(0.55, hexA(cc, 0.45)); cg.addColorStop(1, hexA(cc, 0));
      x.fillStyle = cg;
      x.fillRect(Math.random() * S, 0, cw, S);
    }
  }

  /* 开片纹 */
  if (a.crackle && a.crackle.on && T3D.tex.crackle) {
    x.strokeStyle = a.crackle.color;
    x.lineWidth = 1;
    var n = Math.round(90 * a.crackle.density);
    for (var i = 0; i < n; i++) {
      var sx = Math.random() * S, sy = Math.random() * S;
      x.beginPath(); x.moveTo(sx, sy);
      var seg = 2 + Math.floor(Math.random() * 3);
      for (var j = 0; j < seg; j++) {
        x.lineTo(sx + (Math.random() - 0.5) * 70, sy + (Math.random() - 0.5) * 70);
      }
      x.stroke();
    }
  }

  /* 彩绘纹样 */
  if (a.paint && a.paint.on && T3D.tex.streak) {
    if (a.paint.kind === "ninigou") {
      /* 四色点线图腾：白线卷 + 五彩点阵 */
      x.strokeStyle = "rgba(242,239,230,0.9)"; x.lineWidth = 3;
      for (var row = 0; row < 5; row++) {
        var ry = 90 + row * 78;
        x.beginPath();
        for (var q = 0; q <= S; q += 12) x.lineTo(q, ry + Math.sin((q + row * 60) / 40) * 6);
        x.stroke();
      }
      for (var dot = 0; dot < 46; dot++) {
        var px = Math.random() * S, py = Math.random() * S;
        x.fillStyle = a.paint.dots[Math.floor(Math.random() * a.paint.dots.length)];
        x.beginPath(); x.arc(px, py, 5 + Math.random() * 4, 0, 7); x.fill();
        x.fillStyle = "rgba(242,239,230,0.8)";
        x.beginPath(); x.arc(px, py, 1.8, 0, 7); x.fill();
      }
    } else {
      /* nigugu：点线花鸟纹 */
      x.strokeStyle = "rgba(242,239,230,0.85)"; x.lineWidth = 4;
      for (var r2 = 0; r2 < 4; r2++) {
        var yy = 100 + r2 * 96;
        x.beginPath(); x.moveTo(0, yy + (r2 % 2) * 10); x.lineTo(S, yy);
        for (var d = 0; d < 8; d++) { x.moveTo(d * 70 + 20, yy - 14); x.lineTo(d * 70 + 42, yy - 14); }
        x.stroke();
      }
      for (var d2 = 0; d2 < 40; d2++) {
        x.fillStyle = a.paint.dots[Math.floor(Math.random() * a.paint.dots.length)];
        x.beginPath(); x.arc(Math.random() * S, Math.random() * S, 4 + Math.random() * 3, 0, 7); x.fill();
      }
    }
  }

  return new THREE.CanvasTexture(c);
}

function hexA(hex, al) {
  var h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + al + ")";
}

function rebuildBodyTexture(silent) {
  if (!T3D.group || !T3D.cur) return;
  var a = T3D.cur;
  /* PBR：diffuse 重建（响应窑变滑条/纹理开关），normal/roughness 走缓存 */
  if (typeof getBodyTex === "function" && typeof disposeBodyTex === "function") {
    disposeBodyTex(a.id);
    var t = getBodyTex(a);
    T3D.parts.forEach(function (m) {
      if (m.material && m.material.map) {
        var old = m.material.map;
        m.material.map = t.map;
        m.material.normalMap = t.normalMap;
        m.material.roughnessMap = t.roughnessMap;
        m.material.needsUpdate = true;
        old.dispose();
      }
    });
    return;
  }
  var tex = makeBodyTexture(a);
  T3D.parts.forEach(function (m) {
    if (m.material && m.material.map) {
      var old = m.material.map;
      m.material.map = tex;
      m.material.needsUpdate = true;
      old.dispose();
    }
  });
}

/* ---------- 交互 ---------- */
function bindT3DInput() {
  var st = T3D.stage;
  st.addEventListener("pointerdown", function (e) {
    T3D.dragging = true; T3D.moved = false;
    T3D.lastX = e.clientX; T3D.lastY = e.clientY;
    st.setPointerCapture && st.setPointerCapture(e.pointerId);
  });
  st.addEventListener("pointermove", function (e) {
    if (!T3D.dragging || !T3D.group) return;
    var dx = e.clientX - T3D.lastX, dy = e.clientY - T3D.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) T3D.moved = true;
    T3D.lastX = e.clientX; T3D.lastY = e.clientY;
    T3D.group.rotation.y += dx * 0.008;
    T3D.group.rotation.x = Math.max(-1.1, Math.min(1.1, T3D.group.rotation.x + dy * 0.005));
  });
  st.addEventListener("pointerup", function (e) {
    if (!T3D.dragging) return;
    T3D.dragging = false;
    if (!T3D.moved) pickT3D(e);
  });
  st.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (!T3D.camera || !T3D.cur) return;
    var h = T3D.camH;
    var d = T3D.camera.position.length();
    var nd = Math.max(h * 1.6, Math.min(h * 6.5, d * (1 + e.deltaY * 0.0012)));
    var dir = T3D.camera.position.clone().normalize();
    T3D.camera.position.copy(dir.multiplyScalar(nd));
    T3D.camera.lookAt(0, h * 0.42, 0);
  }, { passive: false });

  /* 双指缩放 */
  st.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) {
      T3D.pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  st.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2 && T3D.camera && T3D.cur) {
      var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      var h = T3D.camH;
      var c = T3D.camera.position.length() * (T3D.pinchDist / Math.max(1, d));
      var nd = Math.max(h * 1.6, Math.min(h * 6.5, c));
      var dir = T3D.camera.position.clone().normalize();
      T3D.camera.position.copy(dir.multiplyScalar(nd));
      T3D.camera.lookAt(0, h * 0.42, 0);
      T3D.pinchDist = d;
    }
  }, { passive: true });
}

function pickT3D(e) {
  if (!T3D.renderer || !T3D.group) return;
  var r = T3D.stage.getBoundingClientRect();
  var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
  var ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
  T3D.raycaster.setFromCamera(new THREE.Vector2(nx, ny), T3D.camera);
  var capsAll = [];
  T3D.parts.forEach(function (m) { if (m.userData.caps) capsAll = capsAll.concat(m.userData.caps); });
  var hits = T3D.raycaster.intersectObjects(T3D.parts.concat(T3D.labelSpheres, capsAll), true);
  if (!hits.length) { hideT3DCard(); clearHighlight(); return; }
  var hit = hits[0].object;
  if (hit.userData.label) {
    clearHighlight();
    showT3DCard(hit.userData.label.text, "年代标注");
    return;
  }
  /* 命中 Group 子网格时回溯到父部件（如兽足组） */
  var pMesh = hit.userData.part ? hit : (hit.userData.partRef || (hit.parent && hit.parent.userData && hit.parent.userData.part ? hit.parent : null));
  if (pMesh && pMesh.userData.part) {
    highlightPart(pMesh);
    showT3DCard(pMesh.userData.part.name, pMesh.userData.part.text);
  }
}

function _setEmis(obj, on) {
  if (obj.material && obj.material.emissive) {
    obj.material.emissive.setHex(on ? 0xc9a23a : 0x000000);
    obj.material.emissiveIntensity = on ? 0.55 : 0;
  }
  if (obj.children) obj.children.forEach(function (c) { _setEmis(c, on); });
}

function highlightPart(mesh) {
  T3D.parts.forEach(function (m) { _setEmis(m, false); });
  _setEmis(mesh, true);
}

function clearHighlight() {
  T3D.parts.forEach(function (m) { _setEmis(m, false); });
}

function showT3DCard(title, body) {
  var c = T3D.cardEl;
  c.innerHTML = '<div class="tc-title">' + title + "</div><div class='tc-body'>" + body + "</div>";
  c.style.display = "block";
  c.classList.remove("tc-out");
  void c.offsetWidth;
  c.classList.add("tc-in");
}

function hideT3DCard() {
  if (!T3D.cardEl) return;
  T3D.cardEl.classList.remove("tc-in");
  T3D.cardEl.classList.add("tc-out");
  var self = T3D.cardEl;
  setTimeout(function () { if (self.classList.contains("tc-out")) self.style.display = "none"; }, 260);
}

/* ---------- 效果控制 ---------- */
function applyExplode() {
  if (!T3D.group || !T3D.cur) return;
  var a = T3D.cur, k = T3D.expl * a.heightCm * 0.75;
  T3D.parts.forEach(function (m) {
    if (!m.userData.part) return;
    var off = m.userData.part.off;
    var bx = m.userData.base ? m.userData.base.x : 0;
    var by = m.userData.base ? m.userData.base.y : 0;
    var bz = m.userData.base ? m.userData.base.z : 0;
    m.position.set(bx + off[0] * k, by + off[1] * k, bz + off[2] * k);
    if (m.userData.caps) m.userData.caps.forEach(function (c) {
      c.position.x = m.position.x; c.position.z = m.position.z;
      c.position.y = c.userData.baseY + m.position.y;
      /* 完整器物时隐藏中间接口封口盘（浑然一体）；拆解时露胎断面 */
      var isEnd = Math.abs(c.userData.baseY) < 0.01 || Math.abs(c.userData.baseY - T3D.cur.heightCm) < 0.01;
      c.visible = isEnd || T3D.expl > 0.03;
    });
  });
  /* 标注点跟随所属部件 */
  T3D.labelSpheres.forEach(function (s, si) {
    var lb = T3D.cur.labels[si];
    var owner = null;
    T3D.cur.parts.forEach(function (p) { if (lb.y >= p.y[0] && lb.y <= p.y[1]) owner = p; });
    var ox = 0, oy = 0, oz = 0;
    if (owner) { var k2 = T3D.expl * T3D.cur.heightCm * 0.75; var off = owner.off; ox = off[0] * k2; oy = off[1] * k2; oz = off[2] * k2; }
    if (a.side) s.position.set((lb.r * 2 - 1) * a.radiusCm + ox, lb.y * a.heightCm + oy, oz);
    else s.position.set(lb.r * a.radiusCm * 1.04 + ox, lb.y * a.heightCm + oy, oz);
  });
}

function applyCut() {
  if (!T3D.renderer) return;
  if (T3D.cut && T3D.cur) {
    var a = T3D.cur;
    T3D.scene.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
    if (!T3D.cutCap) {
      /* 剖面盖：露胎断面（旋转件=器型剖面；异形件=侧影截面） */
      var sh = new THREE.Shape();
      if (a.side) {
        a.side.forEach(function (pt, i) {
          if (i === 0) sh.moveTo(pt[0] * 2 * a.radiusCm - a.radiusCm, pt[1] * a.heightCm);
          else sh.lineTo(pt[0] * 2 * a.radiusCm - a.radiusCm, pt[1] * a.heightCm);
        });
        sh.closePath();
      } else {
        /* 外壁点列（盆形剖面取 y 递增段，避免自交） */
        var prof2 = [];
        for (var pk = 0; pk < a.profile.length; pk++) {
          prof2.push(a.profile[pk]);
          if (pk > 0 && a.profile[pk][1] < a.profile[pk - 1][1]) break;
        }
        sh.moveTo(0, 0);
        prof2.forEach(function (pt) { sh.lineTo(pt[0] * a.radiusCm, pt[1] * a.heightCm); });
        sh.lineTo(0, a.heightCm); sh.closePath();
      }
      var sg = new THREE.ShapeGeometry(sh, 24);
      T3D.cutCap = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({
        color: a.tire.color, roughness: 0.92, metalness: 0.0, transparent: true, opacity: 0.92, side: THREE.DoubleSide
      }));
      T3D.cutCap.position.set(0, 0, 0.01);
      T3D.scene.add(T3D.cutCap);
    }
  } else {
    T3D.scene.clippingPlanes = [];
    if (T3D.cutCap) { T3D.scene.remove(T3D.cutCap); T3D.cutCap.geometry.dispose(); T3D.cutCap.material.dispose(); T3D.cutCap = null; }
  }
  if (T3D.renderer) { T3D.renderer.clippingPlanes = T3D.scene.clippingPlanes; }
}

function applyLight() {
  if (!T3D.lights || !T3D.cur) return;
  var h = T3D.camH || T3D.cur.heightCm;
  var ls = T3D.lights, L = T3D.light;
  if (L === "museum") {
    ls.amb.color.setHex(0xffffff); ls.amb.intensity = 0.55;
    ls.dir.color.setHex(0xffffff); ls.dir.intensity = 0.95; ls.dir.position.set(h * 0.6, h * 1.4, h * 1.2);
    ls.point.color.setHex(0xffe8c8); ls.point.intensity = 0.55; ls.point.position.set(-h * 1.2, h * 0.7, h * 1.0);
    ls.rim.color.setHex(0x8aa4e8); ls.rim.intensity = 0.55; ls.rim.position.set(0, h * 0.8, -h * 2.0);
  } else if (L === "kiln") {
    ls.amb.color.setHex(0xff8040); ls.amb.intensity = 0.16;
    ls.dir.color.setHex(0xffa060); ls.dir.intensity = 0.28; ls.dir.position.set(h * 1.5, h * 1.0, h * 1.4);
    ls.point.color.setHex(0xff5a20); ls.point.intensity = 2.6; ls.point.position.set(0, h * 0.2, h * 1.1);
    ls.rim.color.setHex(0xff7a40); ls.rim.intensity = 0.18; ls.rim.position.set(0, h * 0.8, -h * 2.0);
  } else {
    ls.amb.color.setHex(0xffffff); ls.amb.intensity = 0.8;
    ls.dir.color.setHex(0xfff5e0); ls.dir.intensity = 1.05; ls.dir.position.set(h * 0.5, h * 1.6, h * 1.1);
    ls.point.color.setHex(0xffffff); ls.point.intensity = 0.3; ls.point.position.set(-h * 1.5, h * 1.2, h * 0.8);
    ls.rim.color.setHex(0xffffff); ls.rim.intensity = 0.3; ls.rim.position.set(0, h * 0.8, -h * 2.0);
  }
}

function applyGlaze() {
  if (!T3D.parts || !T3D.cur) return;
  var a = T3D.cur, on = T3D.tex.glaze;
  T3D.parts.forEach(function (m) {
    if (m.material && m.material.clearcoat !== undefined) {
      m.material.clearcoat = on ? a.body.cc : 0;
      m.material.needsUpdate = true;
    }
  });
}

function applyLabels() {
  if (!T3D.labelSpheres) return;
  T3D.labelSpheres.forEach(function (s) { s.visible = T3D.showLabel; });
}

/* ---------- 工具 ---------- */
var _t3dAudio = null;
function speakTreasury() {
  var a = T3D.cur;
  if (!a) return;
  /* 优先播离线内联讲解音频（T3D_AUDIO，由 treasury-audio.js 提供）；失败降级本地语音合成 */
  var ad = (typeof T3D_AUDIO !== "undefined") ? T3D_AUDIO[a.id] : null;
  if (ad) {
    try {
      if (_t3dAudio) { _t3dAudio.pause(); _t3dAudio = null; }
      var au = new Audio(ad);
      au.volume = 0.9;
      au.play().catch(function () {
        try { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(a.audio); u.lang = "zh-CN"; var vs = window.speechSynthesis.getVoices(); var zv = vs.filter(function (v) { return /^zh/i.test(v.lang); })[0]; if (zv) u.voice = zv; window.speechSynthesis.speak(u); } } catch (e2) {}
      });
      _t3dAudio = au;
      showT3DCard("语音讲解", "正在播放《" + a.name + "》离线工艺讲解……");
      return;
    } catch (e) {}
  }
  if (!("speechSynthesis" in window)) { showT3DCard("语音不可用", "当前浏览器不支持本地语音合成"); return; }
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(a.audio);
  u.lang = "zh-CN";
  u.rate = 1.0; u.pitch = 1.0;
  var vs = window.speechSynthesis.getVoices();
  var zv = vs.filter(function (v) { return /^zh/i.test(v.lang); })[0];
  if (zv) u.voice = zv;
  window.speechSynthesis.speak(u);
}

function shotTreasury() {
  if (!T3D.renderer) return;
  try {
    var a = T3D.cur;
    var url = T3D.renderer.domElement.toDataURL("image/png");
    var link = document.createElement("a");
    link.download = (a ? a.name.replace(/[··]/g, "") : "非遗3D") + ".png";
    link.href = url;
    document.body.appendChild(link); link.click(); link.remove();
    showT3DCard("已导出", "当前视角已保存为 PNG，仅存在本地");
  } catch (e) {
    showT3DCard("导出失败", "当前环境不允许保存图片");
  }
}

/* ---------- 渲染循环 ---------- */
function startT3DLoop() {
  if (T3D.running || !T3D.renderer) return;
  T3D.running = true;
  var last = 0;
  function tick(t) {
    T3D.animId = requestAnimationFrame(tick);
    var v = $q("#view-treasury");
    if (!v || !v.classList.contains("active") || !T3D.renderer) return;
    selfHealT3D();
    if (T3D.rot && T3D.group && !T3D.dragging) T3D.group.rotation.y += 0.005;
    if (T3D.light === "kiln" && T3D.lights.point) {
      var ph = (t % 3000) / 3000;
      T3D.lights.point.intensity = 2.2 + Math.sin(ph * Math.PI * 2) * 0.45;
    }
    T3D.renderer.render(T3D.scene, T3D.camera);
  }
  requestAnimationFrame(tick);
}

/* ---------- 实物影像（真实文物照片 · 全网检索 + 离线内联） ---------- */
function openT3DReal() {
  if (!T3D.cur) return;
  var a = T3D.cur;
  var real = (typeof TREASURY_REAL !== "undefined") ? TREASURY_REAL[a.id] : null;
  if (!real || !real.src) { showT3DCard("实物影像", "该器物的实物影像尚未收录"); return; }
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
      "color:#f7ecd8;font:700 17px/34px 'Noto Serif SC',serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.4);letter-spacing:0}" +
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
      '<div class="tr-foot"><div class="tr-note"></div><span class="tr-hint">真实文物影像 · 与右侧 3D 复原逐件对照 · 影像仅作展示与科普</span></div>' +
      "</div>";
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest(".tr-x")) closeT3DReal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ov.classList.contains("on")) closeT3DReal();
    });
  }
  ov.style.display = "flex";
  ov.querySelector(".tr-name").textContent = real.name || a.name;
  ov.querySelector(".tr-img img").src = real.src;
  ov.querySelector(".tr-note").innerHTML = (real.note ? "<b>" + real.note.split("｜")[0] + "</b>｜" + real.note.split("｜").slice(1).join("｜") : "") +
    '<br>高 ' + a.heightCm + " cm · " + (a.radiusCm * 2).toFixed(1) + " cm 口径参照（3D 复原尺寸）";
  setTimeout(function () { ov.classList.add("on"); }, 20);
}

function closeT3DReal() {
  var ov = document.getElementById("t3d-real");
  if (!ov) return;
  ov.classList.remove("on");
  setTimeout(function () { if (!ov.classList.contains("on")) ov.style.display = "none"; }, 300);
}
