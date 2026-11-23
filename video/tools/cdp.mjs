/* Control mínimo de Chrome por el protocolo DevTools, sin dependencias (Node 22+).
   Uso: const b = await launch(url); await b.eval("..."); const buf = await b.shot(); await b.close(); */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROMES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(url, { width = 1920, height = 1080, port = 9333 } = {}) {
  const exe = CHROMES.find((p) => existsSync(p));
  if (!exe) throw new Error("No encontré Chrome. Define la variable CHROME con la ruta al ejecutable.");
  const profile = mkdtempSync(join(tmpdir(), "equipo7-chrome-"));
  const proc = spawn(exe, [
    "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, "--force-device-scale-factor=1", "--hide-scrollbars",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--mute-audio",
    "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
    url,
  ], { stdio: "ignore" });

  let target;
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(150);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
    } catch { /* aún no abre */ }
  }
  if (!target) { proc.kill(); throw new Error("Chrome no respondió."); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value || a.description).join(" "));
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });

  const b = {
    send,
    errors,
    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async waitFor(expression, timeout = 30000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        try { if (await b.eval(expression)) return true; } catch { /* la página sigue cargando */ }
        await sleep(100);
      }
      throw new Error("Tiempo agotado esperando: " + expression);
    },
    async shot({ format = "jpeg", quality = 92 } = {}) {
      const r = await send("Page.captureScreenshot", format === "png" ? { format } : { format, quality });
      return Buffer.from(r.data, "base64");
    },
    async close() {
      try { ws.close(); } catch { /* ya cerrado */ }
      proc.kill();
      await sleep(400);
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* Windows a veces lo retiene */ }
    },
  };
  return b;
}

export { sleep };
