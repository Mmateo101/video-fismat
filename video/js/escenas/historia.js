/* Escena 1 · Historia (v2): del globo al corte de la Tierra, rebote elástico, ondas P y S,
   estaciones que registran con su tiempo de llegada y el sismógrafo con las fases marcadas. */
N.add({
  id: "historia",
  quieto: true,
  build(root, tl, T) {
    const { C, s, svg, sol, txt, senal, caminoOnda, estacion, particulas, dientes, h } = K;
    const X = (lon) => 3718.3 + 31.38 * lon, Y = (lat) => 10.7 + (32.53 - lat) * 33.96;

    /* ============ 0 · el globo ============ */
    const G0 = svg(root, { fondo: C.noche });
    particulas(G0, tl, 4, { n: 60, colores: [C.blanco, C.sol2], seed: 2, opacidad: 0.6, tam: [3, 7] });
    const gOut = s("g", { transform: "translate(960,560)" }, G0);
    const gIn = s("g", {}, gOut);
    const halo = s("g", {}, gIn);
    s("path", { d: dientes(48, 360, 410), fill: C.sol, opacity: 0.9 }, halo);
    s("path", { d: dientes(48, 345, 380, Math.PI / 48), fill: C.sismo, opacity: 0.9 }, halo);
    tl.to(halo, { rotation: 25, svgOrigin: "0 0", duration: 3, ease: "none" }, 0);
    s("circle", { r: 330, fill: C.mar }, gIn);
    const defs0 = s("defs", {}, G0);
    const cp = s("clipPath", { id: "clipGlobo" }, defs0);
    s("circle", { r: 330 }, cp);
    const dentro = s("g", { "clip-path": "url(#clipGlobo)" }, gIn);
    // México sobre el globo (el centro del mapa queda cerca del centro del globo)
    const mx = s("g", { transform: "translate(-330,-250) scale(0.62)" }, dentro);
    s("path", { d: MEXICO.outline, fill: C.arena, stroke: C.roca1, "stroke-width": 2 }, mx);
    // meridianos que giran y paralelos fijos
    const mer = [];
    for (let k = 0; k < 6; k++) mer.push(s("ellipse", { rx: 330, ry: 330, fill: "none", stroke: C.mar2, "stroke-width": 3, opacity: 0.7 }, dentro));
    [-220, -110, 0, 110, 220].forEach((y) => s("ellipse", { cx: 0, cy: y, rx: Math.sqrt(330 * 330 - y * y), ry: 18, fill: "none", stroke: C.mar2, "stroke-width": 3, opacity: 0.6 }, dentro));
    const giro = { _redraw(r) { mer.forEach((m, k) => m.setAttribute("rx", (330 * Math.abs(Math.sin(r * 1.2 + (k * Math.PI) / 6))).toFixed(1))); } };
    giro._redraw(0);
    tl.to(giro, { redraw: 1, duration: 3, ease: "none" }, 0);
    // epicentro en Guerrero
    const ex = -330 + X(-99.9) * 0.62, ey = -250 + Y(17.0) * 0.62;
    const pulso = s("circle", { cx: ex, cy: ey, r: 8, fill: "none", stroke: C.sismo, "stroke-width": 5 }, dentro);
    s("circle", { cx: ex, cy: ey, r: 9, fill: C.sismo, stroke: C.blanco, "stroke-width": 3 }, dentro);
    tl.fromTo(pulso, { attr: { r: 8 }, opacity: 1 }, { attr: { r: 50 }, opacity: 0, duration: 0.8, repeat: 2, ease: "power1.out", immediateRender: false }, 0.2);
    tl.fromTo(gIn, { scale: 0.75 }, { scale: 1, svgOrigin: "0 0", duration: 1.3, ease: "expo.out" }, 0);
    // vuelo hacia el epicentro
    tl.to(gIn, { scale: 9, svgOrigin: `${ex} ${ey}`, duration: 1.3, ease: "expo.in" }, 1.4);
    tl.to(G0, { autoAlpha: 0, duration: 0.35 }, 2.45);

    /* ============ A · corte de la Tierra ============ */
    const A = svg(root, { fondo: C.cielo });
    root.insertBefore(A, G0);
    const camA = s("g", {}, A);
    const elSol = sol(camA, { x: 1650, y: 140, r: 78 });
    tl.to(elSol.rot, { rotation: 60, svgOrigin: "0 0", duration: T, ease: "none" }, 0);
    const nubes = s("g", {}, camA);
    [[300, 120, 1], [1150, 90, 0.8], [1900, 170, 1.1]].forEach(([x, y, k], i) => {
      const nO = s("g", { transform: `translate(${x},${y}) scale(${k})` }, nubes);
      const n = s("g", {}, nO);
      [[0, 0, 40], [44, -14, 52], [96, 0, 38], [48, 14, 36]].forEach(([cx, cy, r]) => s("circle", { cx, cy, r, fill: C.blanco }, n));
      tl.to(n, { x: -(120 + i * 40), duration: T, ease: "none" }, 0);
    });
    const capas = [[330, C.roca1], [470, C.roca2], [610, C.roca3], [770, C.roca4], [910, C.manto]];
    capas.forEach(([y, c], i) => {
      let d = `M-200,${y}`;
      for (let x = -200; x <= 2200; x += 100) d += ` Q${x + 50},${y + (i % 2 ? 10 : -10)} ${x + 100},${y}`;
      s("path", { d: d + " L2200,1300 L-200,1300 Z", fill: c }, camA);
    });
    for (let i = 0; i < 9; i++) s("circle", { cx: 120 + i * 220, cy: 990 + (i % 3) * 30, r: 18 + (i % 4) * 8, fill: C.magma, opacity: 0.6 }, camA);
    // placa oceánica con flechas de empuje
    const PLACA = "M-200,348 L700,408 L1100,558 L2200,960 L2200,1110 L1100,700 L700,532 L-200,476 Z";
    const placa = s("g", {}, camA);
    s("path", { d: PLACA, fill: "#4C6A9E" }, placa);
    const defsA = s("defs", {}, A);
    const clipF = s("clipPath", { id: "clipPlaca" }, defsA);
    s("path", { d: PLACA }, clipF);
    const flechas = s("g", { opacity: 0.55, "clip-path": "url(#clipPlaca)" }, placa);
    const movil = s("g", {}, flechas);
    const tramos = [[-200, 412, 700, 470], [700, 470, 1100, 630], [1100, 630, 2200, 1035]];
    for (let k = -2; k < 26; k++) {
      const xx = -200 + (k / 24) * 2400, seg = tramos.find((q) => xx >= q[0] && xx <= q[2]) || tramos[2];
      const yy = seg[1] + ((xx - seg[0]) / (seg[2] - seg[0])) * (seg[3] - seg[1]);
      const ang = (Math.atan2(seg[3] - seg[1], seg[2] - seg[0]) * 180) / Math.PI;
      s("path", { d: "M-16,-22 L10,0 L-16,22", fill: "none", stroke: C.blanco, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", transform: `translate(${xx},${yy}) rotate(${ang})` }, movil);
    }
    tl.fromTo(movil, { x: -100, y: -12 }, { x: 0, y: 0, duration: 1.4, ease: "none", repeat: 4 }, 0);
    // contacto entre placas: dientes que se traban
    const yI = (x) => (x <= 700 ? 348 + ((x + 200) / 900) * 60 : x <= 1100 ? 408 + ((x - 700) / 400) * 150 : 558 + ((x - 1100) / 1100) * 402);
    let dz = "";
    for (let x = 760, k = 0; x <= 1300; x += 22, k++) dz += (k ? "L" : "M") + x + "," + (yI(x) + (k % 2 ? -9 : 9)).toFixed(1);
    s("path", { d: dz, fill: "none", stroke: "#33507F", "stroke-width": 6, "stroke-linejoin": "round" }, camA);
    // mar y olas
    s("path", { d: "M-200,270 L760,270 L760,330 L700,408 L-200,348 Z", fill: C.mar }, camA);
    const olas = s("path", { d: "", fill: "none", stroke: C.mar2, "stroke-width": 8, "stroke-linecap": "round" }, camA);
    const ola = { _redraw(r) { let d = ""; for (let x = -200; x < 760; x += 40) d += (x === -200 ? "M" : "L") + x + "," + (272 + Math.sin(x / 40 + r * 30) * 5).toFixed(1); olas.setAttribute("d", d); } };
    ola._redraw(0); tl.to(ola, { redraw: 1, duration: T, ease: "none" }, 0);
    // calor del esfuerzo acumulado
    const H = [1000, 522];
    const grad = s("radialGradient", { id: "calor" }, defsA);
    s("stop", { offset: "0%", "stop-color": C.sol, "stop-opacity": 0.95 }, grad);
    s("stop", { offset: "55%", "stop-color": C.sismo, "stop-opacity": 0.55 }, grad);
    s("stop", { offset: "100%", "stop-color": C.sismo, "stop-opacity": 0 }, grad);
    const calor = s("circle", { cx: H[0], cy: H[1], r: 40, fill: "url(#calor)", opacity: 0 }, camA);
    tl.to(calor, { attr: { r: 190 }, opacity: 1, duration: 4, ease: "sine.in" }, 2.6);
    tl.to(calor, { opacity: 0.6, duration: 0.18, yoyo: true, repeat: 9, ease: "sine.inOut" }, 4.8);
    tl.to(calor, { opacity: 0, attr: { r: 260 }, duration: 0.5, ease: "power2.out" }, 6.6);
    // malla elástica en la placa continental: se deforma y rebota (rebote elástico)
    const malla = s("g", {}, camA);
    const lineas = [];
    for (let x = 860; x <= 1720; x += 86) lineas.push({ x, p: s("path", { fill: "none", stroke: C.roca4, "stroke-width": 4, "stroke-dasharray": "10 10", opacity: 0.55 }, malla) });
    const def = { v: 0 };
    const dibMalla = () => lineas.forEach(({ x, p }) => {
      const yb = yI(x) - 6, k = Math.exp(-Math.abs(x - 1000) / 380) * 70 * def.v;
      p.setAttribute("d", `M${x},336 Q${x - k * 1.6},${(336 + yb) / 2} ${x - k},${yb}`);
    });
    dibMalla();
    tl.to(def, { v: 1, duration: 4, ease: "sine.in", onUpdate: dibMalla }, 2.6);
    tl.to(def, { v: -0.45, duration: 0.18, ease: "power3.out", onUpdate: dibMalla }, 6.6);
    tl.to(def, { v: 0, duration: 1.6, ease: "elastic.out(1, 0.35)", onUpdate: dibMalla }, 6.78);
    tl.fromTo(malla, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.6);
    // casas
    const casas = s("g", {}, camA);
    [[960, C.sismo], [1060, C.morado], [1150, C.sol], [1300, C.ruido], [1400, C.verde], [1520, C.sismo], [1700, C.morado]].forEach(([x, c], i) => {
      const gO = s("g", { transform: `translate(${x},330) scale(${0.8 + (i % 3) * 0.2})` }, casas);
      const g = s("g", {}, gO);
      s("rect", { x: -30, y: -60, width: 60, height: 60, fill: c }, g);
      s("path", { d: "M-38,-58 L0,-96 L38,-58 Z", fill: C.tinta }, g);
      s("rect", { x: -8, y: -30, width: 16, height: 30, fill: C.crema }, g);
    });
    // cámara: entra desde el globo y se acerca al punto de choque
    gsap.set(camA, { svgOrigin: `${H[0]} ${H[1]}` });
    tl.fromTo(camA, { scale: 1.9, svgOrigin: `${H[0]} ${H[1]}` }, { scale: 1.5, svgOrigin: `${H[0]} ${H[1]}`, duration: 1.2, ease: "expo.out" }, 2.4);
    tl.to(camA, { scale: 1.65, svgOrigin: `${H[0]} ${H[1]}`, duration: 3, ease: "sine.inOut" }, 3.6);

    // ruptura: la grieta corre por la falla
    const grieta1 = s("path", { d: `M${H[0]},${H[1]} L${H[0] - 120},${yI(H[0] - 120)} L${H[0] - 240},${yI(H[0] - 240)}`, fill: "none", stroke: C.blanco, "stroke-width": 9, "stroke-linecap": "round", opacity: 0 }, camA);
    const grieta2 = s("path", { d: `M${H[0]},${H[1]} L${H[0] + 140},${yI(H[0] + 140)} L${H[0] + 320},${yI(H[0] + 320)}`, fill: "none", stroke: C.blanco, "stroke-width": 9, "stroke-linecap": "round", opacity: 0 }, camA);
    N.draw(tl, [grieta1, grieta2], 6.6, 0.35, "power2.out");
    tl.to([grieta1, grieta2], { stroke: C.sol, duration: 0.6 }, 7.0);
    const ruptura = s("g", { transform: `translate(${H[0]},${H[1]})` }, camA);
    const flash = s("circle", { r: 20, fill: C.blanco, opacity: 0 }, ruptura);
    const estallido = sol(ruptura, { r: 60, n: 16, color: C.sol, color2: C.sismo, centro: C.blanco });
    gsap.set(estallido, { scale: 0, opacity: 0, svgOrigin: "0 0" });
    tl.fromTo(flash, { attr: { r: 20 }, opacity: 1 }, { attr: { r: 700 }, opacity: 0, duration: 0.9, ease: "expo.out", immediateRender: false }, 6.6);
    tl.to(estallido, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" }, 6.65);
    tl.to(estallido.rot, { rotation: 180, svgOrigin: "0 0", duration: 12, ease: "none" }, 6.65);
    tl.to(A, { x: 14, y: -10, duration: 0.05, repeat: 13, yoyo: true, ease: "none" }, 6.6);
    tl.set(A, { x: 0, y: 0 }, 7.4);
    tl.to(casas.querySelectorAll(":scope > g > g"), { rotation: (i) => (i % 2 ? 6 : -6), transformOrigin: "50% 100%", duration: 0.08, repeat: 15, yoyo: true, stagger: 0.02 }, 7.2);
    tl.to(camA, { scale: 1, svgOrigin: `${H[0]} ${H[1]}`, duration: 3.2, ease: "power2.inOut" }, 7.6);

    // ondas P (compresión: anillos de puntos) y S (cortante: anillos ondulados)
    const ondas = s("g", { transform: `translate(${H[0]},${H[1]})` }, camA);
    const P = [];
    for (let i = 0; i < 5; i++) P.push(s("circle", { r: 1, fill: "none", stroke: C.blanco, "stroke-width": 7, "stroke-dasharray": "2 18", "stroke-linecap": "round", opacity: 0 }, ondas));
    P.forEach((c, i) => tl.fromTo(c, { attr: { r: 30 }, opacity: 1 }, { attr: { r: 1500 }, opacity: 0.1, duration: 4, ease: "none", immediateRender: false }, 10.2 + i * 0.7));
    const S = [];
    for (let i = 0; i < 4; i++) S.push(s("path", { d: "", fill: "none", stroke: C.sismo, "stroke-width": 9, "stroke-linejoin": "round", opacity: 0 }, ondas));
    const anilloS = (R) => { let d = ""; for (let k = 0; k <= 180; k++) { const a = (k / 180) * Math.PI * 2, r = R + Math.min(18, R * 0.2) * Math.sin(a * 24); d += (k ? "L" : "M") + (r * Math.cos(a)).toFixed(1) + "," + (r * Math.sin(a)).toFixed(1); } return d; };
    S.forEach((p, i) => {
      const o = { R: 30 };
      tl.fromTo(o, { R: 30 }, { R: 1500, duration: 7.5, ease: "none", immediateRender: false, onUpdate: () => p.setAttribute("d", anilloS(o.R)) }, 14.9 + i * 1.1);
      tl.fromTo(p, { opacity: 1 }, { opacity: 0.15, duration: 7.5, ease: "none", immediateRender: false }, 14.9 + i * 1.1);
    });

    // recuadros técnicos: cómo se mueven las partículas y la velocidad de cada onda
    const O = svg(root, {});
    const recuadro = (y0, titulo, vel, col, tipo, t0, t1) => {
      const gO = s("g", { transform: `translate(1270,${y0})` }, O);
      const g = s("g", {}, gO);
      s("rect", { x: 0, y: 8, width: 580, height: 170, rx: 26, fill: "rgba(29,36,64,.18)" }, g);
      s("rect", { x: 0, y: 0, width: 580, height: 170, rx: 26, fill: C.crema }, g);
      txt(g, titulo, { x: 30, y: 38, size: 34, anchor: "start", color: col });
      txt(g, vel, { x: 550, y: 38, size: 30, anchor: "end", weight: 700, color: C.tinta, font: "Fraunces" });
      const pts = [];
      for (let i = 0; i < 12; i++) pts.push(s("circle", { cx: 50 + i * 44, cy: 112, r: 11, fill: col }, g));
      const mov = { _redraw(r) {
        const ph = r * 20;
        pts.forEach((c, i) => {
          const a = Math.sin(i * 0.9 - ph);
          if (tipo === "P") c.setAttribute("cx", (50 + i * 44 + 14 * a).toFixed(1));
          else c.setAttribute("cy", (112 + 26 * a).toFixed(1));
        });
      } };
      mov._redraw(0);
      tl.to(mov, { redraw: 1, duration: t1 - t0, ease: "none" }, t0);
      tl.fromTo(g, { autoAlpha: 0, x: 120 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: "expo.out" }, t0);
      tl.to(g, { autoAlpha: 0, x: 120, duration: 0.4, ease: "power2.in" }, t1);
      return g;
    };
    recuadro(70, "onda P · compresión", "≈ 6 km/s", C.ruido, "P", 10.6, 18.9);
    recuadro(270, "onda S · cortante", "≈ 3.5 km/s", C.sismo, "S", 15.3, 18.9);

    /* ============ B · el mapa: las estaciones registran ============ */
    const B = svg(root, { fondo: C.ruido2 });
    gsap.set(B, { autoAlpha: 0 });
    const camB = s("g", {}, B);
    const mapa = s("g", { transform: "translate(160,40) scale(1.6)" }, camB);
    MEXICO.states.forEach((st) => s("path", { d: st.d, fill: C.arena, stroke: C.roca1, "stroke-width": 1.2 }, mapa));
    const E = [X(-99.9), Y(17.0)];
    const ondasMapa = s("g", { transform: `translate(${E[0]},${E[1]})` }, mapa);
    const RS = [];
    for (let i = 0; i < 5; i++) RS.push(s("circle", { r: 1, fill: "none", stroke: i % 2 ? C.sismo : C.blanco, "stroke-width": i % 2 ? 7 : 3, "stroke-dasharray": i % 2 ? null : "2 8", "stroke-linecap": "round", opacity: 0 }, ondasMapa));
    const t0B = 19.0, vel = 190;
    RS.forEach((c, i) => tl.fromTo(c, { attr: { r: 4 }, opacity: 1 }, { attr: { r: vel * 7 }, opacity: 0, duration: 7, ease: "none", immediateRender: false }, t0B + 0.4 + i * 0.9));
    sol(mapa, { x: E[0], y: E[1], r: 12, n: 12 });
    const estaciones = [[19.33, -99.18, 1], [17.55, -99.5], [16.86, -99.88], [19.04, -98.2], [17.07, -96.72], [19.7, -101.19], [20.67, -103.35], [19.17, -96.13], [20.97, -89.62], [25.67, -100.31], [29.07, -110.95], [16.75, -93.12], [21.88, -102.29], [22.15, -100.98], [24.02, -104.67], [32.5, -117.0], [18.5, -88.3], [23.2, -106.4], [27.5, -99.5]];
    estaciones.forEach(([la, lo, cu]) => {
      const x = X(lo), y = Y(la), g = estacion(mapa, { x, y, k: cu ? 0.3 : 0.2, color: cu ? C.sol : C.blanco });
      const d = Math.hypot(x - E[0], y - E[1]), at = t0B + 0.4 + d / vel;
      gsap.set(g, { scale: 0, svgOrigin: `${x} ${y}` });
      tl.to(g, { scale: 1, duration: 0.4, ease: "back.out(3)" }, t0B + 0.2 + ((la * 7) % 1.2) * 0.5);
      const anillo = s("circle", { cx: x, cy: y - 4, r: 4, fill: "none", stroke: C.sol, "stroke-width": 4, opacity: 0 }, mapa);
      tl.fromTo(anillo, { attr: { r: 4 }, opacity: 1 }, { attr: { r: 40 }, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, at);
      tl.to(g, { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }, at);
      // mini sismograma junto a la estación
      const ys = senal(60, { seed: Math.round(la * 10), iP: 0.15, iS: 0.4, ruido: 0.05, p: 0.4, sAmp: 1 });
      const mini = s("path", { d: caminoOnda(ys, x + 10, x + 44, y - 4, cu ? 9 : 6), fill: "none", stroke: C.tinta, "stroke-width": cu ? 2 : 1.5 }, mapa);
      N.draw(tl, mini, at + 0.05, 0.6, "none");
    });
    // reloj del tiempo real de llegada de la onda P (a unos 6 km/s; 1 grado ≈ 111 km)
    const relojT = N.t(root, "", { x: 70, y: 70, size: 44, font: "num", color: C.blanco });
    relojT.className = "pill"; relojT.style.background = C.tinta;
    gsap.set(relojT, { autoAlpha: 0 });
    const kmPorPx = 111 / 33.96;
    const cont = { _redraw(r) { relojT.textContent = `t = ${Math.round((vel * 4.2 * r * kmPorPx) / 6)} s`; } };
    cont._redraw(0);
    tl.set(relojT, { autoAlpha: 1 }, t0B + 0.4);
    tl.to(cont, { redraw: 1, duration: 4.2, ease: "none" }, t0B + 0.4);
    tl.set(relojT, { autoAlpha: 0 }, 23.8);
    const cuX = 160 + X(-99.18) * 1.6, cuY = 40 + Y(19.33) * 1.6;
    const cuT = N.t(root, "CU · onda P en ~43 s", { x: cuX + 40, y: cuY - 90, size: 30, color: C.tinta });
    gsap.set(cuT, { autoAlpha: 0 }); N.show(tl, cuT, t0B + 0.9); N.hide(tl, cuT, 23.4);
    // transición desde el corte: vuelo hacia el mapa
    tl.to(A, { autoAlpha: 0, scale: 0.4, transformOrigin: "52% 48%", duration: 0.9, ease: "expo.in" }, t0B - 0.6);
    tl.set(B, { autoAlpha: 1 }, t0B - 0.15);
    tl.fromTo(camB, { scale: 4, svgOrigin: `${160 + E[0] * 1.6} ${40 + E[1] * 1.6}` }, { scale: 1, duration: 1.6, ease: "expo.out" }, t0B - 0.15);
    tl.to(camB, { scale: 5, svgOrigin: `${cuX} ${cuY}`, duration: 1.3, ease: "expo.in" }, 23.6);

    /* ============ D · el sismógrafo, las fases y el ruido ============ */
    const D = svg(root, { fondo: C.cielo });
    gsap.set(D, { autoAlpha: 0 });
    tl.set(D, { autoAlpha: 1 }, 24.85);
    tl.set(B, { autoAlpha: 0 }, 24.9);
    particulas(D, tl, T, { n: 22, colores: [C.blanco, C.sol2], seed: 4 });
    const papel = s("g", {}, D);
    s("rect", { x: 170, y: 430, width: 1580, height: 380, rx: 36, fill: "rgba(29,36,64,.15)", transform: "translate(0,12)" }, papel);
    s("rect", { x: 170, y: 430, width: 1580, height: 380, rx: 36, fill: C.crema }, papel);
    for (let i = 1; i < 6; i++) s("line", { x1: 210, x2: 1710, y1: 430 + i * 63, y2: 430 + i * 63, stroke: "#EADFC8", "stroke-width": 2 }, papel);
    // eje de tiempo
    for (let i = 0; i <= 10; i++) {
      const x = 220 + i * 148;
      s("line", { x1: x, x2: x, y1: 790, y2: 806, stroke: C.gris, "stroke-width": 3 }, papel);
      if (i % 2 === 0) txt(papel, `${i * 10} s`, { x, y: 836, size: 22, weight: 700, color: C.gris });
    }
    tl.fromTo(papel, { scale: 0.3, opacity: 0, svgOrigin: "960 620" }, { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 24.85);
    const iP = 0.48, iS = 0.66;
    const ys = senal(900, { seed: 11, iP, iS, ruido: 0.16, p: 0.3, sAmp: 0.95 });
    const traza = s("path", { d: caminoOnda(ys, 220, 1700, 620, 150), fill: "none", stroke: C.tinta, "stroke-width": 4, "stroke-linejoin": "round" }, papel);
    const pluma = s("circle", { r: 13, fill: C.sismo, stroke: C.blanco, "stroke-width": 4 }, papel);
    const L = { _redraw(r) { const len = traza.getTotalLength() * r, p = traza.getPointAtLength(len); pluma.setAttribute("cx", p.x); pluma.setAttribute("cy", p.y); traza.style.strokeDasharray = traza.getTotalLength() + 1; traza.style.strokeDashoffset = traza.getTotalLength() - len; } };
    L._redraw(0); tl.to(L, { redraw: 1, duration: 5.6, ease: "none" }, 25.2);
    // marcas de las fases P y S
    const xP = 220 + 1480 * iP, xS = 220 + 1480 * iS;
    const mP = s("line", { x1: xP, x2: xP, y1: 450, y2: 790, stroke: C.ruido, "stroke-width": 4, "stroke-dasharray": "10 8", opacity: 0 }, papel);
    const mS = s("line", { x1: xS, x2: xS, y1: 450, y2: 790, stroke: C.sismo, "stroke-width": 4, "stroke-dasharray": "10 8", opacity: 0 }, papel);
    const lP = txt(papel, "P", { x: xP, y: 470, size: 34, color: C.ruido }), lS = txt(papel, "S", { x: xS, y: 470, size: 34, color: C.sismo });
    gsap.set([lP, lS], { opacity: 0 });
    tl.to([mP, lP], { opacity: 1, duration: 0.3 }, 25.2 + 5.6 * iP);
    tl.to([mS, lS], { opacity: 1, duration: 0.3 }, 25.2 + 5.6 * iS);
    const llave = s("path", { d: `M${xP},508 v-14 H${xS} v14`, fill: "none", stroke: C.tinta, "stroke-width": 4 }, papel);
    const tSP = txt(papel, "tS − tP", { x: (xP + xS) / 2, y: 476, size: 26, weight: 700, color: C.tinta, font: "Fraunces" });
    gsap.set(tSP, { opacity: 0 });
    N.draw(tl, llave, 29.0, 0.4);
    tl.to(tSP, { opacity: 1, duration: 0.3 }, 29.2);
    // fuentes de ruido: el mar, el viento, la ciudad
    const fuentes = s("g", {}, D);
    const mk = (x, y) => { const o = s("g", { transform: `translate(${x},${y})` }, fuentes); return s("g", {}, o); };
    const mar = mk(380, 250);
    for (let i = 0; i < 3; i++) s("path", { d: `M-110,${i * 30} q27,-24 55,0 t55,0 t55,0 t55,0`, fill: "none", stroke: C.ruido, "stroke-width": 12, "stroke-linecap": "round" }, mar);
    const viento = mk(960, 230);
    [[-70, -30, 120], [-100, 6, 160], [-60, 42, 110]].forEach(([x, y, w]) => s("path", { d: `M${x},${y} h${w} a20,20 0 1 0 -20,-20`, fill: "none", stroke: C.blanco, "stroke-width": 12, "stroke-linecap": "round" }, viento));
    const ciudad = mk(1490, 330);
    [[-120, 120, 50, C.morado], [-60, 190, 60, C.sismo], [10, 150, 50, C.ruido], [70, 100, 50, C.sol]].forEach(([x, hh, w, c]) => {
      s("rect", { x, y: -hh, width: w, height: hh, fill: c }, ciudad);
      for (let j = 0; j < Math.floor(hh / 34); j++) s("rect", { x: x + 12, y: -hh + 12 + j * 34, width: w - 24, height: 14, fill: C.sol2 }, ciudad);
    });
    N.pop(tl, [mar, viento, ciudad], 25.4, { stagger: 0.5 });
    tl.to(mar, { x: 30, duration: 0.8, yoyo: true, repeat: 5, ease: "sine.inOut" }, 26);
    tl.to(viento, { x: 40, duration: 0.6, yoyo: true, repeat: 7, ease: "sine.inOut" }, 26.4);
    tl.to(ciudad, { y: -8, duration: 0.25, yoyo: true, repeat: 15, ease: "sine.inOut" }, 26.8);
    [[380, 330], [960, 300], [1490, 340]].forEach(([x, y], i) => {
      for (let k = 0; k < 3; k++) {
        const v = s("path", { d: `M${x - 40},${y + 20 + k * 22} q20,-12 40,0 t40,0`, fill: "none", stroke: C.tinta, "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }, D);
        tl.fromTo(v, { opacity: 0, y: 0 }, { opacity: 0.6, y: 50, duration: 0.9, ease: "power1.in", repeat: 3, immediateRender: false }, 25.8 + i * 0.4 + k * 0.25);
        tl.to(v, { opacity: 0, duration: 0.2 }, 29.6);
      }
    });

    /* ============ E · la pregunta ============ */
    tl.to(fuentes, { y: -60, opacity: 0, duration: 0.6, ease: "power2.in" }, 29.8);
    tl.to(papel, { y: 120, scale: 0.82, svgOrigin: "960 620", duration: 1, ease: "expo.inOut" }, 29.9);
    tl.to([pluma, llave, tSP], { opacity: 0, duration: 0.3 }, 30.0);
    const azul = s("path", { d: caminoOnda(ys.slice(0, Math.round(900 * iP)), 220, 220 + 1480 * iP, 620, 150), fill: "none", stroke: C.ruido, "stroke-width": 5, opacity: 0 }, papel);
    const rojo = s("path", { d: caminoOnda(ys.slice(Math.round(900 * iP) - 1), 220 + 1480 * iP, 1700, 620, 150), fill: "none", stroke: C.sismo, "stroke-width": 5, opacity: 0 }, papel);
    tl.to([azul, rojo], { opacity: 1, duration: 0.6, stagger: 0.25 }, 30.4);
    const titulo = N.t(root, '¿<span style="color:#E4572E">Sismo</span> o <span style="color:#2E86AB">ruido</span>?', { x: 0, y: 150, w: 1920, align: "center", size: 150 });
    gsap.set(titulo, { autoAlpha: 0 });
    N.write(tl, titulo, 30.3, 0.8);
  },
});
