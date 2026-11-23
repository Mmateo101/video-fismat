/* Exporta poster.html a PDF A0 (841×1189 mm) y a una vista previa PNG. Uso: node poster/exportar.mjs */
import { launch, sleep } from "../video/tools/cdp.mjs";
import { servidor } from "../video/tools/servidor.mjs";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const aqui = dirname(fileURLToPath(import.meta.url));
const srv = await servidor(5601);
const W = 3179, H = 4494; // 841 × 1189 mm a 96 ppp
const b = await launch("http://127.0.0.1:5601/poster/poster.html", { width: W, height: H, port: 9336 });
try {
  await b.waitFor("document.readyState === 'complete' && document.fonts.status === 'loaded'", 30000);
  await sleep(800);
  const pdf = await b.send("Page.printToPDF", { paperWidth: 841 / 25.4, paperHeight: 1189 / 25.4, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, printBackground: true, preferCSSPageSize: true });
  writeFileSync(join(aqui, "Poster_SismoORuido.pdf"), Buffer.from(pdf.data, "base64"));
  writeFileSync(join(aqui, "poster_vista.png"), await b.shot({ format: "png" }));
  const desborde = await b.eval("JSON.stringify([...document.querySelectorAll('.col')].map(c => Math.round(c.getBoundingClientRect().bottom)).concat([Math.round(document.querySelector('.pie').getBoundingClientRect().top)]))");
  console.log("fondo de columnas y tope del pie (px):", desborde);
} finally { await b.close(); if (srv) srv.kill(); }
