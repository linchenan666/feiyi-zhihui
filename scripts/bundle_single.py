# -*- coding: utf-8 -*-
"""
bundle_single.py —— 非遗智汇单文件打包脚本

一条命令把 index.html + 全部本地 JS 内联成零依赖单文件 HTML，
产物输出到 dist/非遗智汇·多彩面板版.html，双击即可运行。

用法（在项目根目录执行）：
    py -3 scripts/bundle_single.py

设计原则：
- 幂等：同样的源码输入，输出字节一致；不写时间戳、不写随机数。
- 失败即停：前置文件缺失 / key 数量不对 / 读取失败，立即非零退出。
- 不碰 git：产物只写 dist/，本脚本不执行任何 git 命令。
- 不需要 numpy/PIL/网络：treasury-audio.js 和 treasury-real.js 已在 git 里（base64 数据层），
  本脚本只做"文本内联"，不重新下载远程素材。
  若要从原始 WAV/照片重新生成数据文件，用 scripts/ 下的 _inject_*.py 和 _replace_photos.py。
"""

import io
import os
import re
import sys
import urllib.request

# ---------- 路径与常量 ----------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT, "dist")
OUT_NAME = "非遗智汇·多彩面板版.html"

# index.html 底部按顺序引用的本地 JS（顺序不能错，后一个文件依赖前一个的全局变量）
LOCAL_JS = [
    "data.js",
    "map-data.js",
    "regions-data.js",
    "treasury-data.js",
    "treasury-real.js",
    "treasury-audio.js",
    "treasury-process.js",
    "treasury.js",
    "evolution-data.js",
    "help-data.js",
    "app.js",
]

# 15 个非遗 id（实物图必须全有）
EXPECTED_IDS = [
    "junci", "ruci", "sancai", "nigugu", "ninigou",
    "yuju", "quju", "zhuizi", "majie", "shuixi",
    "bianxiu", "zhuxian", "shaolin", "taiji", "dahuatie",
]

# 表演类非遗（有真人讲解音频；器物类 junci/ruci/sancai/nigugu/ninigou 无讲解音频）
EXPECTED_AUDIO_IDS = [
    "yuju", "quju", "zhuizi", "majie", "shuixi",
    "bianxiu", "zhuxian", "shaolin", "taiji", "dahuatie",
]

# Lenis CDN（平滑滚动库）。原代码已降级为原生滚动（M8.2 提交），
# 这里尝试下载内联；下载失败就删除该 <script> 标签，不影响功能。
LENIS_URL = "https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"

# Feishu 字体 CDN（已知问题：断网回退系统宋体）。
# 本脚本不处理字体子集化（独立任务 A1），只在校验日志里警告一次。
FEISHU_FONT_HINT = (
    "[warn] index.html 仍引用 Feishu CDN 字体，断网会回退系统宋体。"
    "正式参赛包需做字体子集化内嵌（见 docs/技术文档.md）。"
)


# ---------- 工具函数 ----------
def log(step, msg):
    """打印带步骤名的日志。"""
    print(f"[{step}] {msg}")


def fail(step, msg):
    """失败即停：打印错误并以退出码 1 结束。"""
    print(f"[FAIL:{step}] {msg}", file=sys.stderr)
    sys.exit(1)


def read_text(path, step):
    """读 UTF-8 文本文件，失败即停。"""
    if not os.path.isfile(path):
        fail(step, f"找不到必需文件: {os.path.relpath(path, ROOT)}")
    try:
        with io.open(path, encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        fail(step, f"读取失败 {os.path.relpath(path, ROOT)}: {e}")


def count_keys(js_text, step):
    """从 treasury-*.js 文本里提取所有顶层 key（形如  "xxx": ）。"""
    # 匹配  "key":  （key 为小写字母/数字，冒号后可选空格）
    keys = re.findall(r'^\s*"([a-z][a-z0-9]*)":\s*[\{\"]', js_text, re.M)
    return keys


# ---------- 各构建步骤 ----------
def step_preflight():
    """1. 前置文件检查。"""
    log("1/6", "检查前置文件存在性...")
    required = ["index.html"] + LOCAL_JS
    missing = []
    for name in required:
        p = os.path.join(ROOT, name)
        if not os.path.isfile(p):
            missing.append(name)
    if missing:
        fail("preflight", f"以下文件缺失，无法打包: {', '.join(missing)}")
    log("1/6", f"OK，{len(required)} 个必需文件全部存在。")


def step_verify_keys():
    """2. key 完整性校验（原 _check_keys.py 的逻辑）。"""
    log("2/6", "校验 treasury-real.js / treasury-audio.js 的 key 完整性...")

    real_text = read_text(os.path.join(ROOT, "treasury-real.js"), "keys")
    audio_text = read_text(os.path.join(ROOT, "treasury-audio.js"), "keys")

    real_keys = set(count_keys(real_text, "real"))
    audio_keys = set(count_keys(audio_text, "audio"))

    log("2/6", f"treasury-real.js  含 {len(real_keys)} 个 key: {sorted(real_keys)}")
    log("2/6", f"treasury-audio.js 含 {len(audio_keys)} 个 key: {sorted(audio_keys)}")

    real_missing = [k for k in EXPECTED_IDS if k not in real_keys]
    audio_missing = [k for k in EXPECTED_AUDIO_IDS if k not in audio_keys]

    if real_missing:
        fail("keys", f"treasury-real.js 缺实物图 key: {real_missing}")
    if audio_missing:
        fail("keys", f"treasury-audio.js 缺讲解音频 key: {audio_missing}")

    log("2/6", f"OK，15 件实物图 + {len(EXPECTED_AUDIO_IDS)} 段表演类讲解音频全部对齐。")


def step_scan_videos():
    """3. 扫描 assets/video/ 登记 HALL_VIDEOS（原 scan_videos.py 的逻辑）。

    视频是可选素材：目录不存在或为空就跳过，不报错。
    如果有视频，直接在最终 HTML 里把 data.js 的 HALL_VIDEOS 块替换掉。
    """
    log("3/6", "扫描 assets/video/ 沉浸演绎视频...")
    vdir = os.path.join(ROOT, "assets", "video")
    if not os.path.isdir(vdir):
        log("3/6", "跳过：assets/video/ 不存在（沉浸演绎离线降级为静态海报，属预期行为）。")
        return None

    exts = (".mp4", ".webm", ".m4v", ".mov")
    found = {}
    for fn in sorted(os.listdir(vdir)):
        name, ext = os.path.splitext(fn)
        if ext.lower() in exts:
            found[name] = "assets/video/" + fn

    if not found:
        log("3/6", "跳过：assets/video/ 存在但无视频文件。")
        return None

    # 生成 HALL_VIDEOS 块文本
    lines = ["var HALL_VIDEOS = {"]
    items = [f'  "{k}": "{v}"' for k, v in sorted(found.items())]
    lines.append(",\n".join(items))
    lines.append("};")
    block = "\n".join(lines)

    log("3/6", f"登记 {len(found)} 个视频: {sorted(found.keys())}")
    return block


def step_inline_js(html_text, video_block):
    """4. 内联所有本地 <script src="*.js">。"""
    log("4/6", "内联本地 JS 文件...")
    out = html_text
    inlined = 0

    for name in LOCAL_JS:
        p = os.path.join(ROOT, name)
        js_text = read_text(p, "inline")
        # 匹配 <script src="name.js"></script>（容忍换行和多余空格）
        pat = re.compile(
            r'<script\s+src=["\']' + re.escape(name) + r'["\']\s*>\s*</script>',
            re.I,
        )
        # 用函数作为 replacement，避免 JS 代码里的反斜杠被 re.sub 当成转义符
        replacement = "<script>/* === " + name + " === */\n" + js_text.rstrip() + "\n</script>"
        out, n = pat.subn(lambda _m, r=replacement: r, out, count=1)
        if n != 1:
            fail("inline", f"在 index.html 中未找到 <script src=\"{name}\"> 标签")
        size_kb = len(js_text.encode("utf-8")) / 1024
        log("4/6", f"  内联 {name} ({size_kb:,.0f} KB)")
        inlined += 1

    log("4/6", f"OK，{inlined} 个 JS 文件已内联。")

    # 如果扫描到视频，替换 data.js 里的 HALL_VIDEOS 块
    if video_block:
        log("4/6", f"替换 HALL_VIDEOS 块为 {video_block.count(chr(10))+1} 行...")
        vp = re.compile(r"var HALL_VIDEOS = \{.*?\};", re.S)
        if not vp.search(out):
            fail("video", "index.html 中已内联的 data.js 未找到 HALL_VIDEOS 块")
        out = vp.sub(video_block.replace("\n", "\r\n"), out, count=1)
        log("4/6", "OK，HALL_VIDEOS 已更新。")

    return out


def step_inline_lenis(html_text):
    """5. 处理 Lenis CDN：尝试下载内联，失败则删标签。"""
    log("5/6", "处理 Lenis CDN 脚本...")
    pat = re.compile(
        r'<script\s+src=["\']' + re.escape(LENIS_URL) + r'["\']\s*>\s*</script>',
        re.I,
    )
    if not pat.search(html_text):
        log("5/6", "index.html 中未找到 Lenis CDN 标签，跳过。")
        return html_text

    # 尝试下载
    try:
        log("5/6", f"下载 {LENIS_URL} ...")
        req = urllib.request.Request(LENIS_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            js = resp.read().decode("utf-8", errors="replace")
        log("5/6", f"下载成功 ({len(js)/1024:.0f} KB)，内联。")
        replacement = "<script>/* lenis.min.js (inline) */\n" + js + "\n</script>"
        return pat.sub(lambda _m, r=replacement: r, html_text, count=1)
    except Exception as e:
        log("5/6", f"[warn] Lenis 下载失败 ({e})，删除 CDN 标签。代码已降级原生滚动，不影响功能。")
        return pat.sub("", html_text, count=1)


def step_write_output(html_text):
    """6. 写出最终单文件 HTML 到 dist/。"""
    log("6/6", f"写出产物到 {os.path.relpath(DIST_DIR, ROOT)} ...")
    os.makedirs(DIST_DIR, exist_ok=True)
    out_path = os.path.join(DIST_DIR, OUT_NAME)
    with io.open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(html_text)
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    log("6/6", f"OK: {os.path.relpath(out_path, ROOT)} ({size_mb:.2f} MB)")
    return out_path, size_mb


# ---------- 主流程 ----------
def main():
    print("=" * 60)
    print("非遗智汇 · 单文件打包")
    print(f"项目根: {ROOT}")
    print("=" * 60)

    step_preflight()
    step_verify_keys()
    video_block = step_scan_videos()
    html = read_text(os.path.join(ROOT, "index.html"), "read-index")
    html = step_inline_js(html, video_block)
    html = step_inline_lenis(html)
    out_path, size_mb = step_write_output(html)

    # 字体警告（不阻断构建）
    print()
    log("hint", FEISHU_FONT_HINT)

    print()
    print("=" * 60)
    print("打包完成。")
    print(f"  产物: {out_path}")
    print(f"  大小: {size_mb:.2f} MB")
    print(f"  验证: 双击用浏览器打开，应看到水墨长卷首页、console 零报错。")
    print(f"  注意: dist/ 已加入 .gitignore，不要提交打包产物。")
    print("=" * 60)


if __name__ == "__main__":
    main()
