/* Levanta (si hace falta) un servidor HTTP en la raíz del repo, para que el video
   pueda cargar la página web dentro de un iframe del mismo origen. */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export async function servidor(puerto = 5601) {
  const ok = async () => { try { return (await fetch(`http://127.0.0.1:${puerto}/video/index.html`)).ok; } catch { return false; } };
  if (await ok()) return null;
  const p = spawn("python", ["-m", "http.server", String(puerto), "-d", raiz, "--bind", "127.0.0.1"], { stdio: "ignore" });
  for (let i = 0; i < 50 && !(await ok()); i++) await new Promise((r) => setTimeout(r, 200));
  return p;
}
