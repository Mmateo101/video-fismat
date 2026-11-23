/* Sismo o ruido · explorador de 20 sismos de México.
   Los datos vienen de analisis/sismos_fourier.py (un JSON por sismo en data/). */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const COL = { tinta: "#1D2440", sismo: "#E4572E", ruido: "#2E86AB", sol: "#F6AE2D", gris: "#8A8FA3", papel: "#FBF6EC", rejilla: "#EEF0F5" };
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  // Proyección del mapa (equirectangular, ajustada a la silueta de MEXICO)
  const X = (lon) => 3718.3 + 31.38 * lon;
  const Y = (lat) => 10.7 + (32.53 - lat) * 33.96;
  const CU = { lat: 19.3297, lon: -99.1781 };
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const fecha = (iso) => { const [a, m, d] = iso.slice(0, 10).split("-"); return `${+d} de ${MESES[+m - 1]} de ${a}`; };
  const cache = {};
  let indice = [], actual = null, separado = false;

  /* ---------------- mapa ---------------- */
  const mapa = $("#mapa");
  function dibujarMapa() {
    const g = el("g", {}, mapa);
    MEXICO.states.forEach((s) => el("path", { d: s.d, class: "estado" + (s.id === "MX-CMX" || s.id === "MX-DIF" ? " cdmx" : "") }, g));
    const rayo = el("path", { class: "rayo", id: "rayo" }, mapa);
    const gs = el("g", {}, mapa);
    indice.forEach((q) => {
      const r = 4 + (q.mag - 6.7) * 9;
      const s = el("g", { class: "sismo", transform: `translate(${X(q.lon)},${Y(q.lat)})`, "data-id": q.id }, gs);
      el("circle", { class: "o", r }, s);
      el("circle", { class: "n", r }, s);
      s.addEventListener("click", () => elegir(q.id, true));
      s.addEventListener("mouseenter", () => tip(q, true));
      s.addEventListener("mouseleave", () => tip(q, false));
    });
    const est = el("g", { class: "estacion", transform: `translate(${X(CU.lon)},${Y(CU.lat)})` }, mapa);
    el("path", { d: "M0,-15 L13,9 L-13,9 Z" }, est);
    const t = el("text", { x: 18, y: 6, "font-size": 20, "font-weight": 800, fill: COL.tinta, "font-family": "Nunito" }, est);
    t.textContent = "CU";
  }
  function tip(q, on) {
    const box = $("#tip"), r = mapa.getBoundingClientRect(), k = r.width / 1000;
    box.textContent = `${q.nombre} · M${q.mag.toFixed(1)}`;
    box.style.left = X(q.lon) * k + "px";
    box.style.top = Y(q.lat) * k + "px";
    box.style.opacity = on ? 1 : 0;
  }
  let pulso;
  function marcarMapa(q) {
    mapa.querySelectorAll(".sismo").forEach((s) => s.classList.toggle("activo", s.dataset.id === q.id));
    const s = mapa.querySelector(`.sismo[data-id="${q.id}"]`);
    s.parentNode.appendChild(s);
    const x0 = X(q.lon), y0 = Y(q.lat), x1 = X(CU.lon), y1 = Y(CU.lat);
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - Math.hypot(x1 - x0, y1 - y0) * 0.25;
    const rayo = $("#rayo");
    rayo.setAttribute("d", `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`);
    const L = rayo.getTotalLength();
    gsap.fromTo(rayo, { strokeDasharray: `6 7`, strokeDashoffset: L, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.55, duration: 1.2, ease: "power2.out" });
    if (pulso) pulso.kill();
    const o = s.querySelector("circle.o"), r = +o.getAttribute("r");
    pulso = gsap.fromTo(o, { attr: { r }, opacity: 0.9 }, { attr: { r: r * 4 }, opacity: 0, duration: 1.6, repeat: -1, ease: "power1.out" });
  }

  /* ---------------- lista ---------------- */
  function dibujarLista() {
    const l = $("#lista");
    indice.forEach((q) => {
      const b = document.createElement("button");
      b.className = "chip"; b.dataset.id = q.id;
      b.innerHTML = `${q.nombre.replace(/ \d{4}$/, "")}<small>${q.fecha.slice(0, 4)}</small>`;
      b.addEventListener("click", () => elegir(q.id, true));
      l.appendChild(b);
    });
  }

  /* ---------------- lienzos ---------------- */
  function lienzo(c) {
    const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr));
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { x, w: r.width, h: r.height };
  }
  function trazo(c, datos, color, escala, avance, cabeza) {
    const { x, w, h } = lienzo(c);
    const n = datos.length, mid = h / 2 + 8, A = h / 2 - 14;
    // línea de la onda P
    const iP = Math.round((0 - actual.t0) / actual.dt_web);
    x.strokeStyle = COL.rejilla; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
    x.setLineDash([4, 5]); x.strokeStyle = COL.gris;
    x.beginPath(); x.moveTo((iP / (n - 1)) * w, 14); x.lineTo((iP / (n - 1)) * w, h); x.stroke(); x.setLineDash([]);
    const m = Math.max(2, Math.round(n * avance));
    x.strokeStyle = color; x.lineWidth = 1.1; x.lineJoin = "round";
    x.beginPath();
    for (let i = 0; i < m; i++) { const px = (i / (n - 1)) * w, py = mid - Math.max(-1.05, Math.min(1.05, datos[i] / escala)) * A; i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
    if (cabeza != null) { x.fillStyle = COL.sol; x.fillRect(cabeza * w - 1.5, 10, 3, h - 10); }
  }

  const ondas = { crudo: $('.onda[data-k="crudo"]'), sismo: $('.onda[data-k="sismo"]'), ruido: $('.onda[data-k="ruido"]') };
  const estado = { crudo: 1, sismo: 1, ruido: 1, cabeza: {} };
  let escalaR = 1, zoomR = 1;
  function pintarOndas() {
    if (!actual) return;
    const esc = Math.max(...actual.crudo.map(Math.abs));
    trazo(ondas.crudo.querySelector("canvas"), actual.crudo, COL.tinta, esc, estado.crudo, estado.cabeza.aud_crudo);
    trazo(ondas.sismo.querySelector("canvas"), actual.sismo, COL.sismo, esc, estado.sismo, estado.cabeza.aud_sismo);
    trazo(ondas.ruido.querySelector("canvas"), actual.ruido, COL.ruido, escalaR, estado.ruido, estado.cabeza.aud_ruido);
  }
  function layoutOndas(anim) {
    const H = $("#ondas").clientHeight, h = ondas.crudo.clientHeight;
    const d = anim ? 0.8 : 0;
    if (separado) {
      gsap.to(ondas.crudo, { top: 0, opacity: 1, duration: d, ease: "power3.inOut" });
      gsap.fromTo(ondas.sismo, { top: 0 }, { top: (H - h) / 2, opacity: 1, duration: d, ease: "power3.inOut" });
      gsap.fromTo(ondas.ruido, { top: 0 }, { top: H - h, opacity: 1, duration: d, ease: "power3.inOut", delay: anim ? 0.12 : 0 });
    } else {
      gsap.to(ondas.crudo, { top: (H - h) / 2, opacity: 1, duration: d, ease: "power3.inOut" });
      gsap.to([ondas.sismo, ondas.ruido], { top: (H - h) / 2, opacity: 0, duration: d * 0.8, ease: "power3.inOut" });
    }
    $("#b-separar").textContent = separado ? "Unir" : "Separar";
    $("#b-separar").classList.toggle("unir", separado);
  }
  $("#b-separar").addEventListener("click", () => {
    separado = !separado;
    layoutOndas(true);
    if (separado) {
      estado.sismo = 0; estado.ruido = 0;
      gsap.to(estado, { sismo: 1, duration: 1.4, ease: "power2.out", delay: 0.3, onUpdate: pintarOndas });
      gsap.to(estado, { ruido: 1, duration: 1.4, ease: "power2.out", delay: 0.45, onUpdate: pintarOndas });
    }
  });

  /* ---------------- espectro ---------------- */
  function pintarEspectro(av = 1) {
    const c = $("#espectro"), { x, w, h } = lienzo(c);
    const f = actual.esp_f, S = actual.esp_sismo, R = actual.esp_ruido;
    const lf0 = Math.log10(0.02), lf1 = Math.log10(8);
    const todos = S.concat(R).filter((v) => v > 0);
    const ymax = Math.log10(Math.max(...todos)) + 0.3, ymin = Math.log10(Math.min(...R.filter((v) => v > 0))) - 0.6;
    const pad = { l: 8, r: 8, t: 26, b: 26 };
    const px = (v) => pad.l + ((Math.log10(v) - lf0) / (lf1 - lf0)) * (w - pad.l - pad.r);
    const py = (v) => pad.t + (1 - (Math.log10(Math.max(v, 1e-9)) - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
    // bandas: mar y ciudad
    const banda = (a, b, txt, col) => {
      x.fillStyle = col; x.fillRect(px(a), pad.t - 22, px(b) - px(a), h - pad.t - pad.b + 22);
      x.fillStyle = COL.tinta; x.font = "800 12px Nunito"; x.textAlign = "center"; x.fillText(txt, (px(a) + px(b)) / 2, pad.t - 8);
    };
    banda(0.1, 0.35, "olas del mar", "rgba(46,134,171,.10)");
    banda(1, 8, "ciudad", "rgba(123,94,167,.09)");
    const area = (A, col, alfa) => {
      const m = Math.max(2, Math.round(f.length * av));
      x.beginPath(); x.moveTo(px(f[0]), h - pad.b);
      for (let i = 0; i < m; i++) x.lineTo(px(f[i]), py(A[i]));
      x.lineTo(px(f[m - 1]), h - pad.b); x.closePath();
      x.globalAlpha = alfa; x.fillStyle = col; x.fill(); x.globalAlpha = 1;
      x.beginPath(); for (let i = 0; i < m; i++) { i ? x.lineTo(px(f[i]), py(A[i])) : x.moveTo(px(f[i]), py(A[i])); }
      x.strokeStyle = col; x.lineWidth = 2; x.stroke();
    };
    area(S, COL.sismo, 0.22);
    area(R, COL.ruido, 0.3);
    x.fillStyle = COL.gris; x.font = "700 12px Nunito";
    x.textAlign = "left"; x.fillText("lento", pad.l, h - 6);
    x.textAlign = "right"; x.fillText("rápido", w - pad.r, h - 6);
    x.textAlign = "center";
    [0.1, 1].forEach((v) => x.fillText(v + " Hz", px(v), h - 6));
  }

  /* ---------------- espectrograma ---------------- */
  const PALETA = [[29, 36, 64], [58, 46, 110], [123, 94, 167], [228, 87, 46], [246, 174, 45], [255, 241, 200]];
  function color(v) { // v de 0 a 1
    const p = Math.max(0, Math.min(1, v)) * (PALETA.length - 1), i = Math.min(PALETA.length - 2, Math.floor(p)), r = p - i;
    return PALETA[i].map((c, k) => Math.round(c + (PALETA[i + 1][k] - c) * r));
  }
  let VMIN = -100, VMAX = 0;
  function rangoSg(M) { const v = M.flat().sort((a, b) => a - b); VMIN = v[Math.floor(v.length * 0.03)]; VMAX = v[v.length - 1]; }
  function pintarSg(c, M) {
    const nf = M.length, nt = M[0].length;
    const off = document.createElement("canvas"); off.width = nt; off.height = nf;
    const ox = off.getContext("2d"), img = ox.createImageData(nt, nf);
    for (let i = 0; i < nf; i++) for (let j = 0; j < nt; j++) {
      const [r, g, b] = color((M[i][j] - VMIN) / (VMAX - VMIN)), k = ((nf - 1 - i) * nt + j) * 4;
      img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
    }
    ox.putImageData(img, 0, 0);
    const { x, w, h } = lienzo(c);
    x.imageSmoothingEnabled = true; x.drawImage(off, 0, 0, w, h);
  }
  let vista = 0;
  function verSg(v, anim = true) {
    vista = v;
    document.querySelectorAll("#seg button").forEach((b) => b.classList.toggle("on", +b.dataset.v === v));
    gsap.to("#sg-despues", { opacity: v, duration: anim ? 0.7 : 0, ease: "power2.inOut" });
  }
  document.querySelectorAll("#seg button").forEach((b) => b.addEventListener("click", () => verSg(+b.dataset.v)));

  /* ---------------- cifras ---------------- */
  function bonito(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + " millones";
    if (v >= 1e3) return Math.round(v / 1e3) + " mil";
    return Math.round(v).toString();
  }
  function cifras(q) {
    const claro = Math.pow(10, (q.res.snr_despues - q.res.snr_antes) / 10);
    const o = { a: 0, b: 0, c: 0 };
    gsap.to(o, { a: claro, b: q.res.R, c: q.res.T_micro, duration: 1.4, ease: "power2.out", onUpdate() {
      $("#c-claro").textContent = Math.round(o.a);
      $("#c-energia").textContent = bonito(o.b);
      $("#c-mar").textContent = o.c.toFixed(1);
    } });
  }

  /* ---------------- audio: el sismo acelerado 400 veces ---------------- */
  let ctx, fuente, sonando = null;
  function decodificar(b64) {
    const bin = atob(b64), n = bin.length / 2, out = new Float32Array(n);
    for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v > 32767) v -= 65536; out[i] = v / 32768; }
    return out;
  }
  function detener() { if (fuente) { try { fuente.stop(); } catch (e) { /* ya paró */ } } document.querySelectorAll(".oir").forEach((b) => b.classList.remove("sonando")); sonando = null; estado.cabeza = {}; pintarOndas(); }
  document.querySelectorAll(".oir").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.a;
    if (sonando === k) { detener(); return; }
    detener();
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const datos = decodificar(actual[k]);
    // el ruido es mucho más débil: se sube su volumen para poder oírlo
    let m = 0; for (const v of datos) m = Math.max(m, Math.abs(v));
    const g = 0.9 / (m || 1); for (let i = 0; i < datos.length; i++) datos[i] *= g;
    const fs = 8000, buf = ctx.createBuffer(1, datos.length, fs);
    buf.copyToChannel(datos, 0);
    fuente = ctx.createBufferSource(); fuente.buffer = buf; fuente.connect(ctx.destination);
    const t0 = ctx.currentTime, dur = datos.length / fs;
    fuente.start(); sonando = k; b.classList.add("sonando");
    fuente.onended = () => { if (sonando === k) detener(); };
    (function cuadro() { if (sonando !== k) return; estado.cabeza = { [k]: Math.min(1, (ctx.currentTime - t0) / dur) }; pintarOndas(); requestAnimationFrame(cuadro); })();
  }));

  /* ---------------- elegir un sismo ---------------- */
  async function cargar(id) {
    if (!cache[id]) cache[id] = await (await fetch(`data/${id}.json`)).json();
    return cache[id];
  }
  async function elegir(id, desplazar) {
    const q = await cargar(id);
    actual = q; detener();
    if (!/^#(video|reporte|como|explorar)$/.test(location.hash)) history.replaceState(null, "", "#" + id);
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c.dataset.id === id));
    marcarMapa(q);
    $("#f-region").textContent = q.region;
    $("#f-nombre").textContent = q.nombre;
    $("#f-fecha").textContent = fecha(q.hora);
    $("#f-mag").textContent = q.mag.toFixed(1);
    $("#f-dist").textContent = Math.round(q.dist_km).toLocaleString("es-MX");
    $("#f-prof").textContent = Math.round(q.prof_km);
    // escala del ruido: se amplifica para que se vea
    const mc = Math.max(...q.crudo.map(Math.abs)), mr = Math.max(...q.ruido.map(Math.abs));
    const pasos = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
    zoomR = pasos.filter((p) => p <= mc / mr).pop() || 1;
    escalaR = mc / zoomR;
    $("#f-zoom").textContent = zoomR > 1 ? `amplificado ${zoomR.toLocaleString("es-MX")} veces` : "";
    gsap.fromTo(".ficha-cab > *", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
    estado.crudo = 0; estado.sismo = separado ? 0 : 1; estado.ruido = separado ? 0 : 1;
    layoutOndas(false);
    gsap.to(estado, { crudo: 1, sismo: 1, ruido: 1, duration: 1.6, ease: "power2.out", onUpdate: pintarOndas });
    const e = { v: 0 };
    gsap.to(e, { v: 1, duration: 1.4, ease: "power2.out", delay: 0.2, onUpdate: () => pintarEspectro(e.v) });
    rangoSg(q.sg_antes); pintarSg($("#sg-antes"), q.sg_antes); pintarSg($("#sg-despues"), q.sg_despues);
    verSg(0, false);
    gsap.delayedCall(1.6, () => verSg(1));
    cifras(q);
    if (desplazar && window.innerWidth < 900) $("#ficha").scrollIntoView({ behavior: "smooth" });
  }

  window.addEventListener("resize", () => { if (!actual) return; pintarOndas(); pintarEspectro(); pintarSg($("#sg-antes"), actual.sg_antes); pintarSg($("#sg-despues"), actual.sg_despues); layoutOndas(false); });

  /* Modo video (?video=1): el video controla el reloj de GSAP y el audio simulado */
  window.APP = {
    elegir, cargar,
    separar: () => $("#b-separar").click(),
    verSg: (v) => verSg(v),
    cabeza(k, r) { document.querySelectorAll(".oir").forEach((b) => b.classList.toggle("sonando", b.dataset.a === k && r != null)); estado.cabeza = r == null ? {} : { [k]: r }; pintarOndas(); },
  };
  if (/video=1/.test(location.search)) document.documentElement.style.scrollBehavior = "auto";
  // el video y el PDF solo se cargan fuera del modo video (dentro del video pesan y lo congelan)
  else document.querySelectorAll("[data-src]").forEach((e) => { e.src = e.dataset.src; });

  (async function inicio() {
    indice = await (await fetch("data/indice.json")).json();
    indice.sort((a, b) => a.fecha.localeCompare(b.fecha));
    dibujarMapa(); dibujarLista();
    gsap.from("#mapa .estado", { opacity: 0, y: 8, duration: 0.6, stagger: 0.015, ease: "power2.out" });
    gsap.from("#mapa .sismo", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.05, delay: 0.5, ease: "back.out(2)" });
    const ini = location.hash.slice(1);
    await elegir(indice.some((q) => q.id === ini) ? ini : "us2000ar20");
    const sec = document.getElementById(ini);
    if (sec) setTimeout(() => sec.scrollIntoView(), 300);
  })();
})();
