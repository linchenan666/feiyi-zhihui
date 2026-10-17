# -*- coding: utf-8 -*-
"""
合规化：data.js 中 15 项招牌图已全部换成 AI 工笔示意图。
给尚未有 replica:true 的 10 项补字段，使详情页大图显示「示意 · 非原物」角标。
幂等：已有 replica 的 5 项跳过。
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, "data.js")

NEED = ["yuju", "quju", "zhuizi", "majie", "shuixi",
        "bianxiu", "zhuxian", "shaolin", "taiji", "dahuatie"]

s = io.open(P, encoding="utf-8").read()
n = 0
for key in NEED:
    pat = re.compile(r'(img:\s*"assets/' + key + r'\.jpg",\n)(?!    replica:)', re.M)
    s2, c = pat.subn(lambda m: m.group(1) + "    replica: true,\n", s)
    if c == 0:
        print("[skip] %s already has replica or img line not found" % key)
    else:
        s = s2
        n += 1
        print("[ok] %s replica:true added" % key)

io.open(P, "w", encoding="utf-8", newline="").write(s)
print("[done] %d items updated" % n)
