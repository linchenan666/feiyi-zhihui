# -*- coding: utf-8 -*-
import io
import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, "treasury-real.js")
s = io.open(p, encoding="utf-8").read()
print("file len:", len(s))
print("head 300:", s[:300])
print("---- keys ----")
for m in re.finditer(r'"?([a-z]+)"?\s*:\s*\{', s):
    print(m.group(1), "at", m.start())
print("---- note fields ----")
for m in re.finditer(r'note\s*:\s*"([^"]*)"', s):
    print(repr(m.group(1)[:80]), "at", m.start())
