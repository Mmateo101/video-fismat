"""Relaciona cada grabación con su línea del guion y compara duraciones.
Uso: python tools/mapa_grabaciones.py"""
import json, os, re, subprocess
AQUI = os.path.dirname(os.path.abspath(__file__))
TR = json.load(open(os.path.join(AQUI, "..", "grabaciones", "transcripcion.json"), encoding="utf-8"))
G = json.loads(subprocess.run(["node", "-e", "globalThis.window={};new Function('window',require('fs').readFileSync('js/guion.js','utf8'))(window);console.log(JSON.stringify(window.GUION))"],
                              cwd=os.path.join(AQUI, ".."), capture_output=True, text=True, encoding="utf-8").stdout)

# archivo → (escena, índice de línea) ; los clips mudos van aparte
MAPA = {
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.01.57 PM.ogg": ("historia", 0),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.00 PM.ogg": ("historia", 1),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.06 PM.ogg": ("historia", 2),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.11 PM.ogg": ("historia", 3),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.16 PM.ogg": ("historia", 4),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.23 PM.ogg": ("historia", 5),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.02.27 PM.ogg": ("historia", 6),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.50.32 PM.ogg": ("equipo", 0),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.50.43 PM.ogg": ("equipo", 1),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.51.21 PM.ogg": ("equipo", 2),
    "Victor/WhatsApp Video 2026-11-22 at 10.13.41 PM (1).mp4": ("problema", 0),
    "Victor/WhatsApp Video 2026-11-22 at 10.13.41 PM (2).mp4": ("problema", 1),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.17.39 PM.ogg": ("problema", 2),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.17.48 PM.ogg": ("problema", 3),
    "Sofia/WhatsApp Video 2026-11-22 at 10.12.41 PM.mp4": ("idea", 0),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.12.53 PM.ogg": ("idea", 1),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.01 PM.ogg": ("idea", 2),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.52.05 PM.ogg": ("alcance", 0),   # líneas 0 y 1 juntas
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.52.24 PM.ogg": ("alcance", 2),
    "Mateo/WhatsApp Video 2026-11-22 at 9.58.38 PM.mp4": ("metodo", 0),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.52.54 PM.ogg": ("metodo", 1),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.53.08 PM.ogg": ("metodo", 2),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.53.19 PM.ogg": ("metodo", 3),
    "Mateo/WhatsApp Ptt 2026-11-22 at 9.59.42 PM.ogg": ("metodo", 4),
    "Mateo/WhatsApp Ptt 2026-11-22 at 10.03.12 PM.ogg": ("metodo", 5),
    "Mateo/WhatsApp Ptt 2026-11-22 at 10.03.20 PM.ogg": ("metodo", 6),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.17.58 PM.ogg": ("resultados", 0),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.18.10 PM.ogg": ("resultados", 1),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.18.24 PM.ogg": ("resultados", 2),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.18.34 PM.ogg": ("resultados", 3),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.18.54 PM.ogg": ("resultados", 4),
    "Victor/WhatsApp Ptt 2026-11-22 at 10.19.04 PM.ogg": ("resultados", 5),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.08 PM.ogg": ("demo", 0),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.14 PM.ogg": ("demo", 1),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.19 PM.ogg": ("demo", 2),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.25 PM.ogg": ("demo", 3),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.31 PM.ogg": ("demo", 4),
    "Sofia/WhatsApp Ptt 2026-11-22 at 10.13.35 PM.ogg": ("demo", 5),
    "Victor/WhatsApp Video 2026-11-22 at 10.13.41 PM (3).mp4": ("cierre", 0),
    "Sofia/WhatsApp Video 2026-11-22 at 10.13.55 PM.mp4": ("cierre", 1),
    "Mateo/WhatsApp Video 2026-11-22 at 10.08.26 PM.mp4": ("cierre", 2),
    "Mateo/WhatsApp Ptt 2026-11-22 at 10.03.33 PM.ogg": ("cierre", 3),
}
if __name__ == "__main__":
    esc = {e["id"]: e for e in G["escenas"]}
    print(f"{'escena':10s} {'#':>2s} {'hueco':>6s} {'voz':>6s} {'sobra':>6s}  texto grabado")
    for f, (e, i) in MAPA.items():
        v = esc[e]["voz"][i]
        hueco = (esc[e]["voz"][i + 1]["t0"] if i + 1 < len(esc[e]["voz"]) else esc[e]["dur"]) - v["t0"]
        if e == "alcance" and i == 0:
            hueco = esc[e]["voz"][2]["t0"] - v["t0"]
        voz = TR[f]["voz_fin"] - TR[f]["voz_ini"]
        print(f"{e:10s} {i:2d} {hueco:6.1f} {voz:6.1f} {hueco - voz:6.1f}  {TR[f]['texto'][:70]}")
