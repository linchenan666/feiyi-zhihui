/* ============================================================
   FY3D · WebGL 3D 展柜（three.js 0.186.1 程序化，零外部模型）
   ① 汝瓷碗：LatheGeometry 旋转体 + OrbitControls + 釉色切换
   ② 榫卯拆解：BoxGeometry 程序化木块 + 滑块控制爆炸视图
   全程离线：three.js 本地化，无 CDN、无 glTF 资源。
   懒初始化：打开弹窗才创建 renderer；关闭即 dispose 全部资源。
   ============================================================ */

var FY3D = {
  renderer: null, scene: null, camera: null, controls: null,
  rafId: null, disposables: [], modal: null,
  anim: null,        // 场景自定义动画回调
  resizeHandler: null,
  isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
};

/* ---------------- 公共：打开 / 关闭 ---------------- */

function open3DShowcase(type) {
  if (!window.THREE || !window.THREE.WebGLRenderer) {
    alert("当前浏览器不支持 WebGL，无法加载 3D 展柜。");
    return;
  }
  if (FY3D.modal) close3DShowcase();
  inject3DStyle();
  var title = type === "mortise" ? "榫卯拆解 · 木作之智" : "汝瓷天青 · 3D 展柜";
  var body = type === "mortise" ? buildMortisePanel() : buildBowlPanel();

  var ov = document.createElement("div");
  ov.id = "fy3d-modal";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-label", title);
  ov.innerHTML =
    '<div class="f3d-case">' +
      '<div class="f3d-head">' +
        '<span class="f3d-seal">3D</span>' +
        '<span class="f3d-title">' + title + '</span>' +
        '<button class="f3d-x" type="button" aria-label="关闭">&#10005;</button>' +
      '</div>' +
      '<div class="f3d-body"><div class="f3d-canvas" id="f3d-canvas"></div>' + body + '</div>' +
    '</div>';
  document.body.appendChild(ov);
  FY3D.modal = ov;

  ov.addEventListener("click", function (e) {
    if (e.target === ov || e.target.closest(".f3d-x")) close3DShowcase();
  });
  document.addEventListener("keydown", f3dKey);
  requestAnimationFrame(function () { ov.classList.add("on"); });

  /* 等 DOM 渲染后初始化 WebGL（懒初始化） */
  setTimeout(function () {
    if (type === "mortise") initMortise();
    else initBowl();
  }, 60);
}

function f3dKey(e) {
  if (e.key === "Escape" && FY3D.modal) close3DShowcase();
}

function close3DShowcase() {
  var ov = FY3D.modal;
  if (!ov) return;
  document.removeEventListener("keydown", f3dKey);
  if (FY3D.rafId) cancelAnimationFrame(FY3D.rafId);
  if (FY3D.resizeHandler) window.removeEventListener("resize", FY3D.resizeHandler);
  if (FY3D.controls) { try { FY3D.controls.dispose(); } catch (e) {} }
  FY3D.disposables.forEach(function (d) {
    try {
      if (d && d.dispose) d.dispose();
    } catch (e) {}
  });
  FY3D.disposables = [];
  if (FY3D.renderer) {
    try {
      FY3D.renderer.dispose();
      if (FY3D.renderer.forceContextLoss) FY3D.renderer.forceContextLoss();
    } catch (e) {}
    var el = FY3D.renderer.domElement;
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
  FY3D.renderer = null; FY3D.scene = null; FY3D.camera = null;
  FY3D.controls = null; FY3D.anim = null; FY3D.rafId = null;
  ov.classList.remove("on");
  setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 280);
  FY3D.modal = null;
}

/* ---------------- 公共：渲染器 / 灯光 / 展台 ---------------- */

function f3dCommon(container) {
  var THREE = window.THREE;
  var w = container.clientWidth, h = container.clientHeight;
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.Fog(0x1a1410, 6, 14);

  var camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(2.6, 1.8, 3.4);

  /* 灯光：主光 + 补光 + 环境光 */
  var key = new THREE.DirectionalLight(0xffe8c4, 2.2);
  key.position.set(3, 5, 2.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 14;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0004;
  scene.add(key);

  var fill = new THREE.DirectionalLight(0x9db4c8, 0.7);
  fill.position.set(-3, 2, -2);
  scene.add(fill);

  var rim = new THREE.DirectionalLight(0xe8c96a, 0.6);
  rim.position.set(0, 2, -4);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0x403528, 1.1));

  /* 展台：圆盘 + 阴影承接地面 */
  var plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.0, 0.18, 64),
    new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.85, metalness: 0.1 })
  );
  plinth.position.y = -0.09;
  plinth.receiveShadow = true;
  scene.add(plinth);
  FY3D.disposables.push(plinth.geometry, plinth.material);

  var ground = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.185;
  ground.receiveShadow = true;
  scene.add(ground);
  FY3D.disposables.push(ground.geometry, ground.material);

  FY3D.renderer = renderer;
  FY3D.scene = scene;
  FY3D.camera = camera;

  FY3D.resizeHandler = function () {
    var w2 = container.clientWidth, h2 = container.clientHeight;
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    renderer.setSize(w2, h2);
  };
  window.addEventListener("resize", FY3D.resizeHandler);

  f3dLoop();
  return { renderer: renderer, scene: scene, camera: camera };
}

function f3dLoop() {
  FY3D.rafId = requestAnimationFrame(f3dLoop);
  if (FY3D.controls) FY3D.controls.update();
  if (FY3D.anim) FY3D.anim();
  if (FY3D.renderer && FY3D.scene && FY3D.camera) FY3D.renderer.render(FY3D.scene, FY3D.camera);
}

/* ---------------- ① 汝瓷碗 ---------------- */

function buildBowlPanel() {
  return '<aside class="f3d-panel">' +
    '<div class="fp-title">釉色切换</div>' +
    '<div class="fp-colors" id="f3d-colors">' +
      '<button class="fp-chip on" data-c="tianqing" style="--chip:#A8C5C8">天青</button>' +
      '<button class="fp-chip" data-c="fenqing" style="--chip:#B8C9B0">粉青</button>' +
      '<button class="fp-chip" data-c="yuebai" style="--chip:#D8DCD0">月白</button>' +
    '</div>' +
    '<label class="fp-row"><input type="checkbox" id="f3d-auto" checked> 自动环绕</label>' +
    '<label class="fp-row"><input type="checkbox" id="f3d-crack"> 开片纹理</label>' +
    '<div class="fp-hint">拖拽旋转 · 滚轮缩放 · 右键平移 · 双击复位</div>' +
    '<div class="fp-note">汝瓷为宋代五大名窑之首，釉色如雨过天青；釉面开片本为烧造缺陷，却成独特审美。本器以 LatheGeometry 沿碗壁截面曲线旋转生成。</div>' +
  '</aside>';
}

var BOWL_GLAZES = {
  tianqing: { color: 0xA8C5C8, name: "天青" },
  fenqing: { color: 0xB8C9B0, name: "粉青" },
  yuebai:   { color: 0xD8DCD0, name: "月白" }
};

function initBowl() {
  var THREE = window.THREE;
  var container = document.getElementById("f3d-canvas");
  var ctx = f3dCommon(container);
  var scene = ctx.scene, camera = ctx.camera;

  /* 碗壁截面：从圈足外侧 → 碗口 → 碗腹内侧 → 圈足内侧（闭合） */
  var pts = [
    [0.30, 0.00], [0.38, 0.02], [0.42, 0.08], [0.46, 0.16],
    [0.58, 0.34], [0.74, 0.60], [0.88, 0.84], [0.98, 1.00],
    [1.00, 1.05], [0.96, 1.07],
    [0.88, 0.98], [0.74, 0.74], [0.56, 0.44], [0.40, 0.20],
    [0.30, 0.14], [0.26, 0.10], [0.28, 0.04], [0.30, 0.00]
  ].map(function (p) { return new THREE.Vector2(p[0], p[1]); });

  var geo = new THREE.LatheGeometry(pts, 96);
  geo.computeVertexNormals();

  var crackTex = makeCrackTexture();
  var mat = new THREE.MeshPhysicalMaterial({
    color: BOWL_GLAZES.tianqing.color,
    roughness: 0.28,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
    ior: 1.5,
    bumpMap: crackTex,
    bumpScale: 0.004,
    side: THREE.DoubleSide
  });

  var bowl = new THREE.Mesh(geo, mat);
  bowl.position.y = 0.02;
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  scene.add(bowl);
  FY3D.disposables.push(geo, mat, crackTex);

  /* 碗内空腔的暗影（增强器壁厚度感） */
  var inner = new THREE.Mesh(
    new THREE.CircleGeometry(0.30, 64),
    new THREE.MeshStandardMaterial({ color: 0x1e2826, roughness: 0.6 })
  );
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.145;
  bowl.add(inner);
  FY3D.disposables.push(inner.geometry, inner.material);

  /* OrbitControls */
  var controls = new THREE.OrbitControls(camera, FY3D.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.55, 0);
  controls.minDistance = 1.4;
  controls.maxDistance = 7;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.9;
  FY3D.controls = controls;

  /* 初始视角 */
  var home = { pos: camera.position.clone(), tgt: controls.target.clone() };

  /* UI：釉色 / 自动环绕 / 开片 / 双击复位 */
  var chips = document.querySelectorAll("#f3d-colors .fp-chip");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      var g = BOWL_GLAZES[c.getAttribute("data-c")];
      mat.color.setHex(g.color);
    });
  });
  var autoBox = document.getElementById("f3d-auto");
  autoBox.addEventListener("change", function () { controls.autoRotate = autoBox.checked; });
  var crackBox = document.getElementById("f3d-crack");
  crackBox.addEventListener("change", function () {
    mat.bumpMap = crackBox.checked ? crackTex : null;
    mat.needsUpdate = true;
  });
  FY3D.renderer.domElement.addEventListener("dblclick", function () {
    camera.position.copy(home.pos);
    controls.target.copy(home.tgt);
    controls.update();
  });
}

/* 程序化开片裂纹纹理（Canvas → CanvasTexture） */
function makeCrackTexture() {
  var THREE = window.THREE;
  var S = 512;
  var cv = document.createElement("canvas");
  cv.width = cv.height = S;
  var g = cv.getContext("2d");
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(40,40,40,0.85)";
  g.lineWidth = 1;
  /* 生成随机裂纹：每条从边缘随机走向，分叉 */
  for (var i = 0; i < 26; i++) {
    var x = Math.random() * S, y = Math.random() * S;
    var ang = Math.random() * Math.PI * 2;
    g.beginPath();
    g.moveTo(x, y);
    for (var s = 0; s < 7; s++) {
      ang += (Math.random() - 0.5) * 0.9;
      var len = 24 + Math.random() * 40;
      x += Math.cos(ang) * len;
      y += Math.sin(ang) * len;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

/* ---------------- ② 榫卯拆解 ---------------- */

function buildMortisePanel() {
  return '<aside class="f3d-panel">' +
    '<div class="fp-title">装配演示</div>' +
    '<div class="fp-btns">' +
      '<button class="fp-btn" id="f3d-sep" type="button">拆&nbsp;开</button>' +
      '<button class="fp-btn" id="f3d-reset" type="button">复&nbsp;位</button>' +
    '</div>' +
    '<div class="fp-slider"><input type="range" id="f3d-range" min="0" max="100" value="0"></div>' +
    '<label class="fp-row"><input type="checkbox" id="f3d-label" checked> 结构标注</label>' +
    '<label class="fp-row"><input type="checkbox" id="f3d-auto2" checked> 自动环绕</label>' +
    '<div class="fp-hint">拖拽旋转 · 滑块控制开合 · 滑块松手可自由停留</div>' +
    '<div class="fp-note">榫卯不用一钉一铆，以木件凹凸咬合，是中国传统木作（国家级非遗）的核心结构。凸出为<b>榫</b>，凹入为<b>卯</b>；拖动滑块可见榫头沿轴向滑出卯眼的全过程。</div>' +
  '</aside>';
}

function initMortise() {
  var THREE = window.THREE;
  var container = document.getElementById("f3d-canvas");
  var ctx = f3dCommon(container);
  var scene = ctx.scene, camera = ctx.camera;
  camera.position.set(3.0, 1.6, 3.6);

  var woodMat = new THREE.MeshStandardMaterial({
    color: 0x9c6b3f, roughness: 0.62, metalness: 0.05
  });
  var woodMat2 = new THREE.MeshStandardMaterial({
    color: 0x8a5a32, roughness: 0.65, metalness: 0.05
  });

  /* 榫头组件（左侧）：主体 + 凸出的榫头 */
  var tenonGroup = new THREE.Group();
  var tenonBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), woodMat);
  tenonBody.castShadow = tenonBody.receiveShadow = true;
  var tenon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), woodMat);
  tenon.position.set(0.75, 0, 0);
  tenon.castShadow = true;
  tenonGroup.add(tenonBody, tenon);
  FY3D.disposables.push(tenonBody.geometry, tenon.geometry, woodMat);

  /* 卯眼组件（右侧）：上板 + 下板 + 封闭端板，留贯通卯口 */
  var mortiseGroup = new THREE.Group();
  var top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 0.8), woodMat2);
  top.position.set(0.75, 0.275, 0);
  var bot = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 0.8), woodMat2);
  bot.position.set(0.75, -0.275, 0);
  var end = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.8), woodMat2);
  end.position.set(1.4, 0, 0);
  [top, bot, end].forEach(function (m) { m.castShadow = m.receiveShadow = true; mortiseGroup.add(m); });
  FY3D.disposables.push(top.geometry, bot.geometry, end.geometry, woodMat2);

  /* 组合初始位置（贴合） */
  var joined = new THREE.Group();
  joined.add(tenonGroup);
  joined.add(mortiseGroup);
  tenonGroup.position.x = -0.5;
  mortiseGroup.position.x = 0.5;
  joined.position.y = 0.55;
  scene.add(joined);

  /* 标注 Sprite：榫头 / 卯眼 */
  var labelTenon = makeLabel("榫头", 0xe8c96a);
  labelTenon.position.set(0.4, 0.75, 0);
  tenonGroup.add(labelTenon);
  var labelMortise = makeLabel("卯眼", 0xe8c96a);
  labelMortise.position.set(0.75, 0.75, 0);
  mortiseGroup.add(labelMortise);

  /* OrbitControls */
  var controls = new THREE.OrbitControls(camera, FY3D.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.5, 0);
  controls.minDistance = 1.6;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  FY3D.controls = controls;

  /* 开合动画：target 目标值，cur 缓动 */
  var sep = { cur: 0, target: 0 };
  var MAX_D = 1.6;
  FY3D.anim = function () {
    sep.cur += (sep.target - sep.cur) * 0.12;
    var d = sep.cur * MAX_D;
    tenonGroup.position.x = -0.5 - d;
    mortiseGroup.position.x = 0.5 + d * 0.35;
  };

  var range = document.getElementById("f3d-range");
  range.addEventListener("input", function () {
    sep.target = range.value / 100;
    document.getElementById("f3d-sep").textContent = sep.target > 0.95 ? "已拆开" : "拆\u00a0开";
  });
  document.getElementById("f3d-sep").addEventListener("click", function () {
    sep.target = 1; range.value = 100;
    this.innerHTML = "已拆开";
  });
  document.getElementById("f3d-reset").addEventListener("click", function () {
    sep.target = 0; range.value = 0;
    document.getElementById("f3d-sep").innerHTML = "拆\u00a0开";
  });
  var labelBox = document.getElementById("f3d-label");
  labelBox.addEventListener("change", function () {
    var v = labelBox.checked;
    labelTenon.visible = v; labelMortise.visible = v;
  });
  var auto2 = document.getElementById("f3d-auto2");
  auto2.addEventListener("change", function () { controls.autoRotate = auto2.checked; });
}

/* Canvas 文字 → Sprite 标注 */
function makeLabel(text, color) {
  var THREE = window.THREE;
  var cv = document.createElement("canvas");
  cv.width = 256; cv.height = 96;
  var g = cv.getContext("2d");
  g.fillStyle = "rgba(20,14,8,0.78)";
  roundRect(g, 8, 18, 240, 60, 12);
  g.fill();
  g.strokeStyle = "#" + color.toString(16).padStart(6, "0");
  g.lineWidth = 2;
  roundRect(g, 8, 18, 240, 60, 12);
  g.stroke();
  g.fillStyle = "#f2e6c8";
  g.font = "600 38px 'Noto Serif SC', serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 128, 50);
  var tex = new THREE.CanvasTexture(cv);
  var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  var sp = new THREE.Sprite(mat);
  sp.scale.set(0.85, 0.32, 1);
  sp.renderOrder = 10;
  FY3D.disposables.push(tex, mat);
  return sp;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* ---------------- 样式（一次性注入） ---------------- */
function inject3DStyle() {
  if (document.getElementById("f3d-style")) return;
  var st = document.createElement("style");
  st.id = "f3d-style";
  st.textContent =
    "#fy3d-modal{position:fixed;inset:0;z-index:3200;display:flex;align-items:center;justify-content:center;" +
    "background:rgba(10,8,6,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .25s}" +
    "#fy3d-modal.on{opacity:1}" +
    ".f3d-case{width:min(1080px,94vw);height:min(720px,92vh);background:linear-gradient(160deg,#221a12,#2b2118 55%,#1b1410);" +
    "border:1px solid rgba(208,178,112,.5);border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.6);" +
    "display:flex;flex-direction:column;overflow:hidden;transform:translateY(12px) scale(.99);transition:transform .25s}" +
    "#fy3d-modal.on .f3d-case{transform:none}" +
    ".f3d-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(208,178,112,.2)}" +
    ".f3d-seal{flex:none;width:34px;height:34px;border-radius:6px;background:linear-gradient(145deg,#c2341d,#8f1d10);" +
    "color:#f7ecd8;font:700 15px/34px 'Noto Serif SC',serif;text-align:center;letter-spacing:.05em}" +
    ".f3d-title{font:700 clamp(16px,2.2vw,22px)/1.2 'Noto Serif SC',serif;color:#f2e6c8;letter-spacing:.08em}" +
    ".f3d-x{margin-left:auto;width:32px;height:32px;border-radius:50%;border:1px solid rgba(208,178,112,.4);" +
    "background:rgba(255,255,255,.05);color:#e8dcc0;font-size:17px;line-height:30px;cursor:pointer;transition:.2s}" +
    ".f3d-x:hover{background:rgba(194,52,29,.75);border-color:transparent;color:#fff}" +
    ".f3d-body{flex:1;min-height:0;display:flex;gap:0}" +
    ".f3d-canvas{flex:1;min-width:0;position:relative}" +
    ".f3d-canvas canvas{display:block;width:100%;height:100%}" +
    ".f3d-panel{flex:none;width:230px;padding:18px 16px;overflow-y:auto;" +
    "border-left:1px solid rgba(208,178,112,.18);background:rgba(0,0,0,.18)}" +
    ".fp-title{font:700 13px/1 'Noto Serif SC',serif;color:#e8c96a;letter-spacing:.2em;margin-bottom:12px}" +
    ".fp-colors{display:flex;gap:8px;margin-bottom:16px}" +
    ".fp-chip{flex:1;padding:8px 0;border-radius:8px;border:1px solid rgba(208,178,112,.35);" +
    "background:rgba(255,255,255,.04);color:#cfc3a4;font:500 12.5px 'Noto Sans SC',sans-serif;cursor:pointer;transition:.2s}" +
    ".fp-chip::before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--chip);margin-right:5px;vertical-align:middle}" +
    ".fp-chip.on{background:rgba(232,201,106,.16);border-color:#e8c96a;color:#f2e6c8}" +
    ".fp-row{display:flex;align-items:center;gap:8px;font:400 12.5px/1.8 'Noto Sans SC',sans-serif;color:#cfc3a4;cursor:pointer}" +
    ".fp-row input{accent-color:#e8c96a}" +
    ".fp-btns{display:flex;gap:8px;margin-bottom:12px}" +
    ".fp-btn{flex:1;padding:9px 0;border-radius:8px;border:1px solid rgba(208,178,112,.4);" +
    "background:linear-gradient(145deg,rgba(194,52,29,.85),rgba(143,29,16,.9));color:#f7ecd8;" +
    "font:600 13px 'Noto Serif SC',serif;letter-spacing:.15em;cursor:pointer;transition:.2s}" +
    ".fp-btn:hover{filter:brightness(1.15)}" +
    ".fp-slider{margin:4px 0 14px}" +
    ".fp-slider input{width:100%;accent-color:#e8c96a}" +
    ".fp-hint{margin-top:14px;font-size:11px;color:#94876a;line-height:1.7;letter-spacing:.03em}" +
    ".fp-note{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(208,178,112,.2);" +
    "font:400 11.5px/1.75 'Noto Sans SC',sans-serif;color:#a89878}" +
    ".fp-note b{color:#e8c96a;font-weight:600}" +
    "@media(max-width:760px){.f3d-case{height:94vh}.f3d-body{flex-direction:column}.f3d-panel{width:auto;flex:none;max-height:42%;border-left:0;border-top:1px solid rgba(208,178,112,.18)}}";
  document.head.appendChild(st);
}
