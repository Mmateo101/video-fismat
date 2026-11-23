import numpy as np

# Datos del USGS (aceleracion normalizada, un dato cada 0.4 s)
x = np.array([0.02, 0.08, 0.21, 0.35, 0.41, 0.29, 0.10, -0.12, -0.31, -0.38, -0.25,
              -0.04, 0.18, 0.33, 0.39, 0.27, 0.05, -0.17, -0.34, -0.40, -0.22])
r = np.array([0.03, 0.05, 0.07, 0.04, 0.02, -0.01, -0.05, -0.06, -0.04, -0.01,
              0.03, 0.06, 0.07, 0.05, 0.01, -0.03])
dt = 0.4

# 1. Serie de Fourier discreta del sensor
N = len(x)
T0 = N * dt
t = dt * np.arange(N)
a0 = np.mean(x)
varianza = np.mean((x - a0) ** 2)
print("a0 =", round(a0, 4))
for n in range(1, 11):
    w = 2 * np.pi * n / T0
    an = 2 / N * np.sum(x * np.cos(w * t))
    bn = 2 / N * np.sum(x * np.sin(w * t))
    An = np.sqrt(an ** 2 + bn ** 2)
    pn = An ** 2 / (2 * varianza)
    print(n, round(an, 3), round(bn, 3), round(An, 3), round(100 * pn, 1), "%")

# 2. Regresion trigonometrica con T = 4.0 s
def regresion(y, T):
    tt = dt * np.arange(len(y))
    w = 2 * np.pi / T
    M = np.column_stack([np.ones(len(y)), np.cos(w * tt), np.sin(w * tt)])
    beta = np.linalg.solve(M.T @ M, M.T @ y)       # ecuaciones normales
    residuos = y - M @ beta
    s = np.sqrt(np.sum(residuos ** 2) / (len(y) - 3))
    cov = s ** 2 * np.linalg.inv(M.T @ M)
    c, a, b = beta
    A = np.sqrt(a ** 2 + b ** 2)
    dA = np.sqrt((a / A) ** 2 * cov[1, 1] + (b / A) ** 2 * cov[2, 2] + 2 * a * b / A ** 2 * cov[1, 2])
    fase = np.arctan2(-b, a)   # atan2(-b, a)
    return A, dA, fase

Ax, dAx, fx = regresion(x, 4.0)
Ar, dAr, fr = regresion(r, 4.0)
print("Sensor:    A =", round(Ax, 3), "+-", round(dAx, 3), " fase =", round(fx, 2))
print("Ambiental: A =", round(Ar, 3), "+-", round(dAr, 3), " fase =", round(fr, 2))

# 3. Cociente de energia y longitud de onda
R = (Ax / Ar) ** 2
dR = R * 2 * np.sqrt((dAx / Ax) ** 2 + (dAr / Ar) ** 2)
print("R =", round(R, 1), "+-", round(dR, 1))
v, T = 4500, 4.0
print("lambda aprox =", v * T, "m")
