"""Transcribe las grabaciones del equipo (video/grabaciones) y guarda texto, duración y
tramo con voz (sin silencios al inicio y al final) en grabaciones/transcripcion.json.
Uso: python -I tools/transcribir.py <carpeta grabaciones>"""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

raiz = sys.argv[1]
modelo = WhisperModel("small", device="cpu", compute_type="int8")
salida = {}
for quien in sorted(os.listdir(raiz)):
    d = os.path.join(raiz, quien)
    if not os.path.isdir(d):
        continue
    for f in sorted(os.listdir(d)):
        if not f.lower().endswith((".ogg", ".mp4", ".m4a", ".mov", ".mp3", ".wav")):
            continue
        ruta = os.path.join(d, f)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ruta],
                                   capture_output=True, text=True).stdout.strip() or 0)
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
        audio = np.frombuffer(pcm, dtype=np.float32)
        segs, _ = modelo.transcribe(audio, language="es", vad_filter=True, word_timestamps=True)
        segs = list(segs)
        palabras = [w for s in segs for w in (s.words or [])]
        texto = " ".join(s.text.strip() for s in segs)
        ini = palabras[0].start if palabras else 0.0
        fin = palabras[-1].end if palabras else dur
        salida[f"{quien}/{f}"] = {"quien": quien, "dur": round(dur, 2), "voz_ini": round(ini, 2), "voz_fin": round(fin, 2), "texto": texto}
        print(f"{quien:7s} {dur:6.2f}s [{ini:5.2f}-{fin:5.2f}] {f[:40]:40s} | {texto}", flush=True)
json.dump(salida, open(os.path.join(raiz, "transcripcion.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
