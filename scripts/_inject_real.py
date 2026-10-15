# -*- coding: utf-8 -*-
import base64, io
from PIL import Image

items = [
 ("yuju", "豫剧 · 梆子腔大戏", "河南豫剧院演出剧照｜图源：河南非遗保护中心公开资料"),
 ("quju", "曲剧 · 高跷曲子", "曲剧《卷席筒》舞台照｜图源：洛阳曲剧院公开资料"),
 ("zhuizi", "河南坠子 · 一坠一简", "坠子艺人书场演唱｜图源：河南曲艺志公开资料"),
 ("majie", "马街书会 · 正月十三", "宝丰马街书会田野书棚｜图源：宝丰县文旅局公开资料"),
 ("shuixi", "洛阳水席 · 二十四道汤", "牡丹燕菜与水席成席｜图源：真不同饭店公开资料"),
 ("bianxiu", "汴绣 · 宋韵针笔", "汴绣双面绣作品近景｜图源：开封汴绣厂公开资料"),
 ("zhuxian", "朱仙镇年画 · 门神千年", "朱仙镇木版年画门神秦琼｜图源：朱仙镇木版年画博物馆"),
 ("shaolin", "少林功夫 · 禅武合一", "少林寺武僧套路表演｜图源：嵩山少林寺公开资料"),
 ("taiji", "陈氏太极拳 · 缠丝开合", "陈家沟太极拳发劲｜图源：温县陈家沟公开资料"),
 ("dahuatie", "确山打铁花 · 火树银花", "确山铁花夜演金花雨｜图源：确山县文旅局公开资料"),
]

out = []
for kid, name, note in items:
    p = "assets/" + kid + ".jpg"
    im = Image.open(p).convert("RGB")
    w, h = im.size
    m = max(w, h)
    if m > 1200:
        s = 1200.0 / m
        im = im.resize((int(w * s), int(h * s)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=80, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    out.append('  "' + kid + '": {name: "' + name + '", note: "' + note + '", src: "data:image/jpeg;base64,' + b64 + '"}')
    print(kid, len(buf.getvalue()), "bytes")

s = open("treasury-real.js", encoding="utf-8").read()
rst = s.rstrip()
assert rst.endswith("};"), rst[-60:]
body = rst[:-2].rstrip()
assert body.endswith("}"), body[-80:]
new = body + ",\n" + ",\n".join(out) + "\n};"
open("treasury-real.js", "w", encoding="utf-8").write(new)
print("treasury-real.js new size", len(new))
