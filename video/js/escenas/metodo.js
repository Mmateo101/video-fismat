/* Escena 6 · Metodología: serie de Fourier → transformada por ventanas → huella del ruido → resta. */
N.add({
  id: "metodo",
  entrada: "barrido", barridoColores: ["#7B5EA7", "#F6AE2D", "#E4572E"],
  async prep() { this.q = await (await fetch("data/ci14607652.json")).json(); },
  build(root, tl, T, def) {
    const { C, s, svg, txt, particulas, caminoOnda } = K;
    const q = def.q;
    const F = svg(root, { fondo: C.crema });
    particulas(F, tl, T, { n: 22, colores: [C.sol, C.ruido2, C.sismo2], seed: 61, opacidad: 0.25 });

    /* ---------- 1 · serie de Fourier en los datos del expediente ---------- */
    N.cameo(root, tl, { id: "D", quien: "Mateo", linea: "«Primero ajustamos una serie de Fourier…»", x: 1100, y: 240, w: 720, h: 405, t0: 0.6, t1: 6.6, color: C.sismo });
    const x = DATOS.x, dt = 0.4, Nn = x.length, T0 = Nn * dt;
    const a0 = x.reduce((a, b) => a + b, 0) / Nn;
    const varz = x.reduce((a, v) => a + (v - a0) ** 2, 0) / Nn;
    const pn = [];
    for (let n = 1; n <= 10; n++) { let an = 0, bn = 0; x.forEach((v, i) => { an += (2 / Nn) * v * Math.cos((2 * Math.PI * n * i * dt) / T0); bn += (2 / Nn) * v * Math.sin((2 * Math.PI * n * i * dt) / T0); }); pn.push({ an, bn, p: (an * an + bn * bn) / (2 * varz) }); }
    const gOut = s("g", { transform: "translate(140,250)" }, F);
    const graf = s("g", {}, gOut);
    const W1 = 860, H1 = 420, px = (i) => (i / (Nn - 1)) * W1, py = (v) => H1 / 2 - v * 480;
    s("line", { x1: 0, x2: W1, y1: H1 / 2, y2: H1 / 2, stroke: C.gris2, "stroke-width": 4 }, graf);
    const puntos = x.map((v, i) => s("circle", { cx: px(i), cy: py(v), r: 14, fill: C.sismo }, graf));
    tl.fromTo(puntos, { attr: { r: 0 } }, { attr: { r: 14 }, duration: 0.3, stagger: 0.06, ease: "back.out(3)" }, 0.8);
    // la curva del segundo armónico
    const h2 = pn[1];
    let d = "";
    for (let k = 0; k <= 200; k++) { const t = (k / 200) * (Nn - 1) * dt; const v = a0 + h2.an * Math.cos((2 * Math.PI * 2 * t) / T0) + h2.bn * Math.sin((2 * Math.PI * 2 * t) / T0); d += (k ? "L" : "M") + ((t / ((Nn - 1) * dt)) * W1).toFixed(1) + "," + py(v).toFixed(1); }
    const curva = s("path", { d, fill: "none", stroke: C.tinta, "stroke-width": 7, "stroke-linecap": "round" }, graf);
    // reacomodo: sale el cameo y la gráfica se hace grande; entran las barras de armónicos
    tl.to(gOut, { x: "-=40", y: "-=40", scale: 0.92, duration: 1, ease: "expo.inOut" }, 6.6);
    N.draw(tl, curva, 7.2, 1.6, "power2.inOut");
    const bOut = s("g", { transform: "translate(1150,690)" }, F);
    const barras = pn.map((h, i) => s("rect", { x: i * 62, y: -Math.max(4, h.p * 380), width: 46, height: Math.max(4, h.p * 380), rx: 8, fill: i === 1 ? C.sismo : C.gris2 }, bOut));
    const nums = pn.map((h, i) => txt(bOut, i + 1, { x: i * 62 + 23, y: 34, size: 26, weight: 700, color: C.gris }));
    tl.fromTo(barras, { scaleY: 0, svgOrigin: "0 0" }, { scaleY: 1, duration: 0.6, ease: "back.out(1.8)", stagger: 0.08 }, 7.4);
    N.pop(tl, nums, 7.4, { stagger: 0.05 });
    const pct = N.t(root, "94.8%", { x: 1150 + 62 - 60, y: 690 - pn[1].p * 380 - 100, w: 220, size: 70, font: "num", color: C.sismo });
    gsap.set(pct, { autoAlpha: 0 }); N.pop(tl, pct, 8.4);
    const T4 = N.t(root, "un armónico · periodo de 4 s", { x: 1150, y: 760, size: 32, color: C.tinta });
    gsap.set(T4, { autoAlpha: 0 }); N.show(tl, T4, 9.4);
    const ec = N.t(root, '<i>f</i>(<i>t</i>) = <i>a</i><sub>0</sub> + Σ [ <i>a<sub>n</sub></i> cos(<i>nω</i><sub>0</sub><i>t</i>) + <i>b<sub>n</sub></i> sin(<i>nω</i><sub>0</sub><i>t</i>) ]', { x: 0, y: 70, w: 1920, align: "center", size: 54, font: "num", color: C.tinta });
    gsap.set(ec, { autoAlpha: 0 }); N.show(tl, ec, 6.9);

    /* ---------- 2 · registros largos: transformada de Fourier por ventanas ---------- */
    tl.to([gOut, bOut], { autoAlpha: 0, scale: 0.5, y: "-=120", duration: 0.7, ease: "power2.in", stagger: 0.05 }, 13.3);
    tl.to([pct, T4, ec], { autoAlpha: 0, y: -40, duration: 0.5 }, 13.2);
    const X0 = 160, X1 = 1500, YT = 300, AT = 130;
    const crudo = q.crudo, mx = Math.max(...crudo.map(Math.abs));
    const nrm = (a) => a.map((v) => Math.max(-1, Math.min(1, v / mx)));
    const pCrudo = s("path", { d: caminoOnda(nrm(crudo), X0, X1, YT, AT), fill: "none", stroke: C.tinta, "stroke-width": 2.4 }, F);
    N.draw(tl, pCrudo, 13.9, 1.8, "power1.inOut");
    const xT = (t) => X0 + ((t - q.t0) / (q.dt_web * (crudo.length - 1))) * (X1 - X0);
    const lineaP = s("line", { x1: xT(0), x2: xT(0), y1: YT - 160, y2: YT + 160, stroke: C.sismo, "stroke-width": 4, "stroke-dasharray": "8 8", opacity: 0 }, F);
    const etP = N.t(root, "onda P", { x: xT(0) - 60, y: 120, size: 30, color: C.sismo }); gsap.set(etP, { autoAlpha: 0 });
    tl.to(lineaP, { opacity: 1, duration: 0.4 }, 15.4); N.show(tl, etP, 15.5);
    // espectrograma como imagen (antes y después), se revela columna por columna
    const YS0 = 520, YS1 = 900;
    const todos = q.sg_antes.flat().sort((a, b) => a - b), vmin = todos[Math.floor(todos.length * 0.03)], vmax = todos[todos.length - 1];
    const img = (M) => {
      const nf = M.length, nt = M[0].length, c = document.createElement("canvas"); c.width = nt; c.height = nf;
      const cx = c.getContext("2d"), im = cx.createImageData(nt, nf);
      const P = [[29, 36, 64], [58, 46, 110], [123, 94, 167], [228, 87, 46], [246, 174, 45], [255, 241, 200]];
      const col = (v) => { const p = Math.max(0, Math.min(1, v)) * 5, i = Math.min(4, Math.floor(p)), r = p - i; return P[i].map((a, k) => Math.round(a + (P[i + 1][k] - a) * r)); };
      for (let i = 0; i < nf; i++) for (let j = 0; j < nt; j++) { const [r, g, b] = col((M[i][j] - vmin) / (vmax - vmin)), k = ((nf - 1 - i) * nt + j) * 4; im.data[k] = r; im.data[k + 1] = g; im.data[k + 2] = b; im.data[k + 3] = 255; }
      cx.putImageData(im, 0, 0); return c.toDataURL();
    };
    const sgT0 = q.sg_t[0], sgT1 = q.sg_t[q.sg_t.length - 1];
    const xs0 = xT(sgT0), xs1 = xT(sgT1);
    const defs = s("defs", {}, F);
    const clip = s("clipPath", { id: "clipSg" }, defs);
    const clipR = s("rect", { x: xs0, y: YS0, width: 0, height: YS1 - YS0 }, clip);
    const clip2 = s("clipPath", { id: "clipSg2" }, defs);
    const clipR2 = s("rect", { x: xs1, y: YS0, width: 0, height: YS1 - YS0 }, clip2);
    const imA = s("image", { href: img(q.sg_antes), x: xs0, y: YS0, width: xs1 - xs0, height: YS1 - YS0, preserveAspectRatio: "none", "clip-path": "url(#clipSg)" }, F);
    const imD = s("image", { href: img(q.sg_despues), x: xs0, y: YS0, width: xs1 - xs0, height: YS1 - YS0, preserveAspectRatio: "none", "clip-path": "url(#clipSg2)" }, F);
    imA.style.imageRendering = imD.style.imageRendering = "auto";
    const rapido = txt(F, "rápido", { x: X0 - 20, y: YS0 + 16, size: 24, anchor: "end", weight: 700, color: C.gris });
    const lento = txt(F, "lento", { x: X0 - 20, y: YS1 - 14, size: 24, anchor: "end", weight: 700, color: C.gris });
    N.show(tl, [rapido, lento], 20.0);
    const ventana = s("rect", { x: xs0, y: YT - 150, width: ((25.6) / (q.dt_web * (crudo.length - 1))) * (X1 - X0), height: 300, rx: 10, fill: C.sol, opacity: 0, stroke: C.sol, "stroke-width": 4 }, F);
    const conector = s("line", { x1: 0, y1: YT + 150, x2: 0, y2: YS0, stroke: C.sol, "stroke-width": 4, "stroke-dasharray": "6 6", opacity: 0 }, F);
    tl.to(ventana, { opacity: 0.35, duration: 0.3 }, 20.0);
    tl.to(conector, { opacity: 1, duration: 0.3 }, 20.0);
    const barrer = { _redraw(r) { const xx = xs0 + (xs1 - xs0) * r, w = +ventana.getAttribute("width"); ventana.setAttribute("x", xx - w / 2); conector.setAttribute("x1", xx); conector.setAttribute("x2", xx); clipR.setAttribute("width", xx - xs0); } };
    barrer._redraw(0);
    tl.to(barrer, { redraw: 1, duration: 5.4, ease: "power1.inOut" }, 20.2);
    tl.to([ventana, conector], { opacity: 0, duration: 0.4 }, 25.8);

    /* ---------- 3 · antes de la P solo hay ruido: su huella ---------- */
    const xr1 = xT(-40);
    const zona = s("rect", { x: X0, y: YT - 150, width: xr1 - X0, height: 300, rx: 12, fill: C.ruido, opacity: 0 }, F);
    const zona2 = s("rect", { x: xs0, y: YS0, width: xr1 - xs0, height: YS1 - YS0, fill: "none", stroke: C.ruido2, "stroke-width": 8, opacity: 0 }, F);
    tl.to(zona, { opacity: 0.22, duration: 0.5 }, 26.9);
    tl.to(zona2, { opacity: 1, duration: 0.5 }, 27.1);
    const soloR = N.t(root, "solo ruido", { x: (X0 + xr1) / 2 - 110, y: YT - 215, size: 34, color: C.blanco }); soloR.className = "pill"; soloR.style.background = C.ruido;
    gsap.set(soloR, { autoAlpha: 0 }); N.pop(tl, soloR, 27.3);
    // huella: promedio por frecuencia de las columnas de ruido
    const nf = q.sg_antes.length, cols = q.sg_t.map((t, j) => j).filter((j) => q.sg_t[j] < -40);
    const huella = q.sg_antes.map((fila) => cols.reduce((a, j) => a + fila[j], 0) / cols.length);
    const hOut = s("g", { transform: `translate(1580,${YS0})` }, F);
    const hG = s("g", {}, hOut);
    const fh = (YS1 - YS0) / nf;
    const barrasH = huella.map((v, i) => s("rect", { x: 0, y: (nf - 1 - i) * fh + 1, width: Math.max(4, ((v - Math.min(...huella)) / (Math.max(...huella) - Math.min(...huella) + 1e-9)) * 200 + 20), height: fh - 2, rx: 2, fill: C.ruido }, hG));
    tl.fromTo(barrasH, { scaleX: 0, svgOrigin: "0 0" }, { scaleX: 1, duration: 0.5, stagger: 0.015, ease: "power2.out" }, 28.6);
    const etH = N.t(root, "huella del ruido", { x: 1560, y: YS0 - 70, size: 32, color: C.ruido }); gsap.set(etH, { autoAlpha: 0 });
    N.show(tl, etH, 29.2);

    /* ---------- 4 · restar el ruido en cada frecuencia ---------- */
    tl.to(hG, { x: -(1580 - xs0) - 40, duration: 4.2, ease: "power1.inOut" }, 33.8);
    tl.to(barrasH, { opacity: 0.55, duration: 0.3 }, 33.8);
    const restar = { _redraw(r) { const xx = 1580 - 40 + (xs0 - 1580) * r; clipR2.setAttribute("x", Math.max(xs0, Math.min(xs1, xx + 40))); clipR2.setAttribute("width", Math.max(0, xs1 - Math.max(xs0, Math.min(xs1, xx + 40)))); } };
    restar._redraw(0);
    tl.to(restar, { redraw: 1, duration: 4.2, ease: "power1.inOut" }, 33.8);
    tl.to([hG, etH, zona2], { autoAlpha: 0, duration: 0.4 }, 38.0);
    // la señal se separa: sismo en rojo, ruido en azul (amplificado)
    const pSismo = s("path", { d: caminoOnda(nrm(q.sismo), X0, X1, YT, AT), fill: "none", stroke: C.sismo, "stroke-width": 2.6, opacity: 0 }, F);
    const mr = Math.max(...q.ruido.map(Math.abs));
    const pRuido = s("path", { d: caminoOnda(q.ruido.map((v) => v / mr), X0, X1, YT, 60), fill: "none", stroke: C.ruido, "stroke-width": 2.6, opacity: 0 }, F);
    tl.to(pCrudo, { opacity: 0.15, duration: 0.5 }, 38.2);
    tl.to(pSismo, { opacity: 1, duration: 0.5 }, 38.3);
    tl.to(zona, { opacity: 0, duration: 0.4 }, 38.2);
    tl.to(soloR, { autoAlpha: 0, duration: 0.3 }, 38.2);
    tl.to(pRuido, { opacity: 1, duration: 0.5 }, 38.6);
    tl.fromTo(pRuido, { y: 0 }, { y: 210, duration: 0.9, ease: "expo.inOut" }, 38.6);
    tl.to([imA, imD, rapido, lento], { autoAlpha: 0, y: 120, duration: 0.6, ease: "power2.in" }, 38.4);
    const eS = N.t(root, "sismo", { x: X1 + 30, y: YT - 30, size: 40, color: C.sismo });
    const eR = N.t(root, "ruido", { x: X1 + 30, y: YT + 180, size: 40, color: C.ruido });
    gsap.set([eS, eR], { autoAlpha: 0 }); N.show(tl, eS, 38.8, { x: -30 }); N.show(tl, eR, 39.2, { x: -30 });

    /* ---------- 5 · validación ---------- */
    const v1 = N.t(root, "✓ sismos sintéticos", { x: 420, y: 800, size: 40, color: C.blanco }); v1.className = "pill"; v1.style.background = C.verde;
    const v2 = N.t(root, "✓ ruido real", { x: 1040, y: 800, size: 40, color: C.blanco }); v2.className = "pill"; v2.style.background = C.verde;
    gsap.set([v1, v2], { autoAlpha: 0 });
    N.pop(tl, v1, 41.4); N.pop(tl, v2, 42.6);
  },
});
