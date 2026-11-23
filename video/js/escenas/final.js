/* Escena final: anillos de colores, mandala, «Gracias» y la dirección del prototipo. Todo se recoge en un punto. */
N.add({
  id: "final",
  entrada: "anillos",
  quieto: true,
  build(root, tl, T) {
    const { C, s, svg, dientes, particulas } = K;
    const F = svg(root, { fondo: C.noche });
    particulas(F, tl, T, { n: 70, colores: [C.blanco, C.sol2], seed: 7, opacidad: 0.5, tam: [3, 8] });
    const cO = s("g", { transform: "translate(960,440) scale(0.74)" }, F);
    const c = s("g", {}, cO);
    const capas = [[560, 500, 56, C.sismo], [480, 430, 48, C.sol], [410, 370, 40, C.ruido], [350, 318, 34, C.morado], [300, 272, 28, C.verde]];
    const anillos = capas.map(([re, ri, n, col], i) => {
      const g = s("g", {}, c);
      s("path", { d: dientes(n, ri, re, i % 2 ? Math.PI / n : 0), fill: col }, g);
      tl.fromTo(g, { scale: 0, rotation: i % 2 ? 90 : -90, svgOrigin: "0 0" }, { scale: 1, rotation: 0, duration: 1.1, ease: "back.out(1.6)" }, 0.1 + i * 0.12);
      tl.to(g, { rotation: i % 2 ? -50 : 50, svgOrigin: "0 0", duration: T, ease: "none" }, 1.2);
      return g;
    });
    const disco = s("circle", { r: 255, fill: C.crema }, c);
    tl.fromTo(disco, { attr: { r: 0 } }, { attr: { r: 255 }, duration: 0.8, ease: "back.out(1.8)" }, 0.6);
    // onda que late dentro del disco
    const onda = s("path", { transform: "translate(0,95) scale(0.75)", d: "M-180,40 h70 l25,-55 30,110 30,-150 30,130 25,-35 h150", fill: "none", stroke: C.sismo, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" }, c);
    N.draw(tl, onda, 1.0, 0.9, "power2.out");
    const gracias = N.t(root, "Gracias", { x: 0, y: 360, w: 1920, align: "center", size: 92, color: C.tinta });
    gracias.style.fontFamily = "Fraunces";
    gsap.set(gracias, { autoAlpha: 0 });
    N.write(tl, gracias, 1.2, 0.6);
    const frase = N.t(root, "que cada alerta llegue a tiempo", { x: 0, y: 885, w: 1920, align: "center", size: 44, color: C.sol2 });
    gsap.set(frase, { autoAlpha: 0 });
    N.show(tl, frase, 2.0);
    const pie = N.t(root, '<span style="color:#E4572E">Sismo</span> <i style="font-family:Fraunces;font-weight:600">o</i> <span style="color:#5BB5D9">ruido</span> · sismo-o-ruido.vercel.app', { x: 0, y: 965, w: 1920, align: "center", size: 32, color: C.blanco });
    gsap.set(pie, { autoAlpha: 0 });
    N.show(tl, pie, 2.6);
    // cierre: todo se recoge en un punto
    tl.to([gracias, frase, pie], { autoAlpha: 0, scale: 0.8, duration: 0.5, ease: "power2.in" }, T - 1.5);
    tl.to(c, { scale: 0, rotation: 200, svgOrigin: "0 0", duration: 1.0, ease: "back.in(1.6)" }, T - 1.35);
    const punto = s("circle", { cx: 960, cy: 440, r: 0, fill: C.sol }, F);
    tl.fromTo(punto, { attr: { r: 0 } }, { attr: { r: 14 }, duration: 0.25, ease: "power2.out", immediateRender: false }, T - 0.4);
    tl.to(punto, { attr: { r: 0 }, duration: 0.25, ease: "power2.in" }, T - 0.15);
  },
});
