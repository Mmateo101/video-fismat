/* Guion del video: escenas, duraciones y narración (tiempos locales a cada escena).
   q = "voz" (voz en off) o el nombre de quien habla a cámara. rec = quién la graba.
   Las cifras salen del reporte y de analisis/sismos_fourier.py. */
window.GUION = {
  fps: 30,
  equipo: ["Mateo", "Víctor", "Sofía"],
  /* Grabaciones reales (vacío hasta que el equipo mande sus archivos).
     orig = archivo en video/grabaciones/ · src = nombre procesado (video en media/<src>.mp4, audio en render/medios/<src>.wav)
     escena = id de la escena · at = segundo de la escena en que arranca · ss y hasta = recorte del archivo
     cam = id del marco (A1, B, C, D, E1…) · video / audio = qué se usa. Ejemplo
     { escena: "problema", orig: "Victor/03_cameo_problema.mp4", src: "victor/03_cameo_problema", cam: "B", at: 0.6, ss: 0.3, hasta: 13.4, video: true, audio: true } */
  medios: [],
  escenas: [
    {
      id: "historia", nombre: "Historia · el sismo", dur: 33,
      voz: [
        { t0: 0.8, t1: 5.8, q: "voz", rec: "Sofía", x: "Bajo la costa de Guerrero, dos placas de roca se empujan desde hace millones de años." },
        { t0: 6.6, t1: 8.8, q: "voz", rec: "Sofía", x: "Hasta que la roca se rompe." },
        { t0: 10.2, t1: 14.6, q: "voz", rec: "Sofía", x: "La energía viaja en ondas. Primero llega la onda P, rápida y débil." },
        { t0: 15.0, t1: 18.4, q: "voz", rec: "Sofía", x: "Después la onda S, más lenta y más fuerte." },
        { t0: 19.8, t1: 24.0, q: "voz", rec: "Sofía", x: "Las estaciones sismológicas la escuchan en segundos." },
        { t0: 24.8, t1: 29.6, q: "voz", rec: "Sofía", x: "Pero el suelo nunca está quieto. El mar, el viento y la ciudad también lo mueven." },
        { t0: 30.0, t1: 32.6, q: "voz", rec: "Sofía", x: "¿Cómo separar el sismo del ruido?" },
      ],
    },
    {
      id: "equipo", nombre: "Quiénes somos", dur: 22,
      voz: [
        { t0: 1.0, t1: 6.0, q: "voz", rec: "Mateo", x: "Somos Mateo, Víctor y Sofía, estudiantes de profesional del Tec de Monterrey." },
        { t0: 6.8, t1: 13.6, q: "voz", rec: "Mateo", x: "En la clase de Análisis de Métodos Matemáticos para la Física, con el doctor Luis Miguel Méndez Díaz…" },
        { t0: 14.4, t1: 20.4, q: "voz", rec: "Mateo", x: "…desarrollamos un análisis de Fourier para separar los sismos del ruido." },
      ],
    },
    {
      id: "problema", nombre: "El problema", dur: 26,
      voz: [
        { t0: 0.8, t1: 8.4, q: "Víctor", x: "Las alertas sísmicas deciden en segundos. Si confunden el ruido con un sismo, suenan sin razón." },
        { t0: 9.0, t1: 13.4, q: "Víctor", x: "Y si el ruido tapa la onda P, el aviso llega tarde." },
        { t0: 14.8, t1: 20.6, q: "voz", rec: "Víctor", x: "Esto afecta más a las comunidades con pocos sensores y poco tiempo para salir." },
        { t0: 21.4, t1: 24.6, q: "voz", rec: "Víctor", x: "Ahí cada segundo cuenta." },
      ],
    },
    {
      id: "idea", nombre: "La idea y por qué es innovadora", dur: 24,
      voz: [
        { t0: 0.8, t1: 7.0, q: "Sofía", x: "Nuestra idea fue usar las matemáticas de Fourier, como un prisma que separa la luz en colores." },
        { t0: 7.6, t1: 13.8, q: "voz", rec: "Sofía", x: "Fourier separa cualquier señal en ondas simples, cada una con su frecuencia." },
        { t0: 14.6, t1: 22.6, q: "voz", rec: "Sofía", x: "Lo innovador es que no usa inteligencia artificial, cuesta casi nada y funciona en cualquier navegador." },
      ],
    },
    {
      id: "alcance", nombre: "Alcance", dur: 22,
      voz: [
        { t0: 0.8, t1: 6.8, q: "voz", rec: "Mateo", x: "Empezamos con los datos del expediente del USGS. Dos registros cortos, un dato cada 0.4 segundos." },
        { t0: 7.5, t1: 13.8, q: "voz", rec: "Mateo", x: "Luego lo llevamos a una base de datos real. Veinte sismos de México, de 1993 a 2026." },
        { t0: 14.5, t1: 21.0, q: "voz", rec: "Mateo", x: "Todos registrados en Ciudad Universitaria. No buscamos predecir sismos, sino reconocerlos." },
      ],
    },
    {
      id: "metodo", nombre: "Metodología", dur: 46,
      voz: [
        { t0: 0.8, t1: 6.2, q: "Mateo", x: "Primero ajustamos una serie de Fourier a los datos del expediente." },
        { t0: 6.9, t1: 12.8, q: "voz", rec: "Mateo", x: "Un solo armónico, con periodo de cuatro segundos, explica casi toda la señal." },
        { t0: 13.8, t1: 19.6, q: "voz", rec: "Mateo", x: "Para registros largos usamos la transformada de Fourier por ventanas." },
        { t0: 20.2, t1: 25.8, q: "voz", rec: "Mateo", x: "Cortamos la señal en pedazos y vemos qué frecuencias tiene cada uno." },
        { t0: 26.8, t1: 33.0, q: "voz", rec: "Mateo", x: "Antes de que llegue la onda P solo hay ruido. Ahí aprendemos cómo suena." },
        { t0: 33.8, t1: 40.2, q: "voz", rec: "Mateo", x: "Después restamos ese ruido en cada frecuencia y regresamos la señal limpia." },
        { t0: 41.0, t1: 45.2, q: "voz", rec: "Mateo", x: "Lo probamos con sismos sintéticos y con ruido real." },
      ],
    },
    {
      id: "resultados", nombre: "Resultados", dur: 44,
      voz: [
        { t0: 0.8, t1: 6.6, q: "voz", rec: "Víctor", x: "En el expediente, la onda del sensor es casi seis veces más alta que la del ruido." },
        { t0: 7.2, t1: 13.0, q: "voz", rec: "Víctor", x: "Eso es unas 35 veces más energía, con una longitud de onda de 18 kilómetros." },
        { t0: 13.8, t1: 20.6, q: "voz", rec: "Víctor", x: "Pero cuatro segundos también es el ritmo de las olas del mar. La frecuencia sola no basta." },
        { t0: 21.4, t1: 28.4, q: "voz", rec: "Víctor", x: "En los veinte sismos reales, la señal quedó en promedio once veces más clara." },
        { t0: 29.2, t1: 36.6, q: "voz", rec: "Víctor", x: "Con ruido tan fuerte como el sismo, el parecido con la onda real subió de 71 a 86 por ciento." },
        { t0: 37.4, t1: 43.2, q: "voz", rec: "Víctor", x: "En la ciudad domina el ruido rápido. El del mar llega en ondas de unos seis segundos." },
      ],
    },
    {
      id: "demo", nombre: "Demo de la aplicación", dur: 38,
      voz: [
        { t0: 0.8, t1: 6.0, q: "voz", rec: "Sofía", x: "Con todo esto construimos Sismo o ruido, una página web abierta para cualquiera." },
        { t0: 6.8, t1: 12.0, q: "voz", rec: "Sofía", x: "Eliges un sismo en el mapa. Por ejemplo, el de Puebla-Morelos de 2017." },
        { t0: 12.8, t1: 17.8, q: "voz", rec: "Sofía", x: "Con un botón, la señal se separa en sismo y ruido." },
        { t0: 18.6, t1: 24.6, q: "voz", rec: "Sofía", x: "Ves sus frecuencias y cómo cambia la señal antes y después del filtro." },
        { t0: 25.4, t1: 30.4, q: "voz", rec: "Sofía", x: "Hasta puedes escuchar el sismo, acelerado cuatrocientas veces." },
        { t0: 31.2, t1: 37.2, q: "voz", rec: "Sofía", x: "Es gratis, fácil de usar y ya está en línea." },
      ],
    },
    {
      id: "cierre", nombre: "Conclusiones e impacto", dur: 30,
      voz: [
        { t0: 0.8, t1: 5.6, q: "Víctor", x: "Fourier sí separa el sismo del ruido cuando sus frecuencias son distintas." },
        { t0: 6.2, t1: 11.2, q: "Sofía", x: "Cuando comparten frecuencia, como con el mar, también hay que ver el tiempo." },
        { t0: 11.8, t1: 18.0, q: "Mateo", x: "Una herramienta barata y abierta acerca las alertas a donde hay menos sensores." },
        { t0: 18.8, t1: 23.0, q: "voz", rec: "Mateo", x: "Porque una alerta solo sirve si llega a todos." },
      ],
    },
  ],
};
