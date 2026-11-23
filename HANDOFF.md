# Fismat · estado del trabajo (para continuar con otra IA o persona)

Proyecto: "Análisis espectral de Fourier para alertas de señales sísmicas inclusivas".
Curso Análisis de Métodos Matemáticos para la Física (Tec de Monterrey) + Expo Ingenierías 28ª ed.
Equipo: Mateo Rodolfo Flores Torres, Víctor Manuel Sánchez Chávez, Sofía Martínez Alanis. Profesor: Dr. Luis Miguel Méndez Díaz.

## Carpetas
| Carpeta | Qué hay |
|---|---|
| `analisis/` | `sismos_fourier.py`: descarga 20 sismos de México (USGS + EarthScope, estación G.UNM en CU) y separa sismo/ruido con STFT + sustracción espectral (Boll 1979, Berouti 1979, Mousavi y Langston 2016). Genera `figuras/`, `resultados/` y los JSON de la web |
| `web/` | Página para Vercel (estática, `web/public`). Explora los 20 sismos |
| `video/` | Video animado (HTML + GSAP, se exporta cuadro por cuadro con Chrome + ffmpeg). Motor copiado del video de Estadística |
| `guion/` | Guion por persona |
| `reporte/` | Reporte LaTeX final |

## Reglas de estilo del usuario
- Español, oraciones cortas, sin punto y coma. Nada de "Palabra: continuación" (no usar dos puntos así).
- Mínimo texto en web y video. Público sin conocimientos.
- Video fluido, nunca estático. Poca información a la vez y todo se reacomoda al entrar algo nuevo. Estética TED-Ed (plana, geométrica, simétrica).
- Ecuaciones numeradas "Ec. (N)", tablas "Tabla N: …".

## Resultados del script (verificados)
- Prueba sintética: correlación 0.996, SNR 5.9 → 22.5 dB.
- 20 sismos: SNR media 57.2 → 67.6 dB (+10.5 dB). Primeros 10 s de la P: 36.3 → 46.3 dB.
- Pico de microsismos: mediana 6.4 s (3.0 a 9.6 s). Solo 14 % del ruido cae en esa banda: en CU domina el ruido urbano de 1–8 Hz.
- Ruido real a distintas SNR: a 0 dB la correlación pasa de 0.71 a 0.86, a −5 dB de 0.48 a 0.67.
