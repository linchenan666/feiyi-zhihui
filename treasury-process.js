/* ================= 3D 珍品馆 · L2 工艺流程演示 + L3 工艺知识层 =================
   每件文物 = 6 道工序（逐步拆解·可暂停·可回到任意步骤）+ 工艺知识卡（术语/材料/口诀/禁忌/历史）
   纯离线：工序动画驱动本地 T3D 引擎，口述短句用本地语音合成，无任何外部依赖 */

/* ---------- L2 工序数据 ---------- */
var TREASURY_PROCESS = {
  junci: {
    name: "钧瓷 · 窑变釉尊",
    steps: [
      { id: "p1", title: "选料炼泥", expl: 0.00, d: 3.6, h: 1.02, focus: "", voice: "选禹州本地瓷土，淘洗沉淀去粗取精，再经陈腐炼泥，泥性才柔韧可塑。",
        card: ["原料 · 泥性", "钧瓷以禹州神垕镇瓷土为骨，淘洗去杂、陈腐发酵，炼泥如揉面，泥不熟则器不正。"] },
      { id: "p2", title: "拉坯成型", expl: 0.10, d: 2.8, h: 1.10, focus: "belly", voice: "轮盘飞转，双手拢泥，一鼓作气拉出尊形——口沿、束颈、鼓腹一气呵成。",
        card: ["工序 · 拉坯", "湿手水润，转速先急后缓。鼓腹处最见功力：厚一分则滞，薄一分则塌。"] },
      { id: "p3", title: "修坯晾坯", expl: 0.22, d: 2.6, h: 1.05, focus: "belly", voice: "利坯刀修薄胎壁，阴干避风，急干则裂。",
        card: ["工序 · 修坯", "坯体半干时以利坯刀旋削，胎壁厚薄均匀，阴干数日，防日光直射与过堂风。"] },
      { id: "p4", title: "素烧施釉", expl: 0.34, d: 2.4, h: 1.00, focus: "neck", voice: "素烧定形后浸釉，釉层口薄腹厚，正是口沿微露胎色的由来。",
        card: ["工序 · 施釉", "釉浆浓度与浸釉时间决定釉层厚度。钧釉厚处如脂，口沿釉薄，高温下自然退让，形成釉缘。"] },
      { id: "p5", title: "入窑烧成", expl: 0.48, d: 4.2, h: 0.95, focus: "belly", voice: "一千三百度还原焰，釉中铜铁元素发色——入窑一色，出窑万彩。",
        card: ["窑变 · 关键工序", "还原焰下，铜元素烧出玫瑰紫，铁元素烧出天青蓝。窑内气氛毫厘之差，釉色便天地之别。"] },
      { id: "p6", title: "出窑选瓷", expl: 0.62, d: 3.0, h: 1.12, focus: "lip", voice: "冷却数日开窑分拣，次品当场砸碎深埋——传世的每一件，都是千里挑一。",
        card: ["工序 · 选瓷", "钧瓷十窑九不成。开窑时先看口沿釉缘、再看窑变晕散，稍有瑕疵即毁，故传世皆精。"] }
    ]
  },
  ruci: {
    name: "汝瓷 · 天青釉洗",
    steps: [
      { id: "p1", title: "选料配釉", expl: 0.00, d: 3.4, h: 1.05, focus: "", voice: "宝丰清凉寺，玛瑙入釉，方得天青一色。",
        card: ["原料 · 玛瑙入釉", "汝窑以玛瑙末入釉，釉面呈梨皮蟹爪的温润质感，天青色因此有玉石般的含蓄。"] },
      { id: "p2", title: "制坯成型", expl: 0.08, d: 2.6, h: 1.08, focus: "belly", voice: "手工拉坯，胎薄如纸，香灰胎色，胎釉一体。",
        card: ["胎骨 · 香灰胎", "胎土含铁，烧后呈香灰色，与天青釉相衬，这是汝窑断代的硬指标之一。"] },
      { id: "p3", title: "裹足支烧", expl: 0.20, d: 2.4, h: 1.02, focus: "foot", voice: "满釉裹足，芝麻钉支烧——底部只见细钉痕，不见圈足露胎。",
        card: ["工序 · 支烧", "汝窑以细小支钉托烧，器足满釉。钉痕如芝麻点，故称芝麻钉，为汝窑独有印记。"] },
      { id: "p4", title: "入窑烧成", expl: 0.36, d: 4.0, h: 0.98, focus: "belly", voice: "一千三百五十度还原焰，天青一色就此凝定。",
        card: ["窑火 · 烧成", "汝窑烧成温域极窄，火候差一度便成败色。还原焰中釉色由灰转青，似雨过天青。"] },
      { id: "p5", title: "出窑开片", expl: 0.50, d: 2.8, h: 1.10, focus: "belly", voice: "冷却之中釉面自然开片——冰裂纹、蟹爪纹，光下如鳞动。",
        card: ["开片 · 审美密码", "胎釉膨胀系数不同，出窑冷却时釉面迸裂成纹。本属瑕疵，却被宋人奉为最高审美。"] },
      { id: "p6", title: "选器入藏", expl: 0.64, d: 3.2, h: 1.06, focus: "lip", voice: "十窑九不成，传世不足百件——每一件，都是宋徽宗审美的幸存者。",
        card: ["传世 · 名窑之首", "汝窑存世公认不足百件，故有汝窑为魁之说。天青、香灰胎、芝麻钉、开片，四重密码缺一不可。"] }
    ]
  },
  sancai: {
    name: "唐三彩 · 三足罐",
    steps: [
      { id: "p1", title: "制胎成型", expl: 0.00, d: 3.4, h: 1.05, focus: "", voice: "白陶土轮制捏塑，罐身、三足分别成型再黏接。",
        card: ["胎骨 · 白陶胎", "巩义窑白陶土淘洗精炼，烧后胎色白净，为三彩釉色的明亮底衬。"] },
      { id: "p2", title: "素烧定形", expl: 0.10, d: 2.8, h: 1.02, focus: "belly", voice: "千度素烧，胎体烧结定型，为挂釉打好底子。",
        card: ["工序 · 素烧", "素烧约一千度，胎体变硬且保持吸水性，釉料才能均匀附着。"] },
      { id: "p3", title: "施釉点彩", expl: 0.22, d: 2.6, h: 1.08, focus: "belly", voice: "黄、绿、白三彩釉点染其上，任它自由流淌。",
        card: ["釉彩 · 三色", "铅釉低温莹亮，黄、绿、白三色按装饰需要点、淋、洒，互不设防。"] },
      { id: "p4", title: "釉烧垂釉", expl: 0.36, d: 3.8, h: 0.98, focus: "belly", voice: "九百度低温釉烧，釉向下垂流，三色交融晕散。",
        card: ["窑火 · 垂釉", "低温铅釉流动性强，烧成中自然下淌，垂釉痕正是盛唐奔放审美的证据。"] },
      { id: "p5", title: "出窑修整", expl: 0.50, d: 2.8, h: 1.10, focus: "foot", voice: "出窑后修足去釉珠，三足鼎立，稳如泰山。",
        card: ["工序 · 修足", "足部多露白胎不挂釉，出窑后剔除釉滴与粘砂，保证摆放平稳。"] },
      { id: "p6", title: "成品入世", expl: 0.64, d: 3.2, h: 1.05, focus: "lip", voice: "一器之上，三色流光——大唐的雍容与自信，尽在其中。",
        card: ["文化 · 盛唐气象", "唐三彩是唐代厚葬之风与东西交流的产物，釉色之绚烂，正是大唐气象的物化。"] }
    ]
  },
  nigugu: {
    name: "浚县泥咕咕 · 彩绘陶哨",
    steps: [
      { id: "p1", title: "和泥捶打", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "黄胶泥掺棉花反复捶打，泥中带韧，捏而不裂。",
        card: ["原料 · 黄胶泥", "浚县杨玘屯的黄河胶泥细而黏，掺入弹松的棉花纤维，是泥咕咕不开裂的秘诀。"] },
      { id: "p2", title: "捏塑成型", expl: 0.10, d: 2.6, h: 1.08, focus: "body", voice: "手捏雏形，一头啄出鸟嘴，身子憨态可掬。",
        card: ["工序 · 手捏", "不翻模、不注浆，全凭一双手捏出造型。同一个艺人手里，每只泥咕咕都独一无二。"] },
      { id: "p3", title: "扎孔开音", expl: 0.24, d: 2.4, h: 1.10, focus: "head", voice: "顶部开吹孔，腹部扎发音孔，一吹即响——咕咕声由此而来。",
        card: ["工序 · 开音", "吹孔与音孔的斜度、深浅决定音色。经验老到的艺人，扎一次便成。"] },
      { id: "p4", title: "阴干烧制", expl: 0.38, d: 3.6, h: 0.98, focus: "body", voice: "阴干避晒，柴窑烧成，由泥变陶。",
        card: ["窑火 · 烧成", "土窑柴烧，温度不高却烟火气足。烧成后陶体致密，彩绘才能挂得住。"] },
      { id: "p5", title: "黑底打底", expl: 0.52, d: 2.6, h: 1.04, focus: "body", voice: "刷黑底，晾干——黑是它沉稳的底色，也是纹样的舞台。",
        card: ["装饰 · 黑底", "以黑为底是泥咕咕的传统：黑底托住白、黄、红的点线，乡土气息扑面而来。"] },
      { id: "p6", title: "彩绘点线", expl: 0.66, d: 2.8, h: 1.08, focus: "body", voice: "白黄红点线勾出花鸟纹样，正月庙会上，人手一只。",
        card: ["纹样 · 点线花鸟", "以点、线、勾画三法绘纹：点成花蕊，线成枝叶，勾成鸟翅——朴拙中见灵巧。"] }
    ]
  },
  ninigou: {
    name: "淮阳泥泥狗 · 黑底彩绘",
    steps: [
      { id: "p1", title: "选泥揉泥", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "取太昊陵周边黄土，去砂留黏，捶打揉匀。",
        card: ["原料 · 太昊陵黄土", "淮阳城湖淤积的黏土细腻纯净，传说取自太昊陵旁的土，泥泥狗因此有了灵性。"] },
      { id: "p2", title: "捏塑成型", expl: 0.10, d: 2.6, h: 1.08, focus: "head", voice: "捏出尖嘴、竖起双耳，身子浑圆——远古图腾的模样。",
        card: ["造型 · 图腾遗存", "尖嘴、竖耳、人面兽身，是伏羲氏族图腾的活化石，专家称之为真图腾、活化石。"] },
      { id: "p3", title: "晾干烧制", expl: 0.24, d: 3.4, h: 0.98, focus: "body", voice: "阴干后烧成，由软泥变硬陶。",
        card: ["窑火 · 烧成", "低温烧制，保留陶土本色。烧成后底色深浅不一，恰好是手作的温度。"] },
      { id: "p4", title: "染黑打底", expl: 0.38, d: 2.6, h: 1.04, focus: "body", voice: "以锅底灰调胶刷黑，通体乌黑，如夜。",
        card: ["装饰 · 染黑", "黑底是泥泥狗的底妆。以黑为夜，五色点彩便是夜空中的星辰。"] },
      { id: "p5", title: "五色点彩", expl: 0.52, d: 2.8, h: 1.10, focus: "body", voice: "青、黄、赤、白四色点线绘纹——五色点彩，是它最鲜明的脸谱。",
        card: ["纹样 · 五色点彩", "以青黄赤白四色点线绘出太阳纹、蹄印纹等远古纹样，黑底五色，对应五行五方。"] },
      { id: "p6", title: "压印符纹", expl: 0.66, d: 3.0, h: 1.06, focus: "base", voice: "底部压印符纹，拴上红绳，挂在孩子胸前辟邪纳福。",
        card: ["民俗 · 辟邪纳福", "太昊陵庙会上，泥泥狗又称陵狗。人们相信它守护孩子平安，是活着的图腾。"] }
    ]
  }
};

/* ---------- L3 工艺知识卡 ---------- */
var TREASURY_KNOWLEDGE = {
  junci: [
    { cat: "术语", title: "窑变", body: "釉料中铜、铁等金属氧化物在还原焰下自然发色，釉色随窑内气氛与温度流动幻化，非人力可控，故名窑变。民谚：入窑一色，出窑万彩。" },
    { cat: "材料", title: "禹州神垕瓷土", body: "钧窑以禹州神垕镇附近瓷土为胎，含铁量适中，烧后胎色灰褐。釉料以长石、石英为基，加铜、铁氧化物作发色剂。" },
    { cat: "口诀", title: "釉厚如脂，口薄如纸", body: "钧瓷施釉讲究口沿薄、腹壁厚，高温下口沿釉层退让露出釉缘，腹壁釉厚处形成蚯蚓走泥纹般的流动质感。" },
    { cat: "历史", title: "五大名窑之首", body: "钧窑创烧于唐，盛于宋。宋徽宗时期设官窑于禹州，专烧花盆、尊、洗等陈设器。元后衰落，明清仿烧不绝，至今仍是河南非遗的招牌。" },
    { cat: "禁忌", title: "火候差一分，釉色差千里", body: "钧瓷烧成温域极窄，还原焰气氛稍变即成败色。匠人凭火照与经验控窑，开窑前无人能预知釉色——这正是窑变的魅力与风险。" }
  ],
  ruci: [
    { cat: "术语", title: "天青釉", body: "汝窑标志性釉色，青中透蓝、温润如玉，源自宋徽宗梦中的“雨过天青云破处”。釉面含玛瑙末，呈梨皮与蟹爪纹理。" },
    { cat: "材料", title: "香灰胎", body: "汝窑胎土含铁量较高，烧成后胎色呈香灰色。胎薄质密，与天青釉结合紧密，是汝窑断代的重要依据。" },
    { cat: "口诀", title: "香灰胎、芝麻钉、蟹爪纹", body: "识汝窑三句口诀：胎色如香灰、支烧留芝麻钉痕、釉面开片似蟹爪冰裂。三条兼备，方为真汝。" },
    { cat: "历史", title: "存世不足百件", body: "汝窑烧造时间约二十年，北宋灭亡后窑火断绝。今存世公认汝窑不足百件，故有汝窑为魁、片汝值千金之说。" },
    { cat: "禁忌", title: "裹足支烧", body: "汝窑为追求满釉效果，采用支钉垫烧，器足不露胎。支钉细小如芝麻，这是工艺的极致，也是烧造难度与废品率极高的原因。" }
  ],
  sancai: [
    { cat: "术语", title: "唐三彩", body: "盛行于盛唐的低温铅釉陶器，以黄、绿、白（或赭）三色为主，实为多色。作为明器随葬，反映了唐代厚葬之风。" },
    { cat: "材料", title: "巩义白胎与铅釉", body: "巩义窑白陶土烧后胎白净。铅釉熔点在九百度左右，低温莹亮，金属氧化物作着色剂：铁呈黄褐、铜呈绿、钴呈蓝。" },
    { cat: "口诀", title: "釉彩向下流，三色任交融", body: "铅釉流动性强，烧成时自然下淌。匠人不刻意控制流淌方向，反而利用垂釉痕营造奔放绚烂的盛唐气象。" },
    { cat: "历史", title: "盛唐气象的物化", body: "唐三彩盛于高宗至玄宗朝，随丝绸之路兴盛。洛阳巩义窑是重要产地，洛阳出土的三彩器见证了东西文化交流的巅峰。" },
    { cat: "禁忌", title: "低温釉彩怕磕碰", body: "铅釉硬度低于高温釉，釉面娇嫩。出土修复与搬运需格外小心，馆藏三彩多需定制托架，避免釉面磨损。" }
  ],
  nigugu: [
    { cat: "术语", title: "泥咕咕", body: "浚县民间泥玩具，因能吹出“咕咕”的鸟鸣声得名。以黄胶泥捏塑、烧制、彩绘而成，正月古庙会上的标志性物件。" },
    { cat: "材料", title: "黄胶泥与棉花", body: "取浚县杨玘屯黄河胶泥，掺入弹松的棉花纤维捶打。纤维增加韧性，防止捏塑与烧制中开裂，是祖传的配方。" },
    { cat: "口诀", title: "一捏二扎三烧四绘", body: "泥咕咕四步口诀：捏塑成形、扎孔开音、柴窑烧成、点线彩绘。其中扎孔最见功夫，斜度深浅决定哨音。" },
    { cat: "历史", title: "正月庙会的声音", body: "浚县正月古庙会号称华北第一古庙会，泥咕咕是庙会上的声音与色彩，家家户户买几只，给孩子也是给年味。" },
    { cat: "禁忌", title: "阴干忌急晒", body: "坯体必须阴干，日光直晒或过堂风急吹都会开裂。火候也不宜过高，过高则音色闷哑、彩绘挂不住。" }
  ],
  ninigou: [
    { cat: "术语", title: "泥泥狗", body: "淮阳太昊陵庙会上的泥玩具，又称陵狗，因涂黑底点彩而得名。被专家誉为远古图腾的活化石、真图腾。" },
    { cat: "材料", title: "城湖黏土与锅底灰", body: "取淮阳城湖沉积黏土，细腻纯净。烧成后以锅底灰调胶刷黑底——取的是烟火气，成的是乌黑如夜的底色。" },
    { cat: "口诀", title: "黑底五色，青黄赤白", body: "泥泥狗以黑为底，青、黄、赤、白四色点线绘纹，合五行五方。点成日、线成纹、勾成符，一笔一画皆古意。" },
    { cat: "历史", title: "伏羲氏族的图腾", body: "相传太昊伏羲氏以泥土造人，淮阳人制泥狗以祀祖先。尖嘴、双耳、人面兽身的造型，保留了远古氏族的图腾记忆。" },
    { cat: "禁忌", title: "庙会信物不可轻弃", body: "当地人将泥泥狗视为辟邪纳福之物，拴红绳挂在孩子胸前。它既是玩具，更是信物——这是理解泥泥狗的关键。" }
  ]
};

/* ---------- L2 工序播放器 ---------- */
var TP = {
  on: false, el: null, stepsEl: null, cardEl: null, progEl: null, artEl: null,
  idx: 0, state: "idle", timer: 0, loop: false, STEP_MS: 7000,
  anim: false, a0: 0, a1: 0, at: 0, ad: 1,
  c0: null, c1: null, ct: 0, cd: 1, h: 0
};

function procHTML() {
  return '<div class="th-proc" id="t3d-proc" style="display:none">' +
    '<div class="tp-head">' +
    '<div class="tp-title">工艺流程 · <span class="tp-art" id="tp-art"></span></div>' +
    '<div class="tp-ctrl">' +
    '<button class="tp-btn" data-p="prev">上一步</button>' +
    '<button class="tp-btn" data-p="play">播放</button>' +
    '<button class="tp-btn" data-p="next">下一步</button>' +
    '<button class="tp-btn" data-p="loop">单步往复</button>' +
    '<button class="tp-btn" data-p="reset">复位</button>' +
    '<button class="tp-btn" data-p="close">收起</button>' +
    "</div>" +
    "</div>" +
    '<div class="tp-steps" id="tp-steps"></div>' +
    '<div class="tp-card" id="tp-card"></div>' +
    '<div class="tp-progress"><i id="tp-bar"></i></div>' +
    "</div>";
}

function stepsHTML(steps) {
  return steps.map(function (s, i) {
    return '<button class="tp-step" data-si="' + i + '"><span class="tp-sn">第 ' + (i + 1) + ' 道</span>' + s.title + "</button>";
  }).join("");
}

function openProcess() {
  var root = $q("#view-treasury");
  if (!root || !TREASURY_PROCESS[T3D.cur.id]) return;
  if (!TP.el) {
    var holder = document.createElement("div");
    holder.innerHTML = procHTML();
    root.querySelector(".th-main").insertAdjacentElement("afterend", holder.firstChild);
    TP.el = $q("#t3d-proc");
    TP.stepsEl = $q("#tp-steps");
    TP.cardEl = $q("#tp-card");
    TP.progEl = $q("#tp-bar");
    TP.artEl = $q("#tp-art");
    TP.el.addEventListener("click", function (e) {
      var b = e.target.closest(".tp-btn");
      if (!b) return;
      var p = b.getAttribute("data-p");
      if (p === "prev") TP.prev();
      else if (p === "play") TP.togglePlay();
      else if (p === "next") TP.next();
      else if (p === "loop") { TP.loop = !TP.loop; b.classList.toggle("on", TP.loop); }
      else if (p === "reset") TP.reset();
      else if (p === "close") closeProcess();
    });
    TP.stepsEl.addEventListener("click", function (e) {
      var st = e.target.closest(".tp-step");
      if (!st) return;
      TP.go(+st.getAttribute("data-si"));
    });
  }
  TP.on = true;
  TP.el.style.display = "block";
  TP.idx = 0;
  TP.loop = false;
  var lb = TP.el.querySelector('[data-p="loop"]');
  if (lb) lb.classList.remove("on");
  renderSteps();
  applyStep(0);
}

function closeProcess() {
  TP.on = false;
  if (!TP.el) return;
  TP.stopTTS();
  TP.state = "idle";
  clearTimeout(TP.timer);
  TP.el.style.display = "none";
  animExpl(0, 0.4);
  clearHighlight();
}

function renderSteps() {
  var p = TREASURY_PROCESS[T3D.cur.id];
  TP.stepsEl.innerHTML = stepsHTML(p.steps);
  TP.artEl.textContent = p.name;
}

function setStepUI() {
  var p = TREASURY_PROCESS[T3D.cur.id];
  $qa("#tp-steps .tp-step").forEach(function (b, i) {
    b.classList.remove("now", "done");
    if (i < TP.idx) b.classList.add("done");
    if (i === TP.idx) b.classList.add("now");
  });
}

function speakStep(st) {
  TP.stopTTS();
  if (!st.voice || !("speechSynthesis" in window)) return;
  try {
    var u = new SpeechSynthesisUtterance(st.voice);
    u.lang = "zh-CN"; u.rate = 1.0;
    var vs = window.speechSynthesis.getVoices();
    var zv = vs.filter(function (v) { return /^zh/i.test(v.lang); })[0];
    if (zv) u.voice = zv;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

TP.stopTTS = function () {
  try { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); } catch (e) {}
};

function applyStep(i) {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (i < 0 || i >= p.steps.length) return;
  TP.idx = i;
  TP.state = "idle";
  clearTimeout(TP.timer);
  var st = p.steps[i];
  animExpl(st.expl, 0.5);
  animCam(st.d, st.h, 0.7);
  if (st.focus) {
    var f = T3D.parts.filter(function (m) { return m.userData.part && m.userData.part.key === st.focus; })[0];
    if (f) highlightPart(f);
  } else clearHighlight();
  TP.cardEl.innerHTML = '<span class="tp-k">' + (st.card ? st.card[0] : "") + "</span>" + (st.card ? st.card[1] : "");
  setStepUI();
  TP.progEl.style.width = "0%";
  speakStep(st);
}

/* expl 渐变（0.5s 默认） */
function animExpl(to, dur) {
  TP.a0 = T3D.expl; TP.a1 = to; TP.at = 0; TP.ad = dur || 0.5;
  if (!TP.anim) { TP.anim = true; tpAnimTick(); }
}
/* 相机渐变：d = dist×h 倍数，h = 高度倍数 */
function animCam(d, hgt, dur) {
  var h = T3D.camH || 1;
  TP.c0 = { y: T3D.camera.position.y, z: T3D.camera.position.z };
  TP.c1 = { y: hgt * h, z: d * h };
  TP.ct = 0; TP.cd = dur || 0.7;
  if (!TP.anim) { TP.anim = true; tpAnimTick(); }
}

function tpAnimTick() {
  var done = true;
  if (TP.at < TP.ad) {
    TP.at += 16; var k = Math.min(1, TP.at / TP.ad);
    var e = 1 - Math.pow(1 - k, 3);
    T3D.expl = TP.a0 + (TP.a1 - TP.a0) * e;
    if (T3D.group) applyExplode();
    done = false;
  }
  if (TP.ct < TP.cd && TP.c0 && T3D.camera) {
    TP.ct += 16; var k2 = Math.min(1, TP.ct / TP.cd);
    var e2 = 1 - Math.pow(1 - k2, 3);
    T3D.camera.position.set(0, TP.c0.y + (TP.c1.y - TP.c0.y) * e2, TP.c0.z + (TP.c1.z - TP.c0.z) * e2);
    T3D.camera.lookAt(0, T3D.camH * 0.42, 0);
    done = false;
  }
  if (done) { TP.anim = false; return; }
  requestAnimationFrame(tpAnimTick);
}

/* 控制 */
TP.play = function () {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (!p) return;
  if (TP.idx >= p.steps.length - 1) { TP.idx = -1; }
  TP.state = "playing";
  stepTimer();
};

function stepTimer() {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (TP.state !== "playing" || !p) return;
  TP.idx++;
  if (TP.idx >= p.steps.length) {
    if (TP.loop) TP.idx = 0;
    else { TP.done(); return; }
  }
  applyStep(TP.idx);
  TP.progEl.style.width = "0%";
  var t0 = Date.now();
  var bar = TP.progEl;
  var iv = setInterval(function () {
    if (TP.state !== "playing") { clearInterval(iv); return; }
    var k = Math.min(1, (Date.now() - t0) / TP.STEP_MS);
    bar.style.width = (k * 100) + "%";
    if (k >= 1) { clearInterval(iv); stepTimer(); }
  }, 80);
  TP._iv = iv;
}

TP.done = function () {
  TP.state = "idle";
  TP.stopTTS();
  TP.cardEl.innerHTML = '<span class="tp-k">成器 · 回装</span>' + (T3D.cur.name + "：六道工序走完，器物复位。再点一次播放，可重看整条工艺链。");
  animExpl(0, 0.6);
  clearHighlight();
  TP.progEl.style.width = "100%";
};

TP.togglePlay = function () {
  if (TP.state === "playing") {
    TP.state = "idle";
    TP.stopTTS();
    clearInterval(TP._iv);
  } else TP.play();
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = TP.state === "playing" ? "暂停" : "播放";
};

TP.next = function () {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (!p) return;
  TP.state = "idle";
  clearInterval(TP._iv);
  TP.stopTTS();
  var i = Math.min(TP.idx + 1, p.steps.length - 1);
  if (i === TP.idx) TP.done(); else applyStep(i);
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = "播放";
};

TP.prev = function () {
  if (TP.idx <= 0) { TP.go(0); return; }
  TP.state = "idle";
  clearInterval(TP._iv);
  TP.stopTTS();
  applyStep(TP.idx - 1);
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = "播放";
};

TP.go = function (i) {
  TP.state = "idle";
  clearInterval(TP._iv);
  TP.stopTTS();
  applyStep(i);
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = "播放";
};

TP.reset = function () {
  TP.state = "idle";
  clearInterval(TP._iv);
  TP.stopTTS();
  animExpl(0, 0.4);
  clearHighlight();
  TP.idx = 0;
  setStepUI();
  TP.cardEl.innerHTML = '<span class="tp-k">复位</span>已回到完整器物，可从第 1 道工序重新开始。';
  TP.progEl.style.width = "0%";
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = "播放";
};

/* 切换文物时同步 */
function onArtifactProcess() {
  if (!TP.on || !TP.el) return;
  if (!TREASURY_PROCESS[T3D.cur.id]) { closeProcess(); return; }
  TP.state = "idle";
  clearInterval(TP._iv);
  TP.stopTTS();
  TP.idx = 0;
  renderSteps();
  applyStep(0);
}

/* ---------- L3 知识模态 ---------- */
var KNOW = { veil: null, built: false };

function knowHTML(knowledge) {
  return '<div class="th-know-veil" id="t3d-know">' +
    '<div class="th-know">' +
    '<button class="tk-x" aria-label="关闭" data-k="close">&times;</button>' +
    '<h3>' + T3D.cur.name + "</h3>" +
    '<div class="tk-sub">工艺知识 · 术语 / 材料 / 口诀 / 历史 / 禁忌 · 点击卡片展开</div>' +
    '<div class="tk-list">' +
    knowledge.map(function (k, i) {
      return '<div class="tk-item' + (i === 0 ? " on" : "") + '">' +
        '<span class="tk-cat">' + k.cat + "</span>" +
        '<div class="tk-t">' + k.title + "</div>" +
        '<div class="tk-b">' + k.body + "</div>" +
        "</div>";
    }).join("") +
    "</div>" +
    "</div>" +
    "</div>";
}

function openKnow() {
  var knowledge = TREASURY_KNOWLEDGE[T3D.cur.id];
  if (!knowledge) return;
  if (!KNOW.built) {
    var holder = document.createElement("div");
    holder.innerHTML = knowHTML(knowledge);
    document.body.appendChild(holder.firstChild);
    KNOW.veil = $q("#t3d-know");
    KNOW.veil.addEventListener("click", function (e) {
      var x = e.target.closest('[data-k="close"]');
      if (x || e.target === KNOW.veil) closeKnow();
      var it = e.target.closest(".tk-item");
      if (it) {
        var on = it.classList.contains("on");
        $qa(".tk-item", KNOW.veil).forEach(function (c) { c.classList.remove("on"); });
        if (!on) it.classList.add("on");
      }
    });
    KNOW.built = true;
  } else {
    KNOW.veil.innerHTML = knowHTML(knowledge).replace(/^<div class="th-know-veil" id="t3d-know">/, "").replace(/<\/div>$/, "");
    /* 重新构建列表（换文物） */
    var inner = KNOW.veil;
    var wrap = document.createElement("div");
    wrap.innerHTML = knowHTML(knowledge);
    var fresh = wrap.firstChild;
    fresh.style.display = "flex";
    inner.parentNode.replaceChild(fresh, inner);
    KNOW.veil = fresh;
    KNOW.veil.addEventListener("click", function (e) {
      var x = e.target.closest('[data-k="close"]');
      if (x || e.target === KNOW.veil) closeKnow();
      var it = e.target.closest(".tk-item");
      if (it) {
        var on = it.classList.contains("on");
        $qa(".tk-item", KNOW.veil).forEach(function (c) { c.classList.remove("on"); });
        if (!on) it.classList.add("on");
      }
    });
  }
  KNOW.veil.classList.add("open");
}

function closeKnow() {
  if (KNOW.veil) KNOW.veil.classList.remove("open");
}

