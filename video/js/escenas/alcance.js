/* Escena 5 · Alcance: del expediente (21 y 16 datos) a 20 sismos reales vistos desde CU. */
N.add({
  id: "alcance",
  entrada: "iris", irisEn: [960, 540], irisColor: "#7B5EA7",
  async prep() { this.ind = await (await fetch("data/indice.json")).json(); this.ind.sort((a, b) => a.fecha.localeCompare(b.fecha)); },
  build(root, tl, T, def) {
    const { C, s, svg, txt, particulas, sol } = K;
    const X = (lon) => 3718.3 + 31.38 * lon, Y = (lat) => 10.7 + (32.53 - lat) * 33.96;
    const F = svg(root, { fondo: "#FDE7C2" });
    particulas(F, tl, T, { n: 24, colores: [C.sol, C.sismo2, C.blanco], seed: 51, opacidad: 0.35 });

    /* 1 · el expediente: dos registros cortos */
    const eOut = s("g", { transform: "translate(960,470)" }, F);
    const exp = s("g", {}, eOut);
    s("rect", { x: -640, y: -250, width: 1280, height: 500, rx: 40, fill: "rgba(29,36,64,.12)", transform: "translate(0,12)" }, exp);
    s("rect", { x: -640, y: -250, width: 1280, height: 500, rx: 40, fill: C.crema }, exp);
    tl.fromTo(exp, { scale: 0.4, opacity: 0, svgOrigin: "0 0" }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 0.3);
    const dx = 54;
    const dotsX = D_X().map((v, i) => s("circle", { cx: -560 + i * dx, cy: -90 - v * 260, r: 13, fill: C.sismo }, exp));
    const dotsR = D_R().map((v, i) => s("circle", { cx: -560 + i * dx, cy: 140 - v * 260, r: 13, fill: C.ruido }, exp));
    function D_X() { return DATOS.x; } function D_R() { return DATOS.r; }
    tl.fromTo(dotsX, { attr: { r: 0 } }, { attr: { r: 13 }, duration: 0.3, ease: "back.out(3)", stagger: 0.08 }, 1.0);
    tl.fromTo(dotsR, { attr: { r: 0 } }, { attr: { r: 13 }, duration: 0.3, ease: "back.out(3)", stagger: 0.08 }, 2.0);
    const etX = N.t(root, "sensor · 21 datos", { x: 1540, y: 340, size: 32, color: C.sismo });
    const etR = N.t(root, "ambiental · 16 datos", { x: 1540, y: 570, size: 32, color: C.ruido });
    gsap.set([etX, etR], { autoAlpha: 0 });
    N.show(tl, etX, 2.6, { x: -30 }); N.show(tl, etR, 3.4, { x: -30 });
    // llave de 0.4 s entre dos datos
    const llave = s("path", { d: `M${-560 + 4 * dx},-210 v-16 h${dx} v16`, fill: "none", stroke: C.tinta, "stroke-width": 6, "stroke-linecap": "round" }, exp);
    const t04 = txt(exp, "0.4 s", { x: -560 + 4.5 * dx, y: -250, size: 34 });
    N.draw(tl, llave, 4.2, 0.5);
    N.pop(tl, t04, 4.4);
    const chip = N.t(root, "Expediente del USGS", { x: 0, y: 150, w: 1920, align: "center", size: 40, color: C.tinta });
    gsap.set(chip, { autoAlpha: 0 }); N.show(tl, chip, 0.9);

    /* 2 · la base de datos real: 20 sismos en una línea de tiempo */
    tl.to(eOut, { x: "-=560", y: "-=250", scale: 0.42, duration: 1.1, ease: "expo.inOut" }, 7.2);
    tl.to([etX, etR, chip], { autoAlpha: 0, duration: 0.4 }, 7.2);
    const ind = def.ind;
    const lOut = s("g", { transform: "translate(0,560)" }, F);
    const linea = s("g", {}, lOut);
    const xA = (f) => 220 + ((+f.slice(0, 4) + (+f.slice(5, 7) - 1) / 12 - 1993) / (2027 - 1993)) * 1480;
    const eje = s("line", { x1: 200, x2: 1720, y1: 0, y2: 0, stroke: C.tinta, "stroke-width": 8, "stroke-linecap": "round" }, linea);
    N.draw(tl, eje, 7.8, 0.8, "power2.out");
    [1993, 2000, 2010, 2020, 2026].forEach((a) => { const tt = txt(linea, a, { x: xA(a + "-01"), y: 60, size: 30, weight: 700, color: C.tinta }); N.pop(tl, tt, 8.0); });
    const cols = [C.sismo, C.sol, C.ruido, C.morado, C.verde];
    const bolas = ind.map((q, i) => {
      const r = 10 + (q.mag - 6.7) * 22;
      const yy = -40 - r - (i % 3) * 70;
      const g = s("g", {}, linea);
      s("line", { x1: xA(q.fecha), x2: xA(q.fecha), y1: 0, y2: yy, stroke: C.tinta, "stroke-width": 3, opacity: 0.4 }, g);
      s("circle", { cx: xA(q.fecha), cy: yy, r, fill: cols[i % 5] }, g);
      return g;
    });
    bolas.forEach((b, i) => { const c = b.lastChild; tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 8.4 + i * 0.22); tl.fromTo(c, { attr: { r: 0 } }, { attr: { r: +c.getAttribute("r") }, duration: 0.45, ease: "back.out(3)" }, 8.4 + i * 0.22); });
    const cuenta = N.t(root, "0", { x: 1280, y: 120, w: 300, align: "right", size: 170, font: "num", color: C.sismo });
    const cuentaE = N.t(root, "sismos", { x: 1600, y: 210, size: 46, color: C.tinta });
    gsap.set([cuenta, cuentaE], { autoAlpha: 0 });
    tl.set([cuenta, cuentaE], { autoAlpha: 1 }, 8.4);
    N.count(tl, cuenta, 0, 20, 8.4, 4.4, 0);

    /* 3 · todos vistos desde Ciudad Universitaria */
    tl.to(lOut, { y: "+=260", autoAlpha: 0, duration: 0.9, ease: "expo.in" }, 14.0);
    tl.to([cuenta, cuentaE, eOut], { autoAlpha: 0, duration: 0.5 }, 14.2);
    const mOut = s("g", { transform: "translate(250,40) scale(1.35)" }, F);
    const mapa = s("g", {}, mOut);
    MEXICO.states.forEach((st) => s("path", { d: st.d, fill: C.crema, stroke: C.roca1, "stroke-width": 1.4 }, mapa));
    tl.fromTo(mapa, { opacity: 0, scale: 0.6, svgOrigin: "500 313" }, { opacity: 1, scale: 1, duration: 1, ease: "expo.out" }, 14.5);
    const cu = [X(-99.18), Y(19.33)];
    const rayos = ind.map((q, i) => s("path", { d: `M${X(q.lon)},${Y(q.lat)} Q${(X(q.lon) + cu[0]) / 2},${Math.min(Y(q.lat), cu[1]) - 60} ${cu[0]},${cu[1]}`, fill: "none", stroke: cols[i % 5], "stroke-width": 4, "stroke-linecap": "round" }, mapa));
    const puntos = ind.map((q, i) => s("circle", { cx: X(q.lon), cy: Y(q.lat), r: 9, fill: cols[i % 5], stroke: C.blanco, "stroke-width": 3 }, mapa));
    tl.fromTo(puntos, { attr: { r: 0 } }, { attr: { r: 9 }, duration: 0.3, stagger: 0.04, ease: "back.out(3)" }, 15.0);
    rayos.forEach((p, i) => N.draw(tl, p, 15.4 + i * 0.05, 0.9, "power2.inOut"));
    const estrella = sol(mapa, { x: cu[0], y: cu[1], r: 16, n: 10 });
    tl.fromTo(estrella, { scale: 0, svgOrigin: `${cu[0]} ${cu[1]}` }, { scale: 1.4, duration: 0.6, ease: "back.out(3)" }, 16.4);
    const cuT = N.t(root, "Ciudad Universitaria", { x: 250 + cu[0] * 1.35 + 40, y: 40 + cu[1] * 1.35 - 80, size: 34, color: C.tinta });
    gsap.set(cuT, { autoAlpha: 0 }); N.show(tl, cuT, 16.8);
    const ficha = N.t(root, "G.UNM · canal BHZ · 20 muestras/s · 1993–2026", { x: 0, y: 925, w: 1920, align: "center", size: 30, color: C.tinta });
    ficha.style.fontFamily = "Fraunces"; gsap.set(ficha, { autoAlpha: 0 }); N.show(tl, ficha, 17.4);
    N.eq(root, tl, "Δ<i>t</i> = 0.4 s · <i>N</i> = 21 · <i>f</i><sub>max</sub> = 1/(2Δ<i>t</i>) = 1.25 Hz", { y: 790, size: 40, t0: 4.8, t1: 7.0 });
    // reconocer sí, predecir no
    const si = N.t(root, "✓ reconocer", { x: 150, y: 760, size: 44, color: C.blanco });
    si.className = "pill"; si.style.background = C.verde;
    const no = N.t(root, "predecir", { x: 150, y: 860, size: 44, color: C.tinta });
    no.className = "pill"; no.style.background = C.gris2; no.style.textDecoration = "line-through";
    gsap.set([si, no], { autoAlpha: 0 });
    N.pop(tl, no, 18.6); N.pop(tl, si, 19.6);
    tl.to(mOut, { scale: 1.06, x: "-=30", duration: 6, ease: "sine.inOut" }, 15.5);
  },
});
