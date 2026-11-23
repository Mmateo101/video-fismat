/* Kit de ilustración plana y geométrica (inspirado en TED-Ed): colores sólidos,
   formas simétricas, anillos, soles dentados, ondas. Todo es SVG. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const C = {
    cielo: "#BFE3F2", cielo2: "#9FD3EA", noche: "#1D2440", noche2: "#2A3560", tinta: "#1D2440",
    sismo: "#E4572E", sismo2: "#F28A5B", ruido: "#2E86AB", ruido2: "#5BB5D9", sol: "#F6AE2D", sol2: "#FFD27A",
    morado: "#7B5EA7", morado2: "#A68BD1", verde: "#3BB273", verde2: "#7FD19B", crema: "#FBF6EC", blanco: "#FFFFFF",
    roca1: "#F3C98B", roca2: "#E5A65E", roca3: "#C97B47", roca4: "#8E4E35", manto: "#D9603B", magma: "#F28A5B",
    mar: "#2E86AB", mar2: "#5BB5D9", arena: "#F7DDA8", gris: "#8A8FA3", gris2: "#C9CCD8",
  };

  gsap.registerPlugin({ name: "redraw", init(t) { this.t = t; }, render(r, d) { d.t._redraw(r); } });

  const s = (tag, attrs = {}, parent, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const h = (tag, attrs = {}, parent, html) => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === "style") Object.assign(e.style, attrs[k]);
      else if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  const rng = (seed = 1) => { let v = seed >>> 0 || 1; return () => ((v = (v * 1664525 + 1013904223) >>> 0) / 4294967296); };

  /* Lienzo SVG de pantalla completa (1920×1080) */
  function svg(parent, { fondo, vb = "0 0 1920 1080", cls = "" } = {}) {
    const e = s("svg", { viewBox: vb, width: 1920, height: 1080, class: "lienzo " + cls }, parent);
    if (fondo) s("rect", { x: -2000, y: -2000, width: 6000, height: 6000, fill: fondo }, e);
    return e;
  }

  /* Sol dentado: n picos, radio interior ri y exterior re */
  function dientes(n, ri, re, rot = 0) {
    let d = "";
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : re, a = rot + (i * Math.PI) / n;
      d += (i ? "L" : "M") + (r * Math.cos(a)).toFixed(1) + "," + (r * Math.sin(a)).toFixed(1);
    }
    return d + "Z";
  }
  function sol(parent, { x = 0, y = 0, r = 100, n = 24, color = C.sol, color2 = C.sismo, centro = C.sol2 } = {}) {
    const g = s("g", { transform: `translate(${x},${y})` }, parent);
    const rot = s("g", {}, g);
    s("path", { d: dientes(n, r * 0.82, r * 1.18), fill: color2 }, rot);
    s("path", { d: dientes(n, r * 0.7, r, Math.PI / n), fill: color }, rot);
    s("circle", { r: r * 0.66, fill: centro }, g);
    g.rot = rot;
    return g;
  }

  /* Anillos concéntricos (ondas sísmicas) */
  function anillos(parent, { x, y, n = 6, color = C.sismo, ancho = 6, punteado = false } = {}) {
    const g = s("g", { transform: `translate(${x},${y})` }, parent);
    const rs = [];
    for (let i = 0; i < n; i++) rs.push(s("circle", { r: 1, fill: "none", stroke: color, "stroke-width": ancho, "stroke-dasharray": punteado ? "2 14" : null, "stroke-linecap": "round", opacity: 0 }, g));
    g.rs = rs;
    return g;
  }

  /* Camino de una onda: arreglo y[] dibujado entre x0 y x1 */
  function caminoOnda(ys, x0, x1, y0, amp) {
    const n = ys.length;
    let d = "";
    for (let i = 0; i < n; i++) d += (i ? "L" : "M") + (x0 + ((x1 - x0) * i) / (n - 1)).toFixed(1) + "," + (y0 - ys[i] * amp).toFixed(1);
    return d;
  }
  /* Señal sintética: ruido + sismo (para la historia) */
  function senal(n, { seed = 3, iP = 0.35, iS = 0.5, ruido = 0.08, p = 0.35, sAmp = 1 } = {}) {
    const r = rng(seed), y = [];
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      a = 0.85 * a + (r() - 0.5) * 0.5; b = 0.97 * b + (r() - 0.5) * 0.15;
      let v = ruido * (a + b * 2 + Math.sin(i * 0.22) * 0.6);
      if (t > iP) v += p * Math.exp(-(t - iP) * 12) * Math.sin(i * 1.3) * (1 - Math.exp(-(t - iP) * 300));
      if (t > iS) v += sAmp * Math.exp(-(t - iS) * 6) * Math.sin(i * 0.7 + r()) * (1 - Math.exp(-(t - iS) * 120)) * (0.7 + 0.3 * r());
      y.push(v);
    }
    return y;
  }

  /* Persona plana: cabeza + cuerpo trapezoidal */
  function persona(parent, { x = 0, y = 0, k = 1, piel = "#C98B5E", ropa = C.morado, pelo = C.noche } = {}) {
    const g = s("g", { transform: `translate(${x},${y}) scale(${k})` }, parent);
    s("path", { d: "M-34,0 L-26,-78 Q0,-92 26,-78 L34,0 Z", fill: ropa }, g);
    s("rect", { x: -9, y: -104, width: 18, height: 20, fill: piel }, g);
    s("circle", { cx: 0, cy: -122, r: 24, fill: piel }, g);
    s("path", { d: "M-25,-122 Q-26,-152 0,-150 Q26,-152 25,-122 Q16,-140 0,-138 Q-16,-140 -25,-122Z", fill: pelo }, g);
    return g;
  }

  /* Edificio geométrico con ventanas */
  function edificio(parent, { x, y, w, h: alto, color = C.morado, ventana = C.sol2, filas, cols, seed = 1 } = {}) {
    const g = s("g", { transform: `translate(${x},${y})` }, parent);
    s("rect", { x: 0, y: -alto, width: w, height: alto, fill: color }, g);
    const r = rng(seed);
    cols = cols || Math.max(2, Math.floor(w / 34));
    filas = filas || Math.max(2, Math.floor(alto / 46));
    const vw = (w - 16) / cols, vh = (alto - 24) / filas;
    g.ventanas = [];
    for (let i = 0; i < filas; i++) for (let j = 0; j < cols; j++) {
      const v = s("rect", { x: 8 + j * vw + 4, y: -alto + 14 + i * vh + 4, width: vw - 8, height: vh - 10, rx: 2, fill: r() > 0.35 ? ventana : C.noche2 }, g);
      g.ventanas.push(v);
    }
    return g;
  }

  /* Estación sismológica: triángulo con antena */
  function estacion(parent, { x, y, k = 1, color = C.sol } = {}) {
    const g = s("g", { transform: `translate(${x},${y}) scale(${k})` }, parent);
    s("path", { d: "M0,-46 L36,18 L-36,18 Z", fill: color, stroke: C.tinta, "stroke-width": 6, "stroke-linejoin": "round" }, g);
    s("circle", { cx: 0, cy: -4, r: 8, fill: C.tinta }, g);
    return g;
  }

  /* Tarjeta (rectángulo redondeado con sombra plana) */
  function tarjeta(parent, { x, y, w, h: alto, r = 28, color = C.crema, sombra = "rgba(29,36,64,.18)" } = {}) {
    const g = s("g", { transform: `translate(${x},${y})` }, parent);
    s("rect", { x: 0, y: 10, width: w, height: alto, rx: r, fill: sombra }, g);
    g.fondo = s("rect", { x: 0, y: 0, width: w, height: alto, rx: r, fill: color }, g);
    return g;
  }

  /* Texto SVG */
  function txt(parent, str, { x = 0, y = 0, size = 48, color = C.tinta, weight = 800, anchor = "middle", font = "Nunito", italic = false, ls = 0 } = {}) {
    return s("text", { x, y, "font-size": size, fill: color, "font-weight": weight, "text-anchor": anchor, "font-family": font, "font-style": italic ? "italic" : null, "letter-spacing": ls || null, "dominant-baseline": "middle" }, parent, str);
  }

  /* Partículas geométricas flotantes (para que nada esté quieto) */
  function particulas(parent, tl, T, { n = 18, colores = [C.blanco], seed = 9, area = [0, 0, 1920, 1080], opacidad = 0.35, tam = [6, 18] } = {}) {
    const r = rng(seed), g = s("g", { opacity: opacidad }, parent);
    for (let i = 0; i < n; i++) {
      const x = area[0] + r() * area[2], y = area[1] + r() * area[3], z = tam[0] + r() * (tam[1] - tam[0]);
      const tipo = Math.floor(r() * 3), col = colores[Math.floor(r() * colores.length)];
      let e;
      if (tipo === 0) e = s("circle", { cx: 0, cy: 0, r: z / 2, fill: col }, g);
      else if (tipo === 1) e = s("rect", { x: -z / 2, y: -z / 2, width: z, height: z, fill: col }, g);
      else e = s("path", { d: `M0,${-z / 1.6} L${z / 1.8},${z / 2.6} L${-z / 1.8},${z / 2.6}Z`, fill: col }, g);
      gsap.set(e, { x, y, rotation: r() * 360 });
      tl.to(e, { x: x + (r() - 0.5) * 160, y: y - 40 - r() * 120, rotation: "+=" + (60 + r() * 120), duration: T, ease: "none" }, 0);
    }
    return g;
  }

  window.K = { C, s, h, rng, svg, dientes, sol, anillos, caminoOnda, senal, persona, edificio, estacion, tarjeta, txt, particulas };
})();
