/* Genera guion/Guion_por_persona.md a partir de js/guion.js (mismos textos y tiempos que el video).
   Uso: node tools/guion_md.mjs */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function("window", readFileSync(join(here, "..", "js", "guion.js"), "utf8"))(globalThis.window);
const G = globalThis.window.GUION;
let t = 0;
G.escenas.forEach((e) => { e.t0 = t; t += e.dur; });
const DUR = t;
const mmss = (x) => `${Math.floor(x / 60)}:${(x % 60).toFixed(1).padStart(4, "0")}`;
const cameos = JSON.parse(readFileSync(resolve(here, "..", "render", "cameos.json"), "utf8"));

let md = `# Guion por persona · video «Sismo o ruido»\n\n`;
md += `Duración total ${mmss(DUR)} (máximo permitido 5:00). Se genera solo desde \`video/js/guion.js\`.\n\n`;
md += `## Cómo grabar\n\n`;
md += `- Graba cada línea en un archivo aparte. Nómbralo como dice la columna «Archivo».\n`;
md += `- **A cámara** es video horizontal (16:9), de frente, con luz de ventana y fondo liso. Deja 1 s de silencio antes y después.\n`;
md += `- **Voz en off** es solo audio. Graba en un cuarto con cortinas o ropa, a un palmo del celular, sin eco.\n`;
md += `- **Saludo** y **despedida** son clips cortos de 3 a 4 s, sin hablar, saludando a la cámara. Video cuadrado o vertical sirve.\n`;
md += `- Di la línea en el tiempo que marca «Dura». Si te pasas, dilo un poco más rápido. No cambies las palabras sin avisar, porque los subtítulos y las animaciones van con ese texto.\n`;
md += `- Manda todo a Mateo. Él pone los archivos en \`video/grabaciones/<Nombre>/\` y los registra en \`GUION.medios\`.\n\n`;

for (const quien of G.equipo) {
  md += `## ${quien}\n\n| # | Escena | Entra | Dura | Tipo | Archivo | Qué se dice |\n|---|---|---|---|---|---|---|\n`;
  let n = 0;
  const filas = [];
  cameos.filter((c) => c.quien === quien && c.tipo !== "Cameo").forEach((c) => filas.push({ t: c.t0, esc: G.escenas.find((e) => c.t0 >= e.t0 && c.t0 < e.t0 + e.dur).nombre, dura: Math.min(4, c.t1 - c.t0), tipo: c.tipo, x: "(sin hablar, saluda o se despide)" }));
  G.escenas.forEach((e) => e.voz.forEach((v) => {
    const de = v.q === "voz" ? v.rec : v.q;
    if (de !== quien) return;
    filas.push({ t: e.t0 + v.t0, esc: e.nombre, dura: v.t1 - v.t0, tipo: v.q === "voz" ? "Voz en off" : "A cámara", x: v.x });
  }));
  filas.sort((a, b) => a.t - b.t).forEach((f) => {
    n++;
    const arch = `${String(n).padStart(2, "0")}_${f.tipo === "A cámara" ? "cameo" : f.tipo === "Voz en off" ? "voz" : f.tipo.toLowerCase()}.${f.tipo === "Voz en off" ? "m4a" : "mp4"}`;
    md += `| ${n} | ${f.esc} | ${mmss(f.t)} | ${f.dura.toFixed(1)} s | ${f.tipo} | \`${arch}\` | ${f.x} |\n`;
  });
  md += `\n`;
}
md += `## Guion completo en orden\n\n`;
G.escenas.forEach((e) => {
  md += `### ${e.nombre} · ${mmss(e.t0)} a ${mmss(e.t0 + e.dur)}\n\n`;
  e.voz.forEach((v) => (md += `- **${v.q === "voz" ? v.rec + " (voz en off)" : v.q + " (a cámara)"}** · ${mmss(e.t0 + v.t0)} · ${v.x}\n`));
  md += `\n`;
});
mkdirSync(resolve(here, "..", "..", "guion"), { recursive: true });
writeFileSync(resolve(here, "..", "..", "guion", "Guion_por_persona.md"), md);
console.log("Listo: guion/Guion_por_persona.md");
