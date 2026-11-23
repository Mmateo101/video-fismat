/* Escena 4 · La idea: Fourier es un prisma. Por qué es innovador. */
N.add({
  id: "idea",
  entrada: "zoom",
  build(root, tl, T) {
    const { C, s, svg, txt, particulas } = K;
    const F = svg(root, { fondo: C.cielo });
    particulas(F, tl, T, { n: 24, colores: [C.blanco, C.sol2], seed: 41, opacidad: 0.4 });

    N.cameo(root, tl, { id: "C", quien: "Sofía", linea: "«Nuestra idea fue usar las matemáticas de Fourier…»", x: 110, y: 300, w: 720, h: 405, t0: 0.6, t1: 7.4, color: C.morado });

    // escenario del prisma (grupo externo fijo para poder moverlo entero)
    const pOut = s("g", { transform: "translate(1380,520)" }, F);
    const esc = s("g", {}, pOut);
    const colores = [C.sismo, C.sol, C.verde, C.ruido, C.morado];
    // luz blanca que entra
    const haz = s("path", { d: "M-560,40 L-90,0", stroke: C.blanco, "stroke-width": 22, "stroke-linecap": "round", fill: "none" }, esc);
    // abanico de colores que sale
    const abanico = colores.map((c, i) => s("path", { d: `M70,-10 L520,${-150 + i * 70} L520,${-110 + i * 70} L70,10 Z`, fill: c }, esc));
    const prisma = s("path", { d: "M0,-190 L170,110 L-170,110 Z", fill: C.blanco, stroke: C.tinta, "stroke-width": 10, "stroke-linejoin": "round", opacity: 0.95 }, esc);
    tl.fromTo(prisma, { scale: 0, rotation: -120, svgOrigin: "0 0" }, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.6)" }, 0.6);
    N.draw(tl, haz, 1.5, 0.7, "power2.in");
    tl.fromTo(abanico, { scaleX: 0, svgOrigin: "70 0" }, { scaleX: 1, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 2.2);
    tl.to(esc, { rotation: 3, svgOrigin: "0 0", duration: 2.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 2.5);

    // reacomodo: el prisma va al centro; entra una señal y salen ondas simples
    tl.to(pOut, { x: "-=420", duration: 1.1, ease: "expo.inOut" }, 7.2);
    tl.to(abanico, { scaleX: 0, svgOrigin: "70 0", duration: 0.5, ease: "power2.in", stagger: 0.04 }, 7.3);
    tl.to(haz, { opacity: 0, duration: 0.3 }, 7.3);
    // señal compleja = suma de cuatro senoides
    const comp = [[1, 0.9, 0], [2.3, 0.55, 1], [4.1, 0.35, 2], [6.7, 0.25, 0.5]];
    let d = "";
    for (let i = 0; i <= 200; i++) { const x = -720 + i * 3.1, u = i / 200; let y = 0; comp.forEach(([f, a, p]) => (y += a * Math.sin(2 * Math.PI * f * u * 3 + p))); d += (i ? "L" : "M") + x.toFixed(1) + "," + (y * 40).toFixed(1); }
    const senal = s("path", { d, fill: "none", stroke: C.tinta, "stroke-width": 8, "stroke-linejoin": "round" }, esc);
    N.draw(tl, senal, 8.0, 1.2, "power1.inOut");
    const simples = comp.map(([f, a, p], k) => {
      let dd = "";
      for (let i = 0; i <= 160; i++) { const x = 150 + i * 3.4, u = i / 160; dd += (i ? "L" : "M") + x.toFixed(1) + "," + (-195 + k * 130 + 46 * Math.sin(2 * Math.PI * f * u * 2.2 + p)).toFixed(1); }
      return s("path", { d: dd, fill: "none", stroke: colores[k], "stroke-width": 10, "stroke-linecap": "round" }, esc);
    });
    simples.forEach((p, k) => N.draw(tl, p, 9.3 + k * 0.35, 0.9, "power2.out"));
    // barras: cuánto pesa cada onda (el espectro)
    const bOut = s("g", { transform: "translate(1700,860)" }, F);
    const barras = comp.map(([f, a], k) => s("rect", { x: k * 52, y: -a * 220, width: 38, height: a * 220, rx: 8, fill: colores[k] }, bOut));
    tl.fromTo(barras, { scaleY: 0, svgOrigin: "0 0" }, { scaleY: 1, duration: 0.6, ease: "back.out(2)", stagger: 0.12 }, 11.0);
    tl.to(esc, { scale: 1.06, svgOrigin: "0 0", duration: 3, ease: "sine.inOut" }, 10);

    // innovación: tres íconos que se acomodan al entrar
    tl.to([esc, bOut], { autoAlpha: 0, y: "-=80", scale: 0.8, duration: 0.6, ease: "power2.in" }, 14.2);
    const iconos = [];
    const mk = (fn, etiqueta, col) => {
      const out = s("g", { transform: "translate(960,470)" }, F);
      const g = s("g", {}, out);
      s("circle", { r: 170, fill: col }, g);
      fn(g);
      const e = N.t(root, etiqueta, { x: 760, y: 680, w: 400, align: "center", size: 46, color: C.tinta });
      iconos.push({ out, g, e });
    };
    mk((g) => { // sin IA: chip tachado
      s("rect", { x: -70, y: -70, width: 140, height: 140, rx: 20, fill: C.blanco }, g);
      for (let i = -1; i <= 1; i++) { s("rect", { x: i * 40 - 8, y: -100, width: 16, height: 30, rx: 4, fill: C.blanco }, g); s("rect", { x: i * 40 - 8, y: 70, width: 16, height: 30, rx: 4, fill: C.blanco }, g); }
      txt(g, "IA", { size: 70, color: C.tinta, y: 4 });
      s("line", { x1: -110, y1: -110, x2: 110, y2: 110, stroke: C.tinta, "stroke-width": 22, "stroke-linecap": "round" }, g);
    }, "sin IA", C.sismo2);
    mk((g) => { // casi gratis: moneda
      s("circle", { r: 95, fill: C.sol2, stroke: C.blanco, "stroke-width": 14 }, g);
      txt(g, "$0", { size: 86, color: C.tinta, y: 6 });
    }, "casi gratis", C.sol);
    mk((g) => { // navegador
      s("rect", { x: -110, y: -80, width: 220, height: 160, rx: 18, fill: C.blanco }, g);
      s("rect", { x: -110, y: -80, width: 220, height: 36, rx: 18, fill: C.tinta }, g);
      [-86, -60, -34].forEach((x) => s("circle", { cx: x, cy: -62, r: 7, fill: C.sol }, g));
      s("path", { d: "M-80,40 l30,-36 22,24 28,-50 26,40 22,-14 32,36", fill: "none", stroke: C.sismo, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    }, "en tu navegador", C.ruido2);
    const pos = [[0], [-260, 260], [-520, 0, 520]];
    const ent = [15.0, 17.6, 20.2];
    iconos.forEach((ic, i) => {
      gsap.set(ic.e, { autoAlpha: 0 });
      tl.fromTo(ic.g, { scale: 0, rotation: -40, svgOrigin: "0 0" }, { scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.8)" }, ent[i]);
      tl.set(ic.out, { x: 960 + pos[i][i] }, 0);
      tl.set(ic.e, { x: pos[i][i] }, 0);
      N.show(tl, ic.e, ent[i] + 0.25);
      [1, 2].forEach((k) => { if (k > i) { tl.to(ic.out, { x: 960 + pos[k][i], duration: 0.9, ease: "expo.inOut" }, ent[k] - 0.15); tl.to(ic.e, { x: pos[k][i], duration: 0.9, ease: "expo.inOut" }, ent[k] - 0.15); } });
      tl.to(ic.g, { y: -14, duration: 1.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, ent[i] + 0.8);
    });
    gsap.set(iconos.map((i) => i.g), { scale: 0, svgOrigin: "0 0" });
  },
});
