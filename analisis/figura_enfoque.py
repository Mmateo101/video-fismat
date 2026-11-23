"""Diagrama del enfoque del proyecto: etapa 1 (experimento controlado) → hallazgo → etapa 2 (datos reales) → prototipo.
Uso: python figura_enfoque.py  → figuras/enfoque.png"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

AQUI = os.path.dirname(os.path.abspath(__file__))
TINTA, ROJO, AZUL, SOL, MORADO, CREMA = "#1D2440", "#E4572E", "#2E86AB", "#F6AE2D", "#7B5EA7", "#FBF6EC"
plt.rcParams.update({"font.family": "serif", "font.size": 9})

fig, ax = plt.subplots(figsize=(7.4, 3.3))
ax.set_xlim(0, 100); ax.set_ylim(0, 42.5); ax.axis("off")


def caja(x, y, w, h, color, titulo, lineas, fg="white"):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=1.6", fc=color, ec="none"))
    ax.text(x + w / 2, y + h - 2.6, titulo, ha="center", va="top", color=fg, fontsize=9.5, fontweight="bold")
    for i, l in enumerate(lineas):
        ax.text(x + w / 2, y + h - 7.6 - i * 3.9, l, ha="center", va="top", color=fg, fontsize=8)


def flecha(x0, y0, x1, y1, color=TINTA):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle="-|>", mutation_scale=14, lw=1.8, color=color))


# etapa 1
caja(1, 17, 29, 25, AZUL, "Etapa 1 · experimento", ["21 + 16 datos del USGS", "serie de Fourier", "regresión trigonométrica", "A, R = 35, λ = 18 km"])
# hallazgo
caja(35.5, 22, 22, 15, SOL, "Hallazgo", ["T = 4 s también es", "la banda del mar"], fg=TINTA)
# etapa 2
caja(63, 17, 36, 25, ROJO, "Etapa 2 · expansión", ["20 sismos reales (G.UNM)", "transformada por ventanas", "huella del ruido antes de P", "sustracción espectral"])
flecha(30.6, 29.5, 35, 29.5)
flecha(58, 29.5, 62.5, 29.5)
# abajo: validación, resultado, prototipo
caja(9, 1, 25, 11, SOL, "Prototipo web", ["sismo-o-ruido.vercel.app"], fg=TINTA)
caja(38, 1, 25, 11, TINTA, "Resultado", ["SNR +10.5 dB (×11)"])
caja(67, 1, 25, 11, MORADO, "Validación", ["sintético · ruido real"])
flecha(81, 16.6, 81, 12.6, ROJO)
flecha(66.5, 6.5, 63.5, 6.5)
flecha(37.5, 6.5, 34.5, 6.5)
fig.tight_layout(pad=0.2)
os.makedirs(os.path.join(AQUI, "figuras"), exist_ok=True)
fig.savefig(os.path.join(AQUI, "figuras", "enfoque.png"), dpi=300)
print("Listo")
