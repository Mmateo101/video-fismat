/* Escena 3 · El problema: falsas alarmas, avisos tarde y comunidades con pocos sensores. */
N.add({
  id: "problema",
  entrada: "barrido",
  build(root, tl, T) {
    const { C, s, svg, txt, senal, caminoOnda, particulas, estacion, rng } = K;
    const X = (lon) => 3718.3 + 31.38 * lon, Y = (lat) => 10.7 + (32.53 - lat) * 33.96;
    const F = svg(root, { fondo: C.noche });
    particulas(F, tl, T, { n: 30, colores: [C.sol, C.ruido2, C.blanco], seed: 31, opacidad: 0.22 });

    // cameo de Víctor
    N.cameo(root, tl, { id: "B", quien: "Víctor", linea: "«Las alertas sísmicas deciden en segundos…»", x: 110, y: 230, w: 768, h: 432, t0: 0.6, t1: 13.8, color: C.sol });

    // panel del sismógrafo (grupo externo fijo, interno animable)
    const pOut = s("g", { transform: "translate(1000,230)" }, F);
    const panel = s("g", {}, pOut);
    s("rect", { x: 0, y: 12, width: 800, height: 432, rx: 30, fill: "rgba(0,0,0,.25)" }, panel);
    s("rect", { x: 0, y: 0, width: 800, height: 432, rx: 30, fill: C.crema }, panel);
    for (let i = 1; i < 6; i++) s("line", { x1: 30, x2: 770, y1: i * 72, y2: i * 72, stroke: "#EADFC8", "stroke-width": 2 }, panel);
    tl.fromTo(panel, { scale: 0.5, opacity: 0, svgOrigin: "400 216" }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 0.4);
    // 1) ruido con un pico: falsa alarma
    const r = rng(5), y1 = [];
    for (let i = 0; i < 500; i++) { let v = (r() - 0.5) * 0.35 + Math.sin(i * 0.25) * 0.12; if (i > 250 && i < 285) v += Math.sin(i * 1.4) * 0.9 * Math.sin(((i - 250) / 35) * Math.PI); y1.push(v); }
    const t1 = s("path", { d: caminoOnda(y1, 40, 760, 216, 150), fill: "none", stroke: C.ruido, "stroke-width": 4 }, panel);
    N.draw(tl, t1, 1.4, 3.2, "none");
    // campana
    const cOut = s("g", { transform: "translate(1640,200)" }, F);
    const campana = s("g", {}, cOut);
    s("path", { d: "M-50,30 Q-50,-50 0,-56 Q50,-50 50,30 L64,46 L-64,46 Z", fill: C.sol }, campana);
    s("circle", { cx: 0, cy: 60, r: 14, fill: C.sol }, campana);
    s("circle", { cx: 0, cy: -62, r: 9, fill: C.sol }, campana);
    N.pop(tl, campana, 3.2);
    tl.to(campana, { rotation: 18, svgOrigin: "0 -60", duration: 0.09, yoyo: true, repeat: 17, ease: "sine.inOut" }, 3.4);
    const falsa = N.t(root, "falsa alarma", { x: 1220, y: 690, size: 40, color: C.blanco });
    falsa.className = "pill"; falsa.style.background = C.sismo;
    N.pop(tl, falsa, 4.6);
    tl.to([campana, falsa], { autoAlpha: 0, scale: 0.6, duration: 0.35 }, 8.6);
    tl.to(t1, { opacity: 0, duration: 0.4 }, 8.6);
    // 2) la onda P escondida en el ruido: aviso tarde
    const y2 = senal(500, { seed: 8, iP: 0.32, iS: 0.72, ruido: 0.55, p: 0.18, sAmp: 0.9 });
    const t2 = s("path", { d: caminoOnda(y2, 40, 760, 216, 120), fill: "none", stroke: C.tinta, "stroke-width": 4 }, panel);
    N.draw(tl, t2, 9.0, 3.4, "none");
    const marcaP = s("line", { x1: 270, x2: 270, y1: 40, y2: 392, stroke: C.sismo, "stroke-width": 5, "stroke-dasharray": "10 10", opacity: 0 }, panel);
    const marcaS = s("line", { x1: 560, x2: 560, y1: 40, y2: 392, stroke: C.sol, "stroke-width": 7, opacity: 0 }, panel);
    const brecha = s("rect", { x: 270, y: 40, width: 0, height: 352, fill: C.sismo, opacity: 0.18 }, panel);
    tl.to(marcaP, { opacity: 1, duration: 0.3 }, 10.4);
    tl.to(marcaS, { opacity: 1, duration: 0.3 }, 11.8);
    tl.to(brecha, { attr: { width: 290 }, duration: 0.8, ease: "power2.out" }, 11.9);
    const tarde = N.t(root, "aviso tarde", { x: 1260, y: 690, size: 40, color: C.tinta });
    tarde.className = "pill"; tarde.style.background = C.sol;
    N.pop(tl, tarde, 12.2);
    tl.to(tarde, { autoAlpha: 0, duration: 0.3 }, 14.0);

    // reacomodo: el panel se va a la izquierda y entra el mapa
    tl.to(panel, { x: -880, y: 60, scale: 0.72, svgOrigin: "0 0", duration: 1.1, ease: "expo.inOut" }, 13.9);
    const mOut = s("g", { transform: "translate(700,190) scale(1.0)" }, F);
    const mapa = s("g", {}, mOut);
    MEXICO.states.forEach((st) => s("path", { d: st.d, fill: C.noche2, stroke: "#3A4675", "stroke-width": 1.4 }, mapa));
    tl.fromTo(mapa, { opacity: 0, x: 300 }, { opacity: 1, x: 0, duration: 1.0, ease: "expo.out" }, 14.2);
    // muchas estaciones en el centro, pocas en el sur rural
    const centro = [], sur = [];
    const rr = rng(77);
    for (let i = 0; i < 34; i++) centro.push([18.6 + rr() * 2.4, -101 + rr() * 4]);
    [[17.0, -97.6], [16.3, -93.5], [17.7, -100.9]].forEach((p) => sur.push(p));
    const puntos = centro.concat(sur).map(([la, lo]) => s("circle", { cx: X(lo), cy: Y(la), r: 6, fill: C.sol }, mapa));
    tl.fromTo(puntos, { attr: { r: 0 } }, { attr: { r: 6 }, duration: 0.3, stagger: 0.03, ease: "back.out(3)" }, 15.0);
    // comunidades lejos de los sensores
    const casas = [];
    [[16.6, -95.9], [16.2, -97.9], [16.9, -94.6], [15.9, -92.9], [17.3, -98.8], [16.5, -92.2]].forEach(([la, lo], i) => {
      const g = s("g", { transform: `translate(${X(lo)},${Y(la)})` }, mapa);
      const gi = s("g", {}, g);
      s("rect", { x: -11, y: -18, width: 22, height: 18, fill: C.blanco }, gi);
      s("path", { d: "M-15,-17 L0,-32 L15,-17Z", fill: C.sismo }, gi);
      casas.push(gi);
      const halo = s("circle", { r: 10, fill: "none", stroke: C.sismo, "stroke-width": 4, opacity: 0 }, g);
      tl.fromTo(halo, { attr: { r: 10 }, opacity: 0.9 }, { attr: { r: 46 }, opacity: 0, duration: 1.2, repeat: 3, ease: "power1.out", immediateRender: false }, 17.0 + i * 0.15);
    });
    N.pop(tl, casas, 16.6, { stagger: 0.12 });
    tl.to(mOut, { scale: 1.25, x: "-=60", y: "-=70", duration: 6, ease: "sine.inOut" }, 15);

    // cada segundo cuenta: cronómetro geométrico
    tl.to([mapa, panel], { autoAlpha: 0, scale: 0.85, duration: 0.6, ease: "power2.in" }, 21.0);
    const crono = s("g", { transform: "translate(960,500)" }, F);
    const ci = s("g", {}, crono);
    s("circle", { r: 250, fill: C.sol }, ci);
    s("circle", { r: 210, fill: C.crema }, ci);
    s("rect", { x: -34, y: -320, width: 68, height: 60, rx: 12, fill: C.sol }, ci);
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ticks.push(s("line", { x1: 170 * Math.cos(a), y1: 170 * Math.sin(a), x2: 196 * Math.cos(a), y2: 196 * Math.sin(a), stroke: C.gris2, "stroke-width": 14, "stroke-linecap": "round" }, ci));
    }
    const aguja = s("line", { x1: 0, y1: 0, x2: 0, y2: -150, stroke: C.sismo, "stroke-width": 14, "stroke-linecap": "round" }, ci);
    s("circle", { r: 22, fill: C.tinta }, ci);
    tl.fromTo(ci, { scale: 0, rotation: -90, svgOrigin: "0 0" }, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.7)" }, 21.3);
    tl.to(aguja, { rotation: 360, svgOrigin: "0 0", duration: 3.6, ease: "none" }, 21.8);
    tl.to(ticks, { stroke: C.sismo, duration: 0.05, stagger: 0.3 }, 21.8);
    tl.to(ci, { scale: 1.05, svgOrigin: "0 0", duration: 0.15, yoyo: true, repeat: 11, ease: "sine.inOut" }, 21.8);
  },
});
