# -*- coding: utf-8 -*-
"""
scan_videos.py —— 扫描 assets/video/ 下的视频，自动登记到 data.js 的 HALL_VIDEOS。
用法：把视频用非遗 id 命名（如 junci.mp4）放进 assets/video/，然后运行本脚本：
    python scan_videos.py
"""
import io, os, re, sys

base = os.path.dirname(os.path.abspath(__file__))
vdir = os.path.join(base, 'assets', 'video')
dp = os.path.join(base, 'data.js')

if not os.path.isdir(vdir):
    print('未找到目录', vdir); sys.exit(1)

exts = ('.mp4', '.webm', '.m4v', '.mov')
found = {}
for fn in sorted(os.listdir(vdir)):
    name, ext = os.path.splitext(fn)
    if ext.lower() in exts:
        found[name] = 'assets/video/' + fn

if not found:
    print('assets/video/ 里还没有视频文件。请先放入（用非遗 id 命名），再运行本脚本。')

lines = ['var HALL_VIDEOS = {']
items = ['  "%s": "%s"' % (k, v) for k, v in sorted(found.items())]
lines.append((',\n'.join(items)) if items else '')
lines.append('};')
block = '\n'.join(lines)

ds = io.open(dp, encoding='utf-8', newline='').read()
pat = re.compile(r'var HALL_VIDEOS = \{.*?\};', re.S)
if not pat.search(ds):
    print('data.js 里没有 HALL_VIDEOS，无法替换'); sys.exit(1)
ds = pat.sub(block.replace('\n', '\r\n'), ds, count=1)
io.open(dp, 'w', encoding='utf-8', newline='').write(ds)

print('已登记 %d 个视频：' % len(found))
for k, v in sorted(found.items()):
    print('  ', k, '->', v)
print('完成，刷新页面即可在沉浸演绎看到视频。')
