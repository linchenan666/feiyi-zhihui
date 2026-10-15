# -*- coding: utf-8 -*-
import urllib.request, os, wave, io, base64, re, struct
import numpy as np

jobs = {
    "majie":  "https://aka.doubaocdn.com/s/yZE6AZlFNQ",
    "shuixi": "https://aka.doubaocdn.com/s/l2IEBpDNTt",
}

def to_16k_mono(path):
    with wave.open(path, "rb") as w:
        nch, sw, fr, nfr, _, _ = w.getparams()
        raw = w.readframes(nfr)
    dtype = {1: np.uint8, 2: np.int16, 4: np.int32}[sw]
    a = np.frombuffer(raw, dtype=dtype).astype(np.float32)
    if nch > 1:
        a = a.reshape(-1, nch).mean(axis=1)
    if sw == 1:
        a = (a - 128) / 128.0
    elif sw == 2:
        a = a / 32768.0
    else:
        a = a / 2147483648.0
    if fr != 16000:
        x_old = np.linspace(0, 1, len(a))
        x_new = np.linspace(0, 1, int(len(a) * 16000 / fr))
        a = np.interp(x_new, x_old, a)
    a = np.clip(a, -1.0, 1.0)
    pcm = (a * 32767).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
        w.writeframes(pcm.tobytes())
    return buf.getvalue(), len(pcm)/16000.0

new_b64 = {}
for k, url in jobs.items():
    raw_path = f"_audio_tmp/{k}.new.wav"
    urllib.request.urlretrieve(url, raw_path)
    wav_bytes, dur = to_16k_mono(raw_path)
    new_b64[k] = base64.b64encode(wav_bytes).decode()
    print(k, "dur=%.2fs" % dur, "b64=%d" % len(new_b64[k]))

src = open("treasury-audio.js", encoding="utf-8").read()
for k, b64 in new_b64.items():
    # 形如  majie: "data:audio/wav;base64,...."
    pat = re.compile('"' + k + r'":\s*"data:audio/wav;base64,[A-Za-z0-9+/=]*"')
    new = '"' + k + '": "data:audio/wav;base64,' + b64 + '"'
    src, n = pat.subn(new, src)
    print("replace", k, "count", n)

open("treasury-audio.js", "w", encoding="utf-8").write(src)
print("treasury-audio.js size", len(src))
