/* Pista de audio con las grabaciones del equipo (GUION.medios con audio: true).
   Cada fragmento se lleva a -20 LUFS, se comprime suave y la pista final se normaliza a -16 LUFS.
   Música opcional: pon render/musica.mp3 y entra a -30 LUFS debajo de las voces.
   Uso: node tools/mezcla.mjs [--video=Video.mp4]   (el video debe estar en render/) */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync, existsSync, rmSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function("window", readFileSync(join(here, "..", "js", "guion.js"), "utf8"))(globalThis.window);
const G = globalThis.window.GUION;
let t = 0;
const t0 = {};
G.escenas.forEach((e) => { t0[e.id] = t; t += e.dur; });
const DUR = t;
const outDir = resolve(here, "..", "render"), medDir = join(outDir, "medios");
const ff = (a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8" });
const lufs = (f, ss = 0, hasta = null) => {
  const a = ["-ss", String(ss)];
  if (hasta != null) a.push("-to", String(hasta));
  const r = ff([...a, "-i", f, "-af", "ebur128=framelog=quiet", "-f", "null", "-"]);
  const m = /I:\s+(-?[\d.]+) LUFS/.exec(r.stderr.split("Summary:").pop());
  return m ? +m[1] : -70;
};
const piezas = (G.medios || []).filter((m) => m.audio).map((m) => ({ f: join(medDir, m.src + ".wav"), ss: m.ss, hasta: m.hasta, abs: t0[m.escena] + m.at, meta: -20 }));
const musica = join(outDir, "musica.mp3");
if (existsSync(musica)) piezas.push({ f: musica, ss: 0, hasta: DUR, abs: 0, meta: -30 });
if (!piezas.length) { console.log("No hay grabaciones con audio en GUION.medios todavía."); process.exit(0); }
const inputs = [], filtros = [];
piezas.forEach((p, k) => {
  if (!existsSync(p.f)) { console.log("FALTA", p.f, "→ corre node tools/preparar_medios.mjs"); process.exit(1); }
  const g = Math.max(-20, Math.min(20, p.meta - lufs(p.f, p.ss, p.hasta)));
  inputs.push("-i", p.f);
  filtros.push(`[${k}:a]aresample=48000,aformat=channel_layouts=mono,atrim=start=${p.ss}:end=${p.hasta},asetpts=PTS-STARTPTS,afade=t=in:d=0.06,afade=t=out:st=${Math.max(0, p.hasta - p.ss - 0.15)}:d=0.15,volume=${g.toFixed(2)}dB,adelay=${Math.round(p.abs * 1000)}:all=1[a${k}]`);
});
const crudo = join(outDir, "audio_crudo.wav"), wav = join(outDir, "audio_mezcla.wav");
const mix = filtros.join(";") + ";" + piezas.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${piezas.length}:normalize=0,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=220,apad=whole_dur=${DUR}[m]`;
let r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", mix, "-map", "[m]", "-ar", "48000", "-t", String(DUR), crudo], { stdio: "inherit" });
if (r.status !== 0) process.exit(1);
const med = ff(["-i", crudo, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"]).stderr;
const j = JSON.parse(med.slice(med.lastIndexOf("{"), med.lastIndexOf("}") + 1));
spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", crudo, "-af", `loudnorm=I=-16:TP=-1.5:LRA=7:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`, "-ar", "48000", wav], { stdio: "inherit" });
rmSync(crudo, { force: true });
console.log("Pista:", wav);
const v = process.argv.find((a) => a.startsWith("--video="));
if (v) {
  const vid = resolve(outDir, v.split("=")[1]), out = vid.replace(/\.mp4$/, "_con_audio.mp4");
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", vid, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], { stdio: "inherit" });
  console.log("Video con audio:", out);
}
