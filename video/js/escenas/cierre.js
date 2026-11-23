/* Escena 9 · Conclusiones e impacto: tres cameos que se reacomodan, la alerta que llega a todos, despedida. */
N.add({
  id: "cierre",
  entrada: "barrido", barridoColores: ["#2E86AB", "#F6AE2D", "#E4572E"],
  build(root, tl, T) {
    const { C, s, svg, txt, particulas, persona, sol } = K;
    const F = svg(root, { fondo: C.crema });
    particulas(F, tl, T, { n: 26, colores: [C.sol, C.sismo, C.ruido, C.morado], seed: 91, opacidad: 0.25 });

    /* ---------- conclusiones: un cameo por persona ---------- */
    const W = 496, Hh = 279, top = 260;
    const gente = [
      { id: "E1", quien: "Víctor", col: C.ruido, cx: 400, t0: 0.6, chip: "frecuencias distintas ✓", linea: "«Fourier sí separa el sismo del ruido…»" },
      { id: "E2", quien: "Sofía", col: C.morado, cx: 960, t0: 6.0, chip: "misma frecuencia → ver el tiempo", linea: "«Cuando comparten frecuencia…»" },
      { id: "E3", quien: "Mateo", col: C.sismo, cx: 1520, t0: 11.6, chip: "barata y abierta", linea: "«Una herramienta barata y abierta…»" },
    ];
    const offs = [[560, 280, 0], [null, 280, 0], [null, null, 0]];
    const escala = [1.5, 1.2, 1];
    const cajas = [];
    gente.forEach((p, i) => {
      const f = N.cameo(root, tl, { id: p.id, quien: p.quien, linea: p.linea, x: p.cx - W / 2, y: top, w: W, h: Hh, t0: p.t0, t1: 18.3, color: p.col, out: false, inn: false });
      gsap.set(f.box, { autoAlpha: 0 });
      tl.fromTo(f.box, { autoAlpha: 0, scale: escala[i] * 0.6, rotation: -6 }, { autoAlpha: 1, scale: escala[i], rotation: 0, duration: 0.7, ease: "back.out(1.8)", immediateRender: false }, p.t0 - 0.6);
      const chip = N.t(root, p.chip, { x: 0, y: 0, size: 30, color: C.blanco });
      chip.className = "pill"; chip.style.background = p.col;
      const cw = chip.offsetWidth || 400;
      gsap.set(chip, { left: p.cx - cw / 2, top: top + Hh + 60, autoAlpha: 0 });
      gsap.set([f.box, chip], { x: offs[i][i] });
      [1, 2].forEach((k) => {
        if (k > i) {
          tl.to(f.box, { x: offs[k][i], scale: escala[k], duration: 0.9, ease: "expo.inOut" }, gente[k].t0 - 0.7);
          tl.to(chip, { x: offs[k][i], duration: 0.9, ease: "expo.inOut" }, gente[k].t0 - 0.7);
        }
      });
      N.pop(tl, chip, p.t0 + 2.0);
      tl.to([f.box, chip], { autoAlpha: 0, y: "-=60", scale: 0.6, duration: 0.5, ease: "power2.in" }, 18.3 + i * 0.06);
      cajas.push(f);
    });

    /* ---------- una alerta solo sirve si llega a todos ---------- */
    const cOut = s("g", { transform: "translate(960,560)" }, F);
    const centro = s("g", {}, cOut);
    // altavoz
    const alt = s("g", {}, centro);
    s("circle", { r: 120, fill: C.sol }, alt);
    s("path", { d: "M-50,-30 L-14,-30 L30,-70 L30,70 L-14,30 L-50,30 Z", fill: C.tinta }, alt);
    const ondas = [0, 1, 2].map((i) => s("path", { d: `M${52 + i * 26},-${36 + i * 18} Q${78 + i * 30},0 ${52 + i * 26},${36 + i * 18}`, fill: "none", stroke: C.tinta, "stroke-width": 10, "stroke-linecap": "round" }, alt));
    tl.fromTo(alt, { scale: 0, svgOrigin: "0 0" }, { scale: 1, duration: 0.7, ease: "back.out(2)" }, 18.6);
    tl.fromTo(ondas, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.15, repeat: 5, yoyo: true }, 19.2);
    // anillo de personas diversas
    const pieles = ["#8D5524", "#C68642", "#E0AC69", "#F1C27D", "#FFDBAC", "#A0522D"];
    const ropas = [C.sismo, C.ruido, C.morado, C.verde, C.sol];
    const gentes = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2, R = 360;
      const g = s("g", { transform: `translate(${R * Math.cos(a)},${R * Math.sin(a) + 60})` }, centro);
      const gi = s("g", {}, g);
      persona(gi, { k: 0.62, piel: pieles[i % 6], ropa: ropas[i % 5] });
      gentes.push(gi);
    }
    tl.fromTo(gentes, { scale: 0, svgOrigin: "0 0" }, { scale: 1, duration: 0.5, ease: "back.out(2.4)", stagger: 0.05 }, 18.9);
    // ondas de alerta que llegan a todos
    for (let i = 0; i < 4; i++) {
      const r = s("circle", { r: 120, fill: "none", stroke: C.sol, "stroke-width": 10, opacity: 0 }, centro);
      tl.fromTo(r, { attr: { r: 120 }, opacity: 0.9 }, { attr: { r: 460 }, opacity: 0, duration: 1.6, ease: "power1.out", immediateRender: false }, 19.4 + i * 0.7);
    }
    tl.to(gentes, { y: -14, duration: 0.25, yoyo: true, repeat: 3, stagger: 0.04, ease: "sine.inOut" }, 20.6);
    tl.to(centro, { rotation: 8, svgOrigin: "0 0", duration: 4, ease: "sine.inOut" }, 19);
    // ODS 11 y 9
    const ods = (x, n, col, at) => { const o = s("g", { transform: `translate(${x},160)` }, F); const oi = s("g", {}, o); s("rect", { x: -70, y: -70, width: 140, height: 140, rx: 16, fill: col }, oi); txt(oi, n, { size: 76, color: C.blanco, y: 6 }); txt(oi, "ODS", { size: 22, color: C.blanco, y: -46 }); tl.fromTo(oi, { scale: 0, rotation: -30, svgOrigin: "0 0" }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" }, at); return o; };
    const o11 = ods(1640, "11", "#FD9D24", 20.4), o9 = ods(1810, "9", "#FD6925", 20.8);

    /* ---------- despedida ---------- */
    tl.to(centro, { autoAlpha: 0, scale: 0.6, svgOrigin: "0 0", duration: 0.6, ease: "power2.in" }, 23.2);
    tl.to([o11, o9], { autoAlpha: 0, duration: 0.4 }, 23.2);
    const W2 = 360, H2 = 360;
    [["F1", "Mateo", C.sismo, 520], ["F2", "Víctor", C.ruido, 960], ["F3", "Sofía", C.morado, 1400]].forEach(([id, q, col, cx], i) => {
      N.cameo(root, tl, { id, tipo: "Despedida", quien: q, linea: "(se despide)", x: cx - W2 / 2, y: 330, w: W2, h: H2, t0: 23.9 + i * 0.25, t1: T + 1, color: col, out: false });
    });
    const marca = N.t(root, '<span style="color:#E4572E">Sismo</span> <i style="font-family:Fraunces;font-weight:600">o</i> <span style="color:#2E86AB">ruido</span>', { x: 0, y: 120, w: 1920, align: "center", size: 110 });
    gsap.set(marca, { autoAlpha: 0 }); N.write(tl, marca, 24.0, 0.6);
    const pie = N.t(root, "sismo-o-ruido.vercel.app · Tecnológico de Monterrey · Expo Ingenierías 2026", { x: 0, y: 780, w: 1920, align: "center", size: 36, color: C.tinta });
    gsap.set(pie, { autoAlpha: 0 }); N.show(tl, pie, 25.0);
    const s1o = s("g", {}, F), s1 = sol(s1o, { x: 960, y: 1180, r: 260, n: 30 });
    tl.fromTo(s1o, { y: 300 }, { y: 0, duration: 1.4, ease: "expo.out" }, 24.4);
    tl.to(s1.rot, { rotation: 45, svgOrigin: "0 0", duration: 6, ease: "none" }, 24.4);
  },
});
