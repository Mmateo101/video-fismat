/* Escena 7 · Resultados: expediente (×6, ×35, 18 km), el mar, 20 sismos reales, ruido real, bandas. */
N.add({
  id: "resultados",
  entrada: "zoom",
  async prep() { this.q = await (await fetch("data/us2000ar20.json")).json(); },
  build(root, tl, T, def) {
    const { C, s, svg, txt, particulas, sol } = K;
    const F = svg(root, { fondo: C.cielo });
    particulas(F, tl, T, { n: 24, colores: [C.blanco, C.sol2], seed: 71, opacidad: 0.4 });
    const Ax = 0.365, Ar = 0.062;

    /* ---------- 1 · expediente: alto, energía, longitud de onda ---------- */
    const oOut = s("g", { transform: "translate(160,420)" }, F);
    const ondas = s("g", {}, oOut);
    const sen = (A, W, per, fase = 0) => { let d = ""; for (let i = 0; i <= 240; i++) { const x = (i / 240) * W; d += (i ? "L" : "M") + x.toFixed(1) + "," + (-A * Math.sin((2 * Math.PI * x) / per + fase)).toFixed(1); } return d; };
    s("line", { x1: 0, x2: 1000, y1: 0, y2: 0, stroke: C.blanco, "stroke-width": 4 }, ondas);
    const oS = s("path", { d: sen(Ax * 700, 1000, 330), fill: "none", stroke: C.sismo, "stroke-width": 12, "stroke-linecap": "round" }, ondas);
    const oR = s("path", { d: sen(Ar * 700, 1000, 330, 0.6), fill: "none", stroke: C.ruido, "stroke-width": 12, "stroke-linecap": "round" }, ondas);
    N.draw(tl, oS, 0.8, 1.4, "power2.out"); N.draw(tl, oR, 1.3, 1.4, "power2.out");
    const eS = N.t(root, "sensor", { x: 1180, y: 300, size: 40, color: C.sismo });
    const eR = N.t(root, "ambiental", { x: 1180, y: 450, size: 40, color: C.ruido });
    gsap.set([eS, eR], { autoAlpha: 0 }); N.show(tl, eS, 1.6, { x: -30 }); N.show(tl, eR, 2.1, { x: -30 });
    const x6 = N.t(root, "×6", { x: 1500, y: 320, size: 160, font: "num", color: C.tinta });
    gsap.set(x6, { autoAlpha: 0 }); N.pop(tl, x6, 3.6);
    tl.to(x6, { rotation: -6, duration: 1.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 4.2);
    // energía = área de un cuadrado de lado A
    tl.to([ondas, eS, eR, x6], { autoAlpha: 0, y: "-=60", duration: 0.5, ease: "power2.in" }, 6.8);
    const qOut = s("g", { transform: "translate(700,820)" }, F);
    const k = 1400;
    const cS = s("rect", { x: 0, y: -Ax * k, width: Ax * k, height: Ax * k, rx: 12, fill: C.sismo }, qOut);
    const cR = s("rect", { x: Ax * k + 40, y: -Ar * k, width: Ar * k, height: Ar * k, rx: 6, fill: C.ruido }, qOut);
    tl.fromTo(cS, { scale: 0, svgOrigin: "0 0" }, { scale: 1, duration: 0.8, ease: "back.out(1.5)" }, 7.2);
    tl.fromTo(cR, { scale: 0, svgOrigin: `${Ax * k + 40} 0` }, { scale: 1, duration: 0.6, ease: "back.out(2)" }, 7.6);
    const x35 = N.t(root, "0×", { x: 1340, y: 420, w: 400, size: 170, font: "num", color: C.tinta });
    const ex35 = N.t(root, "más energía", { x: 1350, y: 600, size: 44, color: C.tinta });
    gsap.set([x35, ex35], { autoAlpha: 0 }); tl.set([x35, ex35], { autoAlpha: 1 }, 8.0);
    N.count(tl, x35, 0, 35, 8.0, 1.6, 0, "×");
    // longitud de onda de 18 km sobre montañas
    tl.to([cS, cR, x35, ex35], { autoAlpha: 0, scale: 0.7, duration: 0.5, ease: "power2.in" }, 10.6);
    const lOut = s("g", { transform: "translate(0,560)" }, F);
    const mont = s("path", { d: "M0,300 L220,90 L380,220 L560,40 L760,240 L920,120 L1120,280 L1300,60 L1500,230 L1700,110 L1920,260 L1920,520 L0,520Z", fill: C.verde }, lOut);
    const nieve = s("path", { d: "M560,40 L620,100 L540,100 Z M1300,60 L1360,120 L1260,118 Z", fill: C.blanco }, lOut);
    const larga = s("path", { d: "M-100,-80 " + Array.from({ length: 8 }, (_, i) => `q${170},-140 340,0 t340,0`).slice(0, 4).join(" "), fill: "none", stroke: C.sismo, "stroke-width": 14, "stroke-linecap": "round" }, lOut);
    tl.fromTo([mont, nieve], { y: 520 }, { y: 0, duration: 0.9, ease: "expo.out" }, 10.9);
    N.draw(tl, larga, 11.1, 1.2, "power2.out");
    const reg = s("path", { d: "M240,-210 v-24 h680 v24", fill: "none", stroke: C.tinta, "stroke-width": 8, "stroke-linecap": "round" }, lOut);
    N.draw(tl, reg, 11.9, 0.6);
    const km = N.t(root, "18 km", { x: 0, y: 220, w: 1160, align: "center", size: 110, font: "num", color: C.tinta });
    gsap.set(km, { autoAlpha: 0 }); N.pop(tl, km, 12.2);

    N.eq(root, tl, '<i>A<sub>x</sub></i>/<i>A<sub>r</sub></i> = 0.365/0.062 = 5.9', { y: 120, size: 46, t0: 3.8, t1: 6.6 });
    N.eq(root, tl, '<i>R</i> = (<i>A<sub>x</sub></i>/<i>A<sub>r</sub></i>)² = 35 ± 5', { y: 120, size: 50, t0: 8.2, t1: 10.5 });
    N.eq(root, tl, 'λ = <i>vT</i> = (4500 m/s)(4.0 s) = 18 000 m', { y: 120, size: 46, t0: 12.4, t1: 13.6 });
    /* ---------- 2 · cuatro segundos también es el mar ---------- */
    tl.to([mont, nieve, reg, km], { autoAlpha: 0, y: "+=80", duration: 0.6, ease: "power2.in" }, 13.6);
    tl.to(larga, { stroke: C.ruido, duration: 0.8 }, 14.0);
    const mar = s("rect", { x: -200, y: -80, width: 2400, height: 700, fill: C.mar }, lOut);
    lOut.insertBefore(mar, larga);
    tl.fromTo(mar, { y: 700 }, { y: 0, duration: 1.0, ease: "expo.inOut" }, 14.0);
    tl.to(larga, { x: -340, duration: 2.4, ease: "none", repeat: 2 }, 14.4);
    const barco = s("g", { transform: "translate(960,-112)" }, lOut);
    const bi = s("g", {}, barco);
    s("path", { d: "M-70,0 L70,0 L46,34 L-46,34Z", fill: C.sismo }, bi);
    s("path", { d: "M0,-4 L0,-110 L60,-20Z", fill: C.blanco }, bi);
    s("line", { x1: 0, y1: 0, x2: 0, y2: -116, stroke: C.tinta, "stroke-width": 6 }, bi);
    N.pop(tl, bi, 15.0);
    tl.to(bi, { y: 30, rotation: 8, duration: 1.2, yoyo: true, repeat: 4, ease: "sine.inOut" }, 15.2);
    const igual = N.t(root, '<span style="color:#E4572E">sismo</span> 4 s <span style="opacity:.5">=</span> 4 s <span style="color:#2E86AB">mar</span>', { x: 0, y: 160, w: 1920, align: "center", size: 100 });
    gsap.set(igual, { autoAlpha: 0 }); N.write(tl, igual, 15.4, 0.8);

    /* ---------- 3 · veinte sismos reales: once veces más clara ---------- */
    tl.to([lOut, igual], { autoAlpha: 0, duration: 0.6 }, 20.8);
    const S = DATOS.sismos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
    const pOut = s("g", { transform: "translate(260,140)" }, F);
    const plot = s("g", {}, pOut);
    const xD = (v) => ((v - 0) / 90) * 1000, dyR = 38;
    s("rect", { x: -20, y: -30, width: 1060, height: S.length * dyR + 40, rx: 26, fill: C.crema }, plot);
    tl.fromTo(plot, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, 21.2);
    S.forEach((q, i) => {
      const y = i * dyR;
      const ln = s("line", { x1: xD(q.snr_antes), x2: xD(q.snr_antes), y1: y, y2: y, stroke: C.gris2, "stroke-width": 8, "stroke-linecap": "round" }, plot);
      const dA = s("circle", { cx: xD(q.snr_antes), cy: y, r: 11, fill: C.ruido }, plot);
      const dB = s("circle", { cx: xD(q.snr_antes), cy: y, r: 11, fill: C.sismo }, plot);
      tl.fromTo([dA, dB], { attr: { r: 0 } }, { attr: { r: 11 }, duration: 0.25, ease: "back.out(3)" }, 21.6 + i * 0.05);
      tl.to(dB, { attr: { cx: xD(q.snr_despues) }, duration: 1.0, ease: "expo.inOut" }, 23.2 + i * 0.06);
      tl.to(ln, { attr: { x2: xD(q.snr_despues) }, duration: 1.0, ease: "expo.inOut" }, 23.2 + i * 0.06);
    });
    const ejeX = s("g", {}, plot);
    [0, 20, 40, 60, 80].forEach((v) => txt(ejeX, `${v}`, { x: xD(v), y: S.length * dyR + 4, size: 22, weight: 700, color: C.gris }));
    txt(ejeX, "SNR (dB) →", { x: 1030, y: S.length * dyR + 4, size: 22, anchor: "end", weight: 700, color: C.gris });
    N.eq(root, tl, 'SNR = 10 log<sub>10</sub>(<i>P</i><sub>sismo</sub>/<i>P</i><sub>ruido</sub>) · +10.5 dB', { x: 1340, y: 660, w: 500, size: 32, t0: 25.4, t1: 28.8 });
    const leyA = N.t(root, "antes", { x: 300, y: 70, size: 34, color: C.ruido }), leyD = N.t(root, "después", { x: 470, y: 70, size: 34, color: C.sismo });
    gsap.set([leyA, leyD], { autoAlpha: 0 }); N.show(tl, [leyA, leyD], 21.8, { stagger: 0.3 });
    const x11 = N.t(root, "0×", { x: 1360, y: 330, w: 460, align: "center", size: 200, font: "num", color: C.sismo });
    const ex11 = N.t(root, "más clara", { x: 1360, y: 560, w: 460, align: "center", size: 50, color: C.tinta });
    gsap.set([x11, ex11], { autoAlpha: 0 }); tl.set([x11, ex11], { autoAlpha: 1 }, 24.6);
    N.count(tl, x11, 0, 11, 24.6, 1.8, 0, "×");

    /* ---------- 4 · con ruido tan fuerte como el sismo ---------- */
    tl.to([plot, leyA, leyD], { autoAlpha: 0, x: "-=200", duration: 0.7, ease: "expo.in" }, 28.8);
    tl.to([x11, ex11], { autoAlpha: 0, duration: 0.4 }, 28.8);
    const rob = DATOS.robustez, i0 = rob.niveles.indexOf(0);
    const anillo = (cx, val, col, et, at) => {
      const g = s("g", { transform: `translate(${cx},520)` }, F);
      s("circle", { r: 200, fill: "none", stroke: C.blanco, "stroke-width": 44, opacity: 0.6 }, g);
      const arco = s("circle", { r: 200, fill: "none", stroke: col, "stroke-width": 44, "stroke-linecap": "round", transform: "rotate(-90)", "stroke-dasharray": `0 ${2 * Math.PI * 200}` }, g);
      const n = N.t(root, "0%", { x: cx - 200, y: 460, w: 400, align: "center", size: 110, font: "num", color: C.tinta });
      const e = N.t(root, et, { x: cx - 200, y: 780, w: 400, align: "center", size: 40, color: C.tinta });
      gsap.set([g, n, e], { autoAlpha: 0 });
      tl.set([g, n, e], { autoAlpha: 1 }, at);
      tl.fromTo(g, { scale: 0.5, svgOrigin: `${cx} 520` }, { scale: 1, duration: 0.6, ease: "back.out(1.7)" }, at);
      const L = 2 * Math.PI * 200;
      tl.to(arco, { attr: { "stroke-dasharray": `${L * val} ${L}` }, duration: 1.4, ease: "power2.out" }, at + 0.2);
      N.count(tl, n, 0, Math.round(val * 100), at + 0.2, 1.4, 0, "%");
      return [g, n, e];
    };
    const g1 = anillo(620, rob.crudo[i0], C.ruido, "con ruido", 29.4);
    const g2 = anillo(1300, rob.separado[i0], C.sismo, "separado", 31.6);
    const parecido = N.t(root, "parecido con la onda real", { x: 0, y: 130, w: 1920, align: "center", size: 54, color: C.tinta });
    gsap.set(parecido, { autoAlpha: 0 }); N.show(tl, parecido, 29.8);

    N.eq(root, tl, 'ρ = corr(<i>ŝ</i>, <i>s</i>) · SNR de entrada = 0 dB', { y: 880, size: 38, t0: 30.4, t1: 37.0 });
    /* ---------- 5 · las bandas del ruido: la ciudad y el mar ---------- */
    tl.to([...g1, ...g2, parecido], { autoAlpha: 0, scale: 0.8, duration: 0.5, ease: "power2.in" }, 37.0);
    const q0 = def.q, keep = q0.esp_f.map((f, i) => i).filter((i) => q0.esp_f[i] >= 0.045);
    const q = { esp_f: keep.map((i) => q0.esp_f[i]), esp_ruido: keep.map((i) => q0.esp_ruido[i]) };
    const fx = (f) => 160 + ((Math.log10(f) - Math.log10(0.045)) / (Math.log10(8) - Math.log10(0.045))) * 1600;
    const R = q.esp_ruido, lr = R.map((v) => Math.log10(v + 1e-9)), lmin = Math.min(...lr), lmax = Math.max(...lr);
    const fy = (v) => 900 - ((Math.log10(v + 1e-9) - lmin) / (lmax - lmin)) * 520;
    let dR = `M${fx(q.esp_f[0])},900`;
    q.esp_f.forEach((f, i) => (dR += ` L${fx(f).toFixed(1)},${fy(R[i]).toFixed(1)}`));
    dR += ` L${fx(q.esp_f[q.esp_f.length - 1])},900 Z`;
    const bandaMar = s("rect", { x: fx(0.1), y: 300, width: fx(0.35) - fx(0.1), height: 600, fill: C.ruido, opacity: 0 }, F);
    const bandaCiudad = s("rect", { x: fx(1), y: 300, width: fx(8) - fx(1), height: 600, fill: C.morado, opacity: 0 }, F);
    const area = s("path", { d: dR, fill: C.ruido, opacity: 0.85 }, F);
    tl.fromTo(area, { scaleY: 0, svgOrigin: "960 900" }, { scaleY: 1, duration: 0.9, ease: "expo.out" }, 37.4);
    tl.to(bandaMar, { opacity: 0.18, duration: 0.4 }, 38.2);
    tl.to(bandaCiudad, { opacity: 0.18, duration: 0.4 }, 39.6);
    const icoMar = s("g", { transform: `translate(${(fx(0.1) + fx(0.35)) / 2},230)` }, F);
    for (let i = 0; i < 2; i++) s("path", { d: `M-80,${i * 30} q20,-20 40,0 t40,0 t40,0 t40,0`, fill: "none", stroke: C.ruido, "stroke-width": 11, "stroke-linecap": "round" }, icoMar);
    const icoC = s("g", { transform: `translate(${(fx(1) + fx(8)) / 2},260)` }, F);
    [[-90, 110, C.morado], [-30, 160, C.sismo], [30, 130, C.sol]].forEach(([x, hh, c]) => s("rect", { x, y: -hh, width: 50, height: hh, fill: c }, icoC));
    N.pop(tl, icoMar, 38.4); N.pop(tl, icoC, 39.8);
    const lento = txt(F, "lento", { x: 160, y: 950, size: 32, anchor: "start", weight: 700, color: C.tinta });
    const rapido = txt(F, "rápido", { x: 1760, y: 950, size: 32, anchor: "end", weight: 700, color: C.tinta });
    N.show(tl, [lento, rapido], 37.6);
    const tk = [0.1, 1].map((f) => txt(F, `${f} Hz`, { x: fx(f), y: 950, size: 28, weight: 700, color: C.tinta }));
    N.show(tl, tk, 37.8, { stagger: 0.1 });
    const seis = N.t(root, "~6 s", { x: (fx(0.1) + fx(0.35)) / 2 - 100, y: 110, w: 200, align: "center", size: 50, font: "num", color: C.ruido });
    gsap.set(seis, { autoAlpha: 0 }); N.pop(tl, seis, 41.0);
  },
});
