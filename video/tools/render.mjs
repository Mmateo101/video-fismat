/* Exporta la animación a MP4, cuadro por cuadro (determinista: no depende de la velocidad de la máquina).
   Uso:
     node tools/render.mjs                         → ../render/Animatic_guia.mp4 (con rótulos de cameo y reloj)
     node tools/render.mjs --final                 → ../render/Animacion_limpia.mp4 (sin guía; subtítulos sí)
     node tools/render.mjs --final --subs=0        → sin subtítulos
     node tools/render.mjs --desde=131 --hasta=191 → solo un tramo (segundos)
     node tools/render.mjs --salida=otro.mp4 --fps=30
   Necesita Node 22+, Google Chrome y ffmpeg en el PATH. */
import { launch } from "./cdp.mjs";
import { spawn } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const opt = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? "1"]; }));
const final = opt.final === "1";
const outDir = resolve(here, "..", "..", "render");
mkdirSync(outDir, { recursive: true });
const pagina = opt.pagina || "nuevo.html";
const out = resolve(outDir, opt.salida || (final ? "Animacion_limpia.mp4" : "Animatic_guia.mp4"));
const q = ["render=1", `guia=${opt.guia ?? (final ? 0 : 1)}`, `subs=${opt.subs ?? 1}`, `limpio=${opt.limpio ?? 0}`].join("&");
const url = pathToFileURL(join(here, "..", pagina)).href + "?" + q;

const b = await launch(url, { port: +(opt.puerto || 9333) });
try {
  await b.waitFor("window.__ready === true", 60000);
  const total = await b.eval("window.__dur");
  const fps = +(opt.fps || (await b.eval("window.__fps")));
  const t0 = +(opt.desde || 0), t1 = Math.min(total, +(opt.hasta || total));
  writeFileSync(join(outDir, "cameos.json"), JSON.stringify(JSON.parse(await b.eval("window.__cameos()")), null, 2));

  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", String(fps), out], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => { ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg salió con código " + c)))); });
  const n = Math.round((t1 - t0) * fps);
  const started = Date.now();
  for (let i = 0; i < n; i++) {
    await b.eval(`window.__seek(${(t0 + i / fps).toFixed(4)})`);
    const buf = await b.shot({ quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % (fps * 10) === 0) console.log(`${Math.round((i / n) * 100)}% · cuadro ${i}/${n} · ${Math.round((Date.now() - started) / 1000)} s`);
  }
  ff.stdin.end();
  await done;
  console.log("Listo:", out);
} finally {
  if (b.errors.length) console.log("ERRORES DE LA PÁGINA:\n" + [...new Set(b.errors)].join("\n"));
  await b.close();
}
