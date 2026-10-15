# -*- coding: utf-8 -*-
import base64, io, os, struct, urllib.request
import numpy as np

items = [
    ("yuju", "https://aka.doubaocdn.com/s/ieybK00cSk"),
    ("quju", "https://aka.doubaocdn.com/s/zhDL4kVjZV"),
    ("zhuizi", "https://aka.doubaocdn.com/s/JzAkMIPBUB"),
    ("majie", "https://aka.doubaocdn.com/s/BQuiUA8IXJ"),
    ("shuixi", "https://aka.doubaocdn.com/s/It9L9Gs3A8"),
    ("bianxiu", "https://aka.doubaocdn.com/s/OSrvinNtAa"),
    ("zhuxian", "https://aka.doubaocdn.com/s/u5mqUDAog0"),
    ("shaolin", "https://aka.doubaocdn.com/s/Kg2UP2yVaz"),
    ("taiji", "https://aka.doubaocdn.com/s/bNBluHNOI7"),
    ("dahuatie", "https://aka.doubaocdn.com/s/rUUJ3O48YU"),
]

def load_pcm(path):
    with open(path, "rb") as f:
        data = f.read()
    # WAV header: RIFF....WAVEfmt .... 找 data chunk
    # 简单解析：fmt chunk 16 bytes after "fmt "
    idx = data.find(b"fmt ")
    if idx < 0:
        raise RuntimeError("no fmt")
    # skip chunk id(4)+size(4)
    p = idx + 8
    audio_fmt, nch, sr, br, ba, bw = struct.unpack("<HHIIHH", data[p:p+16])
    p += 16
    # skip any extra params
    # next chunk should be "data"
    didx = data.find(b"data", p)
    if didx < 0:
        raise RuntimeError("no data")
    dsize = struct.unpack("<I", data[didx+4:didx+8])[0]
    pcm = data[didx+8: didx+8+dsize]
    if bw == 16:
        arr = np.frombuffer(pcm, dtype="<i2")
    else:
        raise RuntimeError("unsupported bits " + str(bw))
    if nch == 2:
        arr = arr.reshape(-1, 2).mean(axis=1).astype("<i2")
    elif nch != 1:
        raise RuntimeError("unsupported ch " + str(nch))
    return sr, arr

def to_16k_mono(src_sr, samples):
    if src_sr == 16000:
        return samples
    # linear resample
    n_out = int(round(len(samples) * 16000.0 / src_sr))
    idx = np.linspace(0, len(samples) - 1, n_out)
    out = np.interp(idx, np.arange(len(samples)), samples.astype(np.float32))
    return out.astype("<i2")

def write_wav(path, sr, samples):
    n = len(samples)
    byte_rate = sr * 1 * 2
    hdr = b"RIFF" + struct.pack("<I", 36 + n*2) + b"WAVE"
    hdr += b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sr, byte_rate, 2, 16)
    hdr += b"data" + struct.pack("<I", n*2)
    with open(path, "wb") as f:
        f.write(hdr + samples.tobytes())

os.makedirs("_audio_tmp", exist_ok=True)
chunks = []
for kid, url in items:
    raw = "_audio_tmp/" + kid + ".raw.wav"
    out = "_audio_tmp/" + kid + ".16k.wav"
    if not os.path.exists(raw):
        urllib.request.urlretrieve(url, raw)
    sr, s = load_pcm(raw)
    s16 = to_16k_mono(sr, s)
    write_wav(out, 16000, s16)
    data = open(out, "rb").read()
    b64 = base64.b64encode(data).decode()
    dur = len(s16) / 16000.0
    print(kid, "src_sr", sr, "wav", len(data), "dur", round(dur, 1), "s")
    chunks.append('  "' + kid + '": "data:audio/wav;base64,' + b64 + '"')

s = open("treasury-audio.js", encoding="utf-8").read()
rst = s.rstrip()
assert rst.endswith("};"), rst[-60:]
body = rst[:-2].rstrip()
assert body.endswith('"'), body[-80:]
new = body + ",\n" + ",\n".join(chunks) + "\n};"
open("treasury-audio.js", "w", encoding="utf-8").write(new)
print("treasury-audio.js new size", len(new))
