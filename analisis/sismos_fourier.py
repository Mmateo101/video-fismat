"""
sismos_fourier.py
=================
Separa la onda sismica del ruido ambiental en registros reales con la
transformada de Fourier. Es la extension del analisis del expediente
(serie de Fourier en 21 puntos) a una base de datos real.

Metodo (tomado de la literatura, sin inteligencia artificial):
  1. El ruido se estima en la ventana anterior a la llegada de la onda P,
     en el dominio tiempo-frecuencia (STFT), como en Mousavi y Langston (2016).
  2. Se resta ese espectro de ruido con sustraccion espectral de potencia
     (Boll, 1979), con sobresustraccion y piso espectral (Berouti et al., 1979).
  3. La ganancia resultante es una mascara entre 0 y 1 que reparte cada
     celda tiempo-frecuencia entre "sismo" y "ruido" (misma idea de mascara
     que Zhu et al., 2019, pero calculada con una formula cerrada).
  4. El ruido de fondo se compara con los modelos de Peterson (1993), como en
     McNamara y Buland (2004).

Datos:
  - Catalogo de sismos: USGS ComCat (servicio FDSN "USGS").
  - Formas de onda: EarthScope / IRIS DMC (servicio FDSN "IRIS").
    Estacion principal G.UNM (Ciudad Universitaria, CDMX, red GEOSCOPE).
    Si no hay datos, se usa una estacion del Servicio Sismologico Nacional (red MX).

Uso:
  python sismos_fourier.py            # descarga (si hace falta), analiza y exporta todo
  python sismos_fourier.py --prueba   # solo la prueba sintetica

Salidas:
  datos/       registros descargados (miniSEED + respuesta del instrumento)
  figuras/     figuras para el reporte
  resultados/  tabla resumen (CSV)
  ../web/public/data/   un JSON por sismo para la pagina web
"""

import json
import os
import sys

import numpy as np
from scipy import signal

CARPETA = os.path.dirname(os.path.abspath(__file__))
DATOS = os.path.join(CARPETA, "datos")
FIGURAS = os.path.join(CARPETA, "figuras")
RESULTADOS = os.path.join(CARPETA, "resultados")
WEB = os.path.join(CARPETA, "..", "web", "public", "data")

# ---------------------------------------------------------------------------
# 1. Los 20 sismos (fecha y hora UTC del catalogo del USGS)
# ---------------------------------------------------------------------------
SISMOS = [
    ("usp0006030", "1993-09-10T19:12:54", "Chiapas 1993", "Costa de Chiapas"),
    ("usp00073c5", "1995-09-14T14:04:31", "Copala 1995", "Guerrero"),
    ("usp00075gf", "1995-10-21T02:38:57", "Chiapas 1995", "Centro de Chiapas"),
    ("usp0007vrx", "1997-01-11T20:28:26", "Michoacán 1997", "Michoacán"),
    ("usp00099y6", "1999-06-15T20:42:05", "Tehuacán 1999", "Puebla"),
    ("usp0009f7v", "1999-09-30T16:31:15", "Oaxaca 1999", "Costa de Oaxaca"),
    ("usp000bnyr", "2003-01-22T02:06:34", "Tecomán 2003", "Colima"),
    ("ci14607652", "2010-04-04T22:40:42", "El Mayor-Cucapah 2010", "Baja California"),
    ("usp000jghj", "2012-03-20T18:02:47", "Ometepec 2012", "Guerrero y Oaxaca"),
    ("usp000jhr6", "2012-04-12T07:15:48", "Golfo de California 2012", "Sonora y Baja California"),
    ("usb000pq41", "2014-04-18T14:27:24", "Papanoa 2014", "Guerrero"),
    ("usc000rr6a", "2014-07-07T11:23:54", "Chiapas 2014", "Chiapas y Guatemala"),
    ("us2000ahv0", "2017-09-08T04:49:19", "Tehuantepec 2017", "Chiapas y Oaxaca"),
    ("us2000ar20", "2017-09-19T18:14:38", "Puebla-Morelos 2017", "Puebla, Morelos y CDMX"),
    ("us2000d3km", "2018-02-16T23:39:39", "Pinotepa 2018", "Oaxaca"),
    ("us6000ah9t", "2020-06-23T15:29:04", "Huatulco 2020", "Oaxaca"),
    ("us7000f93v", "2021-09-08T01:47:47", "Acapulco 2021", "Guerrero"),
    ("us7000i9bw", "2022-09-19T18:05:08", "Michoacán 2022", "Michoacán y Colima"),
    ("us7000ia36", "2022-09-22T06:16:09", "Réplica Michoacán 2022", "Michoacán"),
    ("us7000t1bu", "2026-07-17T14:48:39", "Chiapas 2026", "Costa de Chiapas"),
]

# Estacion principal y respaldo (red MX del Servicio Sismologico Nacional)
ESTACIONES = [("G", "UNM"), ("MX", "MOIG"), ("MX", "TLIG"), ("MX", "SJQ"), ("MX", "ZAIG"), ("IU", "TEIG")]

# ---------------------------------------------------------------------------
# 2. Parametros del metodo
# ---------------------------------------------------------------------------
ANTES_P = 300.0      # s de registro antes de la onda P (ventana de ruido)
DESPUES_P = 600.0    # s de registro despues de la onda P
MARGEN = 40.0        # s entre la ventana de ruido y la onda P (evita la fuga del filtro y de la STFT)
NPERSEG = 512        # muestras por segmento de la STFT (25.6 s a 20 Hz)
TRASLAPE = 0.75      # fraccion de traslape entre segmentos
BETA = 2.0           # sobresustraccion (Berouti et al., 1979)
PISO = 0.02          # piso espectral de la ganancia (Berouti et al., 1979)
BANDA_MICRO = (0.10, 0.35)  # banda de microsismos oceanicos en Hz (Peterson, 1993)
BANDA = (0.04, 8.0)         # banda de analisis en Hz (periodos de 0.125 a 25 s)
VENTANA_P = 10.0            # s iniciales de la onda P que usa una alerta temprana


# ---------------------------------------------------------------------------
# 3. Transformada de Fourier: espectro de amplitud de una ventana
# ---------------------------------------------------------------------------
def espectro_amplitud(x, dt):
    """Espectro de amplitud de una ventana con la FFT.
    Se usa una ventana de Hann para reducir la fuga espectral.
    Se normaliza para que una senoide de amplitud A dé un pico de altura A."""
    w = np.hanning(len(x))
    X = np.fft.rfft((x - np.mean(x)) * w)
    f = np.fft.rfftfreq(len(x), dt)
    A = 2 * np.abs(X) / np.sum(w)
    return f, A


def serie_desde_fft(x):
    """Puente con el expediente: los coeficientes a_n y b_n de la serie de
    Fourier discreta salen directamente de la FFT de los N datos."""
    N = len(x)
    X = np.fft.fft(x)
    a0 = X[0].real / N
    an = 2 * X.real / N
    bn = -2 * X.imag / N
    return a0, an, bn


# ---------------------------------------------------------------------------
# 4. Sustraccion espectral en el plano tiempo-frecuencia
# ---------------------------------------------------------------------------
def separar(x, dt, t_ruido_fin):
    """Separa x en sismo + ruido.
    x: registro (velocidad), dt: paso de tiempo,
    t_ruido_fin: segundo del registro donde termina la ventana de ruido.
    Regresa sismo, ruido, ganancia G(f, t), frecuencias, tiempos y Z (STFT)."""
    fs = 1.0 / dt
    nover = int(NPERSEG * TRASLAPE)
    f, t, Z = signal.stft(x, fs=fs, window="hann", nperseg=NPERSEG, noverlap=nover)

    # Espectro de potencia del ruido: promedio de los segmentos antes de la P
    # (el segmento entero debe caer dentro de la ventana de ruido)
    solo_ruido = t + NPERSEG * dt / 2 <= t_ruido_fin
    P_ruido = np.mean(np.abs(Z[:, solo_ruido]) ** 2, axis=1, keepdims=True)

    # Sustraccion espectral de potencia con sobresustraccion y piso
    P_total = np.abs(Z) ** 2 + 1e-30
    G2 = 1 - BETA * P_ruido / P_total
    G = np.sqrt(np.clip(G2, PISO ** 2, 1.0))

    # Regresamos al tiempo con la fase original (transformada inversa)
    _, sismo = signal.istft(G * Z, fs=fs, window="hann", nperseg=NPERSEG, noverlap=nover)
    sismo = sismo[: len(x)]
    if len(sismo) < len(x):
        sismo = np.pad(sismo, (0, len(x) - len(sismo)))
    ruido = x - sismo
    return sismo, ruido, G, f, t, Z


def energia(x):
    """Energia media de una ventana (potencia media)."""
    return np.mean(x ** 2)


def snr_db(x, i_ruido, i_senal):
    """Relacion senal-ruido en decibeles entre dos ventanas del mismo registro."""
    return 10 * np.log10(energia(x[i_senal]) / energia(x[i_ruido]))


# ---------------------------------------------------------------------------
# 5. Prueba sintetica: se conoce la respuesta, asi que se puede verificar
# ---------------------------------------------------------------------------
def prueba_sintetica(mostrar=True):
    """Construye un registro con ruido de microsismos (periodo de 5 s) y un
    'sismo' (paquete de 1 a 3 Hz que empieza en t = 300 s). El metodo debe
    recuperar el paquete y dejar el ruido aparte."""
    rng = np.random.default_rng(7)
    dt = 0.05
    t = np.arange(0, 900, dt)
    # ruido: microsismo de 0.2 Hz con amplitud que varia + ruido blanco
    ruido = 1.0 * np.sin(2 * np.pi * 0.2 * t + 0.3) * (1 + 0.3 * np.sin(2 * np.pi * t / 97))
    ruido += 0.3 * rng.standard_normal(len(t))
    # sismo: dos frecuencias con envolvente que crece y decae
    env = np.where(t > 300, (t - 300) / 8 * np.exp(1 - (t - 300) / 8), 0)
    sismo = 3 * env * (np.sin(2 * np.pi * 1.2 * t) + 0.6 * np.sin(2 * np.pi * 2.5 * t + 1))
    x = sismo + ruido
    est, res, *_ = separar(x, dt, 300 - MARGEN)
    i_s = (t > 300) & (t < 360)
    corr = np.corrcoef(est[i_s], sismo[i_s])[0, 1]
    i_r = (t > 50) & (t < 280)
    antes = snr_db(x, i_r, i_s)
    despues = snr_db(est, i_r, i_s)
    if mostrar:
        print("Prueba sintetica")
        print(f"  correlacion sismo estimado vs real (300-360 s): {corr:.3f}")
        print(f"  SNR antes: {antes:.1f} dB   despues: {despues:.1f} dB")
    assert corr > 0.95, "El metodo no recupero el sismo sintetico"
    assert despues > antes + 10, "El metodo no mejoro la relacion senal-ruido"
    # Puente con la serie de Fourier: la FFT da los mismos a_n, b_n que las sumas
    xs = np.array([0.02, 0.08, 0.21, 0.35, 0.41, 0.29, 0.10, -0.12, -0.31, -0.38, -0.25,
                   -0.04, 0.18, 0.33, 0.39, 0.27, 0.05, -0.17, -0.34, -0.40, -0.22])
    a0, an, bn = serie_desde_fft(xs)
    N = len(xs)
    tt = np.arange(N)
    a2 = 2 / N * np.sum(xs * np.cos(2 * np.pi * 2 * tt / N))
    b2 = 2 / N * np.sum(xs * np.sin(2 * np.pi * 2 * tt / N))
    assert abs(an[2] - a2) < 1e-12 and abs(bn[2] - b2) < 1e-12 and abs(a0 - 0.0214) < 1e-4
    if mostrar:
        print(f"  expediente: a0 = {a0:.4f}, a2 = {an[2]:.3f}, b2 = {bn[2]:.3f} (FFT = serie de Fourier)")
    return corr, antes, despues


# ---------------------------------------------------------------------------
# 6. Descarga y preparacion de un registro real
# ---------------------------------------------------------------------------
def descargar(evid, hora):
    """Descarga el registro vertical (BHZ) y la respuesta del instrumento.
    Guarda una copia local para no volver a descargar."""
    from obspy import UTCDateTime, read, read_inventory
    from obspy.clients.fdsn import Client
    from obspy.geodetics import gps2dist_azimuth, kilometer2degrees
    from obspy.taup import TauPyModel

    os.makedirs(DATOS, exist_ok=True)
    meta_f = os.path.join(DATOS, evid + ".json")
    if os.path.exists(meta_f):
        meta = json.load(open(meta_f, encoding="utf-8"))
        st = read(os.path.join(DATOS, evid + ".mseed"))
        inv = read_inventory(os.path.join(DATOS, evid + ".xml"))
        return st, inv, meta

    usgs = Client("USGS")
    iris = Client("IRIS")
    ev = usgs.get_events(eventid=evid)[0]
    o = ev.preferred_origin() or ev.origins[0]
    m = ev.preferred_magnitude() or ev.magnitudes[0]
    modelo = TauPyModel("iasp91")

    for net, sta in ESTACIONES:
        try:
            inv = iris.get_stations(network=net, station=sta, channel="BHZ", level="response",
                                    starttime=o.time, endtime=o.time + 3600)
            s = inv[0][0]
            dist_m, _, _ = gps2dist_azimuth(o.latitude, o.longitude, s.latitude, s.longitude)
            grados = kilometer2degrees(dist_m / 1000)
            llegadas = modelo.get_travel_times(source_depth_in_km=max(o.depth / 1000, 1),
                                               distance_in_degree=grados, phase_list=["P", "p", "Pn"])
            tp = min(a.time for a in llegadas)
            t0 = o.time + tp - ANTES_P - 60
            t1 = o.time + tp + DESPUES_P + 60
            st = iris.get_waveforms(net, sta, "*", "BHZ", t0, t1)
            st.merge(fill_value=0)
            # si hay varios sensores (locaciones), se queda el primero completo
            st = st.select(id=st[0].id)
            if st[0].stats.npts < 0.9 * (t1 - t0) * st[0].stats.sampling_rate:
                raise ValueError("registro incompleto")
            meta = {
                "id": evid, "hora": str(o.time), "lat": o.latitude, "lon": o.longitude,
                "prof_km": o.depth / 1000, "mag": m.mag, "tipo_mag": m.magnitude_type,
                "red": net, "estacion": sta, "est_lat": s.latitude, "est_lon": s.longitude,
                "dist_km": dist_m / 1000, "tp": tp, "canal": st[0].id,
            }
            st.write(os.path.join(DATOS, evid + ".mseed"), format="MSEED")
            inv.write(os.path.join(DATOS, evid + ".xml"), format="STATIONXML")
            json.dump(meta, open(meta_f, "w", encoding="utf-8"), indent=1)
            return st, inv, meta
        except Exception as e:  # sin datos en esta estacion: se intenta la siguiente
            print(f"    {net}.{sta}: {str(e).splitlines()[0][:70]}")
    raise RuntimeError("Ninguna estacion tiene datos para " + evid)


def preparar(st, inv, meta):
    """Quita tendencia, corrige la respuesta del instrumento (velocidad en m/s),
    remuestrea a 20 Hz y recorta de P - 300 s a P + 600 s."""
    from obspy import UTCDateTime
    tr = st[0].copy()
    tr.detrend("demean")
    tr.detrend("linear")
    tr.taper(0.05)
    fs = tr.stats.sampling_rate
    tr.remove_response(inventory=inv, output="VEL", pre_filt=(0.02, 0.03, 0.4 * fs, 0.45 * fs),
                       water_level=60)
    # banda de analisis: la STFT de 25.6 s no resuelve periodos mas largos
    tr.filter("bandpass", freqmin=BANDA[0], freqmax=min(BANDA[1], 0.45 * fs), corners=4, zerophase=True)
    if abs(fs - 20.0) > 1e-6:
        tr.filter("lowpass", freq=8.0, corners=6, zerophase=True)
        tr.interpolate(20.0)
    tp_abs = UTCDateTime(meta["hora"]) + meta["tp"]
    tr.trim(tp_abs - ANTES_P, tp_abs + DESPUES_P, pad=True, fill_value=0)
    x = tr.data.astype(float)
    x -= np.mean(x[: int(ANTES_P * 20)])
    return x, tr.stats.delta


# ---------------------------------------------------------------------------
# 7. Analisis de un sismo
# ---------------------------------------------------------------------------
def analizar(x, dt):
    t = np.arange(len(x)) * dt - ANTES_P          # t = 0 en la llegada de la onda P
    t_ruido_fin = ANTES_P - MARGEN                 # en tiempo del registro
    sismo, ruido, G, f_stft, t_stft, Z = separar(x, dt, t_ruido_fin)

    i_ruido = (t > -ANTES_P + 20) & (t < -MARGEN)  # ventana de ruido
    i_senal = (t >= 0) & (t < 180)                 # 3 minutos despues de la P
    i_p = (t >= 0) & (t < VENTANA_P)               # primeros segundos de la onda P

    # Espectros de Fourier de cada ventana
    f, A_ruido = espectro_amplitud(x[i_ruido], dt)
    f2, A_senal = espectro_amplitud(x[i_senal], dt)
    A_ruido_i = np.interp(f2, f, A_ruido)

    # Frecuencia dominante del sismo y del ruido
    banda = (f2 > BANDA[0]) & (f2 < BANDA[1])
    f_sismo = f2[banda][np.argmax(A_senal[banda])]
    bm = (f > BANDA_MICRO[0]) & (f < BANDA_MICRO[1])
    f_micro = f[bm][np.argmax(A_ruido[bm])]

    # Fraccion de la energia del ruido que cae en la banda de microsismos
    P_r = A_ruido ** 2
    frac_micro = np.sum(P_r[bm]) / np.sum(P_r[(f > BANDA[0]) & (f < BANDA[1])])

    # Cociente de energia sismo / ruido (como R del expediente) y SNR
    R = energia(sismo[i_senal]) / energia(x[i_ruido])
    res = {
        "snr_antes": snr_db(x, i_ruido, i_senal),
        "snr_despues": snr_db(sismo, i_ruido, i_senal),
        "snr_p_antes": snr_db(x, i_ruido, i_p),
        "snr_p_despues": snr_db(sismo, i_ruido, i_p),
        "R": R,
        "f_sismo": f_sismo, "T_sismo": 1 / f_sismo,
        "f_micro": f_micro, "T_micro": 1 / f_micro,
        "frac_micro": frac_micro,
        "pgv": np.max(np.abs(x[i_senal])),
        "ruido_rms": np.sqrt(energia(x[i_ruido])),
    }
    return res, dict(t=t, x=x, sismo=sismo, ruido=ruido, G=G, f_stft=f_stft, t_stft=t_stft - ANTES_P,
                     Z=Z, f=f2, A_senal=A_senal, A_ruido=A_ruido_i, i_ruido=i_ruido, i_senal=i_senal)


# ---------------------------------------------------------------------------
# 8. Exportar para la pagina web (datos reducidos)
# ---------------------------------------------------------------------------
def reducir(y, n=1200):
    """Reduce una serie a n puntos conservando los picos (max y min por bloque)."""
    m = len(y) // (n // 2)
    y = y[: m * (n // 2)].reshape(-1, m)
    imax, imin = y.argmax(1), y.argmin(1)
    out = np.empty(n)
    for k in range(n // 2):
        a, b = (y[k, imax[k]], y[k, imin[k]]) if imax[k] < imin[k] else (y[k, imin[k]], y[k, imax[k]])
        out[2 * k], out[2 * k + 1] = a, b
    return out


def espectrograma_reducido(P, f, fmax=8.0, nf=48):
    """Espectrograma en dB reducido a nf bandas logaritmicas de frecuencia."""
    bordes = np.geomspace(0.05, fmax, nf + 1)
    filas = []
    for a, b in zip(bordes[:-1], bordes[1:]):
        i = (f >= a) & (f < b)
        if not np.any(i):
            i = [np.argmin(np.abs(f - np.sqrt(a * b)))]
        filas.append(np.mean(P[i], axis=0))
    return np.array(filas), np.sqrt(bordes[:-1] * bordes[1:])


def exportar_web(sis, meta, res, d):
    os.makedirs(WEB, exist_ok=True)
    esc = 1e6  # m/s -> micrometros por segundo
    P0 = np.abs(d["Z"]) ** 2
    P1 = np.abs(d["G"] * d["Z"]) ** 2
    S0, fb = espectrograma_reducido(P0, d["f_stft"])
    S1, _ = espectrograma_reducido(P1, d["f_stft"])
    ref = np.max(S0)
    db = lambda S: np.round(np.clip(10 * np.log10(S / ref + 1e-12), -80, 0), 1).tolist()
    # espectro: puntos con espaciado logaritmico
    fl = np.geomspace(0.02, 8, 160)
    As = np.interp(fl, d["f"], d["A_senal"]) * esc
    Ar = np.interp(fl, d["f"], d["A_ruido"]) * esc
    salida = {
        "id": sis[0], "nombre": sis[2], "region": sis[3], **meta,
        "res": {k: float(np.round(v, 4)) for k, v in res.items()},
        "t0": float(d["t"][0]), "dt_web": float((d["t"][-1] - d["t"][0]) / 1199),
        "crudo": np.round(reducir(d["x"]) * esc, 3).tolist(),
        "sismo": np.round(reducir(d["sismo"]) * esc, 3).tolist(),
        "ruido": np.round(reducir(d["ruido"]) * esc, 3).tolist(),
        "esp_f": np.round(fl, 4).tolist(), "esp_sismo": np.round(As, 4).tolist(), "esp_ruido": np.round(Ar, 4).tolist(),
        "sg_t": np.round(d["t_stft"], 1).tolist(), "sg_f": np.round(fb, 3).tolist(),
        "sg_antes": db(S0), "sg_despues": db(S1),
    }
    # Señales completas (20 Hz) en enteros de 16 bits para escucharlas acelerando
    # el tiempo (audificacion). Misma escala para las tres.
    import base64
    k = 32000 / (np.max(np.abs(d["x"])) + 1e-30)
    for nom, y in [("aud_crudo", d["x"]), ("aud_sismo", d["sismo"]), ("aud_ruido", d["ruido"])]:
        salida[nom] = base64.b64encode(np.clip(y * k, -32767, 32767).astype("<i2").tobytes()).decode()
    salida["aud_fs"] = 20
    with open(os.path.join(WEB, sis[0] + ".json"), "w", encoding="utf-8") as fh:
        json.dump(salida, fh, ensure_ascii=False, separators=(",", ":"))


# ---------------------------------------------------------------------------
# 9. Figuras para el reporte
# ---------------------------------------------------------------------------
def figuras_ejemplo(sis, d, res):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from obspy.signal.spectral_estimation import get_nhnm, get_nlnm

    plt.rcParams.update({"font.size": 10, "font.family": "serif"})
    os.makedirs(FIGURAS, exist_ok=True)
    esc = 1e6
    t = d["t"]

    # (a) registro crudo, sismo y ruido
    fig, ax = plt.subplots(3, 1, figsize=(7, 5.2), sharex=True)
    lim = np.max(np.abs(d["x"])) * esc * 1.05
    for a, y, nom, c in zip(ax, [d["x"], d["sismo"], d["ruido"]],
                            ["Registro crudo", "Sismo (separado)", "Ruido (separado)"],
                            ["#333333", "#C8102E", "#1F6FB2"]):
        a.plot(t, y * esc, color=c, lw=0.5)
        a.set_ylabel("µm/s")
        a.set_title(nom, fontsize=10, loc="left")
        a.axvline(0, color="k", ls=":", lw=0.8)
        a.axvspan(-ANTES_P + 20, -MARGEN, color="#1F6FB2", alpha=0.08)
    ax[2].set_ylim(-lim / 20, lim / 20)
    ax[0].set_ylim(-lim, lim); ax[1].set_ylim(-lim, lim)
    ax[2].set_xlabel("Tiempo desde la llegada de la onda P (s)")
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURAS, "real_registro.png"), dpi=200)
    plt.close(fig)

    # (b) espectros de amplitud de las dos ventanas
    fig, ax = plt.subplots(figsize=(7, 3.4))
    ax.loglog(d["f"], d["A_senal"] * esc, color="#C8102E", lw=1, label="Ventana del sismo (0 a 180 s)")
    ax.loglog(d["f"], d["A_ruido"] * esc, color="#1F6FB2", lw=1, label="Ventana de ruido (antes de la P)")
    ax.axvspan(*BANDA_MICRO, color="#888888", alpha=0.15, label="Banda de microsismos")
    ax.axvline(0.25, color="k", ls="--", lw=0.8)
    ax.text(0.26, ax.get_ylim()[0] * 3, "T = 4 s\n(expediente)", fontsize=8)
    ax.set_xlim(0.02, 8)
    ax.set_xlabel("Frecuencia (Hz)"); ax.set_ylabel("Amplitud (µm/s)")
    ax.legend(fontsize=8, loc="lower left")
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURAS, "real_espectro.png"), dpi=200)
    plt.close(fig)

    # (c) espectrograma antes y despues
    fig, ax = plt.subplots(1, 2, figsize=(7.4, 3.2), sharey=True)
    P0 = np.abs(d["Z"]) ** 2
    ref = P0.max()
    for a, P, nom in zip(ax, [P0, np.abs(d["G"] * d["Z"]) ** 2], ["Antes", "Después"]):
        im = a.pcolormesh(d["t_stft"], d["f_stft"], 10 * np.log10(P / ref + 1e-12), vmin=-80, vmax=0,
                          cmap="magma", shading="auto")
        a.set_yscale("log"); a.set_ylim(0.05, 8)
        a.set_title(nom, fontsize=10, loc="left"); a.set_xlabel("Tiempo desde la P (s)")
    ax[0].set_ylabel("Frecuencia (Hz)")
    fig.colorbar(im, ax=ax, label="dB", shrink=0.9)
    fig.savefig(os.path.join(FIGURAS, "real_espectrograma.png"), dpi=200, bbox_inches="tight")
    plt.close(fig)

    # (d) ruido de fondo contra los modelos de Peterson (1993)
    fig, ax = plt.subplots(figsize=(7, 3.4))
    xr = d["x"][d["i_ruido"]]
    fp, Pv = signal.welch(xr, fs=20, nperseg=2048)
    Pa = Pv[1:] * (2 * np.pi * fp[1:]) ** 2        # velocidad -> aceleracion
    ax.semilogx(1 / fp[1:], 10 * np.log10(Pa), color="#1F6FB2", lw=1.2, label="Ruido medido (G.UNM)")
    pl, nl = get_nlnm(); ph, nh = get_nhnm()
    ax.semilogx(pl, nl, "k--", lw=0.9, label="NLNM (Peterson, 1993)")
    ax.semilogx(ph, nh, "k-.", lw=0.9, label="NHNM (Peterson, 1993)")
    ax.axvspan(1 / BANDA_MICRO[1], 1 / BANDA_MICRO[0], color="#888888", alpha=0.15)
    ax.set_xlim(0.15, 60); ax.set_ylim(-200, -80)
    ax.set_xlabel("Periodo (s)"); ax.set_ylabel("PSD de aceleración (dB)")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURAS, "real_peterson.png"), dpi=200)
    plt.close(fig)


def figura_resumen(tabla):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.size": 9, "font.family": "serif"})
    nombres = [r["nombre"] for r in tabla]
    a = np.array([r["snr_antes"] for r in tabla]); b = np.array([r["snr_despues"] for r in tabla])
    y = np.arange(len(tabla))
    fig, ax = plt.subplots(figsize=(7, 5.6))
    ax.hlines(y, a, b, color="#999999", lw=2)
    ax.plot(a, y, "o", color="#1F6FB2", label="Antes (registro crudo)")
    ax.plot(b, y, "o", color="#C8102E", label="Después (sismo separado)")
    ax.set_yticks(y); ax.set_yticklabels(nombres); ax.invert_yaxis()
    ax.set_xlabel("Relación señal-ruido (dB)")
    ax.legend(fontsize=8, loc="lower right"); ax.grid(axis="x", alpha=0.3)
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURAS, "real_resumen.png"), dpi=200)
    plt.close(fig)


# ---------------------------------------------------------------------------
# 10. Prueba con ruido real a distintos niveles de senal-ruido
# ---------------------------------------------------------------------------
def ruido_sustituto(xr, n, rng):
    """Ruido con el mismo espectro de amplitud que el ruido medido xr, pero con
    fases al azar (sustituto de Fourier). Sirve para alargarlo a n muestras."""
    A = np.abs(np.fft.rfft(xr - xr.mean()))
    fa = np.linspace(0, 1, len(A))
    fb = np.linspace(0, 1, n // 2 + 1)
    Ab = np.interp(fb, fa, A)
    fase = rng.uniform(0, 2 * np.pi, len(Ab))
    y = np.fft.irfft(Ab * np.exp(1j * fase), n)
    return y * np.std(xr) / np.std(y)


def prueba_ruido_real(lista, niveles=(-10, -5, 0, 5, 10, 20)):
    """Para cada sismo: sismo limpio (respuesta conocida) + ruido real escalado.
    Mide la correlacion con la respuesta antes y despues de separar."""
    rng = np.random.default_rng(1)
    crudo, metodo = [], []
    for nivel in niveles:
        c0, c1 = [], []
        for d in lista:
            t, dt = d["t"], d["t"][1] - d["t"][0]
            s = np.where(t >= 0, d["sismo"], 0.0)
            y = ruido_sustituto(d["x"][d["i_ruido"]], len(t), rng)
            w = (t >= 0) & (t < 60)
            k = np.sqrt(10 ** (nivel / 10) * energia(y) / energia(s[w]))
            x = k * s + y
            est, *_ = separar(x, dt, ANTES_P - MARGEN)
            c0.append(np.corrcoef(x[w], s[w])[0, 1])
            c1.append(np.corrcoef(est[w], s[w])[0, 1])
        crudo.append(np.mean(c0)); metodo.append(np.mean(c1))
        print(f"  SNR de entrada {nivel:+3d} dB: correlacion crudo {np.mean(c0):.2f} -> separado {np.mean(c1):.2f}")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    plt.rcParams.update({"font.size": 10, "font.family": "serif"})
    fig, ax = plt.subplots(figsize=(6, 3.2))
    ax.plot(niveles, crudo, "o-", color="#1F6FB2", label="Registro con ruido")
    ax.plot(niveles, metodo, "o-", color="#C8102E", label="Sismo separado")
    ax.set_xlabel("Relación señal-ruido de entrada (dB)")
    ax.set_ylabel("Correlación con el sismo real")
    ax.set_ylim(0, 1.02); ax.grid(alpha=0.3); ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(FIGURAS, "real_robustez.png"), dpi=200)
    plt.close(fig)
    return list(niveles), crudo, metodo


# ---------------------------------------------------------------------------
# 11. Programa principal
# ---------------------------------------------------------------------------
def main():
    prueba_sintetica()
    if "--prueba" in sys.argv:
        return
    os.makedirs(RESULTADOS, exist_ok=True)
    tabla, indice, guardados = [], [], []
    for sis in SISMOS:
        evid = sis[0]
        print(f"{sis[2]} ({evid})")
        try:
            st, inv, meta = descargar(evid, sis[1])
            x, dt = preparar(st, inv, meta)
        except Exception as e:
            print("   OMITIDO:", e)
            continue
        res, d = analizar(x, dt)
        guardados.append({k: d[k] for k in ["t", "x", "sismo", "i_ruido"]})
        print(f"   {meta['red']}.{meta['estacion']}  {meta['dist_km']:.0f} km  M{meta['mag']}  "
              f"SNR {res['snr_antes']:.1f} -> {res['snr_despues']:.1f} dB  "
              f"SNR_P {res['snr_p_antes']:.1f} -> {res['snr_p_despues']:.1f} dB  "
              f"T_ruido {res['T_micro']:.1f} s  f_sismo {res['f_sismo']:.2f} Hz  R {res['R']:.0f}")
        exportar_web(sis, meta, res, d)
        fila = {"id": evid, "nombre": sis[2], "region": sis[3], "fecha": meta["hora"][:10],
                "mag": meta["mag"], "prof_km": round(meta["prof_km"]), "estacion": meta["red"] + "." + meta["estacion"],
                "dist_km": round(meta["dist_km"]), **{k: round(float(v), 3) for k, v in res.items()}}
        tabla.append(fila)
        indice.append({k: fila[k] for k in ["id", "nombre", "region", "fecha", "mag", "prof_km", "estacion", "dist_km"]}
                      | {"lat": meta["lat"], "lon": meta["lon"], "est_lat": meta["est_lat"], "est_lon": meta["est_lon"],
                         "snr_antes": fila["snr_antes"], "snr_despues": fila["snr_despues"]})
        if evid == "us2000ar20":      # Puebla-Morelos 2017: ejemplo del reporte
            figuras_ejemplo(sis, d, res)

    # tabla resumen
    import csv
    with open(os.path.join(RESULTADOS, "resumen_20_sismos.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(tabla[0].keys()))
        w.writeheader(); w.writerows(tabla)
    with open(os.path.join(WEB, "indice.json"), "w", encoding="utf-8") as fh:
        json.dump(indice, fh, ensure_ascii=False, indent=0)
    figura_resumen(tabla)
    print()
    print("Prueba con ruido real (sustitutos de Fourier)")
    niv, c0, c1 = prueba_ruido_real(guardados)
    with open(os.path.join(RESULTADOS, "robustez.json"), "w") as fh:
        json.dump({"niveles": niv, "crudo": c0, "separado": c1}, fh, indent=1)

    a = np.array([r["snr_antes"] for r in tabla]); b = np.array([r["snr_despues"] for r in tabla])
    Tm = np.array([r["T_micro"] for r in tabla]); fm = np.array([r["frac_micro"] for r in tabla])
    print(f"\n{len(tabla)} sismos analizados")
    print(f"SNR medio: {a.mean():.1f} dB -> {b.mean():.1f} dB (mejora media {np.mean(b - a):.1f} dB)")
    pa = np.array([r["snr_p_antes"] for r in tabla]); pb = np.array([r["snr_p_despues"] for r in tabla])
    print(f"SNR primeros {VENTANA_P:.0f} s de la P: {pa.mean():.1f} dB -> {pb.mean():.1f} dB (mejora media {np.mean(pb - pa):.1f} dB)")
    print(f"Periodo del pico de microsismos: mediana {np.median(Tm):.1f} s (rango {Tm.min():.1f} a {Tm.max():.1f} s)")
    print(f"Fraccion de la energia del ruido en la banda de microsismos: mediana {100 * np.median(fm):.0f} %")


if __name__ == "__main__":
    main()
