/* Escena 1 · Historia: la roca se rompe, las ondas viajan, las estaciones escuchan. */
N.add({
  id: "historia",
  quieto: true,
  build(root, tl, T) {
    const { C, s, svg, sol, txt, senal, caminoOnda, estacion, particulas } = K;
    const X = (lon) => 3718.3 + 31.38 * lon, Y = (lat) => 10.7 + (32.53 - lat) * 33.96;

    /* ============ A · corte de la Tierra ============ */
    const A = svg(root, { fondo: C.cielo });
    const camA = s("g", {}, A);
    // cielo: sol y nubes
    const elSol = sol(camA, { x: 1650, y: 140, r: 78 });
    tl.to(elSol.rot, { rotation: 60, svgOrigin: "0 0", duration: T, ease: "none" }, 0);
    const nubes = s("g", {}, camA);
    [[300, 120, 1], [1150, 90, 0.8], [1900, 170, 1.1]].forEach(([x, y, k], i) => {
      const n = s("g", { transform: `translate(${x},${y}) scale(${k})` }, nubes);
      [[0, 0, 40], [44, -14, 52], [96, 0, 38], [48, 14, 36]].forEach(([cx, cy, r]) => s("circle", { cx, cy, r, fill: C.blanco }, n));
      tl.to(n, { x: "-=" + (120 + i * 40), duration: T, ease: "none" }, 0);
    });
    // capas de roca
    const capas = [[330, C.roca1], [470, C.roca2], [610, C.roca3], [770, C.roca4], [910, C.manto]];
    capas.forEach(([y, c], i) => {
      let d = `M-200,${y}`;
      for (let x = -200; x <= 2200; x += 100) d += ` Q${x + 50},${y + (i % 2 ? 10 : -10)} ${x + 100},${y}`;
      s("path", { d: d + " L2200,1300 L-200,1300 Z", fill: c }, camA);
    });
    // burbujas del manto
    for (let i = 0; i < 9; i++) s("circle", { cx: 120 + i * 220, cy: 990 + (i % 3) * 30, r: 18 + (i % 4) * 8, fill: C.magma, opacity: 0.6 }, camA);
    // placa oceánica que se hunde
    const placa = s("g", {}, camA);
    s("path", { d: "M-200,348 L700,408 L1100,558 L2200,960 L2200,1110 L1100,700 L700,532 L-200,476 Z", fill: "#4C6A9E" }, placa);
    s("path", { d: "M-200,348 L700,408 L1100,558 L2200,960", fill: "none", stroke: "#33507F", "stroke-width": 8 }, placa);
    const flechas = s("g", { opacity: 0.55 }, placa);
    const clipF = s("clipPath", { id: "clipPlaca" }, A);
    s("path", { d: "M-200,348 L700,408 L1100,558 L2200,960 L2200,1110 L1100,700 L700,532 L-200,476 Z" }, clipF);
    flechas.setAttribute("clip-path", "url(#clipPlaca)");
    const movil = s("g", {}, flechas);
    const tramos = [[-200, 412, 700, 470, 0], [700, 470, 1100, 630, 0], [1100, 630, 2200, 1035, 0]];
    for (let k = -2; k < 26; k++) {
      // chevrones a lo largo de la placa
      const u = k / 24, xx = -200 + u * 2400;
      const seg = tramos.find((q) => xx >= q[0] && xx <= q[2]) || tramos[2];
      const yy = seg[1] + ((xx - seg[0]) / (seg[2] - seg[0])) * (seg[3] - seg[1]);
      const ang = (Math.atan2(seg[3] - seg[1], seg[2] - seg[0]) * 180) / Math.PI;
      s("path", { d: "M-16,-22 L10,0 L-16,22", fill: "none", stroke: C.blanco, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", transform: `translate(${xx},${yy}) rotate(${ang})` }, movil);
    }
    tl.fromTo(movil, { x: -100, y: -12 }, { x: 0, y: 0, duration: 1.4, ease: "none", repeat: 4 }, 0);
    // mar sobre la placa
    s("path", { d: "M-200,270 L760,270 L760,330 L700,408 L-200,348 Z", fill: C.mar }, camA);
    const olas = s("path", { d: "", fill: "none", stroke: C.mar2, "stroke-width": 8, "stroke-linecap": "round" }, camA);
    const ola = { _redraw(r) { let d = ""; for (let x = -200; x < 760; x += 40) { const y = 272 + Math.sin(x / 40 + r * 30) * 5; d += (x === -200 ? "M" : "L") + x + "," + y.toFixed(1); } olas.setAttribute("d", d); } };
    ola._redraw(0); tl.to(ola, { redraw: 1, duration: T, ease: "none" }, 0);
    // borde del continente que se dobla
    const borde = s("path", { d: "M740,330 L900,330 L860,420 L700,408 Z", fill: C.roca1 }, camA);
    // casas en tierra
    const casas = s("g", {}, camA);
    [[960, C.sismo], [1060, C.morado], [1150, C.sol], [1300, C.ruido], [1400, C.verde], [1520, C.sismo], [1700, C.morado]].forEach(([x, c], i) => {
      const k = 0.8 + (i % 3) * 0.2, g = s("g", { transform: `translate(${x},330) scale(${k})` }, casas);
      s("rect", { x: -30, y: -60, width: 60, height: 60, fill: c }, g);
      s("path", { d: "M-38,-58 L0,-96 L38,-58 Z", fill: C.tinta }, g);
      s("rect", { x: -8, y: -30, width: 16, height: 30, fill: C.crema }, g);
    });
    // grietas de tensión
    const H = [1000, 522];
    const tension = s("g", { transform: `translate(${H[0]},${H[1]})` }, camA);
    const grietas = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r0 = 38, r1 = 70 + (i % 2) * 24;
      const p = s("path", { d: `M${r0 * Math.cos(a)},${r0 * Math.sin(a)} L${((r0 + r1) / 2) * Math.cos(a + 0.12)},${((r0 + r1) / 2) * Math.sin(a + 0.12)} L${r1 * Math.cos(a)},${r1 * Math.sin(a)}`, fill: "none", stroke: C.sol, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, tension);
      grietas.push(p);
    }
    tl.to(grietas, { opacity: 1, duration: 0.3, stagger: 0.45 }, 2.4);
    tl.to(tension, { scale: 1.15, svgOrigin: "0 0", duration: 0.12, repeat: 21, yoyo: true, ease: "sine.inOut" }, 3.6);
    tl.to(borde, { attr: { d: "M740,338 L900,330 L860,420 L700,418 Z" }, duration: 6, ease: "sine.in" }, 0.5);
    // cámara: acercamiento lento al punto de choque
    tl.fromTo(camA, { scale: 1 }, { scale: 1.55, svgOrigin: `${H[0]} ${H[1]}`, duration: 6.6, ease: "sine.inOut" }, 0);

    // ruptura
    const ruptura = s("g", { transform: `translate(${H[0]},${H[1]})` }, camA);
    const flash = s("circle", { r: 30, fill: C.blanco, opacity: 0 }, ruptura);
    const estallido = sol(ruptura, { r: 60, n: 16, color: C.sol, color2: C.sismo, centro: C.blanco });
    gsap.set(estallido, { scale: 0, opacity: 0, svgOrigin: "0 0" });
    tl.to(tension, { opacity: 0, duration: 0.15 }, 6.6);
    tl.to(borde, { attr: { d: "M740,318 L900,322 L860,420 L700,402 Z" }, duration: 0.25, ease: "back.out(4)" }, 6.65);
    tl.fromTo(flash, { attr: { r: 20 }, opacity: 1 }, { attr: { r: 700 }, opacity: 0, duration: 0.9, ease: "expo.out", immediateRender: false }, 6.6);
    tl.to(estallido, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" }, 6.65);
    tl.to(estallido.rot, { rotation: 180, svgOrigin: "0 0", duration: 12, ease: "none" }, 6.65);
    // sacudida
    tl.to(A, { x: 14, y: -10, duration: 0.05, repeat: 13, yoyo: true, ease: "none" }, 6.6);
    tl.set(A, { x: 0, y: 0 }, 7.4);
    tl.to(casas.children, { rotation: (i) => (i % 2 ? 5 : -5), transformOrigin: "50% 100%", duration: 0.08, repeat: 15, yoyo: true, stagger: 0.02 }, 7.2);
    // cámara se aleja para ver las ondas
    tl.to(camA, { scale: 1, duration: 3.2, ease: "power2.inOut" }, 7.6);

    // ondas P (rápidas, delgadas) y S (lentas, gruesas)
    const ondas = s("g", { transform: `translate(${H[0]},${H[1]})` }, camA);
    const P = [], S = [];
    for (let i = 0; i < 5; i++) P.push(s("circle", { r: 1, fill: "none", stroke: C.blanco, "stroke-width": 6, "stroke-dasharray": "3 16", "stroke-linecap": "round", opacity: 0 }, ondas));
    for (let i = 0; i < 4; i++) S.push(s("circle", { r: 1, fill: "none", stroke: C.sismo, "stroke-width": 18, opacity: 0 }, ondas));
    P.forEach((c, i) => tl.fromTo(c, { attr: { r: 30 }, opacity: 1 }, { attr: { r: 1500 }, opacity: 0.1, duration: 4, ease: "none", immediateRender: false }, 10.2 + i * 0.7));
    S.forEach((c, i) => tl.fromTo(c, { attr: { r: 30 }, opacity: 1 }, { attr: { r: 1500 }, opacity: 0.15, duration: 7.5, ease: "none", immediateRender: false }, 14.9 + i * 1.1));
    const chipP = N.t(root, "onda P", { x: 1310, y: 150, size: 44, color: C.tinta });
    chipP.className = "pill"; chipP.style.background = C.blanco;
    const chipS = N.t(root, "onda S", { x: 1310, y: 150, size: 44, color: C.blanco });
    chipS.className = "pill"; chipS.style.background = C.sismo;
    N.pop(tl, chipP, 11.3); tl.to(chipP, { x: -150, y: -40, duration: 3.5, ease: "none" }, 11.3); N.hide(tl, chipP, 14.6);
    N.pop(tl, chipS, 15.6); tl.to(chipS, { x: -60, y: -20, duration: 3.2, ease: "none" }, 15.6); N.hide(tl, chipS, 18.8);

    /* ============ C · el mapa: las estaciones escuchan ============ */
    const B = svg(root, { fondo: C.ruido2 });
    gsap.set(B, { autoAlpha: 0 });
    const camB = s("g", {}, B);
    const mapa = s("g", { transform: "translate(160,40) scale(1.6)" }, camB);
    MEXICO.states.forEach((st) => s("path", { d: st.d, fill: C.arena, stroke: C.roca1, "stroke-width": 1.2 }, mapa));
    const E = [X(-99.9), Y(17.0)];
    const ondasMapa = s("g", { transform: `translate(${E[0]},${E[1]})` }, mapa);
    const RS = [];
    for (let i = 0; i < 5; i++) RS.push(s("circle", { r: 1, fill: "none", stroke: i % 2 ? C.sismo : C.blanco, "stroke-width": i % 2 ? 7 : 3, "stroke-dasharray": i % 2 ? null : "2 8", "stroke-linecap": "round", opacity: 0 }, ondasMapa));
    const t0B = 19.0, vel = 190; // px de mapa por segundo
    RS.forEach((c, i) => tl.fromTo(c, { attr: { r: 4 }, opacity: 1 }, { attr: { r: vel * 7 }, opacity: 0, duration: 7, ease: "none", immediateRender: false }, t0B + 0.4 + i * 0.9));
    const epi = sol(mapa, { x: E[0], y: E[1], r: 12, n: 12 });
    const estaciones = [[19.33, -99.18, 1], [17.55, -99.5], [16.86, -99.88], [19.04, -98.2], [17.07, -96.72], [19.7, -101.19], [20.67, -103.35], [19.17, -96.13], [20.97, -89.62], [25.67, -100.31], [29.07, -110.95], [16.75, -93.12], [21.88, -102.29], [22.15, -100.98], [24.02, -104.67], [32.5, -117.0], [18.5, -88.3], [23.2, -106.4], [27.5, -99.5]];
    estaciones.forEach(([la, lo, cu]) => {
      const x = X(lo), y = Y(la), g = estacion(mapa, { x, y, k: cu ? 0.3 : 0.2, color: cu ? C.sol : C.blanco });
      const d = Math.hypot(x - E[0], y - E[1]), at = t0B + 0.4 + d / vel;
      gsap.set(g, { scale: 0, svgOrigin: `${x} ${y}` });
      tl.to(g, { scale: 1, duration: 0.4, ease: "back.out(3)" }, t0B + 0.2 + (la * 7) % 1.2 * 0.5);
      const halo = s("circle", { cx: x, cy: y - 4, r: 4, fill: "none", stroke: C.sol, "stroke-width": 4, opacity: 0 }, mapa);
      tl.fromTo(halo, { attr: { r: 4 }, opacity: 1 }, { attr: { r: 40 }, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, at);
      tl.to(g, { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }, at);
    });
    // vuelo: del corte al mapa
    tl.to(A, { autoAlpha: 0, scale: 0.4, transformOrigin: "52% 48%", duration: 0.9, ease: "expo.in" }, t0B - 0.6);
    tl.set(B, { autoAlpha: 1 }, t0B - 0.15);
    tl.fromTo(camB, { scale: 4, svgOrigin: `${160 + E[0] * 1.6} ${40 + E[1] * 1.6}` }, { scale: 1, duration: 1.6, ease: "expo.out" }, t0B - 0.15);
    const cuX = 160 + X(-99.18) * 1.6, cuY = 40 + Y(19.33) * 1.6;
    // cámara hacia CU
    tl.to(camB, { scale: 5, svgOrigin: `${cuX} ${cuY}`, duration: 1.3, ease: "expo.in" }, 23.6);

    /* ============ D · el sismógrafo y el ruido ============ */
    const D = svg(root, { fondo: C.cielo });
    gsap.set(D, { autoAlpha: 0 });
    tl.set(D, { autoAlpha: 1 }, 24.85);
    tl.set(B, { autoAlpha: 0 }, 24.9);
    particulas(D, tl, T, { n: 22, colores: [C.blanco, C.sol2], seed: 4 });
    const papel = s("g", {}, D);
    s("rect", { x: 170, y: 430, width: 1580, height: 380, rx: 36, fill: "rgba(29,36,64,.15)", transform: "translate(0,12)" }, papel);
    s("rect", { x: 170, y: 430, width: 1580, height: 380, rx: 36, fill: C.crema }, papel);
    for (let i = 1; i < 6; i++) s("line", { x1: 210, x2: 1710, y1: 430 + i * 63, y2: 430 + i * 63, stroke: "#EADFC8", "stroke-width": 2 }, papel);
    tl.fromTo(papel, { scale: 0.3, opacity: 0, svgOrigin: "960 620" }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 24.85);
    const ys = senal(900, { seed: 11, iP: 0.48, iS: 0.66, ruido: 0.16, p: 0.3, sAmp: 0.95 });
    const traza = s("path", { d: caminoOnda(ys, 220, 1700, 620, 150), fill: "none", stroke: C.tinta, "stroke-width": 4, "stroke-linejoin": "round" }, papel);
    const pluma = s("circle", { r: 13, fill: C.sismo, stroke: C.blanco, "stroke-width": 4 }, papel);
    const L = { _redraw(r) { const len = traza.getTotalLength() * r, p = traza.getPointAtLength(len); pluma.setAttribute("cx", p.x); pluma.setAttribute("cy", p.y); traza.style.strokeDasharray = traza.getTotalLength() + 1; traza.style.strokeDashoffset = traza.getTotalLength() - len; } };
    L._redraw(0); tl.to(L, { redraw: 1, duration: 5.6, ease: "none" }, 25.2);
    // fuentes de ruido: el mar, el viento, la ciudad
    const fuentes = s("g", {}, D);
    const mar = s("g", { transform: "translate(380,250)" }, fuentes);
    for (let i = 0; i < 3; i++) s("path", { d: `M-110,${i * 30} q27,-24 55,0 t55,0 t55,0 t55,0`, fill: "none", stroke: C.ruido, "stroke-width": 12, "stroke-linecap": "round" }, mar);
    const viento = s("g", { transform: "translate(960,230)" }, fuentes);
    [[-70, -30, 120], [-100, 6, 160], [-60, 42, 110]].forEach(([x, y, w]) => s("path", { d: `M${x},${y} h${w} a20,20 0 1 0 -20,-20`, fill: "none", stroke: C.blanco, "stroke-width": 12, "stroke-linecap": "round" }, viento));
    const ciudad = s("g", { transform: "translate(1490,330)" }, fuentes);
    [[-120, 120, 50, C.morado], [-60, 190, 60, C.sismo], [10, 150, 50, C.ruido], [70, 100, 50, C.sol]].forEach(([x, hh, w, c]) => {
      s("rect", { x, y: -hh, width: w, height: hh, fill: c }, ciudad);
      for (let j = 0; j < Math.floor(hh / 34); j++) s("rect", { x: x + 12, y: -hh + 12 + j * 34, width: w - 24, height: 14, fill: C.sol2 }, ciudad);
    });
    N.pop(tl, [mar, viento, ciudad], 25.4, { stagger: 0.5 });
    tl.to(mar, { x: "+=30", duration: 0.8, yoyo: true, repeat: 5, ease: "sine.inOut" }, 26);
    tl.to(viento, { x: "+=40", duration: 0.6, yoyo: true, repeat: 7, ease: "sine.inOut" }, 26.4);
    tl.to(ciudad, { y: "-=8", duration: 0.25, yoyo: true, repeat: 15, ease: "sine.inOut" }, 26.8);
    // vibraciones que bajan de cada fuente al papel
    [[380, 330], [960, 300], [1490, 340]].forEach(([x, y], i) => {
      for (let k = 0; k < 3; k++) {
        const v = s("path", { d: `M${x - 40},${y + 20 + k * 22} q20,-12 40,0 t40,0`, fill: "none", stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }, D);
        tl.fromTo(v, { opacity: 0, y: 0 }, { opacity: 0.6, y: 50, duration: 0.9, ease: "power1.in", repeat: 3, delay: 0 }, 25.8 + i * 0.4 + k * 0.25);
        tl.to(v, { opacity: 0, duration: 0.2 }, 29.6);
      }
    });

    /* ============ E · la pregunta ============ */
    tl.to(fuentes, { y: "-=60", opacity: 0, duration: 0.6, ease: "power2.in" }, 29.8);
    tl.to(papel, { y: 120, scale: 0.82, svgOrigin: "960 620", duration: 1, ease: "expo.inOut" }, 29.9);
    tl.to(pluma, { opacity: 0, duration: 0.3 }, 30.6);
    // el trazo se pinta de dos colores
    const iCorte = 0.48;
    const azul = s("path", { d: caminoOnda(ys.slice(0, Math.round(900 * iCorte)), 220, 220 + 1480 * iCorte, 620, 150), fill: "none", stroke: C.ruido, "stroke-width": 5, opacity: 0 }, papel);
    const rojo = s("path", { d: caminoOnda(ys.slice(Math.round(900 * iCorte) - 1), 220 + 1480 * iCorte, 1700, 620, 150), fill: "none", stroke: C.sismo, "stroke-width": 5, opacity: 0 }, papel);
    tl.to([azul, rojo], { opacity: 1, duration: 0.6, stagger: 0.25 }, 30.4);
    const titulo = N.t(root, '¿<span style="color:#E4572E">Sismo</span> o <span style="color:#2E86AB">ruido</span>?', { x: 0, y: 150, w: 1920, align: "center", size: 150 });
    gsap.set(titulo, { autoAlpha: 0 });
    N.write(tl, titulo, 30.3, 0.8);
  },
});
