/* Escena 2 · Quiénes somos: tres marcos que se reacomodan, luego el proyecto, la clase y el profesor. */
N.add({
  id: "equipo",
  entrada: "iris", irisEn: [960, 540], irisColor: "#F6AE2D",
  build(root, tl, T) {
    const { C, s, svg, dientes, particulas } = K;
    const fondo = svg(root, { fondo: C.crema });
    particulas(fondo, tl, T, { n: 26, colores: [C.sol, C.sismo, C.ruido, C.morado], seed: 21, opacidad: 0.25 });
    // mandala: anillos dentados que giran en sentidos opuestos
    const mand = s("g", { transform: "translate(960,540)" }, fondo);
    const anillosM = [];
    [[520, 470, 40, C.sol2], [440, 400, 32, C.sismo2], [370, 330, 26, C.ruido2], [300, 262, 20, C.morado2]].forEach(([re, ri, n, c], i) => {
      const g = s("g", {}, mand);
      s("path", { d: dientes(n, ri, re), fill: c, opacity: 0.5 }, g);
      anillosM.push(g);
      tl.fromTo(g, { scale: 0, rotation: 0, svgOrigin: "0 0" }, { scale: 1, duration: 0.9, ease: "back.out(1.6)" }, 0.1 + i * 0.12);
      tl.to(g, { rotation: i % 2 ? -40 : 40, svgOrigin: "0 0", duration: T, ease: "none" }, 0);
    });
    s("circle", { r: 230, fill: C.crema }, mand);
    tl.to(mand, { scale: 1.6, opacity: 0.35, svgOrigin: "0 0", duration: 1.4, ease: "expo.inOut" }, 5.2);

    // tres marcos (las tomas de saludo) que se reacomodan al entrar cada uno
    const gente = [
      { id: "A1", quien: "Mateo", mat: "A01783438", col: C.sismo, cx: 400 },
      { id: "A2", quien: "Víctor", mat: "A01287522", col: C.ruido, cx: 960 },
      { id: "A3", quien: "Sofía", mat: "A01724528", col: C.morado, cx: 1520 },
    ];
    const W = 440, Hh = 440, top = 250;
    const offs = [[560, 280, 0], [null, 280, 0], [null, null, 0]];
    const entra = [0.9, 2.1, 3.3];
    gente.forEach((p, i) => {
      const f = N.cameo(root, tl, { id: p.id, tipo: "Saludo", quien: p.quien, linea: "(saluda a cámara)", x: p.cx - W / 2, y: top, w: W, h: Hh, t0: entra[i] + 0.6, t1: 13.9, color: p.col, out: false });
      const nom = N.t(root, `${p.quien}<div style="font:700 26px Nunito;opacity:.7;margin-top:6px">${p.mat}</div>`, { x: p.cx - 260, y: top + Hh + 38, w: 520, align: "center", size: 54, color: C.tinta });
      gsap.set([f.box, nom], { x: offs[0][i] ?? 0 });
      N.show(tl, nom, entra[i] + 0.3);
      // reacomodo cuando entra el siguiente
      [1, 2].forEach((k) => { if (k > i) tl.to([f.box, nom], { x: offs[k][i], duration: 0.9, ease: "expo.inOut" }, entra[k] - 0.1); });
      gsap.set([f.box, nom], { x: offs[i][i] });
      // compresión: suben y se hacen chicos para dar lugar al proyecto
      tl.to(f.box, { scale: 0.42, y: -235, x: (p.cx - 960) * -0.45, duration: 1.1, ease: "expo.inOut" }, 5.4 + i * 0.06);
      tl.to(nom, { autoAlpha: 0, y: -60, duration: 0.5, ease: "power2.in" }, 5.3);
      tl.to(f.box, { autoAlpha: 0, scale: 0.2, y: -260, duration: 0.6, ease: "power2.in" }, 13.9 + i * 0.08);
    });

    // proyecto, clase, profesor
    const etq = N.t(root, "PROYECTO", { x: 0, y: 420, w: 1920, align: "center", size: 28, color: C.sismo, ls: "0.25em" });
    const tit = N.t(root, "Análisis espectral de Fourier<br>para alertas de señales sísmicas inclusivas", { x: 160, y: 470, w: 1600, align: "center", size: 72, color: C.tinta, lh: 1.08 });
    gsap.set([etq, tit], { autoAlpha: 0 });
    N.show(tl, etq, 6.2);
    N.write(tl, tit, 6.4, 1.0);
    const fichas = [
      { html: "Análisis de Métodos Matemáticos para la Física", bg: C.ruido, fg: C.blanco },
      { html: "Dr. Luis Miguel Méndez Díaz", bg: C.sol, fg: C.tinta },
      { html: "Profesional · Tecnológico de Monterrey", bg: C.tinta, fg: C.blanco },
    ];
    const els = fichas.map((f) => { const e = N.t(root, f.html, { x: 0, y: 0, size: 34, color: f.fg }); e.className = "pill"; e.style.background = f.bg; return e; });
    // las fichas se acomodan una debajo de otra; al entrar una, las otras se recorren
    const anchos = els.map((e) => e.offsetWidth || 700);
    const yBase = 640;
    els.forEach((e, i) => gsap.set(e, { left: 960 - anchos[i] / 2, top: yBase + i * 80, autoAlpha: 0 }));
    [[7.6, { x: -1200 }], [10.4, { x: 1200 }], [12.0, { y: 300 }]].forEach(([at, de], i) => {
      tl.set(els[i], { autoAlpha: 1 }, at);
      tl.fromTo(els[i], de, { x: 0, y: 0, duration: 0.8, ease: "expo.out", immediateRender: false }, at);
    });
    tl.to(tit, { y: -40, duration: 0.8, ease: "expo.inOut" }, 7.5);
    tl.to(etq, { y: -40, duration: 0.8, ease: "expo.inOut" }, 7.5);

    // todo se condensa en el nombre de la herramienta
    tl.to([...els, etq], { autoAlpha: 0, y: "+=40", scale: 0.8, duration: 0.5, stagger: 0.05, ease: "power2.in" }, 14.2);
    tl.to(tit, { autoAlpha: 0, scale: 0.6, duration: 0.6, ease: "power2.in" }, 14.3);
    const marca = N.t(root, '<span style="color:#E4572E">Sismo</span> <i style="font-family:Fraunces;font-weight:600">o</i> <span style="color:#2E86AB">ruido</span>', { x: 0, y: 440, w: 1920, align: "center", size: 170 });
    gsap.set(marca, { autoAlpha: 0 });
    N.write(tl, marca, 15.0, 0.7);
    const linea = s("path", { d: "M560,760 h220 l40,-90 50,180 50,-240 50,220 40,-70 h500", fill: "none", stroke: C.tinta, "stroke-width": 12, "stroke-linecap": "round", "stroke-linejoin": "round" }, fondo);
    N.draw(tl, linea, 15.6, 1.4, "power2.out");
    tl.to(marca, { scale: 1.06, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 16.5);
  },
});
