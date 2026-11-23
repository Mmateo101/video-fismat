/* Motor del video: línea de tiempo maestra (GSAP), escenas, transiciones, cámara que
   siempre respira, marcos para las tomas reales, subtítulos y controles.
   Adaptado del motor del video de Estadística. Teclas: Espacio, ← →, 1–9, G, F. */
(function () {
  const G = window.GUION;
  const { C, h } = K;
  const qs = new URLSearchParams(location.search);
  const stage = document.getElementById("stage");
  const mundo = document.getElementById("mundo");
  const sub = document.getElementById("sub");
  const reloj = document.getElementById("reloj");

  const N = {
    guia: qs.get("guia") === "1",
    subs: qs.get("subs") !== "0",
    render: qs.get("render") === "1",
    limpio: qs.get("limpio") === "1",
    scenes: [], cameos: [], syncs: [], _cur: null,
    M: gsap.timeline({ paused: true }),
    add(def) { this.scenes.push(def); },

    /* Texto HTML. o: x, y, w, size, font ('head'|'body'|'num'), color, align, weight, lh */
    t(parent, html, o = {}) {
      const st = { left: (o.x || 0) + "px", top: (o.y || 0) + "px", fontSize: (o.size || 48) + "px", color: o.color || C.tinta };
      if (o.w) st.width = o.w + "px";
      if (o.align) st.textAlign = o.align;
      if (o.weight) st.fontWeight = o.weight;
      if (o.lh) st.lineHeight = o.lh;
      if (o.ls) st.letterSpacing = o.ls;
      const e = h("div", { class: "abs t-" + (o.font || "head") }, parent, html);
      Object.assign(e.style, st);
      return e;
    },
    splitChars(el) {
      const chars = [];
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((w) => {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              const word = h("span", { class: "word" });
              [...w].forEach((c) => { const sp = h("span", { class: "ch" }, word); sp.textContent = c; chars.push(sp); });
              frag.appendChild(word);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      return chars;
    },
    /* El texto entra letra por letra, desde abajo */
    write(tl, el, at, dur = 0.9) {
      const chars = el._chars || (el._chars = N.splitChars(el));
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at);
      tl.fromTo(chars, { opacity: 0, y: 40, rotation: 8 }, { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: "back.out(2)", stagger: dur / chars.length }, at);
      return tl;
    },
    show(tl, els, at, o = {}) {
      const de = { autoAlpha: 0, y: o.y != null ? o.y : 30, scale: o.scale != null ? o.scale : 1 };
      const a = { autoAlpha: 1, y: 0, scale: 1, duration: o.dur || 0.6, ease: o.ease || "back.out(1.6)", stagger: o.stagger || 0, transformOrigin: o.origin || "50% 50%" };
      if (o.x != null) { de.x = o.x; a.x = 0; }
      return tl.fromTo(els, de, a, at);
    },
    pop(tl, els, at, o = {}) {
      return tl.fromTo(els, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: o.dur || 0.55, ease: o.ease || "back.out(2.2)", stagger: o.stagger || 0, transformOrigin: o.origin || "50% 50%", svgOrigin: o.svgOrigin }, at);
    },
    hide(tl, els, at, dur = 0.4, o = {}) { return tl.to(els, { autoAlpha: 0, y: o.y || 0, scale: o.scale != null ? o.scale : 1, duration: dur, ease: "power2.in", stagger: o.stagger || 0 }, at); },
    count(tl, el, from, to, at, dur = 1.4, dec = 1, suf = "", pre = "") {
      const fmt = (v) => pre + v.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      const o = { _redraw(r) { el.textContent = fmt(from + (to - from) * r); } };
      o._redraw(0);
      return tl.to(o, { redraw: 1, duration: dur, ease: "power2.out" }, at);
    },
    draw(tl, paths, at, dur = 0.8, ease = "power1.inOut") {
      const arr = paths.length != null && !(paths instanceof Element) ? [...paths] : [paths];
      arr.forEach((p) => { const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 600) + 2; p.style.strokeDasharray = len + " " + len; p._len = len; });
      return tl.fromTo(arr, { strokeDashoffset: (i, t) => t._len, opacity: 1 }, { strokeDashoffset: 0, duration: dur, ease }, at);
    },

    /* Marco para una toma real (cameo). o: id, x, y, w, h, t0, t1, quien, linea, color */
    cameo(parent, tl, o) {
      const pad = 12;
      const box = h("div", { class: "marco", style: { left: o.x - pad + "px", top: o.y - pad + "px", width: o.w + pad * 2 + "px", height: o.h + pad * 2 + "px", background: o.color || C.blanco } }, parent);
      const hueco = h("div", { class: "hueco", style: { left: pad + "px", top: pad + "px", width: o.w + "px", height: o.h + "px" } }, box);
      const cur = N._cur;
      const clips = (G.medios || []).filter((m) => m.video && m.cam === o.id && cur && m.escena === cur.id);
      if (clips.length) {
        const grupo = clips.map((m) => {
          const v = h("video", { preload: "auto", playsinline: "", src: `media/${m.src}.mp4`, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", visibility: "hidden" } }, hueco);
          v.muted = true;
          return { v, m: Object.assign({ abs: cur.t0 + (cur.warp ? cur.warp(m.at || 0) : m.at || 0) }, m) };
        });
        N.videos.push({ grupo, desde: cur.t0 - 1, hastaT: cur.t1 + 1 });
      }
      const rot = h("div", { class: "rot" }, hueco, `<div class="tipo">${o.tipo || "Cameo"} · ${o.id}</div><div class="quien">${o.quien || ""}</div>` + (o.linea ? `<div class="linea">${o.linea}</div>` : ""));
      if (clips.length) rot.style.display = "none";
      if (o.inn !== false) tl.fromTo(box, { autoAlpha: 0, scale: 0.6, rotation: -6 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.8)" }, Math.max(0, o.t0 - 0.6));
      if (o.out !== false) tl.to(box, { autoAlpha: 0, scale: 0.7, rotation: 4, duration: 0.45, ease: "power2.in" }, o.t1);
      const base = N._cur ? N._cur.t0 : 0;
      const wp = N._cur && N._cur.warp ? N._cur.warp : (x) => x;
      N.cameos.push({ id: o.id, tipo: o.tipo || "Cameo", quien: o.quien || "", linea: o.linea || "", t0: +(base + wp(o.t0)).toFixed(2), t1: +(base + wp(o.t1)).toFixed(2), x: o.x, y: o.y, w: o.w, h: o.h });
      return { box, hueco, rot };
    },

    /* Grabaciones reales dentro de los marcos (ver GUION.medios) */
    videos: [],
    syncVideos(t, exacto) {
      const esperas = [];
      N.videos.forEach((V) => {
        if (t < V.desde || t > V.hastaT) { V.grupo.forEach(({ v }) => { if (!v.paused) v.pause(); }); return; }
        let act = V.grupo[0];
        V.grupo.forEach((c) => { if (c.m.abs <= t) act = c; });
        const m = act.m, local = Math.min(Math.max(m.ss + (t - m.abs), m.ss), m.hasta - 0.04);
        V.grupo.forEach((c) => { const vis = c === act ? "visible" : "hidden"; if (c.v.style.visibility !== vis) c.v.style.visibility = vis; if (c !== act && !c.v.paused) c.v.pause(); });
        const v = act.v;
        const corriendo = !exacto && t >= m.abs && t < m.abs + (m.hasta - m.ss);
        if (corriendo) { if (v.paused) { v.currentTime = local; v.play().catch(() => {}); } else if (Math.abs(v.currentTime - local) > 0.25) v.currentTime = local; }
        else {
          if (!v.paused) v.pause();
          if (Math.abs(v.currentTime - local) > 0.001) {
            esperas.push(new Promise((r) => { const fin = () => { v.removeEventListener("seeked", fin); r(); }; v.addEventListener("seeked", fin); setTimeout(fin, 4000); }));
            v.currentTime = local;
          }
        }
      });
      return Promise.all(esperas);
    },

    /* Ecuación técnica: aparece, se queda y se va. o: x, y, w, size, color, t0, t1 */
    eq(parent, tl, html, o = {}) {
      const e = N.t(parent, html, { x: o.x || 0, y: o.y || 0, w: o.w || 1920, align: o.align || "center", size: o.size || 44, font: "num", color: o.color || C.tinta });
      gsap.set(e, { autoAlpha: 0 });
      tl.fromTo(e, { autoAlpha: 0, y: 20, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out", immediateRender: false }, o.t0);
      if (o.t1 != null) tl.to(e, { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" }, o.t1);
      return e;
    },

    /* Reacomodo: mueve elementos HTML/SVG a nuevas posiciones con resorte */
    mover(tl, el, at, props, dur = 0.9) { return tl.to(el, Object.assign({ duration: dur, ease: "expo.inOut" }, props), at); },
  };

  function fit() {
    const sc = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(${(window.innerWidth - 1920 * sc) / 2}px, ${(window.innerHeight - 1080 * sc) / 2}px) scale(${sc})`;
  }

  let lastLine = null;
  function guide(t) {
    const all = G.escenas.flatMap((e) => e.voz.map((v) => ({ ...v, t0: e.t0 + v.t0, t1: e.t0 + v.t1 })));
    const line = all.find((v) => t >= v.t0 && t < v.t1 + 0.2) || null;
    if (line !== lastLine && (!line || !lastLine || line.x !== lastLine.x)) {
      lastLine = line;
      sub.classList.toggle("on", !!line && N.subs);
      if (line) {
        sub.querySelector(".txt").textContent = line.x;
        sub.querySelector(".who").textContent = line.q === "voz" ? "Voz · " + line.rec : "A cámara · " + line.q;
      }
    }
    if (N.guia) {
      const e = G.escenas.find((s) => t >= s.t0 && t < s.t1) || G.escenas[G.escenas.length - 1];
      reloj.textContent = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")} · ${e.nombre}`;
    }
    const fill = document.querySelector("#barra .fill");
    if (fill) fill.style.width = (t / G.dur) * 100 + "%";
  }

  /* Transiciones entre escenas */
  function transicion(M, prev, def) {
    const t = def.t0, tipo = def.entrada || "fundido";
    if (tipo === "iris") {
      const [x, y] = def.irisEn || [960, 540], D = 1.1, col = def.irisColor || C.sol;
      const anillo = h("div", { class: "iris", style: { left: x + "px", top: y + "px", borderColor: col, opacity: 0 } }, mundo);
      M.set(def.el, { autoAlpha: 1, zIndex: 6 }, t - D * 0.55);
      M.fromTo(def.el, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(2300px at ${x}px ${y}px)`, duration: D, ease: "power3.in", immediateRender: false }, t - D * 0.55);
      M.fromTo(anillo, { width: 0, height: 0, opacity: 1 }, { width: 4600, height: 4600, opacity: 1, duration: D, ease: "power3.in", immediateRender: false }, t - D * 0.55);
      M.set(anillo, { opacity: 0 }, t + D * 0.45);
      M.set(prev.el, { autoAlpha: 0 }, t + D * 0.45);
      M.set(def.el, { zIndex: 1, clipPath: "none" }, t + D * 0.45);
    } else if (tipo === "barrido") {
      // tres franjas de color cruzan en diagonal y destapan la escena nueva
      const D = 1.2, cols = def.barridoColores || [C.sismo, C.sol, C.ruido];
      const fr = cols.map((c, i) => h("div", { class: "franja", style: { background: c, zIndex: 20 + i } }, mundo));
      gsap.set(fr, { xPercent: -160 });
      fr.forEach((f, i) => {
        M.fromTo(f, { xPercent: -160 }, { xPercent: 0, duration: D / 2, ease: "power3.in", immediateRender: false }, t - D / 2 + i * 0.06);
        M.to(f, { xPercent: 160, duration: D / 2, ease: "power3.out" }, t + i * 0.06);
      });
      M.set(def.el, { autoAlpha: 1, zIndex: 1 }, t);
      M.set(prev.el, { autoAlpha: 0 }, t);
    } else if (tipo === "zoom") {
      const D = 0.9;
      M.set(def.el, { autoAlpha: 1, zIndex: 6 }, t - D / 2);
      M.fromTo(def.el, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: D, ease: "expo.out", immediateRender: false }, t - D / 2);
      M.to(prev.el, { scale: 1.6, opacity: 0, duration: D, ease: "expo.in" }, t - D / 2);
      M.set(prev.el, { autoAlpha: 0 }, t + D / 2);
      M.set(def.el, { zIndex: 1 }, t + D / 2);
    } else if (tipo === "anillos") {
      // anillos de colores que se expanden en cascada desde el centro; el último es el fondo de la escena nueva
      const cols = def.anillosColores || [C.sismo, C.sol, C.ruido, C.morado, C.noche];
      const ani = cols.map((c, i) => h("div", { class: "aro", style: { background: c, zIndex: 40 + i } }, mundo));
      gsap.set(ani, { width: 0, height: 0, opacity: 1 });
      ani.forEach((a, i) => M.fromTo(a, { width: 0, height: 0 }, { width: 4400, height: 4400, duration: 0.95, ease: "power3.in", immediateRender: false }, t - 1.25 + i * 0.13));
      M.set(def.el, { autoAlpha: 1, zIndex: 1 }, t);
      M.set(prev.el, { autoAlpha: 0 }, t);
      M.set(ani, { opacity: 0 }, t + 0.02);
    } else if (tipo === "corte") {
      M.set(def.el, { autoAlpha: 1 }, t);
      M.set(prev.el, { autoAlpha: 0 }, t);
    } else {
      const D = 0.7;
      M.set(def.el, { autoAlpha: 1, zIndex: 6 }, t - D / 2);
      M.fromTo(def.el, { opacity: 0 }, { opacity: 1, duration: D, ease: "power1.inOut", immediateRender: false }, t - D / 2);
      M.set(prev.el, { autoAlpha: 0 }, t + D / 2);
      M.set(def.el, { zIndex: 1 }, t + D / 2);
    }
  }

  N.start = async function () {
    const M = N.M;
    document.body.classList.toggle("guia", N.guia);
    document.body.classList.toggle("render", N.render);
    document.body.classList.toggle("limpio", N.limpio);
    window.addEventListener("resize", fit);
    fit();
    try { await Promise.race([Promise.all(["800 50px Nunito", "700 50px Nunito", "400 30px Nunito", "700 50px Fraunces"].map((f) => document.fonts.load(f, "Aáñ¿"))), new Promise((r) => setTimeout(r, 4000))]); } catch (e) { /* fuentes del sistema */ }

    // grabaciones del equipo y mapa de tiempo por escena (js/medios.js, generado)
    const tramo = (nudos, x, de, a) => {
      if (!nudos || x <= 0) return x;
      for (let i = 1; i < nudos.length; i++) {
        const p = nudos[i - 1], q = nudos[i];
        if (x <= q[de]) return q[de] > p[de] ? p[a] + ((x - p[de]) * (q[a] - p[a])) / (q[de] - p[de]) : p[a];
      }
      return nudos[nudos.length - 1][a] + (x - nudos[nudos.length - 1][de]);
    };
    if (window.MEDIOS) {
      G.medios = MEDIOS.medios;
      G.escenas.forEach((e) => { const me = MEDIOS.escenas.find((x) => x.id === e.id); if (me) { e.durOrig = e.dur; e.dur = me.dur; e.voz = me.voz; e.nudos = me.nudos; } });
    }
    let t = 0;
    G.escenas.forEach((e) => { e.t0 = t; e.t1 = t + e.dur; t += e.dur; });
    G.dur = t;
    const byId = Object.fromEntries(G.escenas.map((e) => [e.id, e]));
    const lista = G.escenas.map((g) => N.scenes.find((d) => d.id === g.id)).filter(Boolean);
    for (const def of lista) {
      const g = byId[def.id];
      def.t0 = g.t0; def.t1 = g.t1; def.T = g.durOrig || g.dur;
      def.warp = (x) => tramo(g.nudos, x, 0, 1);   // tiempo original de la escena → tiempo del video
      def.inv = (x) => tramo(g.nudos, x, 1, 0);    // tiempo del video → tiempo original
      N._cur = def;
      def.el = h("div", { class: "escena", id: "e-" + def.id }, mundo);
      def.cam = h("div", { class: "cam" }, def.el);
      def.tl = gsap.timeline();
      if (def.prep) await def.prep();
      def.build(def.cam, def.tl, def.T, def);
      // la cámara respira: nunca hay un cuadro quieto
      if (!def.quieto) def.tl.fromTo(def.cam, { scale: 1.0 }, { scale: 1.045, duration: def.T, ease: "sine.inOut" }, 0);
      // la escena corre en su reloj original, deformado para quitar silencios
      def.tl.pause();
      const px = { v: 0 }, D = def.t1 - def.t0;
      M.fromTo(px, { v: 0 }, { v: D, duration: D, ease: "none", immediateRender: false, onUpdate: () => def.tl.time(def.inv(px.v)) }, def.t0);
    }
    N._cur = null;
    lista.forEach((def, i) => { const prev = lista[i - 1]; if (!prev) gsap.set(def.el, { autoAlpha: 1 }); else transicion(M, prev, def); });
    M.to({}, { duration: 0.001 }, G.dur);
    document.getElementById("loading").remove();
    const todosV = N.videos.flatMap((V) => V.grupo.map((c) => c.v));
    await Promise.race([Promise.all(todosV.map((v) => (v.readyState >= 2 ? 1 : new Promise((r) => { v.addEventListener("loadeddata", r, { once: true }); v.addEventListener("error", r, { once: true }); })))), new Promise((r) => setTimeout(r, 15000))]);

    async function syncAll(tt) { await N.syncVideos(tt, N.render || N.M.paused()); for (const def of lista) if (def.sync && tt >= def.t0 - 1 && tt <= def.t1 + 1) await def.sync(def.inv(tt - def.t0)); }
    M.eventCallback("onUpdate", () => { guide(M.time()); if (!N.render) syncAll(M.time()); });

    const marks = document.querySelector("#barra .marks");
    G.escenas.slice(1).forEach((e) => h("i", { style: { left: (e.t0 / G.dur) * 100 + "%" } }, marks));
    document.getElementById("barra").addEventListener("click", (ev) => M.seek((ev.clientX / window.innerWidth) * G.dur, false));
    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === " ") { e.preventDefault(); M.paused() ? M.play() : M.pause(); }
      else if (k === "ArrowRight") M.seek(Math.min(G.dur, M.time() + (e.shiftKey ? 10 : 2)), false);
      else if (k === "ArrowLeft") M.seek(Math.max(0, M.time() - (e.shiftKey ? 10 : 2)), false);
      else if (/^[1-9]$/.test(k)) { const sc = G.escenas[+k - 1]; if (sc) M.seek(sc.t0 + 0.01, false); }
      else if (k === "g" || k === "G") { N.guia = !N.guia; document.body.classList.toggle("guia", N.guia); }
      else if (k === "f" || k === "F") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    });

    window.__M = M; window.__dur = G.dur; window.__fps = G.fps;
    window.__cameos = () => JSON.stringify(N.cameos);
    window.__seek = async (tt) => { tt = Math.min(tt, G.dur); M.seek(tt, false); guide(tt); await syncAll(tt); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))); };
    const m = /[#&]t=([\d.]+)/.exec(location.hash);
    M.seek(m ? +m[1] : 0, false);
    guide(M.time());
    await syncAll(M.time());
    window.__ready = true;
    if (!N.render && !m) M.play();
  };

  window.N = N;
})();
