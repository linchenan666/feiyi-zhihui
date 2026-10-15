# -*- coding: utf-8 -*-
"""
scripts/subset_fonts.py
把系统里的 Noto Serif SC VF / Noto Sans SC VF 子集化为 woff2，
只保留项目源码实际用到的字符，并生成 base64 内嵌 CSS。

用法:
    py -3 scripts/subset_fonts.py

产物:
    assets/fonts/NotoSerifSC-subset.woff2
    assets/fonts/NotoSansSC-subset.woff2
    assets/fonts/fonts-embed.css   （@font-face + base64，bundle 时内联）
"""
import os, re, base64, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

SERIF_SRC = r"C:\Windows\Fonts\NotoSerifSC-VF.ttf"
SANS_SRC  = r"C:\Windows\Fonts\NotoSansSC-VF.ttf"

# 1. 收集源码里所有可见字符
SRC_FILES = [ROOT / "index.html"] + sorted(ROOT.glob("*.js"))
chars = set()
for f in SRC_FILES:
    if not f.exists():
        continue
    txt = f.read_text(encoding="utf-8", errors="ignore")
    # 去掉 HTML/JS 注释里的字符也没关系——多保留几个字符代价极小，
    # 但去掉 base64 data URI 里的字符（treasury-audio/real.js 里全是 base64）
    txt = re.sub(r'data:[^"\')]+', '', txt)
    for ch in txt:
        # 保留中文、日文、韩文、ASCII 可见字符、常用标点
        o = ord(ch)
        if (0x4E00 <= o <= 0x9FFF or       # CJK Unified
            0x3000 <= o <= 0x303F or       # CJK 标点
            0xFF00 <= o <= 0xFFEF or      # 全角
            0x2000 <= o <= 0x206F or       # 通用标点
            0x20 <= o <= 0x7E):             # ASCII 可见
            chars.add(ch)

# 加几个兜底字符（数字展厅里可能动态生成的）
for ch in "0123456789%·—…、。，：；！？""''（）《》【】「」『』0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
    chars.add(ch)

text_file = OUT / "_chars.txt"
text_file.write_text("".join(sorted(chars)), encoding="utf-8")
print(f"[1/4] 收集字符 {len(chars)} 个 -> {text_file.name}")

# 2. pyftsubset
def subset(src, out_name):
    out_path = OUT / out_name
    cmd = [
        sys.executable, "-m", "fontTools.subset",
        src,
        f"--text-file={text_file}",
        "--flavor=woff2",
        "--no-hinting",
        "--desubroutinize",
        "--layout-features='*'",
        f"--output-file={out_path}",
        "--unicodes="  # 空，只用 text-file
    ]
    # 去掉 unicodes 空参数（pyftsubset 会报错）
    cmd = [c for c in cmd if c != "--unicodes="]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        print("STDERR:", r.stderr)
        sys.exit(r.returncode)
    sz = out_path.stat().st_size / 1024
    print(f"[2/4] {out_name}: {sz:.0f} KB")
    return out_path

serif_woff2 = subset(SERIF_SRC, "NotoSerifSC-subset.woff2")
sans_woff2  = subset(SANS_SRC,  "NotoSansSC-subset.woff2")

# 3. base64 内嵌 CSS
def b64(p):
    return base64.b64encode(p.read_bytes()).decode("ascii")

css = f"""/* 自动生成：scripts/subset_fonts.py，勿手改 */
@font-face {{
  font-family: 'Noto Serif SC';
  font-style: normal;
  font-weight: 300 900;
  font-display: swap;
  src: url(data:font/woff2;base64,{b64(serif_woff2)}) format('woff2');
}}
@font-face {{
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 300 900;
  font-display: swap;
  src: url(data:font/woff2;base64,{b64(sans_woff2)}) format('woff2');
}}
"""
css_path = OUT / "fonts-embed.css"
css_path.write_text(css, encoding="utf-8")
total = (serif_woff2.stat().st_size + sans_woff2.stat().st_size) / 1024
b64_total = len(css) / 1024
print(f"[3/4] fonts-embed.css: woff2 合计 {total:.0f} KB, base64 后 {b64_total:.0f} KB")
print(f"[4/4] 完成。把 <link rel=preconnect ...> 和 <link href='...feishu...'> 换成 <style>{css_path.name} 内容</style>")
