// Dependency-free browser integration checks. All API traffic goes to a local fake;
// this script never reads .env.production or contacts the production backend.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "vite";

const executable = process.env.SCANNING_TEST_BROWSER || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/chromium", "/usr/bin/google-chrome",
].find(existsSync);
assert.ok(executable, "Set SCANNING_TEST_BROWSER to a local Chrome/Edge executable.");

const profile = await mkdtemp(path.join(tmpdir(), "scanning-browser-"));
const posts = [];
let responseMode = "ok";
let lineActive = true;
let catalogFails = false;
const heldResponses = [];
const mockApi = createHttpServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Content-Type", "application/json");
  if (request.method === "OPTIONS") { response.writeHead(204).end(); return; }
  if (request.url === "/api/Lines/getLines") {
    if (catalogFails) { response.writeHead(503).end("{}"); return; }
    response.end(JSON.stringify([
      { id: 72, lineName: "MicroChannel de prueba", isActive: true },
      { id: 91, lineName: "Empaques de prueba", isActive: lineActive },
    ]));
    return;
  }
  if (request.url === "/api/Scanning/start" && request.method === "POST") {
    let data = "";
    for await (const chunk of request) data += chunk;
    posts.push(JSON.parse(data));
    const success = () => response.end(JSON.stringify({ validationId: posts.length, message: "Sesión iniciada correctamente." }));
    if (responseMode === "hold") heldResponses.push(success);
    else if (responseMode === "reject") response.writeHead(400).end(JSON.stringify({ errors: { lineId: ["Línea inactiva en el servidor."] } }));
    else if (responseMode === "disconnect") {
      // Drop an in-progress response, rather than an idle reused connection
      // (Chromium may transparently replay a request on an idle socket failure).
      response.writeHead(200);
      response.flushHeaders();
      response.write('{"validationId":');
      setTimeout(() => response.destroy(), 20);
    }
    else success();
    return;
  }
  if (request.url === "/api/Traceability/validations") { response.end("[]"); return; }
  response.writeHead(404).end("{}");
});
await new Promise((resolve) => mockApi.listen(0, "127.0.0.1", resolve));
const apiUrl = "http://127.0.0.1:" + mockApi.address().port;

let browser;
let socket;
let vite;
let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
let scenarios = 0;

async function until(check, label, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await delay(30);
  }
  throw new Error("Timeout: " + label);
}
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 15000);
    pending.set(id, {
      resolve: (value) => { clearTimeout(timeout); resolve(value); },
      reject: (error) => { clearTimeout(timeout); reject(error); },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || "Browser evaluation failed");
  return response.result.value;
}
const text = () => evaluate("document.body.innerText");
const input = (suffix) => "document.querySelector('input[id$=\"-" + suffix + "\"]')";
const scanInput = "document.querySelector('input[aria-label=\"Escanear Pieza\"]')";
const activeSuffix = () => evaluate("document.activeElement?.id || document.activeElement?.getAttribute('aria-label')");
async function key(keyName, extra = {}) {
  const keyCode = { Enter: 13, Tab: 9, " ": 32 }[keyName];
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyName, code: keyName === " " ? "Space" : keyName, windowsVirtualKeyCode: keyCode, ...extra });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, windowsVirtualKeyCode: keyCode });
}
async function fill(suffix, value) {
  await evaluate(input(suffix) + ".focus(); " + input(suffix) + ".select()");
  await send("Input.insertText", { text: value });
}
async function scan(value, suffix = "Enter") {
  await evaluate(scanInput + ".focus()");
  await send("Input.insertText", { text: value });
  await key(suffix);
}
async function clickButton(label) {
  await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes(" + JSON.stringify(label) + "))?.click()");
}
async function startShop(quantity = "2") {
  await fill("payroll", "12345"); await key("Enter");
  assert.match(await activeSuffix(), /-reference$/);
  await fill("reference", "000012"); await key("Tab");
  await fill("part", "abc'001"); await key("Enter");
  await fill("quantity", quantity); await key("Enter");
  await until(() => evaluate(scanInput + " !== null"), "active scanning");
}
async function startContainer(quantity = "2") {
  await fill("payroll", "12345"); await key("Enter");
  assert.match(await activeSuffix(), /-part$/);
  await fill("part", " Abc-001 "); await key("Tab");
  await fill("reference", "Abc-001"); await key("Enter");
  await fill("quantity", quantity); await key("Tab");
  await until(() => evaluate(scanInput + " !== null"), "container active");
}
async function navigate(route) {
  await send("Page.navigate", { url: vite.resolvedUrls.local[0].replace(/\/$/, "") + route });
  await until(() => evaluate(input("payroll") + " !== null"), "setup loaded");
}
async function server(contract, microId = "72", containerId = "91") {
  if (vite) await vite.close();
  vite = await createServer({
    envFile: false,
    logLevel: "error",
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiUrl),
      "import.meta.env.VITE_SCANNING_CONTRACT": JSON.stringify(contract),
      "import.meta.env.VITE_MICROCHANNEL_LINE_ID": JSON.stringify(microId),
      "import.meta.env.VITE_LINE4_EMPAQUES_LINE_ID": JSON.stringify(containerId),
    },
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
}
function passed(message) { scenarios++; console.log("PASS " + message); }

try {
  browser = spawn(executable, ["--headless=new", "--remote-debugging-port=0", "--user-data-dir=" + profile,
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-extensions", "--disable-sync", "about:blank"],
  { windowsHide: true, stdio: "ignore" });
  let spawnError;
  browser.on("error", (error) => { spawnError = error; });
  const portFile = path.join(profile, "DevToolsActivePort");
  await until(() => { if (spawnError) throw spawnError; return existsSync(portFile); }, "browser startup");
  const port = (await readFile(portFile, "utf8")).split("\n")[0];
  const targets = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const operation = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) operation?.reject(new Error(JSON.stringify(message.error)));
      else operation?.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description);
  });
  await send("Page.enable"); await send("Runtime.enable");

  await server("legacy");
  await navigate("/linea4Empaques");
  assert.equal(await evaluate(input("payroll") + ".disabled"), true);
  assert.match(await text(), /pendiente de habilitación/);
  assert.equal(posts.length, 0);
  passed("container is disabled by default; no POST");

  await navigate("/microchannel");
  await startShop("2");
  await scan("WRONG");
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "0");
  await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Entendido')).focus()");
  await key("Enter");
  assert.equal(await evaluate("document.querySelector('[role=alertdialog]') !== null"), true);
  await clickButton("Entendido");
  assert.equal(await activeSuffix(), "Escanear Pieza");
  passed("wrong scan does not count; scanner Enter cannot acknowledge the alert");

  await send("Input.insertText", { text: "abc'001" });
  await key("Enter", { autoRepeat: true });
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "0");
  await evaluate(scanInput + ".dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); " +
    scanInput + ".dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))");
  // Repeated terminators with no new text must not count another piece.
  await key("Tab"); await key("Enter", { autoRepeat: true });
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "1");
  await evaluate("document.querySelector('button[title=\"Eliminar lectura\"]').click()");
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "0");
  assert.equal(await activeSuffix(), "Escanear Pieza");
  await scan("ABC-001");
  await evaluate("window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('focus'))");
  assert.equal(await activeSuffix(), "Escanear Pieza");
  responseMode = "hold";
  await scan("ABC-001");
  await until(() => posts.length === 1, "one legacy POST");
  await key("Enter"); await key("Tab");
  assert.equal(await evaluate(scanInput + ".disabled"), true);
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "2");
  assert.equal(posts.length, 1);
  assert.equal(posts[0].shopOrder, "000012");
  assert.equal("validationMode" in posts[0], false);
  assert.equal("lineId" in posts[0], false);
  assert.equal(posts[0].scans.filter((item) => item.isCorrect).length, 2);
  heldResponses.shift()();
  await until(() => evaluate(scanInput + " === null"), "reset after successful save");
  assert.match(await activeSuffix(), /-payroll$/);
  passed("MicroChannel legacy: count/delete/focus, repeated terminators, single save and reset");

  await server("line-container");
  await navigate("/linea4Empaques");
  await until(() => evaluate(input("payroll") + ".disabled === false"), "verified line");
  await fill("payroll", "12345"); await key("Enter");
  await fill("part", "Abc-001"); await key("Enter");
  await fill("reference", "ABC-001"); await key("Enter");
  assert.match(await text(), /El contenedor no coincide/);
  assert.match(await activeSuffix(), /-reference$/);
  assert.equal(await evaluate(scanInput + " === null"), true);
  await evaluate("window.dispatchEvent(new Event('blur')); document.activeElement.blur(); window.dispatchEvent(new Event('focus'))");
  assert.match(await activeSuffix(), /-reference$/);
  await send("Input.insertText", { text: "Abc-001" }); await key("Enter");
  assert.match(await activeSuffix(), /-quantity$/);
  await fill("quantity", "1.5"); await key("Enter");
  assert.equal(await evaluate(scanInput + " === null"), true);
  await fill("quantity", "32"); await key("Tab");
  await until(() => evaluate(scanInput + " !== null"), "scanned Standard Pack starts");
  responseMode = "hold";
  for (let count = 0; count < 32; count++) { await scan("Abc-001"); await key("Tab"); }
  await until(() => posts.length === 2, "container POST");
  assert.equal(posts[1].lineId, 91);
  assert.equal(posts[1].validationMode, "container");
  assert.equal(posts[1].containerNumber, "Abc-001");
  assert.equal("shopOrder" in posts[1], false);
  assert.equal(posts[1].requiredQuantity, 32);
  assert.equal(posts[1].scans.length, 32);
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "32");
  heldResponses.shift()();
  await until(() => evaluate(scanInput + " === null"), "container reset");
  passed("container exact match, rescan focus, integer validation, Standard Pack 32 and correct payload");

  responseMode = "reject";
  await startContainer("1");
  await scan("Abc-001");
  await until(async () => (await text()).includes("Línea inactiva en el servidor"), "server field error");
  assert.equal(await evaluate(scanInput + ".disabled"), true);
  assert.equal(posts.length, 3);
  responseMode = "hold";
  await evaluate("const retry = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reintentar')); retry.click(); retry.click();");
  await until(() => posts.length === 4, "single retry");
  assert.deepEqual(posts[2], posts[3]);
  assert.equal(await evaluate("document.querySelector('.text-7xl').textContent"), "1");
  heldResponses.shift()();
  await until(() => evaluate(scanInput + " === null"), "retry reset");
  passed("400 error preserves batch; double-click retry sends once with unchanged payload");

  responseMode = "disconnect";
  await startContainer("1"); await scan("Abc-001");
  await until(async () => (await text()).includes("La respuesta pudo perderse"), "uncertain response");
  assert.equal(posts.length, 5);
  assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reintentar')).disabled"), true);
  await delay(200);
  assert.equal(posts.length, 5);
  await evaluate("document.querySelector('input[type=checkbox]').click()");
  responseMode = "ok";
  await clickButton("Reintentar");
  await until(() => posts.length === 6, "deliberate retry after review");
  assert.deepEqual(posts[4], posts[5]);
  await until(() => evaluate(scanInput + " === null"), "network retry reset");
  passed("lost connection requires history review; no automatic retry or legacy fallback");

  await navigate("/microchannel");
  await until(() => evaluate(input("payroll") + ".disabled === false"), "MicroChannel line verified");
  await startShop("1"); await scan("ABC-001");
  await until(() => posts.length === 7, "explicit Shop Order POST");
  assert.equal(posts[6].validationMode, "shopOrder");
  assert.equal(posts[6].lineId, 72);
  assert.equal("containerNumber" in posts[6], false);
  passed("MicroChannel explicit contract sends shopOrder and verified line ID");

  lineActive = false;
  await navigate("/linea4Empaques");
  await until(async () => (await text()).includes("No se pudo verificar una línea activa"), "inactive line blocked");
  assert.equal(await evaluate(input("payroll") + ".disabled"), true);
  lineActive = true;
  catalogFails = true;
  await clickButton("Volver a verificar");
  await until(async () => (await text()).includes("No se pudo verificar una línea activa"), "catalog failure");
  catalogFails = false;
  await clickButton("Volver a verificar");
  await until(() => evaluate(input("payroll") + ".disabled === false"), "catalog recovery");
  passed("inactive line and unavailable catalog block start; retry verifies the real line");

  await server("line-container", "", "");
  await navigate("/linea4Empaques");
  assert.match(await text(), /Falta configurar el identificador real/);
  assert.equal(await evaluate(input("payroll") + ".disabled"), true);
  await navigate("/microchannel");
  assert.equal(await evaluate(input("payroll") + ".disabled"), true);
  assert.equal(posts.length, 7);
  passed("missing line IDs block both explicit modes without inventing IDs");
  assert.deepEqual(runtimeErrors, []);
  console.log(scenarios + " browser scenarios passed; all requests used a local mock API.");
} catch (error) {
  if (socket?.readyState === WebSocket.OPEN) {
    console.error(await text().catch(() => "No page text available"));
    const screenshot = await send("Page.captureScreenshot").catch(() => null);
    if (screenshot) await writeFile(path.join(profile, "failure.png"), Buffer.from(screenshot.data, "base64"));
  }
  throw error;
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await send("Browser.close").catch(() => {});
    socket.close();
  }
  if (browser?.exitCode === null) await Promise.race([once(browser, "exit"), delay(3000)]);
  if (browser?.exitCode === null) browser.kill();
  if (vite) await vite.close();
  mockApi.closeAllConnections();
  await new Promise((resolve) => mockApi.close(resolve));
  // Only remove the profile created by this test, inside the OS temp directory.
  const relativeProfile = path.relative(tmpdir(), profile);
  if (!relativeProfile.startsWith("..") && !path.isAbsolute(relativeProfile) && relativeProfile.startsWith("scanning-browser-")) {
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
