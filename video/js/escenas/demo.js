/* Escena 8 · Demo: la página real (web/public) dentro de un navegador dibujado.
   El video controla el reloj de GSAP de la página, su scroll y un cursor. Así el render es determinista. */
N.add({
  id: "demo",
  entrada: "iris", irisEn: [960, 540], irisColor: "#E4572E",
  build(root, tl, T, def) {
    const { C, s, svg, txt, particulas, h } = K;
    const F = svg(root, { fondo: C.morado });
    particulas(F, tl, T, { n: 34, colores: [C.sol, C.blanco, C.sismo2, C.ruido2], seed: 81, opacidad: 0.35, tam: [10, 26] });
    // anillos decorativos que giran detrás del navegador
    const deco = s("g", { transform: "translate(960,560)" }, F);
    [700, 600].forEach((r, i) => { const c = s("circle", { r, fill: "none", stroke: i ? C.sol : C.morado2, "stroke-width": 26, "stroke-dasharray": "40 30" }, deco); tl.to(c, { rotation: i ? -40 : 40, svgOrigin: "0 0", duration: T, ease: "none" }, 0); });

    // navegador
    const K_ = 0.84, IW = 1440, IH = 900, BX = 960 - (IW * K_) / 2, BY = 150, BAR = 52;
    const nav = h("div", { class: "nav-mock", style: { left: BX - 10 + "px", top: BY - BAR - 10 + "px", width: IW * K_ + 20 + "px", height: IH * K_ + BAR + 20 + "px" } }, root);
    const barra = h("div", { class: "nav-barra" }, nav, '<i></i><i></i><i></i><div class="nav-url"><span class="nav-txt"></span><b class="nav-caret"></b></div>');
    const caja = h("div", { class: "nav-caja", style: { width: IW * K_ + "px", height: IH * K_ + "px" } }, nav);
    const frame = h("iframe", { src: "../web/public/index.html?video=1#us7000f93v", style: { width: IW + "px", height: IH + "px", transform: `scale(${K_})`, transformOrigin: "0 0", border: "0", background: "#fff" } }, caja);
    tl.fromTo(nav, { y: 700, rotation: 6, scale: 0.7 }, { y: 0, rotation: 0, scale: 1, duration: 1.1, ease: "expo.out" }, 0.1);
    // la dirección se escribe sola
    const url = "sismo-o-ruido.vercel.app", navTxt = barra.querySelector(".nav-txt");
    const esc = { _redraw(r) { navTxt.textContent = url.slice(0, Math.round(url.length * r)); } };
    esc._redraw(0); tl.to(esc, { redraw: 1, duration: 1.6, ease: "none" }, 1.0);
    // cursor
    const cur = h("div", { class: "cursor" }, root, '<svg viewBox="0 0 40 52" width="44" height="58"><path d="M4 2 L4 40 L14 31 L21 48 L28 45 L21 29 L34 29 Z" fill="#fff" stroke="#1D2440" stroke-width="3.5" stroke-linejoin="round"/></svg>');
    const onda = h("div", { class: "clic" }, root);
    gsap.set([cur, onda], { autoAlpha: 0 });
    tl.set(cur, { autoAlpha: 1 }, 6.4);
    tl.set(cur, { autoAlpha: 0 }, 31.0);

    /* guion de la demo (tiempos locales) */
    const acciones = [
      { t: 9.6, sel: '#mapa .sismo[data-id="us2000ar20"]', fn: (A) => A.elegir("us2000ar20") },
      { t: 13.9, sel: "#b-separar", fn: (A) => A.separar() },
      { t: 21.0, sel: '#seg button[data-v="0"]', fn: (A) => A.verSg(0) },
      { t: 22.6, sel: '#seg button[data-v="1"]', fn: (A) => A.verSg(1) },
      { t: 26.6, sel: '.onda[data-k="sismo"] .oir', fn: () => {} },
    ];
    // scroll de la página (px) en cada momento
    const scrolls = [[0, 0], [10.4, 0], [11.9, "#ficha"], [17.9, "#ficha"], [19.4, ".dos"], [24.4, ".dos"], [25.6, "#ondas"], [31, "#ondas"]];
    // posiciones del cursor: [t, selector] (se mueve con suavidad entre puntos)
    const camino = [[6.4, null], [9.2, acciones[0].sel], [12.6, acciones[0].sel], [13.6, acciones[1].sel], [18.0, acciones[1].sel], [20.6, acciones[2].sel], [22.2, acciones[3].sel], [25.0, acciones[3].sel], [26.3, acciones[4].sel], [31, acciones[4].sel]];
    def.ultimo = -1; def.hechas = 0; def.base = 0;
    const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

    def.sync = async (t) => {
      for (let i = 0; i < 150 && !(frame.contentWindow && frame.contentWindow.APP && frame.contentWindow.document.querySelector("#mapa .sismo")); i++) await new Promise((r) => setTimeout(r, 100));
      const w = frame.contentWindow;
      if (!w || !w.APP || !w.gsap) return;
      const d = w.document, gl = w.gsap.globalTimeline;
      if (!def.listo) {
        def.listo = true; gl.pause(); def.base = gl.time();
        await Promise.all(["us2000ar20", "us7000f93v"].map((id) => w.APP.cargar(id)));
      }
      if (t < def.ultimo - 0.001) { // hacia atrás (solo en la vista previa): reiniciar
        if (d.querySelector("#b-separar").classList.contains("unir")) w.APP.separar();
        await w.APP.elegir("us7000f93v"); def.hechas = 0;
      }
      def.ultimo = t;
      const tt = Math.max(0, t);
      while (def.hechas < acciones.length && acciones[def.hechas].t <= tt) {
        const a = acciones[def.hechas];
        gl.time(def.base + a.t);
        await a.fn(w.APP);
        def.hechas++;
      }
      gl.time(def.base + tt);
      // audio simulado: la barra amarilla recorre la onda del sismo
      const ra = (tt - 26.8) / 2.6;
      w.APP.cabeza("aud_sismo", ra >= 0 && ra <= 1 ? ra : null);
      // scroll
      const yDe = (v) => (typeof v === "number" ? v : Math.max(0, d.querySelector(v).getBoundingClientRect().top + w.scrollY - 70));
      let y = 0;
      for (let i = 0; i < scrolls.length - 1; i++) {
        const [a, va] = scrolls[i], [b, vb] = scrolls[i + 1];
        if (tt >= a && tt <= b) { const u = b > a ? ease((tt - a) / (b - a)) : 1; y = yDe(va) + (yDe(vb) - yDe(va)) * u; break; }
        if (tt > b) y = yDe(vb);
      }
      w.scrollTo(0, y);
      // cursor
      const pos = (sel) => {
        if (!sel) return [BX + IW * K_ * 0.8, BY + IH * K_ * 0.9];
        const r = d.querySelector(sel).getBoundingClientRect();
        return [BX + (r.left + r.width / 2) * K_, BY + (r.top + r.height / 2) * K_];
      };
      let p = pos(null);
      for (let i = 0; i < camino.length - 1; i++) {
        const [a, sa] = camino[i], [b, sb] = camino[i + 1];
        if (tt >= a && tt <= b) { const u = ease((tt - a) / (b - a)), p0 = pos(sa), p1 = pos(sb); p = [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u]; break; }
        if (tt > b) p = pos(sb);
      }
      // el navegador puede estar acercado: se aplica su transformación al punto
      const NX = BX - 10 + (IW * K_ + 20) / 2, NY = BY - BAR - 10 + (IH * K_ + BAR + 20) / 2;
      const sc = gsap.getProperty(nav, "scale"), ox = gsap.getProperty(nav, "x"), oy = gsap.getProperty(nav, "y");
      p = [NX + (p[0] - NX) * sc + ox, NY + (p[1] - NY) * sc + oy];
      cur.style.transform = `translate(${p[0] - 6}px, ${p[1] - 4}px)`;
      // onda del clic
      const clic = acciones.find((a) => tt >= a.t && tt < a.t + 0.6);
      if (clic) { const u = (tt - clic.t) / 0.6; onda.style.visibility = "visible"; onda.style.opacity = 1 - u; onda.style.transform = `translate(${p[0] - 40}px, ${p[1] - 40}px) scale(${0.3 + u})`; }
      else onda.style.visibility = "hidden";
    };

    // cámara: se acerca al navegador mientras se usa
    tl.to(nav, { scale: 1.24, y: 50, duration: 1.4, ease: "expo.inOut" }, 12.4);
    tl.to(nav, { x: 30, duration: 4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 14);
    // cierre: el navegador se aleja y aparece la dirección con un código QR
    tl.to(nav, { scale: 0.62, x: -380, y: -20, rotation: -3, duration: 1.2, ease: "expo.inOut", immediateRender: false }, 31.0);
    const qOut = s("g", { transform: "translate(1330,300)" }, F);
    const qG = s("g", {}, qOut);
    const n = QR.length, cel = 14;
    s("rect", { x: -20, y: -20, width: n * cel + 40, height: n * cel + 40, rx: 26, fill: C.blanco }, qG);
    QR.forEach((fila, i) => fila.forEach((v, j) => { if (v) s("rect", { x: j * cel, y: i * cel, width: cel, height: cel, fill: C.tinta }, qG); }));
    tl.fromTo(qG, { scale: 0, rotation: 20, svgOrigin: `${(n * cel) / 2} ${(n * cel) / 2}` }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)" }, 31.8);
    const dir = N.t(root, "sismo-o-ruido.vercel.app", { x: 1180, y: 800, w: 740, align: "center", size: 46, color: C.blanco });
    gsap.set(dir, { autoAlpha: 0 }); N.show(tl, dir, 32.4);
  },
});
