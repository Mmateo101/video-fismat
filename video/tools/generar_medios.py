"""Genera js/medios.js: las grabaciones del equipo colocadas en el video y un mapa de tiempo por escena
para quitar silencios largos sin acelerar la voz.
- Cada frase empieza cuando termina la anterior, con un respiro (RESPIRO).
- La animación entre frases se ajusta con una deformación de tiempo por tramos, a lo más ×VEL_MAX.
Uso: python tools/generar_medios.py"""
import json, os, re, subprocess
from mapa_grabaciones import MAPA, TR, G

AQUI = os.path.dirname(os.path.abspath(__file__))
RESPIRO = 0.55      # s entre el final de una frase y el inicio de la siguiente
VEL_MAX = 1.5       # la animación se acelera como máximo esto
PRE, POST = 0.10, 0.18   # s que se dejan antes y después de la voz en cada recorte

# Texto de los subtítulos tal como se grabó (corrige lo que dijeron distinto al guion)
TEXTO = {
    ("historia", 1): "Hasta que las rocas se rompen.",
    ("historia", 4): "Las estaciones sismológicas lo escuchan en segundos.",
    ("equipo", 0): "Somos Mateo, Víctor y Sofía, estudiantes de profesional del Tecnológico de Monterrey.",
    ("alcance", 0): "Empezamos con datos de prueba. Dos registros cortos, un dato cada 0.4 segundos.",
    ("alcance", 1): "Luego los llevamos a una base de datos real. Veinte sismos de México, de 1993 a 2026.",
    ("alcance", 2): "Todos los sismos, registrados en Ciudad Universitaria. No buscamos predecir sismos, sino reconocerlos.",
    ("metodo", 0): "Primero ajustamos una serie de Fourier a estos datos de prueba.",
    ("metodo", 6): "Lo probamos con datos sintéticos y con ruido real.",
    ("demo", 0): "Con todo esto construimos Sismo o ruido, una página web abierta para cualquiera.",
    ("demo", 1): "Elige un sismo en el mapa. Por ejemplo, el de Puebla-Morelos de 2017.",
    ("demo", 4): "Hasta puedes escuchar el sismo, acelerado 400 veces.",
    ("cierre", 0): "Fourier sí separa el sismo del ruido cuando sus frecuencias son distintas.",
    ("cierre", 1): "Cuando comparten frecuencias, como con el mar, también hay que ver el tiempo.",
    ("cierre", 2): "Una herramienta que acerque las alertas a donde hay menos sensores.",
}
# Clips sin hablar (saludo y despedida). Mateo usa el mismo clip para saludar y despedirse.
MUDOS = [
    ("equipo", "A1", "Mateo/saludo_despedida.mp4", "mateo/saludo", 0.0, 5.0),
    ("equipo", "A2", "Victor/WhatsApp Video 2026-11-22 at 10.13.41 PM (4).mp4", "victor/saludo", 0.0, 2.38),
    ("equipo", "A3", "Sofia/WhatsApp Video 2026-11-22 at 10.08.53 PM.mp4", "sofia/saludo", 0.0, 4.5),
    ("cierre", "F1", "Mateo/saludo_despedida.mp4", "mateo/saludo", 0.0, 5.0),
    ("cierre", "F2", "Victor/WhatsApp Video 2026-11-22 at 10.13.41 PM.mp4", "victor/despedida", 0.0, 4.77),
    ("cierre", "F3", "Sofia/WhatsApp Video 2026-11-22 at 10.14.18 PM.mp4", "sofia/despedida", 0.0, 2.98),
]
CAM = {("problema", 0): "B", ("problema", 1): "B", ("idea", 0): "C", ("metodo", 0): "D", ("cierre", 0): "E1", ("cierre", 1): "E2", ("cierre", 2): "E3"}


def slug(f):
    q, n = f.split("/")
    m = re.search(r"(\d+)\.(\d+)\.(\d+) (AM|PM)( \((\d)\))?", n)
    return q.lower() + "/" + "".join(m.group(1, 2, 3)) + (m.group(6) or "")


esc = {e["id"]: e for e in G["escenas"]}
por_linea = {v: k for k, v in MAPA.items()}
salida_esc, medios = [], []
t_abs = 0.0
for e in G["escenas"]:
    voz = e["voz"]
    nudos = [(0.0, 0.0)]
    b_prev_fin = None
    lineas = []
    for i, v in enumerate(voz):
        f = por_linea.get((e["id"], i))
        a = v["t0"]
        if f is None:  # línea sin grabación propia (alcance 1, va dentro de la grabación anterior)
            lineas.append((i, None, a, None))
            continue
        r = TR[f]
        dur_voz = r["voz_fin"] - r["voz_ini"]
        if b_prev_fin is None:
            b = a if a <= 1.0 else max(0.8, a / VEL_MAX)
        else:
            a_prev = nudos[-1][0]
            b = max(b_prev_fin + RESPIRO, nudos[-1][1] + (a - a_prev) / VEL_MAX)
        nudos.append((a, b))
        b_prev_fin = b + dur_voz
        lineas.append((i, f, a, b))
    # cola: lo que queda de animación después de la última frase
    a_ult, b_ult = nudos[-1]
    cola = e["dur"] - a_ult
    D = e["dur"] if b_prev_fin is None else max(b_prev_fin + 0.8, b_ult + cola / VEL_MAX)
    nudos.append((e["dur"], D))

    def warp(t):
        for (a0, b0), (a1, b1) in zip(nudos, nudos[1:]):
            if t <= a1:
                return b0 + (t - a0) * (b1 - b0) / (a1 - a0) if a1 > a0 else b0
        return nudos[-1][1]

    vz = []
    for i, f, a, b in lineas:
        v = voz[i]
        txt = TEXTO.get((e["id"], i), v["x"])
        if f is None:
            # alcance 1: empieza donde la grabación dice «Luego…»
            prev = [l for l in lineas if l[0] == i - 1][0]
            r = TR[prev[1]]
            t_luego = 8.76  # s dentro de la grabación 9.52.05 donde empieza «Luego»
            b = prev[3] + (t_luego - r["voz_ini"])
            vz[-1]["t1"] = round(b - 0.15, 2)
            vz.append({"t0": round(b, 2), "t1": round(prev[3] + r["voz_fin"] - r["voz_ini"], 2), "q": v["q"], "rec": v.get("rec"), "x": txt})
            continue
        r = TR[f]
        d = r["voz_fin"] - r["voz_ini"]
        vz.append({"t0": round(b, 2), "t1": round(b + d, 2), "q": v["q"], "rec": v.get("rec"), "x": txt})
        m = {"escena": e["id"], "orig": f, "src": slug(f), "abs": round(t_abs + b - PRE, 3), "ss": round(max(0, r["voz_ini"] - PRE), 3),
             "hasta": round(min(r["dur"], r["voz_fin"] + POST), 3), "audio": True}
        if (e["id"], i) in CAM:
            m["video"] = True; m["cam"] = CAM[(e["id"], i)]
        medios.append(m)
    for (eid, cam, f, src, ss, hasta) in MUDOS:
        if eid != e["id"]:
            continue
        # el clip entra cuando aparece su marco (t0 original del marco en cameos.json)
        c = [x for x in json.load(open(os.path.join(AQUI, "..", "render", "cameos_orig.json"), encoding="utf-8")) if x["id"] == cam][0]
        t0_esc = sum(x["dur"] for x in G["escenas"][:G["escenas"].index(e)])
        medios.append({"escena": eid, "orig": f, "src": src, "abs": round(t_abs + warp(c["t0"] - t0_esc), 3), "ss": ss, "hasta": hasta, "video": True, "cam": cam, "bucle": True})
    salida_esc.append({"id": e["id"], "dur": round(D, 2), "nudos": [[round(a, 3), round(b, 3)] for a, b in nudos], "voz": vz})
    acel = max([(a1 - a0) / (b1 - b0) for (a0, b0), (a1, b1) in zip(nudos, nudos[1:]) if b1 > b0] or [1])
    print(f"{e['id']:10s} {e['dur']:5.1f} s → {D:5.1f} s   acel. máx ×{acel:.2f}")
    t_abs += D

print(f"TOTAL {sum(e['dur'] for e in G['escenas']):.1f} s → {t_abs:.1f} s")
js = "/* Generado por tools/generar_medios.py: grabaciones colocadas y mapa de tiempo por escena. No editar a mano. */\n"
js += "window.MEDIOS = " + json.dumps({"escenas": salida_esc, "medios": medios}, ensure_ascii=False, indent=1) + ";\n"
open(os.path.join(AQUI, "..", "js", "medios.js"), "w", encoding="utf-8").write(js)
