# -*- coding: utf-8 -*-
"""
scripts/build_three.py
把 three.js 0.186.1 ESM（core + main + OrbitControls）转成 IIFE 全局变量。

three.js 0.186 结构（minified）:
  build/three.core.min.js
    末尾 export{...447}
  build/three.module.min.js
    1) import{...197}from"./three.core.js"
    2) export{...248}from"./three.core.js"   （re-export，整句删除）
    3) 中间为非 core 代码（WebGLRenderer 等）
    4) 末尾 export{...196}
  examples/jsm/controls/OrbitControls.js
    import{...}from 'three'
    export{OrbitControls}

输出:
  vendor/three.min.js         (core + main 合并，window.THREE)
  vendor/OrbitControls.min.js (window.THREE.OrbitControls)

幂等：每次从原始 ESM 重新生成。
"""
import re, pathlib, sys, urllib.request

V = pathlib.Path(__file__).resolve().parent.parent / "vendor"
V.mkdir(exist_ok=True)

BASE = "https://cdn.jsdelivr.net/npm/three@0.186.1/"
FILES = {
    "three.module.min.js": BASE + "build/three.module.min.js",
    "three.core.min.js":   BASE + "build/three.core.min.js",
    "OrbitControls.js":    BASE + "examples/jsm/controls/OrbitControls.js",
}

def fetch(name, url):
    p = V / name
    if not p.exists():
        print(f"下载 {name} ...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            p.write_bytes(r.read())
    return p.read_text(encoding="utf-8")

IMP_RE = re.compile(r'''import\s*\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2\s*;?''', re.S)
EXP_FROM_RE = re.compile(r'''export\s*\{[^}]*\}\s*from\s*(['"])[^'"]+\1\s*;?''', re.S)
EXP_RE = re.compile(r'''export\s*\{([^}]*)\}\s*;?''', re.S)

def parse_names(group):
    out = []
    for n in group.split(","):
        n = n.strip()
        if not n:
            continue
        if " as " in n:
            orig, alias = [x.strip() for x in n.split(" as ")]
            out.append((orig, alias))
        else:
            out.append((n, n))
    return out

def esm_to_iife(src, assign_prefix):
    """
    通用 ESM → IIFE 转换。
    1) 收集所有 import{...}from'...' 的符号（去重），合并成一个 const{x,...}=window.THREE;
    2) 删除所有 import 语句
    3) 删除所有 export{...}from'...'（re-export 来源模块已挂载）
    4) 其余 export{...} 转 Object.assign(window.THREE, {...})
    assign_prefix: 每个导出对象的目标，如 'window.THREE' 或 'window.THREE'。
    """
    # 0) 先剥离 JSDoc 注释里的 import 示例（@three_import import{...}from'...'）
    src = re.sub(r'^[ \t]*\*?[ \t]*@three_import[^\n]*$', '', src, flags=re.M)
    # 1) 收集 import 符号
    imp_syms = []
    for m in IMP_RE.finditer(src):
        for orig, alias in parse_names(m.group(1)):
            if (orig, alias) not in imp_syms:
                imp_syms.append((orig, alias))
    # 2) 删除所有 import
    body = IMP_RE.sub("", src)
    # 3) 删除所有 re-export
    body = EXP_FROM_RE.sub("", body)
    # 4) export{...} → Object.assign
    def exp_repl(m):
        names = parse_names(m.group(1))
        pairs = ",".join((f"{a}:{o}" if o != a else o) for o, a in names)
        return f"Object.assign({assign_prefix},{{{pairs}}});"
    body = EXP_RE.sub(exp_repl, body)
    # 清掉 sourcemap
    body = re.sub(r"//# sourceMappingURL=[^\n]*", "", body)

    const_line = ""
    if imp_syms:
        const_line = "const {" + ",".join(a for _o, a in imp_syms) + "}=window.THREE;\n"
    iife = "(function(){\n" + const_line + body.strip() + "\n})();\n"
    return iife, len(imp_syms)

# ---- 1. core ----
core_src = fetch("three.core.min.js", FILES["three.core.min.js"])
core_iife, core_imp = esm_to_iife(core_src, "window.THREE")
core_exp = len(EXP_RE.findall(core_src))
print(f"core: {core_imp} imports, {core_exp} export 块")

# ---- 2. main ----
main_src = fetch("three.module.min.js", FILES["three.module.min.js"])
main_iife, main_imp = esm_to_iife(main_src, "window.THREE")
print(f"main: {main_imp} imports")

# ---- 3. 合并 core + main ----
header = "/* three.js 0.186.1 (MIT) — IIFE offline build by scripts/build_three.py */\n"
combined = (header
            + "window.THREE=window.THREE||{};\n"
            + core_iife
            + "\n"
            + main_iife)
(V / "three.min.js").write_text(combined, encoding="utf-8")
print(f"three.min.js: {(V/'three.min.js').stat().st_size/1024:.0f} KB")

# ---- 4. OrbitControls ----
oc_src = fetch("OrbitControls.js", FILES["OrbitControls.js"])
# OrbitControls 只有一个 export{OrbitControls}，先转成挂载
oc_src = re.sub(r"export\s*\{\s*OrbitControls\s*\}\s*;?",
                "window.THREE.OrbitControls=OrbitControls;", oc_src)
oc_iife, oc_imp = esm_to_iife(oc_src, "window.THREE")
(V / "OrbitControls.min.js").write_text(oc_iife, encoding="utf-8")
print(f"OrbitControls.min.js: {(V/'OrbitControls.min.js').stat().st_size/1024:.0f} KB")

# ---- 5. 自检：产物中不得残留真实 ESM 语句 ----
def check_no_esm(path):
    t = path.read_text(encoding="utf-8")
    bad = []
    for m in re.finditer(r"(^|[\s;{}])(import\s*[\{a-zA-Z\*]|export\s*[\{a-zA-Z])", t):
        # 排除字符串里的 imported/importance/exported 等
        seg = t[max(0, m.start()-2):m.end()+10]
        if any(w in seg for w in ("imported", "importance", "exported", "re-export", "reexport")):
            continue
        bad.append(seg)
    return bad

for f in ("three.min.js", "OrbitControls.min.js"):
    bad = check_no_esm(V / f)
    if bad:
        print(f"FAIL {f} 残留 ESM: {bad[:3]}", file=sys.stderr)
        sys.exit(1)
    print(f"自检通过 {f} 无 ESM 残留")
print("DONE")
