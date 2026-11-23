# Guion por persona · video «Sismo o ruido»

Duración total 4:45.0 (máximo permitido 5:00). Se genera solo desde `video/js/guion.js`.

## Cómo grabar

- Graba cada línea en un archivo aparte. Nómbralo como dice la columna «Archivo».
- **A cámara** es video horizontal (16:9), de frente, con luz de ventana y fondo liso. Deja 1 s de silencio antes y después.
- **Voz en off** es solo audio. Graba en un cuarto con cortinas o ropa, a un palmo del celular, sin eco.
- **Saludo** y **despedida** son clips cortos de 3 a 4 s, sin hablar, saludando a la cámara. Video cuadrado o vertical sirve.
- Di la línea en el tiempo que marca «Dura». Si te pasas, dilo un poco más rápido. No cambies las palabras sin avisar, porque los subtítulos y las animaciones van con ese texto.
- Manda todo a Mateo. Él pone los archivos en `video/grabaciones/<Nombre>/` y los registra en `GUION.medios`.

## Mateo

| # | Escena | Entra | Dura | Tipo | Archivo | Qué se dice |
|---|---|---|---|---|---|---|
| 1 | Quiénes somos | 0:34.0 | 5.0 s | Voz en off | `01_voz.m4a` | Somos Mateo, Víctor y Sofía, estudiantes de profesional del Tec de Monterrey. |
| 2 | Quiénes somos | 0:34.5 | 4.0 s | Saludo | `02_saludo.mp4` | (sin hablar, saluda o se despide) |
| 3 | Quiénes somos | 0:39.8 | 6.8 s | Voz en off | `03_voz.m4a` | En la clase de Análisis de Métodos Matemáticos para la Física, con el doctor Luis Miguel Méndez Díaz… |
| 4 | Quiénes somos | 0:47.4 | 6.0 s | Voz en off | `04_voz.m4a` | …desarrollamos un análisis de Fourier para separar los sismos del ruido. |
| 5 | Alcance | 1:45.8 | 6.0 s | Voz en off | `05_voz.m4a` | Empezamos con los datos del expediente del USGS. Dos registros cortos, un dato cada 0.4 segundos. |
| 6 | Alcance | 1:52.5 | 6.3 s | Voz en off | `06_voz.m4a` | Luego lo llevamos a una base de datos real. Veinte sismos de México, de 1993 a 2026. |
| 7 | Alcance | 1:59.5 | 6.5 s | Voz en off | `07_voz.m4a` | Todos registrados en Ciudad Universitaria. No buscamos predecir sismos, sino reconocerlos. |
| 8 | Metodología | 2:07.8 | 5.4 s | A cámara | `08_cameo.mp4` | Primero ajustamos una serie de Fourier a los datos del expediente. |
| 9 | Metodología | 2:13.9 | 5.9 s | Voz en off | `09_voz.m4a` | Un solo armónico, con periodo de cuatro segundos, explica casi toda la señal. |
| 10 | Metodología | 2:20.8 | 5.8 s | Voz en off | `10_voz.m4a` | Para registros largos usamos la transformada de Fourier por ventanas. |
| 11 | Metodología | 2:27.2 | 5.6 s | Voz en off | `11_voz.m4a` | Cortamos la señal en pedazos y vemos qué frecuencias tiene cada uno. |
| 12 | Metodología | 2:33.8 | 6.2 s | Voz en off | `12_voz.m4a` | Antes de que llegue la onda P solo hay ruido. Ahí aprendemos cómo suena. |
| 13 | Metodología | 2:40.8 | 6.4 s | Voz en off | `13_voz.m4a` | Después restamos ese ruido en cada frecuencia y regresamos la señal limpia. |
| 14 | Metodología | 2:48.0 | 4.2 s | Voz en off | `14_voz.m4a` | Lo probamos con sismos sintéticos y con ruido real. |
| 15 | Conclusiones e impacto | 4:26.8 | 6.2 s | A cámara | `15_cameo.mp4` | Una herramienta barata y abierta acerca las alertas a donde hay menos sensores. |
| 16 | Conclusiones e impacto | 4:33.8 | 4.2 s | Voz en off | `16_voz.m4a` | Porque una alerta solo sirve si llega a todos. |
| 17 | Conclusiones e impacto | 4:38.9 | 4.0 s | Despedida | `17_despedida.mp4` | (sin hablar, saluda o se despide) |

## Víctor

| # | Escena | Entra | Dura | Tipo | Archivo | Qué se dice |
|---|---|---|---|---|---|---|
| 1 | Quiénes somos | 0:35.7 | 4.0 s | Saludo | `01_saludo.mp4` | (sin hablar, saluda o se despide) |
| 2 | El problema | 0:55.8 | 7.6 s | A cámara | `02_cameo.mp4` | Las alertas sísmicas deciden en segundos. Si confunden el ruido con un sismo, suenan sin razón. |
| 3 | El problema | 1:04.0 | 4.4 s | A cámara | `03_cameo.mp4` | Y si el ruido tapa la onda P, el aviso llega tarde. |
| 4 | El problema | 1:09.8 | 5.8 s | Voz en off | `04_voz.m4a` | Esto afecta más a las comunidades con pocos sensores y poco tiempo para salir. |
| 5 | El problema | 1:16.4 | 3.2 s | Voz en off | `05_voz.m4a` | Ahí cada segundo cuenta. |
| 6 | Resultados | 2:53.8 | 5.8 s | Voz en off | `06_voz.m4a` | En el expediente, la onda del sensor es casi seis veces más alta que la del ruido. |
| 7 | Resultados | 3:00.2 | 5.8 s | Voz en off | `07_voz.m4a` | Eso es unas 35 veces más energía, con una longitud de onda de 18 kilómetros. |
| 8 | Resultados | 3:06.8 | 6.8 s | Voz en off | `08_voz.m4a` | Pero cuatro segundos también es el ritmo de las olas del mar. La frecuencia sola no basta. |
| 9 | Resultados | 3:14.4 | 7.0 s | Voz en off | `09_voz.m4a` | En los veinte sismos reales, la señal quedó en promedio once veces más clara. |
| 10 | Resultados | 3:22.2 | 7.4 s | Voz en off | `10_voz.m4a` | Con ruido tan fuerte como el sismo, el parecido con la onda real subió de 71 a 86 por ciento. |
| 11 | Resultados | 3:30.4 | 5.8 s | Voz en off | `11_voz.m4a` | En la ciudad domina el ruido rápido. El del mar llega en ondas de unos seis segundos. |
| 12 | Conclusiones e impacto | 4:15.8 | 4.8 s | A cámara | `12_cameo.mp4` | Fourier sí separa el sismo del ruido cuando sus frecuencias son distintas. |
| 13 | Conclusiones e impacto | 4:39.1 | 4.0 s | Despedida | `13_despedida.mp4` | (sin hablar, saluda o se despide) |

## Sofía

| # | Escena | Entra | Dura | Tipo | Archivo | Qué se dice |
|---|---|---|---|---|---|---|
| 1 | Historia · el sismo | 0:00.8 | 5.0 s | Voz en off | `01_voz.m4a` | Bajo la costa de Guerrero, dos placas de roca se empujan desde hace millones de años. |
| 2 | Historia · el sismo | 0:06.6 | 2.2 s | Voz en off | `02_voz.m4a` | Hasta que la roca se rompe. |
| 3 | Historia · el sismo | 0:10.2 | 4.4 s | Voz en off | `03_voz.m4a` | La energía viaja en ondas. Primero llega la onda P, rápida y débil. |
| 4 | Historia · el sismo | 0:15.0 | 3.4 s | Voz en off | `04_voz.m4a` | Después la onda S, más lenta y más fuerte. |
| 5 | Historia · el sismo | 0:19.8 | 4.2 s | Voz en off | `05_voz.m4a` | Las estaciones sismológicas la escuchan en segundos. |
| 6 | Historia · el sismo | 0:24.8 | 4.8 s | Voz en off | `06_voz.m4a` | Pero el suelo nunca está quieto. El mar, el viento y la ciudad también lo mueven. |
| 7 | Historia · el sismo | 0:30.0 | 2.6 s | Voz en off | `07_voz.m4a` | ¿Cómo separar el sismo del ruido? |
| 8 | Quiénes somos | 0:36.9 | 4.0 s | Saludo | `08_saludo.mp4` | (sin hablar, saluda o se despide) |
| 9 | La idea y por qué es innovadora | 1:21.8 | 6.2 s | A cámara | `09_cameo.mp4` | Nuestra idea fue usar las matemáticas de Fourier, como un prisma que separa la luz en colores. |
| 10 | La idea y por qué es innovadora | 1:28.6 | 6.2 s | Voz en off | `10_voz.m4a` | Fourier separa cualquier señal en ondas simples, cada una con su frecuencia. |
| 11 | La idea y por qué es innovadora | 1:35.6 | 8.0 s | Voz en off | `11_voz.m4a` | Lo innovador es que no usa inteligencia artificial, cuesta casi nada y funciona en cualquier navegador. |
| 12 | Demo de la aplicación | 3:37.8 | 5.2 s | Voz en off | `12_voz.m4a` | Con todo esto construimos Sismo o ruido, una página web abierta para cualquiera. |
| 13 | Demo de la aplicación | 3:43.8 | 5.2 s | Voz en off | `13_voz.m4a` | Eliges un sismo en el mapa. Por ejemplo, el de Puebla-Morelos de 2017. |
| 14 | Demo de la aplicación | 3:49.8 | 5.0 s | Voz en off | `14_voz.m4a` | Con un botón, la señal se separa en sismo y ruido. |
| 15 | Demo de la aplicación | 3:55.6 | 6.0 s | Voz en off | `15_voz.m4a` | Ves sus frecuencias y cómo cambia la señal antes y después del filtro. |
| 16 | Demo de la aplicación | 4:02.4 | 5.0 s | Voz en off | `16_voz.m4a` | Hasta puedes escuchar el sismo, acelerado cuatrocientas veces. |
| 17 | Demo de la aplicación | 4:08.2 | 6.0 s | Voz en off | `17_voz.m4a` | Es gratis, fácil de usar y ya está en línea. |
| 18 | Conclusiones e impacto | 4:21.2 | 5.0 s | A cámara | `18_cameo.mp4` | Cuando comparten frecuencia, como con el mar, también hay que ver el tiempo. |
| 19 | Conclusiones e impacto | 4:39.4 | 4.0 s | Despedida | `19_despedida.mp4` | (sin hablar, saluda o se despide) |

## Guion completo en orden

### Historia · el sismo · 0:00.0 a 0:33.0

- **Sofía (voz en off)** · 0:00.8 · Bajo la costa de Guerrero, dos placas de roca se empujan desde hace millones de años.
- **Sofía (voz en off)** · 0:06.6 · Hasta que la roca se rompe.
- **Sofía (voz en off)** · 0:10.2 · La energía viaja en ondas. Primero llega la onda P, rápida y débil.
- **Sofía (voz en off)** · 0:15.0 · Después la onda S, más lenta y más fuerte.
- **Sofía (voz en off)** · 0:19.8 · Las estaciones sismológicas la escuchan en segundos.
- **Sofía (voz en off)** · 0:24.8 · Pero el suelo nunca está quieto. El mar, el viento y la ciudad también lo mueven.
- **Sofía (voz en off)** · 0:30.0 · ¿Cómo separar el sismo del ruido?

### Quiénes somos · 0:33.0 a 0:55.0

- **Mateo (voz en off)** · 0:34.0 · Somos Mateo, Víctor y Sofía, estudiantes de profesional del Tec de Monterrey.
- **Mateo (voz en off)** · 0:39.8 · En la clase de Análisis de Métodos Matemáticos para la Física, con el doctor Luis Miguel Méndez Díaz…
- **Mateo (voz en off)** · 0:47.4 · …desarrollamos un análisis de Fourier para separar los sismos del ruido.

### El problema · 0:55.0 a 1:21.0

- **Víctor (a cámara)** · 0:55.8 · Las alertas sísmicas deciden en segundos. Si confunden el ruido con un sismo, suenan sin razón.
- **Víctor (a cámara)** · 1:04.0 · Y si el ruido tapa la onda P, el aviso llega tarde.
- **Víctor (voz en off)** · 1:09.8 · Esto afecta más a las comunidades con pocos sensores y poco tiempo para salir.
- **Víctor (voz en off)** · 1:16.4 · Ahí cada segundo cuenta.

### La idea y por qué es innovadora · 1:21.0 a 1:45.0

- **Sofía (a cámara)** · 1:21.8 · Nuestra idea fue usar las matemáticas de Fourier, como un prisma que separa la luz en colores.
- **Sofía (voz en off)** · 1:28.6 · Fourier separa cualquier señal en ondas simples, cada una con su frecuencia.
- **Sofía (voz en off)** · 1:35.6 · Lo innovador es que no usa inteligencia artificial, cuesta casi nada y funciona en cualquier navegador.

### Alcance · 1:45.0 a 2:07.0

- **Mateo (voz en off)** · 1:45.8 · Empezamos con los datos del expediente del USGS. Dos registros cortos, un dato cada 0.4 segundos.
- **Mateo (voz en off)** · 1:52.5 · Luego lo llevamos a una base de datos real. Veinte sismos de México, de 1993 a 2026.
- **Mateo (voz en off)** · 1:59.5 · Todos registrados en Ciudad Universitaria. No buscamos predecir sismos, sino reconocerlos.

### Metodología · 2:07.0 a 2:53.0

- **Mateo (a cámara)** · 2:07.8 · Primero ajustamos una serie de Fourier a los datos del expediente.
- **Mateo (voz en off)** · 2:13.9 · Un solo armónico, con periodo de cuatro segundos, explica casi toda la señal.
- **Mateo (voz en off)** · 2:20.8 · Para registros largos usamos la transformada de Fourier por ventanas.
- **Mateo (voz en off)** · 2:27.2 · Cortamos la señal en pedazos y vemos qué frecuencias tiene cada uno.
- **Mateo (voz en off)** · 2:33.8 · Antes de que llegue la onda P solo hay ruido. Ahí aprendemos cómo suena.
- **Mateo (voz en off)** · 2:40.8 · Después restamos ese ruido en cada frecuencia y regresamos la señal limpia.
- **Mateo (voz en off)** · 2:48.0 · Lo probamos con sismos sintéticos y con ruido real.

### Resultados · 2:53.0 a 3:37.0

- **Víctor (voz en off)** · 2:53.8 · En el expediente, la onda del sensor es casi seis veces más alta que la del ruido.
- **Víctor (voz en off)** · 3:00.2 · Eso es unas 35 veces más energía, con una longitud de onda de 18 kilómetros.
- **Víctor (voz en off)** · 3:06.8 · Pero cuatro segundos también es el ritmo de las olas del mar. La frecuencia sola no basta.
- **Víctor (voz en off)** · 3:14.4 · En los veinte sismos reales, la señal quedó en promedio once veces más clara.
- **Víctor (voz en off)** · 3:22.2 · Con ruido tan fuerte como el sismo, el parecido con la onda real subió de 71 a 86 por ciento.
- **Víctor (voz en off)** · 3:30.4 · En la ciudad domina el ruido rápido. El del mar llega en ondas de unos seis segundos.

### Demo de la aplicación · 3:37.0 a 4:15.0

- **Sofía (voz en off)** · 3:37.8 · Con todo esto construimos Sismo o ruido, una página web abierta para cualquiera.
- **Sofía (voz en off)** · 3:43.8 · Eliges un sismo en el mapa. Por ejemplo, el de Puebla-Morelos de 2017.
- **Sofía (voz en off)** · 3:49.8 · Con un botón, la señal se separa en sismo y ruido.
- **Sofía (voz en off)** · 3:55.6 · Ves sus frecuencias y cómo cambia la señal antes y después del filtro.
- **Sofía (voz en off)** · 4:02.4 · Hasta puedes escuchar el sismo, acelerado cuatrocientas veces.
- **Sofía (voz en off)** · 4:08.2 · Es gratis, fácil de usar y ya está en línea.

### Conclusiones e impacto · 4:15.0 a 4:45.0

- **Víctor (a cámara)** · 4:15.8 · Fourier sí separa el sismo del ruido cuando sus frecuencias son distintas.
- **Sofía (a cámara)** · 4:21.2 · Cuando comparten frecuencia, como con el mar, también hay que ver el tiempo.
- **Mateo (a cámara)** · 4:26.8 · Una herramienta barata y abierta acerca las alertas a donde hay menos sensores.
- **Mateo (voz en off)** · 4:33.8 · Porque una alerta solo sirve si llega a todos.

