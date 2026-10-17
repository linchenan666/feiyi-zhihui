# 非遗智汇 · 河南非遗 智能数字展厅

> 全国高校 Vibe Coding 开发挑战赛 · B 组参赛作品
> 选题方向 #5「AI 驱动的高交互教育与可视化」：非遗文化教育/传承的可视化 + AI 交互
> 纯本地 · 零上传 · 零后端 · 双击即运行

把非遗讲给你听——一个「能看、能问、能关联、能生成、能沉浸」的河南非遗 智能数字展厅。**离线优先**：内置知识库离线问答永不掉线，预留豆包/千问大模型接口（填 key 即用）。

**文档目录**：一、解决的问题 · 二、功能模块 · 三、代码仓库 · 四、[10 分钟极速复现指南](#四10-分钟极速复现指南)（[4.1 环境要求](#41-环境要求) / [4.2 运行](#42-运行) / [4.3 依赖清单](#43-依赖清单) / [4.4 环境变量模板](#44-环境变量模板可选接入在线大模型)） · 五、[目录结构](#五目录结构) · 六、演进记录 · 七、技术要点 · 八、赛事信息 · 九、[图片来源与许可声明](#九图片来源与许可声明)

---

## 一、项目解决什么问题

**痛点**：非遗知识散落在官方名录、地方志与短视频里——难查、看不懂、没兴趣，大众缺少一个"能问、能玩、能关联"的数字入口。

**产品闭环**：被美打动 → 选中一项非遗读进去 → 问·AI 离线问答深挖 → 收藏 → 生成文创海报分享。

**真实数据**：15 项招牌非遗（覆盖 6 大门类、落在 9 个地市），每项含要点、深挖方向、待核清单与知识库问答；内容基于国家级非遗名录与公开资料核对。

## 二、功能模块（10 视图 + 使用说明）

| # | 视图 | 能力 |
|---|------|------|
| 1 | 首页 | 水墨长卷主视觉 + 数据指标 + 第一人称「作者的话」+ **演进馆直达入口** |
| 2 | 展品总览 | 15 项珍宝卡片，门类 / 已收藏筛选，**收藏清单一键导出复制** |
| 3 | 详情页 | **一页一世界**：每件展品一个主题氛围；要点 / 深挖 / 待核 / 关联 / 收藏 |
| 4 | 非遗地图 | 写实河南 SVG 地图，9 城标点 + 放大模态 + 悬浮聚焦单显 |
| 5 | 城市介绍 | 中原十八城：城市卡片 + 地标实拍 + 非遗角标，点进看城市详情 |
| 6 | 知识图谱 | 力导向图：项目 ↔ 门类 ↔ 城市 + 亲缘连边；滚轮 / 中心缩放、聚焦 |
| 7 | 问·AI | 内置离线知识库问答（**永不掉线**），多轮上下文（指代追问），思考状态 + 流式回答；预留豆包/千问接口填 key 即用 |
| 8 | 文创生成 | 本地算法合成 4 风格海报（水墨 / 朱砂 / 描金 / 拓印），下载 PNG、复制分享文案 |
| 9 | 沉浸演绎 | 夜戏台光影轮播，左右箭头 / 键盘 ←→ 切换，可全屏 |
| 10 | 演进馆 | 12 轮 AI 协同迭代时间轴：关键 Prompt / 协作要点 / 引导修复，评委一键复现 |

另有：**图文使用说明**（首页浮层，10 个模块可点击进图文详解、跳转对应页面）、宣纸 / 墨夜双主题、收藏持久化（localStorage）、无障碍（键盘可达、reduced-motion 兜底）。

## 三、代码仓库（Public）

> 托管平台：GitHub（Public）
>
> 仓库地址：https://github.com/linchenan666/feiyi-zhihui

演进保证：完整细粒度 Git 提交历史（**95 次**，每次对应一次 AI 核心对话或一个功能模块），
禁止一次 initial commit 堆完全部功能——本仓库逐模块提交，评委可逐条对照 docs/Prompt历史.md 复核。

---
## 四、10 分钟极速复现指南

### 4.0 标准复现路径（评委推荐，clone 后三步走）

仓库**不含**打包产物（`dist/` 已在 `.gitignore` 中），clone 下来需先跑一次打包脚本，一条命令即可生成单文件：

```bash
# 1. 克隆（或下载 ZIP 解压）
git clone https://github.com/linchenan666/feiyi-zhihui.git
cd feiyi-zhihui

# 2. 一条命令打包（纯 Python 标准库，无需 pip、无需联网）
py -3 scripts/bundle_single.py          # Windows
# python3 scripts/bundle_single.py      # macOS / Linux

# 3. 双击打开产物
dist/非遗智汇·多彩面板版.html
```

正常输出末尾应看到：

```
[6/6] OK: dist\非遗智汇·多彩面板版.html (约 34-35 MB)
打包完成。
```

打包脚本幂等：同一份源码重复运行，产物字节一致（不写时间戳、不写随机数），可反复验证。

### 4.1 环境要求

| 项 | 要求 |
|----|------|
| 操作系统 | Windows / macOS / Linux 任一 |
| Python | **3.8 及以上**（仅打包脚本需要；本机 Python 3.14 验证通过，只用标准库） |
| 浏览器 | Chrome / Edge 114+（推荐最新版） |
| 网络 | **完全离线可跑**：字体、three.js、图片、音频全部本地内联，断网功能完整 |
| 其它 | 无 Node、无 npm、无包管理器、无任何 pip 安装步骤 |

### 4.2 运行方式

```bash
# 方式一：打包单文件（推荐，演示与评审用）
py -3 scripts/bundle_single.py
# 然后双击 dist/非遗智汇·多彩面板版.html —— 全部 JS/数据/图片/字体/音频内联，零网络依赖

# 方式二：直接跑源码版（多文件，便于阅读源码与调试）
双击 index.html        # 依赖同目录的 assets/、vendor/ 与各 *.js

# 方式三：本地静态服务（可选，浏览器安全策略更宽松；接在线大模型时必须用）
py -3 -m http.server 8000
# 访问 http://localhost:8000
```

> 单文件版由 `scripts/bundle_single.py` 合成，依次内联 data.js → map-data.js → regions-data.js → treasury-*.js → vendor/three → three-showcase → evolution-data.js → help-data.js → app.js，再内联子集化字体与 assets/ 图片，幂等可复现。源码改动后重新运行脚本即可保持产物与源码同步。

### 4.3 依赖清单

依赖分两层：**评委复现只需要第一层**；第二层是作者从原始素材重新生成数据层才用得到的工具，打包单文件不需要。

#### 第一层：评委复现必需（无需 pip 安装）

| 依赖 | 版本 / 来源 | 用途 | 为何不用额外安装 |
|------|------|------|------|
| Python 标准库 | 3.8+（本机 3.14 验证） | `bundle_single.py` 文本内联、base64、校验 | 随 Python 自带，无需 pip |
| 子集化字体 | 已入库 `assets/fonts/`（Noto Serif SC / Noto Sans SC 的 woff2 + `fonts-embed.css`） | 离线宋体/黑体，断网保持排版 | 产物已随仓库提供，无需重跑子集化 |
| three.js | 已入库 `vendor/three.min.js`（r186 系列）、`OrbitControls.min.js`、`lenis.min.js` | WebGL 3D 展柜、轨道控制、平滑滚动 | 本地 vendor 文件，打包时内联，**不引 CDN** |
| 浏览器 | Chrome / Edge 114+ | 运行单文件 HTML | 无安装步骤 |

> 运行时**不向任何第三方域名发请求**；`index.html` 源码中保留的 Lenis CDN 标签在打包时会被本地 `vendor/lenis.min.js` 内联替换（本地缺失才尝试下载，下载失败则删除该标签并降级为原生滚动，均不影响功能）。

#### 第二层：作者数据准备才用（评委通常不需要运行）

| 依赖 | 安装命令 | 哪个脚本用 | 作用 |
|------|------|------|------|
| fonttools | `pip install fonttools` | `scripts/subset_fonts.py`（内部调用 `python -m fontTools.subset`） | 按页面实际用字对 Noto 字体做子集化、输出 woff2；产物已入库 |
| Pillow | `pip install Pillow` | `scripts/compliance_images.py`、`scripts/_inject_real.py`、`scripts/_replace_photos.py` | 下载/压缩示意图片到展示分辨率 |
| numpy | `pip install numpy` | `scripts/_inject_audio.py`、`scripts/_reinject_two.py` | 讲解员 WAV 音频重采样 |
| （无） | —— | `scripts/build_three.py` | 仅用标准库 urllib 下载 three.js，`vendor/` 已入库，无需重跑 |

> **不依赖 ffmpeg**：音频读写用 Python 标准库 `wave`，重采样用 numpy，不调用任何外部二进制。`scripts/` 下下划线开头的 `_inject_*.py`、`_replace_photos.py`、`_reinject_two.py`、`_check_keys.py`、`scan_videos.py` 是历史素材注入/校验的中间步骤，其核心逻辑已合并进 `bundle_single.py`，仅作过程存档。

### 4.4 环境变量模板（可选，接入在线大模型）

**双层架构 = 内置知识库离线问答（永不掉线） + 预留豆包/千问大模型接口（填 key 即用）。**

- **离线层（默认）**：`data.js` 中 `KB_ALL` 关键词打分匹配 + 多轮指代追问，纯本地作答，断网演示不断线，**不依赖任何远程服务**。
- **在线层（可选）**：`app.js` 顶部 `REMOTE_API` 填入兼容 OpenAI Chat Completions 协议的接口并置 `enabled: true`，回答即切换为大模型生成。

> 诚实声明：默认离线回答由**内置知识库检索匹配**产出，并非大模型生成；填 key 后才接入真·大模型。

**配置位置（`app.js` 第 16–21 行）**：

```js
var REMOTE_API = {
  enabled: false,        // ① 开关：true 才走远程大模型
  url: "",               // ② 接口地址（chat/completions 全路径）
  key: "",               // ③ API Key
  model: ""              // ④ 模型 / 推理接入点 ID
};
```

各字段填法（以火山方舟豆包为例，其它兼容 OpenAI 协议的服务同理）：

| 字段 | 填什么 | 示例 |
|------|------|------|
| `url` | 服务商的 Chat Completions 完整地址 | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` |
| `key` | 在服务商控制台申请的 API Key | `sk-xxxxxxxx`（**仅本地填写，切勿提交公开仓库**） |
| `model` | 模型 ID 或推理接入点 ID | `doubao-seed-1-6-250615` |
| `enabled` | 三字段填齐后改为 `true` | `true` |

**不填会怎样（默认行为）**：`enabled:false` 或 `key` 为空时，问·AI 完全走内置离线知识库，界面顶部不出现「离线 ⇄ 在线」切换按钮，纯本地作答、永不掉线。

> 安全与运行提示：
> 1. 本项目为纯前端、无构建步骤，**不读取 `.env`**；接入方式是直接编辑 `app.js` 顶部 `REMOTE_API`。改完本地重新打包即可，**含 key 的文件不要提交**（`.gitignore` 已排除 `.env`、`config.local.js`）。
> 2. `file://` 协议下 `fetch` 会被浏览器拦截，启用远程 API 时请用 `py -3 -m http.server 8000` 起本地服务再访问。

## 五、目录结构

```
feiyi-zhihui/
├── index.html                  # 入口：结构 + 设计系统（CSS 变量）+ 质感动效层，按序引用各 JS
├── app.js                      # 应用/交互层：10 视图渲染、路由、离线问答匹配、图谱/地图/海报逻辑（含 REMOTE_API 配置位）
├── data.js                     # 核心数据层：15 项非遗 × 多维字段 + 离线知识库 KB_ALL + 图谱连边 + HALL_VIDEOS
├── map-data.js                 # 地图层：写实河南 SVG 轮廓 + 地市坐标
├── regions-data.js             # 十八城介绍 + 地标 + 城市 → 非遗映射
├── treasury-data.js            # 藏库文字层：15 件藏品的级别、产地、口径、讲解词
├── treasury-real.js            # 藏库影像层：15 件实物图 base64 内联（含 AI 示意图/实拍标注）
├── treasury-audio.js           # 藏库讲解音频层：10 段表演类 WAV base64 内联（约 17MB，器物类无音频）
├── treasury-process.js         # 工艺流程层：5 件代表非遗的分步工序数据与图文
├── treasury.js                 # 藏库视图层：展柜、真人讲解播放器、实物影像弹窗、3D 展柜接入
├── three-showcase.js           # WebGL 3D 层：汝瓷碗 LatheGeometry + 榫卯 BoxGeometry 拆解（懒初始化、关闭 dispose）
├── treasury-mats.js            # 历史材质数据，当前未被引用，保留存档
├── evolution-data.js           # 演进馆数据：12 轮 AI 协同迭代的关键 Prompt/协作要点/引导修复
├── help-data.js                # 图文使用说明数据（含引导配图 base64，约 470KB）
├── README.md                   # 本文件
├── .gitignore                  # 排除 dist/、单文件、zip、临时目录、环境文件、本地存档图
│
├── assets/
│   ├── hero.jpg + <key>.jpg×15 # 主视觉 + 15 项招牌主图（均为 AI 工笔淡彩示意图，带角标）
│   ├── fonts/                  # 离线字体（已入库）：NotoSerifSC/SansSC 子集 woff2 + fonts-embed.css
│   ├── cats/                   # 六门类氛围图（6 张）
│   ├── mapbg/                  # 地图页文化背景图（4 张）
│   ├── region/                 # 十八城地标图（18 张）
│   ├── video/                  # 沉浸演绎视频位（仅含放置说明.md，无视频时离线降级为静态海报）
│   └── treasury_real/          # 博物馆官网原始存档图（.gitignore 排除、不入库，仅本地核对）
│
├── vendor/                     # 第三方库本地化，打包内联，零 CDN
│   ├── three.min.js            # three.js r186（WebGL 3D 展柜）
│   ├── three.core.min.js / three.module.min.js  # three.js 同版本组件（备查）
│   ├── OrbitControls.min.js    # 轨道控制（旋转/缩放/平移）
│   └── lenis.min.js            # 平滑滚动（可选，失败自动降级原生滚动）
│
├── scripts/
│   ├── bundle_single.py        # ★ 一键打包：clone 后评委只需跑它（纯标准库、幂等、不碰 git）
│   ├── subset_fonts.py         # 作者用：fontTools 字体子集化（产物已入库）
│   ├── compliance_images.py    # 作者用：Pillow 压缩示意图到展示分辨率
│   ├── build_three.py          # 作者用：下载 three.js 到 vendor/（已入库）
│   ├── _inject_audio.py / _reinject_two.py       # 作者用：numpy 处理讲解 WAV 并注入（历史中间态）
│   ├── _inject_real.py / _replace_photos.py      # 作者用：Pillow 注入/替换实物图（历史中间态）
│   ├── _compliance_data.py / _compliance_treasury.py / _inspect_real.py  # 合规标注与检查脚本
│   ├── _check_keys.py / scan_videos.py           # 已并入 bundle_single.py，仅存档
│
├── docs/
│   ├── 技术文档.html / 技术文档.pdf              # 意图控制 / 架构 / 可复现性论证（≤30 页）
│   ├── Prompt历史.md                             # 核心模块完整 Prompt 链（可复现证据）
│   ├── 演示视频脚本.md                           # 5-8 分钟演示分镜（含 AI 协同复现段）
│   ├── 3D实物对齐清单.md                         # 3D 展柜与实物/口径对照
│   └── 3D非遗数字化系统·工程落地方案.html        # WebGL 方案设计稿
│
└── dist/                       # 打包产物（.gitignore 排除、不入库）：bundle 生成的单文件 HTML
    └── 非遗智汇·多彩面板版.html
```

> 根目录可能存在的 `非遗智汇·多彩面板版.html`、`_shots/`、`_backup/`、`_git_msgs/`、`_audio_tmp/` 均为本地构建产物或临时目录，已被 `.gitignore` 排除，**不属于仓库内容**，删除不影响重新构建。

## 六、演进记录（Git 提交 ↔ AI 协同模块）

> 开发全程为 AI 协同（Vibe Coding）：每次提交对应一个功能模块的落地或一次核心 AI 对话，Git 历史保留全部细粒度提交（**共 95 次**），完整 Prompt 链见 `docs/Prompt历史.md`。

| 阶段 | 模块 | 内容 |
|------|------|------|
| v1 | M1–M4 | 15 项数据 / 设计系统 / 视图骨架 / 详情页 / 内置知识库问答 |
| v2 | M5–M6 | 写实河南地图（放大 / 聚焦 / 城市联动）+ 知识图谱 |
| v3 | M7–M8 | 文创生成 / 沉浸演绎 / 收藏持久化 / 双主题 |
| 打磨 | M8.5+ | 一页一世界、城市介绍、图谱与地图 / 创作台移动端适配、多轮上下文、性能与单文件体积优化、演进馆、图文使用说明、3D 真人自然讲解音（v3） |

## 七、技术要点（供评审速览）

- **架构**：数据与视图严格分离（`data.js` / `map-data.js` / `regions-data.js` / `treasury-*.js` 纯数据，`app.js` / `treasury.js` / `three-showcase.js` 纯逻辑，`index.html` 纯结构与样式），hash 路由驱动 10 视图，无框架、无构建步骤。
- **双层问答架构**：**离线优先**——本地知识库关键词打分匹配（离线可用、演示不断线、永不掉线）+ 多轮上下文指代消解（「它 / 这个 / 那」自动回指上一主题）+ 远程大模型 API 预留位（豆包/千问兼容接口，填 key 即升级）。
- **图谱**：力导向布局 + 六门类着色 + 氛围画布（纸纹 / 晕染 / 水印）+ 节点分批入场 + 滚轮 / 中心缩放（窄屏保持物理宽可横滑）。
- **地图**：写实河南 SVG 轮廓 + 9 地市标点 + 放大模态交互 + 悬浮聚焦单显 + 城市介绍联动。
- **安全**：全部用户内容经 `esc()` 转义防 XSS；运行时零第三方网络请求（three.js / OrbitControls / Lenis / 子集化字体均已本地化、打包内联，断网完整可用）；localStorage 读写全部 try/catch。
- **性能**：指针动效单监听 + rAF 节流；合成层 hover 才开；隐藏视图定时器即切即停；Lenis 已禁用回退原生滚动。
- **无障碍**：键盘可达（地图标点 / 图谱节点 / 收藏按钮）、`prefers-reduced-motion` 全量兜底、语义化标签 + aria。

## 八、赛事信息

- 赛事：全国高校 Vibe Coding 开发挑战赛（AI 创新应用挑战赛）
- 组别：B 组（非 985/211 本科）· 个人赛
- 演示视频与技术文档说明见 `docs/`

## 九、图片来源与许可声明

本作品为非营利性参赛与教学演示项目，所有影像按来源分类标注，界面内对非实拍内容均显示「AI 示意」「示意 · 非原物」角标。

### 9.1 AI 生成示意图（非实拍、非文物扫描）

15 项招牌主图（`assets/<key>.jpg`）与藏库中唐三彩、河南坠子、少林功夫三张影像，均为参赛过程中使用 AI 绘图工具生成的**中国传统工笔淡彩风格示意图**，统一标注「AI 工笔示意，非实拍 / 非原物」，不作为真实馆藏、演出或人物照片。生成记录见 `scripts/compliance_images.py`。

### 9.2 馆藏与文博机构影像（藏库，离线内联）

| 项目 | 影像说明 | 来源 |
|---|---|---|
| 钧瓷 | 国家博物馆藏·钧窑瓷尊 | 中国国家博物馆公开资料（chnmuseum.cn）；影像说明参《中国大百科全书·宋代五大名窑》 |
| 汝瓷 | 故宫博物院藏·北宋汝窑天青釉三足洗 | 故宫博物院（dpm.org.cn） |
| 朱仙镇木版年画 | 中国美术馆藏·对刀门神 | 中国美术馆展陈（namoc.org） |

钧瓷、汝瓷另有 4 张博物馆官网原始存档图仅存于本地 `assets/treasury_real/`（已在 `.gitignore` 中排除、未入库），用于核对，不随作品分发。

### 9.3 院团、文旅与传承人公开资料影像（藏库，离线内联）

| 项目 | 来源 |
|---|---|
| 豫剧 | 河南豫剧院二团公开资料 |
| 曲剧 | 河南曲剧艺术中心公开资料 |
| 马街书会 | 宝丰县文化广电和旅游局公开资料（baofeng.gov.cn） |
| 洛阳水席 | 真不同饭店公开资料 |
| 汴绣 | 开封汴绣厂公开资料 |
| 太极拳 | 中国网 china.org.cn 公开资料 |
| 确山打铁花 | 确山县文化广电和旅游局公开资料（queshan.gov.cn） |
| 浚县泥咕咕、淮阳泥泥狗 | 非遗手工艺实物，© 作者 / 传承人（传承人姓名待补，权利人可联系作者补充署名） |

### 9.4 界面与辅助素材

- 数字讲解员形象（`guide-close.jpg` / `guide-talk.jpg`）为 AI 生成的虚拟人物，不对应真实自然人；
- 分类图、地图底图、城市配图、操作引导图（`assets/cats/`、`assets/mapbg/`、`assets/region/`、`help-data.js`）为公开资料编辑整理或 AI 生成的示意图，仅用于界面导览；
- 所有影像均压缩到展示分辨率内联，高清原件不随作品分发。

### 9.5 许可与删除通道

以上影像仅用于本次赛事展示、学术汇报与教学交流，不用于任何商业用途，版权归原作者或权利人所有。如权利人认为某张影像涉及侵权，请通过仓库 Issue 联系，我们将在核实后第一时间更换为 AI 示意图或下架。

---

**非遗智汇 · 把非遗讲给你听。**
