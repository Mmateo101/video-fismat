# Fismat · estado del trabajo (para continuar con otra IA o persona)

Proyecto: «Análisis espectral de Fourier para alertas de señales sísmicas inclusivas».
Curso Análisis de Métodos Matemáticos para la Física (Tec de Monterrey) + Expo Ingenierías 28.ª ed. (categoría prototipo de software).
Equipo: Mateo Rodolfo Flores Torres, Víctor Manuel Sánchez Chávez, Sofía Martínez Alanis. Profesor: Dr. Luis Miguel Méndez Díaz.

## Entregables y dónde están
| Entregable | Dónde | Estado |
|---|---|---|
| Script de Fourier con datos reales | `analisis/sismos_fourier.py` | Listo y probado (`python sismos_fourier.py`, `--prueba` para la prueba sintética) |
| Página web (prototipo) | `web/public/` → https://sismo-o-ruido.vercel.app | Desplegada con la CLI de Vercel (`cd web && npx vercel deploy --prod --yes`, proyecto `mateo-f101/sismo-o-ruido`) |
| Reporte LaTeX final | `reporte/reporte.tex` → `reporte/Fismat_SismoORuido.pdf` | Listo. Compilar con `latexmk -pdf reporte.tex` |
| Doc del equipo en Claude Docs | https://claude.ai/artifact/ExsbEa3Wq2KtkXoFXNiJXC | Ya tiene la fase 2 (secciones 6.8, 6.9, 9.7, 9.8, 13.6 a 13.9, figuras 7 a 13, Tabla 9) |
| Video | `video/` (HTML + GSAP) → `video/render/*.mp4` | Animación completa, 4:45. Faltan las grabaciones del equipo |
| Guion por persona | `guion/Guion_por_persona.md` | Generado desde `video/js/guion.js` (`node video/tools/guion_md.mjs`) |
| Imágenes del perfil de Expo | `expo/` (ver `expo/LEEME.md`) | Listas |

## Video: cómo trabajar
- Ver: `python -m http.server 5601` en la raíz del repo y abrir http://localhost:5601/video/index.html (Espacio, ← →, 1–9, G).
- Cuadros sueltos: `node video/tools/cuadros.mjs <carpeta> 12 40.5 …` · Render: `node video/tools/render.mjs --final --salida=X.mp4`.
- Escenas en `video/js/escenas/*.js`, tiempos y textos en `video/js/guion.js`, motor en `video/js/motor.js`, kit visual en `video/js/kit.js`.
- Ojo con GSAP en SVG: un grupo con `transform="translate(…)"` se mueve con valores relativos (`x: "+=30"`), si no pierde su posición. `fromTo` con opacidad inicial visible lleva `immediateRender: false`.
- La demo carga la página real en un iframe (`../web/public/index.html?video=1`) y controla su reloj de GSAP (`window.APP`).
- Grabaciones: ponerlas en `video/grabaciones/<Nombre>/`, registrarlas en `GUION.medios` (formato en el comentario de `guion.js`), correr `node video/tools/preparar_medios.mjs`, renderizar y luego `node video/tools/mezcla.mjs --video=X.mp4` para el audio.

## Reglas de estilo del usuario
- Español, oraciones cortas, sin punto y coma. Nada de «Palabra: continuación» en web y video.
- Mínimo texto en web y video. Público sin conocimientos.
- Video fluido, nunca estático. Poca información a la vez y todo se reacomoda al entrar algo nuevo. Estética TED-Ed (plana, geométrica, simétrica).
- Ecuaciones numeradas «Ec. (N)», tablas «Tabla N: …».

## Resultados (verificados con el script)
- Prueba sintética: correlación 0.996, SNR 5.9 → 22.5 dB.
- 20 sismos (G.UNM): SNR media 57.2 → 67.6 dB (+10.5 dB, ×11 en potencia; rango +3.3 a +17.6). Primeros 10 s de la P: 36.3 → 46.3 dB.
- Pico de microsismos: mediana 6.4 s (3.0 a 9.6 s). Solo 14 % del ruido en esa banda; domina el ruido urbano de 1 a 8 Hz.
- Ruido real a 0 dB: correlación 0.71 → 0.86; a −5 dB: 0.48 → 0.67.
- Puebla 2017 no está saturado (3 muestras cerca del máximo).

## Pendiente
- Que el equipo grabe sus partes (guion) y montarlas en el video.
- Subir a la plataforma de Expo lo de `expo/LEEME.md`.
- Revisar que el doc de Claude Docs no quede público si no se quiere.
