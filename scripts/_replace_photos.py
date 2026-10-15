# -*- coding: utf-8 -*-
import os, urllib.request, io, base64, re
from PIL import Image

picks = {
    "yuju":     ("https://aka.doubaocdn.com/s/UuVnKEyUWX", "豫剧《秦雪梅》舞台剧照｜图源：河南豫剧院二团公开资料"),
    "quju":     ("https://aka.doubaocdn.com/s/31LaVD7Z3e", "曲剧《卷席筒》舞台照｜图源：河南曲剧艺术中心公开资料"),
    "zhuizi":   ("https://aka.doubaocdn.com/s/cSoFKjxFmR", "河南坠子舞台演唱｜图源：新华社河南曲艺展演"),
    "majie":    ("https://aka.doubaocdn.com/s/YPG09xAMG7", "宝丰马街书会田野书棚｜图源：宝丰县文旅局公开资料"),
    "shuixi":   ("https://aka.doubaocdn.com/s/v0FZHVGqOT", "洛阳水席·牡丹燕菜成菜特写｜图源：真不同饭店公开资料"),
    "bianxiu":  ("https://aka.doubaocdn.com/s/txVtwyeEDS", "汴绣双面异色绣作品近景｜图源：开封汴绣厂公开资料"),
    "zhuxian":  ("https://aka.doubaocdn.com/s/UNe3EfLXsQ", "中国美术馆藏朱仙镇对刀门神｜图源：中国美术馆展陈"),
    "shaolin":  ("https://aka.doubaocdn.com/s/Kg3PpZ4Bwc", "少林寺塔林下雪中武僧演练｜图源：新华社2018"),
    "taiji":    ("https://aka.doubaocdn.com/s/2lQn3c9U6M", "温县陈家沟红门前练拳｜图源：china.org.cn 公开资料"),
    "dahuatie": ("https://aka.doubaocdn.com/s/h1pW3c6Z5b", "确山打铁花夜演金龙火雨｜图源：确山县文旅局公开资料"),
}

os.makedirs("assets", exist_ok=True)
new_entries = {}
for kid, (url, note) in picks.items():
    raw = "_audio_tmp/" + kid + ".photo.jpg"
    urllib.request.urlretrieve(url, raw)
    im = Image.open(raw).convert("RGB")
    w, h = im.size
    scale = 1200 / max(w, h)
    if scale < 1:
        im = im.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
    out = "assets/" + kid + ".jpg"
    im.save(out, "JPEG", quality=82, optimize=True)
    b64 = base64.b64encode(open(out, "rb").read()).decode()
    new_entries[kid] = (note, b64)
    print(kid, im.size, os.path.getsize(out), "bytes")

# 重写 treasury-real.js：保留原 5 键，替换新 10 键
src = open("treasury-real.js", encoding="utf-8").read()
# 提取原 5 个键（junci/ruci/sancai/nigugu/ninigou）的完整对象
old = {}
for k in ["junci", "ruci", "sancai", "nigugu", "ninigou"]:
    m = re.search(r'"' + k + r'":\s*\{[^}]*?src:\s*"data:image/jpeg;base64,([^"]+)"\s*\}', src, re.S)
    if not m:
        raise RuntimeError("missing old key " + k)
    old[k] = m.group(0)
# 从 src 里取出原 5 键的 name/note
old_meta = {}
for k in old:
    m = re.search(r'"' + k + r'":\s*\{name:\s*"([^"]*)",\s*note:\s*"([^"]*)"', src)
    old_meta[k] = (m.group(1), m.group(2))

order = ["junci","ruci","sancai","nigugu","ninigou","yuju","quju","zhuizi","majie","shuixi","bianxiu","zhuxian","shaolin","taiji","dahuatie"]
names = {
    "junci": "钧瓷 · 窑变釉花浇", "ruci": "汝瓷 · 天青釉洗", "sancai": "唐三彩 · 载乐骆驼",
    "nigugu": "淮阳泥泥狗 · 人面猴", "ninigou": "淮阳泥泥狗 · 陵狗",
    "yuju": "豫剧 · 梆子腔大戏", "quju": "曲剧 · 高跷曲子", "zhuizi": "河南坠子 · 一坠一简",
    "majie": "马街书会 · 正月十三", "shuixi": "洛阳水席 · 二十四道汤",
    "bianxiu": "汴绣 · 宋韵针笔", "zhuxian": "朱仙镇年画 · 门神千年",
    "shaolin": "少林功夫 · 禅武合一", "taiji": "陈氏太极拳 · 缠丝开合",
    "dahuatie": "确山打铁花 · 火树银花",
}
chunks = []
for k in order:
    if k in old:
        chunks.append('"' + k + '": ' + old[k][len('"'+k+'": '):])
    else:
        note, b64 = new_entries[k]
        chunks.append('"' + k + '": {name: "' + names[k] + '", note: "' + note + '", src: "data:image/jpeg;base64,' + b64 + '"}')
out = "var TREASURY_REAL = {\n" + ",\n".join(chunks) + "\n};\n"
open("treasury-real.js", "w", encoding="utf-8").write(out)
print("treasury-real.js new size", len(out))
