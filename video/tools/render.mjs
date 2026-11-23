/* Exporta la animación a MP4, cuadro por cuadro (determinista: no depende de la velocidad de la máquina).
   Uso:
     node tools/render.mjs --final --salida=X.mp4            → video completo (subtítulos sí)
     node tools/render.mjs --final --hilos=4 --salida=X.mp4  → en paralelo: 4 tramos con su propio Chrome, se unen sin recodificar
     node tools/render.mjs --final --subs=0                  → sin subtítulos
     node tools/render.mjs --desde=131 --hasta=191           → solo un tramo (segundos)
   Necesita Node 22+, Google Chrome y ffmpeg en el PATH. */
import { launch } from "./cdp.mjs";
import { servidor } from "./servidor.mjs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const opt = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? "1"]; }));
const final = opt.final === "1";
const outDir = resolve(here, "..", "render");
mkdirSync(outDir, { recursive: true });
const pagina = opt.pagina || "index.html";
const srv = await servidor(5601);
const out = resolve(outDir, opt.salida || (final ? "Animacion_limpia.mp4" : "Animatic_guia.mp4"));
const q = ["render=1", `guia=${opt.guia ?? (final ? 0 : 1)}`, `subs=${opt.subs ?? 1}`, `limpio=${opt.limpio ?? 0}`].join("&");
const url = `http://127.0.0.1:5601/video/${pagina}?` + q;
const hilos = Math.max(1, +(opt.hilos || 1));
const t00 = Date.now();

/* Un tramo: cuadros [i0, i1) → un MP4 */
async function tramo(i0, i1, salida, puerto, etiqueta, retraso = 0) {
  await new Promise((r) => setTimeout(r, retraso));
  // si la página no termina de cargar (servidor saturado), se reintenta
  let b;
  for (let intento = 1; ; intento++) {
    b = await launch(url, { port: puerto });
    try { await b.waitFor("window.__ready === true", 90000); break; }
    catch (e) {
      console.log(`${etiqueta} no cargó (intento ${intento}): ${[...new Set(b.errors)].join(" | ").slice(0, 160)}`);
      await b.close();
      if (intento >= 3) throw e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  try {
    const fps = +(opt.fps || (await b.eval("window.__fps")));
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", opt.preset || "fast", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", String(fps), salida], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => { ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg salió con código " + c)))); });
    const n = i1 - i0;
    for (let i = 0; i < n; i++) {
      await b.eval(`window.__seek(${((i0 + i) / fps).toFixed(4)})`);
      const buf = await b.shot({ quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % (fps * 10) === 0) console.log(`${etiqueta} ${Math.round((i / n) * 100)}% · cuadro ${i}/${n} · ${Math.round((Date.now() - t00) / 1000)} s`);
    }
    ff.stdin.end();
    await done;
  } finally {
    if (b.errors.length) console.log(`${etiqueta} ERRORES DE LA PÁGINA:\n` + [...new Set(b.errors)].join("\n"));
    await b.close();
  }
}

try {
  // datos del video y marcos de los cameos
  const b = await launch(url, { port: +(opt.puerto || 9333) });
  let total, fps;
  try {
    await b.waitFor("window.__ready === true", 90000);
    total = await b.eval("window.__dur");
    fps = +(opt.fps || (await b.eval("window.__fps")));
    if (!opt.desde) writeFileSync(join(outDir, "cameos.json"), JSON.stringify(JSON.parse(await b.eval("window.__cameos()")), null, 2));
  } finally { await b.close(); }
  const f0 = Math.round(+(opt.desde || 0) * fps), f1 = Math.round(Math.min(total, +(opt.hasta || total)) * fps);

  if (hilos === 1) {
    await tramo(f0, f1, out, +(opt.puerto || 9333) + 1, "");
  } else {
    // tramos iguales en paralelo, cada uno con su Chrome y su puerto
    const partes = [];
    for (let k = 0; k < hilos; k++) {
      const a = f0 + Math.round(((f1 - f0) * k) / hilos), z = f0 + Math.round(((f1 - f0) * (k + 1)) / hilos);
      partes.push({ a, z, f: join(outDir, `_parte_${k}.mp4`), puerto: 9400 + k * 3 });
    }
    await Promise.all(partes.map((p, k) => tramo(p.a, p.z, p.f, p.puerto, `[${k + 1}/${hilos}]`, k * 2500)));
    // unir sin recodificar (mismos parámetros en todos los tramos)
    const lista = join(outDir, "_partes.txt");
    writeFileSync(lista, partes.map((p) => `file '${p.f.replace(/\\/g, "/")}'`).join("\n"));
    await new Promise((res, rej) => spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", "-movflags", "+faststart", out], { stdio: "inherit" }).on("close", (c) => (c === 0 ? res() : rej(new Error("concat " + c)))));
    partes.forEach((p) => rmSync(p.f, { force: true }));
    rmSync(lista, { force: true });
  }
  console.log(`Listo: ${out} · ${Math.round((Date.now() - t00) / 1000)} s`);
} finally {
  if (srv) srv.kill();
}
