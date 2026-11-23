/* Prepara las grabaciones del equipo (lista en js/guion.js → medios) desde video/grabaciones/.
   Video → media/<src>.mp4 (30 fps, máx. 1280 px, todos los cuadros clave para buscar exacto)
   Audio → render/medios/<src>.wav (mono 48 kHz con filtro de graves; el volumen se empareja en mezcla.mjs)
   Uso: node tools/preparar_medios.mjs [--todo] */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { mkdirSync, readFileSync, existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function("window", readFileSync(join(here, "..", "js", "guion.js"), "utf8"))(globalThis.window);
new Function("window", readFileSync(join(here, "..", "js", "medios.js"), "utf8"))(globalThis.window);
const G = globalThis.window.GUION;
G.medios = globalThis.window.MEDIOS.medios;
const grab = resolve(here, "..", "grabaciones");
const vidDir = resolve(here, "..", "media");
const audDir = resolve(here, "..", "render", "medios");
const todo = process.argv.includes("--todo");
const hechos = new Set();
for (const m of G.medios) {
  const orig = join(grab, m.orig);
  if (!existsSync(orig)) { console.log("FALTA", orig); process.exit(1); }
  for (const tipo of ["video", "audio"]) {
    if (!m[tipo] || hechos.has(tipo + m.src)) continue;
    hechos.add(tipo + m.src);
    const out = tipo === "video" ? join(vidDir, m.src + ".mp4") : join(audDir, m.src + ".wav");
    if (existsSync(out) && !todo) continue;
    mkdirSync(dirname(out), { recursive: true });
    const args = tipo === "video"
      ? ["-i", orig, "-an", "-vf", "fps=30,scale=min(1280\\,iw):-2,format=yuv420p", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-g", "1", "-movflags", "+faststart", out]
      : ["-i", orig, "-vn", "-ac", "1", "-ar", "48000", "-af", "highpass=f=80,afftdn=nr=12:nf=-30:tn=1", out];
    const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
    if (tipo === "video") {
      // cuadros sueltos para el render (cada captura muestra el cuadro exacto, sin esperar al decodificador del navegador)
      const dir = join(vidDir, m.src);
      mkdirSync(dir, { recursive: true });
      spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", out, "-vf", "scale='min(960,iw)':-2", "-q:v", "3", join(dir, "f%04d.jpg")], { stdio: "inherit" });
    }
    console.log((r.status === 0 ? "ok   " : "ERROR ") + tipo.padEnd(6) + m.src);
  }
}
