# -*- coding: utf-8 -*-
"""
图片版权合规化：下载 15 张 AI 工笔淡彩示意图 -> 压缩 -> 覆盖 assets/<key>.jpg
幂等：重跑只覆盖，不产生副作用。
"""
import io
import os
import sys
import urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

# key -> AI 示意图 URL（工笔淡彩，统一风格）
IMAGES = {
    "yuju":     "https://aka.doubaocdn.com/s/pTX4Stqi6F",
    "quju":     "https://aka.doubaocdn.com/s/XsQpsCECJn",
    "zhuizi":   "https://aka.doubaocdn.com/s/Kv4fJwEQyO",
    "majie":    "https://aka.doubaocdn.com/s/vynT79JEiZ",
    "junci":    "https://aka.doubaocdn.com/s/JGmk2OkFXr",
    "ruci":     "https://aka.doubaocdn.com/s/EL9jrUsVhK",
    "sancai":   "https://aka.doubaocdn.com/s/MPcdz9XW5z",
    "shuixi":   "https://aka.doubaocdn.com/s/WQGqapD0UU",
    "bianxiu":  "https://aka.doubaocdn.com/s/OrOnLcfoiv",
    "zhuxian":  "https://aka.doubaocdn.com/s/CVkxDgPFAI",
    "nigugu":   "https://aka.doubaocdn.com/s/TVDpPUpxmV",
    "ninigou":  "https://aka.doubaocdn.com/s/0Z5HZStTpT",
    "shaolin":  "https://aka.doubaocdn.com/s/1EH9iEoXYo",
    "taiji":    "https://aka.doubaocdn.com/s/TNDkIfreGZ",
    "dahuatie": "https://aka.doubaocdn.com/s/V9jWnNrEWH",
    # 第二批新增（2026-10 扩数据）：戏曲/曲艺/民俗，AI 工笔淡彩示意图
    "yuediao": "https://aka.doubaocdn.com/s/7KhVdBjTpn",
    "dapindiao": "https://aka.doubaocdn.com/s/hE10u0h92s",
    "dadiquzi": "https://aka.doubaocdn.com/s/AO2p2Nmor0",
    "heluodagu": "https://aka.doubaocdn.com/s/pS0Mp8D4LH",
    "taihao": "https://aka.doubaocdn.com/s/ejkXuUqud7",
    # 第三批新增（2026-10 扩数据）：技艺/美术/体育，AI 工笔淡彩示意图
    "dangyangyu": "https://aka.doubaocdn.com/s/JrilcRoXgV",
    "xinyangmaojian": "https://aka.doubaocdn.com/s/J5iIQBqIWn",
    "lingbaojianzhi": "https://aka.doubaocdn.com/s/ioNr3n4U1L",
    "zhenpingyudiao": "https://aka.doubaocdn.com/s/NxTg2dGHpJ",
    "dongbeizhuang": "https://aka.doubaocdn.com/s/We89JgxA2e"
}

MAX_SIDE = 1600
QUALITY = 82


def main():
    os.makedirs(ASSETS, exist_ok=True)
    total = 0
    for key, url in IMAGES.items():
        print("[download] %s <- %s" % (key, url), flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        w, h = im.size
        scale = min(1.0, MAX_SIDE / max(w, h))
        if scale < 1.0:
            im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        out = os.path.join(ASSETS, key + ".jpg")
        im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        kb = os.path.getsize(out) // 1024
        total += kb
        print("  -> %s (%dKB, %dx%d)" % (out, kb, im.size[0], im.size[1]), flush=True)
    print("[done] %d images, total %d KB" % (len(IMAGES), total), flush=True)


if __name__ == "__main__":
    sys.exit(main())
