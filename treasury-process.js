/* ================= 珍品馆 · L2 工艺流程图文演示 + L3 工艺知识层 =================
   每件文物 = 6 道工序（图文卡自动/手动步进·可暂停·可回到任意步骤）+ 工艺知识卡（术语/材料/口诀/禁忌/历史）
   纯离线：无语音合成、无 3D 依赖，讲解提要以字幕图文直接呈现 */

if (typeof window.$q !== "function") {
  window.$q = function (sel, root) { return (root || document).querySelector(sel); };
}
if (typeof window.$qa !== "function") {
  window.$qa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
}

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
  },
  yuju: {
    name: "豫剧 · 梆子腔大戏",
    steps: [
      { id: "p1", title: "定腔选段", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "先按行当定调，豫东调高亢，豫西调苍凉。",
        card: ["行当 · 生旦净丑", "豫剧角色分行当，唱腔按声腔分派。一开口便知是哪一路河南老家的腔调。"] },
      { id: "p2", title: "板胡定弦", expl: 0.12, d: 2.6, h: 1.08, focus: "", voice: "板胡内外弦定准，枣木梆子击节，乐队合乐。",
        card: ["主奏 · 板胡梆子", "板胡高亢靠前，梆子脆亮打板。主奏一起，中原的爽利便立住了。"] },
      { id: "p3", title: "吊嗓练功", expl: 0.26, d: 2.8, h: 1.05, focus: "", voice: "演员晨功喊嗓，咬字归韵，字正才能腔圆。",
        card: ["功夫 · 喊嗓归韵", "豫剧讲字正腔圆，中州韵咬字，慢板要稳，飞板要脆。"] },
      { id: "p4", title: "穿箱扮戏", expl: 0.40, d: 2.6, h: 1.08, focus: "", voice: "盔头、髯口、戏衣上妆，油彩勾脸。",
        card: ["扮戏 · 行头", "帅旦扎靠、文旦着帔，行头一上身，人物便立起来。"] },
      { id: "p5", title: "唱念做打", expl: 0.54, d: 3.0, h: 1.0, focus: "", voice: "一板三眼，唱中带做，身段跟着腔门走。",
        card: ["表演 · 四功", "唱、念、做、打四功并重，花木兰戎装跑圆场，英气扑面而来。"] },
      { id: "p6", title: "登台献艺", expl: 0.70, d: 3.0, h: 1.06, focus: "", voice: "大幕拉开，满堂喝彩，常香玉那句戏比天大传到今天。",
        card: ["传承 · 戏比天大", "常香玉抗美援朝义演捐机，一句戏比天大，成了豫剧人的风骨。"] }
    ]
  },
  quju: {
    name: "曲剧 · 高跷曲子",
    steps: [
      { id: "p1", title: "择牌定调", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "按人物情绪选曲牌，婉转处用大汉江，悲切处用哭书韵。",
        card: ["曲牌体 · 一曲多式", "曲剧属曲牌体，一段一牌，缠绵细腻，与豫剧板腔体恰成对照。"] },
      { id: "p2", title: "调弦起乐", expl: 0.14, d: 2.6, h: 1.08, focus: "", voice: "大弦、三弦、筝瑟和鸣，曲调如水。",
        card: ["伴奏 · 丝竹", "大弦嗡鸣、三弦叮咚，是地摊说唱留给舞台的老韵味。"] },
      { id: "p3", title: "身段起范", expl: 0.28, d: 2.8, h: 1.05, focus: "", voice: "台步仍见踩跷痕迹，腰身一摆，市井人情就出来了。",
        card: ["遗韵 · 高跷步", "曲剧脱胎高跷曲，走台时脚下仍带起伏，别有一番灵巧。"] },
      { id: "p4", title: "上妆着衣", expl: 0.42, d: 2.6, h: 1.08, focus: "", voice: "素衣布裙，扮市井男女，不似大戏浓艳。",
        card: ["行头 · 家常", "曲剧多演家长里短，扮相家常，故百姓格外亲近。"] },
      { id: "p5", title: "载歌载舞", expl: 0.56, d: 3.0, h: 1.0, focus: "", voice: "唱做并重，小苍娃一段滚背，唱醉了半个河南。",
        card: ["表演 · 载歌载舞", "《卷席筒》《陈三两》深入民间，唱的就是邻家长短。"] },
      { id: "p6", title: "登台传韵", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "张新芳一曲曲剧皇后，把草根唱成了大雅。",
        card: ["传承 · 曲剧皇后", "张新芳以悲腔立派，把地摊小曲唱成河南第二大剧种。"] }
    ]
  },
  zhuizi: {
    name: "河南坠子 · 一坠一简",
    steps: [
      { id: "p1", title: "开书目", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "长篇说包公案，短篇唱小段，先定今天说哪一段。",
        card: ["书目 · 长短由人", "坠子以长篇大书为主，《包公案》《杨家将》最养听众。"] },
      { id: "p2", title: "坠胡调弦", expl: 0.14, d: 2.6, h: 1.08, focus: "", voice: "坠胡两根弦，揉一揉，咿呀近似人声。",
        card: ["主奏 · 坠胡", "坠胡琴杆长、音量柔，揉弦如泣如诉，是坠子的魂。"] },
      { id: "p3", title: "简板拿法", expl: 0.28, d: 2.4, h: 1.10, focus: "", voice: "两片檀板夹指间，起落清脆。",
        card: ["击节 · 简板", "简板一打，说唱之间的呼吸便有了拍子。"] },
      { id: "p4", title: "书帽开场", expl: 0.42, d: 2.8, h: 1.04, focus: "", voice: "先念一段小段书帽，把台下的耳朵拢住。",
        card: ["书帽 · 拢人", "说书人本事：三两句书帽就能让喧闹书场静下来。"] },
      { id: "p5", title: "说表唱腔", expl: 0.56, d: 3.0, h: 1.0, focus: "", voice: "说中带唱、唱中夹白，一人千面。",
        card: ["说唱相间", "艺人自拉自唱、一人分饰多角，全靠声音变换。"] },
      { id: "p6", title: "收底留扣", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "欲知后事如何，且听下回分解——留个扣，下次还来。",
        card: ["留扣 · 吊人", "评书坠子的老手段：关键处戛然而止，听众明日还来。"] }
    ]
  },
  majie: {
    name: "马街书会 · 正月十三",
    steps: [
      { id: "p1", title: "负鼓赴会", expl: 0.00, d: 3.2, h: 1.05, focus: "", voice: "过了正月十一，艺人背起鼓琴往宝丰马街走。",
        card: ["行艺 · 千里赴会", "艺人年过花甲仍步行赴会，被称为曲艺界的江湖会。"] },
      { id: "p2", title: "择地搭棚", expl: 0.14, d: 2.6, h: 1.08, focus: "", voice: "田野里挑一块地，张棚设座，天作幕、地作台。",
        card: ["天作幕 · 地作台", "无台无棚，几百个书棚隔垄相望，各亮本事。"] },
      { id: "p3", title: "亮书开唱", expl: 0.28, d: 3.0, h: 1.05, focus: "", voice: "对棚开唱，你一段我一段，比的是真功夫。",
        card: ["亮书 · 献艺", "亮书即展示技艺，棚与棚对垒，听众多者为胜。"] },
      { id: "p4", title: "写书点唱", expl: 0.42, d: 2.8, h: 1.08, focus: "", voice: "相中哪棚，东家写书点段，艺人照单唱。",
        card: ["写书 · 点唱", "写书是付钱点唱的老规矩，艺人凭口碑挣下一年盘缠。"] },
      { id: "p5", title: "会书结棚", expl: 0.56, d: 3.0, h: 1.0, focus: "", voice: "三天三夜，千台竞响，三天胜读万卷书。",
        card: ["会书 · 活化石", "马街书会延续七百年，是中国曲艺活态传承的田野样本。"] },
      { id: "p6", title: "散会订约", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "散会时订好来年的约，背起鼓琴再走三百里。",
        card: ["以书会友", "一年一会，艺人凭书艺论交，比输赢更重情义。"] }
    ]
  },
  shuixi: {
    name: "洛阳水席 · 二十四道汤",
    steps: [
      { id: "p1", title: "老汤吊底", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "骨头汤吊整日，汤底醇厚，全席的味根在这一锅。",
        card: ["汤头 · 老汤", "水席以汤立席，老汤吊得越久，味越厚。"] },
      { id: "p2", title: "刀工切配", expl: 0.14, d: 2.6, h: 1.08, focus: "", voice: "萝卜切得细如发丝，根根透亮。",
        card: ["刀工 · 萝卜丝", "牡丹燕菜的功夫全在刀上：萝卜细丝能穿针。"] },
      { id: "p3", title: "燕菜成花", expl: 0.28, d: 3.0, h: 1.05, focus: "", voice: "萝卜丝蒸去辛气，吸汤如燕窝，中央摆成牡丹。",
        card: ["镇桌 · 牡丹燕菜", "以萝卜仿燕窝，淋上清汤，一朵牡丹浮在碗心。"] },
      { id: "p4", title: "次第上菜", expl: 0.42, d: 2.8, h: 1.08, focus: "", voice: "前八品、四镇桌、八中件、四扫尾，流水般上。",
        card: ["程式 · 二十四道", "全席二十四道，道道带汤，上菜如流水不断。"] },
      { id: "p5", title: "酸辣调味", expl: 0.56, d: 2.6, h: 1.0, focus: "", voice: "米醋胡椒提味，酸辣鲜香，醒酒又开胃。",
        card: ["味型 · 酸辣", "洛阳水席重酸辣，与牡丹的富贵恰好一雅一俗。"] },
      { id: "p6", title: "合席收汤", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "最后一道鸡蛋汤收尾，圆圆满散席。",
        card: ["官席遗风", "水席传自唐代官宴，武则天的传说让它多了一层传奇。"] }
    ]
  },
  bianxiu: {
    name: "汴绣 · 宋韵针笔",
    steps: [
      { id: "p1", title: "选稿上绷", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "选宋画稿，绫绢绷上架，拉得平紧。",
        card: ["绣绷 · 画稿", "绣画同源，宋徽宗好绣画，汴绣天生带着宣和画院的基因。"] },
      { id: "p2", title: "劈线配色", expl: 0.14, d: 2.4, h: 1.10, focus: "", voice: "一根丝线劈成数丝，按画稿配色。",
        card: ["劈线 · 以线为墨", "线劈得越细，绣面越润。一根丝线可劈到四十八分之一。"] },
      { id: "p3", title: "针法起手", expl: 0.28, d: 2.8, h: 1.05, focus: "", voice: "掺针、平针、滚针，按物象走丝。",
        card: ["针法 · 以针代笔", "不同针法表现不同质感：绣人用掺针，绣水用滚针。"] },
      { id: "p4", title: "绣画再现", expl: 0.42, d: 3.0, h: 1.08, focus: "", voice: "一针一线追摹笔墨，《清明上河图》绣了数十年。",
        card: ["绣画 · 名画入绫", "汴绣善绣工笔花鸟与名画，针脚密到肉眼难辨。"] },
      { id: "p5", title: "双面修意", expl: 0.56, d: 2.6, h: 1.0, focus: "", voice: "正反两面皆成画，两面色彩还能不同。",
        card: ["绝技 · 双面绣", "双面异色绣是汴绣传内不传外的绝技，一根线两面走。"] },
      { id: "p6", title: "落绷装框", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "落绷、熨平、装框，宋韵就此留住。",
        card: ["成绣 · 宋韵长存", "与苏湘蜀粤并称地方名绣，是开封的一缕针笔乡愁。"] }
    ]
  },
  zhuxian: {
    name: "朱仙镇年画 · 门神千年",
    steps: [
      { id: "p1", title: "起稿画样", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "先画墨线稿，门神披甲执鞭，威风要足。",
        card: ["画样 · 门神", "秦琼、尉迟恭为经典，造型千年来约定俗成。"] },
      { id: "p2", title: "梨木刻版", expl: 0.14, d: 2.8, h: 1.08, focus: "", voice: "梨木纹理细硬，雕出线如刀刻。",
        card: ["刻版 · 梨木", "梨木不裂不翘，线刻刚劲，是年画的母版。"] },
      { id: "p3", title: "矿物套色", expl: 0.28, d: 2.6, h: 1.05, focus: "", voice: "黄丹、槐黄、铜绿，一版一色层层套印。",
        card: ["套印 · 矿物色", "矿物颜料历久不褪，红纸配上浓绿，年味儿最足。"] },
      { id: "p4", title: "晾纸校样", expl: 0.42, d: 2.6, h: 1.08, focus: "", voice: "印一张校一张，套色偏一丝便重刻。",
        card: ["校样 · 差之毫厘", "多版套印最怕错位，老艺人靠眼力对版。"] },
      { id: "p5", title: "裁张成对", expl: 0.56, d: 2.6, h: 1.0, focus: "", voice: "门神裁成一对，左右分明。",
        card: ["成对 · 左右门神", "秦琼在左、尉迟恭在右，一对守门。"] },
      { id: "p6", title: "贴门贺岁", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "除夕贴上门，驱邪纳福守岁。",
        card: ["年俗 · 镇宅", "贴门神是千年俗信，朱仙镇年画正是这俗信的鼻祖。"] }
    ]
  },
  shaolin: {
    name: "少林功夫 · 禅武合一",
    steps: [
      { id: "p1", title: "晨起坐禅", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "四更天起，先坐禅定心，再谈拳脚。",
        card: ["禅武 · 由禅入武", "少林功夫先修禅心，再练武身，拳禅一体。"] },
      { id: "p2", title: "热身练功", expl: 0.14, d: 2.8, h: 1.08, focus: "", voice: "压腿、下腰、桩功，基本功扎一日是一日。",
        card: ["基本功 · 桩功", "马步桩一站半个时辰，功夫是熬出来的。"] },
      { id: "p3", title: "套路起势", expl: 0.28, d: 3.0, h: 1.05, focus: "", voice: "罗汉拳起势，拳打卧牛之地。",
        card: ["拳械 · 数百套路", "罗汉拳、少林拳、七星剑，套路数百自成体系。"] },
      { id: "p4", title: "对拆散打", expl: 0.42, d: 2.8, h: 1.08, focus: "", voice: "两人对拆，招招讲实战，不摆花架子。",
        card: ["对练 · 朴实", "少林拳刚猛直接，一拳一脚都为用。"] },
      { id: "p5", title: "兵器操练", expl: 0.56, d: 2.8, h: 1.0, focus: "", voice: "少林棍挥出风声，棍扫一大片。",
        card: ["兵器 · 棍剑", "少林棍天下闻名，武僧团一亮相便是正气。"] },
      { id: "p6", title: "收势归禅", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "练罢收势，归禅堂静坐，动静一如。",
        card: ["禅收 · 天下少林", "从嵩山寺院到全球表演，天下功夫出少林，是文化也是和平使者。"] }
    ]
  },
  taiji: {
    name: "陈氏太极拳 · 缠丝开合",
    steps: [
      { id: "p1", title: "起势松身", expl: 0.00, d: 3.0, h: 1.05, focus: "", voice: "两脚开立，松肩沉肘，先把身子松下来。",
        card: ["松沉 · 由松入柔", "太极先求松，气沉丹田，劲才能在身里走。"] },
      { id: "p2", title: "掤捋挤按", expl: 0.14, d: 2.8, h: 1.08, focus: "", voice: "八法五步，掤捋挤按采挒肘靠。",
        card: ["八法五步", "太极十三势，八门劲法配五步，是套路的骨架。"] },
      { id: "p3", title: "缠丝走架", expl: 0.28, d: 3.0, h: 1.05, focus: "", voice: "劲如抽丝，一举一动都在画弧。",
        card: ["缠丝劲 · 陈氏核心", "陈氏太极独有缠丝劲，螺旋运转，慢如行云。"] },
      { id: "p4", title: "发劲抖弹", expl: 0.42, d: 2.6, h: 1.08, focus: "", voice: "慢架之中忽一抖，劲透而出。",
        card: ["发劲 · 快慢相间", "陈氏保留古老发劲，快如炸雷，与慢架同处一式。"] },
      { id: "p5", title: "推手听劲", expl: 0.56, d: 2.8, h: 1.0, focus: "", voice: "两人搭手，听劲化劲，舍己从人。",
        card: ["推手 · 舍己从人", "推手练听劲，不顶不抗，引进落空。"] },
      { id: "p6", title: "收势归气", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "气归丹田，收势静立，养一身中和。",
        card: ["源头 · 陈家沟", "陈王廷创拳于温县陈家沟，杨武吴孙皆由此出，一村走向世界。"] }
    ]
  },
  dahuatie: {
    name: "确山打铁花 · 火树银花",
    steps: [
      { id: "p1", title: "化铁熔浆", expl: 0.00, d: 3.2, h: 1.05, focus: "", voice: "生铁入炉，熔到一千六百度，赤白如岩浆。",
        card: ["熔铁 · 千度", "确山打铁花用生铁熔浆，温度越高花越亮。"] },
      { id: "p2", title: "备板蘸水", expl: 0.14, d: 2.4, h: 1.10, focus: "", voice: "柳木板凿坑，蘸水，防铁烧穿。",
        card: ["木板 · 柳木", "柳木板韧而不易燃，坑中存水，是传了几百年的家伙。"] },
      { id: "p3", title: "舀铁上板", expl: 0.28, d: 2.6, h: 1.05, focus: "", voice: "长柄勺舀起铁水，稳稳盛上木板。",
        card: ["舀花 · 险活", "这一步最险，铁水溅出便是烫伤，全凭手上分寸。"] },
      { id: "p4", title: "抛起击打", expl: 0.42, d: 2.8, h: 1.08, focus: "", voice: "木板抛向夜空，反手一板猛击。",
        card: ["击花 · 反手一击", "千度铁水被击成碎末，瞬间燃成漫天金雨。"] },
      { id: "p5", title: "火树银花", expl: 0.56, d: 3.0, h: 1.0, focus: "", voice: "金花垂落如瀑，火树银花不夜天。",
        card: ["花雨 · 不夜天", "铁花高可数丈，比烟花更古、更烈、更惊魂。"] },
      { id: "p6", title: "收花贺岁", expl: 0.70, d: 2.8, h: 1.06, focus: "", voice: "打花打花、越打越发，正月里祈一年兴旺。",
        card: ["吉祥 · 越打越发", "打铁花本是冶炼业祭老君的行艺，如今成了确山新年的盛景。"] }
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
  ],
  yuju: [
    { cat: "术语", title: "板腔体", body: "豫剧属板腔体戏曲，以板式变化组织唱腔，慢板舒展、流水板明快、飞板急促。与曲剧的曲牌体相对，是中国戏曲两大结构。" },
    { cat: "材料", title: "板胡与枣木梆子", body: "主奏乐器板胡琴杆短、音色高亢。枣木梆子两片相击，脆亮如爆豆，是豫剧节奏的骨架。" },
    { cat: "口诀", title: "字正腔圆、以情带声", body: "豫剧唱中州韵，咬字要准、拖腔要圆。常香玉讲戏比天大，唱人物先唱情，再论腔。" },
    { cat: "历史", title: "从河南梆子到豫剧", body: "豫剧旧称河南梆子，清代形成于河南。20 世纪中叶统一定名豫剧，常香玉《花木兰》唱遍全国，成为中国第一大地方剧种。" },
    { cat: "禁忌", title: "喊嗓忌直吼、登台忌凉弦", body: "喊嗓要由低到高、以气息托声，直吼伤嗓。登台前乐队先合乐，最怕台上演员开腔而板胡未跟上。" }
  ],
  quju: [
    { cat: "术语", title: "曲牌体", body: "曲剧以曲牌连缀成唱腔，每段一个曲牌，如大汉江、哭书韵。曲牌体讲究词格与旋律贴合，细腻缠绵。" },
    { cat: "材料", title: "大弦与三弦", body: "曲剧传统伴奏以大弦（莽三弦）、筝、瑟为主，丝竹和鸣，保留了地摊说唱的市井韵味。" },
    { cat: "口诀", title: "高跷步、曲子腔", body: "曲剧脱胎高跷曲子，走台脚下带起伏；唱腔婉转如诉，长于演市井人情悲欢。" },
    { cat: "历史", title: "河南第二大剧种", body: "曲剧由洛阳、南阳一带高跷曲登台演化，20 世纪初形成剧种。《卷席筒》《陈三两》深入民间。" },
    { cat: "禁忌", title: "切忌照搬豫剧", body: "曲剧唱腔与豫剧板腔体不同，不能用梆子戏的劲唱曲牌；一用力，婉转味就没了。" }
  ],
  zhuizi: [
    { cat: "术语", title: "坠子书", body: "说唱相间的曲艺形式，艺人自拉坠胡、自打简板，说中夹唱、一人多角。" },
    { cat: "材料", title: "坠胡与简板", body: "坠胡由小三弦演变而来，琴杆长、揉弦近似人声。简板为两片檀木，清脆击节。" },
    { cat: "口诀", title: "先书帽、后正书", body: "开场先用小段书帽拢住听众，再入长篇正书；关键处留扣，吊听众下次再来。" },
    { cat: "历史", title: "书场里的长篇", body: "河南坠子清末形成，流行于豫、鲁、皖。《包公案》《杨家将》等长篇靠说书人代代传讲。" },
    { cat: "禁忌", title: "忌冷场、忌平叙", body: "书场最忌平铺直叙。艺人要靠嗓音轻重、简板急缓把人拉住，三分唱、七分说。" }
  ],
  majie: [
    { cat: "术语", title: "亮书与写书", body: "马街书会术语：艺人对棚献艺叫亮书，观众或东家付钱点唱叫写书。两者构成活态的曲艺市场。" },
    { cat: "材料", title: "鼓、琴与天棚", body: "艺人负鼓携琴赴会，田野张棚设座。没有固定舞台，天为幕、地为台。" },
    { cat: "口诀", title: "一天千台戏，三天万卷书", body: "正月十一至十三，数百书棚隔垄竞唱，是民间对马街书会最生动的概括。" },
    { cat: "历史", title: "七百年的活化石", body: "马街书会相传始于元代，延续七百余年，2006 年列入首批国家级非遗，被称为中国曲艺活化石。" },
    { cat: "禁忌", title: "会书不许假棚", body: "书会凭真功夫亮书，不许凑数假唱。艺人敬惜名声，来年是否还被请，全看这三天。" }
  ],
  shuixi: [
    { cat: "术语", title: "水席", body: "洛阳传统宴席，全席二十四道，道道带汤、上菜如流水，故名水席。与牡丹燕菜、洛阳牛肉汤并称洛阳三绝。" },
    { cat: "材料", title: "老汤与萝卜", body: "以骨头汤吊底，萝卜为重要主料。牡丹燕菜即萝卜丝仿燕窝，是刀工与汤功的结合。" },
    { cat: "口诀", title: "前八品、四镇桌、八中件、四扫尾", body: "水席上菜程式：八道冷盘、四道镇桌大菜、八道中件、四道收尾汤，流水不断。" },
    { cat: "历史", title: "唐代官席遗风", body: "水席相传始于唐代，传为武则天所好。今日真不同饭庄一脉相承，是洛阳的饮食名片。" },
    { cat: "禁忌", title: "酸辣失度即败味", body: "水席味型以酸辣为主，米醋、胡椒要恰到好处。过酸夺味、过辣压汤，便失了中原中和。" }
  ],
  bianxiu: [
    { cat: "术语", title: "汴绣", body: "北宋都城开封的刺绣，承宫廷绣艺，以针代笔、以线为墨，善绣名画与工笔花鸟。" },
    { cat: "材料", title: "劈丝绫绢", body: "一根蚕丝可劈为数丝至四十八分之一，绣于绫绢之上。丝线越细，绣面越润。" },
    { cat: "口诀", title: "针脚如笔、双面异色", body: "掺针绣人、滚针绣水；双面绣正反皆成画，两面色彩还可不同，是汴绣绝技。" },
    { cat: "历史", title: "宣和绣画", body: "宋徽宗好画亦好绣，设文绣院。汴绣由此与画院结缘，《清明上河图》被数十年如一日绣入绫绢。" },
    { cat: "禁忌", title: "忌线粗、忌露底", body: "绣名画最忌线粗露底，一笔色块要顺丝走针，浓淡过渡不留针痕。" }
  ],
  zhuxian: [
    { cat: "术语", title: "木版年画", body: "以梨木雕版、矿物颜料套色印刷的年节画。朱仙镇是中国木版年画的重要发源地。" },
    { cat: "材料", title: "梨木与矿物色", body: "梨木纹理细硬、不裂不翘。颜料用黄丹、槐黄、铜绿等矿物色，历久不褪。" },
    { cat: "口诀", title: "一版一色、对版如眼", body: "年画多版套印，每色一版。对版差一丝，整张即废，全凭老艺人眼力。" },
    { cat: "历史", title: "门神镇千年", body: "朱仙镇年画北宋已盛，门神秦琼、尉迟恭题材影响全国。2006 年列入首批国家级非遗。" },
    { cat: "禁忌", title: "忌套色错位", body: "门神左右成对，套印错位便不威武。印前校样极严，宁可重刻不将就。" }
  ],
  shaolin: [
    { cat: "术语", title: "禅武合一", body: "少林功夫以禅定为心、武功为用，练武即修禅，拳禅一体，是少林寺的根本精神。" },
    { cat: "材料", title: "桩功与器械", body: "马步桩、罗汉拳为根基；器械以少林棍最负盛名，拳械套路数百种。" },
    { cat: "口诀", title: "拳打卧牛之地", body: "少林拳刚猛朴实，不尚花架，小小一块地便能练出真功夫。" },
    { cat: "历史", title: "天下功夫出少林", body: "少林功夫发源于嵩山少林寺，相传达摩传法、武僧护寺。2006 年列入首批国家级非遗。" },
    { cat: "禁忌", title: "忌花架、忌急功", body: "少林功夫重根基，套路再花也不如一日桩功。冬练三九、夏练三伏，急不得。" }
  ],
  taiji: [
    { cat: "术语", title: "缠丝劲", body: "陈氏太极拳核心劲法，劲路螺旋如抽丝，一举一动画弧，使力由内而生、连绵不断。" },
    { cat: "材料", title: "松沉与发劲", body: "先松肩沉肘、气沉丹田，再于慢架中突然抖弹发劲，刚柔同处一式。" },
    { cat: "口诀", title: "慢如行云、快如炸雷", body: "陈氏太极慢架养气、快架发劲，快慢相间，与其他慢练流派明显不同。" },
    { cat: "历史", title: "陈王廷创拳于陈家沟", body: "明末清初陈王廷在温县陈家沟创编太极拳，后衍生杨、武、吴、孙诸派。2020 年太极拳列入人类非遗。" },
    { cat: "禁忌", title: "忌挺胸、忌用拙力", body: "太极讲松沉，挺胸憋气、用僵劲便入魔道。推手尤忌顶抗，要舍己从人。" }
  ],
  dahuatie: [
    { cat: "术语", title: "打铁花", body: "确山传统民俗绝技，将千度铁水抛向空中，以木板击散成漫天金花，亦称确山铁花。" },
    { cat: "材料", title: "生铁水与柳木板", body: "生铁熔至一千六百度。柳木板凿坑存水，既盛铁又防火烧穿。" },
    { cat: "口诀", title: "打花打花、越打越发", body: "正月夜演，金花如雨，寓意新年兴旺发达。是冶炼业祭老君的行艺演化。" },
    { cat: "历史", title: "千年的火树银花", body: "打铁花相传已有千年，2008 年列入第二批国家级非遗，近年由濒危走向景区夜演复兴。" },
    { cat: "禁忌", title: "千度铁水非儿戏", body: "打铁花是高风险绝技，必须由专业艺人在防护下操作，严禁普通人模仿。" }
  ]
};

/* ---------- L2 工序播放器（纯图文步进） ---------- */
var TP = {
  on: false, el: null, stepsEl: null, cardEl: null, voiceEl: null, progEl: null, artEl: null,
  idx: 0, state: "idle", iv: 0, loop: false, STEP_MS: 7000
};

function procHTML() {
  return '<div class="th-proc" id="t3d-proc" style="display:none">' +
    '<div class="tp-head">' +
    '<div class="tp-title">工艺流程 · <span class="tp-art" id="tp-art"></span></div>' +
    '<div class="tp-ctrl">' +
    '<button class="tp-btn" data-p="prev">上一步</button>' +
    '<button class="tp-btn" data-p="play">自动播放</button>' +
    '<button class="tp-btn" data-p="next">下一步</button>' +
    '<button class="tp-btn" data-p="loop">循环演示</button>' +
    '<button class="tp-btn" data-p="reset">复位</button>' +
    '<button class="tp-btn" data-p="close">收起</button>' +
    "</div>" +
    "</div>" +
    '<div class="tp-steps" id="tp-steps"></div>' +
    '<div class="tp-voice" id="tp-voice"></div>' +
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
    TP.voiceEl = $q("#tp-voice");
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
  TP.setPlayBtn();
}

function closeProcess() {
  TP.on = false;
  if (!TP.el) return;
  TP.state = "idle";
  clearInterval(TP.iv);
  TP.el.style.display = "none";
}

function renderSteps() {
  var p = TREASURY_PROCESS[T3D.cur.id];
  TP.stepsEl.innerHTML = stepsHTML(p.steps);
  TP.artEl.textContent = p.name;
}

function setStepUI() {
  $qa("#tp-steps .tp-step").forEach(function (b, i) {
    b.classList.remove("now", "done");
    if (i < TP.idx) b.classList.add("done");
    if (i === TP.idx) b.classList.add("now");
  });
}

function applyStep(i) {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (i < 0 || i >= p.steps.length) return;
  TP.idx = i;
  TP.state = "idle";
  clearInterval(TP.iv);
  var st = p.steps[i];
  TP.voiceEl.innerHTML = '<span class="tp-vk">本步提要</span>' + (st.voice || "");
  TP.cardEl.innerHTML = '<span class="tp-k">' + (st.card ? st.card[0] : "") + "</span>" + (st.card ? st.card[1] : "");
  setStepUI();
  TP.progEl.style.width = "0%";
}

TP.setPlayBtn = function () {
  var b = TP.el && TP.el.querySelector('[data-p="play"]');
  if (b) b.textContent = TP.state === "playing" ? "暂停" : "自动播放";
};

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
  TP.state = "playing";
  TP.progEl.style.width = "0%";
  var t0 = Date.now();
  var bar = TP.progEl;
  var iv = setInterval(function () {
    if (TP.state !== "playing") { clearInterval(iv); return; }
    var k = Math.min(1, (Date.now() - t0) / TP.STEP_MS);
    bar.style.width = (k * 100) + "%";
    if (k >= 1) { clearInterval(iv); stepTimer(); }
  }, 80);
  TP.iv = iv;
  TP.setPlayBtn();
}

TP.done = function () {
  TP.state = "idle";
  TP.voiceEl.innerHTML = '<span class="tp-vk">成器</span>' + (T3D.cur.name + "：六道工序走完，器物始成。再点一次自动播放，可重看整条工艺链。");
  TP.cardEl.innerHTML = '<span class="tp-k">成器 · 六道齐备</span>从选泥到成器，每一步都有不可逆的火候与分寸——这正是非遗技艺“手与火”的分量。';
  TP.progEl.style.width = "100%";
  $qa("#tp-steps .tp-step").forEach(function (b) { b.classList.add("done"); b.classList.remove("now"); });
  TP.setPlayBtn();
};

TP.togglePlay = function () {
  if (TP.state === "playing") {
    TP.state = "idle";
    clearInterval(TP.iv);
  } else TP.play();
  TP.setPlayBtn();
};

TP.next = function () {
  var p = TREASURY_PROCESS[T3D.cur.id];
  if (!p) return;
  TP.state = "idle";
  clearInterval(TP.iv);
  var i = Math.min(TP.idx + 1, p.steps.length - 1);
  if (i === TP.idx) TP.done(); else applyStep(i);
  TP.setPlayBtn();
};

TP.prev = function () {
  if (TP.idx <= 0) { TP.go(0); return; }
  TP.state = "idle";
  clearInterval(TP.iv);
  applyStep(TP.idx - 1);
  TP.setPlayBtn();
};

TP.go = function (i) {
  TP.state = "idle";
  clearInterval(TP.iv);
  applyStep(i);
  TP.setPlayBtn();
};

TP.reset = function () {
  TP.state = "idle";
  clearInterval(TP.iv);
  TP.idx = 0;
  setStepUI();
  var p0 = TREASURY_PROCESS[T3D.cur.id].steps[0];
  TP.voiceEl.innerHTML = '<span class="tp-vk">本步提要</span>' + (p0.voice || "");
  TP.cardEl.innerHTML = '<span class="tp-k">' + p0.card[0] + "</span>" + p0.card[1];
  TP.progEl.style.width = "0%";
  TP.setPlayBtn();
};

/* 切换文物时同步 */
function onArtifactProcess() {
  if (!TP.on || !TP.el) return;
  if (!TREASURY_PROCESS[T3D.cur.id]) { closeProcess(); return; }
  TP.state = "idle";
  clearInterval(TP.iv);
  TP.idx = 0;
  renderSteps();
  applyStep(0);
  TP.setPlayBtn();
}

/* ---------- L3 知识模态 ---------- */
var KNOW = { veil: null };

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

function bindKnowEvents(veil) {
  veil.addEventListener("click", function (e) {
    var x = e.target.closest('[data-k="close"]');
    if (x || e.target === veil) closeKnow();
    var it = e.target.closest(".tk-item");
    if (it) {
      var on = it.classList.contains("on");
      $qa(".tk-item", veil).forEach(function (c) { c.classList.remove("on"); });
      if (!on) it.classList.add("on");
    }
  });
}

function openKnow() {
  var knowledge = TREASURY_KNOWLEDGE[T3D.cur.id];
  if (!knowledge) return;
  if (KNOW.veil && KNOW.veil.parentNode) KNOW.veil.parentNode.removeChild(KNOW.veil);
  var holder = document.createElement("div");
  holder.innerHTML = knowHTML(knowledge);
  var fresh = holder.firstChild;
  document.body.appendChild(fresh);
  KNOW.veil = fresh;
  bindKnowEvents(KNOW.veil);
  KNOW.veil.classList.add("open");
}

function closeKnow() {
  if (KNOW.veil) KNOW.veil.classList.remove("open");
}
