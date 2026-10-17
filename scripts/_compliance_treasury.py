# -*- coding: utf-8 -*-
"""
合规化：将 treasury-real.js 中 zhuizi / shaolin / sancai 三个高风险 key
（新华社图、博物馆展陈实拍）替换为 assets 下新生成的 AI 工笔示意图 base64，
note 统一改为「AI 工笔淡彩示意，非实拍」。
幂等：对同一 src/note 重跑结果一致。
"""
import base64
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(ROOT, "treasury-real.js")

# key -> (新 note 描述, 图片路径)
REPLACE = {
    "sancai":  ("唐三彩三足罐（绿釉兽足·浮雕瑞兽花卉）｜AI 工笔淡彩示意，非实拍", "assets/sancai.jpg"),
    "zhuizi":  ("河南坠子舞台演唱｜AI 工笔淡彩示意，非实拍", "assets/zhuizi.jpg"),
    "shaolin": ("少林寺塔林武僧演练｜AI 工笔淡彩示意，非实拍", "assets/shaolin.jpg"),
}


def main():
    s = io.open(JS, encoding="utf-8").read()
    orig_len = len(s)
    for key, (note, img_rel) in REPLACE.items():
        img_path = os.path.join(ROOT, img_rel.replace("/", os.sep))
        with open(img_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        # 匹配 "key": {name: "...", note: "...", src: "..."}
        pat = re.compile(
            r'("' + key + r'"\s*:\s*\{name:\s*"[^"]*",\s*note:\s*")([^"]*)("\s*,\s*src:\s*")[^"]*(")'
        )
        m = pat.search(s)
        if not m:
            print("[ERROR] pattern not found for %s" % key)
            return 1
        s = pat.sub(lambda mm: mm.group(1) + note + mm.group(3) + "data:image/jpeg;base64," + b64 + mm.group(4), s, count=1)
        print("[ok] %s replaced (%d KB img, note=%s)" % (key, os.path.getsize(img_path) // 1024, note[:30]), flush=True)
    io.open(JS, "w", encoding="utf-8", newline="").write(s)
    print("[done] treasury-real.js %d -> %d chars" % (orig_len, len(s)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
