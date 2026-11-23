/* Capturas de la página web para el reporte y el perfil de Expo Ingenierías.
   Uso: node tools/capturas_web.mjs  → ../expo/ (PNG) y frames para el GIF */
import { launch, sleep } from "./cdp.mjs";
import { servidor } from "./servidor.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "..", "expo");
mkdirSync(join(out, "gif"), { recursive: true });
const srv = await servidor(5601);
const b = await launch("http://127.0.0.1:5601/web/public/index.html?video=1#us2000ar20", { width: 1440, height: 900, port: 9334 });
try {
  await b.waitFor("!!(window.APP && document.querySelector('#mapa .sismo'))", 30000);
  await sleep(2500);
  writeFileSync(join(out, "web_portada.png"), await b.shot({ format: "png" }));
  await b.eval("window.scrollTo(0, document.querySelector('#ficha').offsetTop - 70)");
  await sleep(600);
  // GIF: la señal se separa
  await b.eval("window.gsap.globalTimeline.pause(); window.__g0 = window.gsap.globalTimeline.time(); window.APP.separar(); true");
  for (let i = 0; i < 45; i++) {
    await b.eval(`window.gsap.globalTimeline.time(window.__g0 + ${(i / 20).toFixed(3)}); true`);
    await sleep(30);
    writeFileSync(join(out, "gif", `f${String(i).padStart(3, "0")}.png`), await b.shot({ format: "png" }));
  }
  writeFileSync(join(out, "web_ficha.png"), await b.shot({ format: "png" }));
  await b.eval("window.gsap.globalTimeline.time(window.__g0 + 5); window.scrollTo(0, document.querySelector('.dos').offsetTop - 70); true");
  await sleep(500);
  writeFileSync(join(out, "web_frecuencias.png"), await b.shot({ format: "png" }));
} finally {
  if (b.errors.length) console.log("ERRORES:\n" + [...new Set(b.errors)].join("\n"));
  await b.close();
  if (srv) srv.kill();
}
console.log("Listo:", out);
