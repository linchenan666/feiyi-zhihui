/* ================= 3D 珍品馆 · PBR 材质工厂（程序化高精度贴图 + 展厅环境，纯离线） ================= */
/* 提供：T3DM.makeEnvCube() 展厅环境反射 / T3DM.makeBodyPBR(a) 三通道材质 / T3DM.densifyPts() 轮廓细分 */

var T3DM = {
  /* 每件文物缓存（diffuse 每次重建，normal/rough 一次性生成复用） */
  cache: {}
};

function _tc(w, h, fn) {
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  var x = c.getContext("2d");
  fn(x, w, h);
  return c;
}

/* 确定性伪随机（使同件文物纹理稳定，切回来不变样） */
function _rng(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* 柔和噪声斑：叠加多层径向模糊圆，模拟釉面颗粒与窑变晕染 */
function _mottle(x, S, rnd, n, alpha, bright, dark) {
  for (var i = 0; i < n; i++) {
    var px = rnd() * S, py = rnd() * S, pr = 6 + rnd() * 46;
    var g = x.createRadialGradient(px, py, 0, px, py, pr);
    var c0 = rnd() > 0.5 ? bright : dark;
    g.addColorStop(0, "rgba(" + c0 + "," + alpha + ")");
    g.addColorStop(1, "rgba(" + c0 + ",0)");
    x.fillStyle = g;
    x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  }
}

function _hexRGB(hex) {
  var h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
}

/* ---------- 展厅环境立方体（暖光氛围，供釉面反射 · 512 + 竖向灯柱，反射细节更真实） ---------- */
function makeEnvCube() {
  var S = 512;
  var wall = _tc(S, S, function (x) {
    var g = x.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#4a3e30"); g.addColorStop(0.28, "#2c2318"); g.addColorStop(0.62, "#1a140d"); g.addColorStop(1, "#120d08");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    /* 顶部灯带 */
    var lg = x.createLinearGradient(0, 0, 0, S);
    lg.addColorStop(0, "rgba(255,236,200,0.95)");
    lg.addColorStop(0.05, "rgba(255,236,200,0)");
    x.fillStyle = lg; x.fillRect(0, 0, S, S);
    /* 射灯锥形光斑（更亮、带暖晕） */
    for (var i = 0; i < 6; i++) {
      var g2 = x.createRadialGradient(70 + i * 78, 44, 2, 70 + i * 78, 44, 70);
      g2.addColorStop(0, "rgba(255,240,210,0.42)");
      g2.addColorStop(0.5, "rgba(255,226,170,0.10)");
      g2.addColorStop(1, "rgba(255,226,170,0)");
      x.fillStyle = g2; x.fillRect(0, 0, S, S);
    }
    /* 竖向灯柱（展柜内光源柱，釉面反射时形成立式高光条） */
    for (var c = 0; c < 3; c++) {
      var lx = 120 + c * 190;
      var lg2 = x.createLinearGradient(lx - 14, 0, lx + 14, 0);
      lg2.addColorStop(0, "rgba(255,238,205,0)");
      lg2.addColorStop(0.5, "rgba(255,244,218,0.28)");
      lg2.addColorStop(1, "rgba(255,238,205,0)");
      x.fillStyle = lg2; x.fillRect(lx - 14, 0, 28, S);
    }
  });
  var top = _tc(S, S, function (x) {
    x.fillStyle = "#100c08"; x.fillRect(0, 0, S, S);
    var g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.58);
    g.addColorStop(0, "rgba(255,228,172,0.62)");
    g.addColorStop(0.38, "rgba(255,214,150,0.18)");
    g.addColorStop(1, "rgba(255,214,150,0)");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    /* 顶灯线性阵列 */
    for (var i2 = 0; i2 < 7; i2++) {
      var g3 = x.createRadialGradient(60 + i2 * 68, S / 2, 2, 60 + i2 * 68, S / 2, 40);
      g3.addColorStop(0, "rgba(255,240,205,0.30)"); g3.addColorStop(1, "rgba(255,240,205,0)");
      x.fillStyle = g3; x.fillRect(0, 0, S, S);
    }
  });
  var bot = _tc(S, S, function (x) {
    x.fillStyle = "#0d0906"; x.fillRect(0, 0, S, S);
    var g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.5);
    g.addColorStop(0, "rgba(255,214,150,0.12)");
    g.addColorStop(1, "rgba(255,214,150,0)");
    x.fillStyle = g; x.fillRect(0, 0, S, S);
  });
  var cube = new THREE.CubeTexture([wall, wall, top, bot, wall, wall]);
  cube.needsUpdate = true;
  return cube;
}

/* ---------- 剖面轮廓细分（Catmull-Rom 样条 → 真实器型弧线） ---------- */
function catmull2D(pts, per) {
  per = per || 3;
  var out = [];
  var P = pts.slice();
  /* 端点复制，保证曲线过首尾 */
  P.unshift(P[0]); P.push(P[P.length - 1]);
  for (var i = 1; i < P.length - 2; i++) {
    var p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    for (var s = 0; s < per; s++) {
      var t = s / per;
      var t2 = t * t, t3 = t2 * t;
      var x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      var y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  out.push(P[P.length - 2]);
  return out;
}

function densifyPts(pts, target) {
  var out = [pts[0]];
  for (var i = 1; i < pts.length; i++) {
    var p0 = pts[i - 1], p1 = pts[i];
    var seg = Math.max(2, Math.round(target / (pts.length - 1)));
    for (var s = 1; s <= seg; s++) {
      var t = s / seg;
      out.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]);
    }
  }
  return out;
}

/* ---------- 三通道贴图 ---------- */
function makeBodyTextures(a) {
  var D = 1024, N = 512;
  var seed = 1313 + (a.seed || 0);

  /* ---- diffuse ---- */
  var diff = _tc(D, D, function (x, S) {
    var rnd = _rng(seed);

    /* 底色 */
    if (a.paint && a.paint.on) {
      x.fillStyle = a.paint.base; x.fillRect(0, 0, S, S);
    } else if (a.streaky && a.streaky.on) {
      var bg = x.createLinearGradient(0, 0, 0, S);
      bg.addColorStop(0, "#f4efe0"); bg.addColorStop(0.55, "#efe8d2"); bg.addColorStop(1, "#e6dabb");
      x.fillStyle = bg; x.fillRect(0, 0, S, S);
    } else if (a.grad) {
      var gg = x.createLinearGradient(0, 0, 0, S);
      var vg = typeof T3D !== "undefined" ? T3D.varg : 0.5;
      a.grad.forEach(function (st) {
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

    /* 釉面颗粒与窑变晕染 */
    _mottle(x, S, rnd, 90, 0.05, "255,250,235", "120,100,70");
    if (a.varg && a.varg.on) {
      /* 窑变斑：三层羽化渐变叠加，模拟釉层中的色乳交融 */
      var vc = a.varg.colors || ["154,62,96", "168,88,60", "96,64,120", "60,96,140"];
      for (var i = 0; i < 12; i++) {
        var px = rnd() * S, py = rnd() * S, pr = 30 + rnd() * 90;
        var g = x.createRadialGradient(px, py, 0, px, py, pr);
        g.addColorStop(0, "rgba(" + vc[i % vc.length] + ",0.40)");
        g.addColorStop(0.35, "rgba(" + vc[i % vc.length] + ",0.20)");
        g.addColorStop(0.7, "rgba(" + vc[i % vc.length] + ",0.08)");
        g.addColorStop(1, "rgba(" + vc[i % vc.length] + ",0)");
        x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      }
      /* 第二层：更小更浓的核心色斑，制造"釉中色乳"深度 */
      for (var i2 = 0; i2 < 26; i2++) {
        var cx = rnd() * S, cy = rnd() * S, cr = 6 + rnd() * 22;
        var cg = x.createRadialGradient(cx, cy, 0, cx, cy, cr);
        cg.addColorStop(0, "rgba(" + vc[i2 % vc.length] + ",0.30)");
        cg.addColorStop(1, "rgba(" + vc[i2 % vc.length] + ",0)");
        x.fillStyle = cg; x.fillRect(cx - cr, cy - cr, cr * 2, cr * 2);
      }
      /* 乳浊釉气泡：细小微亮点 */
      for (var b = 0; b < 220; b++) {
        var bx = rnd() * S, by = rnd() * S;
        x.fillStyle = rnd() > 0.5 ? "rgba(255,252,244,0.20)" : "rgba(30,20,40,0.16)";
        x.beginPath(); x.arc(bx, by, 0.7 + rnd() * 1.6, 0, 7); x.fill();
      }
      _mottle(x, S, rnd, 40, 0.045, "255,235,210", "90,70,60");

      /* 钧窑垂釉火焰纹：釉层自口沿向下流动，形成竖向多色釉流（真实窑变第二特征） */
      for (var fl = 0; fl < 7; fl++) {
        var fx = 40 + rnd() * (S - 80), fw = 14 + rnd() * 26;
        var fg = x.createLinearGradient(0, 0, 0, S);
        var c1 = vc[Math.floor(rnd() * vc.length)], c2 = vc[Math.floor(rnd() * vc.length)];
        fg.addColorStop(0, "rgba(" + c1 + ",0.34)");
        fg.addColorStop(0.30, "rgba(" + c2 + ",0.22)");
        fg.addColorStop(0.55, "rgba(" + c1 + ",0.16)");
        fg.addColorStop(0.80, "rgba(" + c2 + ",0.20)");
        fg.addColorStop(1, "rgba(" + c2 + ",0)");
        x.fillStyle = fg;
        x.beginPath();
        x.moveTo(fx, 0);
        x.lineTo(fx + fw * 0.55, 0);
        x.lineTo(fx + fw * 0.42, S * 0.78);
        x.lineTo(fx + fw * 0.2, S * 0.92);
        x.lineTo(fx + fw * 0.05, S * 0.74);
        x.closePath();
        x.fill();
        /* 釉流中缝高光（釉面凸起反光） */
        x.fillStyle = "rgba(255,246,230,0.10)";
        x.fillRect(fx + fw * 0.12, 0, 3, S * 0.72);
      }
      /* 釉层厚度高光：垂直高光带（展厅射灯反射） */
      var hg = x.createLinearGradient(0, 0, S, 0);
      hg.addColorStop(0, "rgba(0,0,0,0.16)");
      hg.addColorStop(0.20, "rgba(255,250,240,0.14)");
      hg.addColorStop(0.34, "rgba(255,252,246,0.30)");
      hg.addColorStop(0.48, "rgba(255,250,240,0.10)");
      hg.addColorStop(0.72, "rgba(0,0,0,0.10)");
      hg.addColorStop(1, "rgba(0,0,0,0.20)");
      x.fillStyle = hg; x.fillRect(0, 0, S, S);
    }

    /* 流釉竖纹：真实垂釉——宽釉带自上而下，末端收成滴尖 */
    if (a.streaky && a.streaky.on && (!T3D || T3D.tex.streak)) {
      var cols = a.streaky.stops || [];
      for (var k = 0; k < 16; k++) {
        var sx = rnd() * S, cw = 10 + rnd() * 20;
        var cc = cols[k % cols.length];
        /* 釉带：上宽下窄，末端滴尖 */
        var cg = x.createLinearGradient(0, 0, 0, S);
        cg.addColorStop(0, _hexA(cc, 0.95));
        cg.addColorStop(0.55, _hexA(cc, 0.75));
        cg.addColorStop(0.82, _hexA(cc, 0.55));
        cg.addColorStop(0.92, _hexA(cc, 0.65));
        cg.addColorStop(1, _hexA(cc, 0));
        x.fillStyle = cg;
        x.beginPath();
        x.moveTo(sx, 0);
        x.lineTo(sx + cw, 0);
        x.lineTo(sx + cw * 0.75, S * 0.82);
        x.lineTo(sx + cw * 0.5, S * 0.94);
        x.lineTo(sx + cw * 0.25, S * 0.82);
        x.closePath();
        x.fill();
        /* 釉带边缘羽化 */
        x.fillStyle = "rgba(0,0,0,0.05)";
        x.fillRect(sx, 0, cw * 0.2, S);
      }
      /* 釉滴下坠高点 */
      for (var d = 0; d < 18; d++) {
        var dx = rnd() * S, dy = 0.60 * S + rnd() * 0.35 * S;
        var dg = x.createRadialGradient(dx, dy, 0, dx, dy, 5 + rnd() * 9);
        dg.addColorStop(0, "rgba(" + _hexRGB(cols[d % cols.length]) + ",0.55)");
        dg.addColorStop(1, "rgba(" + _hexRGB(cols[d % cols.length]) + ",0)");
        x.fillStyle = dg; x.fillRect(dx - 14, dy - 14, 28, 28);
      }
      /* 滴尖高光 */
      for (var h2 = 0; h2 < 30; h2++) {
        var hx = rnd() * S, hy = 0.75 * S + rnd() * 0.2 * S;
        x.fillStyle = "rgba(255,252,240,0.14)";
        x.beginPath(); x.arc(hx, hy, 1.2, 0, 7); x.fill();
      }
      /* 釉面剥落露白胎：局部釉皮崩落的小斑（真实唐三彩胎釉结合处常见） */
      for (var pl = 0; pl < 14; pl++) {
        var px3 = rnd() * S, py3 = 0.15 * S + rnd() * 0.75 * S, pr3 = 3 + rnd() * 9;
        var pg = x.createRadialGradient(px3, py3, 0, px3, py3, pr3);
        pg.addColorStop(0, "rgba(244,238,224,0.9)");
        pg.addColorStop(0.6, "rgba(232,222,200,0.55)");
        pg.addColorStop(1, "rgba(232,222,200,0)");
        x.fillStyle = pg; x.fillRect(px3 - pr3, py3 - pr3, pr3 * 2, pr3 * 2);
      }
      /* 釉面高光带（展厅灯条反射） */
      var hg2 = x.createLinearGradient(0, 0, S, 0);
      hg2.addColorStop(0, "rgba(255,252,246,0.22)");
      hg2.addColorStop(0.16, "rgba(255,252,246,0.06)");
      hg2.addColorStop(0.30, "rgba(255,255,255,0.34)");
      hg2.addColorStop(0.46, "rgba(255,252,246,0.08)");
      hg2.addColorStop(1, "rgba(120,90,50,0.10)");
      x.fillStyle = hg2; x.fillRect(0, 0, S, S);
    }

    /* 开片纹 */
    if (a.crackle && a.crackle.on && (!T3D || T3D.tex.crackle)) {
      x.strokeStyle = a.crackle.color;
      x.lineWidth = 1.2;
      var n = Math.round(120 * a.crackle.density);
      for (var i2 = 0; i2 < n; i2++) {
        var sx = rnd() * S, sy = rnd() * S;
        x.beginPath(); x.moveTo(sx, sy);
        var seg = 2 + Math.floor(rnd() * 3);
        for (var j = 0; j < seg; j++) {
          x.lineTo(sx + (rnd() - 0.5) * 90, sy + (rnd() - 0.5) * 90);
        }
        x.stroke();
      }
      /* 裂纹两侧釉面微亮 */
    }

    /* 通用釉面高光带 + 釉下气泡（汝窑乳浊釉：蟹爪纹下的细密气泡层） */
    if (!a.paint && !a.varg && !a.streaky) {
      for (var bb = 0; bb < 240; bb++) {
        var bbx = rnd() * S, bby = rnd() * S;
        x.fillStyle = rnd() > 0.5 ? "rgba(255,252,246,0.14)" : "rgba(120,140,150,0.10)";
        x.beginPath(); x.arc(bbx, bby, 0.6 + rnd() * 1.3, 0, 7); x.fill();
      }
      var hg3 = x.createLinearGradient(0, 0, S, 0);
      hg3.addColorStop(0, "rgba(255,252,246,0.24)");
      hg3.addColorStop(0.18, "rgba(255,252,246,0.08)");
      hg3.addColorStop(0.32, "rgba(255,255,252,0.38)");
      hg3.addColorStop(0.48, "rgba(255,252,246,0.10)");
      hg3.addColorStop(1, "rgba(90,110,120,0.10)");
      x.fillStyle = hg3; x.fillRect(0, 0, S, S);
    }

    /* 彩绘纹样 */
    if (a.paint && a.paint.on && (!T3D || T3D.tex.streak)) {
      var side = a.side;
      /* 异形陶塑：按侧影轮廓裁剪，彩绘只落在塑体表面 */
      if (side) {
        var sp = new Path2D();
        sp.moveTo(side[0][0] * S, side[0][1] * S);
        for (var si = 1; si < side.length; si++) sp.lineTo(side[si][0] * S, side[si][1] * S);
        sp.closePath();
        x.save();
        x.clip(sp);
      }
      if (a.paint.kind === "ninigou") {
        x.strokeStyle = "rgba(244,240,228,0.92)"; x.lineWidth = 3.5;
        for (var row = 0; row < 6; row++) {
          var ry = 70 + row * 76;
          x.beginPath();
          for (var q = 0; q <= S; q += 10) x.lineTo(q, ry + Math.sin((q + row * 60) / 38) * 7);
          x.stroke();
        }
        for (var dot = 0; dot < 60; dot++) {
          var px2 = rnd() * S, py2 = rnd() * S;
          x.fillStyle = a.paint.dots[Math.floor(rnd() * a.paint.dots.length)];
          x.beginPath(); x.arc(px2, py2, 5 + rnd() * 5, 0, 7); x.fill();
          x.fillStyle = "rgba(244,240,228,0.85)";
          x.beginPath(); x.arc(px2, py2, 1.8, 0, 7); x.fill();
        }
        /* 日纹与符勾 */
        for (var r3 = 0; r3 < 3; r3++) {
          var cx = 120 + r3 * 330, cy = 150 + r3 * 250, cr = 22 + rnd() * 14;
          x.strokeStyle = "rgba(244,240,228,0.9)"; x.lineWidth = 3;
          x.beginPath(); x.arc(cx, cy, cr, 0, 7); x.stroke();
          x.beginPath(); x.arc(cx, cy, cr * 0.5, 0, 7); x.stroke();
          x.fillStyle = a.paint.dots[Math.floor(rnd() * a.paint.dots.length)];
          x.beginPath(); x.arc(cx, cy, 5, 0, 7); x.fill();
        }
      } else {
        /* nigugu：点线花鸟纹 */
        x.strokeStyle = "rgba(244,240,228,0.88)"; x.lineWidth = 4.5;
        for (var r2 = 0; r2 < 5; r2++) {
          var yy = 84 + r2 * 96;
          x.beginPath(); x.moveTo(0, yy + (r2 % 2) * 12); x.lineTo(S, yy);
          for (var d2 = 0; d2 < 9; d2++) { x.moveTo(d2 * 66 + 18, yy - 16); x.lineTo(d2 * 66 + 40, yy - 16); }
          x.stroke();
        }
        for (var d3 = 0; d3 < 52; d3++) {
          x.fillStyle = a.paint.dots[Math.floor(rnd() * a.paint.dots.length)];
          x.beginPath(); x.arc(rnd() * S, rnd() * S, 4 + rnd() * 4, 0, 7); x.fill();
        }
        /* 花头（对齐实拍：蓝白花/紫白花 + 白蕊） */
        for (var fl = 0; fl < 5; fl++) {
          var fx = 90 + fl * 180, fy = 120 + (fl % 2) * 400;
          x.fillStyle = (fl % 2) ? a.paint.dots[1] : a.paint.dots[2];
          x.beginPath(); x.arc(fx, fy, 9, 0, 7); x.fill();
          x.fillStyle = "rgba(244,240,228,0.92)";
          x.beginPath(); x.arc(fx - 12, fy, 4, 0, 7); x.fill();
          x.beginPath(); x.arc(fx + 12, fy, 4, 0, 7); x.fill();
          x.beginPath(); x.arc(fx, fy - 12, 4, 0, 7); x.fill();
        }
        /* 绿枝叶（浚县泥咕咕实拍：花头间缀绿枝叶） */
        x.strokeStyle = "rgba(116,158,70,0.9)"; x.lineWidth = 3.4;
        for (var lv = 0; lv < 6; lv++) {
          var lx = 60 + lv * 190, ly = 340 + (lv % 2) * 260;
          x.beginPath();
          x.ellipse(lx, ly, 32, 11, lv * 0.9, 0, 7);
          x.stroke();
          x.beginPath();
          x.ellipse(lx + 40, ly + 28, 26, 9, lv * 0.7 - 0.5, 0, 7);
          x.stroke();
        }
        /* 蓝白尾羽（尾端羽片） */
        x.fillStyle = "rgba(90,122,200,0.8)";
        for (var tp = 0; tp < 5; tp++) {
          x.beginPath();
          x.ellipse(50 + tp * 55, 690 + tp * 24, 28, 10, 0.5, 0, 7);
          x.fill();
          x.fillStyle = "rgba(244,240,228,0.75)";
          x.beginPath(); x.arc(50 + tp * 55, 690 + tp * 24, 4, 0, 7); x.fill();
          x.fillStyle = "rgba(90,122,200,0.8)";
        }
        /* 眼点（实拍：白圈黑瞳，位于头侧高处） */
        x.fillStyle = "rgba(246,243,237,0.96)";
        x.beginPath(); x.arc(880, 700, 15, 0, 7); x.fill();
        x.fillStyle = "rgba(22,14,9,0.96)";
        x.beginPath(); x.arc(880, 700, 6, 0, 7); x.fill();
        x.fillStyle = "rgba(246,243,237,0.9)";
        x.beginPath(); x.arc(876, 696, 2.2, 0, 7); x.fill();
      }
      if (side) x.restore();
    }
  });

  /* ---- normal（切线空间，高度场近似） ---- */
  var norm = _tc(N, N, function (x, S) {
    var rnd = _rng(seed + 77);
    x.fillStyle = "rgb(128,128,255)"; x.fillRect(0, 0, S, S);
    /* 釉面颗粒：微小凹凸 */
    for (var i = 0; i < 400; i++) {
      var px = rnd() * S, py = rnd() * S, pr = 1.5 + rnd() * 4;
      var g = x.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, rnd() > 0.5 ? "rgba(150,150,255,0.5)" : "rgba(110,110,255,0.5)");
      g.addColorStop(1, "rgba(128,128,255,0)");
      x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    /* 开片裂纹：深沟 */
    if (a.crackle && a.crackle.on) {
      var n = Math.round(70 * a.crackle.density);
      x.strokeStyle = "rgb(90,90,255)"; x.lineWidth = 1.6;
      for (var i2 = 0; i2 < n; i2++) {
        var sx = rnd() * S, sy = rnd() * S;
        x.beginPath(); x.moveTo(sx, sy);
        var seg = 2 + Math.floor(rnd() * 3);
        for (var j = 0; j < seg; j++) x.lineTo(sx + (rnd() - 0.5) * 80, sy + (rnd() - 0.5) * 80);
        x.stroke();
      }
      /* 裂纹沿线高光边 */
      x.strokeStyle = "rgba(160,160,255,0.4)"; x.lineWidth = 2.4;
      for (var i3 = 0; i3 < n; i3++) {
        var sx2 = rnd() * S, sy2 = rnd() * S;
        x.beginPath(); x.moveTo(sx2, sy2);
        var seg2 = 2 + Math.floor(rnd() * 3);
        for (var j2 = 0; j2 < seg2; j2++) x.lineTo(sx2 + (rnd() - 0.5) * 80, sy2 + (rnd() - 0.5) * 80);
        x.stroke();
      }
    }
    /* 流釉凸起：竖条 */
    if (a.streaky && a.streaky.on) {
      x.fillStyle = "rgba(150,150,255,0.35)";
      for (var k = 0; k < 20; k++) {
        var cw = 2 + rnd() * 6;
        x.fillRect(rnd() * S, 0, cw, S);
      }
    }
    /* 窑变斑处釉面皱：色斑区拉高 */
    if (a.varg && a.varg.on) {
      for (var v = 0; v < 10; v++) {
        var vx = rnd() * S, vy = rnd() * S, vr = 8 + rnd() * 26;
        var vg = x.createRadialGradient(vx, vy, 0, vx, vy, vr);
        vg.addColorStop(0, "rgba(150,150,255,0.4)"); vg.addColorStop(1, "rgba(128,128,255,0)");
        x.fillStyle = vg; x.fillRect(vx - vr, vy - vr, vr * 2, vr * 2);
      }
    }
  });

  /* ---- bump（高度场灰度：颗粒 + 裂纹 + 流釉凸起，叠加在 normal 上增强表面凹凸） ---- */
  var bump = _tc(N, N, function (x, S) {
    var rnd = _rng(seed + 313);
    x.fillStyle = "rgb(128,128,128)"; x.fillRect(0, 0, S, S);
    for (var i = 0; i < 420; i++) {
      var px = rnd() * S, py = rnd() * S, pr = 1.2 + rnd() * 4;
      var g = x.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, rnd() > 0.5 ? "rgba(178,178,178,0.5)" : "rgba(92,92,92,0.5)");
      g.addColorStop(1, "rgba(128,128,128,0)");
      x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    if (a.crackle && a.crackle.on) {
      var n = Math.round(70 * a.crackle.density);
      x.strokeStyle = "rgb(70,70,70)"; x.lineWidth = 1.8;
      for (var i2 = 0; i2 < n; i2++) {
        var sx = rnd() * S, sy = rnd() * S;
        x.beginPath(); x.moveTo(sx, sy);
        var seg = 2 + Math.floor(rnd() * 3);
        for (var j = 0; j < seg; j++) x.lineTo(sx + (rnd() - 0.5) * 80, sy + (rnd() - 0.5) * 80);
        x.stroke();
      }
      x.strokeStyle = "rgb(172,172,172)"; x.lineWidth = 2.6;
      for (var i3 = 0; i3 < n; i3++) {
        var sx2 = rnd() * S, sy2 = rnd() * S;
        x.beginPath(); x.moveTo(sx2, sy2);
        var seg2 = 2 + Math.floor(rnd() * 3);
        for (var j2 = 0; j2 < seg2; j2++) x.lineTo(sx2 + (rnd() - 0.5) * 80, sy2 + (rnd() - 0.5) * 80);
        x.stroke();
      }
    }
    if (a.streaky && a.streaky.on) {
      x.fillStyle = "rgba(170,170,170,0.4)";
      for (var k = 0; k < 20; k++) { var cw = 2 + rnd() * 6; x.fillRect(rnd() * S, 0, cw, S); }
    }
    if (a.varg && a.varg.on) {
      for (var v = 0; v < 10; v++) {
        var vx = rnd() * S, vy = rnd() * S, vr = 8 + rnd() * 26;
        var vg = x.createRadialGradient(vx, vy, 0, vx, vy, vr);
        vg.addColorStop(0, "rgba(160,160,160,0.45)"); vg.addColorStop(1, "rgba(128,128,128,0)");
        x.fillStyle = vg; x.fillRect(vx - vr, vy - vr, vr * 2, vr * 2);
      }
    }
    /* 口沿/足沿磨痕：真实器物最常摩擦的亮带 */
    x.fillStyle = "rgba(190,190,190,0.35)";
    x.fillRect(0, 0, S, 8); x.fillRect(0, S - 10, S, 10);
  });

  /* ---- clearcoat normal（釉层流动波纹：清漆层上的细密流光，独立于釉下细节） ---- */
  var ccNorm = _tc(N, N, function (x, S) {
    var rnd = _rng(seed + 521);
    x.fillStyle = "rgb(128,128,255)"; x.fillRect(0, 0, S, S);
    /* 釉层流动波纹：缓波长涟漪 */
    for (var w = 0; w < 26; w++) {
      var wy = rnd() * S, amp = 6 + rnd() * 16, ph = rnd() * 6.28, wl = 20 + rnd() * 40;
      x.strokeStyle = rnd() > 0.5 ? "rgba(142,142,255,0.30)" : "rgba(116,116,255,0.30)";
      x.lineWidth = 1.6;
      x.beginPath();
      for (var q = 0; q <= S; q += 8) x.lineTo(q, wy + Math.sin(q / wl + ph) * amp);
      x.stroke();
    }
    /* 细小气泡凸点（清漆层内的微泡） */
    for (var i = 0; i < 180; i++) {
      var px = rnd() * S, py = rnd() * S, pr = 1 + rnd() * 2.6;
      var g = x.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, "rgba(150,150,255,0.4)"); g.addColorStop(1, "rgba(128,128,255,0)");
      x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
  });

  /* ---- roughness（黑=光滑，白=粗糙） ---- */
  var rough = _tc(N, N, function (x, S) {
    var rnd = _rng(seed + 179);
    var base = a.roughBase || 0.28; /* 釉面：低粗糙 → 黑 */
    x.fillStyle = "rgb(" + Math.round(base * 255) + "," + Math.round(base * 255) + "," + Math.round(base * 255) + ")";
    x.fillRect(0, 0, S, S);
    /* 颗粒散布 */
    for (var i = 0; i < 300; i++) {
      var px = rnd() * S, py = rnd() * S, pr = 2 + rnd() * 6;
      var g = x.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, rnd() > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)");
      g.addColorStop(1, "rgba(128,128,128,0)");
      x.fillStyle = g; x.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
    /* 流釉处光滑（黑），露胎处粗糙（白） */
    if (a.streaky && a.streaky.on) {
      x.fillStyle = "rgba(20,20,20,0.8)";
      for (var k = 0; k < 26; k++) {
        var cw = 4 + rnd() * 14;
        x.fillRect(rnd() * S, 0, cw, S);
      }
    }
    if (a.roughPatch) {
      x.fillStyle = "rgba(255,255,255,0.55)";
      for (var p = 0; p < 12; p++) {
        var px2 = rnd() * S, py2 = rnd() * S, pr2 = 10 + rnd() * 30;
        x.beginPath(); x.arc(px2, py2, pr2, 0, 7); x.fill();
      }
    }
    /* 彩绘处略平滑 */
    if (a.paint && a.paint.on) {
      x.fillStyle = "rgba(60,60,60,0.5)";
      for (var w = 0; w < 6; w++) x.fillRect(0, 60 + w * 96, S, 18);
    }
  });

  return {
    map: new THREE.CanvasTexture(diff),
    normalMap: new THREE.CanvasTexture(norm),
    bumpMap: new THREE.CanvasTexture(bump),
    clearcoatNormalMap: new THREE.CanvasTexture(ccNorm),
    roughnessMap: new THREE.CanvasTexture(rough)
  };
}

function _hexA(hex, al) {
  var h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + al + ")";
}

/* 主入口：获取/构建某件文物的 PBR 纹理集 */
function getBodyTex(a) {
  var key = a.id;
  if (T3DM.cache[key]) return T3DM.cache[key];
  var t = makeBodyTextures(a);
  T3DM.cache[key] = t;
  return t;
}

function disposeBodyTex(key) {
  var t = T3DM.cache[key];
  if (!t) return;
  t.map.dispose(); t.normalMap.dispose(); t.roughnessMap.dispose();
  if (t.bumpMap) t.bumpMap.dispose();
  if (t.clearcoatNormalMap) t.clearcoatNormalMap.dispose();
  delete T3DM.cache[key];
}
