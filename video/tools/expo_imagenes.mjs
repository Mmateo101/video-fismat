/* Imagen de fondo y logo para el perfil de Expo Ingenierías (Anexo 6). Uso: node tools/expo_imagenes.mjs */
import { launch, sleep } from "./cdp.mjs";
import { servidor } from "./servidor.mjs";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url)), out = resolve(here, "..", "..", "expo");
const srv = await servidor(5601);
const b = await launch("http://127.0.0.1:5601/video/index.html?render=1&subs=0", { port: 9335 });
try {
  await b.waitFor("window.__ready === true", 60000);
  for (const [t, nom] of [[32.4, "fondo_muestra_virtual.png"], [49.5, "imagen_marca.png"], [148, "imagen_metodo.png"]]) {
    await b.eval(`window.__seek(${t})`);
    writeFileSync(join(out, nom), await b.shot({ format: "png" }));
  }
  // logo cuadrado desde el ícono de la web
  await b.eval(`document.body.innerHTML = '<div style="position:fixed;inset:0;display:grid;place-items:center;background:#FBF6EC"><svg viewBox="0 0 40 40" width="900" height="900"><circle cx="20" cy="20" r="19" fill="#1D2440"/><path d="M4 20h7l3-9 4 18 4-24 4 22 3-7h7" fill="none" stroke="#F6AE2D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'; true`);
  await sleep(300);
  writeFileSync(join(out, "logo.png"), await b.shot({ format: "png" }));
} finally { await b.close(); if (srv) srv.kill(); }
console.log("Listo");
