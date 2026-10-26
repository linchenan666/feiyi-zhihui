/* ============================================================
   非遗智汇 · 数据层
   data.js —— 数据与视图分离：本文件只放数据，不放逻辑
   招牌 25 项 · 内容基于公开的非遗名录公共资料整理
   标注 [待核] 的条目需逐条人工核对后移除标记
   ============================================================ */

var FEIYI_DATA = [
  {
    id: "yuju",
    embed: "https://player.bilibili.com/player.html?bvid=BV1yV411a7Va&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "豫剧",
    en: "Henan Opera",
    category: "戏曲",
    place: "郑州 · 全省流布",
    region: "郑州",
    level: "国家级非遗 · 2006 首批",
    img: "assets/yuju.jpg",
    replica: true,
    accent: "#B5402B",
    tagline: "流传最广的地方大戏之一，唱腔铿锵慷慨，乡土气息浓烈，有「中国第一大地方剧种」之称。",
    points: [
      "以中州音韵为基础，分豫东调、豫西调、祥符调、沙河调四大声腔流派",
      "经典剧目《花木兰》《穆桂英挂帅》《朝阳沟》家喻户晓",
      "「帅旦」行当与「马派」唱腔影响深远，常香玉「戏比天大」传为佳话",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "祥符调与开封的城市记忆——豫剧如何在汴梁茶馆里成形",
      "从「河南梆子」到「豫剧」：一个剧种的百年正名史",
      "抗美援朝时常香玉义演捐机：戏曲人的家国叙事"
    ],
    verify: [],
    rel: { genre: "戏曲", city: "郑州", kin: ["quju"] },
    qa: [
      { q: "豫剧为什么叫豫剧", a: "豫剧以河南（豫）为根据地、以中州音韵为唱腔基础，旧称河南梆子，20 世纪中叶逐渐统一定名「豫剧」。" },
      { q: "豫剧有哪些流派", a: "按声腔分豫东调、豫西调、祥符调、沙河调四大流派；按表演风格还有常、陈、崔、马、阎等名家流派。" },
      { q: "豫剧经典剧目有哪些", a: "《花木兰》《穆桂英挂帅》《朝阳沟》《程婴救孤》都是流传极广的代表作。" }
    ]
  },
  {
    id: "quju",
    embed: "https://player.bilibili.com/player.html?bvid=BV1LG411h7HP&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "曲剧",
    en: "Qu Opera",
    category: "戏曲",
    place: "洛阳 · 南阳一带",
    region: "洛阳",
    level: "国家级非遗 · 2006 首批",
    img: "assets/quju.jpg",
    replica: true,
    accent: "#8A7A5C",
    tagline: "河南第二大剧种，由「高跷曲」走上戏台，唱腔婉转如诉，长于演绎市井人情。",
    points: [
      "脱胎于洛阳、南阳一带的「高跷曲子」说唱艺术",
      "分「大调曲」「小调曲」两大体系，曲牌体唱腔细腻缠绵",
      "代表作《卷席筒》《陈三两》《李豁子离婚》深入民间",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "从踩高跷到登戏台：曲剧「三步上楼」的剧种演变",
      "曲剧与河南坠子共享的曲牌亲缘",
      "张新芳「曲剧皇后」的草根成名之路"
    ],
    verify: [],
    rel: { genre: "戏曲", city: "洛阳", kin: ["yuju"] },
    qa: [
      { q: "曲剧是怎么来的", a: "曲剧源于洛阳、南阳一带的高跷曲子，由地摊说唱逐步登上舞台，是河南第二大剧种。" },
      { q: "曲剧和豫剧的区别", a: "曲剧属曲牌体，唱腔婉转；豫剧属板腔体，唱腔铿锵。两者并称河南两大地方戏。" }
    ]
  },
  {
    id: "yuediao",
    embed: "",
    name: "越调",
    en: "Yuediao Opera",
    category: "戏曲",
    place: "周口 · 许昌（首批申报周口、2008 扩展许昌）",
    region: "周口",
    level: "国家级非遗 · 2006 首批（2008 许昌扩展）",
    img: "assets/yuediao.jpg",
    replica: true,
    accent: "#5E7A5A",
    tagline: "以「活诸葛」戏闻名中原的河南地方剧种，唱腔高亢质朴、以须生唱工戏见长，申凤梅一句「四千岁」唱红大江南北。",
    points: [
      "2006 年以周口市申报列入首批国家级非遗（序号 171，Ⅳ-27），2008 年许昌市列入第一批扩展项目",
      "唱腔高亢明快、朴实豪放，音乐兼具板式与曲牌，以须生唱工戏最具代表性",
      "申凤梅塑造的诸葛亮形象被誉为「活诸葛」，代表作《收姜维》《诸葛亮吊孝》",
      "主奏乐器四弦，乡土气息浓厚，与豫剧、曲剧并称河南三大地方剧种"
    ],
    deep: [
      "「活诸葛」申凤梅与越调的现代化之路",
      "从豫东地摊小戏到《收姜维》进京：越调的百年崛起",
      "越调须生「以唱塑人」的表演程式"
    ],
    verify: [],
    rel: { genre: "戏曲", city: "周口", kin: ["dapindiao"] },
    qa: [
      { q: "越调是什么", a: "越调是河南三大地方剧种之一，唱腔高亢朴实、音乐兼具板式与曲牌，以三国戏、尤其诸葛亮（须生）唱工戏著称，2006 年以周口市申报列入首批国家级非遗。" },
      { q: "越调和豫剧有什么区别", a: "越调以须生唱工戏见长，唱腔高亢明快、乡土气息浓；豫剧是板腔体大剧种，唱腔铿锵、流布更广。越调音乐兼收板式与曲牌，保留较多曲牌体成分。" },
      { q: "越调的代表作有哪些", a: "《收姜维》《诸葛亮吊孝》《李天宝娶亲》是越调经典，其中申凤梅主演的诸葛亮系列（「活诸葛」）影响最大。" }
    ],
    note: "国家级非遗名录（越调）：2006 年首批新增（序号 171，Ⅳ-27，申报周口市），2008 年第一批扩展（同序号，申报许昌市）。中国非物质文化遗产网 https://www.ihchina.cn/Article/Index/detail?id=13198"
  },
  {
    id: "dapindiao",
    embed: "",
    name: "大平调",
    en: "Dapingdiao Opera",
    category: "戏曲",
    place: "濮阳县（濮阳）· 滑县（安阳）· 延津县（新乡）",
    region: "濮阳",
    level: "国家级非遗 · 2006 首批",
    img: "assets/dapindiao.jpg",
    replica: true,
    accent: "#8A4632",
    tagline: "梆子声腔里最「大」的一支——大梆子、大铜器、大嗓门，黑脸红脸的袍带戏唱得黄土地震。",
    points: [
      "2006 年由濮阳县、滑县、延津县联合申报列入首批国家级非遗（序号 170，Ⅳ-26）",
      "因所用梆子特大、唱腔音调低平而得名「大平调」，又称大梆戏、大油梆",
      "以黑脸、红脸「袍带戏」见长，大铙、大镲、尖子号伴奏，气势雄浑粗犷",
      "保留较多梆子腔古老形态，有戏曲「活化石」之誉，流布豫北及鲁西南、冀南"
    ],
    deep: [
      "大平调的「大梆子」与古老梆子腔源流",
      "黑红脸戏里的中原英雄叙事",
      "豫鲁冀交界（濮阳、滑县、延津）的戏班生态与传承"
    ],
    verify: [],
    rel: { genre: "戏曲", city: "濮阳", kin: ["yuediao"] },
    qa: [
      { q: "大平调为什么叫大平调", a: "它的伴奏梆子比一般梆子腔更粗大，唱腔音调较低、节奏平稳，故称「大平调」，又叫大梆戏、大油梆。" },
      { q: "大平调主要唱什么", a: "以历史袍带戏为主，黑脸、红脸戏最具特色，代表作有《铡美案》《闯幽州》《白玉簪》等，风格粗犷豪迈，大铙大镲伴奏，气势雄浑。" },
      { q: "大平调流布在哪里", a: "主要在河南北部濮阳、滑县、延津及山东、河北交界一带，2006 年由河南三县联合申报入选首批国家级非遗。" }
    ],
    note: "国家级非遗名录（大平调）：2006 年首批新增（序号 170，Ⅳ-26，申报河南省濮阳县、滑县、延津县）。中国非物质文化遗产网 https://www.ihchina.cn/art/detail/id/13191.html"
  },
  {
    id: "zhuizi",
    embed: "https://player.bilibili.com/player.html?bvid=BV1eWpVe5EeM&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "河南坠子",
    en: "Henan Zhuizi",
    category: "曲艺",
    place: "全省流布 · 以郑汴为中心",
    region: "郑州",
    level: "国家级非遗 · 2006 首批",
    img: "assets/zhuizi.jpg",
    replica: true,
    accent: "#6B7A6A",
    tagline: "说唱相间的曲艺形式，一坠一简、一人千面，市井烟火尽在说唱之间。",
    points: [
      "主奏乐器坠琴（坠胡）为其定名由来",
      "艺人一手击简板、一手拉坠琴，自弹自唱",
      "长篇书目《包公案》《杨家将》流传甚广",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "坠胡与三弦的乐器流变考",
      "「书帽」（开篇小段）的叙事智慧",
      "从撂地卖艺到剧场书场：说书人的百年沉浮"
    ],
    verify: [],
    rel: { genre: "曲艺", city: "郑州", kin: ["majie"] },
    qa: [
      { q: "坠子为什么叫坠子", a: "因主奏乐器坠琴（坠胡）得名，艺人拉坠琴、打简板，说唱相间，形成独特韵味。" },
      { q: "河南坠子唱什么", a: "传统以长篇书目为主，如《包公案》《杨家将》，也有即兴编唱的小段。" }
    ]
  },
  {
    id: "dadiquzi",
    embed: "",
    name: "大调曲子",
    en: "Nanyang Dadiquzi",
    category: "曲艺",
    place: "南阳",
    region: "南阳",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/dadiquzi.jpg",
    replica: true,
    accent: "#63698A",
    tagline: "南阳盆地里的「曲中雅乐」，原称鼓子曲，三弦一拨、檀板轻敲，才子佳人尽在曲中。",
    points: [
      "2008 年以南阳市申报列入第二批国家级非遗（序号 762，Ⅴ-69）",
      "原称「鼓子曲」，由元明南北曲与中原民间小曲融合演变，属曲牌体说唱",
      "以三弦、古筝、琵琶、檀板伴奏，分大牌、小牌，唱腔典雅婉转",
      "传统为雅集坐唱，重唱功、讲字正腔圆，与河南曲剧同源异流"
    ],
    deep: [
      "大调曲子与河南曲剧的「同源分流」",
      "从「鼓子曲」到「大调曲子」的名称演变",
      "南阳曲坛的雅集传统与「曲友」文化"
    ],
    verify: [],
    rel: { genre: "曲艺", city: "南阳", kin: ["heluodagu"] },
    qa: [
      { q: "大调曲子是什么", a: "它是流行于南阳的曲牌体曲艺，原称鼓子曲，由元明南北曲与民间小曲融合演变，以三弦伴奏、坐唱为主，唱腔典雅，2008 年列入第二批国家级非遗。" },
      { q: "大调曲子和曲剧是什么关系", a: "二者同源：大调曲子是坐唱的曲艺，曲剧则是在其基础上走上舞台、化妆表演形成的戏曲，故有「同源异流」之说。" },
      { q: "大调曲子用什么伴奏", a: "主要用三弦，辅以古筝、琵琶、檀板，音乐典雅，重唱工，传统为文人雅集式坐唱。" }
    ],
    note: "国家级非遗名录（大调曲子）：2008 年第二批新增（序号 762，Ⅴ-69，申报河南省南阳市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/13702/"
  },
  {
    id: "heluodagu",
    embed: "",
    name: "河洛大鼓",
    en: "Heluo Dagu",
    category: "曲艺",
    place: "洛阳",
    region: "洛阳",
    level: "国家级非遗 · 2006 首批",
    img: "assets/heluodagu.jpg",
    replica: true,
    accent: "#8F6234",
    tagline: "一面书鼓、两片月牙钢板，洛阳说书人敲出河洛大地的金戈铁马与人情冷暖。",
    points: [
      "2006 年以洛阳市申报列入首批国家级非遗（序号 248，Ⅴ-12）",
      "清末由洛阳琴书与鼓儿词融合形成，因兴起于河洛地区而得名",
      "演员左手打月牙钢板、右手击书鼓，说唱相间，以中长篇大书为主",
      "唱腔高亢流畅、吐字清晰，《包公案》《三国》等长篇书目广为流传"
    ],
    deep: [
      "洛阳琴书与鼓书的合流：河洛大鼓的诞生",
      "钢板、书鼓与唱腔的「说书三件套」",
      "从豫西码头到现代书场的传承变迁"
    ],
    verify: [],
    rel: { genre: "曲艺", city: "洛阳", kin: ["dadiquzi"] },
    qa: [
      { q: "河洛大鼓是什么", a: "它是流行于洛阳一带的鼓书曲艺，艺人击书鼓、打月牙钢板说唱，清末由洛阳琴书与鼓儿词融合形成，2006 年列入首批国家级非遗。" },
      { q: "河洛大鼓用什么伴奏", a: "一面书鼓加两片月牙形钢板（鸳鸯板），演员左手执板、右手击鼓，自击自唱，节奏鲜明。" },
      { q: "河洛大鼓唱什么", a: "以中长篇历史大书为主，如《包公案》《三国》《水浒》，也有反映生活的小段，说唱相间。" }
    ],
    note: "国家级非遗名录（河洛大鼓）：2006 年首批新增（序号 248，Ⅴ-12，申报河南省洛阳市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/13608.html"
  },
  {
    id: "majie",
    embed: "https://player.bilibili.com/player.html?bvid=BV19KaY6FENH&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "马街书会",
    en: "Majie Storytelling Fair",
    category: "民俗",
    place: "平顶山 · 宝丰县马街村",
    region: "平顶山",
    level: "国家级非遗 · 2006 首批",
    img: "assets/majie.jpg",
    replica: true,
    accent: "#9A7B4F",
    tagline: "说书艺人的年度盛会：正月十三宝丰开棚，天作幕、地作台，千棚竞响。",
    points: [
      "每年农历正月十一至十三在宝丰马街村举行",
      "全国曲艺艺人负鼓携琴云集，说书会友、以书会友",
      "「一天能看千台戏，三天胜读万卷书」的民间盛景",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "书会上的「亮书」「写书」习俗与行规",
      "艺人负鼓行千里只为「会书」的江湖道义",
      "曲艺活态传承的田野样本"
    ],
    verify: [],
    rel: { genre: "民俗", city: "平顶山", kin: ["zhuizi", "dahuatie"] },
    qa: [
      { q: "马街书会是什么", a: "每年正月在河南宝丰马街村举行的曲艺盛会，全国说书艺人云集对棚献艺，已延续数百年。" },
      { q: "书会能干什么", a: "艺人「亮书」展示技艺，观众「写书」点唱，既是民间娱乐，也是曲艺传承的活现场。" }
    ]
  },
  {
    id: "taihao",
    embed: "",
    name: "太昊伏羲祭典",
    en: "Taihao Fuxi Sacrificial Rites",
    category: "民俗",
    place: "周口 · 淮阳太昊陵（与甘肃天水联合申报）",
    region: "周口",
    level: "国家级非遗 · 2006 首批",
    img: "assets/taihao.jpg",
    replica: true,
    accent: "#A9602B",
    tagline: "「天下第一陵」前的人祖盛会，淮阳朝祖会万众焚香，祭拜人文始祖伏羲。",
    points: [
      "2006 年由河南淮阳县与甘肃天水市联合申报列入首批国家级非遗（序号 485，Ⅹ-37）",
      "以太昊陵为核心，每年农历二月二至三月三举行「朝祖会」，俗称「人祖会」",
      "祭典含献爵、奠帛、读祝、乐舞等古礼，伏羲被尊为「定姓氏、制嫁娶、画八卦」的人文始祖",
      "与淮阳泥泥狗、布老虎及「担经挑」等庙会民俗共生，是规模最大的民间祭祖活动之一"
    ],
    deep: [
      "太昊陵「天下第一陵」与伏羲创世神话",
      "朝祖会的香火秩序与「担经挑」巫舞",
      "淮阳庙会与泥泥狗、布老虎的民俗共生"
    ],
    verify: [],
    rel: { genre: "民俗", city: "周口", kin: ["ninigou"] },
    qa: [
      { q: "太昊伏羲祭典是什么", a: "它是在河南周口淮阳太昊陵举行的祭祀人文始祖伏羲的传统仪典，2006 年由河南淮阳与甘肃天水联合申报，列入首批国家级非遗。" },
      { q: "朝祖会什么时候办", a: "每年农历二月二到三月三，淮阳太昊陵举行为期一个月的朝祖会，民间俗称「人祖会」，届时香火极盛、人潮如海。" },
      { q: "太昊陵在哪里", a: "太昊陵位于河南周口淮阳，传为伏羲氏定都与长眠之地，被称为「天下第一皇朝祖圣地」，即「天下第一陵」。" }
    ],
    note: "国家级非遗名录（太昊伏羲祭典）：2006 年首批新增（序号 485，Ⅹ-37，申报河南省淮阳县、甘肃省天水市）。中国非物质文化遗产网（河南）https://www.ihchina.cn/project_details/14991/"
  },
  {
    id: "junci",
    embed: "https://player.bilibili.com/player.html?bvid=BV1Ta4y1L7Sc&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "钧瓷",
    en: "Jun Ware",
    category: "技艺",
    place: "许昌 · 禹州神垕镇",
    region: "许昌",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/junci.jpg",
    replica: true,
    accent: "#7A4E5E",
    tagline: "以「入窑一色、出窑万彩」的窑变闻名，是宋五大名窑中唯一以「变」为美的瓷器。",
    points: [
      "产自许昌禹州神垕镇，窑火千年不断",
      "窑变釉色紫红蓝青交融，无两件完全相同",
      "「黄金有价钧无价」「家有万贯不如钧瓷一片」",
      "2008 年列入第二批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "铜红釉的偶然发现与「蚯蚓走泥纹」",
      "神垕古镇的千年窑火与「七十二座窑」传说",
      "当代钧瓷的艺术化转型与「入世」"
    ],
    verify: [],
    rel: { genre: "技艺", city: "许昌", kin: ["ruci"] },
    qa: [
      { q: "钧瓷为什么每件都不一样", a: "钧瓷在高温下窑变，釉色自然流动交融，烧成结果难以完全复制，所以「入窑一色，出窑万彩」。" },
      { q: "钧瓷产在哪里", a: "核心产地是河南禹州神垕镇，那里窑火延续千年，是钧瓷的故乡。" }
    ]
  },
  {
    id: "ruci",
    embed: "https://player.bilibili.com/player.html?bvid=BV1HdenzNEUH&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "汝瓷",
    en: "Ru Ware",
    category: "技艺",
    place: "宋代属汝州辖境，今窑址在宝丰清凉寺",
    region: "平顶山",
    level: "国家级非遗 · 2011 第三批",
    img: "assets/ruci.jpg",
    replica: true,
    accent: "#5E7A78",
    tagline: "以「雨过天青云破处」的天青釉著称，位列宋五大名窑之首，传世极罕。",
    points: [
      "产自宋代属汝州辖境，今窑址在宝丰清凉寺，为宋五大名窑之首",
      "釉色天青、釉面开片、香灰胎、芝麻钉支烧",
      "存世真品稀少，「纵有家财万贯，不如汝瓷一片」",
      "2011 年列入第三批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "清凉寺窑址与汝窑重光的考古故事",
      "「蟹爪纹」「蝉翼纹」的开片美学",
      "现代汝瓷复烧与「汝瓷新韵」"
    ],
    verify: [],
    rel: { genre: "技艺", city: "平顶山", kin: ["junci"] },
    qa: [
      { q: "汝瓷为什么珍贵", a: "汝瓷烧造时间短、传世稀少，天青釉色温润如玉，被视为宋瓷审美巅峰。" },
      { q: "汝瓷和钧瓷的区别", a: "汝瓷追求天青单色釉的含蓄之美，钧瓷则以多色窑变著称，两者都是河南宋瓷瑰宝。" }
    ]
  },
  {
    id: "sancai",
    embed: "https://player.bilibili.com/player.html?bvid=BV1wi4y1L7Lh&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "唐三彩",
    en: "Tang Sancai",
    category: "技艺",
    place: "洛阳",
    region: "洛阳",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/sancai.jpg",
    replica: true,
    accent: "#8A6D3B",
    tagline: "盛唐的釉陶名片，黄、绿、白三色交融、流光溢彩，以洛阳为盛。",
    points: [
      "以洛阳为中心的唐代低温釉陶工艺",
      "马、骆驼、人物俑造型雄浑大气",
      "「三彩」为多彩之泛称，色釉不止三种",
      "2008 年列入第二批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "唐三彩与丝路驼铃的贸易记忆",
      "出土与烧制的窑址考古",
      "现代洛阳仿唐三彩的工艺传承"
    ],
    verify: [],
    rel: { genre: "技艺", city: "洛阳", kin: ["shuixi"] },
    qa: [
      { q: "唐三彩是哪三彩", a: "「三彩」泛指多彩，常见黄、绿、白（或褐）釉色交融，实际釉色并不止三种。" },
      { q: "唐三彩有什么代表作", a: "三彩马、三彩骆驼、三彩人物俑最为经典，造型雄浑，体现了盛唐气象。" }
    ]
  },
  {
    id: "shuixi",
    embed: "https://player.bilibili.com/player.html?bvid=BV1VU411S7LN&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "真不同洛阳水席",
    en: "Luoyang Water Banquet",
    category: "技艺",
    place: "洛阳",
    region: "洛阳",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/shuixi.jpg",
    replica: true,
    accent: "#A33B2E",
    tagline: "「汤汤水水」的宴席艺术，二十四道菜如流水次第而上，酸辣鲜香。",
    points: [
      "始于唐代、盛于洛阳的「官席」遗风",
      "全席二十四道，以汤羹为主、道道带汤",
      "名菜「牡丹燕菜」以萝卜丝制「燕菜」，造型如牡丹",
      "2008 年列入国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "水席与武则天传说的文化层累",
      "「前八品、四镇桌、八中件、四扫尾」的上菜程式",
      "从官宴到市井的饮食记忆"
    ],
    verify: [],
    rel: { genre: "技艺", city: "洛阳", kin: ["sancai"] },
    qa: [
      { q: "洛阳水席为什么叫水席", a: "全席以汤羹为主、道道带汤，上菜如流水不断，故称水席。" },
      { q: "水席有几道菜", a: "传统水席共二十四道，讲究「前八品、四镇桌、八中件、四扫尾」的程式。" }
    ]
  },
  {
    id: "dangyangyu",
    embed: "",
    name: "当阳峪绞胎瓷",
    en: "Dangyangyu Twisted-body Porcelain",
    category: "技艺",
    place: "焦作 · 当阳峪窑群（修武、山阳一带）",
    region: "焦作",
    level: "国家级非遗 · 2014 第四批",
    img: "assets/dangyangyu.jpg",
    replica: true,
    accent: "#85755F",
    tagline: "多色瓷泥绞揉成胎，花纹由胎而生、表里如一，当阳峪窑烧出的「透花瓷」。",
    points: [
      "多色瓷泥（白、褐、灰）相绞揉叠成胎，花纹由胎而生、内外通透、表里如一",
      "又称「透花瓷」，瓷泥绞合后纹路如羽毛、席编、菊花，故名绞胎",
      "源于唐、兴于宋，以焦作当阳峪窑群为中心，可与定窑、磁州窑比肩",
      "2014 年以焦作市申报列入第四批国家级非遗（序号 1331，Ⅷ-217）"
    ],
    deep: [
      "绞胎瓷「表里如一」的绞泥工艺与三十余道工序",
      "当阳峪窑的绞胎、剔花、釉下彩绘谱系",
      "绞胎瓷的失传与复烧：成品率极低的柴窑难题"
    ],
    verify: [],
    rel: { genre: "技艺", city: "焦作", kin: ["junci", "ruci"] },
    qa: [
      { q: "什么是绞胎瓷", a: "绞胎瓷是把不同颜色的瓷泥绞揉在一起制成的瓷器，花纹由胎而生、内外通透，切开后表里纹路一致，故又称「透花瓷」，以焦作当阳峪窑最负盛名。" },
      { q: "绞胎瓷和钧瓷、汝瓷有什么不同", a: "汝瓷、钧瓷的美在釉色，绞胎瓷的美在胎体——花纹是瓷泥本身绞出来的，不是画在釉面上的，因此表里如一。" },
      { q: "绞胎瓷为什么珍贵", a: "绞胎需经三十多道工序，瓷泥绞合、拉坯、烧制都极易变形开裂，成品率很低，宋代以后一度失传，当代才复烧成功。" }
    ],
    note: "国家级非遗名录（当阳峪绞胎瓷烧制技艺）：2014 年第四批新增（序号 1331，Ⅷ-217，申报河南省焦作市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/14740.html"
  },
  {
    id: "xinyangmaojian",
    embed: "",
    name: "绿茶制作技艺（信阳毛尖茶制作技艺）",
    en: "Xinyang Maojian Tea",
    category: "技艺",
    place: "信阳 · 大别山、桐柏山北麓茶区",
    region: "信阳",
    level: "国家级非遗 · 2014 第四批扩展（绿茶制作技艺）",
    img: "assets/xinyangmaojian.jpg",
    replica: true,
    accent: "#66833F",
    tagline: "细圆紧直、白毫满披，生锅杀青、熟锅理条，一盏毛尖泡出大别山云雾。",
    points: [
      "分生锅、熟锅两锅：生锅高温杀青、熟锅做条理条，再经烘焙、拣剔，全凭手感",
      "干茶细圆紧直、白毫满披，冲泡后汤色嫩绿明亮、滋味鲜爽，俗称「细圆紧直多白毫」",
      "产于大别山、桐柏山北麓的信阳茶区，「五云两潭一寨」高山茶闻名",
      "2014 年以信阳市申报列入第四批国家级非遗扩展项目（绿茶制作技艺，序号 931，Ⅷ-148）"
    ],
    deep: [
      "生锅杀青与熟锅理条：毛尖「细圆紧直」的手上功夫",
      "信阳毛尖「白毫」的形成与高山云雾茶的品质",
      "从「淮南茶信阳第一」到中国传统制茶技艺入选人类非遗"
    ],
    verify: [],
    rel: { genre: "技艺", city: "信阳", kin: [] },
    qa: [
      { q: "信阳毛尖是怎么做出来的", a: "信阳毛尖属绿茶，经摊晾、生锅杀青、熟锅理条做条、烘焙、拣剔等工序制成，细圆紧直、白毫满披，2014 年作为「绿茶制作技艺」列入第四批国家级非遗扩展项目。" },
      { q: "信阳毛尖为什么有白毫", a: "白毫是茶叶嫩芽背面的天然茸毛，毛尖采的是细嫩芽头，加之手工理条不损茸毛，所以干茶满披白毫，是鲜嫩的标志。" },
      { q: "信阳毛尖产在哪里", a: "主要产于河南信阳大别山、桐柏山北麓的高山茶区，核心产区有「五云两潭一寨」之说，终年云雾、茶树生长缓慢、内含物质丰富。" }
    ],
    note: "国家级非遗名录（绿茶制作技艺·信阳毛尖茶制作技艺）：2014 年第四批扩展（序号 931，Ⅷ-148，申报河南省信阳市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/14615"
  },
  {
    id: "bianxiu",
    embed: "https://player.bilibili.com/player.html?bvid=BV11r4y1c7uz&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "汴绣",
    en: "Bian Embroidery",
    category: "美术",
    place: "开封",
    region: "开封",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/bianxiu.jpg",
    replica: true,
    accent: "#B05A7A",
    tagline: "源于宋绣，以针代笔、以线为墨，绣出宋韵之美。",
    points: [
      "产自开封，承北宋宫廷绣艺",
      "针法细腻多变，善绣名画与工笔花鸟",
      "宋代宫廷绣艺遗绪、中原名绣",
      "2008 年列入国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "宋徽宗「绣画」与宣和画院的渊源",
      "汴绣双面绣的针法绝技",
      "《清明上河图》绣品的数十年绣制历程"
    ],
    verify: [],
    rel: { genre: "美术", city: "开封", kin: ["zhuxian"] },
    qa: [
      { q: "汴绣有什么特点", a: "汴绣以针代笔、以线为墨，针法细密，尤其擅长再现名画与工笔花鸟的笔墨韵味。" },
      { q: "汴绣是哪里来的", a: "汴绣出自开封，承北宋宫廷绣艺而来，与开封的千年古都记忆紧密相连。" }
    ]
  },
  {
    id: "zhuxian",
    embed: "https://player.bilibili.com/player.html?aid=584884780&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "朱仙镇年画",
    en: "Zhuxian New Year Pictures",
    category: "美术",
    place: "开封 · 朱仙镇",
    region: "开封",
    level: "国家级非遗 · 2006 首批",
    img: "assets/zhuxian.jpg",
    replica: true,
    accent: "#B03A2E",
    tagline: "素有「木版年画鼻祖」之称，刀刻线劲、色彩浓烈，门神一对镇守千年。",
    points: [
      "产自开封朱仙镇，北宋即已兴盛",
      "以梨木板雕刻、矿物颜料套印",
      "门神（秦琼、尉迟恭）为经典题材",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "年画与「门神」民俗的心理密码",
      "朱仙镇木版雕刻与年画刻版的亲缘",
      "濒危边缘的抢救与「年画重回春节」"
    ],
    verify: [],
    rel: { genre: "美术", city: "开封", kin: ["bianxiu"] },
    qa: [
      { q: "朱仙镇年画为什么有名", a: "它素有「木版年画鼻祖」之称，北宋时已兴盛，刀刻刚劲、色彩浓烈，门神题材影响深远。" },
      { q: "年画上为什么常贴门神", a: "门神秦琼、尉迟恭源自唐代传说，贴门神寓意镇宅辟邪、祈福纳祥。" }
    ]
  },
  {
    id: "nigugu",
    embed: "https://player.bilibili.com/player.html?bvid=BV1AA411j7pw&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "浚县泥咕咕",
    en: "Xunxian Clay Whistles",
    category: "美术",
    place: "鹤壁 · 浚县杨玘屯村",
    region: "鹤壁",
    level: "国家级非遗 · 2006 首批",
    img: "assets/nigugu.jpg",
    replica: true,
    accent: "#4A4A4A",
    tagline: "会「唱歌」的泥玩具，一吹即响，憨朴造型里藏着黄河岸边的童年。",
    points: [
      "产自鹤壁浚县杨玘屯村",
      "黑底彩绘、点线纹样，造型以鸟兽人物为主",
      "因能吹出「咕咕」声而得名",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "泥咕咕与隋末「黎阳仓」军情哨的传说",
      "浚县正月古庙会与泥玩具的共生",
      "黄河泥塑的土性美学"
    ],
    verify: [],
    rel: { genre: "美术", city: "鹤壁", kin: ["ninigou"] },
    qa: [
      { q: "泥咕咕为什么叫咕咕", a: "泥哨内部中空、开有气孔，一吹就发出咕咕的声响，因此得名。" },
      { q: "泥咕咕是什么做的", a: "用黄河边特有的胶泥捏制、烧制，再以黑底彩绘装饰，是豫北最具代表性的泥玩具。" }
    ]
  },
  {
    id: "ninigou",
    embed: "https://player.bilibili.com/player.html?bvid=BV1ox411M7Wc&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "淮阳泥泥狗",
    en: "Huaiyang Clay Dogs",
    category: "美术",
    place: "周口 · 淮阳太昊陵一带",
    region: "周口",
    level: "国家级非遗 · 2014 第四批",
    img: "assets/ninigou.jpg",
    replica: true,
    accent: "#3E3A34",
    tagline: "太昊陵庙会上的「活化石」泥塑，黑底彩纹、造型神秘。",
    points: [
      "产自周口淮阳太昊陵一带，与伏羲庙会相伴",
      "黑底上点绘白、红、黄、绿纹样",
      "造型多为人面兽、九头鸟等远古意象",
      "2014 年列入国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "泥泥狗与伏羲图腾崇拜的解读",
      "「草帽老虎」「人祖猴」的符号密码",
      "庙会经济与非遗传承的当代互动"
    ],
    verify: [],
    rel: { genre: "美术", city: "周口", kin: ["nigugu"] },
    qa: [
      { q: "泥泥狗是什么", a: "淮阳太昊陵庙会上的黑底彩绘泥塑，造型神秘古朴，被视为远古图腾崇拜的遗存。" },
      { q: "泥泥狗和泥咕咕像吗", a: "同属河南民间泥塑，但泥泥狗黑底彩纹、造型抽象神秘，泥咕咕以可吹响的鸟兽玩具见长。" }
    ]
  },
  {
    id: "lingbaojianzhi",
    embed: "",
    name: "剪纸（灵宝剪纸）",
    en: "Lingbao Paper-cutting",
    category: "美术",
    place: "三门峡 · 灵宝",
    region: "三门峡",
    level: "国家级非遗 · 2008 第二批扩展（剪纸）",
    img: "assets/lingbaojianzhi.jpg",
    replica: true,
    accent: "#B8392E",
    tagline: "朱红团花、粗犷如汉画像石，灵宝人把窗花喜花剪成了豫西大地的千年祈愿。",
    points: [
      "品类有窗花、喜花、团花、礼花等，逢春节、婚娶、寿庆张贴于窗棂、门楣、箱柜",
      "线条粗犷浑厚、造型夸张，保留近似汉代画像石的古拙风格",
      "灵宝地处豫晋陕交界，剪纸兼融中原、关中、晋南的题材与刀法",
      "2008 年以灵宝市申报列入第二批国家级非遗扩展项目（剪纸，序号 315，Ⅶ-16）"
    ],
    deep: [
      "灵宝剪纸的「团花」结构与阴阳刻技法",
      "窗花、喜花里的祈子、纳吉、避邪符号体系",
      "豫晋陕交界剪纸带：灵宝与中阳、库车等剪纸的谱系比较"
    ],
    verify: [],
    rel: { genre: "美术", city: "三门峡", kin: ["zhenpingyudiao"] },
    qa: [
      { q: "灵宝剪纸有什么特点", a: "灵宝剪纸属黄河流域剪纸，以窗花、喜花、团花为主，朱红单色，线条粗犷浑厚、造型夸张，保留了近汉代画像石的古拙风格，2008 年作为「剪纸」列入第二批国家级非遗扩展项目。" },
      { q: "灵宝剪纸什么时候贴", a: "春节时贴窗花、门笺，婚娶时贴喜花、团花，寿庆时贴礼花，把对五谷丰登、人丁兴旺、避邪纳福的愿望剪进红纸。" },
      { q: "灵宝剪纸为什么有汉画像石的味道", a: "灵宝地处豫晋陕交界，深受中原、关中文化影响，其剪纸线条厚重、构图饱满，与当地出土的汉代画像石、砖雕在审美上一脉相承。" }
    ],
    note: "国家级非遗名录（剪纸·灵宝剪纸）：2008 年第二批扩展（序号 315，Ⅶ-16，申报河南省灵宝市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/13959.html"
  },
  {
    id: "zhenpingyudiao",
    embed: "",
    name: "玉雕（镇平玉雕）",
    en: "Zhenping Jade Carving",
    category: "美术",
    place: "南阳 · 镇平石佛寺（中华玉都）",
    region: "南阳",
    level: "国家级非遗 · 2008 第二批（玉雕）",
    img: "assets/zhenpingyudiao.jpg",
    replica: true,
    accent: "#4F7A6D",
    tagline: "六千年独山玉，巧施俏色、化瑕为瑜，镇平玉雕刀下见山水。",
    points: [
      "以南阳独山玉为主要原料，独山玉色泽斑斓、质地坚韧，当地玉雕史可追溯至新石器时代",
      "长于俏色、透雕、镂雕，讲究因材施艺、化瑕为瑜，把玉料瑕疵转化为点睛之笔",
      "镇平石佛寺是全国知名玉雕集散地，有「中华玉都」之称，从业人员众多",
      "2008 年以镇平县申报列入第二批国家级非遗（玉雕，序号 833，Ⅶ-57），与北京、苏州、广州玉雕同批"
    ],
    deep: [
      "独山玉「玉色斑斓」与「俏色」设计的逻辑",
      "镇平玉雕的「化瑕为瑜」：镂雕、透雕、链子活技法",
      "从石佛寺到「中华玉都」：一个县域玉雕产业的传承生态"
    ],
    verify: [],
    rel: { genre: "美术", city: "南阳", kin: ["lingbaojianzhi"] },
    qa: [
      { q: "镇平玉雕用什么玉", a: "镇平玉雕主要用南阳独山玉，独山玉是中国四大名玉之一，玉色丰富、质地坚韧，当地琢玉史可追溯到新石器时代，2008 年镇平玉雕列入第二批国家级非遗。" },
      { q: "什么是俏色和化瑕为瑜", a: "俏色是顺着玉料天然的颜色、纹理来设计；化瑕为瑜是把玉料上的瑕疵、杂色巧妙雕琢成画面中合理的一部分，甚至成为亮点，是镇平玉雕的核心功力。" },
      { q: "镇平玉雕的规模有多大", a: "南阳镇平石佛寺一带是全国知名的玉雕加工和集散地，有「中华玉都」之称，玉雕从业人数众多，形成了从开采、设计、加工到销售的完整链条。" }
    ],
    note: "国家级非遗名录（玉雕·镇平玉雕）：2008 年第二批新增（序号 833，Ⅶ-57，申报河南省镇平县）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/14127.html"
  },
  {
    id: "shaolin",
    embed: "https://player.bilibili.com/player.html?bvid=BV19d4y1d7fJ&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "少林功夫",
    en: "Shaolin Kung Fu",
    category: "体育",
    catFull: "传统体育、游艺与杂技",
    place: "郑州 · 登封嵩山少林寺",
    region: "郑州",
    level: "国家级非遗 · 2006 首批",
    img: "assets/shaolin.jpg",
    replica: true,
    accent: "#4E5B4E",
    tagline: "禅武合一，拳禅一体，动静之间是千年的少林寺。",
    points: [
      "发源于登封嵩山少林寺",
      "体系庞大，拳械套路数百种",
      "「天下功夫出少林」，名扬海内外",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "达摩与《易筋经》的传说与考据",
      "少林七十二艺与武僧团的历史",
      "从「寺内秘传」到「功夫全球化」"
    ],
    verify: [],
    rel: { genre: "体育", city: "郑州", kin: ["taiji"] },
    qa: [
      { q: "少林功夫的特点", a: "以禅武合一为核心，拳械套路体系庞大，讲究刚猛有力、朴实无华。" },
      { q: "少林功夫在哪里", a: "发源于河南登封嵩山少林寺，是「天下功夫出少林」之说中的少林。" }
    ]
  },
  {
    id: "taiji",
    embed: "https://player.bilibili.com/player.html?bvid=BV14FCgBLEzB&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "陈氏太极拳",
    en: "Chen-style Taijiquan",
    category: "体育",
    place: "焦作 · 温县陈家沟",
    region: "焦作",
    level: "国家级非遗 · 2006 首批",
    img: "assets/taiji.jpg",
    replica: true,
    accent: "#5A6B72",
    tagline: "以缠丝劲为核心，阴阳开合，是太极拳诸流派的源头。",
    points: [
      "发源于焦作温县陈家沟",
      "由陈王廷创编于明末清初",
      "杨、武、吴、孙诸派皆源于陈氏",
      "2006 年列入首批国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "陈王廷「创拳」与《拳经总歌》",
      "陈家沟「四大金刚」与当代传承",
      "太极拳从村庄走向世界的文化密码"
    ],
    verify: [],
    rel: { genre: "体育", city: "焦作", kin: ["shaolin"] },
    qa: [
      { q: "太极拳是陈家沟发明的吗", a: "陈氏太极拳由陈王廷在明末清初创编于温县陈家沟，其他主要流派多源于陈氏。" },
      { q: "陈氏太极的特点", a: "以缠丝劲为核心，快慢相间、刚柔并济，保留了古老的发力与技击内容。" }
    ]
  },
  {
    id: "dongbeizhuang",
    embed: "",
    name: "东北庄杂技",
    en: "Dongbeizhuang Acrobatics",
    category: "体育",
    catFull: "传统体育、游艺与杂技",
    place: "濮阳 · 岳村镇东北庄",
    region: "濮阳",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/dongbeizhuang.jpg",
    replica: true,
    accent: "#BC7430",
    tagline: "与河北吴桥并称「南北杂技两故里」，草帽、晃板、顶碗之间，是豫北乡野的硬功夫。",
    points: [
      "濮阳市岳村镇东北庄与河北吴桥并称「南北杂技两故里」，杂技传承可追溯至清代",
      "清代乔家班等杂技班社辈出，东北庄素有「杂技之乡」的声誉",
      "草帽、晃板、排椅、顶碗等节目融武术、气功于杂技，惊险与灵巧并重",
      "2008 年以濮阳市申报列入第二批国家级非遗（序号 821，Ⅵ-49）"
    ],
    deep: [
      "东北庄「乔家班」与南北杂技两故里的历史",
      "晃板、顶碗、排椅：民间杂技的道具与力学",
      "从撂地卖艺到舞台杂技：豫北乡村的活态传承"
    ],
    verify: [],
    rel: { genre: "体育", city: "濮阳", kin: ["shaolin"] },
    qa: [
      { q: "东北庄杂技是什么", a: "东北庄杂技是河南濮阳岳村镇东北庄村的民间杂技，与河北吴桥并称「南北杂技两故里」，清代乔家班等班社闻名，以草帽、晃板、排椅、顶碗等节目见长，2008 年列入第二批国家级非遗。" },
      { q: "东北庄和吴桥什么关系", a: "两地同属中国杂技重要发源地，民间有「南北杂技两故里」之称，吴桥在河北、东北庄在河南濮阳，都曾班社林立、名家辈出。" },
      { q: "东北庄杂技有哪些绝活", a: "常见节目有晃板、顶碗、排椅、车技、草帽飞舞等，许多动作融合武术与气功功底，强调稳、准、险。" }
    ],
    note: "国家级非遗名录（东北庄杂技）：2008 年第二批新增（序号 821，Ⅵ-49，申报河南省濮阳市）。中国非物质文化遗产网 https://www.ihchina.cn/project_details/13859.html"
  },
  {
    id: "dahuatie",
    embed: "https://player.bilibili.com/player.html?bvid=BV1JPrLYDEXP&page=1&high_quality=1&danmaku=0&autoplay=1",
    name: "确山铁花",
    en: "Iron Flower Show",
    category: "民俗",
    place: "驻马店 · 确山县",
    region: "驻马店",
    level: "国家级非遗 · 2008 第二批",
    img: "assets/dahuatie.jpg",
    replica: true,
    accent: "#C2702D",
    tagline: "「火树银花不夜天」的民间绝技，千度铁水击上长空，化作漫天金雨。",
    points: [
      "源于确山县，相传已有千年历史",
      "以木板击打千度铁水，铁花四溅如瀑",
      "多在元宵等节庆上演，场面惊险壮美",
      "2008 年列入国家级非物质文化遗产代表性项目名录"
    ],
    deep: [
      "铁花与冶炼业祭拜太上老君的行业信仰",
      "「打花打花，越打越发」的吉祥寓意",
      "从濒临失传到景区夜演的复兴之路"
    ],
    verify: [],
    rel: { genre: "民俗", city: "驻马店", kin: ["majie"] },
    qa: [
      { q: "打铁花是怎么打的", a: "匠人将千度铁水抛向空中，用木板击打，铁水迸溅成漫天金色火花，蔚为壮观。" },
      { q: "打铁花危险吗", a: "这是高风险绝技，对艺人技艺要求极高，如今多在专业保护措施下于节庆展演。" }
    ]
  }
];

/* 门类定义（用于总览筛选与图谱着色） */
var FEIYI_CATEGORIES = [
  { id: "戏曲", label: "戏曲", en: "Opera", desc: "唱念做打，一腔一调皆是史" },
  { id: "曲艺", label: "曲艺", en: "Storytelling", desc: "说唱相间，一人一琴一台戏" },
  { id: "技艺", label: "技艺", en: "Craft", desc: "水火土金，匠心入物成奇珍" },
  { id: "美术", label: "美术", en: "Fine Art", desc: "刀笔针彩，方寸之间见乾坤" },
  { id: "体育", label: "体育", en: "Martial Arts", desc: "身心合一，动静之间蕴大道" },
  { id: "民俗", label: "民俗", en: "Folk Custom", desc: "岁时节庆，烟火人间传千年" }
];

/* 河南地级市坐标（用于地图标点，SVG viewBox 0 0 100 100 的近似比例位置） */
var HENAN_CITIES = {
  "郑州":   { x: 54, y: 46 },
  "洛阳":   { x: 42, y: 50 },
  "开封":   { x: 63, y: 45 },
  "许昌":   { x: 53, y: 58 },
  "平顶山": { x: 47, y: 64 },
  "鹤壁":   { x: 58, y: 24 },
  "周口":   { x: 65, y: 66 },
  "焦作":   { x: 49, y: 34 },
  "驻马店": { x: 56, y: 76 },
  "南阳":   { x: 40, y: 75 },
  "濮阳":   { x: 70, y: 22 },
  "信阳":   { x: 57, y: 88 },
  "三门峡": { x: 27, y: 46 }
};

/* 知识图谱节点与连边：项目—门类、项目—地域、项目—项目（亲缘） */
var GRAPH_KIN = {
  "yuju":   ["quju"],
  "quju":   ["yuju"],
  "zhuizi": ["majie"],
  "majie":  ["zhuizi", "dahuatie"],
  "junci":  ["ruci", "dangyangyu"],
  "ruci":   ["junci", "dangyangyu"],
  "sancai": ["shuixi"],
  "shuixi": ["sancai"],
  "bianxiu":["zhuxian"],
  "zhuxian":["bianxiu"],
  "nigugu": ["ninigou"],
  "ninigou":["nigugu","taihao"],
  "shaolin":["taiji", "dongbeizhuang"],
  "taiji":  ["shaolin"],
  "dahuatie":["majie"],
  "yuediao":["dapindiao"],
  "dapindiao":["yuediao"],
  "dadiquzi":["heluodagu"],
  "heluodagu":["dadiquzi"],
  "taihao":["ninigou"],
  "dangyangyu":["junci","ruci"],
  "xinyangmaojian":[],
  "lingbaojianzhi":["zhenpingyudiao"],
  "zhenpingyudiao":["lingbaojianzhi"],
  "dongbeizhuang":["shaolin"]
};

/* ============================================================
   内置知识库（离线问答）
   —— 无 API key 阶段的演示主力；接入豆包/千问时由 app.js
   的 FETCH_REMOTE_ANSWER 钩子接管，见 app.js 顶部配置
   ============================================================ */
var KB_GLOBAL = [
  {
    q: "什么是非物质文化遗产",
    keywords: ["什么是非遗", "非遗是什么", "非物质文化遗产", "非遗"],
    a: "非物质文化遗产指各族人民世代相传、与生活密切相关的传统文化表现形式，包括口头传统、表演艺术、传统技艺、民俗节庆、传统体育等。中国通过《非物质文化遗产法》和代表性项目名录制度进行保护，联合国教科文组织《保护非物质文化遗产公约》是其国际框架。"
  },
  {
    q: "河南有多少项国家级非遗",
    keywords: ["多少", "几项", "数量", "国家级非遗", "河南"],
    a: "河南省已公布的国家级非物质文化遗产代表性项目超过一百项（以文化和旅游部历批公布为准）。本展厅招牌深挖 25 项，覆盖戏曲、曲艺、技艺、美术、体育、民俗六大门类，更多项目正在陆续收录。"
  },
  {
    q: "第一次来，推荐先看什么",
    keywords: ["推荐", "先看", "第一次", "入门", "必看"],
    a: "建议从视觉冲击最强的开始：看「打铁花」的漫天金雨，再看「钧瓷」的入窑一色、出窑万彩，然后走进「豫剧」听一嗓子慷慨梆子腔。如果想安静，就细看「汝瓷」的天青釉和「汴绣」的一针一线。展厅总览里有完整分类，随兴趣走即可。"
  },
  {
    q: "非遗为什么值得保护",
    keywords: ["为什么", "保护", "值得", "重要", "意义"],
    a: "非遗承载着一个地方的历史记忆、审美传统与生活智慧，是活着的文化基因。它一旦失传就不可再生。保护非遗，本质上是在保护我们「从哪里来」的答案，也让传统在当代继续生长。"
  },
  {
    q: "本次赛事是什么",
    keywords: ["Vibe Coding", "比赛", "赛事", "挑战赛", "参赛"],
    a: "本展厅是为「全国高校 Vibe Coding 开发挑战赛」打造的参赛作品，探索「AI 写代码、人类引导意图」的全新开发范式——一个能看、能问、能关联、能沉浸的河南非遗 智能数字展厅。"
  },
  {
    q: "这个展厅是怎么做出来的",
    keywords: ["怎么做的", "怎么做", "技术", "开发", "制作", "架构"],
    a: "展厅采用原生 HTML/CSS/JS 构建，数据与视图分离（data.js 管数据、app.js 管逻辑），纯本地运行、零上传、无第三方脚本。AI 讲解层采用「内置知识库 + 预留大模型 API」的双层架构：离线可用，接入豆包/千问 API 后即切换在线大模型回答。"
  }
];

/* 补充：单项内关键词匹配（qa 已挂在每项上），这里汇总成扁平索引 */
var KB_ITEMS = [];
(function () {
  FEIYI_DATA.forEach(function (item) {
    item.qa.forEach(function (pair) {
      KB_ITEMS.push({
        itemId: item.id,
        itemName: item.name,
        q: pair.q,
        keywords: [item.name].concat(pair.q.split(/[，。？、\s]/)).filter(function (s) { return s.length > 1; }),
        a: pair.a
      });
    });
  });
})();

var KB_ALL = KB_GLOBAL.concat(KB_ITEMS);

/* 展品主题氛围（M8.36 新增）：每件展品一页一世界 —— bg=主题渐变 / mark=水印字 / tint=强调色 */
var ITEM_THEME = {
  yuju:     { bg: "linear-gradient(160deg,#3A1210 0%,#7A241C 45%,#2B0E0C 100%)", mark: "戏", tint: "#E8B04B" },
  quju:     { bg: "linear-gradient(160deg,#12202E 0%,#2A4156 45%,#0E1720 100%)", mark: "曲", tint: "#9FC0D8" },
  zhuizi:   { bg: "linear-gradient(160deg,#241B12 0%,#4A3825 45%,#1A130C 100%)", mark: "坠", tint: "#D8BC8A" },
  majie:    { bg: "linear-gradient(160deg,#3A2C14 0%,#6B5428 45%,#2A2010 100%)", mark: "书", tint: "#E8D19A" },
  junci:    { bg: "linear-gradient(160deg,#24101C 0%,#5E2840 38%,#B05538 72%,#1C0C18 100%)", mark: "窑", tint: "#E8A06B" },
  ruci:     { bg: "linear-gradient(160deg,#0E2028 0%,#28505E 45%,#0A1820 100%)", mark: "青", tint: "#9CC8D0" },
  sancai:   { bg: "linear-gradient(160deg,#1A2818 0%,#3E5E32 35%,#A86A38 68%,#331C18 100%)", mark: "彩", tint: "#D8C08A" },
  shuixi:   { bg: "linear-gradient(160deg,#241A10 0%,#5E4A30 45%,#1E150C 100%)", mark: "席", tint: "#E8CE9A" },
  bianxiu:  { bg: "linear-gradient(160deg,#2A1226 0%,#5E2A4E 45%,#1C0E1A 100%)", mark: "绣", tint: "#D8A0C0" },
  zhuxian:  { bg: "linear-gradient(160deg,#3A1410 0%,#96301E 45%,#14305A 100%)", mark: "画", tint: "#F0C060" },
  nigugu:   { bg: "linear-gradient(160deg,#33200F 0%,#6B4523 45%,#241608 100%)", mark: "泥", tint: "#E0B878" },
  ninigou:  { bg: "linear-gradient(160deg,#0E0C10 0%,#2E2430 45%,#120E14 100%)", mark: "灵", tint: "#E8C8A0" },
  shaolin:  { bg: "linear-gradient(160deg,#2E2410 0%,#6B5428 45%,#201A0C 100%)", mark: "禅", tint: "#E8C878" },
  taiji:    { bg: "linear-gradient(160deg,#141414 0%,#3A3A3A 45%,#0E0E0E 100%)", mark: "道", tint: "#C8C8C8" },
  dahuatie: { bg: "linear-gradient(160deg,#0A1226 0%,#1A2E52 45%,#0A0E1A 100%)", mark: "火", tint: "#F0A050" },
  yuediao:   { bg: "linear-gradient(160deg,#1A2418 0%,#3E5240 45%,#121A10 100%)", mark: "越", tint: "#A8C0A0" },
  dapindiao: { bg: "linear-gradient(160deg,#241210 0%,#5E3024 45%,#180C0A 100%)", mark: "梆", tint: "#D8A088" },
  dadiquzi:  { bg: "linear-gradient(160deg,#181A28 0%,#3E4260 45%,#10121C 100%)", mark: "曲", tint: "#B0B8D8" },
  heluodagu: { bg: "linear-gradient(160deg,#241A10 0%,#5E4022 45%,#181008 100%)", mark: "鼓", tint: "#E0BC8A" },
  taihao:    { bg: "linear-gradient(160deg,#281808 0%,#7A4620 48%,#1C1004 100%)", mark: "羲", tint: "#F0C888" },
  dangyangyu: { bg: "linear-gradient(160deg,#221D16 0%,#5E5240 45%,#141008 100%)", mark: "绞", tint: "#C4B49A" },
  xinyangmaojian: { bg: "linear-gradient(160deg,#161F10 0%,#3E5528 45%,#0E1408 100%)", mark: "茶", tint: "#B0C888" },
  lingbaojianzhi: { bg: "linear-gradient(160deg,#26100E 0%,#7A2A22 45%,#180808 100%)", mark: "剪", tint: "#E89088" },
  zhenpingyudiao: { bg: "linear-gradient(160deg,#101E1A 0%,#345248 45%,#081210 100%)", mark: "玉", tint: "#98C0B0" },
  dongbeizhuang: { bg: "linear-gradient(160deg,#241808 0%,#7A4E20 45%,#160E04 100%)", mark: "技", tint: "#E8B078" }
};

/* 沉浸演绎 · 本地权威视频清单（由 scan_videos.py 扫描 assets/video 自动生成；也可手工登记 "id":"路径"） */
var HALL_VIDEOS = {

};
