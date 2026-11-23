"""Genera guion/Guion_Grabacion_Cameos_y_Voz.docx a partir de video/js/guion.js
(mismo formato que el guion del video de Estadística).
Uso: node -e (ver HANDOFF) para el JSON, luego python guion_docx.py <guion.json>"""
import copy, json, sys, os
import docx
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AQUI = os.path.dirname(os.path.abspath(__file__))
PLANTILLA = sys.argv[2] if len(sys.argv) > 2 else None
D = json.load(open(sys.argv[1], encoding="utf-8"))

COL = {"VOZ EN OFF": ("2E86AB", "FFFFFF"), "CAMEO": ("F6AE2D", "1D2440"), "SALUDO": ("7B5EA7", "FFFFFF"), "DESPEDIDA": ("7B5EA7", "FFFFFF")}
ROW = {"VOZ EN OFF": "E3F1F8", "CAMEO": "FDEFD3", "SALUDO": "EFEAF7", "DESPEDIDA": "EFEAF7"}
mmss = lambda t: f"{int(t // 60)}:{t % 60:04.1f}"


def sombra(celda, hexcolor):
    tcPr = celda._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd"); shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def texto(celda, txt, bold=False, color=None, size=10.5, italic=False):
    celda.text = ""
    p = celda.paragraphs[0]
    for i, linea in enumerate(txt.split("\n")):
        if i:
            p = celda.add_paragraph()
        r = p.add_run(linea); r.bold = bold; r.italic = italic; r.font.size = Pt(size)
        if color: r.font.color.rgb = RGBColor.from_string(color)


def etiqueta(celda, tipo, sub=""):
    fondo, letra = COL[tipo]
    sombra(celda, fondo)
    texto(celda, tipo + ("\n" + sub if sub else ""), bold=True, color=letra, size=10)


def tabla(doc, filas, cols, anchos):
    t = doc.add_table(rows=filas, cols=cols)
    t.style = doc.styles["Table Grid"] if "Table Grid" in [s.name for s in doc.styles] else t.style
    for fila in t.rows:
        for j, c in enumerate(fila.cells):
            c.width = Cm(anchos[j])
    return t


# documento base: plantilla de Estadística (estilos) o uno nuevo
if PLANTILLA and os.path.exists(PLANTILLA):
    doc = docx.Document(PLANTILLA)
    body = doc.element.body
    for el in list(body):
        if el.tag.endswith("sectPr"):
            continue
        body.remove(el)
else:
    doc = docx.Document()

# ---------- lista de lo que dice cada quien ----------
equipo = ["Mateo", "Víctor", "Sofía"]
items = []
for e in D["escenas"]:
    for v in e["voz"]:
        quien = v["rec"] if v["q"] == "voz" else v["q"]
        items.append({"t": e["t0"] + v["t0"], "dur": v["t1"] - v["t0"], "tipo": "VOZ EN OFF" if v["q"] == "voz" else "CAMEO",
                      "quien": quien, "escena": e["nombre"], "x": v["x"]})
for c in D["cameos"]:
    if c["tipo"] in ("Saludo", "Despedida"):
        items.append({"t": c["t0"], "dur": 3.5, "tipo": c["tipo"].upper(), "quien": c["quien"], "escena": "", "x": "Clip de 3 a 4 s " + ("saludando" if c["tipo"] == "Saludo" else "despidiéndote") + " a cámara, sin hablar."})
items.sort(key=lambda i: i["t"])

# ---------- portada ----------
doc.add_paragraph("Video para Expo Ingenierías")
doc.add_paragraph("Guion de grabación: cameos y voz en off", style="Title")
doc.add_paragraph("Análisis espectral de Fourier para alertas de señales sísmicas inclusivas · Análisis de Métodos Matemáticos para la Física · Video «Sismo o ruido», " + mmss(D["dur"]))
doc.add_paragraph("Aquí está todo lo que hay que grabar para el video. Cada quien busque su nombre. Ahí viene exactamente qué decir y cómo grabarlo. Nada es grupal, cada toma es de una sola persona. Las animaciones ya están hechas y cada grabación entra en su marco.")

doc.add_heading("Qué es cada cosa", level=1)
t = tabla(doc, 3, 2, [3.5, 13])
for i, (tipo, desc) in enumerate([
    ("CAMEO", "Sales tú a cuadro, mirando a la cámara, y dices tu frase. El video entra en un marco dentro de la animación."),
    ("VOZ EN OFF", "Solo se oye la voz, no sale nadie a cuadro. La animación explica mientras tú narras."),
    ("SALUDO", "Clip corto de 3 a 4 s, sin hablar, saludando o despidiéndote a cámara.")]):
    etiqueta(t.rows[i].cells[0], tipo); texto(t.rows[i].cells[1], desc)

doc.add_heading("Resumen: quién graba qué", level=1)
t = tabla(doc, 1 + len(equipo), 5, [2.6, 4.4, 2.8, 3.5, 3.2])
for j, h in enumerate(["Quién", "Cameo (a cámara)", "Voz en off", "Clips sin hablar", "Fecha límite"]):
    texto(t.rows[0].cells[j], h, bold=True); sombra(t.rows[0].cells[j], "D9DDE8")
for i, q in enumerate(equipo):
    mis = [x for x in items if x["quien"] == q]
    cam = sorted(set(x["escena"] for x in mis if x["tipo"] == "CAMEO"))
    nvoz = sum(1 for x in mis if x["tipo"] == "VOZ EN OFF")
    texto(t.rows[i + 1].cells[0], q, bold=True)
    texto(t.rows[i + 1].cells[1], "\n".join(cam) or "—")
    texto(t.rows[i + 1].cells[2], f"{nvoz} frases")
    texto(t.rows[i + 1].cells[3], "Saludo y despedida")
    texto(t.rows[i + 1].cells[4], "________")

doc.add_heading("Cómo grabar", level=1)
doc.add_heading("Cameos y clips", level=2)
for s in ["Celular en horizontal, en 1080p y 30 fps.", "Celular fijo (tripié o recargado), a la altura de los ojos.",
          "Plano medio, de la cintura para arriba, mirando a la cámara.", "Luz de frente. La ventana delante de ti, nunca detrás.",
          "Lugar callado, con el micrófono o los audífonos cerca de la boca.", "Un segundo de silencio antes y después de hablar.",
          "Tres tomas de cada frase, hablando despacio. Se dice tal cual está escrita, ya está revisada contra el reporte."]:
    doc.add_paragraph(s, style="List Paragraph" if "List Paragraph" in [x.name for x in doc.styles] else None)
doc.add_heading("Voz en off", level=2)
for s in ["Solo audio (sirve la grabadora del celular), en un cuarto callado y con poco eco. Un clóset con ropa funciona muy bien.",
          "Grabar todo seguido, en orden, con dos segundos de silencio entre frases.",
          "Despacio y claro. Si una frase sale mal, se repite completa.",
          "La columna «Dura» es el tiempo que hay en el video para esa frase. Si te pasas, dilo un poco más rápido."]:
    doc.add_paragraph(s, style="List Paragraph" if "List Paragraph" in [x.name for x in doc.styles] else None)

doc.add_heading("Lo que graba cada quien", level=1)
for q in equipo:
    doc.add_heading(q, level=2)
    mis = [x for x in items if x["quien"] == q]
    t = tabla(doc, len(mis), 2, [3.8, 12.7])
    for i, x in enumerate(mis):
        sub = f"{x['escena']}\nentra {mmss(x['t'])} · dura {x['dur']:.1f} s" if x["tipo"] in ("CAMEO", "VOZ EN OFF") else f"entra {mmss(x['t'])}"
        etiqueta(t.rows[i].cells[0], x["tipo"], sub)
        texto(t.rows[i].cells[1], ("«" + x["x"] + "»") if x["tipo"] in ("CAMEO", "VOZ EN OFF") else x["x"], size=11)

doc.add_heading("Guion completo, en orden", level=1)
doc.add_paragraph("Todo el video de principio a fin, para que se vea dónde entra cada cosa. Las filas azules son voz en off, las ámbar son cameos y las moradas son clips sin hablar.")
t = tabla(doc, 1 + len(items), 4, [1.8, 2.6, 2.2, 9.9])
for j, h in enumerate(["Minuto", "Qué es", "Quién", "Qué se dice"]):
    texto(t.rows[0].cells[j], h, bold=True); sombra(t.rows[0].cells[j], "D9DDE8")
for i, x in enumerate(items):
    fila = t.rows[i + 1].cells
    for c in fila:
        sombra(c, ROW[x["tipo"]])
    texto(fila[0], mmss(x["t"])); texto(fila[1], x["tipo"], bold=True, size=9); texto(fila[2], x["quien"]); texto(fila[3], x["x"])

doc.add_heading("Cómo se dicen las cifras", level=1)
cifras = [("USGS", "u ese ge ese"), ("0.4 segundos", "cero punto cuatro segundos"), ("1993 a 2026", "mil novecientos noventa y tres a dos mil veintiséis"),
          ("35 veces", "treinta y cinco veces"), ("18 kilómetros", "dieciocho kilómetros"), ("71 a 86 por ciento", "setenta y uno a ochenta y seis por ciento"),
          ("Puebla-Morelos de 2017", "Puebla Morelos de dos mil diecisiete"), ("Fourier", "furié")]
t = tabla(doc, 1 + len(cifras), 2, [6, 10.5])
texto(t.rows[0].cells[0], "Escrito", bold=True); texto(t.rows[0].cells[1], "Se dice", bold=True)
for i, (a, b) in enumerate(cifras):
    texto(t.rows[i + 1].cells[0], a); texto(t.rows[i + 1].cells[1], b)

doc.add_heading("Cómo mandar los archivos", level=1)
for s in ["Mandar los videos y audios originales por Google Drive o OneDrive, no por WhatsApp, porque los comprime.",
          "Nombre del archivo quién_qué_toma. Por ejemplo Victor_cameo_problema_toma2.mp4, Sofia_voz_historia.m4a, Mateo_saludo.mp4.",
          "Si una toma les gustó más, avisen cuál."]:
    doc.add_paragraph(s, style="List Paragraph" if "List Paragraph" in [x.name for x in doc.styles] else None)

salida = os.path.join(AQUI, "Guion_Grabacion_Cameos_y_Voz.docx")
doc.save(salida)
print("Listo:", salida, len(items), "tomas")
