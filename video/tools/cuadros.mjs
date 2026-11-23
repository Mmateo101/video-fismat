/* Captura cuadros sueltos del video para revisarlos.
   Uso: node tools/cuadros.mjs <carpeta de salida> <t1> <t2> ...
   Opciones: --pagina=nuevo.html (por defecto) · --guia=1 · --subs=0 */
import { launch } from "./cdp.mjs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, v] = a.slice(2).split("="); return [k, v ?? "1"]; }));
const pagina = opt.pagina || "nuevo.html";
delete opt.pagina;
const [out, ...times] = args.filter((a) => !a.startsWith("--"));
mkdirSync(out, { recursive: true });
const q = Object.entries(Object.assign({ render: 1 }, opt)).map(([k, v]) => `${k}=${v}`).join("&");
const b = await launch(pathToFileURL(join(here, "..", pagina)).href + "?" + q);
try {
  await b.waitFor("window.__ready === true", 40000);
  for (const t of times) {
    await b.eval(`window.__seek(${t})`);
    writeFileSync(join(out, `t${String(Math.round(+t * 10)).padStart(5, "0")}.jpg`), await b.shot({ quality: 85 }));
  }
} finally {
  if (b.errors.length) console.log("ERRORES:\n" + [...new Set(b.errors)].join("\n"));
  await b.close();
}
